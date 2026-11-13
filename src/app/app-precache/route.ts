// Build-time list of everything the service worker must store so the app opens with no internet:
// all compiled JS/CSS/fonts, the public assets the UI uses, and every page (ids come from the demo snapshot).
// Prerendered once per build; `version` changes whenever the compiled files change (i.e. every deploy).
import { createHash } from 'node:crypto';
import { readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import snapshot from '@/demo/snapshot.json';

export const dynamic = 'force-static';

const PUBLIC_ASSETS = [
  '/offline.html',
  '/pwa-manifest',
  '/fonts/Cairo.ttf',
  '/image/test.png',
  '/image/under.png',
  '/icons/favicon-32.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon.png',
];

function listFiles(directory: string): string[] {
  try {
    return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? listFiles(path) : [path];
    });
  } catch {
    return [];
  }
}

export function GET() {
  const staticDir = join(process.cwd(), '.next', 'static');
  const compiled = listFiles(staticDir)
    .filter(file => !file.endsWith('.map'))
    .map(file => `/_next/static/${relative(staticDir, file).split(sep).map(encodeURIComponent).join('/')}`)
    .sort();

  const responses = (snapshot as { responses: Record<string, { body: unknown }> }).responses;
  const studentIds = (responses['students/students/compare/'].body as { student_id: number }[]).map(student => student.student_id);
  const teacherIds = (responses['students/teachers/compare'].body as { id: number }[]).map(teacher => teacher.id);
  const pages = ['/', '/student', ...studentIds.map(id => `/student/${id}`), ...teacherIds.map(id => `/teachers/${id}`)];

  const version = createHash('sha256').update(compiled.join('\n')).update(pages.join('\n')).digest('hex').slice(0, 16);
  return Response.json({ version, pages, assets: [...PUBLIC_ASSETS, ...compiled] });
}
