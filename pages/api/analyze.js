import { compareTheses, analyzeQuestionDialectically } from '../../lib/factChecker';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { thesisA, thesisB, question } = req.body;

  // Neuer Workflow: Analyse aus einer Frage
  if (question) {
    if (!question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }

    try {
      const results = await analyzeQuestionDialectically(question.trim());
      res.status(200).json(results);
    } catch (error) {
      console.error('Question analysis error:', error);
      res.status(500).json({ 
        error: 'Question analysis failed', 
        details: error.message 
      });
    }
    return;
  }

  // Alter Workflow: Direkter Thesenvergleich (Rückwärtskompatibilität)
  if (!thesisA || !thesisB) {
    return res.status(400).json({ error: 'Both theses are required when not using question mode' });
  }

  try {
    const results = await compareTheses(thesisA, thesisB);
    res.status(200).json(results);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      error: 'Analysis failed', 
      details: error.message 
    });
  }
}