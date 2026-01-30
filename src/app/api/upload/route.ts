import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(req: NextRequest) {
    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;
    const sessionId = data.get('sessionId') as string;

    if (!file || !sessionId) {
        return NextResponse.json({ success: false, message: 'Missing file or sessionId' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = join(process.cwd(), 'public', 'uploads', sessionId);
    await mkdir(uploadDir, { recursive: true });

    const filePath = join(uploadDir, file.name);
    await writeFile(filePath, buffer);

    // Return web-accessible path
    const publicPath = `/uploads/${sessionId}/${file.name}`;
    return NextResponse.json({ success: true, path: publicPath });
}
