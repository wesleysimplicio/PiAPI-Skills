import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { Title } from "../components/Title";
import { Terminal } from "../components/Terminal";
import { theme } from "../theme";

const Step: React.FC<{
  index: number;
  label: string;
  appearAt: number;
}> = ({ index, label, appearAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame: frame - appearAt,
    fps,
    config: { damping: 14, stiffness: 110, mass: 0.6 },
  });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        opacity: enter,
        transform: `translateX(${(1 - enter) * -30}px)`,
        fontFamily: theme.fontSans,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: theme.green,
          color: theme.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 900,
          fontSize: 28,
          boxShadow: `0 0 24px ${theme.green}66`,
        }}
      >
        ✓
      </div>
      <div style={{ color: theme.text, fontSize: 30, fontWeight: 500 }}>
        <span style={{ color: theme.textMuted, marginRight: 12 }}>
          {String(index).padStart(2, "0")}
        </span>
        {label}
      </div>
    </div>
  );
};

export const Install: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [160, 180], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
      <Background variant="mesh" accent={theme.green} />
      <AbsoluteFill
        style={{
          flexDirection: "column",
          padding: "100px 100px 80px",
          gap: 50,
        }}
      >
        <Title
          eyebrow="Passo 1"
          title="Instalação em uma linha"
          align="left"
          accent={theme.green}
        />
        <div style={{ display: "flex", gap: 60, alignItems: "flex-start" }}>
          <Terminal
            title="terminal"
            width={1100}
            appearAt={10}
            lines={[
              {
                prompt: "$",
                text: 'curl -fsSL https://raw.githubusercontent.com/wesleysimplicio/PiAPI-Skills/master/install.sh | bash',
                startFrame: 18,
                durationFrames: 60,
              },
              {
                text: "→ provisionando venv em ~/.local/share/piapi-skill",
                startFrame: 84,
                color: theme.textMuted,
                durationFrames: 30,
              },
              {
                text: "→ instalando piapi-cli em ~/.local/bin",
                startFrame: 116,
                color: theme.textMuted,
                durationFrames: 26,
              },
              {
                text: "→ copiando SKILL.md para Claude · Codex · Cursor · Hermes",
                startFrame: 144,
                color: theme.green,
                durationFrames: 28,
              },
            ]}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
              marginTop: 40,
            }}
          >
            <Step index={1} label="Cria virtualenv Python 3.10+" appearAt={90} />
            <Step index={2} label="Instala piapi-cli no PATH" appearAt={120} />
            <Step index={3} label="Distribui SKILL.md para os agents" appearAt={148} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
