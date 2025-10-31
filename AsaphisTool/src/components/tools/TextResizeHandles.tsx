'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';

interface TextResizeHandlesProps {
  element: any;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onUpdateElement: (updates: any) => void;
  isVisible: boolean;
}

interface ResizeHandle {
  id: string;
  position: { x: number; y: number };
  cursor: string;
  direction: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 'e' | 's' | 'w';
}

export function TextResizeHandles({ 
  element, 
  canvasRef, 
  onUpdateElement, 
  isVisible 
}: TextResizeHandlesProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragHandle, setDragHandle] = useState<string | null>(null);
  const [initialSize, setInitialSize] = useState(0);
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);

  const calculateBounds = useCallback(() => {
    if (!element || !element.data || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Set font for measurement
    const data = element.data;
    const fontStyle = data.fontStyle === 'italic' ? 'italic ' : '';
    const fontWeight = data.fontWeight || '400';
    ctx.font = `${fontStyle}${fontWeight} ${data.fontSize}px "${data.fontFamily}", sans-serif`;
    
    const textWidth = ctx.measureText(data.text).width * (element.scale || 1);
    const textHeight = data.fontSize * data.lineHeight * (element.scale || 1);
    
    // Convert canvas coordinates to screen coordinates
    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;
    
    const screenX = rect.left + (element.x * scaleX);
    const screenY = rect.top + (element.y * scaleY);
    
    const screenWidth = textWidth * scaleX;
    const screenHeight = textHeight * scaleY;
    
    return {
      x: screenX - (screenWidth / 2),
      y: screenY,
      width: screenWidth,
      height: screenHeight,
      centerX: screenX,
      centerY: screenY + (screenHeight / 2)
    };
  }, [element, canvasRef]);

  const generateHandles = useCallback((bounds: any): ResizeHandle[] => {
    if (!bounds) return [];

    const handleSize = 8;
    const { x, y, width, height } = bounds;

    return [
      {
        id: 'nw',
        position: { x: x - handleSize/2, y: y - handleSize/2 },
        cursor: 'nw-resize',
        direction: 'nw'
      },
      {
        id: 'ne',
        position: { x: x + width - handleSize/2, y: y - handleSize/2 },
        cursor: 'ne-resize',
        direction: 'ne'
      },
      {
        id: 'sw',
        position: { x: x - handleSize/2, y: y + height - handleSize/2 },
        cursor: 'sw-resize',
        direction: 'sw'
      },
      {
        id: 'se',
        position: { x: x + width - handleSize/2, y: y + height - handleSize/2 },
        cursor: 'se-resize',
        direction: 'se'
      },
      // Middle handles for precise resizing
      {
        id: 'n',
        position: { x: x + width/2 - handleSize/2, y: y - handleSize/2 },
        cursor: 'n-resize',
        direction: 'n'
      },
      {
        id: 's',
        position: { x: x + width/2 - handleSize/2, y: y + height - handleSize/2 },
        cursor: 's-resize',
        direction: 's'
      },
      {
        id: 'e',
        position: { x: x + width - handleSize/2, y: y + height/2 - handleSize/2 },
        cursor: 'e-resize',
        direction: 'e'
      },
      {
        id: 'w',
        position: { x: x - handleSize/2, y: y + height/2 - handleSize/2 },
        cursor: 'w-resize',
        direction: 'w'
      }
    ];
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent, handleId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!element?.data) return;
    
    setIsDragging(true);
    setDragHandle(handleId);
    setInitialSize(element.data.fontSize);
    setInitialMousePos({ x: e.clientX, y: e.clientY });
    
    document.body.style.cursor = 'grabbing';
  }, [element?.data?.fontSize]);

  const calculateNewSize = useCallback((e: MouseEvent, handleId: string, initialSize: number) => {
    const deltaX = e.clientX - initialMousePos.x;
    const deltaY = e.clientY - initialMousePos.y;
    
    // Calculate size change based on handle direction and mouse movement
    let sizeDelta = 0;
    
    switch (handleId) {
      case 'se':
      case 'ne':
      case 'e':
        sizeDelta = deltaX * 0.5; // Horizontal movement
        break;
      case 'sw':
      case 'nw':
      case 'w':
        sizeDelta = -deltaX * 0.5; // Inverse horizontal movement
        break;
      case 's':
        sizeDelta = deltaY * 0.5; // Vertical movement
        break;
      case 'n':
        sizeDelta = -deltaY * 0.5; // Inverse vertical movement
        break;
      default:
        // Corner handles - use average of both directions
        sizeDelta = (Math.abs(deltaX) + Math.abs(deltaY)) * 0.25;
        if ((handleId === 'nw' || handleId === 'sw') && deltaX > 0) sizeDelta = -sizeDelta;
        if ((handleId === 'nw' || handleId === 'ne') && deltaY > 0) sizeDelta = -sizeDelta;
    }
    
    const newSize = Math.max(8, Math.min(300, initialSize + sizeDelta));
    return Math.round(newSize * 10) / 10; // Round to 1 decimal place for precision
  }, [initialMousePos]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragHandle) return;

    const newSize = calculateNewSize(e, dragHandle, initialSize);
    
    // Throttled update using requestAnimationFrame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      onUpdateElement({ fontSize: newSize });
    });
  }, [isDragging, dragHandle, initialSize, calculateNewSize, onUpdateElement]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragHandle(null);
    document.body.style.cursor = 'auto';
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  console.log('TextResizeHandles render:', { 
    isVisible, 
    hasElement: !!element, 
    elementType: element?.type,
    elementData: element?.data
  });

  if (!isVisible || !element || element.type !== 'text') {
    console.log('TextResizeHandles not rendering:', { isVisible, hasElement: !!element, elementType: element?.type });
    return null;
  }

  const bounds = calculateBounds();
  if (!bounds) return null;

  const handles = generateHandles(bounds);

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* Bounding box */}
      <div
        className="absolute border-2 border-blue-400 pointer-events-none"
        style={{
          left: bounds.x,
          top: bounds.y,
          width: bounds.width,
          height: bounds.height,
          background: 'rgba(59, 130, 246, 0.1)'
        }}
      />
      
      {/* Resize handles */}
      {handles.map((handle) => (
        <div
          key={handle.id}
          className="absolute w-2 h-2 bg-blue-500 border border-white rounded-sm pointer-events-auto cursor-pointer hover:bg-blue-600 transition-colors"
          style={{
            left: handle.position.x,
            top: handle.position.y,
            cursor: handle.cursor
          }}
          onMouseDown={(e) => handleMouseDown(e, handle.id)}
        />
      ))}
      
      {/* Center rotation handle */}
      <div
        className="absolute w-2 h-2 bg-blue-500 border border-white rounded-full pointer-events-auto cursor-pointer hover:bg-blue-600 transition-colors"
        style={{
          left: bounds.centerX - 4,
          top: bounds.y - 20,
          cursor: 'grab'
        }}
        title="Rotate"
      />
      
      {/* Connection line for rotation handle */}
      <div
        className="absolute w-0.5 bg-blue-400 pointer-events-none"
        style={{
          left: bounds.centerX,
          top: bounds.y - 16,
          height: 16
        }}
      />
    </div>
  );
}