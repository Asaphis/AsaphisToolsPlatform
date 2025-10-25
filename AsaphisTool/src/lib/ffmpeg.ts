'use client';

// Dynamic-load ffmpeg only on client to avoid SSR import issues
import type { FFmpeg } from '@ffmpeg/ffmpeg';

let ffmpeg: FFmpeg | null = null;
let loading = false;

export async function getFFmpeg(log = false): Promise<FFmpeg> {
  if (ffmpeg) return ffmpeg as FFmpeg;
  if (typeof window === 'undefined') throw new Error('FFmpeg can only run in the browser');
  if (loading) {
    await new Promise((r) => setTimeout(r, 100));
    return getFFmpeg(log);
  }
  loading = true;
  try {
    const mod: any = await import('@ffmpeg/ffmpeg');
    const _createFFmpeg = (mod as any).createFFmpeg || (mod.default && mod.default.createFFmpeg);
    if (!_createFFmpeg) throw new Error('Failed to load FFmpeg module');
    const _ffmpeg: any = _createFFmpeg({ log });
    await _ffmpeg.load();
    ffmpeg = _ffmpeg as FFmpeg;
    return ffmpeg;
  } finally {
    loading = false;
  }
}

export async function transcodeFile(options: {
  inputFile: File;
  outputName: string; // e.g., output.mp3
  args: string[]; // ffmpeg args, include -i inputName and outputName
  log?: boolean;
}): Promise<{ blob: Blob; outputName: string }>{
  const { inputFile, outputName, args, log } = options;
  const ff = await getFFmpeg(!!log) as any;
  const inputName = `in_${Date.now()}_${sanitizeName(inputFile.name)}`;

  const mod: any = await import('@ffmpeg/ffmpeg');
  const _fetchFile = mod.fetchFile || (mod.default && mod.default.fetchFile);
  ff.FS('writeFile', inputName, await _fetchFile(inputFile));
  await ff.run(...argsWithOutput(args, inputName, outputName));
  const data = ff.FS('readFile', outputName);
  const blob = new Blob([data.buffer], { type: mimeFromName(outputName) });
  // clean up
  safeUnlink(ff, inputName);
  safeUnlink(ff, outputName);
  return { blob, outputName };
}

export async function videoToGif(options: {
  inputFile: File;
  fps?: number;
  width?: number; // keep aspect
  log?: boolean;
}): Promise<{ blob: Blob; outputName: string }>{
  const { inputFile, fps = 10, width = 480, log } = options;
  const ff = await getFFmpeg(!!log) as any;
  const inputName = `in_${Date.now()}_${sanitizeName(inputFile.name)}`;
  const palette = 'palette.png';
  const out = changeExt(inputName, 'gif');

  const mod: any = await import('@ffmpeg/ffmpeg');
  const _fetchFile = mod.fetchFile || (mod.default && mod.default.fetchFile);
  ff.FS('writeFile', inputName, await _fetchFile(inputFile));

  // 1) palettegen
  await ff.run(
    '-i', inputName,
    '-vf', `fps=${fps},scale=${width}:-1:flags=lanczos,palettegen`,
    '-y', palette
  );

  // 2) paletteuse
  await ff.run(
    '-i', inputName,
    '-i', palette,
    '-lavfi', `fps=${fps},scale=${width}:-1:flags=lanczos[x];[x][1:v]paletteuse`,
    '-y', out
  );

  const data = ff.FS('readFile', out);
  const blob = new Blob([data.buffer], { type: 'image/gif' });
  // cleanup
  safeUnlink(ff, inputName);
  safeUnlink(ff, palette);
  safeUnlink(ff, out);
  return { blob, outputName: out };
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function safeUnlink(ff: any, name: string) {
  try { ff.FS('unlink', name); } catch {}
}

function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function changeExt(name: string, ext: string): string {
  const base = name.replace(/\.[^.]+$/, '');
  return `${base}.${ext}`;
}

function argsWithOutput(args: string[], inputName: string, outputName: string): string[] {
  // Replace placeholders and ensure proper input/output
  const replaced = args.map(a => a === 'INPUT' ? inputName : a === 'OUTPUT' ? outputName : a);
  const includeInput = replaced.includes('-i');
  const arr = includeInput ? [...replaced] : ['-i', inputName, ...replaced];
  // Ensure output name present at end
  const hasOutput = arr.includes(outputName);
  if (!hasOutput) arr.push(outputName);
  return arr;
}

function mimeFromName(name: string): string {
  if (name.endsWith('.mp3')) return 'audio/mpeg';
  if (name.endsWith('.ogg')) return 'audio/ogg';
  if (name.endsWith('.wav')) return 'audio/wav';
  if (name.endsWith('.mp4')) return 'video/mp4';
  if (name.endsWith('.webm')) return 'video/webm';
  if (name.endsWith('.mkv')) return 'video/x-matroska';
  if (name.endsWith('.gif')) return 'image/gif';
  return 'application/octet-stream';
}
