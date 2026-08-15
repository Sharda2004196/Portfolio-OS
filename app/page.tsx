"use client";

import React, { useState, useEffect, useRef, useCallback, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Terminal as TerminalIcon,
  User,
  Code2,
  FileText,
  Briefcase,
  Award,
  ShieldCheck,
  Mail,
  Github,
  Linkedin,
  Cpu,
  Layers,
  Search,
  X,
  Minus,
  ChevronRight,
  Send,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Clock,
  Power,
  RefreshCw,
  FolderOpen,
  Download,
  ExternalLink,
  Check,
  Folder,
  Globe,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  GraduationCap
} from "lucide-react";
import { PORTFOLIO_DATA, Project, SkillCategory, Experience as ExpType, Certification, Achievement } from "@/lib/data";
import ParticlesBackground from "@/components/ui/particles-bg";
import AuroraBackground from "@/components/ui/aurora-background";
import StarfieldBackground from "@/components/ui/starfield-background";
import Image from "next/image";

// Type definitions for OS state
interface AppWindow {
  id: string;
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
  width: string; // default width
  height: string; // default height
}

// Realistic wallpaper themes. Each entry declares its own animated background:
//  - kind "aurora"    → animated aurora gradient (wallpaper 1)
//  - kind "particles" → particles.js field (wallpapers 2 & 3)
// Module scope keeps these objects stable across re-renders so the background
// field never resets on a click (the colors prop keeps its reference).
type Wallpaper =
  | {
      name: string;
      kind: "aurora";
      class: string;
      auroraColors: [string, string];
      starCount: number;
      pulseDuration: number;
    }
  | {
      name: string;
      kind: "starfield";
      class: string;
    }
  | {
      name: string;
      kind: "particles";
      class: string;
      particles: string;
      lines: string;
      accent: string;
    };

const wallpapers: Wallpaper[] = [
  {
    name: "Iris Dusk",
    kind: "aurora",
    class: "bg-[#05010f]",
    auroraColors: ["rgba(168, 85, 247, 0.25)", "rgba(99, 102, 241, 0.22)"] as [string, string],
    starCount: 60,
    pulseDuration: 10
  },
  {
    name: "Velvet Plum",
    kind: "starfield",
    class: "bg-[#0a0a0f]"
  },
  {
    name: "Midnight Aurora",
    kind: "particles",
    class: "bg-gradient-to-br from-[#0d1033] via-[#232058] to-[#0b0b26]",
    particles: "#a5b4fc",
    lines: "#22d3ee",
    accent: "#818cf8"
  }
];

// ----------------------------------------------------
// Desktop shortcuts — shared by the desktop icon field and the mobile grid.
// ----------------------------------------------------
interface DesktopShortcut {
  id: string;
  title: string;
  type: "folder" | "app" | "link";
  icon?: React.ReactNode;
  url?: string;
}

const DESKTOP_SHORTCUTS: DesktopShortcut[] = [
  { id: "projects", title: "AI Projects", type: "folder" },
  { id: "opensource", title: "Open Source", type: "folder" },
  { id: "certifications", title: "Certifications", type: "folder" },
  { id: "experience", title: "Experience", type: "folder" },
  { id: "browser", title: "Browser", type: "app", icon: <Globe className="w-5 h-5 text-teal-400" /> },
  { id: "contact", title: "Contact Me", type: "app", icon: <Mail className="w-5 h-5 text-rose-400" /> },
  { id: "resume", title: "Resume.pdf", type: "app", icon: <FileText className="w-5 h-5 text-[#FF5A5F]" /> },
  { id: "about", title: "About-Me.txt", type: "app", icon: <User className="w-5 h-5 text-sky-400" /> },
  { id: "github", title: "GitHub", type: "link", url: PORTFOLIO_DATA.contact.github, icon: <Github className="w-5 h-5 text-white" /> },
  { id: "linkedin", title: "LinkedIn", type: "link", url: PORTFOLIO_DATA.contact.linkedin, icon: <Linkedin className="w-5 h-5 text-[#0A66C2]" /> },
  { id: "terminal", title: "Terminal.exe", type: "app", icon: <TerminalIcon className="w-5 h-5 text-green-400" /> },
  { id: "aicore", title: "AI Core", type: "app", icon: <Cpu className="w-5 h-5 text-cyan-400" /> }
];

// ----------------------------------------------------
// Free-position desktop icons: positions live in a tiny external store and
// persist to localStorage so icons stay where the visitor left them. The
// store is read via useSyncExternalStore (hydration-safe) and mutated only
// from pointer event handlers (no setState-in-effect).
// ----------------------------------------------------
interface IconPosition {
  x: number;
  y: number;
}

const ICON_POSITIONS_KEY = "portfolio-os:icon-positions";
const ICON_W = 90;
const ICON_H = 98;
const ICON_COL_GAP = 16;
const ICON_ROW_GAP = 14;
const ICONS_PER_COL = 5;
const EMPTY_ICON_POSITIONS: Record<string, IconPosition> = Object.freeze({});

// Default layout mirrors the original rail: a column grid starting top-left.
function defaultIconPosition(index: number): IconPosition {
  const col = Math.floor(index / ICONS_PER_COL);
  const row = index % ICONS_PER_COL;
  return {
    x: 32 + col * (ICON_W + ICON_COL_GAP),
    y: 72 + row * (ICON_H + ICON_ROW_GAP),
  };
}

let iconPositions: Record<string, IconPosition> = EMPTY_ICON_POSITIONS;
const iconPosListeners = new Set<() => void>();
if (typeof window !== "undefined") {
  try {
    const raw = window.localStorage.getItem(ICON_POSITIONS_KEY);
    iconPositions = raw ? (JSON.parse(raw) as Record<string, IconPosition>) : EMPTY_ICON_POSITIONS;
  } catch {
    iconPositions = EMPTY_ICON_POSITIONS;
  }
}

function subscribeIconPositions(onChange: () => void): () => void {
  iconPosListeners.add(onChange);
  return () => {
    iconPosListeners.delete(onChange);
  };
}

function getIconPositionsSnapshot(): Record<string, IconPosition> {
  return iconPositions;
}

function setIconPosition(id: string, x: number, y: number, persist = true): void {
  iconPositions = { ...iconPositions, [id]: { x, y } };
  if (persist && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(ICON_POSITIONS_KEY, JSON.stringify(iconPositions));
    } catch {
      /* storage unavailable — ignore */
    }
  }
  iconPosListeners.forEach((l) => l());
}

function persistIconPositions(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ICON_POSITIONS_KEY, JSON.stringify(iconPositions));
  } catch {
    /* storage unavailable — ignore */
  }
}

