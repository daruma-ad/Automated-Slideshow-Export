import React from 'react';
import { Audio, AbsoluteFill } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
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

            <TransitionSeries>
                {slides.map((slide, index) => {
                    const durationFrames = Math.floor(slide.duration * COMP_FPS);
                    return (
                        <React.Fragment key={slide.id}>
                            <TransitionSeries.Sequence durationInFrames={durationFrames}>
                                <Slide slide={slide} subtitleStyle={subtitleStyle} />
                            </TransitionSeries.Sequence>
                            {index < slides.length - 1 && (
                                <TransitionSeries.Transition
                                    presentation={fade()}
                                    timing={linearTiming({ durationInFrames: 15 })}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </TransitionSeries>
        </AbsoluteFill>
    );
};
