import { NextRequest, NextResponse } from 'next/server';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { join, extname } from 'path';
import { mkdir, access, readFile } from 'fs/promises';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        let { slides, subtitleStyle, bgm, aspectRatio } = body;

        // --- 1. Process Slides (Images -> Base64, Videos -> File URL) ---
        const processedSlides = await Promise.all(slides.map(async (s: any) => {
            let src = s.src;

            // Clean up URL if it comes as localhost http
            if (src.startsWith('http')) {
                try {
                    const url = new URL(src);
                    src = url.pathname;
                } catch (e) {
                    // ignore
                }
            }

            if (src.startsWith('/uploads/')) {
                const fsPath = join(process.cwd(), 'public', src);

                // For Images: Use Base64 to avoid local file permission issues in Headless Chrome
                if (s.type === 'image') {
                    try {
                        const fileBuffer = await readFile(fsPath);
                        const ext = extname(fsPath).substring(1).toLowerCase(); // e.g. 'jpg', 'png'
                        const mimeType = ext === 'jpg' ? 'jpeg' : ext;
                        const base64 = fileBuffer.toString('base64');
                        return { ...s, src: `data:image/${mimeType};base64,${base64}` };
                    } catch (e) {
                        console.error("Failed to read image file:", fsPath, e);
                        // Fallback to file URL if read fails
                        const normalizedPath = fsPath.replace(/\\/g, '/');
                        return { ...s, src: `file://${normalizedPath}` };
                    }
                }

                // For Videos: Base64 is too heavy, keep using File URL (usually <Video> tag handles this better or we hope)
                if (s.type === 'video') {
                    const normalizedPath = fsPath.replace(/\\/g, '/');
                    return { ...s, src: `file://${normalizedPath}` };
                }
            }
            return s;
        }));

        // --- 2. Process BGM ---
        let audioUrl: string | undefined = undefined;
        let finalBgm = bgm;

        if (bgm) {
            const bgmPath = join(process.cwd(), 'public', 'bgm', `${bgm}.mp3`);
            try {
                // Read audio file and convert to Base64 to avoid file:// permission issues in Headless Chrome
                const audioBuffer = await readFile(bgmPath);
                const base64Audio = audioBuffer.toString('base64');
                audioUrl = `data:audio/mp3;base64,${base64Audio}`;
            } catch (e) {
                console.warn(`BGM file not found or could not be read: ${bgmPath}. Rendering without audio.`);
                console.error(e);
                finalBgm = null;
                audioUrl = undefined;
            }
        } else if (body.customAudioPath) {
            // Handle uploaded custom audio
            const audioPath = join(process.cwd(), 'public', body.customAudioPath);
            try {
                const audioBuffer = await readFile(audioPath);
                const base64Audio = audioBuffer.toString('base64');
                // Detect mime type roughly or just assume mp3/wav/m4a works with audio/mp3 or general
                // Better to check extension;
                const ext = extname(audioPath).substring(1).toLowerCase();
                let mime = 'audio/mpeg';
                if (ext === 'wav') mime = 'audio/wav';
                if (ext === 'm4a' || ext === 'mp4') mime = 'audio/mp4';

                audioUrl = `data:${mime};base64,${base64Audio}`;
                finalBgm = 'custom'; // Just to ensure Audio component renders if logic checks for bgm presence
            } catch (e) {
                console.error("Failed to read custom audio:", audioPath, e);
            }
        }

        // --- 3. Prepare Input Props ---
        const inputProps = {
            slides: processedSlides,
            subtitleStyle,
            bgm: finalBgm,
            audioUrl
        };

        // --- 4. Bundle & Render ---
        const entry = join(process.cwd(), 'src', 'remotion', 'index.ts');
        const bundleLocation = await bundle({
            entryPoint: entry,
            webpackOverride: (config) => config,
        });

        const compositionId = 'Slideshow';
        const composition = await selectComposition({
            serveUrl: bundleLocation,
            id: compositionId,
            inputProps,
            timeoutInMilliseconds: 120000,
        });

        const outputDir = join(process.cwd(), 'public', 'out');
        await mkdir(outputDir, { recursive: true });

        const fileName = `slideshow-${Date.now()}.mp4`;
        const outputPath = join(outputDir, fileName);

        await renderMedia({
            composition,
            serveUrl: bundleLocation,
            codec: 'h264',
            outputLocation: outputPath,
            inputProps,
            timeoutInMilliseconds: 120000,
        });

        return NextResponse.json({ success: true, url: `/out/${fileName}` });

    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
