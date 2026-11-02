import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import multer from 'multer';
import fs from 'fs';
import SMB2 from 'smb2';

dotenv.config();

// Support both ESM (dev) and CJS (bundled)
const isESM = typeof import.meta.url !== 'undefined';
const __filename_res = isESM ? fileURLToPath(import.meta.url) : __filename;
const __dirname_res = isESM ? path.dirname(__filename_res) : __dirname;

const upload = multer({ dest: 'uploads/' });

// Create uploads dir if not exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));

  // Log startup mode
  const isProduction = process.env.NODE_ENV === 'production';
  console.log(`Starting Leanback Docs TV server in ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} mode`);

  // Initialize Gemini AI SDK
  const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

  // --- SMB Proxy Routes ---
  app.post('/api/smb/list', async (req, res) => {
    const { share, domain, username, password, path: smbPath } = req.body;
    try {
      const smb2Client = new SMB2({
        share,
        domain,
        username,
        password,
        autoCloseTimeout: 0
      });

      smb2Client.readdir(smbPath || '', (err: any, files: any) => {
        if (err) {
          console.error('SMB error:', err);
          return res.status(500).json({ error: err.message });
        }
        res.json({ files });
        smb2Client.disconnect();
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/smb/read', async (req, res) => {
    const { share, domain, username, password, path: smbPath } = req.body;
    try {
      const smb2Client = new SMB2({
        share,
        domain,
        username,
        password,
        autoCloseTimeout: 0
      });

      smb2Client.readFile(smbPath, (err: any, data: any) => {
        if (err) {
          console.error('SMB error:', err);
          return res.status(500).json({ error: err.message });
        }
        res.json({ content: data.toString('base64') });
        smb2Client.disconnect();
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- File Upload & Transfer ---
  app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    // Rename file to original name for easier tracking
    const targetPath = path.join('uploads', req.file.originalname);
    fs.renameSync(req.file.path, targetPath);
    res.json({ message: 'File received', filename: req.file.originalname });
  });

  app.get('/api/transfers', (req, res) => {
    try {
      const files = fs.readdirSync('uploads');
      const stats = files.map(f => {
        const s = fs.statSync(path.join('uploads', f));
        return {
          name: f,
          size: s.size,
          createdAt: s.birthtime
        };
      });
      res.json({ transfers: stats });
    } catch (err) {
      res.status(500).json({ error: 'Failed to list transfers' });
    }
  });

  app.get('/api/transfers/:filename', (req, res) => {
    const filePath = path.join('uploads', req.params.filename);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath);
      res.json({ content: data.toString('base64') });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  });

  // --- Gemini AI Routes ---
  app.post('/api/gemini/summarize', async (req, res) => {
    try {
      const { documentTitle, documentType, content } = req.body;
      if (!content) return res.status(400).json({ error: 'Document content is required' });

      const prompt = `Provide a structured summary of the following ${documentType.toUpperCase()} document titled "${documentTitle}". Include key takeaways, main sections or data points, and executive notes suitable for an Android TV viewer.\n\nContent:\n${typeof content === 'string' ? content.substring(0, 15000) : JSON.stringify(content).substring(0, 15000)}`;
      const model = ai.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        systemInstruction: 'You are an expert AI document assistant for an Android TV productivity app. Provide clear, well-formatted summaries with bullet points.',
      });
      const result = await model.generateContent(prompt);
      res.json({ summary: result.response.text() || 'No summary generated.' });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to generate summary' });
    }
  });

  app.post('/api/gemini/qa', async (req, res) => {
    try {
      const { documentTitle, documentType, content, question } = req.body;
      if (!question || !content) return res.status(400).json({ error: 'Question and content are required' });

      const prompt = `Based on the following ${documentType.toUpperCase()} document titled "${documentTitle}", answer the user's question clearly and concisely.\n\nDocument Content:\n${typeof content === 'string' ? content.substring(0, 15000) : JSON.stringify(content).substring(0, 15000)}\n\nQuestion: ${question}`;
      const model = ai.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        systemInstruction: 'You are an intelligent document Q&A assistant optimized for Android TV display.',
      });
      const result = await model.generateContent(prompt);
      res.json({ answer: result.response.text() || 'No answer generated.' });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to answer question' });
    }
  });

  // Vite middleware setup
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(__dirname_res));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname_res, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Leanback Docs TV server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('CRITICAL: Failed to start server:', err);
  process.exit(1);
});
