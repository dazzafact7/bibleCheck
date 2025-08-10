import { OpenAI } from 'openai';
import { getFromCache, saveToCache } from './cache';
import JSON5 from 'json5';
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});
const parseJson=(txt)=>{
  if(!txt) return null
  if(typeof txt==='object') return txt
  // 1) Codeblock bevorzugt
  const mBlock = /```(?:json)?\s*([\s\S]*?)```/i.exec(txt)
  const raw = (mBlock? mBlock[1] : txt).trim()
  // 2) Plain JSON
  try{ return JSON.parse(raw) }catch{}
  try{ return JSON5.parse(raw) }catch{}
  // 3) Fallback: erstes {...} oder [...]
  const m = raw.match(/[\[{][\s\S]*[\]}]/)
  if(!m) return null
  try{ return JSON5.parse(m[0]) }catch{}
  return null


}
// Helper function für API calls mit verbessertem Error Handling
const ask = async (model, systemPrompt, userPrompt, useCache = true) => {
  const cacheKey = `${model}-${systemPrompt}-${userPrompt}`;
  
  if (useCache) {
    const cached = await getFromCache(cacheKey);
    if (cached) return cached;
  }

  try {
    const response = await openai.chat.completions.create({
      models: ['moonshotai/kimi-k2:free','moonshotai/kimi-k2'],
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const result = parseJson(response.choices[0].message.content);
    
    if (useCache) {
      await saveToCache(cacheKey, result);
    }
    
    return result;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error(`API call failed: ${error.message}`);
  }
};

// 1. Claims extrahieren mit biblischem Kontext
const extractClaims = async (thesis, model = 'openai/gpt-3.5-turbo') => {
  const systemPrompt = `Du bist ein Experte für biblische Textanalyse. 
    Zerlege theologische Aussagen in präzise, überprüfbare Einzelaussagen (Claims).
    Berücksichtige biblischen Kontext und theologische Implikationen.
    Antworte als JSON: {claims: [...]}`;
  
  const userPrompt = `Biblische These: "${thesis}"
    Extrahiere 3-8 klare, überprüfbare Claims aus dieser These.`;
  
  const result = await ask(model, systemPrompt, userPrompt);
  return result.claims || [];
};

// 2. Verbesserte NLI Analyse mit Scoring
const nliJudge = async (premiseText, hypothesisText, model = 'openai/gpt-3.5-turbo') => {
  const systemPrompt = `Du bist ein theologischer NLI-Judge.
    Bewerte die Beziehung zwischen Prämisse und Hypothese.
    Kategorien: entail (unterstützt), contradict (widerspricht), neutral (unabhängig).
    Gib zusätzlich einen Score (float, 2 decimals) von 0.00 bis 1.00 an: 0.50 ist neutral, 1.00 für starke Unterstützung, 0.00 für starken Widerspruch.
    Antworte als JSON: {label: string, score: number, reason: string}`;
  
  const userPrompt = `PRÄMISSE: ${premiseText}
    HYPOTHESE: ${hypothesisText}
    
    Bewerte die logische Beziehung und gib einen präzisen Score.`;
  
  const result = await ask(model, systemPrompt, userPrompt);
  return {
    label: result.label || 'neutral',
    score: parseFloat((result.score || 0.5).toFixed(2)),
    reason: result.reason || ''
  };
};

// 3. Theologische Debatte
const debate = async (claimA, claimB, model = 'openai/gpt-3.5-turbo') => {
  const systemPrompt = `Du bist ein theologischer Debattenexperte.
    Erstelle zwei kurze, aber überzeugende Plädoyers.
    Nutze biblische Argumente und Logik.
    Antworte als JSON: {proA: string, proB: string, keyArguments: [...]}`;
  
  const userPrompt = `Position A: "${claimA}"
    Position B: "${claimB}"
    
    Erstelle überzeugende Argumente für beide Seiten.`;
  
  const result = await ask(model, systemPrompt, userPrompt);
  return {
    proA: result.proA || '',
    proB: result.proB || '',
    keyArguments: result.keyArguments || []
  };
};

// 4. Finaler theologischer Judge mit verbessertem Scoring
const finalJudge = async (data, model = 'openai/gpt-5-chat') => {
  const systemPrompt = `Du bist der finale theologische Richter.
    Bewerte die Stringenz, biblische Kohärenz und logische Konsistenz der Argumente.
    Gib präzise Scores von 0.00 bis 1.00.
    Antworte als JSON: {
      scoreA: number,
      scoreB: number,
      contradictionRate: number,
      coherenceA: number,
      coherenceB: number,
      summary: string,
      verdict: string,
      confidence: number,
      keyFindings: [...]
    }`;
  
  const userPrompt = `Analysedaten:
    ${JSON.stringify(data, null, 2).slice(0, 10000)}
    
    Erstelle eine finale, ausgewogene Bewertung.`;
  
  const result = await ask(model, systemPrompt, userPrompt);
  return {
    scoreA: parseFloat((result.scoreA || 0.5).toFixed(2)),
    scoreB: parseFloat((result.scoreB || 0.5).toFixed(2)),
    contradictionRate: parseFloat((result.contradictionRate || 0).toFixed(2)),
    coherenceA: parseFloat((result.coherenceA || 0.5).toFixed(2)),
    coherenceB: parseFloat((result.coherenceB || 0.5).toFixed(2)),
    summary: result.summary || '',
    verdict: result.verdict || 'tie',
    confidence: parseFloat((result.confidence || 0.5).toFixed(2)),
    keyFindings: result.keyFindings || []
  };
};

// Hauptfunktion mit verbesserter Struktur
export async function compareTheses(thesisA, thesisB, useDebate = true) {
  try {
    // Claims extrahieren
    const [claimsA, claimsB] = await Promise.all([
      extractClaims(thesisA),
      extractClaims(thesisB)
    ]);

    // NLI-Analyse für alle Claim-Paare
    const pairs = [];
    for (const claimA of claimsA) {
      for (const claimB of claimsB) {
        const [ab, ba] = await Promise.all([
          nliJudge(claimA, claimB),
          nliJudge(claimB, claimA)
        ]);
        
        let debateResult = null;
        if (useDebate && (ab.label === 'contradict' || ba.label === 'contradict')) {
          debateResult = await debate(claimA, claimB);
        }
        
        pairs.push({
          claimA,
          claimB,
          analysisAB: ab,
          analysisBA: ba,
          debate: debateResult,
          avgScore: parseFloat(((ab.score + ba.score) / 2).toFixed(2))
        });
      }
    }

    // Statistiken berechnen
    const stats = {
      totalPairs: pairs.length,
      contradictions: pairs.filter(p => 
        p.analysisAB.label === 'contradict' || 
        p.analysisBA.label === 'contradict'
      ).length,
      entailments: pairs.filter(p => 
        p.analysisAB.label === 'entail' || 
        p.analysisBA.label === 'entail'
      ).length,
      neutral: pairs.filter(p => 
        p.analysisAB.label === 'neutral' && 
        p.analysisBA.label === 'neutral'
      ).length
    };

    // Finale Bewertung
    const finalResult = await finalJudge({
      thesisA,
      thesisB,
      claimsA,
      claimsB,
      pairs,
      stats
    });

    return {
      thesisA,
      thesisB,
      claimsA,
      claimsB,
      pairs,
      stats,
      result: finalResult,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Comparison error:', error);
    throw error;
  }
}