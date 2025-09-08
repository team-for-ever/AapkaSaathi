const input = document.getElementById("searchInput");
const button = document.getElementById("searchButton");
const btnText = document.getElementById("buttonText");
const loader = document.getElementById("loader");
const resultBox = document.getElementById("resultsContainer");
const resultText = document.getElementById("resultText");
const errorBox = document.getElementById("errorContainer");
const errorText = document.getElementById("errorText");
// --- keywords ki list ---
const keywordData = {
  Kidney: ["renal", "kidney failure", "nephrology"],
  "Heart Disease": ["cardiac", "chest pain", "heart attack", "cardiology"],
  Lungs: [
    "pulmonary",
    "breathing problem",
    "respiratory",
    "lungs issue",
    "chronic",
  ],
  "Liver Failure": ["hepatic", "liver problem", "jaundice", "lever"],
  "Brain Tumor": ["brain cancer", "headache", "neurology"],
  "Stomach Cancer": ["gastric cancer", "stomach ache"],
  "Diabetes Type 2": ["sugar problem", "high blood sugar", "endocrinology"],
  "General Physician": ["GP", "family doctor", "fever", "cough", "cold"],
  "Cardiologist": ["heart doctor", "heart specialist"],
  "Neurologist": ["brain doctor", "nerve specialist"],
  "Oncologist": ["cancer doctor", "cancer specialist"],
  "Orthopedic": ["bone doctor", "fracture", "joint pain"],
};

// --- Gemini API ---
const apiKey = "AIzaSyD4DHiM4F8sdrrtUMZXtgzeYJ5dtT3zFIY"; //Replace with API Key
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

// Search karne ka func
const search = async () => {
  const query = input.value.trim();

  if (!query) {
    showError("Search");
    return;
  }

  showLoader(true);
  hideError();
  resultBox.classList.add("hidden");

  // model ka instruction
  const instruction = {
    parts: [
      {
        text: `You are an intelligent keyword matching system. Your task is to identify the single most relevant MAIN KEYWORD from a provided list that matches the user's query.
            - You must use the provided synonyms to help you find the best match.
            - Your response MUST BE ONLY the main keyword itself (e.g., "Heart Disease", "Lungs").
            - If no keyword is a clear match, respond with "None".
            - Do not add any explanation, punctuation, or extra text.`,
      },
    ],
  };

  // format karke prompt bhejna
  const formattedKeywords = Object.entries(keywordData)
    .map(
      ([key, synonyms]) =>
        `  - Main Keyword: "${key}", Synonyms: [${synonyms.join(", ")}]`
    )
    .join("\n");
  // send upar wala prompt to model.
  const prompt = `User Query: "${query}"\n\nAvailable Keywords and Synonyms:\n${formattedKeywords}\n\nBased on the user query, which single main keyword is the best match?`;

  const data = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: instruction,
    generationConfig: {
      temperature: 0,
    },
  };

  try {
    // API ko try again
    const res = await fetchRetry(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }

    const result = await res.json();
    const candidate = result.candidates?.[0];

    if (candidate && candidate.content?.parts?.[0]?.text) {
      let matchedWord = candidate.content.parts[0].text.trim();

      // Check keyword matched word
      if (
        matchedWord.toLowerCase() === "none" ||
        !Object.keys(keywordData).includes(matchedWord)
      ) {
        showError(`No match "${query}".try doosra term.`);
      } else {
        resultText.textContent = matchedWord;
        resultBox.classList.remove("hidden");
      }
    } else {
      showError("No valid response. try again.");
    }
  } catch (error) {
    console.error("API call error:", error);
    showError("Err nigg, check console.");
  } finally {
    showLoader(false);
  }
};

// ---helper functions ---

function showLoader(loading) {
  if (loading) {
    btnText.classList.add("hidden");
    loader.classList.remove("hidden");
    button.disabled = true;
    input.disabled = true;
  } else {
    btnText.classList.remove("hidden");
    loader.classList.add("hidden");
    button.disabled = false;
    input.disabled = false;
  }
}

function showError(msg) {
  errorText.textContent = msg;
  errorBox.classList.remove("hidden");
  resultBox.classList.add("hidden");
}

function hideError() {
  errorBox.classList.add("hidden");
}

// Case of API fail.
async function fetchRetry(url, options, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      if (res.status !== 429) {
        return res;
      }
    } catch (error) {
      if (i === retries - 1) throw error;
    }
    await new Promise((res) => setTimeout(res, delay * Math.pow(2, i)));
  }
}
// --- Button click aur Enter press ke liye code ---
button.addEventListener("click", search);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    search();
  }
});
