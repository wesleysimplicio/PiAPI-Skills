import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { Background } from "../components/Background";
import { Title } from "../components/Title";
import { Card } from "../components/Card";
import { theme } from "../theme";

export const WhatIsIt: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [160, 180], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
      <Background variant="grid" accent={theme.green} />
      <AbsoluteFill
        style={{
          flexDirection: "column",
          padding: "120px 100px",
          gap: 70,
        }}
      >
        <Title
          eyebrow="O que é"
          title="Uma skill, todos os agents."
          subtitle="A mesma CLI conecta Claude Code, Codex, Cursor, Hermes, Copilot e qualquer agent que respeite o padrão AGENTS.md."
          align="left"
          accent={theme.green}
        />
        <div
          style={{
            display: "flex",
            gap: 36,
            justifyContent: "center",
            marginTop: 40,
          }}
        >
          <Card
            icon="🎨"
            title="Imagens"
            subtitle="Midjourney · Flux · Gemini Nano Banana · Faceswap"
            accent={theme.pink}
            appearAt={20}
            delay={0}
            width={420}
          />
          <Card
            icon="🎬"
            title="Vídeos"
            subtitle="Kling · Luma · Veo 3 · Hailuo · Hunyuan · Seedance"
            accent={theme.blue}
            appearAt={20}
            delay={10}
            width={420}
          />
          <Card
            icon="🎵"
            title="Áudio + LLM"
            subtitle="Suno · F5-TTS · MMAudio · gateway OpenAI-compat"
            accent={theme.yellow}
            appearAt={20}
            delay={20}
            width={420}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
