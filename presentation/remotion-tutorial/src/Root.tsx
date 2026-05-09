import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";
import { fps, height, totalDuration, width } from "./theme";

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="PiApiSkillsTutorial"
        component={Video}
        durationInFrames={totalDuration}
        fps={fps}
        width={width}
        height={height}
      />
    </>
  );
};
