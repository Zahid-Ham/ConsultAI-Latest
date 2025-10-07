// backend/controllers/chatbotController.js

import { Ollama } from "ollama";
import Chat from "../models/Chat.js";
// MODIFIED: Import both Gemini service functions
import { analyzeReportWithGemini, continueGeminiChat } from '../services/geminiService.js';

const ollama = new Ollama({ host: "http://localhost:11434" });

// MODIFIED: This function now routes to the correct AI model
export async function analyzeSymptoms(req, res) {
  try {
    const { message, chatId } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    let chatSession = await Chat.findById(chatId);
    // This part should ideally not be hit if a chatId is always provided for follow-ups,
    // but it's here as a fallback.
    if (!chatSession) {
      return res.status(404).json({ error: "Chat session not found." });
    }

    chatSession.messages.push({ sender: "user", text: message });
    await chatSession.save(); // Save user message immediately

    let aiReply;

    // --- START: NEW MODEL ROUTING LOGIC ---
    if (chatSession.modelType === 'gemini') {
      // This is a follow-up to a report analysis, so use Gemini.
      // We pass the history *before* the user's new message.
      const history = chatSession.messages.slice(0, -1);
      aiReply = await continueGeminiChat(history, message);

    } else {
      // This is a standard symptom analysis chat, so use MedLlama2.
      const systemPrompt = {
        role: "system",
        content:
          "You are a medical AI assistant. Give direct answers to medical questions. After each answer, naturally ask a relevant question to better understand the user's situation and keep the conversation going. Do not prescribe medicine. If the situation is urgent or serious, you may suggest consulting a doctor, but do not repeat a disclaimer every time. Do not explicitly say 'follow-up question:' or include any instructional/meta text like '[INST]' or 'What are some ways we can help you get more information from the user?'. Only respond as the assistant in a natural, conversational way.",
      };
      
      const formattedMessages = chatSession.messages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text, // Assuming all medllama2 messages are strings
      }));
      const messagesForModel = [systemPrompt, ...formattedMessages];

      const response = await ollama.chat({
        model: "medllama2",
        messages: messagesForModel,
      });
      aiReply = response.message.content;
    }
    // --- END: NEW MODEL ROUTING LOGIC ---

    // Filter the AI's reply to remove any text in parentheses
    const regex = /\s*\([^)]*\)\s*/g;
    const filteredReply = aiReply.replace(regex, ' ').trim();

    // Save the filtered reply to the database
    chatSession.messages.push({ sender: "ai", text: filteredReply });
    await chatSession.save();

    // Send the filtered reply to the user
    res.status(200).json({ reply: filteredReply, chatId: chatSession._id });

  } catch (error) {
    console.error("Error processing message:", error);
    res.status(500).json({ error: "Failed to get a response from the AI chatbot." });
  }
}

// MODIFIED: This function now flags the chat for future Gemini use
export async function analyzeReport(req, res) {
  try {
    const { file } = req;
    const { chatId, userMessage } = req.body;

    if (!file) {
      return res.status(400).json({ error: "File is required." });
    }

    let chatSession = null;
    if (chatId && chatId !== "null") {
      chatSession = await Chat.findById(chatId);
    }
    if (!chatSession) {
      chatSession = new Chat({
        userId: req.user.id,
        title: `Report: ${file.originalname.substring(0, 20)}...`,
        messages: [],
      });
    }

    // Save the user's message about the file
    chatSession.messages.push({
      sender: "user",
      text: `File attached: ${file.originalname}. User request: ${userMessage || 'None'}`,
    });

    // Call the Gemini service to get the structured JSON analysis
    const analysisResult = await analyzeReportWithGemini(req.file.buffer, req.file.mimetype, userMessage);
    
    // Save the JSON object directly as the AI's reply
    chatSession.messages.push({ sender: "ai", text: analysisResult });
    
    // --- IMPORTANT: FLAG THE CHAT AS A GEMINI CHAT ---
    chatSession.modelType = 'gemini';
    // ----------------------------------------------------

    await chatSession.save();

    // Send the structured JSON object to the frontend for rendering
    res.status(200).json({ reply: analysisResult, chatId: chatSession._id });
    
  } catch (error) {
    console.error("Error with report analysis:", error);
    res.status(500).json({ error: "Failed to analyze the report." });
  }
}