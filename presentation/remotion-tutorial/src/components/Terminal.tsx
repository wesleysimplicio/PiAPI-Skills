import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { theme } from "../theme";

export type TerminalLine = {
  prompt?: string;
  text: string;
  color?: string;
  startFrame: number;
  durationFrames?: number;
};

type Props = {
  title?: string;
  lines: TerminalLine[];
  width?: number | string;
  height?: number | string;
  appearAt?: number;
};

const Caret: React.FC = () => {
  const frame = useCurrentFrame();
  const visible = Math.floor(frame / 12) % 2 === 0;
  return (
    <span
      style={{
        display: "inline-block",
        width: 14,
        height: 28,
        marginLeft: 4,
        verticalAlign: "-4px",
        background: visible ? theme.green : "transparent",
      }}
    />
  );
};

export const Terminal: React.FC<Props> = ({
  title = "bash",
  lines,
  width = 1280,
  height = "auto",
  appearAt = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame: frame - appearAt,
    fps,
    config: { damping: 16, stiffness: 120, mass: 0.8 },
  });
  const opacity = interpolate(frame - appearAt, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <div
      style={{
        width,
        height,
        background: theme.panel,
        borderRadius: 16,
        border: `1px solid ${theme.border}`,
        boxShadow: `0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px ${theme.border}`,
        overflow: "hidden",
        transform: `translateY(${(1 - enter) * 30}px) scale(${0.96 + enter * 0.04})`,
        opacity,
        fontFamily: theme.fontMono,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 18px",
          background: "#101015",
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <span
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: theme.pink,
          }}
        />
        <span
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: theme.yellow,
          }}
        />
        <span
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: theme.green,
          }}
        />
        <span
          style={{
            marginLeft: 16,
            color: theme.textMuted,
            fontSize: 18,
            letterSpacing: 1,
          }}
        >
          {title}
        </span>
      </div>
      <div
        style={{
          padding: "26px 30px",
          color: theme.text,
          fontSize: 26,
          lineHeight: 1.55,
          minHeight: 120,
        }}
      >
        {lines.map((line, i) => {
          const local = frame - line.startFrame;
          if (local < 0) return null;
          const total = line.durationFrames ?? Math.max(20, line.text.length * 2);
          const charsToShow = Math.max(
            0,
            Math.min(
              line.text.length,
              Math.floor(interpolate(local, [0, total], [0, line.text.length])),
            ),
          );
          const shown = line.text.slice(0, charsToShow);
          const isActive = charsToShow < line.text.length;
          const isLast = i === lines.length - 1;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 12,
                color: line.color ?? theme.text,
              }}
            >
              {line.prompt !== undefined && (
                <span style={{ color: theme.green, opacity: 0.95 }}>
                  {line.prompt}
                </span>
              )}
              <span style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {shown}
                {(isActive || (isLast && !isActive)) && <Caret />}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
