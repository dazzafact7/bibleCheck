// api.js

/**
 * Sendet eine Anfrage an die OpenAI Chat API.
 * @param {string} prompt - Der User-Prompt für das Modell.
 * @param {string} systemPrompt - Die System-Anweisung, die die Rolle der KI definiert.
 * @returns {Promise<Object>} - Die JSON-Antwort von der API.
 */
import { OpenAI } from "openai";
import dotenv from "dotenv";
dotenv.config({path: "../.env"});
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const callOpenAIAPI = async (prompt, systemPrompt) => {
  // HINWEIS: Ersetze 'DEIN_OPENAI_API_KEY' durch deinen tatsächlichen API-Schlüssel.
  // Es wird dringend empfohlen, den Schlüssel über Umgebungsvariablen zu laden,
  // anstatt ihn direkt im Code zu hinterlegen.

  try {
    const response = openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    });
	console.log(response);
	return

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
