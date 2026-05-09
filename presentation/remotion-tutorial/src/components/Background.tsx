import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { theme } from "../theme";

type Props = {
  accent?: string;
  variant?: "radial" | "mesh" | "grid";
};

export const Background: React.FC<Props> = ({
  accent = theme.yellow,
  variant = "radial",
}) => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 600], [0, 360]) % 360;
  const pulse = 0.55 + Math.sin(frame / 30) * 0.05;

  if (variant === "mesh") {
    return (
      <AbsoluteFill
        style={{
          background: `
            radial-gradient(circle at ${30 + Math.sin(frame / 60) * 10}% 30%, ${accent}33 0%, transparent 45%),
            radial-gradient(circle at ${70 - Math.cos(frame / 60) * 10}% 70%, ${theme.purple}33 0%, transparent 45%),
            radial-gradient(circle at 50% 50%, ${theme.blue}22 0%, transparent 60%),
            ${theme.bg}
          `,
        }}
      />
    );
  }

  if (variant === "grid") {
    return (
      <AbsoluteFill style={{ background: theme.bg }}>
        <AbsoluteFill
          style={{
            backgroundImage: `
              linear-gradient(${theme.border} 1px, transparent 1px),
              linear-gradient(90deg, ${theme.border} 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
            opacity: 0.35,
            transform: `translate(${(frame % 80) - 80}px, ${(frame % 80) - 80}px)`,
          }}
        />
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at 50% 50%, transparent 0%, ${theme.bg} 70%)`,
          }}
        />
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at 50% 40%, ${accent}22 0%, transparent 50%)`,
            opacity: pulse,
          }}
        />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(ellipse at center, ${accent}22 0%, transparent 50%),
          conic-gradient(from ${drift}deg at 50% 50%, ${theme.bg} 0%, ${theme.bgSoft} 50%, ${theme.bg} 100%)
        `,
      }}
    />
  );
};

export const Sparkles: React.FC<{ count?: number; color?: string }> = ({
  count = 24,
  color = theme.yellow,
}) => {
  const frame = useCurrentFrame();
  const dots = Array.from({ length: count }, (_, i) => {
    const seed = i * 9301 + 49297;
    const x = (seed * 233 + 17) % 1920;
    const y = (seed * 137 + 31) % 1080;
    const phase = (i * 17) % 60;
    const blink = (Math.sin((frame + phase) / 12) + 1) / 2;
    const size = 2 + ((seed * 13) % 4);
    return { x, y, blink, size };
  });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {dots.map((d, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: d.x,
            top: d.y,
            width: d.size,
            height: d.size,
            borderRadius: "50%",
            background: color,
            opacity: d.blink * 0.9,
            boxShadow: `0 0 ${8 + d.blink * 8}px ${color}`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
