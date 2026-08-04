import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Chemistry Assistant endpoint
  app.post("/api/ai/explain", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "Gemini API key is not configured in environment variables."
        });
      }

      const { prompt, moleculeContext } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required." });
      }

      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = `You are an expert Organic Chemistry Professor and IUPAC Nomenclature Tutor.
You provide clear, accurate, concise, and pedagogically sound explanations of organic chemistry naming, IUPAC 2013/1993 rules, locant priority order, stereochemistry (R/S, E/Z), functional group hierarchy, and reaction relevance.
Use clean formatting, markdown bullet points, and chemical notation (e.g. C₁–C₆, 3-hexanol). Keep responses direct and helpful.`;

      let fullPrompt = prompt;
      if (moleculeContext) {
        fullPrompt = `[Current Molecule Context]: ${JSON.stringify(moleculeContext)}\n\n[User Question]: ${prompt}`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: fullPrompt,
        config: {
          systemInstruction,
          temperature: 0.3,
        }
      });

      return res.json({ text: response.text });
    } catch (err: any) {
      console.error("AI Assistant Error:", err);
      return res.status(500).json({
        error: err.message || "Failed to generate AI response"
      });
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Nomenclature Notebook server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
