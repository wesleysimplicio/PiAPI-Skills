import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";
import { sceneDurations, theme } from "./theme";
import { Locale, strings } from "./locale";
import { Intro } from "./scenes/Intro";
import { WhatIsIt } from "./scenes/WhatIsIt";
import { Install } from "./scenes/Install";
import { Configure } from "./scenes/Configure";
import { CLITour } from "./scenes/CLITour";
import { Models } from "./scenes/Models";
import { Workflow } from "./scenes/Workflow";
import { Agents } from "./scenes/Agents";
import { Outro } from "./scenes/Outro";

const ProgressBar: React.FC<{ totalFrames: number }> = ({ totalFrames }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, totalFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 6,
        background: "rgba(255,255,255,0.06)",
        zIndex: 10,
      }}
    >
      <div
        style={{
          width: `${progress * 100}%`,
          height: "100%",
          background: `linear-gradient(90deg, ${theme.yellow}, ${theme.green}, ${theme.blue}, ${theme.pink})`,
          boxShadow: `0 0 12px ${theme.yellow}88`,
        }}
      />
    </div>
  );
};

const Watermark: React.FC<{ locale: Locale }> = ({ locale }) => (
  <div
    style={{
      position: "absolute",
      top: 32,
      right: 40,
      padding: "8px 16px",
      borderRadius: 999,
      border: `1px solid ${theme.border}`,
      background: "rgba(13,13,15,0.6)",
      color: theme.textMuted,
      fontFamily: theme.fontMono,
      fontSize: 18,
      letterSpacing: 2,
      zIndex: 9,
      backdropFilter: "blur(8px)",
    }}
  >
    PiAPI · Skills · v1 · {locale.toUpperCase()}
  </div>
);

export type VideoProps = { locale: Locale };

export const Video: React.FC<VideoProps> = ({ locale }) => {
  const totalFrames = Object.values(sceneDurations).reduce((a, b) => a + b, 0);
  const s = strings[locale];

  let cursor = 0;
  const at = (n: number) => {
    const v = cursor;
    cursor += n;
    return v;
  };

  return (
    <AbsoluteFill style={{ background: theme.bg }}>
      <Sequence from={at(sceneDurations.intro)} durationInFrames={sceneDurations.intro}>
        <Intro s={s} />
      </Sequence>
      <Sequence from={at(sceneDurations.whatIsIt)} durationInFrames={sceneDurations.whatIsIt}>
        <WhatIsIt s={s} />
      </Sequence>
      <Sequence from={at(sceneDurations.install)} durationInFrames={sceneDurations.install}>
        <Install s={s} />
      </Sequence>
      <Sequence from={at(sceneDurations.configure)} durationInFrames={sceneDurations.configure}>
        <Configure s={s} />
      </Sequence>
      <Sequence from={at(sceneDurations.cliTour)} durationInFrames={sceneDurations.cliTour}>
        <CLITour s={s} />
      </Sequence>
      <Sequence from={at(sceneDurations.models)} durationInFrames={sceneDurations.models}>
        <Models s={s} />
      </Sequence>
      <Sequence from={at(sceneDurations.workflow)} durationInFrames={sceneDurations.workflow}>
        <Workflow s={s} />
      </Sequence>
      <Sequence from={at(sceneDurations.agents)} durationInFrames={sceneDurations.agents}>
        <Agents s={s} />
      </Sequence>
      <Sequence from={at(sceneDurations.outro)} durationInFrames={sceneDurations.outro}>
        <Outro s={s} />
      </Sequence>
      <Watermark locale={locale} />
      <ProgressBar totalFrames={totalFrames} />
    </AbsoluteFill>
  );
};
