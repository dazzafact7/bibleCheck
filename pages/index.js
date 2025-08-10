import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InputForm from '../components/InputForm';
import TreeView from '../components/TreeView';
import ResultDisplay from '../components/ResultDisplay';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async (thesisA, thesisB) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ thesisA, thesisB }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient">
      <div className="container">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="header"
        >
          <h1 className="title">
            <span className="icon">📖</span>
            Bible Fact Checker
          </h1>
          <p className="subtitle">
            Vergleiche biblische Thesen mit KI-gestützter Analyse
          </p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <InputForm onAnalyze={handleAnalyze} loading={loading} />
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="error-container"
            >
              <div className="error-message">
                ⚠️ {error}
              </div>
            </motion.div>
          )}

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="loading-container"
            >
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Analysiere Thesen...</p>
              </div>
            </motion.div>
          )}

          {results && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="results-container"
            >
              <ResultDisplay results={results} />
              <TreeView data={results} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}