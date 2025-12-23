// backend/controllers/chatbotController.js

import Chat from "../models/Chat.js";
import {
  analyzeReportWithGemini,
  continueGeminiChat,
} from "../services/geminiService.js";
import axios from "axios";

// NOTE: Ollama import and setup have been removed to allow for a free, unified Gemini deployment.

// MODIFIED: This function now uses Gemini for ALL symptom analysis
export async function analyzeSymptoms(req, res) {
  try {
    const { message, chatId } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    let chatSession = await Chat.findById(chatId);
    if (!chatSession) {
      return res.status(404).json({ error: "Chat session not found." });
    }

    // Save user message
    chatSession.messages.push({ sender: "user", text: message });

    // If chat still has default title, update it from the first user message
    try {
      if (!chatSession.title || chatSession.title === "New Chat") {
        const candidate = (message || "").toString().trim();
        const newTitle =
          candidate.length > 0
            ? candidate.length > 30
              ? candidate.substring(0, 30) + "..."
              : candidate
            : "New Chat";
        chatSession.title = newTitle;
      }
    } catch (e) {
      // ignore title update errors
    }
    await chatSession.save();

    let aiReply;

    // --- UNIFIED GEMINI LOGIC ---
    // We use Gemini for all chat interactions now (replacing MedLlama2).
    // We pass the history *before* the user's new message, as the service handles the new message.
    const history = chatSession.messages.slice(0, -1);

    try {
      aiReply = await continueGeminiChat(history, message);
    } catch (geminiError) {
      console.error("Gemini API Error:", geminiError);
      aiReply =
        "I apologize, but I am having trouble connecting to the medical assistant right now. Please try again in a moment.";
    }
    // ----------------------------

    // Filter the AI's reply to remove any text in parentheses (e.g., reasoning thoughts)
    const regex = /\s*\([^)]*\)\s*/g;
    const filteredReply = aiReply.replace(regex, " ").trim();

    // Save the filtered reply to the database
    chatSession.messages.push({ sender: "ai", text: filteredReply });

    // Explicitly set modelType to gemini to maintain consistency
    chatSession.modelType = "gemini";

    await chatSession.save();

    // Send the filtered reply to the user
    res.status(200).json({ reply: filteredReply, chatId: chatSession._id });
  } catch (error) {
    console.error("Error processing message:", error);
    res
      .status(500)
      .json({ error: "Failed to get a response from the AI chatbot." });
  }
}

// MODIFIED: This function analyzes reports using Gemini
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
    const userText = `File attached: ${file.originalname}. User request: ${
      userMessage || "None"
    }`;
    chatSession.messages.push({ sender: "user", text: userText });

    // If chat has default title, update it to the file name
    try {
      if (!chatSession.title || chatSession.title === "New Chat") {
        chatSession.title =
          file.originalname && file.originalname.length > 0
            ? file.originalname.length > 30
              ? file.originalname.substring(0, 30) + "..."
              : file.originalname
            : chatSession.title;
      }
    } catch (e) {}

    // Call the Gemini service to get the structured JSON analysis
    const analysisResult = await analyzeReportWithGemini(
      req.file.buffer,
      req.file.mimetype,
      userMessage
    );

    // Save the JSON object directly as the AI's reply
    chatSession.messages.push({ sender: "ai", text: analysisResult });

    // Flag the chat as a Gemini chat
    chatSession.modelType = "gemini";

    await chatSession.save();

    // Send the structured JSON object to the frontend for rendering
    res.status(200).json({ reply: analysisResult, chatId: chatSession._id });
  } catch (error) {
    console.error("Error with report analysis:", error);
    res.status(500).json({ error: "Failed to analyze the report." });
  }
}

// Analyze a report stored in Cloudinary
export async function analyzeReportCloudinary(req, res) {
  try {
    const { publicId, fileUrl, fileName, fileType, userMessage, chatId } =
      req.body;

    if (!fileUrl) {
      return res.status(400).json({ error: "fileUrl is required." });
    }

    // Download the file from Cloudinary (or the provided fileUrl)
    const fetchRes = await axios.get(fileUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(fetchRes.data, "binary");
    const mimeType =
      fetchRes.headers["content-type"] || fileType || "application/pdf";

    let chatSession = null;
    if (chatId && chatId !== "null") {
      chatSession = await Chat.findById(chatId);
    }
    if (!chatSession) {
      chatSession = new Chat({
        userId: req.user.id,
        title: `Report: ${
          fileName ? fileName.substring(0, 20) + "..." : publicId
        }`,
        messages: [],
      });
    }

    // Save the user's message about the file
    const userText = `Cloud file attached: ${
      fileName || publicId
    }. User request: ${userMessage || "None"}`;
    chatSession.messages.push({ sender: "user", text: userText });

    // If chat has default title, update it to the file name or publicId
    try {
      if (!chatSession.title || chatSession.title === "New Chat") {
        const titleCandidate = fileName || publicId || "Report";
        chatSession.title =
          titleCandidate.length > 30
            ? titleCandidate.substring(0, 30) + "..."
            : titleCandidate;
      }
    } catch (e) {}

    // Call the Gemini service to get the structured JSON analysis
    const analysisResult = await analyzeReportWithGemini(
      buffer,
      mimeType,
      userMessage
    );

    // Save the JSON object directly as the AI's reply
    chatSession.messages.push({ sender: "ai", text: analysisResult });

    // Flag the chat for Gemini follow-ups
    chatSession.modelType = "gemini";
    await chatSession.save();

    // Return the structured analysis and chat id
    res.status(200).json({ reply: analysisResult, chatId: chatSession._id });
  } catch (error) {
    console.error("Error with cloud report analysis:", error);
    res.status(500).json({ error: "Failed to analyze the cloud file." });
  }
}
