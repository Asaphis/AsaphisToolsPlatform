'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Type, Move, RotateCw, Trash2 } from 'lucide-react';

interface FloatingTextControlsProps {
  selectedElement: any;
  onUpdateElement: (updates: any) => void;
  onDeleteElement: () => void;
  canvasRect?: DOMRect;
  isVisible: boolean;
}

export function FloatingTextControls({ 
  selectedElement, 
  onUpdateElement, 
  onDeleteElement,
  canvasRect,
  isVisible 
}: FloatingTextControlsProps) {
  const [fontSize, setFontSize] = useState(selectedElement?.data?.fontSize || 32);
  const [inputValue, setInputValue] = useState(fontSize.toString());
  const [isIncrementing, setIsIncrementing] = useState(false);
  const [isDecrementing, setIsDecrementing] = useState(false);
  const incrementIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Update local state when selected element changes
  useEffect(() => {
    if (selectedElement?.data?.fontSize !== fontSize) {
      const newSize = selectedElement?.data?.fontSize || 32;
      setFontSize(newSize);
      setInputValue(newSize.toString());
    }
  }, [selectedElement?.data?.fontSize, fontSize]);

  // Throttled update function using requestAnimationFrame
  const throttledUpdate = useCallback((newSize: number) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      onUpdateElement({ fontSize: newSize });
    });
  }, [onUpdateElement]);

  const updateFontSize = useCallback((newSize: number) => {
    // Clamp font size between 8 and 300
    const clampedSize = Math.max(8, Math.min(300, newSize));
    setFontSize(clampedSize);
    setInputValue(clampedSize.toString());
    throttledUpdate(clampedSize);
  }, [throttledUpdate]);

  const handleIncrement = useCallback((continuous = false) => {
    updateFontSize(fontSize + (continuous ? 0.5 : 1));
  }, [fontSize, updateFontSize]);

  const handleDecrement = useCallback((continuous = false) => {
    updateFontSize(fontSize - (continuous ? 0.5 : 1));
  }, [fontSize, updateFontSize]);

  // Continuous increment/decrement on hold
  const startIncrement = () => {
    if (incrementIntervalRef.current) return;
    
    setIsIncrementing(true);
    handleIncrement();
    
    // Start with slower interval, then speed up
    let interval = 150;
    const accelerate = () => {
      incrementIntervalRef.current = setTimeout(() => {
        handleIncrement(true);
        interval = Math.max(50, interval - 10);
        accelerate();
      }, interval);
    };
    
    setTimeout(accelerate, 300); // Initial delay before continuous
  };

  const startDecrement = () => {
    if (incrementIntervalRef.current) return;
    
    setIsDecrementing(true);
    handleDecrement();
    
    let interval = 150;
    const accelerate = () => {
      incrementIntervalRef.current = setTimeout(() => {
        handleDecrement(true);
        interval = Math.max(50, interval - 10);
        accelerate();
      }, interval);
    };
    
    setTimeout(accelerate, 300);
  };

  const stopContinuous = () => {
    if (incrementIntervalRef.current) {
      clearTimeout(incrementIntervalRef.current);
      incrementIntervalRef.current = null;
    }
    setIsIncrementing(false);
    setIsDecrementing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Allow decimal input
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      updateFontSize(numValue);
    }
  };

  const handleInputBlur = () => {
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue) || numValue <= 0) {
      setInputValue(fontSize.toString());
    } else {
      updateFontSize(numValue);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleDecrement();
    }
  };

  // Calculate position relative to canvas
  const getControlPosition = () => {
    if (!selectedElement || !canvasRect) {
      return { left: 0, top: 0 };
    }

    // Position controls above the text element
    const elementX = selectedElement.x;
    const elementY = selectedElement.y;
    
    // Get actual canvas dimensions for scaling
    const canvas = document.querySelector('canvas');
    if (!canvas) return { left: 0, top: 0 };
    
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Convert canvas coordinates to screen coordinates
    const scaleX = canvasRect.width / canvasWidth;
    const scaleY = canvasRect.height / canvasHeight;
    
    const screenX = canvasRect.left + (elementX * scaleX);
    const screenY = canvasRect.top + (elementY * scaleY) - 60; // 60px above element
    
    return {
      left: Math.max(10, Math.min(window.innerWidth - 200, screenX - 75)), // Center control
      top: Math.max(10, screenY)
    };
  };

  const position = getControlPosition();

  console.log('FloatingTextControls render:', { 
    isVisible, 
    hasSelectedElement: !!selectedElement, 
    elementType: selectedElement?.type,
    elementData: selectedElement?.data
  });

  if (!isVisible || !selectedElement || selectedElement.type !== 'text') {
    console.log('FloatingTextControls not rendering:', { isVisible, hasSelectedElement: !!selectedElement, elementType: selectedElement?.type });
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 p-2"
        style={{
          left: position.left,
          top: position.top,
          pointerEvents: 'auto'
        }}
      >
        <div className="flex items-center gap-2">
          {/* Font Size Control */}
          <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-700 rounded-md">
            <button
              onMouseDown={startDecrement}
              onMouseUp={stopContinuous}
              onMouseLeave={stopContinuous}
              className={`p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-l-md transition-colors ${
                isDecrementing ? 'bg-blue-200 dark:bg-blue-700' : ''
              }`}
              disabled={fontSize <= 8}
            >
              <Minus className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-1 px-2">
              <Type className="w-3 h-3 text-gray-500" />
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={handleInputKeyDown}
                className="w-12 text-center text-sm bg-transparent border-none outline-none font-medium"
                placeholder="32"
              />
              <span className="text-xs text-gray-500">px</span>
            </div>
            
            <button
              onMouseDown={startIncrement}
              onMouseUp={stopContinuous}
              onMouseLeave={stopContinuous}
              className={`p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-r-md transition-colors ${
                isIncrementing ? 'bg-blue-200 dark:bg-blue-700' : ''
              }`}
              disabled={fontSize >= 300}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

          {/* Additional Controls */}
          <div className="flex items-center gap-1">
            <button
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Move"
            >
              <Move className="w-4 h-4" />
            </button>
            
            <button
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Rotate"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            
            <button
              onClick={onDeleteElement}
              className="p-2 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 rounded transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}