"use client";

import { useState } from "react";
import { transcodeFile, downloadBlob } from "@/lib/ffmpeg";

export function VideoToMP3() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState<string>("");

  const onConvert = async () => {
    if (!file) return;
    setProcessing(true);
    setStatus("Loading FFmpeg and converting...");
    try {
      const outName = file.name.replace(/\.[^.]+$/, "") + ".mp3";
      const { blob, outputName } = await transcodeFile({
        inputFile: file,
        outputName: outName,
        args: ["-i", "INPUT", "-vn", "-c:a", "libmp3lame", "-b:a", "192k", "OUTPUT"],
      } as any);
      downloadBlob(blob, outputName);
      setStatus("Done");
    } catch (e: any) {
      setStatus(e?.message || "Conversion failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>
      <button
        onClick={onConvert}
        disabled={!file || processing}
        className="px-4 py-2 bg-primary-600 text-white rounded disabled:opacity-50"
      >
        {processing ? "Converting..." : "Convert to MP3"}
      </button>
      {status && <p className="text-sm text-gray-600 dark:text-gray-400">{status}</p>}
    </div>
  );
}
