import { motion } from 'framer-motion';
import { FaBalanceScale, FaChartBar, FaExclamationTriangle } from 'react-icons/fa';

export default function ResultDisplay({ results }) {
  if (!results || !results.result) return null;

  const { result, stats } = results;
  const scoreA = (result.scoreA * 100).toFixed(0);
  const scoreB = (result.scoreB * 100).toFixed(0);
  const contradictionRate = (result.contradictionRate * 100).toFixed(0);

  // Intelligente Urteilsberechnung basierend auf Scores
  const calculateVerdict = () => {
    const scoreDiff = result.scoreB - result.scoreA;
    const coherenceDiff = result.coherenceB - result.coherenceA;
    
    // Gewichtung: 60% Score, 40% Kohärenz
    const weightedDiff = (scoreDiff * 0.6) + (coherenceDiff * 0.4);
    
    // Schwellenwert für klare Entscheidung
    const threshold = 0.1; // 10% Unterschied nötig
    
    if (weightedDiff > threshold) {
      return 'B';
    } else if (weightedDiff < -threshold) {
      return 'A';
    } else {
      return 'tie';
    }
  };

  const calculatedVerdict = calculateVerdict();

  const getVerdictColor = (verdict) => {
    switch(verdict) {
      case 'A': return 'verdict-a';
      case 'B': return 'verdict-b';
      default: return 'verdict-tie';
    }
  };

  const getVerdictText = (verdict) => {
    switch(verdict) {
      case 'A': return 'These A ist plausibler';
      case 'B': return 'These B ist plausibler';
      default: return 'Unentschieden';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="results-display"
    >
      <h2 className="results-title">
        <FaBalanceScale className="title-icon" />
        Analyseergebnis
      </h2>

      <div className="scores-grid">
        <motion.div 
          className="score-card"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="score-label">These A</h3>
          <div className="score-value">{scoreA}%</div>
          <div className="score-bar">
            <motion.div 
              className="score-fill score-fill-a"
              initial={{ width: 0 }}
              animate={{ width: `${scoreA}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
          <p className="coherence-text">
            Kohärenz: {(result.coherenceA * 100).toFixed(0)}%
          </p>
        </motion.div>

        <motion.div 
          className="score-card"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="score-label">These B</h3>
          <div className="score-value">{scoreB}%</div>
          <div className="score-bar">
            <motion.div 
              className="score-fill score-fill-b"
              initial={{ width: 0 }}
              animate={{ width: `${scoreB}%` }}
              transition={{ duration: 1, delay: 0.4 }}
            />
          </div>
          <p className="coherence-text">
            Kohärenz: {(result.coherenceB * 100).toFixed(0)}%
          </p>
        </motion.div>
      </div>

      <motion.div 
        className={`verdict-card ${getVerdictColor(calculatedVerdict)}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="verdict-title">Urteil</h3>
        <p className="verdict-text">{getVerdictText(calculatedVerdict)}</p>
        <p className="confidence-text">
          Konfidenz: {(result.confidence * 100).toFixed(0)}%
        </p>
        <div className="verdict-details">
          <small>
            Basis: Score-Diff {((result.scoreB - result.scoreA) * 100).toFixed(1)}%, 
            Kohärenz-Diff {((result.coherenceB - result.coherenceA) * 100).toFixed(1)}%
          </small>
        </div>
      </motion.div>

      <div className="stats-grid">
        <div className="stat-card">
          <FaChartBar className="stat-icon" />
          <div className="stat-content">
            <p className="stat-label">Analysierte Paare</p>
            <p className="stat-value">{stats.totalPairs}</p>
          </div>
        </div>

        <div className="stat-card">
          <FaExclamationTriangle className="stat-icon warning" />
          <div className="stat-content">
            <p className="stat-label">Widersprüche</p>
            <p className="stat-value">{contradictionRate}%</p>
          </div>
        </div>
      </div>

      <motion.div 
        className="summary-card"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="summary-title">Zusammenfassung</h3>
        <p className="summary-text">{result.summary}</p>
        
        {result.keyFindings && result.keyFindings.length > 0 && (
          <div className="key-findings">
            <h4 className="findings-title">Haupterkenntnisse:</h4>
            <ul className="findings-list">
              {result.keyFindings.map((finding, index) => (
                <motion.li 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  {finding}
                </motion.li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}