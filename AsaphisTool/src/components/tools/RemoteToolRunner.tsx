"use client";

import { useMemo, useState, useEffect } from "react";
import { getApiBase } from "@/lib/api";

// A generic runner that connects many tools to your backend endpoints
export function RemoteToolRunner({ toolId }: { toolId: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [text, setText] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  // common numeric/text params for file-mode tools
  const [ranges, setRanges] = useState<string>(""); // pdf-splitter
  const [start, setStart] = useState<number>(0); // video trim
  const [duration, setDuration] = useState<number>(5);
  const [w, setW] = useState<number>(480); // crop dimensions
  const [h, setH] = useState<number>(480);
  const [x, setX] = useState<number>(0);
  const [y, setY] = useState<number>(0);
  const [format, setFormat] = useState<string>('mp4'); // generic format
  const [quality, setQuality] = useState<number>(80); // image compress
  const [imgFormat, setImgFormat] = useState<string>('jpeg'); // image compress/convert
  const [widthPx, setWidthPx] = useState<number>(800); // image resize
  const [heightPx, setHeightPx] = useState<number>(600);
  const [fit, setFit] = useState<string>('cover');
  const [angle, setAngle] = useState<number>(90);
  const [axis, setAxis] = useState<string>('h');
  const [factor, setFactor] = useState<number>(2);
  const [caseMode, setCaseMode] = useState<string>('lower');
  const [hashAlgo, setHashAlgo] = useState<string>('sha256');
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultText, setResultText] = useState<string>("");
  const [modeValue, setModeValue] = useState<string>('encode');
  const [minify, setMinify] = useState<boolean>(false);
  const [uuidCount, setUuidCount] = useState<number>(1);
  const [pwdLen, setPwdLen] = useState<number>(16);

  const config = useMemo(() => mapToolToEndpoint(toolId), [toolId]);
  const apiBase = getApiBase();
  const [features, setFeatures] = useState<{ffmpeg?:boolean; poppler?:boolean; potrace?:boolean}>({});

  // Fetch backend feature availability once
  useEffect(() => {
    if (!apiBase) return;
    fetch(`${apiBase}/health/features`).then(r=>r.json()).then(j=>{
      if (j?.features) setFeatures(j.features);
    }).catch(()=>{});
  }, [apiBase]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files ? Array.from(e.target.files) : [];
    setFiles(list);
    setDownloadUrl(null);
    setError(null);
  };

  const run = async () => {
    if (!config) {
      setError("Unsupported tool: no endpoint mapping.");
      return;
    }
    if (!apiBase || !apiBase.startsWith("http")) {
      setError("Backend API not configured. Set NEXT_PUBLIC_API_URL.");
      return;
    }

    setProcessing(true);
    setError(null);
    setDownloadUrl(null);
    setResultText("");

    try {
      let res: Response;
      if (config.mode === 'text') {
        const body = buildJsonPayload(toolId, { text, modeValue, minify, uuidCount, pwdLen });
        res = await fetch(`${apiBase}${config.path}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      } else {
        if (!files.length) {
          setError("Please select file(s) first.");
          setProcessing(false);
          return;
        }
        const form = new FormData();
        const field = config.fileField || "file";
        files.forEach((f) => form.append(field, f));
        if (config.params) {
          Object.entries(config.params).forEach(([k, v]) => form.append(k, String(v)));
        }
        // attach dynamic params based on toolId
        const extra = buildFormParams(toolId, { ranges, start, duration, w, h, x, y, format, quality, imgFormat, widthPx, heightPx, fit, angle, axis });
        Object.entries(extra).forEach(([k, v]) => form.append(k, String(v)));
        res = await fetch(`${apiBase}${config.path}`, { method: config.method || 'POST', body: form });
      }

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Server ${res.status}: ${txt}`);
      }

      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const data = await res.json();
        if (data.image) {
          setDownloadUrl(data.image);
        } else if (data.downloadUrl) {
          setDownloadUrl(data.downloadUrl);
        } else if (data.text) {
          setResultText(data.text);
        } else if (data.result) {
          setResultText(String(data.result));
        } else if (data.password) {
          setResultText(data.password);
        } else if (data.uuids) {
          setResultText((data.uuids as string[]).join('\n'));
        } else if (data.json) {
          setResultText(JSON.stringify(data.json, null, 2));
        } else if (data.counts) {
          setResultText(JSON.stringify(data.counts, null, 2));
        } else if (data.result?.score !== undefined) {
          setResultText(JSON.stringify(data.result, null, 2));
        } else {
          setResultText(JSON.stringify(data, null, 2));
        }
      } else {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
      }
    } catch (e: any) {
      setError(e?.message || "Request failed");
    } finally {
      setProcessing(false);
    }
  };

  const accept = config?.accept || "*/*";
  const multiple = !!config?.multiple;

  return (
    <div className="space-y-4">
      {config?.mode === 'text' ? (
        <>
          {toolId === 'json-formatter' && (
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={minify} onChange={(e)=>setMinify(e.target.checked)} /> Minify
              </label>
            </div>
          )}
          {(toolId === 'base64-encoder-decoder' || toolId === 'url-encoder-decoder') && (
            <div className="flex items-center gap-3">
              <select className="border rounded px-2 py-1" value={modeValue} onChange={(e)=>setModeValue(e.target.value)}>
                <option value="encode">Encode</option>
                <option value="decode">Decode</option>
              </select>
            </div>
          )}
          {(toolId === 'uuid-generator') && (
            <div className="flex items-center gap-3">
              <label className="text-sm">Count</label>
              <input type="number" className="border rounded px-2 py-1 w-24" value={uuidCount} onChange={(e)=>setUuidCount(parseInt(e.target.value)||1)} />
            </div>
          )}
          {(toolId === 'password-generator') && (
            <div className="flex items-center gap-3">
              <label className="text-sm">Length</label>
              <input type="number" className="border rounded px-2 py-1 w-24" value={pwdLen} onChange={(e)=>setPwdLen(parseInt(e.target.value)||16)} />
            </div>
          )}

          {toolId !== 'password-generator' && toolId !== 'uuid-generator' && (
            <textarea
              value={text}
              onChange={(e)=>setText(e.target.value)}
              className="w-full min-h-[160px] border rounded p-2"
              placeholder="Enter text here"
            />
          )}
        </>
      ) : (
        <>
          {/* File inputs */}
          <input type="file" accept={accept} multiple={multiple} onChange={onFileChange} />

          {/* Contextual controls */}
          {toolId === 'pdf-splitter' && (
            <div className="flex items-center gap-3">
              <label className="text-sm">Ranges</label>
              <input className="border rounded px-2 py-1" placeholder="e.g., 1-3,5,7-8" value={ranges} onChange={(e)=>setRanges(e.target.value)} />
            </div>
          )}

          {(toolId === 'video-trim' || toolId === 'trim-video') && (
            <div className="flex items-center gap-3">
              <label className="text-sm">Start (s)</label>
              <input type="number" className="border rounded px-2 py-1 w-24" value={start} onChange={(e)=>setStart(parseFloat(e.target.value)||0)} />
              <label className="text-sm">Duration (s)</label>
              <input type="number" className="border rounded px-2 py-1 w-24" value={duration} onChange={(e)=>setDuration(parseFloat(e.target.value)||1)} />
            </div>
          )}

          {(toolId === 'video-crop' || toolId === 'crop-video') && (
            <div className="flex items-center gap-3">
              <label className="text-sm">W</label>
              <input type="number" className="border rounded px-2 py-1 w-20" value={w} onChange={(e)=>setW(parseInt(e.target.value)||0)} />
              <label className="text-sm">H</label>
              <input type="number" className="border rounded px-2 py-1 w-20" value={h} onChange={(e)=>setH(parseInt(e.target.value)||0)} />
              <label className="text-sm">X</label>
              <input type="number" className="border rounded px-2 py-1 w-20" value={x} onChange={(e)=>setX(parseInt(e.target.value)||0)} />
              <label className="text-sm">Y</label>
              <input type="number" className="border rounded px-2 py-1 w-20" value={y} onChange={(e)=>setY(parseInt(e.target.value)||0)} />
            </div>
          )}

          {(toolId === 'video-converter' || toolId === 'mp4-converter' || toolId === 'mov-to-mp4' || toolId === 'video-to-mp3' || toolId === 'mp4-to-mp3' || toolId === 'mp3-to-ogg') && (
            <div className="flex items-center gap-3">
              <label className="text-sm">Format</label>
              <select className="border rounded px-2 py-1" value={format} onChange={(e)=>setFormat(e.target.value)}>
                <option value="mp4">mp4</option>
                <option value="mp3">mp3</option>
                <option value="ogg">ogg</option>
                <option value="webm">webm</option>
                <option value="mkv">mkv</option>
              </select>
            </div>
          )}

          {toolId === 'image-compressor' && (
            <div className="flex items-center gap-3">
              <label className="text-sm">Quality</label>
              <input type="number" className="border rounded px-2 py-1 w-20" min={1} max={100} value={quality} onChange={(e)=>setQuality(parseInt(e.target.value)||80)} />
              <label className="text-sm">Format</label>
              <select className="border rounded px-2 py-1" value={imgFormat} onChange={(e)=>setImgFormat(e.target.value)}>
                <option value="jpeg">jpeg</option>
                <option value="png">png</option>
                <option value="webp">webp</option>
              </select>
            </div>
          )}

          {toolId === 'image-resizer' && (
            <div className="flex items-center gap-3 flex-wrap">
              <label className="text-sm">Width</label>
              <input type="number" className="border rounded px-2 py-1 w-24" value={widthPx} onChange={(e)=>setWidthPx(parseInt(e.target.value)||0)} />
              <label className="text-sm">Height</label>
              <input type="number" className="border rounded px-2 py-1 w-24" value={heightPx} onChange={(e)=>setHeightPx(parseInt(e.target.value)||0)} />
              <label className="text-sm">Fit</label>
              <select className="border rounded px-2 py-1" value={fit} onChange={(e)=>setFit(e.target.value)}>
                <option value="cover">cover</option>
                <option value="contain">contain</option>
                <option value="fill">fill</option>
                <option value="inside">inside</option>
                <option value="outside">outside</option>
              </select>
            </div>
          )}

          {toolId === 'image-format-converter' && (
            <div className="flex items-center gap-3">
              <label className="text-sm">Format</label>
              <select className="border rounded px-2 py-1" value={imgFormat} onChange={(e)=>setImgFormat(e.target.value)}>
                <option value="jpeg">jpeg</option>
                <option value="png">png</option>
                <option value="webp">webp</option>
                <option value="gif">gif</option>
              </select>
            </div>
          )}

          {(toolId === 'crop-image') && (
            <div className="flex items-center gap-3">
              <label className="text-sm">W</label>
              <input type="number" className="border rounded px-2 py-1 w-20" value={w} onChange={(e)=>setW(parseInt(e.target.value)||0)} />
              <label className="text-sm">H</label>
              <input type="number" className="border rounded px-2 py-1 w-20" value={h} onChange={(e)=>setH(parseInt(e.target.value)||0)} />
              <label className="text-sm">X</label>
              <input type="number" className="border rounded px-2 py-1 w-20" value={x} onChange={(e)=>setX(parseInt(e.target.value)||0)} />
              <label className="text-sm">Y</label>
              <input type="number" className="border rounded px-2 py-1 w-20" value={y} onChange={(e)=>setY(parseInt(e.target.value)||0)} />
            </div>
          )}

          {toolId === 'rotate-image' && (
            <div className="flex items-center gap-3">
              <label className="text-sm">Angle</label>
              <input type="number" className="border rounded px-2 py-1 w-20" value={angle} onChange={(e)=>setAngle(parseInt(e.target.value)||0)} />
            </div>
          )}

          {toolId === 'flip-image' && (
            <div className="flex items-center gap-3">
              <label className="text-sm">Axis</label>
              <select className="border rounded px-2 py-1" value={axis} onChange={(e)=>setAxis(e.target.value)}>
                <option value="h">horizontal</option>
                <option value="v">vertical</option>
              </select>
            </div>
          )}

          {toolId === 'image-enlarger' || toolId === 'image-upscaler' ? (
            <div className="flex items-center gap-3">
              <label className="text-sm">Factor</label>
              <input type="number" className="border rounded px-2 py-1 w-20" min={2} max={4} value={factor} onChange={(e)=>setFactor(parseInt(e.target.value)||2)} />
            </div>
          ) : null}
        </>
      )}

      <div className="flex gap-2">
        <button
          onClick={run}
          disabled={processing || (config?.mode !== 'text' && files.length === 0)}
          className="px-4 py-2 bg-primary-600 text-white rounded disabled:opacity-50"
        >
          {processing ? "Processing..." : config?.buttonText || "Process"}
        </button>
        {downloadUrl && (
          <a href={downloadUrl} download className="px-4 py-2 bg-green-600 text-white rounded">
            Download
          </a>
        )}
      </div>

      {/* Feature warnings */}
      {(toolId.startsWith('video') || toolId.includes('gif')) && features.ffmpeg===false && (
        <div className="text-xs text-yellow-800 bg-yellow-50 border border-yellow-200 rounded p-2">Server missing ffmpeg — this tool may fail until ffmpeg is installed.</div>
      )}
      {(toolId==='pdf-to-jpg') && features.poppler===false && (
        <div className="text-xs text-yellow-800 bg-yellow-50 border border-yellow-200 rounded p-2">Server missing Poppler — PDF to JPG requires pdftoppm.</div>
      )}
      {(toolId==='png-to-svg' || toolId==='svg-converter') && features.potrace===false && (
        <div className="text-xs text-yellow-800 bg-yellow-50 border border-yellow-200 rounded p-2">Server missing potrace — SVG conversion requires potrace.</div>
      )}

      {resultText && (
        <pre className="whitespace-pre-wrap text-sm bg-gray-50 border rounded p-3 overflow-auto max-h-80">{resultText}</pre>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">{error}</div>
      )}
      {!apiBase && (
        <div className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-3">
          Set NEXT_PUBLIC_API_URL to enable backend tools.
        </div>
      )}
    </div>
  );
}

