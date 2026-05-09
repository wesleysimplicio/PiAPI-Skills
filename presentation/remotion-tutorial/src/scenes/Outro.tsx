import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import { Background, Sparkles } from "../components/Background";
import { theme } from "../theme";

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 90, mass: 0.7 },
  });
  const ctaSpring = spring({
    frame: frame - 22,
    fps,
    config: { damping: 14, stiffness: 100, mass: 0.7 },
  });
  const linkSpring = spring({
    frame: frame - 40,
    fps,
    config: { damping: 14, stiffness: 100, mass: 0.7 },
  });

  const fadeOut = interpolate(frame, [120, 150], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <Background variant="mesh" accent={theme.green} />
      <Sparkles count={48} color={theme.green} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 28,
          fontFamily: theme.fontSans,
        }}
      >
        <div
          style={{
            color: theme.green,
            fontSize: 26,
            letterSpacing: 8,
            textTransform: "uppercase",
            fontWeight: 700,
            opacity: titleSpring,
          }}
        >
          ⚡ Próximo passo
        </div>
        <h1
          style={{
            margin: 0,
            color: theme.text,
            fontSize: 140,
            fontWeight: 900,
            letterSpacing: -3,
            textAlign: "center",
            opacity: titleSpring,
            transform: `scale(${0.85 + titleSpring * 0.15})`,
            textShadow: `0 0 40px ${theme.green}55`,
          }}
        >
          Comece <span style={{ color: theme.yellow }}>agora.</span>
        </h1>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            alignItems: "center",
            opacity: ctaSpring,
            transform: `translateY(${(1 - ctaSpring) * 20}px)`,
          }}
        >
          <div
            style={{
              padding: "24px 38px",
              border: `2px solid ${theme.yellow}`,
              borderRadius: 14,
              background: `${theme.yellow}11`,
              color: theme.text,
              fontFamily: theme.fontMono,
              fontSize: 32,
              boxShadow: `0 0 36px ${theme.yellow}55`,
            }}
          >
            curl -fsSL .../install.sh | bash
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 28,
            marginTop: 30,
            opacity: linkSpring,
            transform: `translateY(${(1 - linkSpring) * 20}px)`,
          }}
        >
          <div
            style={{
              color: theme.textMuted,
              fontSize: 26,
              fontFamily: theme.fontMono,
            }}
          >
            github.com/wesleysimplicio/PiAPI-Skills
          </div>
          <div
            style={{
              color: theme.textMuted,
              fontSize: 26,
              fontFamily: theme.fontMono,
            }}
          >
            ·
          </div>
          <div
            style={{
              color: theme.textMuted,
              fontSize: 26,
              fontFamily: theme.fontMono,
            }}
          >
            piapi.ai
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 60,
            color: theme.textMuted,
            fontSize: 20,
            opacity: linkSpring * 0.7,
            fontFamily: theme.fontSans,
          }}
        >
          MIT License · Wesley Simplicio · 2026
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
