import React from "react";
import { Composition } from "remotion";
import { Video, VideoProps } from "./Video";
import { fps, height, totalDuration, width } from "./theme";

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="PiApiSkillsTutorialEn"
        component={Video}
        durationInFrames={totalDuration}
        fps={fps}
        width={width}
        height={height}
        defaultProps={{ locale: "en" } as VideoProps}
      />
      <Composition
        id="PiApiSkillsTutorialPt"
        component={Video}
        durationInFrames={totalDuration}
        fps={fps}
        width={width}
        height={height}
        defaultProps={{ locale: "pt" } as VideoProps}
      />
    </>
  );
};
