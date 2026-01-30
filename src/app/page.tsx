"use client";

import React, { useState, useCallback } from 'react';
import { Player } from '@remotion/player';
import { UploadArea } from '@/components/UploadArea';
import { Timeline, SlideData } from '@/components/Timeline';
import { Controls, AspectRatio, SubtitleStyle } from '@/components/Controls';
import { MyComposition, COMP_FPS } from '@/remotion/Composition';

export default function Home() {
  // State
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [subtitleStyle, setSubtitleStyle] = useState<SubtitleStyle>('simple');
  const [bgm, setBgm] = useState<string | null>(null);
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null);
  const [customAudioFile, setCustomAudioFile] = useState<File | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);

  // Constants
  const width = aspectRatio === '16:9' ? 1920 : 1080;
  const height = aspectRatio === '16:9' ? 1080 : 1920;

  // Handler for custom BGM upload
  const handleBgmUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setCustomAudioUrl(url);
    setCustomAudioFile(file);
    setBgm(null); // Clear preset BGM
  };

  // Handler for file upload
  const handleFilesAccepted = useCallback((files: File[]) => {
    const newSlides: SlideData[] = files.map((file) => ({
      id: Math.random().toString(36).substring(7),
      type: file.type.startsWith('video/') ? 'video' : 'image',
      src: URL.createObjectURL(file),
      text: file.name.split('.')[0], // Default text from filename
      duration: 3, // Default 3s
    }));
    setSlides((prev) => [...prev, ...newSlides]);
  }, []);

  // Handlers for Timeline
  const handleRemoveSlide = (id: string) => {
    setSlides((prev) => prev.filter((s) => s.id !== id));
  };

  const handleUpdateText = (id: string, text: string) => {
    setSlides((prev) => prev.map((s) => s.id === id ? { ...s, text } : s));
  };

  const handleUpdateDuration = (id: string, duration: number) => {
    setSlides((prev) => prev.map((s) => s.id === id ? { ...s, duration } : s));
  };

  // Calculate total duration in frames
  const totalDurationSeconds = slides.reduce((acc, slide) => acc + slide.duration, 0);
  const durationInFrames = Math.max(1, Math.ceil(totalDurationSeconds * COMP_FPS));

  const handleClearAllText = () => {
    if (confirm('Are you sure you want to clear all captions?')) {
      setSlides((prev) => prev.map((s) => ({ ...s, text: '' })));
    }
  };

  const handleExport = async () => {
    if (slides.length === 0) return;
    setIsExporting(true);
    setExportedUrl(null);

    try {
      const sessionId = Math.random().toString(36).substring(7);

      // 1. Upload files
      const processedSlides = await Promise.all(slides.map(async (slide) => {
        if (slide.src.startsWith('blob:')) {
          const response = await fetch(slide.src);
          const blob = await response.blob();
          const file = new File([blob], `${slide.id}.${slide.type === 'video' ? 'mp4' : 'jpg'}`, { type: blob.type });

          const formData = new FormData();
          formData.append('file', file);
          formData.append('sessionId', sessionId);

          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          });
          const data = await uploadRes.json();
          if (data.success) {
            return { ...slide, src: data.path }; // Use server path
          }
        }
        return slide;
      }));

      // 2. Upload Custom BGM if exists
      let uploadedAudioUrl = undefined;
      if (customAudioFile) {
        const formData = new FormData();
        formData.append('file', customAudioFile);
        formData.append('sessionId', sessionId);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        const data = await uploadRes.json();
        if (data.success) {
          uploadedAudioUrl = `file://${process.cwd()}/public${data.path}`; // Construct absolute file path for server usage logic or reuse reading logic?
          // Actually, my render API logic for BGM reads from bgm ID OR expects audioUrl.
          // If I pass audioUrl string as a path, render API needs to know how to handle it.
          // Currently render API handles `bgm` (id) -> public/bgm/{id}.mp3
          // AND `audioUrl` input prop. 
          // My modified render API (Step 161) handles `bgm` -> reads file -> base64.
          // But it doesn't do special base64 conversion for `audioUrl` passed in inputProps!
          // Wait, render API step 152: 
          // `let { slides, subtitleStyle, bgm, aspectRatio } = body;`
          // `const inputProps = { ..., audioUrl }`
          // If I pass `audioUrl` in `body` (Step 88 of render/route.ts), does it use it?
          // In the original code (Step 152), audioUrl is derived from `bgm`.
          // I need to update render/route.ts to ALSO accept an explicit `audioUrl` from request body!

          // Let's set uploadedAudioUrl to the relative path for now, enabling render API to locate it.
          uploadedAudioUrl = data.path;
        }
      }

      // 2. Render
      const renderRes = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slides: processedSlides,
          aspectRatio,
          subtitleStyle,
          bgm: bgm, // if null, check customAudioUrl
          customAudioPath: uploadedAudioUrl // Passing this new param
        })
      });

      const renderData = await renderRes.json();
      if (renderData.success) {
        setExportedUrl(renderData.url);
      } else {
        alert('Render failed: ' + renderData.error);
      }

    } catch (error) {
      console.error(error);
      alert('An error occurred during export.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 py-4 px-6 shadow-sm sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-800">SwipeShow Studio</h1>
      </header>

      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1800px] mx-auto w-full">
        {/* Left Column: Controls & Timeline */}
        <div className="lg:col-span-5 space-y-6 overflow-y-auto h-[calc(100vh-100px)]">
          <UploadArea onFilesAccepted={handleFilesAccepted} />

          <Controls
            aspectRatio={aspectRatio}
            setAspectRatio={setAspectRatio}
            subtitleStyle={subtitleStyle}
            setSubtitleStyle={setSubtitleStyle}
            bgm={bgm}
            setBgm={(b) => {
              setBgm(b);
              if (b) {
                setCustomAudioUrl(null);
                setCustomAudioFile(null);
              }
            }}
            onExport={handleExport}
            isExporting={isExporting}
            onClearAllText={handleClearAllText}
            onBgmUpload={handleBgmUpload}
          />

          <Timeline
            slides={slides}
            onRemove={handleRemoveSlide}
            onUpdateText={handleUpdateText}
            onUpdateDuration={handleUpdateDuration}
          />
        </div>

        {/* Right Column: Preview */}
        <div className="lg:col-span-7 flex flex-col items-center justify-start sticky top-24">
          <div className="bg-black rounded-lg shadow-2xl overflow-hidden border border-gray-800"
            style={{
              aspectRatio: aspectRatio === '16:9' ? '16/9' : '9/16',
              width: '100%',
              maxWidth: aspectRatio === '16:9' ? '800px' : '450px'
            }}
          >
            {slides.length > 0 ? (
              <Player
                component={MyComposition}
                inputProps={{
                  slides,
                  subtitleStyle,
                  bgm,
                  audioUrl: customAudioUrl || undefined // Pass blob URL for preview
                }}
                durationInFrames={durationInFrames}
                fps={COMP_FPS}
                compositionWidth={width}
                compositionHeight={height}
                style={{
                  width: '100%',
                  height: '100%',
                }}
                controls
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                Preview will appear here
              </div>
            )}
          </div>

          {slides.length > 0 && (
            <div className="mt-4 text-sm text-gray-500">
              Total Duration: {totalDurationSeconds}s ({durationInFrames} frames)
            </div>
          )}

          {exportedUrl && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 text-center w-full max-w-md">
              <p className="text-green-800 font-medium mb-2">🎉 Video Ready!</p>
              <a
                href={exportedUrl}
                download
                className="inline-block bg-green-600 text-white px-6 py-2 rounded-full font-bold hover:bg-green-700 transition"
              >
                Download MP4
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
