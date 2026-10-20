export interface Project {
  id: string;
  title: string;
  description: string;
  status: "Live" | "In Development";
  github?: string;
  demo?: string;
  isDesktopApp?: boolean;
  tags: string[];
}

export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface Experience {
  company: string;
  role: string;
  duration: string;
  location: string;
  description: string;
  points: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  date?: string;
}

export interface Achievement {
  title: string;
  organization: string;
  description?: string;
}

export interface Education {
  institution: string;
  degree: string;
  period: string;
  gpa?: string;
  coursework?: string[];
}

export const PORTFOLIO_DATA = {
  personal: {
    name: "Sharda Vatsal Bhat",
    title: "Agentic AI Engineer",
    coreMessage: "Building intelligent systems that reason, retrieve, automate, and act.",
    keywords: ["Agentic AI", "RAG Systems", "AI Automation", "LLM Engineering", "Google ADK", "Gemini"],
    currentRole: "Agentic AI Engineer",
    company: "AariyaTech",
    location: "Jammu & Kashmir, India",
    avatar: "/avatar.png",
    bioShort: "Agentic AI Engineer with hands-on experience building autonomous agents using Google ADK and Gemini.",
    bioLong:
      "Agentic AI Engineer with hands-on experience building autonomous agents using Google ADK and Gemini. Skilled in RAG pipelines, vector databases, and multi-agent system design. Focused on building practical, production-ready AI solutions."
  },

  education: {
    institution: "CGC University Mohali",
    degree: "Bachelor of Technology in Artificial Intelligence and Data Science",
    period: "Sept 2022 – July 2026",
    gpa: "7.95/10",
    coursework: [
      "Computer Architecture",
      "Theory of Automata",
      "Artificial Intelligence",
      "Machine Learning",
      "Big Data",
      "Deep Learning",
      "Data Analytics using R"
    ]
  } as Education,

  skills: [
    {
      category: "Agentic AI",
      skills: ["Google ADK", "Multi-Agent Orchestration", "Prompt Engineering", "MCP"]
    },
    {
      category: "LLM APIs",
      skills: ["Gemini", "Groq"]
    },
    {
      category: "RAG & Retrieval",
      skills: ["Pinecone", "Chroma DB", "Qdrant", "Hybrid Search", "Embeddings", "Reranking"]
    },
    {
      category: "Languages & Backend",
      skills: ["Python", "FastAPI", "REST APIs", "WebSockets", "Pydantic"]
    },
    {
      category: "Data & Auth",
      skills: ["Firebase (Auth, Firestore)", "Redis"]
    },
    {
      category: "Dev Ops & Quality",
      skills: ["Docker", "Git/GitHub", "Render", "Langfuse", "pytest"]
    }
  ] as SkillCategory[],

  projects: [
    {
      id: "rag-chatbot",
      title: "RAG AI Chatbot",
      description:
        "A full RAG pipeline — document ingestion → chunking → Cohere embeddings → Pinecone similarity search → LLM generation. Streams token-by-token answers over Server-Sent Events with a live thinking indicator, retains per-session memory via Upstash Redis, ingests PDF/DOCX/TXT/MD/images/web URLs, and supports offline voice queries via faster-whisper.",
      status: "Live",
      github: "https://github.com/Sharda2004196/rag-ai-chatbot",
      demo: "https://rag-ai-chatbot-0pyl.onrender.com/",
      tags: ["AI", "RAG", "Flask", "Pinecone"]
    },
    {
      id: "portfolio-evaluation-agent",
      title: "Portfolio Evaluation Agent",
      description:
        "A multi-agent portfolio evaluation system from the JobSearchOptimiser agentic platform: a Discovery Agent surfaces all public GitHub repos for a given username, presents the list so the user can select 5 repos for detailed analysis, analyzes the selected repos via Gemini LLM + GitHub analyzer tool, and an aggregator agent combines the per-repo results into a final portfolio score — outputting structured JSON with repo metrics, the aggregated score, and improvement recommendations.",
      status: "Live",
      github: "https://github.com/admin-at-uk/agentic-jso/tree/feature/multirepoanalyzeragent",
      demo: "https://dev.jobsearchoptimiser.com/user/ai-agents/github",
      tags: ["AI", "Agentic", "GitHub", "Multi-Agent"]
    },
    {
      id: "interview-iq",
      title: "Interview IQ",
      description:
        "A multi-agent AI Interviewer built on Google ADK — a root agent with question-generation and evaluation agents mounted as tools. Supports five interview modes (topic, custom questions, resume, uploaded docs, web/YouTube links) grounded by Pinecone RAG, adapts difficulty after every answer and scores each one 0-10 with the overall computed deterministically in code, and streams turns over FastAPI WebSockets to a Next.js client, closing with a hire verdict and a downloadable PDF study report.",
      status: "Live",
      github: "https://github.com/Sharda2004196/Interview-IQ",
      demo: "https://interviewiq-frontend-pxp5.onrender.com/",
      tags: ["AI", "Agentic", "Google ADK", "Interview"]
    },
    {
      id: "jarvis-assistant",
      title: "Stark (JARVIS AI Assistant)",
      description:
        "A desktop AI assistant that orchestrates 35+ action modules through an agentic Planner-Executor pipeline. Delivers real-time voice conversations via the Gemini Live API, retains long-term memory with Mem0AI + Chroma DB, ships with auto-updates and a managed Python runtime, and secures access with face recognition and PIN fallback.",
      status: "In Development",
      github: "https://github.com/Sharda2004196/STARK-AI",
      isDesktopApp: true,
      tags: ["AI", "Agentic", "Desktop", "Voice"]
    }
  ] as Project[],

  experience: [
    {
      company: "AariyaTech",
      role: "Agentic AI Engineer",
      duration: "May 2026 – October 2026",
      location: "",
      description:
        "Built autonomous AI agents using Google ADK & Gemini 2.5 Flash for task automation and workflow orchestration.",
      points: [
        "Built Autonomous AI agents using Google ADK & Gemini 2.5 Flash for task automation and workflow orchestration.",
        "Designed multi-agent systems for candidate assessment, job matching and portfolio evaluation, integrating GitHub API and REST API calls.",
        "Developed and validated 4 Agentic AI agents (Portfolio, Job Recommendation, Job Trends, Candidate Assessment) with workflow design and end-to-end testing."
      ]
    },
    {
      company: "Infotact Solutions",
      role: "Data Associate L1",
      duration: "Jun 2025 – August 2025",
      location: "",
      description: "",
      points: [
        "Worked on data collection, cleaning, and validation to ensure high-quality datasets.",
        "Performed data preprocessing and basic analysis to support downstream analytics and ML tasks.",
        "Maintained data accuracy and consistency across structured datasets."
      ]
    }
  ] as Experience[],

  certifications: [
    { name: "Generative AI Foundations", issuer: "AWS Academy" },
    { name: "Data Analytics", issuer: "Deloitte" },
    { name: "Introduction to Data Science", issuer: "Cisco" },
    { name: "MongoDB Atlas", issuer: "MongoDB" },
    { name: "Solutions Architect", issuer: "AWS" },
    { name: "Claude Code in Action", issuer: "Anthropic" }
  ] as Certification[],

  achievements: [] as Achievement[],

  contact: {
    email: "shardavatsalbhat@gmail.com",
    linkedin: "https://www.linkedin.com/in/sharda-vatsal-bhat-73b037295",
    github: "https://github.com/Sharda2004196",
    phone: "+91-6006606713"
  }
};
