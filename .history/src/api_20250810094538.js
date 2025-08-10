// api.js

/**
 * Sendet eine Anfrage an die OpenAI Chat API.
 * @param {string} prompt - Der User-Prompt für das Modell.
 * @param {string} systemPrompt - Die System-Anweisung, die die Rolle der KI definiert.
 * @returns {Promise<Object>} - Die JSON-Antwort von der API.
 */
const callOpenAIAPI = async (prompt, systemPrompt) => {
  // HINWEIS: Ersetze 'DEIN_OPENAI_API_KEY' durch deinen tatsächlichen API-Schlüssel.
  // Es wird dringend empfohlen, den Schlüssel über Umgebungsvariablen zu laden,
  // anstatt ihn direkt im Code zu hinterlegen.
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY || "DEIN_OPENAI_API_KEY";

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4-turbo", // Oder ein anderes geeignetes Modell
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" }, // Erzwingt eine JSON-Antwort
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    // Die Antwort von OpenAI ist ein String, der geparst werden muss.
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('Fehler bei der Kommunikation mit der OpenAI API:', error);
    // Im Fehlerfall eine leere oder Standard-Struktur zurückgeben, um App-Abstürze zu vermeiden
    return {};
  }
};

/**
 * Extrahiert überprüfbare Einzelaussagen (Claims) aus einem Text.
 */
export const extractClaims = async (thesis) => {
  const response = await callOpenAIAPI(
    `Text:\n${thesis}`,
    "Du zerlegst biblische Texte in 3-8 prägnante, überprüfbare Einzelaussagen (Claims). Antworte ausschließlich als JSON-Objekt im Format: {\"claims\":[\"claim1\", \"claim2\", ...]}."
  );
  return response.claims || []; // Fallback auf leeres Array
};

/**
 * Führt eine Natural Language Inference (NLI) Bewertung durch.
 */
export const nliJudge = async (premise, hypothesis) => {
  const response = await callOpenAIAPI(
    `PREMISE: ${premise}\nHYPOTHESIS: ${hypothesis}`,
    "Du bist ein NLI-Judge für biblische Interpretationen. Werte HYPOTHESIS relativ zu PREMISE als 'entailment', 'contradiction' oder 'neutral' und begründe in einem Satz. Antworte ausschließlich als JSON-Objekt: {\"label\":\"...\", \"reason\":\"...\"}."
  );
  return response;
};

/**
 * Generiert Pro-Argumente für zwei gegenübergestellte Claims.
 */
export const debate = async (claimA, claimB) => {
  const response = await callOpenAIAPI(
    `Claim A: ${claimA}\nClaim B: ${claimB}`,
    "Generiere zwei kurze, prägnante Plädoyers. 'proA' verteidigt Claim A, 'proB' verteidigt Claim B. Antworte ausschließlich als JSON-Objekt: {\"proA\":\"...\", \"proB\":\"...\"}."
  );
  return response;
};

/**
 * Führt die finale Bewertung basierend auf allen gesammelten Daten durch.
 */
export const finalJudge = async (data) => {
  const response = await callOpenAIAPI(
    `Basisdaten:\n${JSON.stringify(data, null, 2)}`,
    "Du bist der finale Richter für biblische Interpretationen. Werte Stringenz und Logik ohne Web-Recherche. Antworte ausschließlich als kompaktes JSON-Objekt: {\"a_score\":0-1, \"b_score\":0-1, \"contradiction_rate\":0-1, \"summary\":\"string\", \"verdict\":\"A\"|\"B\"|\"tie\"}"
  );
  return response;
};
