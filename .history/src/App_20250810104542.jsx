import React, { useState, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType
} from 'react-flow-renderer';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Send,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Scale,
  Sparkles
} from 'lucide-react';
import clsx from 'clsx';

const CACHE_KEY = 'bible-fact-checker-cache-v1';

const BibleFactChecker = () => {
  const [thesisA, setThesisA] = useState('');
  const [thesisB, setThesisB] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedPair, setSelectedPair] = useState(null);
  const [activeTab, setActiveTab] = useState('input');

  // Cache handling
  const cacheResult = (key, data) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(key, JSON.stringify(data));
      } catch { /* ignore */ }
    }
  };

  const getCachedResult = (key) => {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    try {
      const cached = window.localStorage.getItem(key);
      if (cached) return JSON.parse(cached);
    } catch { /* ignore */ }
    return null;
  };

  // Mock API call - Replace with actual OpenRouter API integration
  const analyzeTheses = async (thesisA, thesisB) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Example mock response
    return {
      claimsA: [
        { text: "God's love is unconditional", id: "a1" },
        { text: "Faith requires action", id: "a2" },
        { text: "Salvation is through grace alone", id: "a3" }
      ],
      claimsB: [
        { text: "Works demonstrate faith", id: "b1" },
        { text: "Grace requires human response", id: "b2" },
        { text: "God judges by deeds", id: "b3" }
      ],
      pairs: [
        {
          a: "Salvation is through grace alone",
          b: "Works demonstrate faith",
          ab: { label: 'neutral', reason: "Grace and works can coexist in theological understanding" },
          ba: { label: 'neutral', reason: "Demonstrating faith doesn't contradict grace" },
          debate: {
            proA: "Grace alone emphasizes God's sovereignty and unconditional love",
            proB: "Works as demonstration shows genuine transformation"
          }
        },
        {
          a: "Faith requires action",
          b: "Grace requires human response",
          ab: { label: 'entail', reason: "Both emphasize human participation in faith" },
          ba: { label: 'entail', reason: "Human response aligns with faith requiring action" },
          debate: {
            proA: "Biblical faith is never passive but transformative",
            proB: "Grace initiates but expects reciprocal relationship"
          }
        }
      ],
      stats: {
        total: 9,
        contradictions: 2
      },
      result: {
        a_score: 0.75,
        b_score: 0.68,
        contradiction_rate: 0.22,
        summary: "Both theses present valid biblical perspectives with moderate theological tension",
        verdict: 'A'
      }
    };
  };

  const buildDecisionTree = useCallback((result) => {
    const newNodes = [];
    const newEdges = [];

    // Root node
    newNodes.push({
      id: 'root',
      position: { x: 400, y: 40 },
      data: { 
        label: (
          <div className="bg-purple-600 text-white p-3 rounded-lg shadow-lg flex flex-col items-center">
            <Scale className="w-5 h-5 mb-1" />
            <div className="text-sm font-bold">Biblical Analysis</div>
          </div>
        )
      },
      type: 'default'
    });

    // Thesis A Node
    newNodes.push({
      id: 'thesisA',
      position: { x: 200, y: 140 },
      data: {
        label: (
          <div className="bg-blue-500 text-white p-3 rounded-lg shadow-lg max-w-xs">
            <div className="text-xs font-bold mb-1">Thesis A</div>
            <div className="text-xs opacity-90">{result.claimsA.length} claims</div>
            <div className="text-sm font-bold mt-1">Score: {(result.result.a_score * 100).toFixed(0)}%</div>
          </div>
        )
      },
      type: 'default'
    });

    // Thesis B Node
    newNodes.push({
      id: 'thesisB',
      position: { x: 600, y: 140 },
      data: {
        label: (
          <div className="bg-green-500 text-white p-3 rounded-lg shadow-lg max-w-xs">
            <div className="text-xs font-bold mb-1">Thesis B</div>
            <div className="text-xs opacity-90">{result.claimsB.length} claims</div>
            <div className="text-sm font-bold mt-1">Score: {(result.result.b_score * 100).toFixed(0)}%</div>
          </div>
        )
      },
      type: 'default'
    });

    // Edges from root
    newEdges.push({
      id: 'root-thesisA',
      source: 'root',
      target: 'thesisA',
      animated: true,
      style: { stroke: '#3b82f6' },
      markerEnd: { type: MarkerType.ArrowClosed }
    });

    newEdges.push({
      id: 'root-thesisB',
      source: 'root',
      target: 'thesisB',
      animated: true,
      style: { stroke: '#10b981' },
      markerEnd: { type: MarkerType.ArrowClosed }
    });

    // Claims Nodes for A
    result.claimsA.forEach((claim, index) => {
      const id = `claimA-${index}`;
      newNodes.push({
        id,
        position: { x: 100 + index * 120, y: 240 },
        data: {
          label: (
            <div 
              className="bg-blue-100 text-blue-900 p-2 rounded-lg shadow max-w-xs cursor-pointer" 
              onClick={() => {
                const pair = result.pairs.find(p => p.a === claim.text);
                if (pair) setSelectedPair(pair);
                setActiveTab('details');
              }}
            >
              <div className="text-xs font-semibold">Claim A{index + 1}</div>
              <div className="text-xs mt-1">
                {claim.text.length > 40 ? claim.text.substring(0, 40) + '...' : claim.text}
              </div>
            </div>
          )
        },
        type: 'default'
      });
      newEdges.push({
        id: `thesisA-${id}`,
        source: 'thesisA',
        target: id,
        style: { stroke: '#93c5fd' }
      });
    });

    // Claims Nodes for B
    result.claimsB.forEach((claim, index) => {
      const id = `claimB-${index}`;
      newNodes.push({
        id,
        position: { x: 500 + index * 120, y: 240 },
        data: {
          label: (
            <div 
              className="bg-green-100 text-green-900 p-2 rounded-lg shadow max-w-xs cursor-pointer" 
              onClick={() => {
                const pair = result.pairs.find(p => p.b === claim.text);
                if (pair) setSelectedPair(pair);
                setActiveTab('details');
              }}
            >
              <div className="text-xs font-semibold">Claim B{index + 1}</div>
              <div className="text-xs mt-1">
                {claim.text.length > 40 ? claim.text.substring(0, 40) + '...' : claim.text}
              </div>
            </div>
          )
        },
        type: 'default'
      });
      newEdges.push({
        id: `thesisB-${id}`,
        source: 'thesisB',
        target: id,
        style: { stroke: '#86efac' }
      });
    });

    // Verdict Node
    const verdictColor = result.result.verdict === 'A' ? 'blue' : result.result.verdict === 'B' ? 'green' : 'gray';
    newNodes.push({
      id: 'verdict',
      position: { x: 400, y: 360 },
      data: {
        label: (
          <div className={clsx(
            'text-white p-4 rounded-lg shadow-lg text-center',
            verdictColor === 'blue' && 'bg-blue-600',
            verdictColor === 'green' && 'bg-green-600',
            verdictColor === 'gray' && 'bg-gray-600'
          )}>
            <div className="text-sm font-bold mb-1">Verdict: Thesis {result.result.verdict}</div>
            <div className="text-xs opacity-90">
              Contradiction Rate: {(result.result.contradiction_rate * 100).toFixed(0)}%
            </div>
            <div className="text-xs mt-1">{result.result.summary}</div>
          </div>
        )
      },
      type: 'default'
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [setNodes, setEdges]);

  const handleAnalyze = async () => {
    if (!thesisA.trim() || !thesisB.trim()) {
      setError('Please enter both biblical interpretations to compare');
      return;
    }
    setError(null);
    setIsAnalyzing(true);
    setAnalysisResult(null);

    // Cache check
    const cacheKey = `${CACHE_KEY}:${thesisA.trim()}:${thesisB.trim()}`;
    const cached = getCachedResult(cacheKey);
    if (cached) {
      setAnalysisResult(cached);
      buildDecisionTree(cached);
      setIsAnalyzing(false);
      setActiveTab('tree');
      return;
    }

    try {
      const result = await analyzeTheses(thesisA.trim(), thesisB.trim());
      setAnalysisResult(result);
      buildDecisionTree(result);
      cacheResult(cacheKey, result);
      setActiveTab('tree');
    } catch (err) {
      setError('Analysis failed, please try again later.');
      setActiveTab('input');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getLabelIcon = (label) => {
    switch(label) {
      case 'entail': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'contradict': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'neutral': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-extrabold tracking-tight">Bible Fact Checker</h1>
            <Sparkles className="w-8 h-8 text-purple-400" />
          </div>
          <p className="text-purple-200 text-lg font-medium">AI-Powered Biblical Interpretation Analysis</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center mb-6">
          <nav className="bg-gray-800 rounded-lg p-1 flex gap-2">
            {['input', 'tree', 'details'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  'px-6 py-2 rounded-md font-semibold text-sm transition-colors duration-300',
                  activeTab === tab ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                )}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Panels */}
        <div className="min-h-[400px] bg-gray-800 rounded-lg p-6 shadow-lg">
          <AnimatePresence mode="wait">
            {activeTab === 'input' && (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label htmlFor="thesisA" className="block text-sm font-medium text-purple-300 mb-1">
                    Biblical Interpretation Thesis A
                  </label>
                  <textarea
                    id="thesisA"
                    rows={3}
                    value={thesisA}
                    onChange={e => setThesisA(e.target.value)}
                    className="w-full rounded-md border border-gray-600 bg-gray-900 p-3 text-white placeholder-gray-500 focus:border-purple-500 focus:ring focus:ring-purple-400 focus:ring-opacity-50"
                    placeholder="Enter first interpretation or thesis..."
                    disabled={isAnalyzing}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="thesisB" className="block text-sm font-medium text-purple-300 mb-1">
                    Biblical Interpretation Thesis B
                  </label>
                  <textarea
                    id="thesisB"
                    rows={3}
                    value={thesisB}
                    onChange={e => setThesisB(e.target.value)}
                    className="w-full rounded-md border border-gray-600 bg-gray-900 p-3 text-white placeholder-gray-500 focus:border-purple-500 focus:ring focus:ring-purple-400 focus:ring-opacity-50"
                    placeholder="Enter second interpretation or thesis..."
                    disabled={isAnalyzing}
                  />
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-colors disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
                    Analyze
                  </button>
                </div>

                {error && <p className="mt-4 text-red-500 text-center font-medium">{error}</p>}
              </motion.div>
            )}

            {activeTab === 'tree' && analysisResult && (
              <motion.div
                key="tree"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-[600px] bg-gray-900 rounded-lg relative"
              >
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  fitView
                  attributionPosition="top-right"
                  connectionLineType="smoothstep"
                  zoomOnScroll={false}
                  zoomOnPinch={false}
                  panOnDrag={true}
                  nodesDraggable={false}
                  nodesConnectable={false}
                  edgesFocusable={false}
                >
                  <Background gap={16} color="#2d2d2d" />
                  <Controls showInteractive={false} />
                </ReactFlow>
                <div className="absolute bottom-4 right-4 text-xs text-gray-400">Click claims to view details</div>
              </motion.div>
            )}

            {activeTab === 'details' && selectedPair && (
              <motion.div
                key="details"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 max-w-4xl mx-auto"
              >
                <button
                  onClick={() => setActiveTab('tree')}
                  className="flex items-center gap-2 text-purple-400 hover:text-purple-300 font-semibold mb-4"
                >
                  <ChevronRight className="rotate-180 w-5 h-5" /> Back to Tree
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-900 p-4 rounded-lg shadow-lg">
                    <h3 className="font-bold text-lg mb-2">Claim A</h3>
                    <p>{selectedPair.a}</p>
                    <div className="mt-4 flex items-center gap-2">
                      {getLabelIcon(selectedPair.ab.label)}
                      <span className="text-sm">{selectedPair.ab.label.toUpperCase()} - {selectedPair.ab.reason}</span>
                    </div>
                    {selectedPair.debate && (
                      <div className="mt-4">
                        <h4 className="font-semibold">Pro Argument A</h4>
                        <p>{selectedPair.debate.proA}</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-green-900 p-4 rounded-lg shadow-lg">
                    <h3 className="font-bold text-lg mb-2">Claim B</h3>
                    <p>{selectedPair.b}</p>
                    <div className="mt-4 flex items-center gap-2">
                      {getLabelIcon(selectedPair.ba.label)}
                      <span className="text-sm">{selectedPair.ba.label.toUpperCase()} - {selectedPair.ba.reason}</span>
                    </div>
                    {selectedPair.debate && (
                      <div className="mt-4">
                        <h4 className="font-semibold">Pro Argument B</h4>
                        <p>{selectedPair.debate.proB}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default BibleFactChecker;
