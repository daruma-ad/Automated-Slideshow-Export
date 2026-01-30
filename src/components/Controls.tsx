"use client";

import React from 'react';
import { Settings, Music, Type } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SubtitleStyle = 'simple' | 'center' | 'handwritten' | 'minimal';
export type AspectRatio = '16:9' | '9:16';

interface ControlsProps {
    aspectRatio: AspectRatio;
    setAspectRatio: (r: AspectRatio) => void;
    subtitleStyle: SubtitleStyle;
    setSubtitleStyle: (s: SubtitleStyle) => void;
    bgm: string | null;
    setBgm: (b: string | null) => void;
    onExport: () => void;
    isExporting: boolean;
}

export function Controls({
    aspectRatio,
    setAspectRatio,
    subtitleStyle,
    setSubtitleStyle,
    bgm,
    setBgm,
    onExport,
    isExporting
}: ControlsProps) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-6">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <Settings size={18} /> Settings
            </h3>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 block">Aspect Ratio</label>
                <div className="flex gap-2">
                    {(['16:9', '9:16'] as AspectRatio[]).map((ratio) => (
                        <button
                            key={ratio}
                            onClick={() => setAspectRatio(ratio)}
                            className={cn(
                                "flex-1 py-2 px-4 rounded text-sm border transition-colors",
                                aspectRatio === ratio
                                    ? "bg-blue-50 border-blue-500 text-blue-700 font-semibold"
                                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                            )}
                        >
                            {ratio}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 block flex items-center gap-1">
                    <Type size={14} /> Subtitle Style
                </label>
                <select
                    value={subtitleStyle}
                    onChange={(e) => setSubtitleStyle(e.target.value as SubtitleStyle)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                    <option value="simple">Simple (Bottom)</option>
                    <option value="center">Center / Big</option>
                    <option value="handwritten">Handwritten</option>
                    <option value="minimal">Minimal (Corner)</option>
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 block flex items-center gap-1">
                    <Music size={14} /> Background Music
                </label>
                <select
                    value={bgm || ''}
                    onChange={(e) => setBgm(e.target.value || null)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                    <option value="">None</option>
                    <option value="upbeat">Upbeat</option>
                    <option value="calm">Calm / Piano</option>
                    <option value="lofi">Lo-Fi</option>
                </select>
            </div>
            <div className="pt-4 border-t border-gray-100">
                <button
                    onClick={onExport}
                    disabled={isExporting}
                    className={cn(
                        "w-full py-3 rounded-lg font-bold text-white transition-all shadow-md flex items-center justify-center gap-2",
                        isExporting
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                    )}
                >
                    {isExporting ? 'Creating Video...' : 'Export Video (MP4)'}
                </button>
            </div>
        </div>
    );
}
