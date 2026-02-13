import { GoogleGenAI } from '@google/genai';

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const toFiniteNumber = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'GEMINI_API_KEY is not configured' }));
    return;
  }

  const body = req.body || {};
  const categoryName = isNonEmptyString(body.categoryName) ? body.categoryName.trim() : null;
  const budget = toFiniteNumber(body.budget);
  const spent = toFiniteNumber(body.spent);

  if (!categoryName || budget === null || spent === null) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Invalid request body' }));
    return;
  }

  const prompt = `
You are a friendly and encouraging financial advisor. I'm using a budgeting app in Indonesia.
My monthly budget for the category '${categoryName}' is IDR ${budget.toFixed(0)}.
So far, I have spent IDR ${spent.toFixed(0)} in this category.
Please provide one short, actionable, and encouraging tip (maximum 2 sentences) in English on how I can manage my spending in this category for the rest of the month.
Do not be judgmental. Be positive and helpful.
`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 1,
        topK: 1,
        maxOutputTokens: 100,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const tip = String(response.text || '').trim();
    if (!tip) {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Empty response from model' }));
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ tip }));
  } catch {
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Failed to fetch tip' }));
  }
};
