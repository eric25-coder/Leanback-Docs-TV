import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));

  // Initialize Gemini AI SDK
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // API Routes
  app.post('/api/gemini/summarize', async (req, res) => {
    try {
      const { documentTitle, documentType, content } = req.body;
      if (!content) {
        return res.status(400).json({ error: 'Document content is required' });
      }

      const prompt = `Provide a structured summary of the following ${documentType.toUpperCase()} document titled "${documentTitle}". Include key takeaways, main sections or data points, and executive notes suitable for an Android TV viewer.\n\nContent:\n${typeof content === 'string' ? content.substring(0, 15000) : JSON.stringify(content).substring(0, 15000)}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an expert AI document assistant for an Android TV productivity app. Provide clear, well-formatted summaries with bullet points.',
        },
      });

      res.json({ summary: response.text || 'No summary generated.' });
    } catch (error: any) {
      console.error('Gemini summarize error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate summary' });
    }
  });

  app.post('/api/gemini/qa', async (req, res) => {
    try {
      const { documentTitle, documentType, content, question } = req.body;
      if (!question || !content) {
        return res.status(400).json({ error: 'Question and content are required' });
      }

      const prompt = `Based on the following ${documentType.toUpperCase()} document titled "${documentTitle}", answer the user's question clearly and concisely.\n\nDocument Content:\n${typeof content === 'string' ? content.substring(0, 15000) : JSON.stringify(content).substring(0, 15000)}\n\nQuestion: ${question}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an intelligent document Q&A assistant optimized for Android TV display.',
        },
      });

      res.json({ answer: response.text || 'No answer generated.' });
    } catch (error: any) {
      console.error('Gemini QA error:', error);
      res.status(500).json({ error: error.message || 'Failed to answer question' });
    }
  });

  app.post('/api/gemini/edit-assist', async (req, res) => {
    try {
      const { text, action, prompt: customPrompt } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'Text content is required' });
      }

      let systemPrompt = 'You are an expert AI writing assistant for text editing on Android TV.';
      let userPrompt = '';

      if (action === 'proofread') {
        userPrompt = `Proofread and fix grammar/spelling in the following text, keeping the original tone and format:\n\n${text}`;
      } else if (action === 'expand') {
        userPrompt = `Expand and elaborate on the following text with professional details:\n\n${text}`;
      } else if (action === 'summarize') {
        userPrompt = `Provide a concise summary of the following text:\n\n${text}`;
      } else if (action === 'custom' && customPrompt) {
        userPrompt = `Perform the following instruction on the text: "${customPrompt}"\n\nText:\n${text}`;
      } else {
        userPrompt = `Improve the following text:\n\n${text}`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
        },
      });

      res.json({ result: response.text || text });
    } catch (error: any) {
      console.error('Gemini edit assist error:', error);
      res.status(500).json({ error: error.message || 'Failed to process text' });
    }
  });

  // Vite middleware setup
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, server.js is inside dist/ along with the assets
    app.use(express.static(__dirname));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Leanback Docs TV server running on http://0.0.0.0:${port}`);
  });
}

startServer();
