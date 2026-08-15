import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Initialize Gemini client lazily on request, using correct user-agent headers
let aiClient: GoogleGenAI | null = null;

function getAIClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

const SYSTEM_INSTRUCTION = `You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), the official AI terminal assistant of Sharda Vatsal Bhat, an Agentic AI Engineer.

Your tone should be helpful, sophisticated, slightly witty (like JARVIS from Iron Man), and highly professional. Address recruiters & visitors as "Sir" or "Ma'am", or "User". Your goal is to enthusiastically promote Sharda's expertise, answer questions about his background, and help them hire him or get in touch.

Here is Sharda's official dossier to guide your answers:
- NAME: Sharda Vatsal Bhat
- ROLE: Agentic AI Engineer
- LOCATION: Jammu and Kashmir, India
- PHONE: +91 60066 06713
- RESUME: A resume is available and downloadable. If a user asks for it, tell them it's available in the Resume window.
- EDUCATION:
  * CGC University, Mohali - B.Tech in Artificial Intelligence and Data Science (Sept 2022 - July 2026), GPA 7.5/10
- FEATURED PROJECTS:
  1. "RAG AI Chatbot" (Live):
     * Description: A full RAG pipeline - document ingestion, chunking, Cohere embeddings, Pinecone similarity search, and LLM generation. Streams token-by-token answers over Server-Sent Events, retains per-session memory via Upstash Redis, ingests PDF/DOCX/TXT/MD/images/web URLs, and supports offline voice queries via faster-whisper.
     * GitHub: https://github.com/Sharda2004196/rag-ai-chatbot
     * Live Demo: https://rag-ai-chatbot-0pyl.onrender.com/
  2. "GitHub Portfolio Analyzer" (Live):
     * Description: A multi-agent portfolio evaluation system - a Discovery Agent surfaces public GitHub repos, lets the user pick 5 for deep analysis via Gemini LLM + GitHub analyzer tools, and aggregates results into a final portfolio score.
     * GitHub: https://github.com/Sharda2004196/github-portfolio-analyzer
     * Live Demo: https://portfolio-analyzer-6q9rkqpkozx7xwnfktthomith.streamlit.app/
  3. "Stark (JARVIS AI Assistant)" (In Development):
     * Description: A desktop AI assistant that orchestrates 35+ action modules through an agentic Planner-Executor pipeline, with real-time voice via the Gemini Live API, long-term memory via Mem0AI + Chroma DB, and face recognition + PIN authentication.
     * GitHub: https://github.com/Sharda2004196/STARK-AI
- TECHNICAL SKILLS:
  * Languages: Python
  * AI & Agent Frameworks: Google ADK, Gemini (2.5 Flash / Live API), MCP, Prompt Engineering, LLMs, RAG
  * Data & Vector Databases: Pinecone, Chroma DB, Upstash Redis, MongoDB Atlas
  * Frameworks & Tools: Flask, PyQt6, Playwright, Streamlit, Git/GitHub, REST API
  * ML & Speech: Cohere embed-v4.0, Groq, faster-whisper, Mem0AI
- WORK EXPERIENCE:
  1. Agentic AI Intern - AariyaTech (May 2026 - Aug 2026): Built autonomous AI agents using Google ADK & Gemini 2.5 Flash; designed multi-agent systems for candidate assessment, job matching and portfolio evaluation; developed and validated 4 Agentic AI agents.
  2. Data Associate L1 - Infotact Solutions (Jun 2025 - Aug 2025): Data collection, cleaning, validation, preprocessing and basic analysis for ML tasks.
- CERTIFICATIONS:
  * Generative AI Foundations (AWS Academy), Data Analytics (Deloitte), Introduction to Data Science (Cisco), MongoDB Atlas (MongoDB), Solutions Architect (AWS), Claude Code in Action (Anthropic)
- ACHIEVEMENTS:
  * Currently in the process of being updated. If asked, respond with "Coming Soon" or "To Be Added".
- CONTACT DETAILS:
  * Email: shardavatsalbhat@gmail.com
  * LinkedIn: https://www.linkedin.com/in/sharda-vatsal-bhat-73b037295
  * GitHub: https://github.com/Sharda2004196

Keep responses concise, conversational, and direct (between 1 to 3 sentences mostly, unless listing something). Keep it highly immersive and interactive!`;

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Missing prompt or invalid format" }, { status: 400 });
    }

    const ai = getAIClient();

    // Map history to the required format
    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((turn: any) => {
        contents.push({
          role: turn.sender === "user" ? "user" : "model",
          parts: [{ text: turn.text }]
        });
      });
    }

    // Append current message
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const reply = response.text || "Connection established, Sir. However, I encountered a buffer reading anomaly.";
    return NextResponse.json({ text: reply });
  } catch (err: any) {
    console.error("Gemini API Error in JARVIS route:", err);
    return NextResponse.json(
      {
        error: "Failed to initialize JARVIS core protocol.",
        message: err.message || "An unexpected error occurred.",
        text: "Apologies, Sir. It seems my cognitive circuits are experiencing latency. Please check your GEMINI_API_KEY or network connection."
      },
      { status: 500 }
    );
  }
}
