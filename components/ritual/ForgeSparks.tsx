'use client';

import { useEffect, useRef } from "react";

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  color: string;
};

export default function ForgeSparks({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cssWidth = 400;
    const cssHeight = 300;

    canvas.width = Math.floor(cssWidth * dpr);
    canvas.height = Math.floor(cssHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const particles: Spark[] = [];
    for (let i = 0; i < 25; i += 1) {
      particles.push({
        x: cssWidth / 2,
        y: cssHeight / 2,
        vx: (Math.random() - 0.5) * 15,
        vy: Math.random() * -15 - 5,
        life: 1,
        decay: Math.random() * 0.05 + 0.02,
        color: Math.random() > 0.5 ? "#FFD700" : "#FFFFFF",
      });
    }

    let frameId = 0;

    const animate = () => {
      ctx.clearRect(0, 0, cssWidth, cssHeight);

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const particle = particles[i];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.8;
        particle.life -= particle.decay;

        ctx.globalAlpha = Math.max(0, particle.life);
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x, particle.y, 2, 2);

        if (particle.life <= 0) {
          particles.splice(i, 1);
        }
      }

      ctx.globalAlpha = 1;

      if (particles.length > 0) {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
      ctx.clearRect(0, 0, cssWidth, cssHeight);
      ctx.globalAlpha = 1;
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={300}
      className="absolute pointer-events-none -top-32 left-1/2 -translate-x-1/2 z-20"
      aria-hidden="true"
    />
  );
}