function buildJsonPayload(toolId: string, state: any) {
  switch (toolId) {
    case 'json-formatter':
      return { json: state.text, minify: !!state.minify };
    case 'base64-encoder-decoder':
      return { mode: state.modeValue || 'encode', data: state.text || '' };
    case 'url-encoder-decoder':
      return { mode: state.modeValue || 'encode', data: state.text || '' };
    case 'qr-code-generator':
      return { data: state.text || '', options: { width: 256, margin: 1 } };
    case 'password-generator':
      return { length: state.pwdLen || 16 };
    case 'password-strength-checker':
      return { password: state.text || '' };
    case 'word-counter':
      return { text: state.text || '' };
    case 'uuid-generator':
      return { count: state.uuidCount || 1 };
    case 'csv-to-json-converter':
      return { csv: state.text || '' };
    case 'text-case-converter':
      return { text: state.text || '', mode: state.caseMode || 'lower' };
    case 'hash-generator':
      return { text: state.text || '', algo: state.hashAlgo || 'sha256' };
    case 'youtube-thumbnail-downloader':
      return { url: state.text || '' };
    default:
      return { text: state.text || '' };
  }
}

type ToolConfig = { path: string; method?: string; fileField?: string; multiple?: boolean; params?: Record<string, any>; accept?: string; buttonText?: string; mode?: 'file' | 'text' };

