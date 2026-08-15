<div align="center">

<img src="app/icon.svg" width="56" height="56" alt="Portfolio OS icon" />

# Portfolio OS

**An interactive, desktop-inspired portfolio operating system**

Built by **[Sharda Vatsal Bhat](https://www.linkedin.com/in/sharda-vatsal-bhat-73b037295)** · Agentic AI Engineer

![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_API-8E75B2?style=flat-square&logo=googlegemini&logoColor=white)

[![Live Demo](https://img.shields.io/badge/Live_Demo-Coming_Soon-00D4FF?style=for-the-badge&logo=vercel&logoColor=white)](https://your-live-demo-url.vercel.app)

</div>

---

## 🌐 Live Demo

The portfolio is deployed and available at:

```
https://your-live-demo-url.vercel.app
```

> ⚠️ **Placeholder** — this URL is not live yet. Replace it with the actual deployment URL
> (and update the badge link above) once the app is deployed to Vercel.

---

## ✨ Overview

Portfolio OS is not a typical resume website — it's a fully interactive **operating-system experience** that presents a professional portfolio as a bootable desktop environment. Visitors boot into a custom OS with draggable icons, windowed applications, a macOS-style glass taskbar, a working terminal, and **two Gemini-powered AI assistants** that answer questions about the portfolio in real time.

The result: a memorable, engaging way for recruiters and visitors to explore projects, skills, experience, certifications, and contact details.

---

## 🚀 Features

### 🖥️ The Desktop Experience
- **Boot sequence** — power-on screen that boots into the desktop with synthesized audio
- **Free-position draggable icons** — reposition desktop icons anywhere; positions **persist in `localStorage`**
- **macOS-style glass taskbar** — frosted blur dock with app launcher, system tray (Wi-Fi, volume, clock)
- **3 animated wallpapers** — Aurora gradient, Starfield, and Particle network — switchable live
- **Window management** — open, minimize, drag, and close apps with proper z-ordering

### 📦 Built-in Applications (12+)
| App | Description |
|---|---|
| **About Me** | Bio, education (B.Tech, CGC University Mohali), keywords |
| **AI Projects** | Portfolio of projects with GitHub / live demo links |
| **Resume** | Downloadable resume (`/resume.docx`) |
| **Skills** | Categorized skill matrix |
| **Experience** | Internships at AariyaTech & Infotact Solutions |
| **Certifications** | AWS, Deloitte, Cisco, MongoDB, Anthropic credentials |
| **Achievements** | Honors & recognitions |
| **Contact Me** | Message form + email / phone / social links |
| **Web Browser** | Styled search engine that surfaces GitHub, LinkedIn & project repos |
| **Terminal** | Working CLI (`help`, `about`, `projects`, `github`, `linkedin`, …) |
| **AI Core** | Gemini-powered portfolio assistant — answers visitor questions and can open windows / redirect to profiles |
| **Open Source** | Public GitHub repositories |

### 🤖 AI Assistants
- **AI Core** — a warm, professional assistant that answers questions about Sharda's background and can trigger in-OS actions (`[OPEN_WINDOW:projects]`, `[REDIRECT:github]`, …)
- **JARVIS** — a witty, immersive terminal persona (inspired by Iron Man) for the same knowledge base

### 📱 Responsive
- **Mobile** — apps become full-screen bottom sheets; icon grid + floating pill taskbar
- **Tablet / Desktop** — full desktop layout with draggable windows

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org) (App Router) |
| UI | [React 19](https://react.dev) + [Motion](https://motion.dev) + [Lucide Icons](https://lucide.dev) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Language | [TypeScript 5](https://www.typescriptlang.org) |
| AI | [Google Gemini API](https://ai.google.dev) via `@google/genai` |
| Audio | Web Audio API (synthesized UI sounds — no assets) |

---

## 🏁 Getting Started

### Prerequisites
- **Node.js 18.18+** (Node 20+ recommended)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```
GEMINI_API_KEY=your_gemini_api_key
```

> Get a free API key from [Google AI Studio](https://aistudio.google.com/apikey). This key powers both the **AI Core** and **JARVIS** assistants.

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and boot into the desktop.

### 4. Production build

```bash
npm run build
npm start
```

---

## 💻 Terminal Commands

| Command | Action |
|---|---|
| `help` | List all available commands |
| `about` | Open the About Me window |
| `skills` | Open the Skills window |
| `projects` | Open the AI Projects window |
| `resume` | Open the Resume viewer |
| `experience` | Open the Experience window |
| `certifications` | Open the Certifications window |
| `contact` | Open the Contact window |
| `github` | Open GitHub profile |
| `linkedin` | Open LinkedIn profile |
| `aicore` / `jarvis` | Launch the AI assistant |
| `clear` | Clear the terminal |

---

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── aicore/route.ts      # AI Core — Gemini chat endpoint
│   │   └── jarvis/route.ts      # JARVIS — Gemini chat endpoint
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                 # The entire OS experience (UI + state)
├── components/ui/
│   ├── aurora-background.tsx    # Wallpaper 1 — animated aurora gradient
│   ├── particles-bg.tsx         # Wallpaper 3 — particle network
│   └── starfield-background.tsx # Wallpaper 2 — starfield
├── hooks/
│   └── use-mobile.ts            # Responsive breakpoint hook
├── lib/
│   └── data.ts                  # ✏️ Single source of truth for portfolio data
├── public/
│   ├── avatar.jpg               # Profile photo
│   └── resume.docx              # Downloadable resume
└── .env.local                   # GEMINI_API_KEY (never committed)
```

---

## 🎨 Customization

All portfolio content lives in **one file** — [`lib/data.ts`](lib/data.ts):

- Personal info, bio, education
- Skills categories
- Projects (title, description, status, GitHub/demo links, tags)
- Work experience
- Certifications & achievements
- Contact details (email, phone, LinkedIn, GitHub)

Update the data there and both the UI **and** the AI assistants pick up the changes. For deeper AI-persona tweaks, edit the system prompts in `app/api/aicore/route.ts` and `app/api/jarvis/route.ts`.

---

## ☁️ Deployment

Deploys cleanly to **Vercel** (native Next.js + serverless API routes):

1. Push the repo to GitHub
2. Import the repository at [vercel.com/new](https://vercel.com/new)
3. Add the `GEMINI_API_KEY` environment variable in **Project → Settings → Environment Variables**
4. Deploy ✅

The API routes (`/api/aicore`, `/api/jarvis`) deploy automatically as serverless functions.

---

## 📫 Contact

- **Email:** shardavatsalbhat@gmail.com
- **Phone:** +91 60066 06713
- **GitHub:** [Sharda2004196](https://github.com/Sharda2004196)
- **LinkedIn:** [Sharda Vatsal Bhat](https://www.linkedin.com/in/sharda-vatsal-bhat-73b037295)

---

<div align="center">

**Built with ❤️ by [Sharda Vatsal Bhat](https://github.com/Sharda2004196) — Agentic AI Engineer**

</div>
