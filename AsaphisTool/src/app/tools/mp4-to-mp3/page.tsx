"use client";

import React, { useState } from 'react';
import ToolInputCard from '@/components/tools/ToolInputCard';
import { Card, CardContent } from '@/components/ui/card';

export default function MP4ToMP3Page() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">MP4 to MP3 Converter</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="grid gap-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Input</h2>
                <ToolInputCard
                  id="mp4-upload"
                  accept="video/mp4"
                  files={files}
                  onFilesSelected={setFiles}
                  endpoint="/video/convert"
                  format="mp3"
                  clientOnly={true}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">How to use MP4 to MP3 Converter</h2>
            <ol className="list-decimal ml-6 space-y-2">
              <li>Click "Choose file" to select your MP4 video</li>
              <li>Once selected, click "Process" to start the conversion</li>
              <li>When complete, your MP3 file will download automatically</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}