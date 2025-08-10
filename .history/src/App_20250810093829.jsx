import React, { useState } from 'react';
import { Search, Book, Brain, TreePine, CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';

// Cache für GPT Requests
const createCache = () => {
  const cache = {};
  return {
    get: (key) => cache[key],
    set: (key, value) => { cache[key] = value; return value; },
    has: (key) => key in cache
  };
};

const gptCache = createCache();

// Mock GPT API (da wir keine echte API haben)
const mockGPTCall = async (prompt, systemPrompt) => {
  const cacheKey = `${systemPrompt.slice(0,50)}:${prompt.slice(0,100)}`;
  
  if (gptCache.has(cacheKey)) {
    return gptCache.get(cacheKey);
  }

  // Simuliere API-Delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  // Mock-Responses basierend auf Prompt-Typ
  let mockResponse;
  
  if (systemPrompt.includes('Claims')) {
    mockResponse = {
      claims: [
        "Jesus ist der Sohn Gottes",
        "Die Auferstehung fand historisch statt",
        "Die Bibel ist göttlich inspiriert"
      ]
    };
  } else if (systemPrompt.includes('NLI-Judge')) {
    const contradictions = ["widerspricht", "contradict", "gegensätzlich"];
    const isContradiction = contradictions.some(word => 
      prompt.toLowerCase().includes(word.toLowerCase())
    );
    
    mockResponse = {
      label: isContradiction ? "contradict" : Math.random() > 0.5 ? "entail" : "neutral",
      reason: isContradiction 
        ? "Die Aussagen stehen in direktem Widerspruch zueinander"
        : "Die Aussagen ergänzen sich logisch"
    };
  } else if (systemPrompt.includes('Kurzplädoyers')) {
    mockResponse = {
      proA: "Die biblische Überlieferung spricht für diese Interpretation durch historische Kontinuität",
      proB: "Moderne theologische Forschung zeigt alternative Deutungsmöglichkeiten auf"
    };
  } else if (systemPrompt.includes('finale Richter')) {
    mockResponse = {
      a_score: 0.7 + Math.random() * 0.3,
      b_score: 0.6 + Math.random() * 0.4,
      contradiction_rate: Math.random() * 0.5,
      summary: "Beide Thesen haben theologische Berechtigung, aber unterschiedliche Schwerpunkte",
      verdict: Math.random() > 0.5 ? 'A' : 'B'
    };
  }
  
  return gptCache.set(cacheKey, mockResponse);
};

// GPT Helper Functions
const extractClaims = async (thesis) => {
  const response = await mockGPTCall(
    `Text:\n${thesis}\nGib 3-8 kurze Claims.`,
    "Du zerlegst biblische Texte in überprüfbare Einzelaussagen. Antworte als JSON: {claims:[...]}."
  );
  return response.claims;
};

const nliJudge = async (a, b) => {
  return await mockGPTCall(
    `PREM: ${a}\nHYP: ${b}`,
    "Du bist ein theologischer NLI-Judge. Werte HYP relativ zu PREM als entail/contradict/neutral. JSON: {label,reason}."
  );
};

const debate = async (claimA, claimB) => {
  return await mockGPTCall(
    `ClaimA: ${claimA}\nClaimB: ${claimB}`,
    "Zwei theologische Kurzplädoyers: PRO-A und PRO-B. Antworte JSON {proA,proB}."
  );
};

const finalJudge = async (data) => {
  return await mockGPTCall(
    `Basisdaten:\n${JSON.stringify(data).slice(0, 8000)}`,
    "Du bist der finale theologische Richter. Werte biblische Stringenz. JSON: {a_score,b_score,contradiction_rate,summary,verdict}"
  );
};

// Tree Node Component
const TreeNode = ({ node, level = 0 }) => {
  const [expanded, setExpanded] = useState(level < 2);
  
  const getIcon = () => {
    if (node.type === 'claim') return <Book className="w-4 h-4 text-blue-500" />;
    if (node.type === 'nli') {
      if (node.data?.label === 'contradict') return <XCircle className="w-4 h-4 text-red-500" />;
      if (node.data?.label === 'entail') return <CheckCircle className="w-4 h-4 text-green-500" />;
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
    if (node.type === 'debate') return <Brain className="w-4 h-4 text-purple-500" />;
    return <TreePine className="w-4 h-4 text-gray-500" />;
  };

  const getColor = () => {
    if (node.type === 'nli' && node.data?.label === 'contradict') return 'border-l-red-500 bg-red-50';
    if (node.type === 'nli' && node.data?.label === 'entail') return 'border-l-green-500 bg-green-50';
    if (node.type === 'debate') return 'border-l-purple-500 bg-purple-50';
    return 'border-l-gray-300 bg-gray-50';
  };

  return (
    <div className={`ml-${level * 6} mb-2`}>
      <div 
        className={`p-3 border-l-4 rounded-r-lg ${getColor()} cursor-pointer transition-all hover:shadow-sm`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          {getIcon()}
          <span className="font-medium text-gray-800">{node.title}</span>
          {node.children && (
            <span className="text-xs text-gray-500">
              ({expanded ? '▼' : '▶'} {node.children.length})
            </span>
          )}
        </div>
        
        {node.content && (
          <p className="text-sm text-gray-600 mt-1">{node.content}</p>
        )}
        
        {node.data && (
          <div className="text-xs text-gray-500 mt-2 space-y-1">
            {node.data.label && <span className="px-2 py-1 bg-white rounded">{node.data.label}</span>}
            {node.data.reason && <p className="italic">{node.data.reason}</p>}
            {node.data.proA && <p><strong>Pro A:</strong> {node.data.proA}</p>}
            {node.data.proB && <p><strong>Pro B:</strong> {node.data.proB}</p>}
          </div>
        )}
      </div>
      
      {expanded && node.children && (
        <div className="mt-2">
          {node.children.map((child, idx) => (
            <TreeNode key={idx} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

// Main Component
const BibleFactChecker = () => {
  const [thesisA, setThesisA] = useState("Die Auferstehung Jesu ist ein historisches Ereignis, das durch Augenzeugenberichte belegt ist.");
  const [thesisB, setThesisB] = useState("Die Auferstehungsberichte sind symbolische Darstellungen spiritueller Wahrheiten ohne historische Grundlage.");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [progress, setProgress] = useState({ step: '', percent: 0 });

  const analyzeTheses = async () => {
    setLoading(true);
    setResults(null);
    
    try {
      // Step 1: Claims extrahieren
      setProgress({ step: 'Extrahiere Claims...', percent: 10 });
      const [claimsA, claimsB] = await Promise.all([
        extractClaims(thesisA),
        extractClaims(thesisB)
      ]);

      // Step 2: NLI & Debates
      setProgress({ step: 'Analysiere Beziehungen...', percent: 30 });
      const pairs = [];
      
      for (let i = 0; i < claimsA.length; i++) {
        for (let j = 0; j < claimsB.length; j++) {
          setProgress({ 
            step: `Vergleiche Claim ${i+1}A mit ${j+1}B...`, 
            percent: 30 + ((i * claimsB.length + j) / (claimsA.length * claimsB.length)) * 50 
          });
          
          const [ab, ba, deb] = await Promise.all([
            nliJudge(claimsA[i], claimsB[j]),
            nliJudge(claimsB[j], claimsA[i]),
            debate(claimsA[i], claimsB[j])
          ]);
          
          pairs.push({
            claimA: claimsA[i],
            claimB: claimsB[j],
            ab, ba, debate: deb
          });
        }
      }

      // Step 3: Final Judge
      setProgress({ step: 'Finale Bewertung...', percent: 90 });
      const stats = {
        total: pairs.length,
        contradictions: pairs.filter(p => p.ab.label === 'contradict' || p.ba.label === 'contradict').length
      };
      
      const finalResult = await finalJudge({ claimsA, claimsB, pairs, stats });
      
      // Baum-Struktur erstellen
      const treeData = {
        title: 'Theologische Analyse',
        type: 'root',
        children: [
          {
            title: `These A: ${thesisA.slice(0, 50)}...`,
            type: 'thesis',
            content: thesisA,
            children: claimsA.map(claim => ({
              title: 'Claim',
              type: 'claim',
              content: claim,
              children: pairs
                .filter(p => p.claimA === claim)
                .map(pair => ({
                  title: `Vergleich mit "${pair.claimB.slice(0, 30)}..."`,
                  type: 'comparison',
                  children: [
                    {
                      title: 'Logische Beziehung A→B',
                      type: 'nli',
                      data: pair.ab
                    },
                    {
                      title: 'Logische Beziehung B→A',
                      type: 'nli',
                      data: pair.ba
                    },
                    {
                      title: 'Theologische Debatte',
                      type: 'debate',
                      data: pair.debate
                    }
                  ]
                }))
            }))
          },
          {
            title: `These B: ${thesisB.slice(0, 50)}...`,
            type: 'thesis',
            content: thesisB,
            children: claimsB.map(claim => ({
              title: 'Claim',
              type: 'claim',
              content: claim
            }))
          },
          {
            title: 'Finale Bewertung',
            type: 'judgment',
            children: [
              {
                title: `These A Score: ${(finalResult.a_score * 100).toFixed(1)}%`,
                type: 'score',
                content: `Theologische Stringenz von These A`
              },
              {
                title: `These B Score: ${(finalResult.b_score * 100).toFixed(1)}%`,
                type: 'score',
                content: `Theologische Stringenz von These B`
              },
              {
                title: `Widerspruchsrate: ${(finalResult.contradiction_rate * 100).toFixed(1)}%`,
                type: 'stats',
                content: `${stats.contradictions} von ${stats.total} Vergleichen zeigen Widersprüche`
              },
              {
                title: `Urteil: These ${finalResult.verdict}`,
                type: 'verdict',
                content: finalResult.summary
              }
            ]
          }
        ]
      };

      setResults({ stats, result: finalResult, tree: treeData });
      setProgress({ step: 'Analyse abgeschlossen! ✨', percent: 100 });
      
    } catch (error) {
      console.error('Fehler bei der Analyse:', error);
      setProgress({ step: 'Fehler bei der Analyse 😔', percent: 0 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Book className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Bible Fact Checker</h1>
              <p className="text-sm text-gray-500">Theologische Thesen intelligent vergleichen 🧠</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Input Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              📖 These A
            </label>
            <textarea
              value={thesisA}
              onChange={(e) => setThesisA(e.target.value)}
              className="w-full h-32 p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Gib deine erste biblische These ein..."
            />
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              📚 These B
            </label>
            <textarea
              value={thesisB}
              onChange={(e) => setThesisB(e.target.value)}
              className="w-full h-32 p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Gib deine zweite biblische These ein..."
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center mb-8">
          <button
            onClick={analyzeTheses}
            disabled={loading || !thesisA.trim() || !thesisB.trim()}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3 mx-auto"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Analysiere...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Thesen vergleichen ⚖️
              </>
            )}
          </button>
        </div>

        {/* Progress Bar */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">{progress.step}</span>
              <span className="text-sm text-gray-500">{progress.percent.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        )}

        {/* Results Tree */}
        {results && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <TreePine className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-800">Analyse-Baum 🌳</h2>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {(results.result.a_score * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500">These A Score</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {(results.result.b_score * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500">These B Score</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {(results.result.contradiction_rate * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500">Widersprüche</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              <TreeNode node={results.tree} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BibleFactChecker;