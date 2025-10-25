"use client";

import { useState } from "react";
import { transcodeFile, downloadBlob } from "@/lib/ffmpeg";

export function VideoCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [crf, setCrf] = useState(28);
  const [processing, setProcessing] = useState(false);

  const run = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const outName = file.name.replace(/\.[^.]+$/, "") + "-compressed.mp4";
      const { blob, outputName } = await transcodeFile({
        inputFile: file,
        outputName: outName,
        args: [
          "-i","INPUT",
          "-c:v","libx264","-preset","fast","-crf", String(crf),
          "-c:a","aac","-b:a","128k",
          "-movflags","faststart",
          "OUTPUT"
        ],
      } as any);
      downloadBlob(blob, outputName);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="text-sm">Quality (CRF 18-35):</label>
        <input type="number" min={18} max={35} value={crf} onChange={(e)=>setCrf(parseInt(e.target.value)||28)} className="w-24 border rounded px-2 py-1" />
      </div>
      <input type="file" accept="video/*" onChange={(e)=>setFile(e.target.files?.[0]||null)} />
      <button onClick={run} disabled={!file||processing} className="px-4 py-2 bg-primary-600 text-white rounded disabled:opacity-50">
        {processing?"Compressing...":"Compress Video"}
      </button>
    </div>
  );
}

export function MP3Compressor() {
  const [file, setFile] = useState<File | null>(null);
  const [bitrate, setBitrate] = useState(128);
  const [processing, setProcessing] = useState(false);

  const run = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const outName = file.name.replace(/\.[^.]+$/, "") + `-${bitrate}k.mp3`;
      const { blob, outputName } = await transcodeFile({
        inputFile: file,
        outputName: outName,
        args: ["-i","INPUT","-c:a","libmp3lame","-b:a", String(bitrate) + "k", "OUTPUT"],
      } as any);
      downloadBlob(blob, outputName);
    } finally { setProcessing(false); }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="text-sm">Bitrate:</label>
        <select value={bitrate} onChange={(e)=>setBitrate(parseInt(e.target.value))} className="border rounded px-2 py-1">
          <option value={96}>96 kbps</option>
          <option value={128}>128 kbps</option>
          <option value={192}>192 kbps</option>
          <option value={256}>256 kbps</option>
        </select>
      </div>
      <input type="file" accept="audio/mpeg" onChange={(e)=>setFile(e.target.files?.[0]||null)} />
      <button onClick={run} disabled={!file||processing} className="px-4 py-2 bg-primary-600 text-white rounded disabled:opacity-50">
        {processing?"Compressing...":"Compress MP3"}
      </button>
    </div>
  );
}

export function WAVCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);

  const run = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const outName = file.name.replace(/\.[^.]+$/, "") + "-compressed.wav";
      const { blob, outputName } = await transcodeFile({
        inputFile: file,
        outputName: outName,
        args: ["-i","INPUT","-c:a","adpcm_ima_wav","-ar","22050","OUTPUT"],
      } as any);
      downloadBlob(blob, outputName);
    } finally { setProcessing(false); }
  };

  return (
    <div className="space-y-3">
      <input type="file" accept="audio/wav" onChange={(e)=>setFile(e.target.files?.[0]||null)} />
      <button onClick={run} disabled={!file||processing} className="px-4 py-2 bg-primary-600 text-white rounded disabled:opacity-50">
        {processing?"Compressing...":"Compress WAV"}
      </button>
    </div>
  );
}

export function GIFCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [fps, setFps] = useState(10);
  const [width, setWidth] = useState(480);
  const [processing, setProcessing] = useState(false);

  const run = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      // re-encode via palette method
      const vf = "fps=" + fps + ",scale=" + width + ":-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse";
      const { blob } = await transcodeFile({
        inputFile: file,
        outputName: file.name.replace(/\.[^.]+$/, "")+"-compressed.gif",
        args: ["-i","INPUT","-vf", vf, "OUTPUT"],
      } as any);
      downloadBlob(blob, file.name.replace(/\.[^.]+$/, "")+"-compressed.gif");
    } finally { setProcessing(false); }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-center">
        <label className="text-sm">FPS</label>
        <input type="number" min={5} max={30} value={fps} onChange={(e)=>setFps(parseInt(e.target.value)||10)} className="w-20 border rounded px-2 py-1" />
        <label className="text-sm">Width</label>
        <input type="number" min={160} max={1280} value={width} onChange={(e)=>setWidth(parseInt(e.target.value)||480)} className="w-24 border rounded px-2 py-1" />
      </div>
      <input type="file" accept="image/gif" onChange={(e)=>setFile(e.target.files?.[0]||null)} />
      <button onClick={run} disabled={!file||processing} className="px-4 py-2 bg-primary-600 text-white rounded disabled:opacity-50">
        {processing?"Compressing...":"Compress GIF"}
      </button>
    </div>
  );
}
