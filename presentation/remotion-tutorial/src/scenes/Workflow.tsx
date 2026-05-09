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

type Step = {
  index: number;
  title: string;
  endpoint: string;
  detail: string;
  color: string;
};

const StepBlock: React.FC<{ s: Step; appearAt: number }> = ({
  s,
  appearAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame: frame - appearAt,
    fps,
    config: { damping: 14, stiffness: 100, mass: 0.6 },
  });
  return (
    <div
      style={{
        width: 460,
        padding: "36px 32px",
        background: `linear-gradient(180deg, ${theme.panel}, ${theme.bgSoft})`,
        border: `1px solid ${s.color}66`,
        borderRadius: 22,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        boxShadow: `0 30px 70px rgba(0,0,0,0.6), 0 0 40px ${s.color}22 inset`,
        opacity: enter,
        transform: `translateY(${(1 - enter) * 30}px) scale(${0.94 + enter * 0.06})`,
        fontFamily: theme.fontSans,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: s.color,
          color: theme.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 900,
          fontSize: 32,
          boxShadow: `0 0 24px ${s.color}88`,
        }}
      >
        {s.index}
      </div>
      <div style={{ color: theme.text, fontSize: 38, fontWeight: 800 }}>
        {s.title}
      </div>
      <code
        style={{
          color: s.color,
          fontFamily: theme.fontMono,
          fontSize: 22,
          background: theme.bg,
          padding: "10px 14px",
          borderRadius: 8,
          border: `1px solid ${theme.border}`,
        }}
      >
        {s.endpoint}
      </code>
      <div style={{ color: theme.textMuted, fontSize: 20 }}>{s.detail}</div>
    </div>
  );
};

const Arrow: React.FC<{ appearAt: number }> = ({ appearAt }) => {
  const frame = useCurrentFrame();
  const local = frame - appearAt;
  const grow = interpolate(local, [0, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const glow = 0.6 + Math.sin(frame / 8) * 0.4;
  return (
    <div
      style={{
        width: 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: `${grow * 80}px`,
          height: 4,
          background: `linear-gradient(90deg, ${theme.green}, ${theme.yellow}, ${theme.pink})`,
          boxShadow: `0 0 ${10 + glow * 14}px ${theme.yellow}`,
          borderRadius: 4,
          position: "relative",
        }}
      >
        <span
          style={{
            position: "absolute",
            right: -6,
            top: -8,
            width: 0,
            height: 0,
            borderTop: "10px solid transparent",
            borderBottom: "10px solid transparent",
            borderLeft: `12px solid ${theme.pink}`,
            opacity: grow,
          }}
        />
      </div>
    </div>
  );
};

export const Workflow: React.FC<{ s: Strings }> = ({ s }) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [190, 210], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const steps: Step[] = [
    {
      index: 1,
      title: s.workflow.steps[0].title,
      endpoint: "POST /api/v1/task",
      detail: s.workflow.steps[0].detail,
      color: theme.green,
    },
    {
      index: 2,
      title: s.workflow.steps[1].title,
      endpoint: "GET /api/v1/task/{id}",
      detail: s.workflow.steps[1].detail,
      color: theme.yellow,
    },
    {
      index: 3,
      title: s.workflow.steps[2].title,
      endpoint: "data.output → URL",
      detail: s.workflow.steps[2].detail,
      color: theme.pink,
    },
  ];

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
      <Background variant="grid" accent={theme.yellow} />
      <AbsoluteFill
        style={{
          flexDirection: "column",
          padding: "100px 100px",
          gap: 60,
        }}
      >
        <Title
          eyebrow={s.workflow.eyebrow}
          title={s.workflow.title}
          subtitle={s.workflow.subtitle}
          align="left"
          accent={theme.yellow}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginTop: 30,
          }}
        >
          <StepBlock s={steps[0]} appearAt={20} />
          <Arrow appearAt={50} />
          <StepBlock s={steps[1]} appearAt={70} />
          <Arrow appearAt={100} />
          <StepBlock s={steps[2]} appearAt={120} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
