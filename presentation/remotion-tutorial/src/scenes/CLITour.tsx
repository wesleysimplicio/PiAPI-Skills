import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import { Background } from "../components/Background";
import { Title } from "../components/Title";
import { Terminal } from "../components/Terminal";
import { theme } from "../theme";

const Pill: React.FC<{
  emoji: string;
  label: string;
  color: string;
  appearAt: number;
}> = ({ emoji, label, color, appearAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame: frame - appearAt,
    fps,
    config: { damping: 12, stiffness: 130, mass: 0.5 },
  });
  return (
    <div
      style={{
        padding: "16px 26px",
        borderRadius: 999,
        background: `${color}1f`,
        border: `1px solid ${color}66`,
        display: "flex",
        gap: 14,
        alignItems: "center",
        fontFamily: theme.fontMono,
        fontWeight: 600,
        fontSize: 24,
        color,
        boxShadow: `0 0 24px ${color}33`,
        opacity: enter,
        transform: `scale(${0.6 + enter * 0.4})`,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontSize: 30 }}>{emoji}</span>
      <span>{label}</span>
    </div>
  );
};

export const CLITour: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [250, 270], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
      <Background variant="grid" accent={theme.pink} />
      <AbsoluteFill
        style={{
          flexDirection: "column",
          padding: "80px 100px 40px",
          gap: 36,
        }}
      >
        <Title
          eyebrow="Passo 3"
          title="Tour pelos comandos"
          align="left"
          accent={theme.pink}
        />

        <div
          style={{
            display: "flex",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <Pill emoji="🎨" label="imagine" color={theme.pink} appearAt={10} />
          <Pill emoji="⚡" label="flux" color={theme.yellow} appearAt={18} />
          <Pill emoji="🎬" label="kling" color={theme.blue} appearAt={26} />
          <Pill emoji="🎵" label="suno" color={theme.green} appearAt={34} />
          <Pill emoji="🤖" label="llm" color={theme.purple} appearAt={42} />
          <Pill emoji="📦" label="submit" color={theme.textMuted} appearAt={50} />
          <Pill emoji="⏳" label="wait" color={theme.textMuted} appearAt={58} />
        </div>

        <Terminal
          title="piapi-cli — playground"
          width={1700}
          appearAt={60}
          lines={[
            {
              prompt: "$",
              text: 'piapi-cli imagine "studio portrait, calico cat" --aspect 1:1',
              startFrame: 70,
              durationFrames: 50,
            },
            {
              text: "→ task_id: mj_01HZ… status: pending → processing → completed ✓",
              startFrame: 124,
              color: theme.green,
              durationFrames: 36,
            },
            {
              prompt: "$",
              text: 'piapi-cli flux "cyberpunk alley at night, rainy neon"',
              startFrame: 164,
              durationFrames: 44,
            },
            {
              text: "→ output: https://cdn.piapi.ai/.../flux_01.png",
              startFrame: 212,
              color: theme.textMuted,
              durationFrames: 24,
            },
            {
              prompt: "$",
              text: 'piapi-cli kling --image-url … --prompt "slow dolly zoom"',
              startFrame: 240,
              durationFrames: 40,
            },
          ]}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
