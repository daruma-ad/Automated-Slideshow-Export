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
                durationInFrames={300} // Default placeholder, will be overridden by inputProps
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
