"use client";

import React from "react";
import { motion } from "motion/react";

export interface AuroraBackgroundProps {
  /** Extra wrapper classes */
  className?: string;
  /** Content to render on top of the background */
  children?: React.ReactNode;
  /** Number of "star" points */
  starCount?: number;
  /** Two CSS-variable backed colors for the radial overlays */
  gradientColors?: [string, string];
  /** Pulse animation duration in seconds */
  pulseDuration?: number;
  /** ARIA label for the animated background */
  ariaLabel?: string;
}

// Stable noop subscription for useSyncExternalStore (no external store here —
// it is only used to detect the client side for hydration-safe rendering).
const noopSubscribe = () => () => {};

// Deterministic pseudo-random per index — Math.random() would differ between the
// server-rendered HTML and the client, causing React hydration mismatches.
const rand = (i: number, salt: number) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const AuroraBackground: React.FC<AuroraBackgroundProps> = ({
  className = "",
  children,
  starCount = 50,
  gradientColors = [
    "var(--aurora-color1, rgba(168,85,247,0.2))",
    "var(--aurora-color2, rgba(79,70,229,0.2))",
  ],
  pulseDuration = 10,
  ariaLabel = "Animated aurora background",
}) => {
  const [colorA, colorB] = gradientColors;
  // Stars render client-only after hydration: motion serializes `initial` styles
  // with slightly different precision on the server vs the client, which would
  // otherwise trip React's hydration check on every page load. useSyncExternalStore
  // is the lint-safe way to detect the client without setting state in an effect.
  const mounted = React.useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={`relative flex flex-col w-full h-full items-center justify-center bg-black text-slate-50 overflow-hidden ${className}`}
    >
      {/* Background layers (hidden from screen readers) */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Pulsing radial gradients */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `
              radial-gradient(circle, ${colorA} 0%, transparent 80%),
              radial-gradient(circle, ${colorB} 0%, transparent 80%)
            `,
            backgroundSize: "100% 100%",
            animation: `pulse ${pulseDuration}s infinite`,
          }}
        />

        {/* Blurred color blobs */}
        <motion.div
          className="absolute inset-0 mix-blend-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          <motion.div
            className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-purple-600 rounded-full filter blur-3xl opacity-40"
            animate={{
              x: [-50, 50, -50],
              y: [-20, 20, -20],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-fuchsia-600 rounded-full filter blur-3xl opacity-40"
            animate={{
              x: [50, -50, 50],
              y: [20, -20, 20],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 40,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-1/3 left-1/3 w-1/3 h-1/3 bg-indigo-700 rounded-full filter blur-3xl opacity-30"
            animate={{
              x: [20, -20, 20],
              y: [-30, 30, -30],
              rotate: [0, 360, 0],
            }}
            transition={{
              duration: 50,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* Twinkling stars (client-only after mount to avoid hydration mismatch) */}
        {mounted &&
          Array.from({ length: starCount }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-0.5 bg-white rounded-full"
              initial={{
                x: `${rand(i, 1) * 100}vw`,
                y: `${rand(i, 2) * 100}vh`,
                opacity: 0,
              }}
              animate={{
                opacity: [0, rand(i, 3) * 0.8, 0],
              }}
              transition={{
                duration: rand(i, 4) * 3 + 2,
                repeat: Infinity,
                delay: rand(i, 5) * 5,
              }}
            />
          ))}
      </div>

      {/* Foreground content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default AuroraBackground;
