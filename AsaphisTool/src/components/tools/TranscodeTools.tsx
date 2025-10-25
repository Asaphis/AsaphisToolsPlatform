"use client";

import { useState } from "react";
import { transcodeFile, downloadBlob, videoToGif } from "@/lib/ffmpeg";

export function MP4ToMP3() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);

  const run = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const outName = file.name.replace(/\.[^.]+$/, "") + ".mp3";
      const { blob, outputName } = await transcodeFile({
        inputFile: file,
        outputName: outName,
        args: ["-i", "INPUT", "-vn", "-c:a", "libmp3lame", "-b:a", "192k", "OUTPUT"],
      } as any);
      downloadBlob(blob, outputName);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-3">
      <input type="file" accept="video/mp4" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button className="px-4 py-2 bg-primary-600 text-white rounded disabled:opacity-50" disabled={!file || processing} onClick={run}>
        {processing ? "Converting..." : "Convert MP4 → MP3"}
      </button>
    </div>
  );
}

export function MP3ToOGG() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);

  const run = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const outName = file.name.replace(/\.[^.]+$/, "") + ".ogg";
      const { blob, outputName } = await transcodeFile({
        inputFile: file,
        outputName: outName,
        args: ["-i", "INPUT", "-c:a", "libvorbis", "-qscale:a", "5", "OUTPUT"],
      } as any);
      downloadBlob(blob, outputName);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-3">
      <input type="file" accept="audio/mpeg" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button className="px-4 py-2 bg-primary-600 text-white rounded disabled:opacity-50" disabled={!file || processing} onClick={run}>
        {processing ? "Converting..." : "Convert MP3 → OGG"}
      </button>
    </div>
  );
}

export function MP4Converter() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);

  const run = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const outName = file.name.replace(/\.[^.]+$/, "") + ".mp4";
      const { blob, outputName } = await transcodeFile({
        inputFile: file,
        outputName: outName,
        args: ["-i", "INPUT", "-c:v", "libx264", "-preset", "medium", "-crf", "23", "-c:a", "aac", "-b:a", "192k", "-movflags", "faststart", "OUTPUT"],
      } as any);
      downloadBlob(blob, outputName);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-3">
      <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button className="px-4 py-2 bg-primary-600 text-white rounded disabled:opacity-50" disabled={!file || processing} onClick={run}>
        {processing ? "Converting..." : "Convert to MP4"}
      </button>
    </div>
  );
}

export function MOVToMP4() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);

  const run = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const outName = file.name.replace(/\.[^.]+$/, "") + ".mp4";
      const { blob, outputName } = await transcodeFile({
        inputFile: file,
        outputName: outName,
        args: ["-i", "INPUT", "-c:v", "libx264", "-preset", "medium", "-crf", "23", "-c:a", "aac", "-b:a", "192k", "-movflags", "faststart", "OUTPUT"],
      } as any);
      downloadBlob(blob, outputName);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-3">
      <input type="file" accept="video/quicktime,.mov" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button className="px-4 py-2 bg-primary-600 text-white rounded disabled:opacity-50" disabled={!file || processing} onClick={run}>
        {processing ? "Converting..." : "Convert MOV → MP4"}
      </button>
    </div>
  );
}

export function VideoConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<'mp4' | 'webm' | 'mkv'>('mp4');
  const [processing, setProcessing] = useState(false);

  const run = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const outName = file.name.replace(/\.[^.]+$/, "") + `.${format}`;
      const args = format === 'webm'
        ? ["-i", "INPUT", "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "33", "-c:a", "libopus", "OUTPUT"]
        : ["-i", "INPUT", "-c:v", "libx264", "-preset", "medium", "-crf", "23", "-c:a", "aac", "-b:a", "192k", "OUTPUT"];
      const { blob, outputName } = await transcodeFile({ inputFile: file, outputName: outName, args } as any);
      downloadBlob(blob, outputName);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <select className="border rounded px-2 py-1" value={format} onChange={(e) => setFormat(e.target.value as any)}>
          <option value="mp4">MP4 (H.264 + AAC)</option>
          <option value="webm">WEBM (VP9 + Opus)</option>
          <option value="mkv">MKV (H.264 + AAC)</option>
        </select>
      </div>
      <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button className="px-4 py-2 bg-primary-600 text-white rounded disabled:opacity-50" disabled={!file || processing} onClick={run}>
        {processing ? "Converting..." : "Convert Video"}
      </button>
    </div>
  );
}

export function VideoToGIF() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);

  const run = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const { blob, outputName } = await videoToGif({ inputFile: file, fps: 10, width: 480 });
      // rename file to .gif
      const name = file.name.replace(/\.[^.]+$/, "") + ".gif";
      downloadBlob(blob, name);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-3">
      <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button className="px-4 py-2 bg-primary-600 text-white rounded disabled:opacity-50" disabled={!file || processing} onClick={run}>
        {processing ? "Processing..." : "Convert Video → GIF"}
      </button>
    </div>
  );
}

export const MP4ToGIF = VideoToGIF;
export const WEBMToGIF = VideoToGIF;

export function GIFToMP4() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);

  const run = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const outName = file.name.replace(/\.[^.]+$/, "") + ".mp4";
      const { blob, outputName } = await transcodeFile({
        inputFile: file,
        outputName: outName,
        args: ["-i", "INPUT", "-movflags", "faststart", "-pix_fmt", "yuv420p", "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2", "OUTPUT"],
      } as any);
      downloadBlob(blob, outputName);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-3">
      <input type="file" accept="image/gif" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button className="px-4 py-2 bg-primary-600 text-white rounded disabled:opacity-50" disabled={!file || processing} onClick={run}>
        {processing ? "Converting..." : "Convert GIF → MP4"}
      </button>
    </div>
  );
}
