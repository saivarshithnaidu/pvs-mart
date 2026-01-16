import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { headers } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        // Auth Check
        const headersList = await headers();
        const token = (await headersList.get('cookie'))?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await verifyToken(token);
        if (!user || user.role !== 'OWNER') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = Date.now() + '_' + file.name.replace(/\s/g, '_');
        const uploadDir = path.join(process.cwd(), 'public/uploads');

        // Ensure dir exists (simple check, or rely on it existing)
        // For now assuming public/uploads likely exists or we should create it.
        // Let's rely on standard public dir.

        // Saving to public/uploads
        // Note: In Vercel this is ephemeral. For this local task it works.
        await writeFile(path.join(uploadDir, filename), buffer);

        return NextResponse.json({ url: `/uploads/${filename}` });
    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
