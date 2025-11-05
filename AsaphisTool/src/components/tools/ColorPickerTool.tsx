"use client";

import { useEffect, useRef, useState } from "react";

export function ColorPickerTool() {
  const [color, setColor] = useState<string>("#ff0000");
  const [rgb, setRgb] = useState<string>("255,0,0");
  const [hsl, setHsl] = useState<string>("0,100%,50%");
  const [imgUrl, setImgUrl] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(()=>{
    // derive rgb/hsl from hex
    const hex = color.replace('#','');
    if (hex.length===6){
      const r = parseInt(hex.slice(0,2),16), g=parseInt(hex.slice(2,4),16), b=parseInt(hex.slice(4,6),16);
      setRgb(`${r},${g},${b}`);
      const rr=r/255, gg=g/255, bb=b/255;
      const max=Math.max(rr,gg,bb), min=Math.min(rr,gg,bb);
      let h=0, s=0;
      const l=(max+min)/2;
      if (max!==min){
        const d=max-min;
        s=l>0.5? d/(2-max-min): d/(max+min);
        switch(max){
          case rr: h=(gg-bb)/d+(gg<bb?6:0);break;
          case gg: h=(bb-rr)/d+2;break;
          default: h=(rr-gg)/d+4;break;
        }
        h/=6;
      }
      setHsl(`${Math.round(h*360)},${Math.round(s*100)}%,${Math.round(l*100)}%`);
    }
  },[color]);

  const onImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return; const url = URL.createObjectURL(f); setImgUrl(url);
    const img = new Image(); img.onload = ()=>{ const c=canvasRef.current!; c.width=img.width; c.height=img.height; const ctx=c.getContext('2d'); if(!ctx) return; ctx.drawImage(img,0,0); }; img.src=url;
  };

  const pickAt = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!; const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX-rect.left) * (canvas.width/rect.width));
    const y = Math.floor((e.clientY-rect.top) * (canvas.height/rect.height));
    const ctx = canvas.getContext('2d'); if(!ctx) return; const d = ctx.getImageData(x,y,1,1).data;
    const hex = `#${[d[0],d[1],d[2]].map(v=>v.toString(16).padStart(2,'0')).join('')}`;
    setColor(hex);
  };

  const useEyeDropper = async () => {
    // @ts-ignore
    if (window.EyeDropper) {
      // @ts-ignore
      const ed = new window.EyeDropper();
      try { const res = await ed.open(); setColor(res.sRGBHex); } catch {}
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">🎨 Color Picker</h1>
        <p className="text-gray-600">Pick colors from an image or the screen.</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <input type="color" value={color} onChange={(e)=>setColor(e.target.value)} />
          <div className="text-sm">HEX: <code>{color}</code></div>
          <div className="text-sm">RGB: <code>{rgb}</code></div>
          <div className="text-sm">HSL: <code>{hsl}</code></div>
          <button onClick={useEyeDropper} className="px-3 py-2 bg-primary-600 text-white rounded">Eyedropper</button>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Pick from image</label>
          <input type="file" accept="image/*" onChange={onImage} />
          <canvas ref={canvasRef} onClick={pickAt} className="max-w-full border rounded" />
        </div>
      </div>
    </div>
  );
}
