import React from 'react';
import { Composition } from 'remotion';
import { MyComposition, COMP_FPS } from './Composition';
import '../app/globals.css'; // Ensure Tailwind works in render

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="Slideshow"
                component={MyComposition as any}
                calculateMetadata={({ props }) => {
                    const totalDurationSeconds = props.slides.reduce((acc: number, slide: any) => acc + (slide.duration || 3), 0);
                    return {
                        durationInFrames: Math.max(1, Math.ceil(totalDurationSeconds * COMP_FPS)),
                    };
                }}
                fps={COMP_FPS}
                width={1920}
                height={1080}
                defaultProps={{
                    slides: [],
                    subtitleStyle: 'simple',
                    bgm: null
                }}
            />
        </>
    );
};
