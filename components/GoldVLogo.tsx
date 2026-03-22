"use client";

import { CSSProperties } from "react";

export default function GoldVLogo({
  className = "w-16 h-16",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`relative group cursor-pointer ${className}`} style={style}>
      {/* Ambient power glow — expands on hover */}
      <div className="absolute inset-0 rounded-full bg-amber-400/15 blur-2xl scale-150 group-hover:bg-amber-400/35 transition-all duration-700" aria-hidden="true" />

      <svg viewBox="0 0 160 160" className="relative z-10 w-full h-full" fill="none" aria-label="Velaryn V glyph"
        style={{ filter: "drop-shadow(0 0 12px rgba(255,215,0,0.45)) drop-shadow(0 2px 4px rgba(0,0,0,0.8))" }}>
        <defs>
          {/* Bevel gradient: bright highlight → rich gold → deep shadow */}
          <linearGradient id="v-bevel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFBDD" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#8A6623" />
          </linearGradient>
          {/* Specular highlight running down the left face */}
          <linearGradient id="v-specular" x1="0%" y1="0%" x2="60%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Outer shadow / depth layer — slightly wider, low opacity */}
        <path
          fill="rgba(212,175,55,0.22)"
          d="M80 148L8 12H22L80 118L138 12H152L80 148Z"
        />

        {/* Main left arm */}
        <path fill="url(#v-bevel)" d="M22 26 H56 L100 112 L84 140 L22 26 Z" />
        {/* Cut-out / chamfer on left arm */}
        <path fill="#080E17" d="M36 39 H48 L89 118 L81 132 L36 39 Z" />

        {/* Main right arm */}
        <path fill="url(#v-bevel)" d="M138 26 H104 L68 95 L81 121 L138 26 Z" />
        {/* Cut-out / chamfer on right arm */}
        <path fill="#080E17" d="M124 39 H112 L82 96 L88 109 L124 39 Z" />

        {/* Crown bar across the top */}
        <path fill="url(#v-bevel)" d="M66 20 H84 L94 38 H76 L66 20 Z" />

        {/* Specular highlight overlay for the molten-metal sheen */}
        <path fill="url(#v-specular)" d="M22 26 H56 L100 112 L84 140 L22 26 Z" />
      </svg>
    </div>
  );
}
