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
import { theme } from "../theme";

type Model = {
  name: string;
  family: "image" | "video" | "audio" | "3d" | "llm";
  emoji: string;
};

const models: Model[] = [
  { name: "Midjourney", family: "image", emoji: "🎨" },
  { name: "Flux", family: "image", emoji: "⚡" },
  { name: "Gemini", family: "image", emoji: "🍌" },
  { name: "Faceswap", family: "image", emoji: "👤" },
  { name: "Kling", family: "video", emoji: "🎬" },
  { name: "Luma", family: "video", emoji: "🌙" },
  { name: "Veo 3", family: "video", emoji: "📽️" },
  { name: "Hailuo", family: "video", emoji: "🌊" },
  { name: "Hunyuan", family: "video", emoji: "🐉" },
  { name: "Seedance 2", family: "video", emoji: "💃" },
  { name: "Suno", family: "audio", emoji: "🎵" },
  { name: "F5-TTS", family: "audio", emoji: "🗣️" },
  { name: "MMAudio", family: "audio", emoji: "🔊" },
  { name: "Trellis 3D", family: "3d", emoji: "🧊" },
  { name: "Claude / GPT", family: "llm", emoji: "🤖" },
];

const colorByFamily: Record<Model["family"], string> = {
  image: theme.pink,
  video: theme.blue,
  audio: theme.green,
  "3d": theme.purple,
  llm: theme.yellow,
};

const ModelTile: React.FC<{ m: Model; appearAt: number }> = ({
  m,
  appearAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame: frame - appearAt,
    fps,
    config: { damping: 14, stiffness: 110, mass: 0.5 },
  });
  const float = Math.sin((frame + appearAt) / 30) * 3;
  const color = colorByFamily[m.family];
  return (
    <div
      style={{
        width: 250,
        padding: "26px 22px",
        background: `linear-gradient(160deg, ${theme.panel}, ${theme.bgSoft})`,
        border: `1px solid ${color}55`,
        borderRadius: 18,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        boxShadow: `0 20px 50px rgba(0,0,0,0.55), 0 0 30px ${color}22 inset`,
        opacity: enter,
        transform: `translateY(${(1 - enter) * 30 + float}px) scale(${0.9 + enter * 0.1})`,
        fontFamily: theme.fontSans,
      }}
    >
      <div style={{ fontSize: 44 }}>{m.emoji}</div>
      <div
        style={{
          color: theme.text,
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: -0.5,
        }}
      >
        {m.name}
      </div>
      <div
        style={{
          color,
          fontFamily: theme.fontMono,
          fontSize: 14,
          letterSpacing: 2,
          textTransform: "uppercase",
        }}
      >
        {m.family}
      </div>
    </div>
  );
};

export const Models: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [190, 210], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
      <Background variant="mesh" accent={theme.purple} />
      <AbsoluteFill
        style={{
          flexDirection: "column",
          padding: "80px 100px",
          gap: 50,
        }}
      >
        <Title
          eyebrow="Catálogo"
          title="Mais de 14 famílias suportadas"
          subtitle="Imagem, vídeo, música, 3D e LLMs no mesmo envelope: model + task_type + input."
          align="left"
          accent={theme.purple}
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 26,
            justifyItems: "center",
          }}
        >
          {models.map((m, i) => (
            <ModelTile key={m.name} m={m} appearAt={20 + i * 5} />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
