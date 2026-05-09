import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { Title } from "../components/Title";
import { Terminal } from "../components/Terminal";
import { theme } from "../theme";

export const Configure: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeIn = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [160, 180], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const keySpring = spring({
    frame: frame - 110,
    fps,
    config: { damping: 14, stiffness: 90, mass: 0.6 },
  });

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
      <Background variant="mesh" accent={theme.blue} />
      <AbsoluteFill
        style={{
          flexDirection: "column",
          padding: "100px 100px",
          gap: 50,
        }}
      >
        <Title
          eyebrow="Passo 2"
          title="Configure sua API key"
          subtitle="Pegue em piapi.ai/workspace/key e exporte na variável PIAPI_API_KEY."
          align="left"
          accent={theme.blue}
        />

        <Terminal
          title="~/.zshrc"
          width={1300}
          appearAt={20}
          lines={[
            {
              prompt: "$",
              text: 'export PIAPI_API_KEY="pi_live_••••••••••••"',
              startFrame: 28,
              durationFrames: 50,
            },
            {
              prompt: "$",
              text: 'export PIAPI_WEBHOOK_SECRET="shared-secret"   # opcional',
              startFrame: 84,
              durationFrames: 50,
              color: theme.textMuted,
            },
            {
              prompt: "$",
              text: "piapi-cli models | head -3",
              startFrame: 140,
              durationFrames: 28,
            },
          ]}
        />

        <div
          style={{
            display: "flex",
            gap: 24,
            opacity: keySpring,
            transform: `translateY(${(1 - keySpring) * 20}px)`,
            fontFamily: theme.fontSans,
            color: theme.text,
            fontSize: 26,
          }}
        >
          <span style={{ fontSize: 36 }}>🔑</span>
          <span>
            <strong style={{ color: theme.yellow }}>Dica:</strong> persista a
            chave no shell rc para não vazar em histórico de comandos.
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
