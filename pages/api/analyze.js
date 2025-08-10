import { compareTheses } from '../../lib/factChecker';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { thesisA, thesisB } = req.body;

  if (!thesisA || !thesisB) {
    return res.status(400).json({ error: 'Both theses are required' });
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