// Shared Web Audio context — created once and reused for every synthesized
// sound. Creating a new AudioContext per sound is the main source of
// click-sound latency, so a single instance is kept for the whole session.
let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!audioCtx) audioCtx = new AudioCtx();
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export default function Home() {
  // ----------------------------------------------------
  // Audio Feedback Synthesizer (AudioContext)
  // ----------------------------------------------------
  const [isMuted, setIsMuted] = useState(false);

  const playSound = useCallback((type: "click" | "open" | "close" | "boot" | "alert") => {
    if (typeof window === "undefined" || isMuted) return;
    try {
      // Reuse the shared AudioContext — creating a new one per sound is the
      // main source of click-sound latency.
      const ctx = getAudioCtx();
      if (!ctx) return;
      
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      if (type === "click") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.04, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === "open") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      } else if (type === "close") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(1400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      } else if (type === "boot") {
        // Futuristic double tone
        osc.type = "triangle";
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
        osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.4);
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
        osc.start();
        osc.stop(ctx.currentTime + 0.65);
      } else if (type === "alert") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(330, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.06, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (_) {
      // Audio failed, ignore gracefully
    }
  }, [isMuted]);

  // ----------------------------------------------------
  // Native States
  // ----------------------------------------------------
  const [bootState, setBootState] = useState<"sequence" | "ready" | "shutdown">("sequence");
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [systemLocalTime, setSystemLocalTime] = useState("");
  
  // Customization States
  const [isOnline, setIsOnline] = useState(true);
  const [wallpaperIndex, setWallpaperIndex] = useState(0);
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const workspaceRef = useRef<HTMLDivElement>(null);

  // Operating system states for active desktop overlays
  const [selectedShortcutId, setSelectedShortcutId] = useState<string | null>(null);
  const [aiCoreTab, setAiCoreTab] = useState("overview");

  // ----------------------------------------------------
  // Free-position desktop icons (drag anywhere on the desktop)
  // ----------------------------------------------------
  const iconPositions = useSyncExternalStore(subscribeIconPositions, getIconPositionsSnapshot, () => EMPTY_ICON_POSITIONS);
  const iconDragRef = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number; moved: boolean } | null>(null);
  const justDraggedRef = useRef(false);

  const handleIconPointerDown = (id: string, e: React.PointerEvent<HTMLDivElement>, pos: IconPosition) => {
    justDraggedRef.current = false;
    iconDragRef.current = { id, startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y, moved: false };

    // Track the drag on window listeners (NOT pointer capture): capturing the
    // pointer would retarget click/dblclick events to this wrapper and break
    // the icon's own click handlers. Window listeners give smooth dragging
    // anywhere on screen while keeping native click/double-click intact.
    const onMove = (ev: PointerEvent) => {
      const drag = iconDragRef.current;
      if (!drag || drag.id !== id) return;
      const dx = ev.clientX - drag.startX;
      const dy = ev.clientY - drag.startY;
      if (!drag.moved && Math.hypot(dx, dy) < 4) return; // still a click
      drag.moved = true;
      const maxX = Math.max(8, window.innerWidth - ICON_W - 20);
      const maxY = Math.max(8, window.innerHeight - ICON_H - 130);
      setIconPosition(
        id,
        Math.min(Math.max(8, drag.origX + dx), maxX),
        Math.min(Math.max(8, drag.origY + dy), maxY),
        false
      );
    };
    const onEnd = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
      handleIconPointerEnd();
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);
  };

  const handleIconPointerEnd = () => {
    if (iconDragRef.current?.moved) {
      justDraggedRef.current = true;
      persistIconPositions();
    }
    iconDragRef.current = null;
  };

  // ----------------------------------------------------
  // Windows Initial Setup (Replacing JARVIS Core with AI Core)
  // ----------------------------------------------------
  const [windows, setWindows] = useState<AppWindow[]>([
    { id: "about", title: "About Me", icon: <User className="w-5 h-5 text-sky-400" />, isOpen: false, isMinimized: false, zIndex: 10, width: "max-w-2xl", height: "max-h-[580px]" },
    { id: "skills", title: "Professional Skills", icon: <Cpu className="w-5 h-5 text-emerald-400" />, isOpen: false, isMinimized: false, zIndex: 10, width: "max-w-2xl", height: "max-h-[560px]" },
    { id: "projects", title: "AI Projects", icon: <Code2 className="w-5 h-5 text-purple-400" />, isOpen: false, isMinimized: false, zIndex: 10, width: "max-w-4xl", height: "max-h-[620px]" },
    { id: "resume", title: "Resume.pdf", icon: <FileText className="w-5 h-5 text-amber-500" />, isOpen: false, isMinimized: false, zIndex: 10, width: "max-w-4xl", height: "max-h-[600px]" },
    { id: "experience", title: "Experience", icon: <Briefcase className="w-5 h-5 text-yellow-400" />, isOpen: false, isMinimized: false, zIndex: 10, width: "max-w-xl", height: "max-h-[520px]" },
    { id: "certifications", title: "Certifications", icon: <ShieldCheck className="w-5 h-5 text-cyan-400" />, isOpen: false, isMinimized: false, zIndex: 10, width: "max-w-lg", height: "max-h-[480px]" },
    { id: "achievements", title: "Achievements", icon: <Award className="w-5 h-5 text-rose-400" />, isOpen: false, isMinimized: false, zIndex: 10, width: "max-w-lg", height: "max-h-[480px]" },
    { id: "contact", title: "Contact Me", icon: <Mail className="w-5 h-5 text-indigo-400" />, isOpen: false, isMinimized: false, zIndex: 10, width: "max-w-xl", height: "max-h-[580px]" },
    { id: "terminal", title: "Terminal.exe", icon: <TerminalIcon className="w-5 h-5 text-green-400" />, isOpen: false, isMinimized: false, zIndex: 10, width: "max-w-3xl", height: "max-h-[500px]" },
    { id: "aicore", title: "AI Core", icon: <Cpu className="w-5 h-5 text-cyan-400" />, isOpen: false, isMinimized: false, zIndex: 10, width: "max-w-3xl", height: "max-h-[640px]" },
    { id: "browser", title: "Web Browser", icon: <Globe className="w-5 h-5 text-sky-400" />, isOpen: false, isMinimized: false, zIndex: 10, width: "max-w-3xl", height: "max-h-[580px]" },
    { id: "opensource", title: "Open Source Contributions", icon: <FolderOpen className="w-5 h-5 text-purple-400" />, isOpen: false, isMinimized: false, zIndex: 10, width: "max-w-2xl", height: "max-h-[520px]" },
  ]);

  const [topZ, setTopZ] = useState(15);

  // ----------------------------------------------------
  // Terminal Custom Logic State
  // ----------------------------------------------------
  const [terminalHistory, setTerminalHistory] = useState<Array<{ text: string; type: "input" | "output" | "error" }>>([
    { text: "Welcome to PortfolioOS [Version 1.0]", type: "output" },
    { text: "Type 'help' to view the available terminal commands.", type: "output" },
    { text: "", type: "output" },
  ]);
  const [terminalInput, setTerminalInput] = useState("");
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  // ----------------------------------------------------
  // JARVIS Core Chat Logic State
  // ----------------------------------------------------
  const [jarvisMessages, setJarvisMessages] = useState<Array<{ text: string; sender: "user" | "jarvis" }>>([
    { text: "Greeting, Sir. J.A.R.V.I.S. terminal online. I am at your command to discuss Sharda's developments, certifications, or facilitate an introduction. What is your query?", sender: "jarvis" }
  ]);
  const [jarvisInput, setJarvisInput] = useState("");
  const [jarvisLoading, setJarvisLoading] = useState(false);
  const jarvisBottomRef = useRef<HTMLDivElement>(null);

  // ----------------------------------------------------
  // AI Core Interactive Portfolio Assistant State
  // ----------------------------------------------------
  const [aiCoreMessages, setAiCoreMessages] = useState<Array<{ text: string; sender: "user" | "aicore" }>>([
    {
      text: "Hello! I am AI Core, your interactive portfolio assistant. I can open relevant windows, redirect you to my profiles, or answer questions about Sharda Vatsal Bhat's skills and live AI projects. How can I help you today?",
      sender: "aicore"
    }
  ]);
  const [aiCoreInput, setAiCoreInput] = useState("");
  const [aiCoreLoading, setAiCoreLoading] = useState(false);
  const aiCoreBottomRef = useRef<HTMLDivElement>(null);

  // ----------------------------------------------------
  // Contact Form Custom State
  // ----------------------------------------------------
  const [formState, setFormState] = useState({ name: "", email: "", msg: "" });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // ----------------------------------------------------
  // Real-time clock and responsiveness
  // ----------------------------------------------------
  useEffect(() => {
    // Check Mobile status
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    // Initialize clock values on mount to prevent SSR hydration mismatch (asynchronously to avoid sync cascading render)
    const initTimer = setTimeout(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      setCurrentDate(now.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }));
      setSystemLocalTime(now.toISOString());
    }, 0);

    // Dynamic Clock
    const timer = setInterval(() => {
      const currentNow = new Date();
      // Format to HH:MM AM/PM
      setCurrentTime(currentNow.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      // Format to MMM DD, YYYY
      setCurrentDate(currentNow.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }));
    }, 1000);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(initTimer);
      clearInterval(timer);
    };
  }, []);

  // ----------------------------------------------------
  // BIOS Boot Logs Trigger Simulator (3 seconds)
  // ----------------------------------------------------
  useEffect(() => {
    if (bootState !== "sequence") return;

    const logList = [
      "Initializing AI Core Bootstrap Loader v1.0.0...",
      "Uncompressing kernel parameters and loading memory maps...",
      "Detected Processor: Dual AMD Core Architecture (Logical-8 Emulated)...",
      "Probing Local Hardware: Framebuffer standard VESA 2048x1536 px...",
      "Spinning up filesystem hooks... [ OK ]",
      "Allocating memory heap at 0x7FFA89B0011C... Done.",
      "Retrieving candidate profiles matching Sharda Vatsal Bhat...",
      "Constructing cognitive AI architectures & LangChain variables...",
      "Synchronizing Model Context Protocol [MCP] subroutines...",
      "Initializing J.A.R.V.I.S Security Shields and Neural Network Nodes...",
      "Establishing connection to Google Gemini models... [ SECURED ]",
      "Launching PortfolioOS Graphical Shell v1.0...",
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logList.length) {
        setBootLogs((prev) => [...prev, logList[currentLogIndex]]);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setBootState("ready");
          playSound("boot");
        }, 500);
      }
    }, 220);

    return () => clearInterval(interval);
    // playSound only changes when isMuted toggles, which is impossible during
    // the boot sequence (full-screen overlay, taskbar not yet mounted), so the
    // boot logs can never restart from this dependency.
  }, [bootState, playSound]);

  // Auto Scroll Terminal to bottom
  useEffect(() => {
    if (terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalHistory]);

  // Auto Scroll JARVIS to bottom
  useEffect(() => {
    if (jarvisBottomRef.current) {
      jarvisBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [jarvisMessages]);

  // Auto Scroll AI Core to bottom
  useEffect(() => {
    if (aiCoreBottomRef.current) {
      aiCoreBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [aiCoreMessages]);

  // ----------------------------------------------------
  // Window Operations
  // ----------------------------------------------------
  const openWindow = (id: string, options?: { silent?: boolean }) => {
    // `silent` is used by desktop icons on double-click: the first click of the
    // pair already played the click sound, so the open must not add a second.
    if (!options?.silent) {
      playSound("open");
    }
    setIsStartOpen(false);
    setIsSearchOpen(false);
    
    const nextZ = topZ + 1;
    setTopZ(nextZ);

    setWindows((prev) =>
      prev.map((win) => {
        if (win.id === id) {
          return { ...win, isOpen: true, isMinimized: false, zIndex: nextZ };
        }
        return win;
      })
    );
  };

  const closeWindow = useCallback((id: string) => {
    playSound("close");
    setWindows((prev) =>
      prev.map((win) => {
        if (win.id === id) {
          return { ...win, isOpen: false };
        }
        return win;
      })
    );
  }, [playSound]);

  const minimizeWindow = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playSound("click");
    setWindows((prev) =>
      prev.map((win) => {
        if (win.id === id) {
          return { ...win, isMinimized: true };
        }
        return win;
      })
    );
  };

  const focusWindow = (id: string) => {
    const nextZ = topZ + 1;
    setTopZ(nextZ);
    setWindows((prev) =>
      prev.map((win) => {
        if (win.id === id) {
          return { ...win, isMinimized: false, zIndex: nextZ };
        }
        return win;
      })
    );
  };

  // Handle ESC or focus-clears
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Find maximum z-index open window and close it
        const openWins = windows.filter((w) => w.isOpen && !w.isMinimized);
        if (openWins.length > 0) {
          const sorted = [...openWins].sort((a, b) => b.zIndex - a.zIndex);
          closeWindow(sorted[0].id);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [windows, closeWindow]);

  // ----------------------------------------------------
  // Terminal Command Parser Engine
  // ----------------------------------------------------
  const executeTerminalCommand = (rawCmd: string) => {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    const parts = cmd.toLowerCase().split(" ");
    const primary = parts[0];
    const args = parts.slice(1);

    const updatedHistory = [...terminalHistory, { text: `C:\\Users\\Recruiter> ${cmd}`, type: "input" as const }];

    let outputLines: Array<{ text: string; type: "output" | "error" }> = [];

    switch (primary) {
      case "help":
        outputLines = [
          { text: "Operating System CLI Console v1.0. Supported commands:", type: "output" },
          { text: "  help            - Lists available terminal commands.", type: "output" },
          { text: "  about           - Opens Sharda's introduction card and runs bio outline.", type: "output" },
          { text: "  skills          - Displays categorized tech competencies.", type: "output" },
          { text: "  projects        - Prints detailed AI project blueprints.", type: "output" },
          { text: "  resume          - Triggers resume window viewer.", type: "output" },
          { text: "  experience      - Shows current intern roles and timelines.", type: "output" },
          { text: "  certifications  - Displays credentials issued to Sharda.", type: "output" },
          { text: "  contact         - Launches contact card inputs.", type: "output" },
          { text: "  github          - Direct link descriptor for GitHub repository.", type: "output" },
          { text: "  linkedin        - Prints professional Sharda Bhat LinkedIn URL.", type: "output" },
          { text: "  aicore          - Displays AI core system specification parameters.", type: "output" },
          { text: "  clear           - Clears terminal output cache logs.", type: "output" },
        ];
        setTerminalHistory([...updatedHistory, ...outputLines]);
        break;

      case "clear":
        setTerminalHistory([]);
        break;

      case "about":
        openWindow("about");
        outputLines = [{ text: "Opening About Me application window...", type: "output" }];
        setTerminalHistory([...updatedHistory, ...outputLines]);
        break;

      case "skills":
        openWindow("skills");
        outputLines = [
          { text: "Opening Skills application. Available sectors:", type: "output" },
          { text: " - Languages: Python, SQL, JS/TS", type: "output" },
          { text: " - AI: Agentic workflows, RAG, LangGraph, MCP Servers, Prompt tuning", type: "output" },
        ];
        setTerminalHistory([...updatedHistory, ...outputLines]);
        break;

      case "projects":
        openWindow("projects");
        outputLines = [
          { text: "Launching Portfolio Projects Explorer. blueprinted repositories:", type: "output" },
          { text: " 1. RAG AI Chatbot (Live / LLaMA 3.3)", type: "output" },
          { text: " 2. GitHub Profile Analyzer (Live)", type: "output" },
          { text: " 3. Stark JARVIS (In-Dev)", type: "output" },
        ];
        setTerminalHistory([...updatedHistory, ...outputLines]);
        break;

      case "resume":
        openWindow("resume");
        outputLines = [{ text: "Launching Resume PDF Viewer...", type: "output" }];
        setTerminalHistory([...updatedHistory, ...outputLines]);
        break;

      case "experience":
        openWindow("experience");
        outputLines = [{ text: "Retrieving AariyaTech Corp internship records...", type: "output" }];
        setTerminalHistory([...updatedHistory, ...outputLines]);
        break;

      case "certifications":
        openWindow("certifications");
        outputLines = [
          { text: "Parsing credentials file...", type: "output" },
          { text: " - Claude Code in Action", type: "output" },
          { text: " - Data Science Introductions", type: "output" },
          { text: " - AWS Generative AI Foundations", type: "output" },
        ];
        setTerminalHistory([...updatedHistory, ...outputLines]);
        break;

      case "contact":
        openWindow("contact");
        outputLines = [{ text: "Launching secure messaging nodes...", type: "output" }];
        setTerminalHistory([...updatedHistory, ...outputLines]);
        break;

      case "linkedin":
        outputLines = [
          { text: "LinkedIn Profile Node Registered:", type: "output" },
          { text: ` URL: ${PORTFOLIO_DATA.contact.linkedin}`, type: "output" },
        ];
        setTerminalHistory([...updatedHistory, ...outputLines]);
        window.open(PORTFOLIO_DATA.contact.linkedin, "_blank", "noopener,noreferrer");
        break;

      case "github":
        outputLines = [
          { text: "GitHub Source Repository Node:", type: "output" },
          { text: ` URL: ${PORTFOLIO_DATA.contact.github}`, type: "output" },
        ];
        setTerminalHistory([...updatedHistory, ...outputLines]);
        window.open(PORTFOLIO_DATA.contact.github, "_blank", "noopener,noreferrer");
        break;

      case "aicore":
      case "jarvis":
        openWindow("aicore");
        outputLines = [{ text: "Launching AI Core diagnostic matrix metrics specifications...", type: "output" }];
        setTerminalHistory([...updatedHistory, ...outputLines]);
        break;

      default:
        outputLines = [
          { text: `Command Not Found: '${primary}' is not recognized as an internal or external OS command.`, type: "error" },
          { text: "Type 'help' to check the list of available scripts.", type: "output" },
        ];
        setTerminalHistory([...updatedHistory, ...outputLines]);
        break;
    }
    setTerminalInput("");
  };

  // ----------------------------------------------------
  // AI Core Interactive Portfolio Assistant Submission
  // ----------------------------------------------------
  const handleAiCoreSubmitCustom = async (queryText: string) => {
    if (!queryText.trim() || aiCoreLoading) return;
    
    const userQuery = queryText.trim();
    setAiCoreMessages((prev) => [...prev, { text: userQuery, sender: "user" }]);
    setAiCoreInput("");
    setAiCoreLoading(true);
    playSound("click");

    try {
      const historyPayload = aiCoreMessages.slice(-8);
      const res = await fetch("/api/aicore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userQuery, history: historyPayload }),
      });
      const data = await res.json();
      
      let rawText = data.text || "Hello! It seems I encountered a loading latency. Please try again.";
      
      // Parse bracket control tags [OPEN_WINDOW:id] or [REDIRECT:dest]
      const matchWindow = rawText.match(/\[OPEN_WINDOW:([a-zA-Z0-9_-]+)\]/);
      if (matchWindow) {
        const windowId = matchWindow[1];
        setTimeout(() => {
          openWindow(windowId);
        }, 300);
      }

      const matchRedirect = rawText.match(/\[REDIRECT:([a-zA-Z0-9_-]+)\]/);
      if (matchRedirect) {
        const dest = matchRedirect[1];
        setTimeout(() => {
          if (dest === "github") {
            window.open("https://github.com/Sharda2004196", "_blank", "noopener,noreferrer");
          } else if (dest === "linkedin") {
            window.open("https://www.linkedin.com/in/sharda-vatsal-bhat-73b037295", "_blank", "noopener,noreferrer");
          } else if (dest === "email" || dest === "contact") {
            openWindow("contact");
          }
        }, 500);
      }

      // Clean the display text of control tags
      const cleanReply = rawText.replace(/\[OPEN_WINDOW:.*?\]/g, "").replace(/\[REDIRECT:.*?\]/g, "").trim();
      
      setAiCoreMessages((prev) => [...prev, { text: cleanReply, sender: "aicore" }]);
      playSound("click");
    } catch (_) {
      setAiCoreMessages((prev) => [
        ...prev,
        { text: "My apologies. I'm currently experiencing a connection latency. Please verify that your GEMINI_API_KEY is properly initialized in settings.", sender: "aicore" }
      ]);
      playSound("alert");
    } finally {
      setAiCoreLoading(false);
    }
  };

  const handleAiCoreFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAiCoreSubmitCustom(aiCoreInput);
  };

  // ----------------------------------------------------
  // Interactive System Diagnostics Submissions
  // ----------------------------------------------------
  const handleJarvisSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jarvisInput.trim() || jarvisLoading) return;
    
    const userQuery = jarvisInput.trim();
    setJarvisMessages((prev) => [...prev, { text: userQuery, sender: "user" }]);
    setJarvisInput("");
    setJarvisLoading(true);
    playSound("click");

    try {
      // Map previous messages as simple history structure
      const historyPayload = jarvisMessages.slice(-8); // send last 8 turns as context
      const res = await fetch("/api/jarvis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userQuery, history: historyPayload }),
      });
      const data = await res.json();
      
      setJarvisMessages((prev) => [...prev, { text: data.text || "My neural links seem to have expired briefly.", sender: "jarvis" }]);
    } catch (_) {
      setJarvisMessages((prev) => [
        ...prev,
        { text: "Sir, I am unable to configure a routing tunnel right now. Please verify your GEMINI_API_KEY environment configuration in settings.", sender: "jarvis" }
      ]);
      playSound("alert");
    } finally {
      setJarvisLoading(false);
    }
  };

  // ----------------------------------------------------
  // Contact Form Submission
  // ----------------------------------------------------
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.msg) {
      playSound("alert");
      return;
    }

    setFormLoading(true);
    setFormError(null);
    playSound("click");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Message could not be delivered.");
      }
      setFormSubmitted(true);
      playSound("open");
      setTerminalHistory((prev) => [
        ...prev,
        { text: `SYSTEM: Received incoming communication packet from ${formState.name} (${formState.email}). Packet routed to owner inbox.`, type: "output" }
      ]);
    } catch (err: any) {
      console.error("Contact form error:", err);
      playSound("alert");
      setFormError(err?.message || "Message could not be delivered. Please try again.");
      setTerminalHistory((prev) => [
        ...prev,
        { text: `SYSTEM: ERROR — communication packet from ${formState.name} could not be routed. Check configuration and retry.`, type: "error" }
      ]);
    } finally {
      setFormLoading(false);
    }
  };

  // Filter application window by search query
  const filteredApps = windows.filter(
    (app) =>
      app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Current wallpaper (stable module-scope reference, drives the animated background)
  const activeWallpaper = wallpapers[wallpaperIndex];

  return (
    <div id="portfolio-os-root" className={`relative w-screen h-screen overflow-hidden ${activeWallpaper.class} transition-all duration-700`}>
      
      {/* Animated background layer (changes with the wallpaper switcher) */}
      {activeWallpaper.kind === "aurora" ? (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <AuroraBackground
            gradientColors={activeWallpaper.auroraColors}
            starCount={activeWallpaper.starCount}
            pulseDuration={activeWallpaper.pulseDuration}
            className="w-full h-full"
          />
        </div>
      ) : activeWallpaper.kind === "starfield" ? (
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Starfield warp (wallpaper 2) — drifting stars with nebula glow + vignette */}
          <StarfieldBackground className="w-full h-full" />
        </div>
      ) : (
        <ParticlesBackground colors={activeWallpaper} />
      )}

      {/* ----------------------------------------------------
          SECTION 1: boot Loader Sequencer (Hacker Bios style)
          ---------------------------------------------------- */}
      <AnimatePresence>
        {bootState === "sequence" && (
          <motion.div
            id="boot-sequence-overlay"
            key="boot"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 z-50 bg-[#02020a] font-mono text-xs text-green-400 p-8 flex flex-col justify-between select-text"
          >
            <div className="max-w-4xl mx-auto w-full flex-1 overflow-y-auto space-y-1">
              <div className="text-gray-400 border-b border-gray-800 pb-2 mb-4 flex justify-between">
                <span>PORTFOLIO OS [BIOS v1.12.98]</span>
                <span>SYSTEM LOCALTIME: {systemLocalTime || "LOADING..."}</span>
              </div>
              <div className="text-lg font-bold text-white mb-2 font-display">
                SHARDA_VATSAL_BHAT PROCESS EXECUTION CORE
              </div>
              
              {bootLogs.map((log, i) => (
                <div key={i} className="flex space-x-2 items-start">
                  <span className="text-gray-600">[{1000 + i * 24}]</span>
                  <p>{log}</p>
                </div>
              ))}
              
              <div className="w-2 h-4 bg-green-400 terminal-cursor inline-block mt-2"></div>
            </div>
            
            <div className="max-w-4xl mx-auto w-full text-gray-500 text-[10px] flex justify-between border-t border-gray-900 pt-2">
              <span>CPU COMPATIBLE: AMD_64 / CLD_RUN</span>
              <span>HOST SERVER PORT: 3000 (VERCEL_TUNNEL)</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ----------------------------------------------------
          SECTION 2: SHUTDOWN / BLANK BLACK Screen OS overlay
          ---------------------------------------------------- */}
      <AnimatePresence>
        {bootState === "shutdown" && (
          <motion.div
            id="shutdown-overlay"
            key="shutdown"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center font-mono space-y-4"
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="w-10 h-10 border-2 border-t-sky-500 border-r-sky-500 border-b-transparent border-l-transparent rounded-full"
            ></motion.div>
            <p className="text-gray-400 text-sm">Saving virtual registry files...</p>
            <p className="text-white font-medium text-lg font-display">Shutting down PortfolioOS...</p>
            <button
              id="boot-btn"
              onClick={() => {
                setBootState("sequence");
                setBootLogs([]);
              }}
              className="mt-6 px-4 py-2 bg-sky-950 hover:bg-sky-900 text-sky-400 border border-sky-800 rounded font-sans text-xs transition-colors"
            >
              Restart Mainframe
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ----------------------------------------------------
          MAIN WORKSPACE LAYOUT (Only shown if boot complete)
          ---------------------------------------------------- */}
      {bootState === "ready" && (
        <div className="w-full h-full flex flex-col justify-between relative" ref={workspaceRef}>
          
          {/* Main Desktop Space */}
          <div id="desktop-grid" className="flex-1 w-full p-4 md:p-6 relative select-none overflow-y-auto flex flex-col md:block pb-28 md:pb-6" onClick={() => setSelectedShortcutId(null)}>
            

            {/* Desktop/Tablet Majestic Centered Hero Description text */}
            <div className="hidden md:flex absolute inset-0 flex-col items-center justify-center text-center select-none pointer-events-none z-0">
              <div className="space-y-4 max-w-2xl animate-[fadeIn_1.2s_ease-out]">
                <h4 className="text-gray-300 font-sans text-sm sm:text-base tracking-wide font-normal opacity-95">
                  Hi, I&apos;m <span className="text-white font-semibold tracking-normal normal-case text-base sm:text-lg">Sharda Vatsal Bhat</span>! welcome to my
                </h4>
                <h1 className="text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-sf italic font-semibold leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-100 to-gray-400">
                  PORTFOLIO
                </h1>
              </div>
            </div>

            {/* Mobile Hero Description */}
            <div className="flex md:hidden flex-col items-center justify-center text-center select-none pointer-events-none z-0 w-full pt-8 px-4 mb-16 shrink-0">
              <div className="space-y-2.5 max-w-sm animate-[fadeIn_1.2s_ease-out]">
                <h4 className="text-gray-300 font-sans text-sm tracking-wide font-normal opacity-95">
                  Hi, I&apos;m <span className="text-white font-semibold tracking-normal normal-case text-sm">Sharda Vatsal Bhat</span>! welcome to my
                </h4>
                <h1 className="text-4xl sm:text-5xl font-sf italic font-semibold leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-100 to-gray-400">
                  PORTFOLIO
                </h1>
              </div>
            </div>

            {/* Desktop shortcuts — free-position icons, drag anywhere on the desktop */}
            <div className="hidden md:block absolute inset-0 z-10 pointer-events-none select-none">
              {DESKTOP_SHORTCUTS.map((shortcut, idx) => {
                const isApp = shortcut.type === "app" || shortcut.type === "folder";
                const appInfo = isApp ? windows.find(w => w.id === shortcut.id) : null;
                const isRunning = isApp ? (appInfo?.isOpen || false) : false;
                const pos = iconPositions[shortcut.id] ?? defaultIconPosition(idx);

                // High fidelity glossy actual Folder graphics
                const renderIcon = () => {
                  if (shortcut.type === "folder") {
                    return (
                      <div className="relative w-10 h-8 flex items-end justify-center">
                        <div className={`absolute top-0 left-1.5 w-4 h-2 bg-gradient-to-r from-sky-400 to-sky-500 rounded-t opacity-90`} />
                        <div className="absolute bottom-0 w-10 h-7 rounded-sm shadow-md bg-gradient-to-b from-sky-300 via-sky-400 to-sky-500 flex items-center justify-center border-t border-sky-200">
                          <div className="absolute inset-[1px] bg-white/10 rounded-sm pointer-events-none" />
                        </div>
                      </div>
                    );
                  }
                  return shortcut.icon;
                };

                return (
                  <div
                    key={shortcut.id}
                    className="absolute pointer-events-auto"
                    style={{ left: pos.x, top: pos.y, touchAction: "none" }}
                    onPointerDown={(e) => handleIconPointerDown(shortcut.id, e, pos)}
                  >
                    <div
                      id={`desktop-icon-${shortcut.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (justDraggedRef.current) {
                          // Click that immediately follows a drag — ignore it so a
                          // moved icon doesn't get selected or play a stray sound.
                          justDraggedRef.current = false;
                          return;
                        }
                        // e.detail === 2 is the second click of a double-click —
                        // suppress its sound so a double-click plays exactly one
                        // click sound (the first click).
                        if (e.detail === 1) {
                          playSound("click");
                        }
                        setSelectedShortcutId(shortcut.id);
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        if (justDraggedRef.current) return;
                        if (shortcut.type === "folder" || shortcut.type === "app") {
                          // The first click already played the sound — open silently
                          // so a double-click produces exactly one sound.
                          openWindow(shortcut.id, { silent: true });
                        } else {
                          window.open(shortcut.url || "", "_blank", "noopener,noreferrer");
                        }
                      }}
                      className={`group flex flex-col items-center justify-center p-1 rounded-lg border transition-all cursor-pointer text-center w-[90px] h-[98px] select-none ${
                        selectedShortcutId === shortcut.id
                          ? "bg-white/15 border-white/25 shadow-[inset_0_0_10px_rgba(255,255,255,0.06)]"
                          : "border-transparent hover:border-white/5 hover:bg-white/5"
                      }`}
                      title={isApp ? "Double-click to expand app — drag to move" : "Double-click to open hyperlink — drag to move"}
                    >
                      {/* Modern digital icon panel */}
                      <div className="relative w-11 h-11 rounded-lg flex items-center justify-center bg-white/[0.02] border border-white/5 transition-all group-hover:scale-105 group-hover:bg-white/10">
                        {renderIcon()}
                        
                        {/* Short cut link marker */}
                        {shortcut.type === "link" && (
                          <span className="absolute bottom-0 right-0 bg-black/90 border border-white/10 text-[7px] text-sky-400 leading-none p-0.5 rounded-br-md font-mono select-none">
                            ↗
                          </span>
                        )}

                        {/* Small blue dot if window is currently running background active */}
                        {isRunning && (
                          <span className="absolute -bottom-1 w-1.5 h-1 bg-[#00D4FF] rounded-full shadow-[0_0_4px_#00D4FF]" />
                        )}
                      </div>
                      
                      {/* Caption title */}
                      <span className="mt-2 text-[10px] text-gray-200 group-hover:text-white font-medium truncate w-full select-none inline-block drop-shadow-[0_2px_2.5px_rgba(0,0,0,0.92)] px-1 leading-tight font-sans">
                        {shortcut.title}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile Desktop Shortcuts Grid */}
            <div className="grid grid-cols-2 min-[420px]:grid-cols-3 gap-4 px-4 pb-28 w-full md:hidden relative z-10 select-none">
              {DESKTOP_SHORTCUTS.map((shortcut) => {
                const isApp = shortcut.type === "app" || shortcut.type === "folder";
                const appInfo = isApp ? windows.find(w => w.id === shortcut.id) : null;
                const isRunning = isApp ? (appInfo?.isOpen || false) : false;

                const renderIcon = () => {
                  if (shortcut.type === "folder") {
                    return (
                      <div className="relative w-8 h-6.5 flex items-end justify-center shrink-0 select-none">
                        <div className={`absolute top-0 left-1 w-3.5 h-1.5 bg-gradient-to-r from-sky-400 to-sky-500 rounded-t opacity-90`} />
                        <div className="absolute bottom-0 w-8 h-5 rounded-sm shadow-md bg-gradient-to-b from-sky-300 via-sky-400 to-sky-500 flex items-center justify-center border-t border-sky-200">
                          <div className="absolute inset-[1px] bg-white/10 rounded-sm pointer-events-none" />
                        </div>
                      </div>
                    );
                  }
                  return <div className="w-4 h-4 flex items-center justify-center text-white shrink-0 select-none">{shortcut.icon}</div>;
                };

                return (
                  <div
                    id={`mobile-desktop-icon-${shortcut.id}`}
                    key={shortcut.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (shortcut.type === "folder" || shortcut.type === "app") {
                        // openWindow plays the open sound — exactly one per tap
                        openWindow(shortcut.id);
                      } else {
                        window.open(shortcut.url || "", "_blank", "noopener,noreferrer");
                        playSound("open");
                      }
                    }}
                    className="flex items-center space-x-2 p-2 rounded-xl bg-white/[0.03] border border-white/5 active:bg-white/10 active:border-[#00D4FF]/30 active:scale-[0.98] transition-all duration-150 cursor-pointer w-full select-none"
                  >
                    <div className="relative w-8.5 h-8.5 rounded-lg flex items-center justify-center bg-white/[0.04] border border-white/10 shrink-0">
                      {renderIcon()}
                      {shortcut.type === "link" && (
                        <span className="absolute bottom-0 right-0 bg-black/85 border border-white/5 text-[5px] text-sky-400 px-0.5 rounded-br-md leading-none">↗</span>
                      )}
                      {isRunning && (
                        <span className="absolute -bottom-0.5 w-1 h-1 bg-[#00D4FF] rounded-full shadow-[0_0_4px_#00D4FF]" />
                      )}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <span className="text-[10.5px] sm:text-xs text-gray-200 font-semibold select-none leading-tight break-words whitespace-normal block">{shortcut.title}</span>
                      <span className="text-[8px] sm:text-[9px] text-gray-400 font-mono tracking-wide block truncate mt-0.5">
                        {shortcut.type === "folder" ? "Folder" : shortcut.type === "app" ? "App" : "Shortcut"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ----------------------------------------------------
                SECTION 3: ACTIVE DRAGGABLE OS WINDOWS (WindowManager)
                ---------------------------------------------------- */}
            <AnimatePresence>
              {windows.map((win) => {
                if (!win.isOpen || win.isMinimized) return null;

                return (
                  <motion.div
                    id={`window-shell-${win.id}`}
                    key={win.id}
                    initial={isMobile ? { y: "100%", opacity: 1 } : { scale: 0.94, opacity: 0 }}
                    animate={isMobile ? { y: 0, opacity: 1 } : { scale: 1, opacity: 1 }}
                    exit={isMobile ? { y: "100%", opacity: 1 } : { scale: 0.94, opacity: 0 }}
                    transition={isMobile ? { type: "spring", damping: 25, stiffness: 220 } : { duration: 0.22 }}
                    // Desktop can drag cleanly using parent workspace constraints
                    drag={!isMobile}
                    dragConstraints={workspaceRef}
                    dragElastic={0.05}
                    dragMomentum={false}
                    onClick={() => focusWindow(win.id)}
                    style={{ zIndex: win.zIndex }}
                    className={`absolute ${
                      isMobile
                        ? "top-0 left-0 w-full h-[calc(100vh-56px)] rounded-t-2xl z-[45]"
                        : `top-6 left-4 sm:top-12 sm:left-12 w-[calc(100vw-96px)] ${win.width} sm:rounded-lg`
                    } ${isMobile ? "h-[calc(100vh-56px)]" : `h-[550px] ${win.height}`} flex flex-col bg-[#0b0e1b]/98 border border-white/10 shadow-2xl overflow-hidden select-text shadow-black/80`}
                  >
                    {/* Modern Windows 11 Flat Title Bar */}
                    <div
                      id={`titlebar-${win.id}`}
                      className={`${isMobile ? "h-11 shadow-sm" : "h-9"} flex items-center justify-between pl-3.5 pr-0 bg-[#121727] border-b border-white/10 drag-handle select-none shrink-0 cursor-grab active:cursor-grabbing`}
                    >
                      {/* Left: Icon and Standard Human-Readable Window Title */}
                      <div className="flex items-center space-x-2 pointer-events-none select-none">
                        <span className="scale-75 select-none">{win.icon}</span>
                        <span className="text-xs font-semibold text-gray-100 font-sans tracking-wide truncate max-w-[120px] sm:max-w-xs">{win.title}</span>
                      </div>
                      
                      {/* Right: Windows Controls Panel with Hover Highlights */}
                      <div className="flex items-center h-full select-none">
                        {!isMobile && (
                          <>
                            {/* Minimize */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                minimizeWindow(win.id, e);
                              }}
                              className="w-11 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                              title="Minimize Window"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        
                        {/* Close Window */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            closeWindow(win.id);
                          }}
                          className={`${isMobile ? "w-14 bg-rose-500/10 active:bg-rose-600 active:text-[#0b0c2a]" : "w-12 hover:bg-rose-600 active:bg-rose-700"} h-full flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer`}
                          title="Close Window"
                        >
                          <X className={`${isMobile ? "w-5 h-5 text-rose-400" : "w-3.5 h-3.5"}`} />
                        </button>
                      </div>
                    </div>

                    {/* Window Content container */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#040612]/92 text-sm leading-relaxed text-gray-300">
                      
                      {/* ABOUT ME APP VIEW */}
                      {win.id === "about" && (
                        <div id="about-app-content" className="space-y-6">
                          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 items-center sm:items-start">
                            {/* Profile Mock Frame */}
                            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border border-[#00D4FF]/40 bg-[#00D4FF]/5 shadow-md shrink-0 select-none">
                              <Image
                                src={PORTFOLIO_DATA.personal.avatar}
                                alt={PORTFOLIO_DATA.personal.name}
                                fill
                                sizes="(min-width: 640px) 128px, 112px"
                                className="object-cover rounded-xl"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 text-[8px] bg-emerald-500/90 text-white rounded font-mono uppercase tracking-wider select-none">
                                SECURE
                              </span>
                            </div>
                            
                            <div className="text-center sm:text-left space-y-2">
                              <h2 className="text-2xl font-bold font-display text-white tracking-tight">
                                {PORTFOLIO_DATA.personal.name}
                              </h2>
                              <p className="text-xs font-mono text-[#00D4FF] uppercase tracking-widest">
                                {PORTFOLIO_DATA.personal.title}
                              </p>
                              
                              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4 select-none">
                                <span className="inline-block px-2.5 py-1 text-xs bg-white/5 border border-white/10 rounded-full text-gray-200">
                                  💼 {PORTFOLIO_DATA.personal.currentRole}
                                </span>
                                <span className="inline-block px-2.5 py-1 text-xs bg-white/5 border border-white/10 rounded-full text-gray-200">
                                  🏢 {PORTFOLIO_DATA.personal.company}
                                </span>
                                <span className="inline-block px-2.5 py-1 text-xs bg-white/5 border border-white/10 rounded-full text-gray-200">
                                  📍 {PORTFOLIO_DATA.personal.location}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4 border-t border-white/10 pt-4">
                            <h3 className="text-base font-semibold font-display text-white tracking-wide">Dossier Overview</h3>
                            <p className="text-gray-300 text-sm leading-relaxed tracking-wide italic bg-blue-950/25 p-3 rounded-lg border border-blue-900/20">
                              &quot;{PORTFOLIO_DATA.personal.bioShort}&quot;
                            </p>
                            <p className="text-gray-400 text-sm leading-relaxed">
                              {PORTFOLIO_DATA.personal.bioLong}
                            </p>
                          </div>

                          {/* EDUCATION */}
                          <div className="space-y-3 border-t border-white/10 pt-4">
                            <h3 className="text-base font-semibold font-display text-white tracking-wide flex items-center space-x-2">
                              <GraduationCap className="w-4 h-4 text-[#00D4FF]/80" />
                              <span>Education</span>
                            </h3>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <div>
                                  <h4 className="text-sm font-bold text-white">{PORTFOLIO_DATA.education.institution}</h4>
                                  <p className="text-xs text-[#00D4FF]/80 font-medium">{PORTFOLIO_DATA.education.degree}</p>
                                </div>
                                <div className="text-left sm:text-right">
                                  <span className="text-xs text-gray-400 font-mono">{PORTFOLIO_DATA.education.period}</span>
                                  {PORTFOLIO_DATA.education.gpa && (
                                    <p className="text-xs text-gray-400 font-mono mt-1">GPA: {PORTFOLIO_DATA.education.gpa}</p>
                                  )}
                                </div>
                              </div>
                              {PORTFOLIO_DATA.education.coursework && PORTFOLIO_DATA.education.coursework.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                  {PORTFOLIO_DATA.education.coursework.map((course, i) => (
                                    <span
                                      key={i}
                                      className="px-2 py-0.5 text-[10px] font-mono rounded bg-white/5 border border-white/10 text-gray-400"
                                    >
                                      {course}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                            {PORTFOLIO_DATA.personal.keywords.map((kw, i) => (
                              <div
                                key={i}
                                className="px-3 py-2 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-xs font-mono text-[#00D4FF] hover:border-[#00D4FF]/30 transition-all"
                              >
                                {kw}
                              </div>
                            ))}
                          </div>

                          <button
                            onClick={() => openWindow("contact")}
                            className="w-full mt-4 py-2.5 rounded-lg bg-gradient-to-r from-sky-500/20 to-purple-500/20 hover:from-sky-500/30 hover:to-purple-500/30 border border-sky-500/30 hover:border-sky-400 text-white font-medium text-xs tracking-wider uppercase transition-all flex items-center justify-center space-x-2"
                          >
                            <span>Request Interview Routing</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* SKILLS APP VIEW */}
                      {win.id === "skills" && (
                        <div id="skills-app-content" className="space-y-6">
                          <p className="text-xs text-gray-400 uppercase tracking-widest font-mono border-b border-white/10 pb-2">
                            SKILL SYSTEM MATRIX INDEX - ACTIVE AGENT BLUEPRINTS
                          </p>
                          
                          <div className="space-y-6">
                            {PORTFOLIO_DATA.skills.map((cat, i) => (
                              <div key={i} className="space-y-2">
                                <h3 className="text-sm font-semibold font-display text-[#00D4FF]/90 uppercase tracking-wider flex items-center space-x-2">
                                  <span className="w-1.5 h-1.5 bg-[#00D4FF] rounded-full shadow-[0_0_4px_#00D4FF]" />
                                  <span>{cat.category}</span>
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                  {cat.skills.map((skill, skIdx) => (
                                    <span
                                      key={skIdx}
                                      className="px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-md text-gray-200 hover:border-[#8B5CF6]/50 hover:bg-[#8B5CF6]/5 hover:text-white transition-all cursor-default font-mono select-none"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/15 flex items-start space-x-3 mt-6">
                            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <h4 className="text-xs font-semibold text-emerald-300 uppercase tracking-wider font-mono">Autonomy Level: Active</h4>
                              <p className="text-xs text-gray-400 leading-relaxed">
                                Tested in distributed environments. Sharda Bhat builds highly compliant, custom Model Context Protocol (MCP) servers and complex multi-agent LangGraph orchestrations.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* PROJECTS APP VIEW */}
                      {win.id === "projects" && (
                        <div id="projects-app-content" className="space-y-6">
                          <p className="text-xs text-gray-400 font-mono tracking-wider border-b border-white/10 pb-2 uppercase">
                            SYSTEM COGNITIVE PROJECTS DIRECTORY — VERSION 1.0
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {PORTFOLIO_DATA.projects.map((proj) => (
                              <div
                                key={proj.id}
                                className="p-5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/[0.08] transition-all flex flex-col justify-between space-y-4 group"
                              >
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <h3 className="text-base font-bold text-white font-display">
                                      {proj.title}
                                    </h3>
                                    
                                    {/* Status Badge */}
                                    <span className={`px-2.5 py-0.5 text-[9px] font-mono rounded uppercase tracking-wider ${
                                      proj.status === "Live"
                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                    }`}>
                                      {proj.status}
                                    </span>
                                  </div>

                                  {proj.description && (
                                    <p className="text-xs text-gray-300 leading-relaxed">
                                      {proj.description}
                                    </p>
                                  )}

                                  {/* Project tags */}
                                  <div className="flex flex-wrap gap-1.5">
                                    {proj.tags.map((tag, i) => (
                                      <span
                                        key={i}
                                        className="px-2 py-0.5 text-[10px] font-mono rounded bg-white/5 border border-white/5 text-gray-400"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2 pt-2 border-t border-white/5">
                                  {proj.github && (
                                    <a
                                      href={proj.github}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={() => playSound("click")}
                                      className="px-3 py-1.5 text-xs rounded bg-[#050816] hover:bg-[#8B5CF6]/10 border border-white/10 hover:border-[#8B5CF6]/50 text-gray-300 hover:text-white transition-all flex items-center space-x-1.5 w-1/2 justify-center"
                                    >
                                      <Github className="w-3.5 h-3.5" />
                                      <span>Repository</span>
                                    </a>
                                  )}
                                  {proj.demo ? (
                                    <a
                                      href={proj.demo}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={() => playSound("click")}
                                      className="px-3 py-1.5 text-xs rounded bg-[#00D4FF]/15 hover:bg-[#00D4FF]/25 border border-[#00D4FF]/30 hover:border-[#00D4FF] text-white transition-all flex items-center space-x-1.5 w-1/2 justify-center font-medium"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                      <span>Live Demo</span>
                                    </a>
                                  ) : proj.isDesktopApp ? (
                                    <div className="px-1.5 sm:px-3 py-1.5 text-[10px] sm:text-xs rounded bg-white/5 border border-white/10 text-gray-400 select-none flex items-center space-x-1 w-1/2 justify-center font-mono text-center">
                                      <span>Desktop Application</span>
                                    </div>
                                  ) : null}
                                  {!proj.github && !proj.demo && !proj.isDesktopApp && (
                                    <span className="text-xs text-gray-500 font-mono italic p-2 text-center w-full block">
                                      🔒 Subroutines locked in development phase.
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* RESUME VIEWER APP VIEW */}
                      {win.id === "resume" && (
                        <div id="resume-app-content" className="space-y-6">
                          <div className="flex flex-col sm:flex-row justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10 gap-3">
                            <div className="text-center sm:text-left">
                              <h3 className="text-sm font-bold text-white font-display">Sharda Vatsal Bhat - Resume</h3>
                              <p className="text-xs text-gray-400 font-mono">Status: <span className="text-emerald-400">Available</span></p>
                            </div>
                            <a
                              href="/resume.pdf"
                              download
                              onClick={() => playSound("click")}
                              className="px-4 py-2 rounded-lg bg-[#00D4FF]/15 hover:bg-[#00D4FF]/25 border border-[#00D4FF]/30 hover:border-[#00D4FF] text-white transition-all flex items-center space-x-2 text-xs font-medium shrink-0"
                            >
                              <Download className="w-4 h-4" />
                              <span>Download Resume</span>
                            </a>
                          </div>

                          {/* Inline PDF preview — viewers can read the resume without downloading */}
                          <div className="rounded-xl overflow-hidden border border-white/10 bg-white shadow-inner">
                            <iframe
                              src="/resume.pdf"
                              title="Sharda Vatsal Bhat — Resume preview"
                              className="w-full h-[420px] md:h-[480px]"
                            />
                          </div>
                          <p className="text-[10px] font-mono text-gray-500 text-center select-none">
                            Previewing — use &quot;Download Resume&quot; above to save a copy.
                          </p>
                        </div>
                      )}

                      {/* EXPERIENCE APP VIEW */}
                      {win.id === "experience" && (
                        <div id="experience-app-content" className="space-y-6">
                          <p className="text-xs text-gray-400 uppercase tracking-widest font-mono border-b border-white/10 pb-2">
                            RECORDED INTERNSHIP WORK EXPERIENCE — LOG
                          </p>

                          {PORTFOLIO_DATA.experience.length > 0 ? (
                            <div className="space-y-4">
                              {PORTFOLIO_DATA.experience.map((exp, i) => (
                                <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#00D4FF]/30 transition-all">
                                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                    <div>
                                      <h3 className="text-sm font-bold text-white">{exp.role}</h3>
                                      <p className="text-xs text-[#00D4FF]/80 font-mono">
                                        {exp.company}
                                        {exp.location ? ` • ${exp.location}` : ""}
                                      </p>
                                    </div>
                                    <span className="text-[10px] font-mono text-gray-400 bg-white/5 border border-white/10 rounded px-2 py-1 shrink-0">
                                      {exp.duration}
                                    </span>
                                  </div>
                                  {exp.description && (
                                    <p className="text-xs text-gray-300 mt-2 leading-relaxed">{exp.description}</p>
                                  )}
                                  {exp.points.length > 0 && (
                                    <ul className="mt-2 space-y-1.5">
                                      {exp.points.map((pt, j) => (
                                        <li key={j} className="text-xs text-gray-400 leading-relaxed flex space-x-2">
                                          <span className="text-[#00D4FF] shrink-0">▸</span>
                                          <span>{pt}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="border border-white/10 p-12 bg-white/[0.02] rounded-xl font-sans text-gray-300 text-center space-y-4 shadow-inner">
                              <Briefcase className="w-12 h-12 text-[#FF5A5F] mx-auto opacity-70" />
                              <h2 className="text-lg font-bold text-white">Work Experience</h2>
                              <p className="text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">
                                To Be Added
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* CERTIFICATIONS APP VIEW */}
                      {win.id === "certifications" && (
                        <div id="certifications-app-content" className="space-y-4">
                          <p className="text-xs text-gray-400 uppercase tracking-widest font-mono border-b border-white/10 pb-2">
                            VERIFIED ENTERPRISE AI COMPETENCIES
                          </p>

                          {PORTFOLIO_DATA.certifications.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {PORTFOLIO_DATA.certifications.map((cert, i) => (
                                <div
                                  key={i}
                                  className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all flex items-start space-x-3"
                                >
                                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                                  <div className="min-w-0">
                                    <h4 className="text-sm font-semibold text-white leading-snug">{cert.name}</h4>
                                    <p className="text-xs text-gray-400 mt-0.5">{cert.issuer}</p>
                                    {cert.date && (
                                      <p className="text-[10px] text-gray-500 font-mono mt-1">{cert.date}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="border border-white/10 p-12 bg-white/[0.02] rounded-xl font-sans text-gray-300 text-center space-y-4 shadow-inner">
                              <ShieldCheck className="w-12 h-12 text-cyan-400 mx-auto opacity-70" />
                              <h2 className="text-lg font-bold text-white">Credentials & Certifications</h2>
                              <p className="text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">
                                Coming Soon
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ACHIEVEMENTS APP VIEW */}
                      {win.id === "achievements" && (
                        <div id="achievements-app-content" className="space-y-4">
                          <p className="text-xs text-gray-400 uppercase tracking-widest font-mono border-b border-white/10 pb-2">
                            COMMUNITY AND ORG RECOGNITIONS INDEX
                          </p>

                          {PORTFOLIO_DATA.achievements.length > 0 ? (
                            <div className="space-y-3">
                              {PORTFOLIO_DATA.achievements.map((ach, i) => (
                                <div
                                  key={i}
                                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-rose-500/40 transition-all flex items-start space-x-3"
                                >
                                  <Award className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                                  <div>
                                    <h4 className="text-sm font-semibold text-white">{ach.title}</h4>
                                    <p className="text-xs text-gray-400 mt-0.5">{ach.organization}</p>
                                    {ach.description && (
                                      <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{ach.description}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="border border-white/10 p-12 bg-white/[0.02] rounded-xl font-sans text-gray-300 text-center space-y-4 shadow-inner">
                              <Award className="w-12 h-12 text-rose-400 mx-auto opacity-70" />
                              <h2 className="text-lg font-bold text-white">Honors & Achievements</h2>
                              <p className="text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">
                                Coming Soon
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* CONTACT APP VIEW */}
                      {win.id === "contact" && (
                        <div id="contact-app-content" className="space-y-6">
                          <p className="text-xs text-gray-400 uppercase tracking-widest font-mono border-b border-white/10 pb-2">
                            DIRECT CONDUIT ROUTING - MESSAGE DISPATCHER
                          </p>

                          {formSubmitted ? (
                            <motion.div
                              initial={{ scale: 0.95, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="p-6 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-center space-y-4"
                            >
                              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center mx-auto text-emerald-400">
                                <Check className="w-6 h-6" />
                              </div>
                              <h3 className="text-lg font-bold text-white font-display">Communication Transmitted</h3>
                              <p className="text-xs text-gray-300 leading-relaxed max-w-sm mx-auto">
                                Package secured. Sharda Bhat has been notified of your recruiter request. AI Core has cached your inquiry variables into local logs.
                              </p>
                              <button
                                onClick={() => {
                                  setFormSubmitted(false);
                                  setFormState({ name: "", email: "", msg: "" });
                                }}
                                className="px-4 py-2 bg-emerald-500 text-[#050816] hover:bg-emerald-400 font-medium text-xs rounded transition-all"
                              >
                                Send Secondary Packet
                              </button>
                            </motion.div>
                          ) : (
                            <form onSubmit={handleFormSubmit} className="space-y-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                                    Recruiter Name / Alias
                                  </label>
                                  <input
                                    id="contact-form-name"
                                    type="text"
                                    required
                                    placeholder="Enter full name"
                                    value={formState.name}
                                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                    className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/[0.12] border border-white/10 focus:border-[#00D4FF] rounded-lg px-3 py-2 text-white text-xs outline-none transition-all"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                                    Secure Email Address
                                  </label>
                                  <input
                                    id="contact-form-email"
                                    type="email"
                                    required
                                    placeholder="your-email@server.com"
                                    value={formState.email}
                                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                                    className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/[0.12] border border-white/10 focus:border-[#00D4FF] rounded-lg px-3 py-2 text-white text-xs outline-none transition-all"
                                  />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                                  Inquiry Specifications / Message Body
                                </label>
                                <textarea
                                  id="contact-form-msg"
                                  required
                                  rows={5}
                                  placeholder="Sir/Ma'am, we want to invite Sharda Bhat for an interview or discuss generative agent projects..."
                                  value={formState.msg}
                                  onChange={(e) => setFormState({ ...formState, msg: e.target.value })}
                                  className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/[0.12] border border-white/10 focus:border-[#00D4FF] rounded-lg px-3 py-2 text-white text-xs outline-none transition-all resize-none"
                                />
                              </div>

                              {formError && (
                                <p className="text-[11px] text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2 leading-relaxed">
                                  ⚠️ {formError}
                                </p>
                              )}

                              <button
                                id="contact-form-button"
                                type="submit"
                                disabled={formLoading}
                                className="w-full py-2.5 rounded-lg bg-[#00D4FF] hover:bg-sky-400 disabled:bg-gray-700 text-[#050816] font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2"
                              >
                                {formLoading ? (
                                  <span>Routing through satellites...</span>
                                ) : (
                                  <>
                                    <span>Transmit Message Conduit</span>
                                    <Send className="w-4 h-4" />
                                  </>
                                )}
                              </button>
                            </form>
                          )}

                          <div className="border-t border-white/10 pt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono text-gray-400">
                            <div>
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider block">Email Hub</p>
                              <a
                                href={`mailto:${PORTFOLIO_DATA.contact.email}`}
                                onClick={() => playSound("click")}
                                className="text-[#00D4FF] hover:underline"
                              >
                                {PORTFOLIO_DATA.contact.email}
                              </a>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider block">Direct Line</p>
                              <a
                                href={`tel:${PORTFOLIO_DATA.contact.phone.replace(/[^+\d]/g, "")}`}
                                onClick={() => playSound("click")}
                                className="text-[#00D4FF] hover:underline"
                              >
                                {PORTFOLIO_DATA.contact.phone}
                              </a>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider block">Gateway Links</p>
                              <div className="flex space-x-3">
                                <a
                                  href={PORTFOLIO_DATA.contact.github}
                                  target="_blank"
                                  className="hover:text-white hover:underline flex items-center space-x-1"
                                >
                                  <Github className="w-3.5 h-3.5" />
                                  <span>GitHub</span>
                                </a>
                                <a
                                  href={PORTFOLIO_DATA.contact.linkedin}
                                  target="_blank"
                                  className="hover:text-white hover:underline flex items-center space-x-1"
                                >
                                  <Linkedin className="w-3.5 h-3.5" />
                                  <span>LinkedIn</span>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TERMINAL APP VIEW */}
                      {win.id === "terminal" && (
                        <div
                          id="terminal-app-content"
                          onClick={() => {
                            // Automatically focus input field when clicking anywhere in terminal
                            const el = document.getElementById("terminal-active-input");
                            if (el) el.focus();
                          }}
                          className="h-full flex flex-col justify-between font-mono text-xs text-green-300"
                        >
                          <div className="space-y-1 flex-1 overflow-y-auto mb-4 select-text">
                            {terminalHistory.map((line, i) => (
                              <div key={i}>
                                {line.type === "input" && (
                                  <p className="text-white font-semibold">{line.text}</p>
                                )}
                                {line.type === "output" && (
                                  <p className="text-green-300 whitespace-pre-wrap leading-relaxed">
                                    {line.text}
                                  </p>
                                )}
                                {line.type === "error" && (
                                  <p className="text-rose-400 font-semibold leading-relaxed">
                                    {line.text}
                                  </p>
                                )}
                              </div>
                            ))}
                            <div ref={terminalBottomRef} />
                          </div>

                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              executeTerminalCommand(terminalInput);
                            }}
                            className="flex items-center space-x-2 border-t border-white/5 pt-2 select-none"
                          >
                            <span className="text-white shrink-0 font-bold">{isMobile ? ">" : "C:\\Users\\Recruiter>"}</span>
                            <input
                              id="terminal-active-input"
                              type="text"
                              value={terminalInput}
                              onChange={(e) => setTerminalInput(e.target.value)}
                              placeholder="Type command here (e.g. 'help', 'jarvis hello')"
                              className="flex-1 bg-transparent border-none text-green-400 font-mono text-xs focus:ring-0 focus:outline-none placeholder-gray-600 outline-none select-text"
                              autoFocus
                              autoComplete="off"
                            />
                            <button type="submit" className="hidden" />
                          </form>
                        </div>
                      )}

                      {/* AI CORE APP VIEW */}
                      {win.id === "aicore" && (
                        <div id="aicore-app-content" className="h-full md:h-[490px] flex flex-col justify-between font-sans bg-[#0a0c16] text-white">
                          
                          {/* Chat Banner Header */}
                          <div className="flex justify-between items-center bg-white/[0.03] p-3 rounded-lg border border-white/5 shrink-0 select-none mx-3 mt-3">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-8 h-8 rounded-lg bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                                <Cpu className="w-4 h-4 animate-[pulse_1.5s_infinite]" />
                              </div>
                              <div>
                                <h3 className="text-xs font-bold text-white tracking-wide">AI Core</h3>
                                <div className="flex items-center space-x-1 text-[9px] text-cyan-400 font-mono tracking-wider">
                                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                  <span>PORTFOLIO OS ASSISTANT</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-[10px] bg-black/40 px-2 py-0.5 rounded border border-white/5 font-mono text-gray-400">
                              Status: <span className="text-emerald-400 font-bold font-sans">● Ready</span>
                            </div>
                          </div>

                          {/* Chat Feed */}
                          <div className="flex-1 overflow-y-auto p-4 space-y-4 select-text max-h-[calc(100vh-280px)] md:max-h-[290px]">
                            {aiCoreMessages.map((msg, index) => (
                              <div
                                key={index}
                                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start space-x-2.5"}`}
                              >
                                {msg.sender !== "user" && (
                                  <div className="w-8 h-8 rounded-lg bg-cyan-950/50 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5 select-none font-sans font-medium text-xs">
                                    AI
                                  </div>
                                )}
                                <div
                                  className={`rounded-2xl px-4 py-2.5 max-w-[80%] text-xs sm:text-sm leading-relaxed shadow-sm whitespace-pre-line ${
                                    msg.sender === "user"
                                      ? "bg-cyan-500/10 text-white border border-cyan-500/25 rounded-tr-none"
                                      : "bg-white/[0.03] border border-white/5 text-gray-200 rounded-tl-none"
                                  }`}
                                >
                                  {msg.text}
                                </div>
                              </div>
                            ))}

                            {/* Thinking/loading bubble */}
                            {aiCoreLoading && (
                              <div className="flex justify-start space-x-2.5">
                                <div className="w-8 h-8 rounded-lg bg-cyan-950/50 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5 select-none font-sans font-medium text-xs">
                                  ...
                                </div>
                                <div className="bg-white/[0.03] border border-white/5 rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm text-xs text-gray-400 italic flex items-center space-x-1.5 select-none">
                                  <span>AI Core is responding</span>
                                  <span className="flex space-x-0.5">
                                    <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" />
                                  </span>
                                </div>
                              </div>
                            )}
                            <div ref={aiCoreBottomRef} />
                          </div>

                          {/* Quick Suggestion Prompts */}
                          <div className="px-3 shrink-0 select-none">
                            <p className="text-[10px] font-mono font-semibold text-gray-500 tracking-wider mb-2 uppercase pl-1">Suggested Inquiries</p>
                            <div className="flex flex-wrap gap-1.5 max-h-[72px] overflow-y-auto pb-1">
                              {[
                                { prompt: "Tell me about Sharda", label: "About Sharda" },
                                { prompt: "What projects has Sharda built?", label: "Explore Projects" },
                                { prompt: "What technologies does he use?", label: "Key Technologies" },
                                { prompt: "Show certifications", label: "Certifications" },
                                { prompt: "Open contact info", label: "Get in Touch" },
                                { prompt: "Open GitHub", label: "Redirect GitHub" },
                              ].map((item, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleAiCoreSubmitCustom(item.prompt)}
                                  disabled={aiCoreLoading}
                                  className="text-[11px] px-2.5 py-1 rounded-full bg-white/[0.02] hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-400/30 text-gray-300 hover:text-cyan-400 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                                >
                                  {item.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Message input area */}
                          <div className="p-3 bg-white/[0.01] border-t border-white/5 shrink-0">
                            <form onSubmit={handleAiCoreFormSubmit} className="relative flex items-center">
                              <input
                                type="text"
                                value={aiCoreInput}
                                onChange={(e) => setAiCoreInput(e.target.value)}
                                disabled={aiCoreLoading}
                                placeholder="Ask AI Core about Sharda's projects, experience, or resume..."
                                className="w-full bg-[#05060b] border border-white/10 focus:border-cyan-500/40 rounded-xl pr-12 pl-4 py-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-cyan-500/10 transition-all placeholder:text-gray-500 selection:bg-cyan-500/20 shadow-inner select-text disabled:opacity-60"
                                autoComplete="off"
                              />
                              <button
                                type="submit"
                                disabled={!aiCoreInput.trim() || aiCoreLoading}
                                className="absolute right-1.5 p-1.5 bg-cyan-500/10 hover:bg-cyan-500/25 disabled:bg-transparent text-cyan-400 disabled:text-gray-600 rounded-lg transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            </form>
                          </div>

                        </div>
                      )}

                      {/* WEB BROWSER APP VIEW */}
                      {win.id === "browser" && (
                        <div id="browser-app-content" className="h-full md:h-[490px] flex flex-col justify-between font-sans bg-[#0c0d15] text-white">
                          {/* Navigation bar with controls and address */}
                          <div className="flex items-center space-x-2 bg-[#121422] p-2 border-b border-white/5 select-none shrink-0">
                            <div className="flex space-x-1.5">
                              <button className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer">
                                <ArrowLeft className="w-3.5 h-3.5" />
                              </button>
                              <button className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer">
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                              <button className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer">
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            
                            {/* Address Bar */}
                            <div className="flex-1 flex items-center space-x-1 bg-black/40 border border-white/10 rounded-md px-2 sm:px-3 py-1 font-mono text-xs text-gray-400 min-w-0">
                              <span className="text-emerald-400 text-[9px] sm:text-[10px] select-none font-bold shrink-0">🔒 Secure</span>
                              <span className="text-gray-500 hidden sm:inline">https://</span>
                              <span className="text-white truncate">github.com/Sharda2004196</span>
                            </div>
                          </div>

                          {/* Main Browser Window Content */}
                          <div className="flex-1 min-h-0 bg-[#05060a] p-4 overflow-y-auto">
                            {/* Search Engine Landing Page */}
                            <div className="max-w-md mx-auto text-center py-6 space-y-5">
                              <div className="flex flex-col items-center space-y-2">
                                <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)] animate-[pulse_2s_infinite]">
                                  <Globe className="w-7 h-7" />
                                </div>
                                <h1 className="text-lg font-bold font-display tracking-wide uppercase bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                                  Search Engine
                                </h1>
                                <p className="text-[9px] font-mono text-gray-500">Portfolio, Projects &amp; Professional Profiles</p>
                              </div>

                              {/* Mock Search Input */}
                              <div className="relative">
                                <input
                                  type="text"
                                  placeholder="Search documents or query AI indices..."
                                  className="w-full bg-white/[0.04] border border-white/10 focus:border-cyan-500/40 rounded-xl px-4 py-2.5 pl-10 text-xs text-white outline-none focus:ring-1 focus:ring-cyan-500/10 transition-all shadow-inner"
                                  defaultValue="Sharda Vatsal Bhat Agentic AI Engineer"
                                  readOnly
                                />
                                <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                              </div>

                              {/* Search Results */}
                              <div className="space-y-4 text-left pt-3 pb-6 border-t border-white/5">
                                {/* LinkedIn profile */}
                                <div className="space-y-1">
                                  <span className="text-[10px] font-mono text-cyan-400">{PORTFOLIO_DATA.contact.linkedin}</span>
                                  <a href={PORTFOLIO_DATA.contact.linkedin} target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-400 hover:underline block leading-tight">
                                    Sharda Vatsal Bhat - Agentic AI Engineer
                                  </a>
                                  <p className="text-xs text-gray-400 leading-normal">
                                    LinkedIn profile of Sharda Vatsal Bhat, Agentic AI Engineer based in Jammu and Kashmir, India.
                                  </p>
                                </div>

                                {/* GitHub profile */}
                                <div className="space-y-1">
                                  <span className="text-[10px] font-mono text-purple-400">{PORTFOLIO_DATA.contact.github}</span>
                                  <a href={PORTFOLIO_DATA.contact.github} target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-400 hover:underline block leading-tight">
                                    Sharda Vatsal Bhat - GitHub Profile
                                  </a>
                                  <p className="text-xs text-gray-400 leading-normal">
                                    GitHub profile of Sharda Vatsal Bhat — repositories, projects, and open-source work.
                                  </p>
                                </div>

                                {/* All project repositories */}
                                {PORTFOLIO_DATA.projects.map((proj) => (
                                  <div key={proj.id} className="space-y-1">
                                    <span className="text-[10px] font-mono text-purple-400">{proj.github}</span>
                                    <a href={proj.github} target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-400 hover:underline block leading-tight">
                                      {proj.title}
                                    </a>
                                    <p className="text-xs text-gray-400 leading-normal">
                                      GitHub repository for {proj.title} ({proj.status === "Live" ? "Live" : "In Development"}) built by Sharda Vatsal Bhat.
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* OPEN SOURCE APP VIEW */}
                      {win.id === "opensource" && (
                        <div id="opensource-app-content" className="space-y-4 font-sans text-gray-300">
                          <div className="flex items-center space-x-3 border-b border-white/10 pb-3 select-none">
                            <div className="p-2 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
                              <FolderOpen className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-white tracking-wide">Open Source Repositories & Packages</h3>
                              <p className="text-xs text-gray-400">Distributed codebases, modules, and CLI packages built for public automation.</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {PORTFOLIO_DATA.projects
                              .filter((p) => p.github)
                              .map((proj) => (
                                <a
                                  key={proj.id}
                                  href={proj.github}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => playSound("click")}
                                  className="flex items-start space-x-3 p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all group"
                                >
                                  <Github className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                      <h4 className="text-sm font-semibold text-white group-hover:text-purple-300 truncate">
                                        {proj.title}
                                      </h4>
                                      <span className="text-[10px] font-mono text-purple-400/80 shrink-0">public</span>
                                    </div>
                                    <p className="text-xs text-gray-400 leading-relaxed mt-1">
                                      {proj.description || "Public repository on GitHub."}
                                    </p>
                                  </div>
                                </a>
                              ))}
                          </div>
                        </div>
                      )}

                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

          </div>

          {/* ----------------------------------------------------
              SECTION 4: TASKBAR MODULE
              ---------------------------------------------------- */}
          {/* Single uniform macOS glass panel: the frosted gradient + blur covers the WHOLE bar,
              including the start/search cluster on the left and the wifi/clock tray on the right. */}
          <div id="os-taskbar-container" className="fixed bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 h-12 md:h-14 w-[92vw] md:w-full max-w-[420px] md:max-w-[760px] bg-[#0b0e1b]/40 bg-gradient-to-b from-white/[0.1] via-white/[0.04] to-transparent border border-white/[0.14] backdrop-blur-2xl backdrop-saturate-150 px-2.5 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl flex items-center justify-between shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.12)] z-40 select-none">
            
            {/* Left: Start Menu & Search container */}
            <div className="flex items-center space-x-2 shrink-0">
              
              {/* Start Menu trigger button */}
              <button
                id="start-menu-button"
                onClick={() => {
                  playSound("click");
                  setIsStartOpen(!isStartOpen);
                  setIsSearchOpen(false);
                }}
                className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all border cursor-pointer ${
                  isStartOpen
                    ? "bg-[#00D4FF]/20 border-[#00D4FF] text-[#00D4FF] shadow-[0_0_10px_#00D4FF]"
                    : "bg-white/5 border-white/10 hover:border-[#00D4FF]/40 text-gray-200"
                }`}
                title="Launch Start Menu (Meta Key)"
              >
                <Cpu className="w-4 h-4 md:w-5 md:h-5 animate-[spin_4s_linear_infinite]" />
              </button>

              {/* Start Menu Dialog Overlay */}
              <AnimatePresence>
                {isStartOpen && (
                  <motion.div
                    id="start-menu-dialog"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="absolute bottom-16 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 w-[86vw] md:w-80 rounded-2xl border border-white/10 shadow-2xl bg-[#090b14]/94 backdrop-blur-2xl p-4 font-sans text-gray-200 space-y-4"
                  >
                    {/* User profile dossier */}
                    <div className="flex items-center space-x-3 border-b border-white/10 pb-3 select-none">
                      <div className="relative w-9 h-9 rounded-full overflow-hidden bg-sky-500 border border-sky-400 shrink-0">
                        <Image
                          src={PORTFOLIO_DATA.personal.avatar}
                          alt="avatar"
                          fill
                          sizes="36px"
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="truncate select-none">
                        <h4 className="text-xs font-bold text-white tracking-wide">{PORTFOLIO_DATA.personal.name}</h4>
                        <p className="text-[10px] font-mono text-emerald-400 tracking-wider">SECURE VISITOR : GUEST</p>
                      </div>
                    </div>

                    {/* App shortcuts */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-semibold text-gray-500 uppercase tracking-widest block select-none mb-1">Applications</span>
                      <div className="grid grid-cols-1 gap-1 max-h-[160px] overflow-y-auto pr-1">
                        {windows.map((app) => (
                          <button
                            id={`start-shortcut-${app.id}`}
                            key={app.id}
                            onClick={() => {
                              openWindow(app.id);
                              setIsStartOpen(false);
                            }}
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 text-left transition-colors w-full cursor-pointer"
                          >
                            <span className="p-1 rounded bg-white/5 shrink-0 text-white">{app.icon}</span>
                            <span className="text-xs font-semibold">{app.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Customized Wallpaper Switcher Controls */}
                    <div className="space-y-1.5 border-t border-white/10 pt-3 select-none">
                      <span className="text-[10px] font-mono font-semibold text-gray-500 tracking-widest block uppercase">Wallpaper Switcher</span>
                      <div className="flex justify-between gap-1 mt-1">
                        {[0, 1, 2].map((idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              playSound("click");
                              setWallpaperIndex(idx);
                            }}
                            className={`flex-1 py-1 rounded text-[10px] font-mono uppercase tracking-wider transition-all border cursor-pointer ${
                              wallpaperIndex === idx
                                ? "bg-[#00D4FF]/20 border-[#00D4FF] text-[#00D4FF]"
                                : "bg-[#050816] hover:bg-white/5 border-white/10 text-gray-400"
                            }`}
                          >
                            WP {idx + 1}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Shut down / Power control nodes */}
                    <div className="flex justify-between items-center border-t border-white/10 pt-3 select-none">
                      <div className="text-[9px] font-mono text-gray-500">PortfolioOS v1.1 (PROD)</div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            playSound("click");
                            setBootState("sequence");
                            setBootLogs([]);
                            setIsStartOpen(false);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-[#8B5CF6]/20 hover:text-white text-gray-300 hover:border-[#8B5CF6]/50 border border-white/10 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                          title="Restart Desktop"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Restart</span>
                        </button>
                        <button
                          onClick={() => {
                            playSound("click");
                            setBootState("shutdown");
                            setIsStartOpen(false);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-[#0b0c2a] border border-rose-500/20 hover:border-rose-400 text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
                          title="Power Off"
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>Power Down</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Search Toggle button */}
              <button
                id="search-panel-button"
                onClick={() => {
                  playSound("click");
                  setIsSearchOpen(!isSearchOpen);
                  setIsStartOpen(false);
                }}
                className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all border cursor-pointer ${
                  isSearchOpen
                    ? "bg-[#00D4FF]/20 border-[#00D4FF] text-[#00D4FF] shadow-[0_0_10px_#00D4FF]"
                    : "bg-white/5 border-white/10 hover:border-[#00D4FF]/40 text-gray-200"
                }`}
                title="Search Applications..."
              >
                <Search className="w-4 h-4 md:w-4.5 md:h-4.5" />
              </button>

              {/* Search results popover overlay */}
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div
                    id="search-results-overlay"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    className="absolute bottom-16 left-1/2 -translate-x-1/2 md:left-12 md:translate-x-0 w-[86vw] md:w-80 rounded-2xl border border-white/10 shadow-2xl bg-[#090b14]/94 backdrop-blur-2xl p-3 font-sans text-gray-200 space-y-3"
                  >
                    <div className="flex items-center space-x-2 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 select-none animate-[pulse_3s_infinite]">
                      <Search className="w-4 h-4 text-gray-400 shrink-0" />
                      <input
                        id="search-active-input"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search dossier nodes (e.g. skills)..."
                        className="bg-transparent border-none text-xs text-white focus:outline-none placeholder-gray-500 w-full outline-0 ring-0 select-text"
                        autoFocus
                      />
                      {searchQuery && (
                        <button onClick={() => setSearchQuery("")}>
                          <X className="w-3 h-3 text-gray-400 hover:text-white cursor-pointer" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-1 select-none max-h-[220px] overflow-y-auto">
                      {filteredApps.length > 0 ? (
                        filteredApps.map((app) => (
                          <button
                            id={`search-item-${app.id}`}
                            key={app.id}
                            onClick={() => {
                              openWindow(app.id);
                              setIsSearchOpen(false);
                            }}
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[#00D4FF]/10 text-left transition-colors w-full group border border-transparent cursor-pointer"
                          >
                            <span className="p-1.5 rounded bg-white/5 group-hover:bg-[#00D4FF]/20 shrink-0 text-white">{app.icon}</span>
                            <div className="truncate-info">
                              <p className="text-xs font-bold text-white">{app.title}</p>
                              <p className="text-[9px] text-gray-400 font-mono">Dossier application node</p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500 text-center py-4 font-mono">0 matching subroutines found.</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* Center: Interactive centered hover Zoom Quick-Launcher Apps Dock */}
            <div id="running-apps-dock" className="flex-1 flex justify-center items-center px-1.5 md:px-2 space-x-2 md:space-x-3 select-none overflow-x-auto md:overflow-visible min-w-0">
              {windows.map((win) => {
                // Render if either it's pre-configured as a running window, or if it is currently open
                const isOpen = win.isOpen;
                const isFocused = isOpen && !win.isMinimized;

                // We display 3 vital launchers on mobile (compact dock), and 5 on desktop/tablet!
                const isPrimaryLauncher = (isMobile ? ["aicore", "projects", "contact"] : ["browser", "projects", "contact", "terminal", "aicore"]).includes(win.id);
                if (!isOpen && !isPrimaryLauncher) return null;

                return (
                  // macOS-dock-style zoom: smooth non-oscillating tween (no spring bounce),
                  // scaling from the bottom edge so icons grow upward like the macOS dock.
                  // transition-colors (not transition-all) keeps CSS from fighting the transform.
                  <motion.button
                    id={`active-tab-${win.id}`}
                    key={win.id}
                    whileHover={!isMobile ? { scale: 1.25 } : {}}
                    transition={{ type: "tween", duration: 0.18, ease: [0.25, 1, 0.5, 1] }}
                    style={{ transformOrigin: "50% 100%" }}
                    onClick={() => {
                      // Each branch plays exactly one sound, so a dock
                      // interaction never double-sounds.
                      if (!isOpen) {
                        openWindow(win.id);
                      } else if (win.isMinimized) {
                        playSound("click");
                        focusWindow(win.id);
                      } else {
                        minimizeWindow(win.id);
                      }
                    }}
                    className="relative w-8.5 h-8.5 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center transition-colors bg-white/[0.05] hover:bg-white/[0.13] border border-white/[0.08] hover:border-white/25 text-white cursor-pointer group shrink-0 shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
                    title={isOpen ? (isFocused ? "Click to minimize window" : "Click to focus window") : `Launch ${win.title}`}
                  >
                    <div className="text-white shrink-0 scale-90 md:scale-100">
                      {win.icon}
                    </div>

                    {/* Running status indicator dot below active launcher */}
                    {isOpen && (
                      <span className={`absolute bottom-0.5 md:bottom-1 w-1 md:w-1.5 h-1 md:h-1.5 rounded-full transition-all ${
                        isFocused ? "bg-[#00D4FF] shadow-[0_0_6px_#00D4FF]" : "bg-gray-500"
                      }`} />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Right: Clock & Settings system tray */}
            <div className="hidden md:flex items-center space-x-3 text-gray-300 select-none shrink-0 border-l border-white/10 pl-3.5">
              
              {/* Network Status Toggle indicator */}
              <button
                id="wifi-status-toggle"
                onClick={() => {
                  setIsOnline(!isOnline);
                  playSound("alert");
                }}
                className="hover:text-white transition-colors cursor-pointer"
                title={isOnline ? "Network State: Connected" : "Network State: Terminated"}
              >
                {isOnline ? <Wifi className="w-4 h-4 text-[#00D4FF]" /> : <WifiOff className="w-4 h-4 text-rose-500" />}
              </button>
              
              {/* Audio feedback Synthesizer Toggle */}
              <button
                id="audio-status-toggle"
                onClick={() => {
                  setIsMuted(!isMuted);
                  // Trigger small test sound before muting completely
                  if (isMuted) {
                    setTimeout(() => playSound("click"), 50);
                  }
                }}
                className="hover:text-white transition-colors cursor-pointer"
                title={isMuted ? "Synth Audio: MUTED" : "Synth Audio: ACTIVE"}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-gray-500" /> : <Volume2 className="w-4 h-4 text-emerald-400 animate-[pulse_2s_infinite]" />}
              </button>

              {/* Analog clock readout widget */}
              <div
                id="system-clock-tray"
                className="flex flex-col items-end select-none"
                title="System local time zone (IST)"
              >
                <span className="font-mono text-xs font-semibold leading-none text-white">{currentTime || "12:00 PM"}</span>
                <span className="text-[8px] font-mono text-gray-500 leading-none mt-1">{currentDate || "Jun 04"}</span>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
