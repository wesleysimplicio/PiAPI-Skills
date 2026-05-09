import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { Background } from "../components/Background";
import { Title } from "../components/Title";
import { Card } from "../components/Card";
import { theme } from "../theme";
import { Strings } from "../locale";

const accents = [theme.pink, theme.blue, theme.yellow];
const icons = ["🎨", "🎬", "🎵"];

export const WhatIsIt: React.FC<{ s: Strings }> = ({ s }) => {
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
          eyebrow={s.whatIsIt.eyebrow}
          title={s.whatIsIt.title}
          subtitle={s.whatIsIt.subtitle}
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
          {s.whatIsIt.cards.map((c, i) => (
            <Card
              key={c.title}
              icon={icons[i]}
              title={c.title}
              subtitle={c.subtitle}
              accent={accents[i]}
              appearAt={20}
              delay={i * 10}
              width={420}
            />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