function mapToolToEndpoint(toolId: string): ToolConfig | null {
  // Map many tool IDs to backend REST endpoints (adjust to match your backend)
  const m: Record<string, any> = {
    // Backend-available file endpoints (from AsaphisToolBackend)
    // Images
    "image-compressor": { path: "/files/compress-image", fileField: "image", accept: "image/*" },
    "jpeg-compressor": { path: "/files/compress-image", fileField: "image", params: { format: "jpeg" }, accept: "image/jpeg" },
    "png-compressor": { path: "/files/compress-image", fileField: "image", params: { format: "png" }, accept: "image/png" },
    "image-resizer": { path: "/files/resize-image", fileField: "image", accept: "image/*" },
    "image-format-converter": { path: "/files/convert-image", fileField: "image", accept: "image/*" },
    "webp-to-png": { path: "/files/convert-image", fileField: "image", params: { format: "png" }, accept: "image/webp" },
    "webp-to-jpg": { path: "/files/convert-image", fileField: "image", params: { format: "jpeg" }, accept: "image/webp" },
    "jfif-to-png": { path: "/files/convert-image", fileField: "image", params: { format: "png" }, accept: ".jfif,image/jpeg" },

    // Background removal
    "background-remover": { path: "/files/remove-background", fileField: "image", accept: "image/*" },

    // Text/Utils -> backend-only
    "json-formatter": { path: "/utils/json", mode: 'text' },
    "base64-encoder-decoder": { path: "/utils/base64", mode: 'text' },
    "url-encoder-decoder": { path: "/utils/url", mode: 'text' },
    "qr-code-generator": { path: "/utils/qrcode", mode: 'text' },
    "password-generator": { path: "/utils/password", mode: 'text' },
    "password-strength-checker": { path: "/utils/password-strength", mode: 'text' },
    "word-counter": { path: "/utils/word-counter", mode: 'text' },
    "uuid-generator": { path: "/utils/uuid", mode: 'text' },
    "csv-to-json-converter": { path: "/utils/csv-to-json", mode: 'text' },

    // PDFs (backend)
    "pdf-merger": { path: "/pdf/merge", fileField: "files[]", multiple: true, accept: "application/pdf" },
    "pdf-splitter": { path: "/pdf/split", fileField: "file", accept: "application/pdf" },

    // Video/GIF (backend)
    "video-converter": { path: "/video/convert", fileField: "file", accept: "video/*" },
    "mp4-converter": { path: "/video/convert", fileField: "file", params: { format: "mp4" }, accept: "video/*" },
    "mov-to-mp4": { path: "/video/convert", fileField: "file", params: { format: "mp4" }, accept: "video/quicktime,.mov" },
    "video-to-mp3": { path: "/video/convert", fileField: "file", params: { format: "mp3" }, accept: "video/*" },
    "mp4-to-mp3": { path: "/video/convert", fileField: "file", params: { format: "mp3" }, accept: "video/mp4" },
    "mp3-to-ogg": { path: "/video/convert", fileField: "file", params: { format: "ogg" }, accept: "audio/mpeg" },
    "crop-video": { path: "/video/crop", fileField: "file", accept: "video/*" },
    "trim-video": { path: "/video/trim", fileField: "file", accept: "video/*" },
    "gif-maker": { path: "/gif/make", fileField: "files[]", multiple: true, accept: "image/*,video/*" },
    "image-to-gif": { path: "/gif/make", fileField: "files[]", multiple: true, accept: "image/*" },
  };
  return m[toolId] || null;
}

