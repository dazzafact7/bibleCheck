// proxy:src/api.js
import { OpenAI } from "openai";
import dotenv from "dotenv";
import JSON5 from "json5";
import crypto from "crypto";

const md5=(text)=>crypto.createHash('md5').update(text).digest('hex');

// Lädt Umgebungsvariablen aus der .env-Datei im Projekt-Root
dotenv.config({path: "../.env"});
const model="moonshotai/kimi-k2:free";
// Initialisiert den OpenAI-Client mit dem API-Schlüssel aus den Umgebungsvariablen
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const jsonParse = (text) => {
	const jsonString=text.match(/.*?[\[\{].*[\]\}]/s);
  try {
    return JSON5.parse(jsonString);
  } catch (error) {
    return text;
  }
}
export default async function askGpt(systemPrompt, userPrompt,cacheKey=false) {
const cacheKey=systemPrompt+userPrompt;

    // Führt den API-Call an OpenAI aus
    const completion = await openai.chat.completions.create({
      ,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const result = jsonParse(completion.choices[0].message.content);
    
    // Sendet das Ergebnis zurück an den Client
    return res.status(200).json(result);

  } catch (error) {
    console.error(`Fehler bei OpenAI API-Call für Operation '${operation}':`, error);
    return res.status(500).json({ error: 'Interner Serverfehler.' });
  }
}
