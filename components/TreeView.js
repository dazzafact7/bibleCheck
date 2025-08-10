import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaChevronRight, FaCheckCircle, FaTimesCircle, FaMinusCircle } from 'react-icons/fa';

export default function TreeView({ data }) {
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  if (!data || !data.pairs) return null;

  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getLabelIcon = (label) => {
    switch(label) {
      case 'entail': return <FaCheckCircle className="icon-entail" />;
      case 'contradict': return <FaTimesCircle className="icon-contradict" />;
      default: return <FaMinusCircle className="icon-neutral" />;
    }
  };

  const getLabelClass = (label) => {
    switch(label) {
      case 'entail': return 'label-entail';
      case 'contradict': return 'label-contradict';
      default: return 'label-neutral';
    }
  };

  const renderClaimNode = (claim, index, type) => {
    const nodeId = `${type}-${index}`;
    const isExpanded = expandedNodes.has(nodeId);
    const relatedPairs = data.pairs.filter(p => 
      type === 'A' ? p.claimA === claim : p.claimB === claim
    );

    return (
      <motion.div
        key={nodeId}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className="tree-node"
      >
        <div 
          className="node-header"
          onClick={() => toggleNode(nodeId)}
        >
          <span className="node-toggle">
            {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
          </span>
          <span className="node-title">
            Claim {index + 1}: {claim}
          </span>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="node-children"
            >
              {relatedPairs.map((pair, pairIndex) => (
                <div key={`${nodeId}-pair-${pairIndex}`} className="pair-analysis">
                  <div className="analysis-item">
                    <div className={`analysis-label ${getLabelClass(pair.analysisAB.label)}`}>
                      {getLabelIcon(pair.analysisAB.label)}
                      <span>{pair.analysisAB.label} ({pair.analysisAB.score})</span>
                    </div>
                    <p className="analysis-reason">{pair.analysisAB.reason}</p>
                  </div>

                  {pair.debate && (
                    <motion.div 
                      className="debate-section"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h5 className="debate-title">Debatte:</h5>
                      <div className="debate-arguments">
                        <div className="argument pro-a">
                          <strong>Pro A:</strong> {pair.debate.proA}
                        </div>
                        <div className="argument pro-b">
                          <strong>Pro B:</strong> {pair.debate.proB}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="tree-view-container"
    >
      <h2 className="tree-title">
        🌳 Argumentationsbaum
      </h2>

      <div className="tree-columns">
        <div className="tree-column">
          <h3 className="column-title">These A - Claims</h3>
          <div className="claims-list">
            {data.claimsA.map((claim, index) => 
              renderClaimNode(claim, index, 'A')
            )}
          </div>
        </div>

        <div className="tree-column">
          <h3 className="column-title">These B - Claims</h3>
          <div className="claims-list">
            {data.claimsB.map((claim, index) => 
              renderClaimNode(claim, index, 'B')
            )}
          </div>
        </div>
      </div>

      <motion.div 
        className="connections-info"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="connections-title">Verbindungsübersicht</h3>
        <div className="connections-stats">
          <div className="stat-item">
            <FaCheckCircle className="icon-entail" />
            <span>Unterstützungen: {data.stats.entailments}</span>
          </div>
          <div className="stat-item">
            <FaTimesCircle className="icon-contradict" />
            <span>Widersprüche: {data.stats.contradictions}</span>
          </div>
          <div className="stat-item">
            <FaMinusCircle className="icon-neutral" />
            <span>Neutral: {data.stats.neutral}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}