// DOM Elements
const apiKeyInput = "AIzaSyD4DHiM4F8sdrrtUMZXtgzeYJ5dtT3zFIY"; // Replace with apna API key
// Primary Doc
const fileInputPrimary = document.getElementById("fileInputPrimary");
const imagePreviewPrimary = document.getElementById("imagePreviewPrimary");
const scanPrimaryButton = document.getElementById("scanPrimaryButton");
const jsonDataPrimary = document.getElementById("jsonDataPrimary");
// ID Proof
const idUploadSection = document.getElementById("idUploadSection");
const fileInputId = document.getElementById("fileInputId");
const imagePreviewId = document.getElementById("imagePreviewId");
const idFileLabel = document.getElementById("idFileLabel");
const verifyButton = document.getElementById("verifyButton");
// Common UI
const loader = document.getElementById("loader");
const loaderText = document.getElementById("loaderText");
const resultsContainer = document.getElementById("resultsContainer");
const placeholder = document.getElementById("placeholder");
const errorMessage = document.getElementById("errorMessage");
const verificationResult = document.getElementById("verificationResult");

// State variables
let primaryDocState = { base64: null, mimeType: null, data: null };
let idProofState = { base64: null, mimeType: null, data: null };

// Event Listeners
fileInputPrimary.addEventListener("change", (e) =>
  handleFileSelect(e, "primary")
);
fileInputId.addEventListener("change", (e) => handleFileSelect(e, "id"));

scanPrimaryButton.addEventListener("click", () => handleScan("primary"));
verifyButton.addEventListener("click", () => handleScan("id"));

function handleFileSelect(event, docType) {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    displayError("Please upload a valid image file (PNG, JPG, WEBP).");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    if (docType === "primary") {
      primaryDocState.mimeType = file.type;
      primaryDocState.base64 = e.target.result.split(",")[1];
      imagePreviewPrimary.src = e.target.result;
      scanPrimaryButton.disabled = false;
      resetUIState();
    } else {
      idProofState.mimeType = file.type;
      idProofState.base64 = e.target.result.split(",")[1];
      imagePreviewId.src = e.target.result;
      verifyButton.disabled = false;
    }
  };
  reader.readAsDataURL(file);
}

async function handleScan(docType) {
  const apiKey = "AIzaSyD4DHiM4F8sdrrtUMZXtgzeYJ5dtT3zFIY"; // Replace with apna API key
  if (!apiKey) {
    displayError("Please enter your Gemini API key above.");
    return;
  }

  const state = docType === "primary" ? primaryDocState : idProofState;
  if (!state.base64) {
    displayError(`Please select an image for the ${docType} document.`);
    return;
  }

  setLoading(true, docType);

  try {
    const prompt =
      docType === "primary" ? getPrimaryDocPrompt() : getIdProofPrompt();
    const resultJson = await callGeminiApi(
      apiKey,
      state.base64,
      state.mimeType,
      prompt
    );

    if (docType === "primary") {
      primaryDocState.data = resultJson;
      jsonDataPrimary.textContent = JSON.stringify(resultJson, null, 2);
      resultsContainer.classList.remove("hidden");
      placeholder.classList.add("hidden");
      enableIdUpload();
    } else {
      idProofState.data = resultJson;
      performVerification();
    }
  } catch (error) {
    console.error("API call failed:", error);
    displayError(
      `Failed to extract data for ${docType} document. Check the console for details.`
    );
  } finally {
    setLoading(false, docType);
  }
}

function performVerification() {
  const primaryName =
    primaryDocState.data?.person_details?.name?.toLowerCase().trim() || "";
  const primaryDob =
    primaryDocState.data?.person_details?.date_of_birth?.trim() || "";
  const idName = idProofState.data?.name?.toLowerCase().trim() || "";
  const idDob = idProofState.data?.date_of_birth?.trim() || "";

  verificationResult.classList.remove(
    "hidden",
    "bg-green-100",
    "text-green-700",
    "bg-red-100",
    "text-red-700"
  );

  if (!primaryName || !primaryDob) {
    verificationResult.textContent =
      "⚠️ Could not find Name/DOB in the Primary Document for comparison.";
    verificationResult.classList.add("bg-yellow-100", "text-yellow-700");
    return;
  }

  if (primaryName === idName && primaryDob === idDob) {
    verificationResult.textContent =
      "✅ Verified Successfully: Name and DOB match.";
    verificationResult.classList.add("bg-green-100", "text-green-700");
    // *** ADD THIS CALL to send data after successful verification ***
    sendDataToApi();
  } else {
    verificationResult.textContent = `❌ Verification Failed: Details do not match.\n(Primary: ${primaryName}, ${primaryDob} | ID: ${idName}, ${idDob})`;
    verificationResult.classList.add("bg-red-100", "text-red-700");
  }
}

