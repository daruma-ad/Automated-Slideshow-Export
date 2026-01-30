"use client";

import React, { useCallback } from 'react';
import { UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadAreaProps {
    onFilesAccepted: (files: File[]) => void;
    className?: string;
}

export function UploadArea({ onFilesAccepted, className }: UploadAreaProps) {
    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();

            const files = Array.from(e.dataTransfer.files).filter(
                (file) => file.type.startsWith('image/') || file.type.startsWith('video/')
            );

            if (files.length > 0) {
                onFilesAccepted(files);
            }
        },
        [onFilesAccepted]
    );

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files).filter(
                (file) => file.type.startsWith('image/') || file.type.startsWith('video/')
            );
            if (files.length > 0) {
                onFilesAccepted(files);
            }
        }
    };

    return (
        <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={cn(
                "border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer bg-gray-50 hover:bg-gray-100",
                className
            )}
        >
            <input
                type="file"
                id="file-upload"
                className="hidden"
                multiple
                accept="image/*,video/*"
                onChange={handleChange}
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700">
                    Click or Drag files to upload
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                    Supports JPG, PNG, MP4, MOV
                </p>
            </label>
        </div>
    );
}
