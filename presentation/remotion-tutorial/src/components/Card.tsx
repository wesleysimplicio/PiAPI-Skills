import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

type Props = {
  icon?: string;
  title: string;
  subtitle?: string;
  accent?: string;
  appearAt?: number;
  width?: number;
  delay?: number;
};

export const Card: React.FC<Props> = ({
  icon,
  title,
  subtitle,
  accent = theme.green,
  appearAt = 0,
  delay = 0,
  width = 380,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - appearAt - delay;
  const enter = spring({
    frame: local,
    fps,
    config: { damping: 14, stiffness: 110, mass: 0.6 },
  });
  return (
    <div
      style={{
        width,
        padding: "32px 32px",
        background: `linear-gradient(160deg, ${theme.panel} 0%, ${theme.bgSoft} 100%)`,
        border: `1px solid ${theme.border}`,
        borderTop: `2px solid ${accent}`,
        borderRadius: 18,
        boxShadow: `0 30px 60px rgba(0,0,0,0.55), 0 0 40px ${accent}22 inset`,
        fontFamily: theme.fontSans,
        opacity: enter,
        transform: `translateY(${(1 - enter) * 40}px) scale(${0.94 + enter * 0.06})`,
      }}
    >
      {icon && (
        <div
          style={{
            fontSize: 64,
            marginBottom: 14,
            filter: `drop-shadow(0 0 14px ${accent}66)`,
          }}
        >
          {icon}
        </div>
      )}
      <div
        style={{
          color: accent,
          fontSize: 16,
          letterSpacing: 4,
          textTransform: "uppercase",
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        ·
      </div>
      <h3
        style={{
          margin: 0,
          color: theme.text,
          fontSize: 36,
          fontWeight: 700,
          lineHeight: 1.2,
        }}
      >
        {title}
      </h3>
      {subtitle && (
        <p
          style={{
            margin: "14px 0 0 0",
            color: theme.textMuted,
            fontSize: 22,
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

type BadgeProps = {
  label: string;
  color: string;
  appearAt?: number;
  delay?: number;
};

export const Badge: React.FC<BadgeProps> = ({
  label,
  color,
  appearAt = 0,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - appearAt - delay;
  const enter = spring({
    frame: local,
    fps,
    config: { damping: 12, stiffness: 130, mass: 0.5 },
  });
  return (
    <div
      style={{
        padding: "14px 24px",
        background: `${color}1f`,
        border: `1px solid ${color}66`,
        color,
        borderRadius: 999,
        fontFamily: theme.fontMono,
        fontWeight: 600,
        fontSize: 24,
        letterSpacing: 0.5,
        opacity: enter,
        transform: `scale(${0.7 + enter * 0.3})`,
        boxShadow: `0 0 24px ${color}33`,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </div>
  );
};
