import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Deterministic fallback generator
function getFallbackPersonality(amount: number, transactionCount: number): string {
  if (transactionCount === 1) {
    return 'Welcome! Your first transaction. 🎉';
  }
  if (transactionCount > 3) {
    return "You're back again? Our favorite VIP customer! 😏";
  }
  if (amount < 10) {
    return 'Nice and easy. 😎';
  }
  if (amount >= 45 && amount <= 55) {
    return '$50? Someone is shopping today! 👀';
  }
  if (amount >= 100) {
    return 'Whoa! BIG transaction detected! 💸';
  }
  const alternatives = [
    'Crisp and clean transaction! ✨',
    'Cha-ching! Fresh receipt dispensed. 🧾',
    'Smooth payment verified. 🌟',
  ];
  return alternatives[Math.floor(Math.random() * alternatives.length)];
}

// API Health Check
app.get('/api/health', (_req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({
    status: 'ok',
    aiConfigured: hasKey,
  });
});

// Circuit breaker for temporary API outages (e.g. 503 high demand spikes)
let lastApiCooldownUntil = 0;

// API: Checkout Personality Generator
app.post('/api/checkout-personality', async (req, res) => {
  const { amount = 5, paymentMethod = 'Visa Card', transactionCount = 1 } = req.body || {};
  const parsedAmount = Number(amount) || 5;
  const count = Number(transactionCount) || 1;

  const client = getAIClient();

  // If client unavailable or circuit breaker active due to recent upstream 503
  if (!client || Date.now() < lastApiCooldownUntil) {
    return res.json({
      message: getFallbackPersonality(parsedAmount, count),
      source: 'deterministic',
    });
  }

  try {
    const prompt = `You are the witty, friendly voice of a stylish retro-futuristic checkout machine. A customer just completed an in-store order.
Transaction Details:
- Amount: $${parsedAmount.toFixed(2)}
- Payment Method: ${paymentMethod}
- Total Transactions Completed Today: ${count}

Generate ONE short, funny/friendly reaction message from the machine.
Rules:
- Maximum 60 characters total.
- Exactly 1 relevant emoji.
- Be playful, warm, or humorous.
- Return ONLY the exact message text, no quotation marks, no surrounding prose.`;

    const result = await Promise.race([
      client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          maxOutputTokens: 50,
          temperature: 0.8,
        },
      }),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('AI generation timed out')), 2200)
      ),
    ]);

    const generatedText = (result as any)?.text?.trim();
    if (generatedText && generatedText.length <= 80) {
      // Clean quotes if any
      const cleaned = generatedText.replace(/^["']|["']$/g, '').trim();
      return res.json({
        message: cleaned,
        source: 'gemini',
      });
    }

    return res.json({
      message: getFallbackPersonality(parsedAmount, count),
      source: 'fallback',
    });
  } catch (error: any) {
    // If upstream model has a temporary 503 or demand spike, pause calls for 60s
    if (error?.status === 503 || error?.message?.includes('503') || error?.message?.includes('high demand')) {
      lastApiCooldownUntil = Date.now() + 60000;
    }
    // Return deterministic fallback smoothly without crashing or polluting stderr
    return res.json({
      message: getFallbackPersonality(parsedAmount, count),
      source: 'fallback',
    });
  }
});

// Setup Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Checkout server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
