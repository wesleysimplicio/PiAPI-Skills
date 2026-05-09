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
import { Strings } from "../locale";

type Agent = {
  name: string;
  emoji: string;
  path: string;
  color: string;
};

const AgentRow: React.FC<{ a: Agent; appearAt: number }> = ({ a, appearAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame: frame - appearAt,
    fps,
    config: { damping: 14, stiffness: 110, mass: 0.5 },
  });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        padding: "22px 28px",
        background: theme.panel,
        border: `1px solid ${theme.border}`,
        borderLeft: `4px solid ${a.color}`,
        borderRadius: 14,
        opacity: enter,
        transform: `translateX(${(1 - enter) * -40}px)`,
        fontFamily: theme.fontSans,
        boxShadow: `0 12px 30px rgba(0,0,0,0.4)`,
      }}
    >
      <span style={{ fontSize: 44 }}>{a.emoji}</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ color: theme.text, fontSize: 28, fontWeight: 700 }}>
          {a.name}
        </span>
        <code
          style={{
            color: a.color,
            fontFamily: theme.fontMono,
            fontSize: 18,
          }}
        >
          {a.path}
        </code>
      </div>
    </div>
  );
};

export const Agents: React.FC<{ s: Strings }> = ({ s }) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [190, 210], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const agents: Agent[] = [
    { name: "Claude Code", emoji: "🤖", path: "~/.claude/skills/piapi/", color: theme.yellow },
    { name: "Codex", emoji: "🟢", path: "~/.codex/skills/piapi/", color: theme.green },
    { name: "Cursor", emoji: "🪄", path: "~/.cursor/skills/piapi/", color: theme.blue },
    { name: "Hermes", emoji: "🔮", path: "~/.hermes/skills/creative/piapi/", color: theme.purple },
    { name: "Copilot", emoji: "🧭", path: ".github/copilot-instructions.md", color: theme.pink },
    { name: s.agents.others, emoji: "✨", path: "~/.config/agents/skills/piapi/", color: theme.textMuted },
  ];

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
      <Background variant="mesh" accent={theme.blue} />
      <AbsoluteFill
        style={{
          flexDirection: "column",
          padding: "80px 100px",
          gap: 50,
        }}
      >
        <Title
          eyebrow={s.agents.eyebrow}
          title={s.agents.title}
          subtitle={s.agents.subtitle}
          align="left"
          accent={theme.blue}
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 22,
            marginTop: 20,
          }}
        >
          {agents.map((a, i) => (
            <AgentRow key={a.name} a={a} appearAt={20 + i * 10} />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
