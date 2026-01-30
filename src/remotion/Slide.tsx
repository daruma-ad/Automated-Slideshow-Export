import React from 'react';
import { AbsoluteFill, Img, Video, useVideoConfig } from 'remotion';
import { SlideData } from '../components/Timeline';
import { subtitleStyles } from './SubtitleStyles';
import { SubtitleStyle } from '../components/Controls';

interface SlideProps {
    slide: SlideData;
    subtitleStyle: SubtitleStyle;
}

export const Slide: React.FC<SlideProps> = ({ slide, subtitleStyle }) => {
    const { width, height } = useVideoConfig(); // use config if needed for dynamic sizing

    return (
        <AbsoluteFill style={{ backgroundColor: '#000' }}>
            {slide.type === 'image' ? (
                <Img
                    src={slide.src}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                    }}
                />
            ) : (
                <Video
                    src={slide.src}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                    }}
                />
            )}

            {slide.text && (
                <div style={subtitleStyles[subtitleStyle] || subtitleStyles.simple}>
                    {slide.text}
                </div>
            )}
        </AbsoluteFill>
    );
};
