/**
 * Gemini API Service for Report Analysis
 * This service communicates with Google's Gemini API to analyze medical reports
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

/**
 * Analyzes a medical report image using Google's Gemini API
 * @param {Buffer} imageBuffer - The image buffer containing the report
 * @param {string} imageMimeType - The MIME type of the image (e.g., 'image/jpeg', 'image/png')
 * @param {string} userMessage - Additional context or questions from the user
 * @returns {Promise<Object>} - The parsed JSON response from Gemini
 */
async function analyzeReportWithGemini(
  imageBuffer,
  imageMimeType,
  userMessage
) {
  const apiKeys = [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
  ];

  // small helper for backoff
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  for (const apiKey of apiKeys) {
    if (!apiKey) continue;
    let attempt = 0;
    const maxAttempts = 3; // per key

    while (attempt < maxAttempts) {
      try {
        attempt++;
        const genAI = new GoogleGenerativeAI(apiKey);

        const model = genAI.getGenerativeModel({
          model: "gemini-flash-latest",
          generationConfig: {
            response_mime_type: "application/json",
          },
        });

        const imageBase64 = imageBuffer.toString("base64");

        const imagePart = {
          inlineData: {
            data: imageBase64,
            mimeType: imageMimeType,
          },
        };

        const instructions = `
        You are an expert medical AI assistant with a high degree of empathy. Your primary role is to act as a health educator, breaking down complex medical reports into simple, understandable, and reassuring information for a patient. Your tone should be clear, calm, and supportive.

        Analyze the attached medical report and generate a response that strictly follows the JSON structure below.

        **Core Instructions:**
        1.  **Persona:** Adopt a helpful, educational tone. Avoid alarming language.
        2.  **Accuracy:** Extract all data precisely as it appears on the report.
        3.  **Missing Data:** If a piece of information (like a patient's name or a specific test) cannot be found, the corresponding JSON value should be "Not Found". Do not leave fields null or empty.
        4.  **Conciseness:** Keep all summaries and interpretations brief and to the point.

        **Required JSON Structure:**
        {
          "keyTakeaways": [
            "A 2-3 point bulleted list summarizing the most critical findings in plain language. If all results are normal, state that clearly."
          ],
          "patientInfo": { "name": "...", "patientId": "...", "dob": "...", "gender": "..." },
          "testResults": [
            {
              "testName": "...", "result": "...", "units": "...", "referenceRange": "...",
              "isCritical": "A boolean (true/false) indicating if the result is significantly outside the reference range.",
              "interpretation": "If the value is abnormal, briefly explain what this test measures and provide common, general reasons for high/low values in 1-2 simple sentences. Do not diagnose diseases. If the value is normal, the interpretation should simply be 'Normal'."
            }
          ],
          "recommendations": [ "List any follow-up actions or recommendations exactly as mentioned in the report. If none are mentioned, state 'No specific recommendations were listed in the report.'" ],
          "questionsForDoctor": [
            "Generate 2-3 specific and empowering questions the user could ask their doctor based on these results. Frame them to encourage a productive conversation."
          ],
          "summary": "A brief, one-paragraph summary of the report's overall findings, written in a reassuring and easy-to-understand tone."
        }
      `;

        const promptParts = [
          { text: instructions },
          {
            text: `User's specific question: ${
              userMessage || "Please provide a general analysis."
            }`,
          },
          imagePart,
        ];

        const result = await model.generateContent({
          contents: [{ role: "user", parts: promptParts }],
        });

        const response = result.response;
        const textResponse = await response.text();

        // Try parsing JSON; throw if parse fails
        try {
          const jsonResponse = JSON.parse(textResponse);
          return jsonResponse;
        } catch (parseErr) {
          console.error(
            "Failed to parse Gemini JSON response:",
            parseErr.message,
            "raw:",
            textResponse.slice(0, 500)
          );
          throw new Error("Invalid JSON response from Gemini.");
        }
      } catch (error) {
        // Determine if error is transient (5xx / overloaded)
        const msg = error && error.message ? error.message : String(error);
        const isTransient =
          /503|overloaded|temporar/i.test(msg) ||
          (error &&
            error.response &&
            error.response.status &&
            error.response.status >= 500);
        console.error(
          `Gemini attempt ${attempt} with current key failed: ${msg}`
        );
        if (isTransient && attempt < maxAttempts) {
          const backoff = 1000 * attempt; // 1s, 2s
          console.log(
            `Transient error detected, backing off for ${backoff}ms before retrying (attempt ${
              attempt + 1
            }/${maxAttempts})`
          );
          // eslint-disable-next-line no-await-in-loop
          await sleep(backoff);
          continue; // retry same key
        }
        // If we've exhausted attempts for this key or error is non-transient, break to try next key
        break;
      }
    }
    console.error("Moving to next API key (if available)");
  }

  throw new Error(
    "Report analysis failed after retries. Please try again later."
  );
}

// --- MODIFIED FUNCTION TO HANDLE FOLLOW-UP CHATS ---

/**
 * Continues a text-based conversation with Gemini using chat history.
 * @param {Array<Object>} chatHistory - The existing messages in the chat.
 * @param {string} newMessage - The new message from the user.
 * @returns {Promise<string>} - The text response from Gemini.
 */
async function continueGeminiChat(chatHistory, newMessage) {
  const apiKeys = [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
  ];

  const formattedHistory = chatHistory.map((msg) => ({
    role: msg.sender === "user" ? "user" : "model",
    parts: [
      {
        text:
          typeof msg.text === "string"
            ? msg.text
            : "This is the analysis of the user's medical report. Please answer follow-up questions based on this context.",
      },
    ],
  }));

  for (const apiKey of apiKeys) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);

      // ==================== START: CORRECTED CODE ====================
      // The system instruction is now part of the model's configuration,
      // not the history array.
      const model = genAI.getGenerativeModel({
        model: "gemini-flash-latest",
        systemInstruction: {
          role: "system",
          parts: [
            {
              text: "You are a helpful medical AI assistant. Your purpose is to answer the user's follow-up questions based on the preceding conversation, which includes an analysis of their medical report. Provide clear, conversational answers. Do not output raw JSON or repeat the analysis structure.",
            },
          ],
        },
      });

      // The history now correctly starts with a 'user' role message.
      const chat = model.startChat({
        history: formattedHistory,
      });
      // ===================== END: CORRECTED CODE =====================

      const result = await chat.sendMessage(newMessage);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error(
        `API Key failed (follow-up chat), trying next... Error: ${error.message}`
      );
    }
  }

  throw new Error("Failed to get a response from Gemini for follow-up chat.");
}

module.exports = {
  analyzeReportWithGemini,
  continueGeminiChat,
};
