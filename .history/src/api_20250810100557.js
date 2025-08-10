// api/proxy.js
import { OpenAI } from "openai";
import dotenv from "dotenv";

// Lädt Umgebungsvariablen aus der .env-Datei im Projekt-Root
dotenv.config();

// Initialisiert den OpenAI-Client mit dem API-Schlüssel aus den Umgebungsvariablen
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Handler für serverseitige Anfragen. Nimmt Anfragen vom Client entgegen,
 * formuliert den passenden OpenAI-Request und leitet ihn weiter.
 * @param {object} req - Das Request-Objekt (z.B. von Express oder einem Serverless-Provider).
 * @param {object} res - Das Response-Objekt.
 */
export default async function handler(req, res) {
  // Erlaubt nur POST-Anfragen
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { operation, payload } = req.body;

  if (!operation || !payload) {
    return res.status(400).json({ error: 'Operation und Payload sind erforderlich.' });
  }

  try {
    let systemPrompt = '';
    let userPrompt = '';
    
    // Wählt den passenden System- und User-Prompt basierend auf der Operation
    switch (operation) {
      case 'extractClaims':
        systemPrompt = "Du zerlegst biblische Texte in 3-8 prägnante, überprüfbare Einzelaussagen (Claims). Antworte ausschließlich als JSON-Objekt im Format: {\"claims\":[\"claim1\", \"claim2\", ...]}.";
        userPrompt = `Text:\n${payload.thesis}`;
        break;
      case 'nliJudge':
        systemPrompt = "Du bist ein NLI-Judge für biblische Interpretationen. Werte HYPOTHESIS relativ zu PREMISE als 'entailment', 'contradiction' oder 'neutral' und begründe in einem Satz. Antworte ausschließlich als JSON-Objekt: {\"label\":\"...\", \"reason\":\"...\"}.";
        userPrompt = `PREMISE: ${payload.premise}\nHYPOTHESIS: ${payload.hypothesis}`;
        break;
      case 'debate':
        systemPrompt = "Generiere zwei kurze, prägnante Plädoyers. 'proA' verteidigt Claim A, 'proB' verteidigt Claim B. Antworte ausschließlich als JSON-Objekt: {\"proA\":\"...\", \"proB\":\"...\"}.";
        userPrompt = `Claim A: ${payload.claimA}\nClaim B: ${payload.claimB}`;
        break;
      case 'finalJudge':
        systemPrompt = "Du bist der finale Richter für biblische Interpretationen. Werte Stringenz und Logik ohne Web-Recherche. Antworte ausschließlich als kompaktes JSON-Objekt: {\"a_score\":0-1, \"b_score\":0-1, \"contradiction_rate\":0-1, \"summary\":\"string\", \"verdict\":\"A\"|\"B\"|\"tie\"}";
        userPrompt = `Basisdaten:\n${JSON.stringify(payload.data, null, 2)}`;
        break;
      default:
        return res.status(400).json({ error: 'Ungültige Operation.' });
    }

    // Führt den API-Call an OpenAI aus
    const completion = await openai.chat.completions.create({
      model: "moonshotai/kimi-k2:free",
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
