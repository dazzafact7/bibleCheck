import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Scale, BookOpen, Brain, AlertCircle, CheckCircle, XCircle, Loader } from 'lucide-react';

// Mock Cache für GPT Requests (In-Memory)
const gptCache = new Map();

// Simulierte Claude API Integration (ersetzt OpenAI)
const callClaudeAPI = async (prompt, systemPrompt) => {
  const cacheKey = `${systemPrompt}-${prompt}`;
  if (gptCache.has(cacheKey)) {
    return gptCache.get(cacheKey);
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ]
      })
    });
    
    const data = await response.json();
    const result = data.content[0].text;
    
    // Cache the result
    gptCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Claude API Error:', error);
    // Fallback für Demo
    return mockResponse(prompt, systemPrompt);
  }
};

// Mock Responses für Demo-Zwecke
const mockResponse = (prompt, systemPrompt) => {
  if (systemPrompt.includes("Claims extrahieren")) {
    return JSON.stringify({
      claims: [
        "Jesus war ein historischer Mensch",
        "Die Wunder sind wörtlich zu verstehen", 
        "Die Bibel ist wissenschaftlich korrekt"
      ]
    });
  } else if (systemPrompt.includes("NLI-Judge")) {
    return JSON.stringify({
      label: Math.random() > 0.5 ? "contradict" : "neutral",
      reason: "Logische Analyse zeigt unterschiedliche Interpretationsebenen"
    });
  } else if (systemPrompt.includes("Debate")) {
    return JSON.stringify({
      proA: "Historische Evidenz stützt diese Interpretation durch archäologische Funde",
      proB: "Metaphorische Lesart erklärt die theologische Tiefe besser"
    });
  } else {
    return JSON.stringify({
      a_score: 0.7,
      b_score: 0.6,
      contradiction_rate: 0.3,
      summary: "Beide Interpretationen haben Berechtigung, aber unterschiedliche Schwerpunkte",
      verdict: "tie"
    });
  }
};

// Core Logic Functions
const extractClaims = async (thesis) => {
  const response = await callClaudeAPI(
    `Text:\n${thesis}\nGib 3-8 kurze Claims als JSON zurück.`,
    "Du zerlegst biblische Texte in prägnante, überprüfbare Einzelaussagen (Claims). Antworte als JSON: {claims:[...]}. Keine Quellen, keine Websuche, nur logische Analyse."
  );
  return JSON.parse(response).claims;
};

const nliJudge = async (a, b) => {
  const response = await callClaudeAPI(
    `PREM: ${a}\nHYP: ${b}`,
    "Du bist ein NLI-Judge für biblische Interpretationen. Werte HYP relativ zu PREM als entail/contradict/neutral und begründe in 1 Satz. Antworte JSON: {label,reason}."
  );
  return JSON.parse(response);
};

const debate = async (claimA, claimB) => {
  const response = await callClaudeAPI(
    `ClaimA: ${claimA}\nClaimB: ${claimB}`,
    "Zwei Kurzplädoyers für biblische Interpretationen: PRO-A verteidigt ClaimA, PRO-B verteidigt ClaimB. Antworte JSON {proA,proB}."
  );
  return JSON.parse(response);
};

const finalJudge = async (data) => {
  const response = await callClaudeAPI(
    `Basisdaten:\n${JSON.stringify(data, null, 2)}`,
    "Du bist der finale Richter für biblische Interpretationen. Werte Stringenz/Logik ohne Web-Recherche. Antworte kompaktes JSON: {a_score:0-1,b_score:0-1,contradiction_rate:0-1,summary:string,verdict:'A'|'B'|'tie'}"
  );
  return JSON.parse(response);
};

