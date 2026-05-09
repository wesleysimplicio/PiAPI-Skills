import React from "react";
import { spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { theme } from "../theme";

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  appearAt?: number;
  accent?: string;
};

export const Title: React.FC<Props> = ({
  eyebrow,
  title,
  subtitle,
  align = "center",
  appearAt = 0,
  accent = theme.yellow,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - appearAt;
  const titleSpring = spring({
    frame: local,
    fps,
    config: { damping: 16, stiffness: 110, mass: 0.7 },
  });
  const subSpring = spring({
    frame: local - 8,
    fps,
    config: { damping: 16, stiffness: 110, mass: 0.7 },
  });
  const eyebrowOpacity = interpolate(local, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: align === "center" ? "center" : "flex-start",
        textAlign: align,
        gap: 18,
        fontFamily: theme.fontSans,
      }}
    >
      {eyebrow && (
        <div
          style={{
            color: accent,
            fontSize: 26,
            letterSpacing: 8,
            textTransform: "uppercase",
            fontWeight: 600,
            opacity: eyebrowOpacity,
            transform: `translateY(${(1 - eyebrowOpacity) * 12}px)`,
          }}
        >
          {eyebrow}
        </div>
      )}
      <h1
        style={{
          margin: 0,
          color: theme.text,
          fontSize: 110,
          lineHeight: 1.05,
          fontWeight: 800,
          letterSpacing: -2,
          opacity: titleSpring,
          transform: `translateY(${(1 - titleSpring) * 30}px) scale(${0.94 + titleSpring * 0.06})`,
          textShadow: `0 0 30px ${accent}55`,
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          style={{
            margin: 0,
            color: theme.textMuted,
            fontSize: 36,
            fontWeight: 400,
            opacity: subSpring,
            transform: `translateY(${(1 - subSpring) * 18}px)`,
            maxWidth: 1400,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};
