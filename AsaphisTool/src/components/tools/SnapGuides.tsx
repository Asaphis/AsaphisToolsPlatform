'use client';

import React from 'react';

interface SnapGuidesProps {
  isVisible: boolean;
  canvasRect?: DOMRect;
  gridSize?: number;
  showGrid?: boolean;
  showGuides?: boolean;
  guideLines?: { x?: number; y?: number }[];
}

export function SnapGuides({ 
  isVisible, 
  canvasRect, 
  gridSize = 20, 
  showGrid = true, 
  showGuides = true,
  guideLines = []
}: SnapGuidesProps) {
  if (!isVisible || !canvasRect) {
    return null;
  }

  return (
    <div 
      className="fixed pointer-events-none z-30"
      style={{
        left: canvasRect.left,
        top: canvasRect.top,
        width: canvasRect.width,
        height: canvasRect.height
      }}
    >
      {/* Grid */}
      {showGrid && (
        <svg 
          width="100%" 
          height="100%" 
          className="absolute inset-0"
          style={{ opacity: 0.1 }}
        >
          <defs>
            <pattern 
              id="grid" 
              width={gridSize} 
              height={gridSize} 
              patternUnits="userSpaceOnUse"
            >
              <path 
                d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      )}

      {/* Smart Guides */}
      {showGuides && guideLines.map((guide, index) => (
        <div key={index}>
          {/* Vertical guide */}
          {typeof guide.x === 'number' && (
            <div
              className="absolute bg-blue-500"
              style={{
                left: guide.x,
                top: 0,
                width: 1,
                height: '100%',
                opacity: 0.7,
                pointerEvents: 'none'
              }}
            />
          )}
          {/* Horizontal guide */}
          {typeof guide.y === 'number' && (
            <div
              className="absolute bg-blue-500"
              style={{
                left: 0,
                top: guide.y,
                width: '100%',
                height: 1,
                opacity: 0.7,
                pointerEvents: 'none'
              }}
            />
          )}
        </div>
      ))}

      {/* Center guides */}
      {showGuides && (
        <>
          {/* Vertical center */}
          <div
            className="absolute bg-red-500"
            style={{
              left: '50%',
              top: 0,
              width: 1,
              height: '100%',
              opacity: 0.3,
              pointerEvents: 'none',
              transform: 'translateX(-0.5px)'
            }}
          />
          {/* Horizontal center */}
          <div
            className="absolute bg-red-500"
            style={{
              left: 0,
              top: '50%',
              width: '100%',
              height: 1,
              opacity: 0.3,
              pointerEvents: 'none',
              transform: 'translateY(-0.5px)'
            }}
          />
        </>
      )}
    </div>
  );
}

// Utility functions for snapping
export const snapToGrid = (value: number, gridSize: number = 20): number => {
  return Math.round(value / gridSize) * gridSize;
};

export const snapToGuides = (
  value: number, 
  guides: number[], 
  threshold: number = 5
): number => {
  for (const guide of guides) {
    if (Math.abs(value - guide) <= threshold) {
      return guide;
    }
  }
  return value;
};

export const generateSmartGuides = (
  elements: any[], 
  currentElementId: string,
  canvasWidth: number,
  canvasHeight: number
): { x?: number; y?: number }[] => {
  const guides: { x?: number; y?: number }[] = [];
  
  // Add canvas edges
  guides.push(
    { x: 0 },
    { x: canvasWidth },
    { y: 0 },
    { y: canvasHeight }
  );
  
  // Add canvas center
  guides.push(
    { x: canvasWidth / 2 },
    { y: canvasHeight / 2 }
  );
  
  // Add other elements' positions
  elements
    .filter(el => el.id !== currentElementId && el.isVisible)
    .forEach(el => {
      guides.push(
        { x: el.x },
        { y: el.y }
      );
    });
  
  return guides;
};