// Tree Node Component
const TreeNode = ({ node, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  
  const getIconByType = (type, data) => {
    switch(type) {
      case 'claim': return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'nli': 
        if (data?.label === 'contradict') return <XCircle className="w-4 h-4 text-red-500" />;
        if (data?.label === 'entail') return <CheckCircle className="w-4 h-4 text-green-500" />;
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'debate': return <Scale className="w-4 h-4 text-purple-500" />;
      case 'final': return <Brain className="w-4 h-4 text-indigo-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className={`ml-${level * 4} border-l-2 border-gray-200 pl-4 py-2`}>
      <div 
        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {node.children && node.children.length > 0 && (
          isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
        )}
        {getIconByType(node.type, node.data)}
        <span className="font-medium">{node.title}</span>
      </div>
      
      {node.content && (
        <div className="ml-6 text-sm text-gray-600 bg-gray-50 p-3 rounded mt-1">
          {typeof node.content === 'string' ? node.content : JSON.stringify(node.content, null, 2)}
        </div>
      )}
      
      {isExpanded && node.children && node.children.map((child, idx) => (
        <TreeNode key={idx} node={child} level={level + 1} />
      ))}
    </div>
  );
};

// Main Component
const BibleFactChecker = () => {
  const [thesisA, setThesisA] = useState("Jesus führte historisch belegbare Wunder durch, die naturwissenschaftlich erklärbar sind.");
  const [thesisB, setThesisB] = useState("Die Wunder Jesu sind symbolische Erzählungen ohne historische Faktizität.");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [treeData, setTreeData] = useState(null);

  const analyzeTheses = async () => {
    setIsAnalyzing(true);
    setResults(null);
    setTreeData(null);

    try {
      // Extract Claims
      const [claimsA, claimsB] = await Promise.all([
        extractClaims(thesisA),
        extractClaims(thesisB)
      ]);

      // NLI Analysis
      const pairs = [];
      for (const a of claimsA) {
        for (const b of claimsB) {
          const [ab, ba] = await Promise.all([
            nliJudge(a, b),
            nliJudge(b, a)
          ]);
          const deb = await debate(a, b);
          pairs.push({ a, b, ab, ba, debate: deb });
        }
      }

      const stats = {
        total: pairs.length,
        contradictions: pairs.filter(p => 
          p.ab.label === 'contradict' || p.ba.label === 'contradict'
        ).length
      };

      const finalResult = await finalJudge({ claimsA, claimsB, pairs, stats });

      setResults({ stats, result: finalResult, pairs, claimsA, claimsB });
      
      // Build Tree Data
      const tree = {
        title: "Biblische Interpretations-Analyse",
        type: "root",
        children: [
          {
            title: `These A Claims (${claimsA.length})`,
            type: "claims",
            children: claimsA.map(claim => ({
              title: claim,
              type: "claim",
              content: claim
            }))
          },
          {
            title: `These B Claims (${claimsB.length})`,
            type: "claims", 
            children: claimsB.map(claim => ({
              title: claim,
              type: "claim",
              content: claim
            }))
          },
          {
            title: `Vergleichsanalyse (${pairs.length} Paare)`,
            type: "analysis",
            children: pairs.map((pair, idx) => ({
              title: `${pair.a} ↔ ${pair.b}`,
              type: "pair",
              children: [
                {
                  title: `NLI A→B: ${pair.ab.label}`,
                  type: "nli",
                  data: pair.ab,
                  content: pair.ab.reason
                },
                {
                  title: `NLI B→A: ${pair.ba.label}`,
                  type: "nli", 
                  data: pair.ba,
                  content: pair.ba.reason
                },
                {
                  title: "Debate",
                  type: "debate",
                  children: [
                    {
                      title: "Pro A",
                      type: "argument",
                      content: pair.debate.proA
                    },
                    {
                      title: "Pro B", 
                      type: "argument",
                      content: pair.debate.proB
                    }
                  ]
                }
              ]
            }))
          },
          {
            title: "Finale Bewertung",
            type: "final",
            content: `Score A: ${finalResult.a_score} | Score B: ${finalResult.b_score} | Widerspruchsrate: ${finalResult.contradiction_rate}`,
            children: [
              {
                title: "Zusammenfassung",
                type: "summary",
                content: finalResult.summary
              },
              {
                title: `Urteil: ${finalResult.verdict}`,
                type: "verdict",
                content: finalResult.verdict
              }
            ]
          }
        ]
      };
      
      setTreeData(tree);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            📖 Bible Fact Checker ⚖️
          </h1>
          <p className="text-gray-600">KI-gestützte Plausibilitätsprüfung biblischer Interpretationen</p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📜 These A (Interpretation 1)
              </label>
              <textarea
                value={thesisA}
                onChange={(e) => setThesisA(e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Erste biblische Interpretation..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📜 These B (Interpretation 2)
              </label>
              <textarea
                value={thesisB}
                onChange={(e) => setThesisB(e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Zweite biblische Interpretation..."
              />
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <button
              onClick={analyzeTheses}
              disabled={isAnalyzing || !thesisA.trim() || !thesisB.trim()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
            >
              {isAnalyzing ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Analysiere... 🤖
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  Interpretationen Prüfen! 🔍
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {results && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              🎯 Analyse-Ergebnisse
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(results.result.a_score * 100)}%
                </div>
                <div className="text-sm text-gray-600">These A Score</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(results.result.b_score * 100)}%
                </div>
                <div className="text-sm text-gray-600">These B Score</div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {Math.round(results.result.contradiction_rate * 100)}%
                </div>
                <div className="text-sm text-gray-600">Widersprüche</div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">💭 Zusammenfassung:</h3>
              <p className="text-gray-700">{results.result.summary}</p>
              <div className="mt-2">
                <span className="font-semibold">🏆 Urteil: </span>
                <span className={`font-bold ${
                  results.result.verdict === 'tie' ? 'text-yellow-600' :
                  results.result.verdict === 'A' ? 'text-blue-600' : 'text-green-600'
                }`}>
                  {results.result.verdict === 'tie' ? 'Unentschieden' :
                   results.result.verdict === 'A' ? 'These A stärker' : 'These B stärker'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tree Visualization */}
        {treeData && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              🌳 Argumentationsbaum
            </h2>
            <div className="max-h-96 overflow-y-auto border rounded-lg">
              <TreeNode node={treeData} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BibleFactChecker;