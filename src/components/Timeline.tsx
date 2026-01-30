"use client";

import React from 'react';
import { X, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
// Note: We will add drag-and-drop reordering logic later if needed, 
// for now simple list.

export interface SlideData {
    id: string;
    type: 'image' | 'video';
    src: string;
    text: string;
    duration: number;
}

interface TimelineProps {
    slides: SlideData[];
    onRemove: (id: string) => void;
    onUpdateText: (id: string, text: string) => void;
    onUpdateDuration: (id: string, duration: number) => void;
}

export function Timeline({ slides, onRemove, onUpdateText, onUpdateDuration }: TimelineProps) {
    if (slides.length === 0) {
        return <div className="text-gray-500 text-center py-8">No slides yet. Upload some media!</div>;
    }

    return (
        <div className="flex flex-col gap-4">
            {slides.map((slide, index) => (
                <div key={slide.id} className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="cursor-grab text-gray-400">
                        <GripVertical size={20} />
                    </div>
                    <div className="w-24 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0 relative">
                        {slide.type === 'image' ? (
                            <img src={slide.src} alt="Thumbnail" className="w-full h-full object-cover" />
                        ) : (
                            <video src={slide.src} className="w-full h-full object-cover" />
                        )}
                        <div className="absolute bottom-0 right-0 bg-black/50 text-white text-[10px] px-1">
                            {slide.type === 'video' ? 'VIDEO' : 'IMG'}
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-2">
                        <input
                            type="text"
                            placeholder="Enter slide text..."
                            value={slide.text}
                            onChange={(e) => onUpdateText(slide.id, e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="text-xs text-gray-500 flex gap-2 items-center">
                            <span>Duration:</span>
                            <select
                                value={slide.duration}
                                onChange={(e) => onUpdateDuration(slide.id, Number(e.target.value))}
                                className="border border-gray-300 rounded px-1"
                            >
                                <option value={3}>3s</option>
                                <option value={5}>5s</option>
                                <option value={8}>8s</option>
                                <option value={10}>10s</option>
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={() => onRemove(slide.id)}
                        className="text-red-400 hover:text-red-600 p-2"
                    >
                        <X size={20} />
                    </button>
                </div>
            ))}
        </div>
    );
}
