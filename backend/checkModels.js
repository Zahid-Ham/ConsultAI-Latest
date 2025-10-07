// This script uses the built-in 'fetch' library available in recent Node.js versions.
async function listAvailableModels() {
  const apiKey = 'AIzaSyB6ZR9852wlUXMqpkBM49yglWdecZCntMc'; // <-- IMPORTANT: Replace with your actual API key

  if (apiKey === 'YOUR_API_KEY') {
    console.error("Please replace 'YOUR_API_KEY' with your actual API key.");
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }
    const data = await response.json();

    console.log("✅ Models available to your API key:");
    data.models.forEach(model => {
      // We only care about models that can generate content
      if (model.supportedGenerationMethods.includes("generateContent")) {
        console.log(`   - ${model.name}`);
      }
    });

  } catch (error) {
    console.error("❌ Failed to fetch models:", error.message);
  }
}

listAvailableModels();