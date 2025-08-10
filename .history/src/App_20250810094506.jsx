// App.js
import React, { useState } from 'react';
import { Brain, Loader } from 'lucide-react';
import * as api from './api';
import TreeNode from './components/TreeNode';

const BibleFactChecker = () => {
  const [thesisA, setThesisA] = useState("Jesus führte historisch belegbare Wunder durch, die naturwissenschaftlich erklärbar sind.");
  const [thesisB, setThesisB] = useState("Die Wunder Jesu sind symbolische Erzählungen ohne historische Faktizität.");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [treeData, setTreeData] = useState(null);
  const [error, setError] = useState(null);

  const buildTreeData = (claimsA, claimsB, pairs, finalResult) => ({
    title: "Biblische Interpretations-Analyse",
    type: "root",
    children: [
      {
        title: `These A Claims (${claimsA.length})`,
        type: "claims",
        children: claimsA.map(claim => ({ title: claim, type: "claim", content: claim })),
      },
      {
        title: `These B Claims (${claimsB.length})`,
        type: "claims",
        children: claimsB.map(claim => ({ title: claim, type: "claim", content: claim })),
      },
      {
        title: `Vergleichsanalyse (${pairs.length} Paare)`,
        type: "analysis",
        children: pairs.map(pair => ({
          title: `${pair.a} ↔ ${pair.b}`,
          type: "pair",
          children: [
            { title: `NLI A→B: ${pair.ab.label}`, type: "nli", data: pair.ab, content: pair.ab.reason },
            { title: `NLI B→A: ${pair.ba.label}`, type: "nli", data: pair.ba, content: pair.ba.reason },
            {
              title: "Debatte",
              type: "debate",
              children: [
                { title: "Pro A", type: "argument", content: pair.debate.proA },
                { title: "Pro B", type: "argument", content: pair.debate.proB },
              ],
            },
          ],
        })),
      },
      {
        title: "Finale Bewertung",
        type: "final",
        content: `Score A: ${finalResult.a_score} | Score B: ${finalResult.b_score} | Widerspruchsrate: ${finalResult.contradiction_rate}`,
        children: [
          { title: "Zusammenfassung", type: "summary", content: finalResult.summary },
          { title: `Urteil: ${finalResult.verdict}`, type: "verdict", content: `Das Urteil lautet: ${finalResult.verdict}` },
        ],
      },
    ],
  });

  const analyzeTheses = async () => {
    setIsAnalyzing(true);
    setResults(null);
    setTreeData(null);
    setError(null);

    try {
      const [claimsA, claimsB] = await Promise.all([
        api.extractClaims(thesisA),
        api.extractClaims(thesisB),
      ]);

      const nliPromises = claimsA.flatMap(a =>
        claimsB.map(async b => {
          const [ab, ba, deb] = await Promise.all([
            api.nliJudge(a, b),
            api.nliJudge(b, a),
            api.debate(a, b),
          ]);
          return { a, b, ab, ba, debate: deb };
        })
      );
      const pairs = await Promise.all(nliPromises);

      const contradictions = pairs.filter(p => p.ab?.label === 'contradiction' || p.ba?.label === 'contradiction').length;
      const stats = { total: pairs.length, contradictions };

      const finalResult = await api.finalJudge({ claimsA, claimsB, pairs, stats });
      if (!finalResult || typeof finalResult.a_score === 'undefined') {
        throw new Error("Finale Bewertung fehlgeschlagen oder ungültig.");
      }

      setResults({ stats, result: finalResult });
      setTreeData(buildTreeData(claimsA, claimsB, pairs, finalResult));

    } catch (err) {
      console.error('Analysis error:', err);
      setError("Ein Fehler ist während der Analyse aufgetreten. Bitte überprüfe die API-Konfiguration und versuche es erneut.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const VerdictDisplay = ({ verdict, result }) => {
      let verdictText, colorClass;
      switch (verdict) {
          case 'A':
              verdictText = 'These A stärker';
              colorClass = 'text-blue-600';
              break;
          case 'B':
              verdictText = 'These B stärker';
              colorClass = 'text-green-600';
              break;
          default:
              verdictText = 'Unentschieden';
              colorClass = 'text-yellow-600';
              break;
      }
      return (
          <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">💭 Zusammenfassung:</h3>
              <p className="text-gray-700">{result.summary}</p>
              <div className="mt-2">
                  <span className="font-semibold">🏆 Urteil: </span>
                  <span className={`font-bold ${colorClass}`}>{verdictText}</span>
              </div>
          </div>
      );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            📖 Bible Fact Checker ⚖️
          </h1>
          <p className="text-gray-600">KI-gestützte Plausibilitätsprüfung biblischer Interpretationen</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">📜 These A (Interpretation 1)</label>
              <textarea
                value={thesisA}
                onChange={(e) => setThesisA(e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Erste biblische Interpretation..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">📜 These B (Interpretation 2)</label>
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
                <><Loader className="w-5 h-5 animate-spin" /> Analysiere... 🤖</>
              ) : (
                <><Brain className="w-5 h-5" /> Interpretationen Prüfen! 🔍</>
              )}
            </button>
          </div>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-8" role="alert">{error}</div>}

        {results && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🎯 Analyse-Ergebnisse</h2>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-600">{Math.round((results.result.a_score || 0) * 100)}%</div>
                <div className="text-sm text-gray-600">These A Score</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-600">{Math.round((results.result.b_score || 0) * 100)}%</div>
                <div className="text-sm text-gray-600">These B Score</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-red-600">{Math.round((results.result.contradiction_rate || 0) * 100)}%</div>
                <div className="text-sm text-gray-600">Widersprüche</div>
              </div>
            </div>
            <VerdictDisplay verdict={results.result.verdict} result={results.result} />
          </div>
        )}

        {treeData && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🌳 Argumentationsbaum</h2>
            <div className="max-h-[32rem] overflow-y-auto border rounded-lg p-2 bg-slate-50">
              <TreeNode node={treeData} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BibleFactChecker;
