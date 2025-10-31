import React from 'react';

interface SliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  disabled?: boolean;
}

export function Slider({
  min,
  max,
  value,
  onChange,
  step = 1,
  disabled = false
}: SliderProps) {
  return (
    <div className="relative">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className={`
          w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
          range-slider:bg-blue-600
          range-slider:rounded-full
          disabled:opacity-50
          disabled:cursor-not-allowed
        `}
      />
      <style jsx>{`
        input[type='range'] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
        }

        input[type='range']::-webkit-slider-runnable-track {
          background: #e5e7eb;
          height: 0.5rem;
          border-radius: 0.25rem;
        }

        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          margin-top: -4px;
          background-color: #2563eb;
          height: 1rem;
          width: 1rem;
          border-radius: 9999px;
        }

        input[type='range']:focus {
          outline: none;
        }

        input[type='range']:focus::-webkit-slider-thumb {
          outline: 2px solid #2563eb;
          outline-offset: 2px;
        }

        input[type='range']:disabled::-webkit-slider-thumb {
          background-color: #9ca3af;
        }
      `}</style>
    </div>
  );
}