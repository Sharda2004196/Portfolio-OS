"use client";

import { useEffect, useCallback, useRef } from "react";

// Minimal typing for the global particles.js API loaded from the CDN script
declare global {
  interface Window {
    particlesJS?: (id: string, config: unknown) => void;
    pJSDom?: Array<{ pJS: { fn: { vendors: { destroypJS: () => void } } } }>;
  }
}

export interface ParticlesTheme {
  particles: string;
  lines: string;
  accent: string;
}

interface ParticlesComponentProps {
  /** Hex colors for the animated particle field. Changing them re-inits the
   *  same animation with new colors (layout / motion stay identical). */
  colors: ParticlesTheme;
}

export default function ParticlesComponent({ colors }: ParticlesComponentProps) {
  // Keep the latest colors reachable from the stable init callback.
  // Synced in an effect (not during render) to satisfy react-hooks/refs.
  const colorsRef = useRef(colors);

  useEffect(() => {
    colorsRef.current = colors;
  }, [colors]);

  const initParticles = useCallback(() => {
    if (typeof window === "undefined" || !window.particlesJS) return;

    // Cleanup any previous particles.js instance
    if (window.pJSDom && window.pJSDom.length > 0) {
      window.pJSDom.forEach((p) => p.pJS.fn.vendors.destroypJS());
      window.pJSDom = [];
    }
    const oldCanvas = document.querySelector("#particles-js canvas");
    if (oldCanvas) oldCanvas.remove();

    const c = colorsRef.current;

    window.particlesJS("particles-js", {
      particles: {
        number: { value: 140, density: { enable: true, value_area: 800 } },
        color: { value: c.particles },
        shape: { type: "circle", stroke: { width: 0.5, color: c.accent } },
        opacity: {
          value: 0.7,
          random: true,
          anim: { enable: true, speed: 1, opacity_min: 0.3 },
        },
        size: {
          value: 3,
          random: true,
          anim: { enable: true, speed: 2, size_min: 1 },
        },
        line_linked: {
          enable: true,
          distance: 160,
          color: c.lines,
          opacity: 0.4,
          width: 1.2,
        },
        move: { enable: true, speed: 2, random: true, out_mode: "bounce" },
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: { enable: true, mode: "grab" },
          // Disable click interaction: particles.js would push new particles at
          // the cursor on every click, visually shifting the whole network.
          onclick: { enable: false, mode: "push" },
          resize: true,
        },
        modes: {
          grab: { distance: 220, line_linked: { opacity: 0.8 } },
          push: { particles_nb: 4 },
          repulse: { distance: 180, duration: 0.4 },
        },
      },
      retina_detect: true,
    });
  }, []);

  // Load the particles.js script once, then initialise
  useEffect(() => {
    if (typeof window === "undefined") return;

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src*="particles.min.js"]'
    );
    if (existing) {
      if (window.particlesJS) {
        initParticles();
      } else {
        existing.onload = () => initParticles();
      }
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js";
    script.async = true;
    document.body.appendChild(script);
    script.onload = () => initParticles();

    return () => {
      document.body.removeChild(script);
    };
  }, [initParticles]);

  // Re-initialise with the new colors whenever the theme changes.
  // The particle motion config never changes, so the animation is identical.
  useEffect(() => {
    if (typeof window === "undefined" || !window.particlesJS) return;
    initParticles();
  }, [colors, initParticles]);

  return (
    <div
      id="particles-js"
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
