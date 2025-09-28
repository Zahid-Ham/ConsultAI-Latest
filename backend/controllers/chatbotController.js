// backend/controllers/chatbotController.js

import { Ollama } from "ollama"; // Import the main Ollama class
import pdf from "pdf-parse";
import Chat from "../models/Chat.js";

const ollama = new Ollama({ host: "http://localhost:11434" }); // Create an instance of the Ollama class

// Symptom Analysis Function
export async function analyzeSymptoms(req, res) {
  try {
    const { message, chatId } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    let chatSession = await Chat.findById(chatId);
    if (!chatSession) {
      chatSession = new Chat({
        userId: req.user.id,
        title: message.substring(0, 30) + "...",
        messages: [],
      });
    }

    chatSession.messages.push({ sender: "user", text: message });
    // Update chat title after first user message
    if (chatSession.messages.length === 1) {
      chatSession.title =
        message.substring(0, 30) + (message.length > 30 ? "..." : "");
      await chatSession.save(); // Persist title update immediately
    }

    // Prepare improved system prompt (no explicit 'follow-up question' wording, no instructional/meta text)
    const systemPrompt = {
      role: "system",
      content:
        "You are a medical AI assistant. Give concise, direct answers to medical questions. After each answer, naturally ask a relevant question to better understand the user's situation and keep the conversation going. Do not diagnose or prescribe medicine. If the situation is urgent or serious, you may suggest consulting a doctor, but do not repeat a disclaimer every time. Do not explicitly say 'follow-up question:' or include any instructional/meta text like '[INST]' or 'What are some ways we can help you get more information from the user?'. Only respond as the assistant in a natural, conversational way.",
    };

    // For a new tab (no previous messages), only send the current user message
    let messagesForModel;
    if (
      chatSession.messages.length === 1 &&
      chatSession.messages[0].sender === "user"
    ) {
      messagesForModel = [systemPrompt, { role: "user", content: message }];
    } else {
      // Otherwise, send full history
      const formattedMessages = chatSession.messages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      }));
      messagesForModel = [systemPrompt, ...formattedMessages];
    }

    // Get response from model
    const response = await ollama.chat({
      model: "medllama2",
      messages: messagesForModel,
    });

    const aiReply = response.message.content;

    chatSession.messages.push({ sender: "ai", text: aiReply });
    await chatSession.save();

    res.status(200).json({ reply: aiReply, chatId: chatSession._id });
  } catch (error) {
    console.error("Error with symptom analysis:", error);
    res
      .status(500)
      .json({ error: "Failed to get a response from the AI chatbot." });
  }
}

// Report Analysis Function
export async function analyzeReport(req, res) {
  try {
    const { file } = req;
    const { chatId } = req.body;

    if (!file) {
      return res.status(400).json({ error: "PDF file is required." });
    }

    let chatSession = null;
    if (chatId && chatId !== "null") {
      chatSession = await Chat.findById(chatId);
    }
    if (!chatSession) {
      chatSession = new Chat({
        userId: req.user.id,
        title: "Report Analysis",
        messages: [],
      });
      await chatSession.save();
    }

    chatSession.messages.push({
      sender: "user",
      text: `Analyzing file: ${file.originalname}...`,
    });

    const pdfBuffer = req.file.buffer;
    const data = await pdf(pdfBuffer);
    const reportText = data.text;

    const prompt = `You are a medical report analysis assistant. Analyze the following medical report text and provide a concise summary of the key findings, diagnosis, and any recommended treatments or next steps. Highlight the most critical information.

        Medical Report:
        """
        ${reportText}
        """
        `;

    // Corrected function call using the ollama instance
    const response = await ollama.chat({
      model: "medllama2",
      messages: [
        {
          role: "system",
          content:
            'You are an AI assistant specialized in analyzing medical reports. Provide clear, concise summaries. Do not provide a diagnosis or medical advice. Conclude with a clear disclaimer: "This analysis is for informational purposes only. Consult with a qualified healthcare professional for a complete understanding and medical advice."',
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const aiReply = response.message.content;

    chatSession.messages.push({ sender: "ai", text: aiReply });
    await chatSession.save();

    res.status(200).json({ reply: aiReply, chatId: chatSession._id });
  } catch (error) {
    console.error("Error with report analysis:", error);
    res.status(500).json({ error: "Failed to analyze the report." });
  }
}
