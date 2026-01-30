import React from 'react';
import { Series, Audio, AbsoluteFill } from 'remotion';
import { Slide } from './Slide';
import { SlideData } from '../components/Timeline';
import { SubtitleStyle } from '../components/Controls';

export const COMP_FPS = 30;

interface MyCompositionProps {
    slides: SlideData[];
    subtitleStyle: SubtitleStyle;
    bgm: string | null;
    audioUrl?: string;
}

export const MyComposition: React.FC<MyCompositionProps> = ({ slides, subtitleStyle, bgm, audioUrl }) => {
    const finalAudioSrc = audioUrl || (bgm ? `/bgm/${bgm}.mp3` : null);

    return (
        <AbsoluteFill>
            {finalAudioSrc && (
                <Audio
                    src={finalAudioSrc}
                    loop
                    volume={0.5}
                // Ideally we check if file exists or handle error, but for MVP we assume presence if selected
                />
            )}

            <Series>
                {slides.map((slide) => {
                    const durationFrames = Math.floor(slide.duration * COMP_FPS);
                    return (
                        <Series.Sequence key={slide.id} durationInFrames={durationFrames}>
                            <Slide slide={slide} subtitleStyle={subtitleStyle} />
                        </Series.Sequence>
                    );
                })}
            </Series>
        </AbsoluteFill>
    );
};