async function sendDataToApi() {
  // Replace with your actual API
  const targetApiUrl = "";

  // Construct the data payload you want to send
  const payload = {
    verificationStatus: "Success",
    verifiedAt: new Date().toISOString(),
    primaryDocument: primaryDocState.data,
    idProof: idProofState.data,
  };

  console.log("Sending data to external API:", payload);

  try {
    const response = await fetch(targetApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // If api req auth token
        // 'Authorization': 'Bearer YOUR_API_KEY'
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // Handle responses(404 etc.)
      throw new Error(`API request failed with status ${response.status}`);
    }

    const responseData = await response.json();
    console.log("Successfully sent data to API:", responseData);
    verificationResult.textContent += " (Data saved successfully)";
  } catch (error) {
    console.error("Error sending data to external API:", error);
    verificationResult.textContent += " (Failed to save data)";
    verificationResult.classList.add("bg-yellow-100", "text-yellow-700");
  }
}
//UI func
function setLoading(isLoading, docType) {
  if (isLoading) {
    loader.style.display = "flex";
    loaderText.textContent =
      docType === "primary"
        ? "Scanning Primary Document..."
        : "Scanning ID & Verifying...";
    placeholder.classList.add("hidden");
    errorMessage.classList.add("hidden");
    verificationResult.classList.add("hidden");
    scanPrimaryButton.disabled = true;
    verifyButton.disabled = true;
  } else {
    loader.style.display = "none";
    scanPrimaryButton.disabled = !primaryDocState.base64;
    verifyButton.disabled = !idProofState.base64;
  }
}

function resetUIState() {
  errorMessage.classList.add("hidden");
  resultsContainer.classList.add("hidden");
  verificationResult.classList.add("hidden");
  placeholder.classList.remove("hidden");
  disableIdUpload();
}

function enableIdUpload() {
  idUploadSection.classList.remove("opacity-50", "cursor-not-allowed");
  idUploadSection.classList.add("bg-blue-50");
  idFileLabel.classList.remove("opacity-50", "cursor-not-allowed");
  fileInputId.disabled = false;
}

function disableIdUpload() {
  idUploadSection.classList.add("opacity-50", "cursor-not-allowed");
  idUploadSection.classList.remove("bg-blue-50");
  idFileLabel.classList.add("opacity-50", "cursor-not-allowed");
  fileInputId.disabled = true;
  verifyButton.disabled = true;
}

function displayError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
}

// Prompts
function getPrimaryDocPrompt() {
  return `
                You are an expert data extraction system for official documents.
                Analyze the provided image of a Persons with Disabilities (PwD) certificate and extract the following information in a structured JSON format.
                Do not include any text, notes, or explanations outside of the single JSON object.
                The JSON object must have these exact fields: "certificate_number", "udid_number", "date_of_issue", "person_details": {"name", "guardian_name", "date_of_birth", "address"}, "disability_details": {"type_of_disability", "percentage"}, "issuing_authority".
                For dates, use YYYY-MM-DD format. If a field is not found, return null. For percentage, return a number.
            `;
}

function getIdProofPrompt() {
  return `
                You are an expert data extraction system for ID cards.
                Analyze the provided ID proof image (like a Driver's License, Aadhar Card, etc.) and extract only the full name and date of birth.
                Return the result as a structured JSON object. Do not include any text, notes, or explanations outside of the JSON.
                The JSON object must have these exact fields: "name": string, "date_of_birth": string.
                For the date of birth, use YYYY-MM-DD format. If a field is not found, return null for that value.
            `;
}

// API Call
async function callGeminiApi(apiKey, base64Data, mimeType, prompt) {
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
  const payload = {
    contents: [
      {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: mimeType, data: base64Data } },
        ],
      },
    ],
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("API Error Response:", errorBody);
    throw new Error(
      `API request failed with status ${response.status}: ${response.statusText}`
    );
  }

  const result = await response.json();
  const candidate = result.candidates?.[0];

  if (result.promptFeedback?.blockReason)
    throw new Error(`Request blocked: ${result.promptFeedback.blockReason}`);
  if (!candidate?.content?.parts?.[0]?.text)
    throw new Error("Invalid response structure from API.");

  let rawText = candidate.content.parts[0].text
    .replace(/^```json\s*/, "")
    .replace(/```$/, "");
  try {
    return JSON.parse(rawText);
  } catch (jsonError) {
    console.error("JSON Parsing Error:", jsonError, "Raw Text:", rawText);
    throw new Error("Failed to parse the AI's response as valid JSON.");
  }
}
