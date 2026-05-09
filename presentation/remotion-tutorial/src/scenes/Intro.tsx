import React from "react";
import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { Background, Sparkles } from "../components/Background";
import { theme } from "../theme";

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 90, mass: 0.7 },
  });
  const subSpring = spring({
    frame: frame - 18,
    fps,
    config: { damping: 14, stiffness: 100, mass: 0.7 },
  });
  const tagSpring = spring({
    frame: frame - 32,
    fps,
    config: { damping: 14, stiffness: 100, mass: 0.7 },
  });

  const glow = 0.6 + Math.sin(frame / 18) * 0.2;
  const fadeOut = interpolate(frame, [70, 90], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <Background variant="mesh" accent={theme.yellow} />
      <Sparkles count={36} color={theme.yellow} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 24,
          fontFamily: theme.fontSans,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            opacity: logoSpring,
            transform: `scale(${0.7 + logoSpring * 0.3})`,
          }}
        >
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: 32,
              background: `conic-gradient(from ${frame * 2}deg, ${theme.yellow}, ${theme.green}, ${theme.blue}, ${theme.pink}, ${theme.yellow})`,
              padding: 6,
              boxShadow: `0 0 ${40 + glow * 30}px ${theme.yellow}88`,
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 26,
                background: theme.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 76,
                fontWeight: 900,
                color: theme.yellow,
                fontFamily: theme.fontMono,
              }}
            >
              π
            </div>
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 160,
              fontWeight: 900,
              color: theme.text,
              letterSpacing: -4,
              lineHeight: 0.95,
              textShadow: `0 0 40px ${theme.yellow}66`,
            }}
          >
            PiAPI<span style={{ color: theme.yellow }}>·</span>Skills
          </h1>
        </div>

        <div
          style={{
            opacity: subSpring,
            transform: `translateY(${(1 - subSpring) * 16}px)`,
            fontSize: 42,
            color: theme.textMuted,
            fontWeight: 400,
            marginTop: 10,
          }}
        >
          Um <strong style={{ color: theme.green }}>CLI</strong>. 14+ modelos
          de IA. Qualquer agent.
        </div>

        <div
          style={{
            opacity: tagSpring,
            transform: `translateY(${(1 - tagSpring) * 12}px)`,
            display: "flex",
            gap: 14,
            marginTop: 20,
          }}
        >
          {["Midjourney", "Flux", "Kling", "Suno", "Veo 3", "Claude"].map(
            (label, i) => (
              <span
                key={label}
                style={{
                  padding: "10px 18px",
                  background: theme.panel,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 999,
                  color: theme.text,
                  fontFamily: theme.fontMono,
                  fontSize: 22,
                  opacity: interpolate(
                    frame - 32 - i * 4,
                    [0, 14],
                    [0, 1],
                    {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    },
                  ),
                }}
              >
                {label}
              </span>
            ),
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
