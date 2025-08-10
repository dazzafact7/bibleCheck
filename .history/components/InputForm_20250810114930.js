import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaBook, FaCross } from 'react-icons/fa';

export default function InputForm({ onAnalyze, loading }) {
  const [thesisA, setThesisA] = useState('');
  const [thesisB, setThesisB] = useState('');

  const examples = [
    {
      a: "Jesus ist der einzige Weg zum Heil",
      b: "Alle guten Menschen kommen in den Himmel"
    },
    {
      a: "Der Glaube allein rettet",
      b: "Gute Werke sind für die Erlösung notwendig"
    },
    {
      a: "Gott ist allwissend und allmächtig",
      b: "Menschen haben einen freien Willen"
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (thesisA.trim() && thesisB.trim()) {
      onAnalyze(thesisA.trim(), thesisB.trim());
    }
  };

  const loadExample = (example) => {
    setThesisA(example.a);
    setThesisB(example.b);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="input-form-container"
    >
      <form onSubmit={handleSubmit} className="input-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="thesisA" className="form-label">
              <FaBook className="label-icon" />
              These A
            </label>
            <textarea
              id="thesisA"
              value={thesisA}
              onChange={(e) => setThesisA(e.target.value)}
              placeholder="Geben Sie die erste biblische These ein..."
              className="form-textarea"
              rows="4"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="thesisB" className="form-label">
              <FaCross className="label-icon" />
              These B
            </label>
            <textarea
              id="thesisB"
              value={thesisB}
              onChange={(e) => setThesisB(e.target.value)}
              placeholder="Geben Sie die zweite biblische These ein..."
              className="form-textarea"
              rows="4"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="examples-section">
          <p className="examples-title">Beispiele:</p>
          <div className="examples-grid">
            {examples.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => loadExample(example)}
                className="example-button"
                disabled={loading}
              >
                Beispiel {index + 1}
              </button>
            ))}
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={loading || !thesisA || !thesisB}
          className="submit-button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FaSearch className="button-icon" />
          {loading ? 'Analysiere...' : 'Thesen analysieren'}
        </motion.button>
      </form>
    </motion.div>
  );
}