import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaQuestionCircle } from 'react-icons/fa';

export default function InputForm({ onAnalyze, loading }) {
  const [question, setQuestion] = useState('');

  const examples = [
    "Ist der Sabbat für Christen noch gültig?",
    "Sind alle Speisen für Christen rein?",
    "Ist die Taufe notwendig für die Erlösung?",
    "Müssen Christen den Zehnten zahlen?",
    "Ist die Zungenrede ein Zeichen des Heiligen Geistes?",
    "Können Frauen in der Gemeinde lehren?"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (question.trim()) {
      onAnalyze(question.trim());
    }
  };

  const loadExample = (exampleQuestion) => {
    setQuestion(exampleQuestion);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="input-form-container"
    >
      <form onSubmit={handleSubmit} className="input-form">
        <div className="form-group">
          <label htmlFor="question" className="form-label">
            <FaQuestionCircle className="label-icon" />
            Biblische Frage
          </label>
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Stellen Sie Ihre biblische Frage... (z.B. 'Ist der Sabbat für Christen noch gültig?')"
            className="form-textarea"
            rows="3"
            required
            disabled={loading}
          />
          <div className="form-hint">
            💡 Die KI erstellt automatisch These und Antithese aus Ihrer Frage
          </div>
        </div>

        <div className="examples-section">
          <p className="examples-title">Beispiel-Fragen:</p>
          <div className="examples-grid">
            {examples.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => loadExample(example)}
                className="example-button"
                disabled={loading}
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={loading || !question}
          className="submit-button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FaSearch className="button-icon" />
          {loading ? 'Analysiere Frage...' : 'Frage analysieren'}
        </motion.button>
      </form>
    </motion.div>
  );
}