function buildFormParams(toolId: string, s: any): Record<string, string|number> {
  switch (toolId) {
    case 'pdf-splitter':
      return { ranges: s.ranges || '' };
    case 'trim-video':
    case 'video-trim':
      return { start: s.start || 0, duration: s.duration || 1 };
    case 'crop-video':
    case 'video-crop':
      return { w: s.w || 0, h: s.h || 0, x: s.x || 0, y: s.y || 0 };
    case 'video-converter':
    case 'mp4-converter':
    case 'mov-to-mp4':
    case 'video-to-mp3':
    case 'mp4-to-mp3':
    case 'mp3-to-ogg':
      return { format: s.format || 'mp4' };
    case 'image-compressor':
      return { quality: s.quality || 80, format: s.imgFormat || 'jpeg' };
    case 'image-resizer':
      return { width: s.widthPx || 0, height: s.heightPx || 0, fit: s.fit || 'cover' } as any;
    case 'image-format-converter':
      return { format: s.imgFormat || 'png' };
    case 'crop-image':
      return { w: s.w || 0, h: s.h || 0, x: s.x || 0, y: s.y || 0 };
    case 'rotate-image':
      return { angle: s.angle || 90 };
    case 'flip-image':
      return { axis: s.axis || 'h' };
    case 'image-enlarger':
    case 'image-upscaler':
      return { factor: s.factor || 2 };
    default:
      return {};
  }
}
