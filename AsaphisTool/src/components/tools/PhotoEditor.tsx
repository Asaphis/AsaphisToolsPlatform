'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Download, Undo2, Redo2, RotateCcw, FlipHorizontal, 
  FlipVertical, Type, Smile, Square,
  Settings, Zap, Image as ImageIcon, Plus,
  Sun, Contrast, Droplets, Thermometer, Eye, Sparkles,
  Circle, Upload, Save, Search, Crown, Group, Ungroup,
  Bold, Italic, Underline, Strikethrough, AlignLeft,
  AlignCenter, AlignRight, AlignJustify, Palette,
  RotateCw, Move, Trash2, Copy, Layers, Lock, Unlock, EyeOff
} from 'lucide-react';
import { 
  backgroundCategories, 
  getBackgroundsByCategory, 
  getFeaturedBackgrounds,
  searchBackgrounds,
  type BackgroundItem 
} from '@/data/backgrounds';
import GoogleFontsLoader, { POPULAR_FONTS, FONT_WEIGHTS, type GoogleFont } from '@/utils/googleFonts';
import { FloatingTextControls } from './FloatingTextControls';
import { TextResizeHandles } from './TextResizeHandles';
import { SnapGuides, snapToGrid, snapToGuides, generateSmartGuides } from './SnapGuides';

interface PhotoEditorProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (editedImage: string) => void;
  // Optional callback when a file is selected (some pages pass this)
  onFileSelect?: (file: File) => void;
}

// Universal Canvas Element Interface - works for ANY element type
interface CanvasElement {
  id: string;
  type: 'text' | 'sticker' | 'image' | 'shape' | 'drawing' | string; // Extensible for any type
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation: number;
  scale: number;
  opacity: number;
  zIndex: number;
  isVisible: boolean;
  isLocked: boolean;
  isSelected?: boolean;
  bounds?: { x: number; y: number; width: number; height: number }; // Auto-calculated hit area
  
  // Type-specific data (flexible for any element type)
  data: any;
}

interface EditState {
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  scale: number;
  // Image positioning (like Canva)
  offsetX: number;
  offsetY: number;
  // Background positioning (for grouped movement)
  backgroundOffsetX: number;
  backgroundOffsetY: number;
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  filter: string;
  backgroundType: 'transparent' | 'solid' | 'gradient' | 'image';
  backgroundColor: string;
  gradientColors: [string, string];
  backgroundImage: string;
  
  // Universal element system - replaces individual arrays
  elements: CanvasElement[];
}

const INITIAL_STATE: EditState = {
  rotation: 0,
  flipH: false,
  flipV: false,
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  backgroundOffsetX: 0,
  backgroundOffsetY: 0,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  filter: 'none',
  backgroundType: 'transparent',
  backgroundColor: '#ffffff',
  gradientColors: ['#3b82f6', '#8b5cf6'],
  backgroundImage: '',
  elements: []
};

// Universal Element Management System
class CanvasElementManager {
  // Auto-calculate bounds for any element type
  static calculateBounds(element: CanvasElement, canvas?: HTMLCanvasElement): { x: number; y: number; width: number; height: number } {
    const ctx = canvas?.getContext('2d');
    
    switch (element.type) {
      case 'text':
        if (ctx) {
          const data = element.data;
          const fontStyle = data.fontStyle === 'italic' ? 'italic ' : '';
          const fontWeight = data.fontWeight || '400';
          ctx.font = `${fontStyle}${fontWeight} ${data.fontSize}px "${data.fontFamily}", sans-serif`;
          const textWidth = ctx.measureText(data.text).width * (element.scale || 1);
          const textHeight = data.fontSize * data.lineHeight * (element.scale || 1);
          const padding = 12;
          return {
            x: element.x - textWidth/2 - padding,
            y: element.y - padding,
            width: textWidth + (padding * 2),
            height: textHeight + (padding * 2)
          };
        }
        break;
        
      case 'sticker':
        const size = element.data.size * (element.scale || 1);
        const padding = 10;
        return {
          x: element.x - size/2 - padding,
          y: element.y - size/2 - padding,
          width: size + (padding * 2),
          height: size + (padding * 2)
        };
        
      case 'shape':
      case 'image':
      default:
        return {
          x: element.x - (element.width || 50) / 2,
          y: element.y - (element.height || 50) / 2,
          width: (element.width || 50) * (element.scale || 1),
          height: (element.height || 50) * (element.scale || 1)
        };
    }
    
    // Default bounds
    return { x: element.x - 25, y: element.y - 25, width: 50, height: 50 };
  }
  
  // Universal hit test for any element type
  static hitTest(x: number, y: number, element: CanvasElement, canvas?: HTMLCanvasElement): boolean {
    if (!element.isVisible || element.isLocked) return false;
    
    const bounds = this.calculateBounds(element, canvas);
    return x >= bounds.x && x <= bounds.x + bounds.width &&
           y >= bounds.y && y <= bounds.y + bounds.height;
  }
  
  // Create text element with balanced Canva-like defaults
  static createTextElement(type: 'title' | 'subtitle' | 'body', canvasWidth: number, canvasHeight: number): CanvasElement {
    const baseId = Date.now().toString();
    
    // Canva-like balanced defaults
    const defaults = {
      title: { 
        text: 'Add a heading', 
        fontSize: 64, 
        fontWeight: '700', 
        fontFamily: 'Poppins' 
      },
      subtitle: { 
        text: 'Add a subheading', 
        fontSize: 42, 
        fontWeight: '600', 
        fontFamily: 'Poppins' 
      },
      body: { 
        text: 'Add some body text', 
        fontSize: 32, 
        fontWeight: '400', 
        fontFamily: 'Poppins' 
      }
    };
    
    const config = defaults[type];
    
    // Calculate balanced positioning - horizontally centered, slightly above vertical center
    const x = canvasWidth / 2;
    const y = (canvasHeight / 2) - (canvasHeight * 0.1); // 10% above center
    
    return {
      id: `${type}-${baseId}`,
      type: 'text',
      x: x,
      y: y,
      rotation: 0,
      scale: 1,
      opacity: 1,
      zIndex: Date.now(),
      isVisible: true,
      isLocked: false,
      data: {
        text: config.text,
        fontSize: config.fontSize,
        fontFamily: config.fontFamily,
        fontWeight: config.fontWeight,
        fontStyle: 'normal',
        textDecoration: 'none',
        color: '#000000', // Default to black for better visibility
        textAlign: 'center',
        lineHeight: 1.2,
        letterSpacing: 0,
        // Basic Effects
        textShadow: { enabled: false, color: '#000000', blur: 4, offsetX: 2, offsetY: 2, opacity: 0.5 },
        outline: { enabled: false, color: '#000000', width: 2 },
        glow: { enabled: false, color: '#ffffff', blur: 10, intensity: 1 },
        gradient: { enabled: false, colors: ['#3b82f6', '#8b5cf6'], direction: 0 },
        background: { enabled: false, color: '#000000', opacity: 0.5, padding: 8 },
        
        // Advanced Effects
        lift: { enabled: false, height: 10, blur: 15, opacity: 0.3 },
        hollow: { enabled: false, strokeWidth: 2, strokeColor: '#000000' },
        splice: { enabled: false, offset: 2, color: '#ff0000' },
        neon: { enabled: false, glowColor: '#00ff00', glowIntensity: 20, flickering: false },
        curve: { enabled: false, curvature: 0, direction: 'up' }, // up, down, left, right
        
        // Text Formatting
        textCase: 'normal', // normal, uppercase, lowercase, capitalize
        listType: 'none', // none, bullet, numbered
        listIndent: 0,
        
        // Positioning
        locked: false,
        snapToGrid: true,
        gridSize: 10
      }
    };
  }
  
  // Create sticker element
  static createStickerElement(emoji: string, x: number, y: number): CanvasElement {
    return {
      id: `sticker-${Date.now()}`,
      type: 'sticker',
      x: x,
      y: y,
      rotation: 0,
      scale: 1,
      opacity: 1,
      zIndex: Date.now(),
      isVisible: true,
      isLocked: false,
      data: {
        emoji: emoji,
        size: 48
      }
    };
  }
  
  // Find element at position (returns topmost element)
  static findElementAtPosition(x: number, y: number, elements: CanvasElement[], canvas?: HTMLCanvasElement): CanvasElement | null {
    // Sort by z-index (highest first) to get topmost element
    const sortedElements = [...elements]
      .filter(el => el.isVisible && !el.isLocked)
      .sort((a, b) => b.zIndex - a.zIndex);
      
    return sortedElements.find(element => this.hitTest(x, y, element, canvas)) || null;
  }
  
  // Update element position with optional snapping
  static updateElementPosition(
    element: CanvasElement, 
    newX: number, 
    newY: number, 
    canvas?: HTMLCanvasElement,
    snapToGridEnabled: boolean = true,
    elements?: CanvasElement[]
  ): CanvasElement {
    const margin = element.type === 'text' ? 20 : 10;
    const canvasWidth = canvas?.width || 800;
    const canvasHeight = canvas?.height || 600;
    
    let finalX = newX;
    let finalY = newY;
    
    // Apply snap to grid if enabled
    if (snapToGridEnabled && element.data?.snapToGrid !== false) {
      const gridSize = element.data?.gridSize || 20;
      finalX = snapToGrid(newX, gridSize);
      finalY = snapToGrid(newY, gridSize);
    }
    
    // Apply smart guides if elements array is provided
    if (elements) {
      const guides = generateSmartGuides(elements, element.id, canvasWidth, canvasHeight);
      const xGuides = guides.filter(g => g.x !== undefined).map(g => g.x!);
      const yGuides = guides.filter(g => g.y !== undefined).map(g => g.y!);
      
      finalX = snapToGuides(finalX, xGuides, 10);
      finalY = snapToGuides(finalY, yGuides, 10);
    }
    
    return {
      ...element,
      x: Math.max(margin, Math.min(canvasWidth - margin, finalX)),
      y: Math.max(margin, Math.min(canvasHeight - margin, finalY))
    };
  }
};

const FILTERS = [
  { id: 'none', name: 'Original', filter: '' },
  { id: 'vintage', name: 'Vintage', filter: 'sepia(0.5) saturate(1.2) contrast(1.1)' },
  { id: 'warm', name: 'Warm', filter: 'saturate(1.3) hue-rotate(10deg)' },
  { id: 'cool', name: 'Cool', filter: 'saturate(1.1) hue-rotate(-10deg)' },
  { id: 'bw', name: 'B&W', filter: 'grayscale(1)' },
  { id: 'dramatic', name: 'Dramatic', filter: 'contrast(1.3) saturate(1.2) brightness(0.9)' }
];

const STICKERS = ['😀', '😍', '🔥', '✨', '❤️', '👍', '🎉', '💯', '🌟', '🦄'];

export function PhotoEditor({ imageUrl, isOpen, onClose, onSave }: PhotoEditorProps) {
  const [editState, setEditState] = useState<EditState>(INITIAL_STATE);
  const [history, setHistory] = useState<EditState[]>([INITIAL_STATE]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'basic' | 'adjust' | 'background' | 'filters' | 'text' | 'stickers'>('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Background library states
  const [backgroundSearchQuery, setBackgroundSearchQuery] = useState('');
  const [selectedBackgroundCategory, setSelectedBackgroundCategory] = useState('featured');
  const [displayedBackgrounds, setDisplayedBackgrounds] = useState<BackgroundItem[]>([]);
  const [backgroundsLoading, setBackgroundsLoading] = useState(false);
  
  // Drag state for canvas
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Group/Ungroup state - controls whether image moves independently or with background
  const [isGrouped, setIsGrouped] = useState(true);
  
  // Text and sticker dragging states
  const [draggedElement, setDraggedElement] = useState<{type: 'text' | 'sticker', id: string} | null>(null);
  const [elementDragStart, setElementDragStart] = useState({ x: 0, y: 0, startX: 0, startY: 0 });
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [isEditingText, setIsEditingText] = useState<string | null>(null);
  const [editingTextValue, setEditingTextValue] = useState('');
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);
  const [canvasRect, setCanvasRect] = useState<DOMRect | null>(null);
  const [showSnapGuides, setShowSnapGuides] = useState(true);
  const [activeGuides, setActiveGuides] = useState<{ x?: number; y?: number }[]>([]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !img.complete) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    if (editState.backgroundType === 'solid') {
      ctx.fillStyle = editState.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (editState.backgroundType === 'gradient') {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, editState.gradientColors[0]);
      gradient.addColorStop(1, editState.gradientColors[1]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (editState.backgroundType === 'image' && editState.backgroundImage) {
      // Draw background image with positioning support for grouping
      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous';
      bgImg.onload = () => {
        // Clear and redraw with background
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Apply background positioning when grouped
        ctx.save();
        ctx.translate(
          editState.backgroundOffsetX, 
          editState.backgroundOffsetY
        );
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        ctx.restore();
        
        // Then draw the main image on top
        drawMainImage();
      };
      bgImg.src = editState.backgroundImage;
      return; // Exit early, will continue in onload
    }
    
    drawMainImage();
  };
  
  const drawMainImage = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Apply transformations with manual positioning
    ctx.save();
    ctx.translate(
      canvas.width / 2 + editState.offsetX, 
      canvas.height / 2 + editState.offsetY
    );
    ctx.rotate((editState.rotation * Math.PI) / 180);
    ctx.scale(
      editState.scale * (editState.flipH ? -1 : 1),
      editState.scale * (editState.flipV ? -1 : 1)
    );

    // Apply filters
    const filterString = [
      `brightness(${editState.brightness}%)`,
      `contrast(${editState.contrast}%)`,
      `saturate(${editState.saturation}%)`,
      `blur(${editState.blur}px)`,
      FILTERS.find(f => f.id === editState.filter)?.filter || ''
    ].join(' ');
    
    ctx.filter = filterString;
    ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    ctx.restore();

    // Draw all canvas elements using universal rendering
    editState.elements
      .filter(element => element.isVisible)
      .sort((a, b) => a.zIndex - b.zIndex)
      .forEach(element => {
        if (isEditingText === element.id) return; // Skip if being edited inline
        
        ctx.save();
        
        // Apply universal transformations
        ctx.translate(element.x, element.y);
        ctx.rotate((element.rotation * Math.PI) / 180);
        ctx.scale(element.scale, element.scale);
        ctx.globalAlpha = element.opacity;
        
        // Render based on element type
        if (element.type === 'text') {
          const data = element.data;
          
          // Set up font styling
          const fontStyle = data.fontStyle === 'italic' ? 'italic ' : '';
          const fontWeight = data.fontWeight || '400';
          ctx.font = `${fontStyle}${fontWeight} ${data.fontSize}px "${data.fontFamily}", sans-serif`;
          ctx.textAlign = data.textAlign as CanvasTextAlign;
          ctx.textBaseline = 'top';
          
          // Measure text for layout calculations
          const textMetrics = ctx.measureText(data.text);
          const textWidth = textMetrics.width;
          const textHeight = data.fontSize * data.lineHeight;
          
          // Split text into lines for proper line height handling
          const lines = data.text.split('\n');
          const lineHeight = data.fontSize * data.lineHeight;
          
          // Draw background highlight if enabled
          if (data.background.enabled) {
            ctx.save();
            ctx.globalAlpha = data.background.opacity * element.opacity;
            ctx.fillStyle = data.background.color;
            const padding = data.background.padding;
            ctx.fillRect(
              -padding - (textWidth / 2),
              -padding,
              textWidth + (padding * 2),
              (lines.length * lineHeight) + (padding * 2)
            );
            ctx.restore();
          }
          
            lines.forEach((line: string, lineIndex: number) => {
            const yOffset = lineIndex * lineHeight;
            
            // Apply text case transformation
            let processedLine = line;
            switch (data.textCase) {
              case 'uppercase': processedLine = line.toUpperCase(); break;
              case 'lowercase': processedLine = line.toLowerCase(); break;
              case 'capitalize': processedLine = line.split(' ').map((word: string) => 
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' '); break;
            }
            
            // Add list formatting if enabled
            if (data.listType === 'bullet' && lineIndex === 0) {
              processedLine = '• ' + processedLine;
            } else if (data.listType === 'numbered' && lineIndex === 0) {
              processedLine = '1. ' + processedLine;
            }
            
            // Apply lift effect (elevated shadow)
            if (data.lift?.enabled) {
              ctx.save();
              ctx.globalAlpha = data.lift.opacity * element.opacity;
              ctx.filter = `blur(${data.lift.blur}px)`;
              ctx.fillStyle = '#000000';
              ctx.fillText(
                processedLine,
                0,
                yOffset + data.lift.height
              );
              ctx.restore();
            }
            
            // Apply text shadow if enabled
            if (data.textShadow.enabled) {
              ctx.save();
              ctx.globalAlpha = data.textShadow.opacity * element.opacity;
              ctx.filter = `blur(${data.textShadow.blur}px)`;
              ctx.fillStyle = data.textShadow.color;
              ctx.fillText(
                processedLine,
                data.textShadow.offsetX,
                yOffset + data.textShadow.offsetY
              );
              ctx.restore();
            }
            
            // Apply neon effect if enabled
            if (data.neon?.enabled) {
              ctx.save();
              ctx.shadowColor = data.neon.glowColor;
              ctx.shadowBlur = data.neon.glowIntensity;
              ctx.fillStyle = data.neon.glowColor;
              // Multiple layers for stronger neon effect
              for (let i = 0; i < 3; i++) {
                ctx.fillText(processedLine, 0, yOffset);
              }
              ctx.restore();
            }
            
            // Apply glow effect if enabled
            if (data.glow.enabled) {
              ctx.save();
              ctx.shadowColor = data.glow.color;
              ctx.shadowBlur = data.glow.blur * data.glow.intensity;
              ctx.fillStyle = data.glow.color;
              ctx.fillText(processedLine, 0, yOffset);
              ctx.restore();
            }
            
            // Apply splice effect (offset duplicate)
            if (data.splice?.enabled) {
              ctx.save();
              ctx.fillStyle = data.splice.color;
              ctx.fillText(
                processedLine,
                data.splice.offset,
                yOffset + data.splice.offset
              );
              ctx.restore();
            }
            
            // Apply hollow effect (stroke only)
            if (data.hollow?.enabled) {
              ctx.strokeStyle = data.hollow.strokeColor;
              ctx.lineWidth = data.hollow.strokeWidth;
              ctx.lineJoin = 'round';
              ctx.strokeText(processedLine, 0, yOffset);
              return; // Skip fill for hollow effect
            }
            
            // Apply outline if enabled
            if (data.outline.enabled) {
              ctx.strokeStyle = data.outline.color;
              ctx.lineWidth = data.outline.width;
              ctx.lineJoin = 'round';
              ctx.strokeText(processedLine, 0, yOffset);
            }
            
            // Draw main text (gradient or solid color)
            if (data.gradient.enabled) {
              const gradient = ctx.createLinearGradient(
                -textWidth/2, 0, textWidth/2, data.fontSize
              );
              gradient.addColorStop(0, data.gradient.colors[0]);
              gradient.addColorStop(1, data.gradient.colors[1]);
              ctx.fillStyle = gradient;
            } else {
              ctx.fillStyle = data.color;
            }
            
            // Apply letter spacing
              if (data.letterSpacing !== 0) {
                const chars = processedLine.split('');
                let xOffset = 0;
                chars.forEach((char: string) => {
                  ctx.fillText(char, xOffset, yOffset);
                  xOffset += ctx.measureText(char).width + data.letterSpacing;
                });
              } else {
              ctx.fillText(processedLine, 0, yOffset);
            }
            
            // Apply text decoration
            if (data.textDecoration !== 'none') {
              ctx.strokeStyle = data.color;
              ctx.lineWidth = Math.max(1, data.fontSize / 20);
              
              const processedLineWidth = ctx.measureText(processedLine).width;
              const lineY = yOffset + (data.textDecoration === 'underline' ? data.fontSize : data.fontSize / 2);
              if (data.textDecoration === 'strikethrough') {
                ctx.beginPath();
                ctx.moveTo(-processedLineWidth/2, lineY);
                ctx.lineTo(processedLineWidth/2, lineY);
                ctx.stroke();
              } else if (data.textDecoration === 'underline') {
                ctx.beginPath();
                ctx.moveTo(-processedLineWidth/2, lineY);
                ctx.lineTo(processedLineWidth/2, lineY);
                ctx.stroke();
              }
            }
          });
          
        } else if (element.type === 'sticker') {
          const data = element.data;
          ctx.font = `${data.size}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(data.emoji, 0, 0);
        }
        
        ctx.restore();
        
        // Selection UI is now handled by TextResizeHandles component
      });
  };

  useEffect(() => {
    if (isOpen && imageUrl && imgRef.current) {
      imgRef.current.onload = renderCanvas;
      imgRef.current.src = imageUrl;
      // Load popular Google Fonts
      GoogleFontsLoader.loadPopularFonts();
    }
  }, [isOpen, imageUrl]);

  useEffect(() => {
    renderCanvas();
  }, [editState]);
  
  // Update canvas rect when canvas changes
  useEffect(() => {
    const updateCanvasRect = () => {
      if (canvasRef.current) {
        try {
          const rect = canvasRef.current.getBoundingClientRect();
          setCanvasRect(rect);
        } catch (error) {
          console.warn('Failed to update canvas rect:', error);
        }
      }
    };
    
    // Use a timeout to ensure canvas is fully rendered
    const timeoutId = setTimeout(updateCanvasRect, 100);
    
    window.addEventListener('resize', updateCanvasRect);
    window.addEventListener('scroll', updateCanvasRect);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateCanvasRect);
      window.removeEventListener('scroll', updateCanvasRect);
    };
  }, [editState]); // Update when editState changes (which affects canvas)
  
  // Load backgrounds when background tab is active
  useEffect(() => {
    if (activeTab !== 'background') return;
    
    setBackgroundsLoading(true);
    
    let results: BackgroundItem[] = [];
    
    if (backgroundSearchQuery.trim()) {
      results = searchBackgrounds(backgroundSearchQuery);
    } else if (selectedBackgroundCategory === 'featured') {
      results = getFeaturedBackgrounds();
    } else {
      results = getBackgroundsByCategory(selectedBackgroundCategory);
    }
    
    // Simulate loading for better UX
    setTimeout(() => {
      setDisplayedBackgrounds(results);
      setBackgroundsLoading(false);
    }, 200);
    
  }, [activeTab, backgroundSearchQuery, selectedBackgroundCategory]);

  const addToHistory = (newState: EditState) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setEditState(newState);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setEditState(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setEditState(history[historyIndex + 1]);
    }
  };

  const updateEditState = (updates: Partial<EditState>) => {
    const newState = { ...editState, ...updates };
    addToHistory(newState);
  };
  
  // Universal element update handler for floating controls and resize handles
  const updateSelectedElement = (updates: any) => {
    if (!selectedTextId) return;
    
    const updatedElements = editState.elements.map(element => 
      element.id === selectedTextId 
        ? { ...element, data: { ...element.data, ...updates } } 
        : element
    );
    
    updateEditState({ elements: updatedElements });
  };
  
  const resetAllEdits = () => {
    const resetState = { ...INITIAL_STATE };
    addToHistory(resetState);
    setBackgroundSearchQuery('');
    setSelectedBackgroundCategory('featured');
  };

  const handleExport = async (format: 'png' | 'jpg' = 'png') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsLoading(true);
    
    try {
      const dataUrl = canvas.toDataURL(`image/${format}`, 0.9);
      
      const link = document.createElement('a');
      link.download = `edited-image-${Date.now()}.${format}`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      if (onSave) {
        onSave(dataUrl);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      updateEditState({
        backgroundType: 'image',
        backgroundImage: result
      });
    };
    reader.readAsDataURL(file);
  };
  
  // Universal canvas interaction handler
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    if (!rect || !canvas) return;
    
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    
    // Use universal element manager to find element at position
    const clickedElement = CanvasElementManager.findElementAtPosition(x, y, editState.elements, canvas);
    
    if (clickedElement) {
      // Prevent image dragging when any element is clicked
      e.preventDefault();
      e.stopPropagation();
      
      if (selectedTextId === clickedElement.id && clickedElement.type === 'text') {
        // Double-click to edit text
        const now = Date.now();
        const lastClickTime = (clickedElement as any).lastClickTime || 0;
        if (now - lastClickTime < 300) { // Double click detected
          setIsEditingText(clickedElement.id);
          setEditingTextValue(clickedElement.data.text);
          return;
        }
      }
      
      // Select and prepare for drag
      setDraggedElement({ type: clickedElement.type as 'text' | 'sticker', id: clickedElement.id });
      setSelectedTextId(clickedElement.id);
      setElementDragStart({
        x: e.clientX,
        y: e.clientY,
        startX: clickedElement.x,
        startY: clickedElement.y
      });
      
      // Store click time for double-click detection
      (clickedElement as any).lastClickTime = Date.now();
      
    } else {
      // Only drag image if no element was clicked
      setSelectedTextId(null);
      setDraggedElement(null);
      setIsDragging(true);
      setDragStart({
        x: e.clientX - rect.left - editState.offsetX,
        y: e.clientY - rect.top - editState.offsetY
      });
    }
  };
  
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    if (!rect || !canvas) return;
    
    // Priority 1: Universal element dragging - this takes precedence
    if (draggedElement) {
      e.preventDefault();
      e.stopPropagation();
      
      // Smooth, accurate dragging calculation
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      const deltaX = (e.clientX - elementDragStart.x) * scaleX;
      const deltaY = (e.clientY - elementDragStart.y) * scaleY;
      
      const newX = elementDragStart.startX + deltaX;
      const newY = elementDragStart.startY + deltaY;
      
      // Update element using universal manager with snapping
      const updatedElements = editState.elements.map(element => {
        if (element.id === draggedElement.id) {
          return CanvasElementManager.updateElementPosition(
            element, newX, newY, canvas, showSnapGuides, editState.elements
          );
        }
        return element;
      });
      
      // Update smart guides while dragging
      if (showSnapGuides && canvas) {
        const guides = generateSmartGuides(editState.elements, draggedElement.id, canvas.width, canvas.height);
        setActiveGuides(guides);
      }
      
      updateEditState({ elements: updatedElements });
      
      // Don't process image dragging when element is being dragged
      return;
    }
    
    // Priority 2: Image dragging (only if no element is being dragged)
    if (isDragging) {
      const newOffsetX = e.clientX - rect.left - dragStart.x;
      const newOffsetY = e.clientY - rect.top - dragStart.y;
      
      if (isGrouped) {
        // Grouped: Move both image and background together
        updateEditState({
          offsetX: newOffsetX,
          offsetY: newOffsetY,
          backgroundOffsetX: newOffsetX,
          backgroundOffsetY: newOffsetY
        });
      } else {
        // Ungrouped: Move only the image
        updateEditState({
          offsetX: newOffsetX,
          offsetY: newOffsetY
        });
      }
    }
  };
  
  const handleCanvasMouseUp = () => {
    // Reset all dragging states
    setIsDragging(false);
    setDraggedElement(null);
    setActiveGuides([]); // Clear smart guides
  };
  
  // Handle mouse leave to ensure clean state when cursor leaves canvas
  const handleCanvasMouseLeave = () => {
    setIsDragging(false);
    setDraggedElement(null);
  };

  const addTextElement = (type: 'title' | 'subtitle' | 'body' = 'title') => {
    // Prevent duplicate calls within a short timeframe (React Strict Mode fix)
    const now = Date.now();
    const lastCallKey = `addTextElement_${type}`;
    const lastCallTime = (window as any)[lastCallKey] || 0;
    
    if (now - lastCallTime < 500) {
      console.log('Preventing duplicate text element creation');
      return;
    }
    (window as any)[lastCallKey] = now;
    
    const canvas = canvasRef.current;
    const canvasWidth = canvas ? canvas.width : 800;
    const canvasHeight = canvas ? canvas.height : 600;
    
    console.log('Creating new text element:', { type, canvasWidth, canvasHeight });
    
    const newText = CanvasElementManager.createTextElement(type, canvasWidth, canvasHeight);
    
    // Ensure text doesn't exceed 70% of canvas width
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const data = newText.data;
        ctx.font = `${data.fontWeight} ${data.fontSize}px "${data.fontFamily}", sans-serif`;
        const textWidth = ctx.measureText(data.text).width;
        const maxWidth = canvasWidth * 0.7;
        
        if (textWidth > maxWidth) {
          // Scale down font size to fit within 70% width
          const scaleFactor = maxWidth / textWidth;
          newText.data.fontSize = Math.round(data.fontSize * scaleFactor);
        }
      }
    }
    
    console.log('Adding text element:', newText);
    
    updateEditState({
      elements: [...editState.elements, newText]
    });
    setSelectedTextId(newText.id);
    
    console.log('Selected text ID set to:', newText.id);
    
    // Load the font if it's a Google Font
    const googleFont = POPULAR_FONTS.find(f => f.name === newText.data.fontFamily);
    if (googleFont) {
      GoogleFontsLoader.loadFont(googleFont.name, [newText.data.fontWeight]);
    }
    
    // Show controls first, then allow editing on click
    // This gives users a chance to see the bounding box and floating controls
    setTimeout(() => {
      console.log('Text element created and ready for interaction:', newText.id);
      // Don't automatically start editing - let user click to edit
      // This way they can see the floating controls and resize handles
    }, 100);
  };
  
  const deleteSelectedElement = () => {
    if (!selectedTextId) return;
    
    const updatedElements = editState.elements.filter(element => element.id !== selectedTextId);
    
    updateEditState({ elements: updatedElements });
    setSelectedTextId(null);
  };

  const addStickerElement = (emoji: string) => {
    const canvas = canvasRef.current;
    const centerX = canvas ? canvas.width / 2 : 200;
    const centerY = canvas ? canvas.height / 2 : 200;
    
    const newSticker = CanvasElementManager.createStickerElement(emoji, centerX, centerY);
    
    updateEditState({
      elements: [...editState.elements, newSticker]
    });
    setSelectedTextId(newSticker.id);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
        >
          {/* Left Panel - Tools */}
          <div className="w-full md:w-80 bg-gray-50 dark:bg-gray-800 border-r md:border-r border-b md:border-b-0 border-gray-200 dark:border-gray-700 flex flex-col max-h-[50vh] md:max-h-none">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Photo Editor</h2>
              <div className="flex items-center gap-2">
                {showSuccessMessage && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-lg"
                  >
                    ✓ Saved!
                  </motion.div>
                )}
                <button
                  onClick={resetAllEdits}
                  className="px-3 py-1.5 text-sm bg-white dark:bg-gray-700 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors rounded-lg border border-gray-300 dark:border-gray-600 flex items-center gap-2"
                  title="Reset All Changes"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
                <button
                  onClick={undo}
                  disabled={historyIndex === 0}
                  className="p-2 rounded-lg bg-white dark:bg-gray-700 shadow-sm disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  title="Undo"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  onClick={redo}
                  disabled={historyIndex === history.length - 1}
                  className="p-2 rounded-lg bg-white dark:bg-gray-700 shadow-sm disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  title="Redo"
                >
                  <Redo2 className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg bg-white dark:bg-gray-700 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tool Tabs */}
            <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
              {[
                { id: 'basic', icon: RotateCcw, name: 'Basic' },
                { id: 'adjust', icon: Settings, name: 'Adjust' },
                { id: 'background', icon: ImageIcon, name: 'Background' },
                { id: 'filters', icon: Zap, name: 'Filters' },
                { id: 'text', icon: Type, name: 'Text' },
                { id: 'stickers', icon: Smile, name: 'Stickers' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Tool Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Basic Tools */}
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800 font-medium mb-2">💡 Drag & Drop</p>
                    <p className="text-xs text-blue-600">Click and drag on the image to reposition it manually, just like Canva!</p>
                  </div>
                  
                  {/* Group/Ungroup Toggle */}
                  <div className="p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {isGrouped ? <Group className="w-4 h-4 text-green-600" /> : <Ungroup className="w-4 h-4 text-blue-600" />}
                        <span className="text-sm font-medium">{isGrouped ? 'Grouped' : 'Ungrouped'}</span>
                      </div>
                      <button
                        onClick={() => setIsGrouped(!isGrouped)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          isGrouped 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        {isGrouped ? 'Ungroup' : 'Group'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-600">
                      {isGrouped 
                        ? '🔗 Grouped: Dragging moves the entire composition (image + background together)'
                        : '🎯 Ungrouped: Dragging only repositions the foreground image, background stays fixed'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Position X</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="-200"
                        max="200"
                        value={editState.offsetX}
                        onChange={(e) => updateEditState({ offsetX: parseInt(e.target.value) })}
                        className="flex-1"
                      />
                      <span className="text-sm w-12 text-right">{editState.offsetX}px</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Position Y</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="-200"
                        max="200"
                        value={editState.offsetY}
                        onChange={(e) => updateEditState({ offsetY: parseInt(e.target.value) })}
                        className="flex-1"
                      />
                      <span className="text-sm w-12 text-right">{editState.offsetY}px</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Size</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0.1"
                        max="3"
                        step="0.1"
                        value={editState.scale}
                        onChange={(e) => updateEditState({ scale: parseFloat(e.target.value) })}
                        className="flex-1"
                      />
                      <span className="text-sm w-12 text-right">{Math.round(editState.scale * 100)}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Rotation</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={editState.rotation}
                        onChange={(e) => updateEditState({ rotation: parseInt(e.target.value) })}
                        className="flex-1"
                      />
                      <span className="text-sm w-12 text-right">{editState.rotation}°</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateEditState({ flipH: !editState.flipH })}
                      className={`flex-1 p-2 rounded-lg border ${editState.flipH ? 'bg-blue-100 border-blue-300' : 'bg-white border-gray-300'}`}
                    >
                      <FlipHorizontal className="w-4 h-4 mx-auto" />
                      <div className="text-xs mt-1">Flip H</div>
                    </button>
                    <button
                      onClick={() => updateEditState({ flipV: !editState.flipV })}
                      className={`flex-1 p-2 rounded-lg border ${editState.flipV ? 'bg-blue-100 border-blue-300' : 'bg-white border-gray-300'}`}
                    >
                      <FlipVertical className="w-4 h-4 mx-auto" />
                      <div className="text-xs mt-1">Flip V</div>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updateEditState({ 
                        offsetX: 0, 
                        offsetY: 0, 
                        backgroundOffsetX: 0, 
                        backgroundOffsetY: 0, 
                        scale: 1, 
                        rotation: 0, 
                        flipH: false, 
                        flipV: false 
                      })}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => setShowSnapGuides(!showSnapGuides)}
                      className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                        showSnapGuides
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      Snap: {showSnapGuides ? 'On' : 'Off'}
                    </button>
                  </div>
                </div>
              )}

              {/* Adjustments */}
              {activeTab === 'adjust' && (
                <div className="space-y-4">
                  {[
                    { key: 'brightness', label: 'Brightness', icon: Sun, min: 0, max: 200 },
                    { key: 'contrast', label: 'Contrast', icon: Contrast, min: 0, max: 200 },
                    { key: 'saturation', label: 'Saturation', icon: Droplets, min: 0, max: 200 },
                    { key: 'blur', label: 'Blur', icon: Circle, min: 0, max: 10 }
                  ].map(adjustment => (
                    <div key={adjustment.key}>
                      <label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <adjustment.icon className="w-4 h-4" />
                        {adjustment.label}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min={adjustment.min}
                          max={adjustment.max}
                          value={editState[adjustment.key as keyof EditState] as number}
                          onChange={(e) => updateEditState({ [adjustment.key]: parseInt(e.target.value) })}
                          className="flex-1"
                        />
                        <span className="text-sm w-12 text-right">
                          {adjustment.key === 'blur' ? 
                            `${editState[adjustment.key as keyof EditState]}px` :
                            `${editState[adjustment.key as keyof EditState]}%`
                          }
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Background */}
              {activeTab === 'background' && (
                <div className="space-y-4 h-full flex flex-col">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search backgrounds..."
                      value={backgroundSearchQuery}
                      onChange={(e) => setBackgroundSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    />
                    {backgroundSearchQuery && (
                      <button
                        onClick={() => setBackgroundSearchQuery('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {/* Quick Options */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updateEditState({ backgroundType: 'transparent' })}
                      className={`p-3 rounded-lg border text-sm ${
                        editState.backgroundType === 'transparent'
                          ? 'bg-blue-100 border-blue-300 text-blue-600'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      Transparent
                    </button>
                    <button
                      onClick={() => {
                        backgroundInputRef.current?.click();
                      }}
                      className="p-3 rounded-lg border text-sm bg-white border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload
                    </button>
                  </div>
                  
                  {/* Categories */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Categories</label>
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => {
                          setSelectedBackgroundCategory('featured');
                          setBackgroundSearchQuery('');
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          selectedBackgroundCategory === 'featured'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Featured
                      </button>
                      {backgroundCategories.slice(0, 6).map(category => (
                        <button
                          key={category.id}
                          onClick={() => {
                            setSelectedBackgroundCategory(category.id);
                            setBackgroundSearchQuery('');
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            selectedBackgroundCategory === category.id
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Background Grid */}
                  <div className="flex-1 min-h-0">
                    {backgroundsLoading ? (
                      <div className="grid grid-cols-2 gap-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="aspect-[4/3] bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      <>
                        {backgroundSearchQuery && (
                          <div className="mb-2">
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {displayedBackgrounds.length} backgrounds found
                            </p>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                          {displayedBackgrounds.map((background) => (
                            <motion.div
                              key={background.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="relative group cursor-pointer"
                              onClick={() => {
                                updateEditState({
                                  backgroundType: 'image',
                                  backgroundImage: background.url
                                });
                              }}
                            >
                              <div className="aspect-[4/3] rounded-lg overflow-hidden border-2 border-transparent group-hover:border-blue-500 transition-all">
                                <img
                                  src={background.thumbnail}
                                  alt={background.name}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                                
                                {/* Premium Badge */}
                                {background.premium && (
                                  <div className="absolute top-1 right-1 bg-yellow-500 text-white px-1 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                                    <Crown className="w-2 h-2" />
                                  </div>
                                )}
                                
                                {/* Selection indicator */}
                                {editState.backgroundImage === background.url && (
                                  <div className="absolute inset-0 bg-blue-500/20 border-2 border-blue-500 rounded-lg" />
                                )}
                              </div>
                              
                              <div className="mt-1">
                                <h3 className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                  {background.name}
                                </h3>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                        
                        {displayedBackgrounds.length === 0 && !backgroundsLoading && (
                          <div className="text-center py-8">
                            <Search className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">No backgrounds found</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  <input
                    ref={backgroundInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundUpload}
                    className="hidden"
                  />
                </div>
              )}

              {/* Filters */}
              {activeTab === 'filters' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {FILTERS.map(filter => (
                      <button
                        key={filter.id}
                        onClick={() => updateEditState({ filter: filter.id })}
                        className={`p-3 rounded-lg border text-sm ${
                          editState.filter === filter.id
                            ? 'bg-blue-100 border-blue-300 text-blue-600'
                            : 'bg-white border-gray-300'
                        }`}
                      >
                        {filter.name}
                      </button>
                    ))}
                  </div>
                  
                  <button className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors">
                    <Sparkles className="w-4 h-4" />
                    AI Auto Enhance
                  </button>
                </div>
              )}

              {/* Text */}
              {activeTab === 'text' && (
                <div className="space-y-4 max-h-full overflow-y-auto">
                  {/* Text Type Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => addTextElement('title')}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                    >
                      Title
                    </button>
                    <button
                      onClick={() => addTextElement('subtitle')}
                      className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium"
                    >
                      Subtitle
                    </button>
                    <button
                      onClick={() => addTextElement('body')}
                      className="p-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium"
                    >
                      Body
                    </button>
                  </div>

                  {selectedTextId && (() => {
                    const selectedElement = editState.elements.find(el => el.id === selectedTextId && el.type === 'text');
                    if (!selectedElement) return null;
                    const selectedText = selectedElement.data;

                    const updateSelectedText = (updates: any) => {
                      const updated = editState.elements.map(el => 
                        el.id === selectedTextId ? { ...el, data: { ...el.data, ...updates } } : el
                      );
                      updateEditState({ elements: updated });
                    };

                    return (
                      <div className="space-y-4 border border-blue-200 bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-blue-800">Text Editing</h3>
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                const updatedElements = editState.elements.map(el => 
                                  el.id === selectedTextId ? { ...el, isVisible: !el.isVisible } : el
                                );
                                updateEditState({ elements: updatedElements });
                              }}
                              className={`p-1 rounded ${selectedElement.isVisible ? 'bg-blue-200' : 'bg-gray-200'}`}
                              title={selectedElement.isVisible ? 'Hide' : 'Show'}
                            >
                              {selectedElement.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => {
                                const updatedElements = editState.elements.map(el => 
                                  el.id === selectedTextId ? { ...el, isLocked: !el.isLocked } : el
                                );
                                updateEditState({ elements: updatedElements });
                              }}
                              className={`p-1 rounded ${selectedElement.isLocked ? 'bg-red-200' : 'bg-blue-200'}`}
                              title={selectedElement.isLocked ? 'Unlock' : 'Lock'}
                            >
                              {selectedElement.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={deleteSelectedElement}
                              className="p-1 bg-red-200 hover:bg-red-300 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-700" />
                            </button>
                          </div>
                        </div>

                        {/* Text Content */}
                        <div>
                          <label className="block text-xs font-medium mb-1">Text</label>
                          <textarea
                            value={selectedText.text}
                            onChange={(e) => updateSelectedText({ text: e.target.value })}
                            className="w-full p-2 border rounded text-sm resize-none"
                            rows={3}
                            placeholder="Enter your text..."
                          />
                        </div>

                        {/* Font Family */}
                        <div>
                          <label className="block text-xs font-medium mb-1">Font Family</label>
                          <select
                            value={selectedText.fontFamily}
                            onChange={(e) => {
                              updateSelectedText({ fontFamily: e.target.value });
                              const googleFont = POPULAR_FONTS.find(f => f.name === e.target.value);
                              if (googleFont) {
                                GoogleFontsLoader.loadFont(googleFont.name, [selectedText.fontWeight]);
                              }
                            }}
                            className="w-full p-2 border rounded text-sm"
                          >
                            {POPULAR_FONTS.map(font => (
                              <option key={font.name} value={font.name}>
                                {font.name} - {font.preview}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Typography Controls */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-medium mb-1">Size: {selectedText.fontSize}px</label>
                            <input
                              type="range"
                              min="8"
                              max="300"
                              step="0.1"
                              value={selectedText.fontSize}
                              onChange={(e) => updateSelectedText({ fontSize: parseFloat(e.target.value) })}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex items-center gap-1 mt-1">
                              <input
                                type="number"
                                min="8"
                                max="300"
                                step="0.1"
                                value={selectedText.fontSize}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value);
                                  if (!isNaN(value) && value >= 8 && value <= 300) {
                                    updateSelectedText({ fontSize: value });
                                  }
                                }}
                                className="w-16 px-2 py-1 text-xs border rounded"
                              />
                              <span className="text-xs text-gray-500">px</span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">Weight</label>
                            <select
                              value={selectedText.fontWeight}
                              onChange={(e) => updateSelectedText({ fontWeight: e.target.value })}
                              className="w-full p-2 border rounded text-xs"
                            >
                              {Object.entries(FONT_WEIGHTS).map(([weight, label]) => (
                                <option key={weight} value={weight}>{label}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Text Style Toggles */}
                        <div className="grid grid-cols-4 gap-1">
                          <button
                            onClick={() => updateSelectedText({ fontStyle: selectedText.fontStyle === 'italic' ? 'normal' : 'italic' })}
                            className={`p-2 border rounded text-xs ${selectedText.fontStyle === 'italic' ? 'bg-blue-200 border-blue-300' : 'bg-white'}`}
                          >
                            <Italic className="w-3 h-3 mx-auto" />
                          </button>
                          <button
                            onClick={() => updateSelectedText({ textDecoration: selectedText.textDecoration === 'underline' ? 'none' : 'underline' })}
                            className={`p-2 border rounded text-xs ${selectedText.textDecoration === 'underline' ? 'bg-blue-200 border-blue-300' : 'bg-white'}`}
                          >
                            <Underline className="w-3 h-3 mx-auto" />
                          </button>
                          <button
                            onClick={() => updateSelectedText({ textDecoration: selectedText.textDecoration === 'strikethrough' ? 'none' : 'strikethrough' })}
                            className={`p-2 border rounded text-xs ${selectedText.textDecoration === 'strikethrough' ? 'bg-blue-200 border-blue-300' : 'bg-white'}`}
                          >
                            <Strikethrough className="w-3 h-3 mx-auto" />
                          </button>
                          <button
                            onClick={() => updateSelectedText({ fontWeight: selectedText.fontWeight === '700' ? '400' : '700' })}
                            className={`p-2 border rounded text-xs ${selectedText.fontWeight === '700' ? 'bg-blue-200 border-blue-300' : 'bg-white'}`}
                          >
                            <Bold className="w-3 h-3 mx-auto" />
                          </button>
                        </div>

                        {/* Text Alignment */}
                        <div className="grid grid-cols-4 gap-1">
                          {[
                            { align: 'left', icon: AlignLeft },
                            { align: 'center', icon: AlignCenter },
                            { align: 'right', icon: AlignRight },
                            { align: 'justify', icon: AlignJustify }
                          ].map(({ align, icon: Icon }) => (
                            <button
                              key={align}
                              onClick={() => updateSelectedText({ textAlign: align as any })}
                              className={`p-2 border rounded text-xs ${selectedText.textAlign === align ? 'bg-blue-200 border-blue-300' : 'bg-white'}`}
                            >
                              <Icon className="w-3 h-3 mx-auto" />
                            </button>
                          ))}
                        </div>

                        {/* Color and Opacity */}
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-xs font-medium mb-1">Color</label>
                            <input
                              type="color"
                              value={selectedText.color}
                              onChange={(e) => updateSelectedText({ color: e.target.value })}
                              className="w-full h-8 border rounded"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs font-medium mb-1">Opacity: {Math.round(selectedText.opacity * 100)}%</label>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={selectedText.opacity}
                              onChange={(e) => updateSelectedText({ opacity: parseFloat(e.target.value) })}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Spacing Controls */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-medium mb-1">Line Height: {selectedText.lineHeight}</label>
                            <input
                              type="range"
                              min="0.8"
                              max="2"
                              step="0.1"
                              value={selectedText.lineHeight}
                              onChange={(e) => updateSelectedText({ lineHeight: parseFloat(e.target.value) })}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">Letter Spacing: {selectedText.letterSpacing}px</label>
                            <input
                              type="range"
                              min="-5"
                              max="10"
                              step="0.5"
                              value={selectedText.letterSpacing}
                              onChange={(e) => updateSelectedText({ letterSpacing: parseFloat(e.target.value) })}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Text Case Controls */}
                        <div>
                          <label className="block text-xs font-medium mb-2">Text Case</label>
                          <div className="grid grid-cols-4 gap-1">
                            {[
                              { value: 'normal', label: 'Aa' },
                              { value: 'uppercase', label: 'AA' },
                              { value: 'lowercase', label: 'aa' },
                              { value: 'capitalize', label: 'Aa' }
                            ].map(({ value, label }) => (
                              <button
                                key={value}
                                onClick={() => updateSelectedText({ textCase: value })}
                                className={`p-2 border rounded text-xs font-mono ${
                                  selectedText.textCase === value ? 'bg-blue-200 border-blue-300' : 'bg-white'
                                }`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* List Controls */}
                        <div>
                          <label className="block text-xs font-medium mb-2">List Type</label>
                          <div className="grid grid-cols-3 gap-1">
                            {[
                              { value: 'none', label: 'None' },
                              { value: 'bullet', label: '• List' },
                              { value: 'numbered', label: '1. List' }
                            ].map(({ value, label }) => (
                              <button
                                key={value}
                                onClick={() => updateSelectedText({ listType: value })}
                                className={`p-2 border rounded text-xs ${
                                  selectedText.listType === value ? 'bg-blue-200 border-blue-300' : 'bg-white'
                                }`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Color Controls */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-medium mb-1">Text Color</label>
                            <input
                              type="color"
                              value={selectedText.color}
                              onChange={(e) => updateSelectedText({ color: e.target.value })}
                              className="w-full h-8 border rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">Highlight</label>
                            <div className="flex gap-1">
                              <input
                                type="color"
                                value={selectedText.background.color}
                                onChange={(e) => updateSelectedText({ 
                                  background: { ...selectedText.background, color: e.target.value, enabled: true } 
                                })}
                                className="flex-1 h-8 border rounded"
                              />
                              <button
                                onClick={() => updateSelectedText({ 
                                  background: { ...selectedText.background, enabled: !selectedText.background.enabled } 
                                })}
                                className={`px-2 text-xs rounded ${
                                  selectedText.background.enabled ? 'bg-blue-200' : 'bg-gray-200'
                                }`}
                              >
                                {selectedText.background.enabled ? 'On' : 'Off'}
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Position Controls */}
                        <div>
                          <label className="block text-xs font-medium mb-2">Position & Layer</label>
                          <div className="grid grid-cols-4 gap-1">
                            <button
                              onClick={() => {
                                const updated = editState.elements.map(el => 
                                  el.id === selectedTextId ? { ...el, zIndex: el.zIndex + 1 } : el
                                );
                                updateEditState({ elements: updated });
                              }}
                              className="p-2 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                              title="Bring Forward"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => {
                                const updated = editState.elements.map(el => 
                                  el.id === selectedTextId ? { ...el, zIndex: Math.max(0, el.zIndex - 1) } : el
                                );
                                updateEditState({ elements: updated });
                              }}
                              className="p-2 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                              title="Send Backward"
                            >
                              ↓
                            </button>
                            <button
                              onClick={() => {
                                const element = editState.elements.find(el => el.id === selectedTextId);
                                if (element) {
                                  const newElement = {
                                    ...element,
                                    id: `${element.type}-${Date.now()}`,
                                    x: element.x + 20,
                                    y: element.y + 20,
                                    zIndex: Date.now()
                                  };
                                  updateEditState({ elements: [...editState.elements, newElement] });
                                  setSelectedTextId(newElement.id);
                                }
                              }}
                              className="p-2 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                              title="Duplicate"
                            >
                              ⧉
                            </button>
                            <button
                              onClick={() => {
                                const canvas = canvasRef.current;
                                if (canvas) {
                                  const updated = editState.elements.map(el => 
                                    el.id === selectedTextId ? { 
                                      ...el, 
                                      x: canvas.width / 2,
                                      y: canvas.height / 2 
                                    } : el
                                  );
                                  updateEditState({ elements: updated });
                                }
                              }}
                              className="p-2 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                              title="Center"
                            >
                              ⌖
                            </button>
                          </div>
                        </div>
                        
                        {/* Text Effects */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-semibold">Effects</h4>
                          
                          {/* Shadow */}
                          <div className="border rounded p-2 bg-white">
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs font-medium">Shadow</label>
                              <input
                                type="checkbox"
                                checked={selectedText.textShadow.enabled}
                                onChange={(e) => updateSelectedText({
                                  textShadow: { ...selectedText.textShadow, enabled: e.target.checked }
                                })}
                                className="rounded"
                              />
                            </div>
                            {selectedText.textShadow.enabled && (
                              <div className="grid grid-cols-2 gap-1 text-xs">
                                <input
                                  type="color"
                                  value={selectedText.textShadow.color}
                                  onChange={(e) => updateSelectedText({
                                    textShadow: { ...selectedText.textShadow, color: e.target.value }
                                  })}
                                  className="w-full h-6 border rounded"
                                />
                                <input
                                  type="range"
                                  min="0"
                                  max="20"
                                  value={selectedText.textShadow.blur}
                                  onChange={(e) => updateSelectedText({
                                    textShadow: { ...selectedText.textShadow, blur: parseInt(e.target.value) }
                                  })}
                                  className="w-full"
                                />
                              </div>
                            )}
                          </div>

                          {/* Outline */}
                          <div className="border rounded p-2 bg-white">
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs font-medium">Outline</label>
                              <input
                                type="checkbox"
                                checked={selectedText.outline.enabled}
                                onChange={(e) => updateSelectedText({
                                  outline: { ...selectedText.outline, enabled: e.target.checked }
                                })}
                                className="rounded"
                              />
                            </div>
                            {selectedText.outline.enabled && (
                              <div className="grid grid-cols-2 gap-1 text-xs">
                                <input
                                  type="color"
                                  value={selectedText.outline.color}
                                  onChange={(e) => updateSelectedText({
                                    outline: { ...selectedText.outline, color: e.target.value }
                                  })}
                                  className="w-full h-6 border rounded"
                                />
                                <input
                                  type="range"
                                  min="1"
                                  max="10"
                                  value={selectedText.outline.width}
                                  onChange={(e) => updateSelectedText({
                                    outline: { ...selectedText.outline, width: parseInt(e.target.value) }
                                  })}
                                  className="w-full"
                                />
                              </div>
                            )}
                          </div>

                          {/* Gradient */}
                          <div className="border rounded p-2 bg-white">
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs font-medium">Gradient</label>
                              <input
                                type="checkbox"
                                checked={selectedText.gradient.enabled}
                                onChange={(e) => updateSelectedText({
                                  gradient: { ...selectedText.gradient, enabled: e.target.checked }
                                })}
                                className="rounded"
                              />
                            </div>
                            {selectedText.gradient.enabled && (
                              <div className="grid grid-cols-2 gap-1 text-xs">
                                <input
                                  type="color"
                                  value={selectedText.gradient.colors[0]}
                                  onChange={(e) => updateSelectedText({
                                    gradient: {
                                      ...selectedText.gradient,
                                      colors: [e.target.value, selectedText.gradient.colors[1]]
                                    }
                                  })}
                                  className="w-full h-6 border rounded"
                                />
                                <input
                                  type="color"
                                  value={selectedText.gradient.colors[1]}
                                  onChange={(e) => updateSelectedText({
                                    gradient: {
                                      ...selectedText.gradient,
                                      colors: [selectedText.gradient.colors[0], e.target.value]
                                    }
                                  })}
                                  className="w-full h-6 border rounded"
                                />
                              </div>
                            )}
                          </div>

                          {/* Lift Effect */}
                          <div className="border rounded p-2 bg-white">
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs font-medium">Lift</label>
                              <input
                                type="checkbox"
                                checked={selectedText.lift?.enabled || false}
                                onChange={(e) => updateSelectedText({
                                  lift: { ...selectedText.lift, enabled: e.target.checked }
                                })}
                                className="rounded"
                              />
                            </div>
                            {selectedText.lift?.enabled && (
                              <div className="grid grid-cols-2 gap-1 text-xs">
                                <input
                                  type="range"
                                  min="5"
                                  max="30"
                                  value={selectedText.lift.height || 10}
                                  onChange={(e) => updateSelectedText({
                                    lift: { ...selectedText.lift, height: parseInt(e.target.value) }
                                  })}
                                  className="w-full"
                                  title="Height"
                                />
                                <input
                                  type="range"
                                  min="5"
                                  max="30"
                                  value={selectedText.lift.blur || 15}
                                  onChange={(e) => updateSelectedText({
                                    lift: { ...selectedText.lift, blur: parseInt(e.target.value) }
                                  })}
                                  className="w-full"
                                  title="Blur"
                                />
                              </div>
                            )}
                          </div>
                          
                          {/* Hollow Effect */}
                          <div className="border rounded p-2 bg-white">
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs font-medium">Hollow</label>
                              <input
                                type="checkbox"
                                checked={selectedText.hollow?.enabled || false}
                                onChange={(e) => updateSelectedText({
                                  hollow: { ...selectedText.hollow, enabled: e.target.checked }
                                })}
                                className="rounded"
                              />
                            </div>
                            {selectedText.hollow?.enabled && (
                              <div className="grid grid-cols-2 gap-1 text-xs">
                                <input
                                  type="color"
                                  value={selectedText.hollow.strokeColor || '#000000'}
                                  onChange={(e) => updateSelectedText({
                                    hollow: { ...selectedText.hollow, strokeColor: e.target.value }
                                  })}
                                  className="w-full h-6 border rounded"
                                />
                                <input
                                  type="range"
                                  min="1"
                                  max="10"
                                  value={selectedText.hollow.strokeWidth || 2}
                                  onChange={(e) => updateSelectedText({
                                    hollow: { ...selectedText.hollow, strokeWidth: parseInt(e.target.value) }
                                  })}
                                  className="w-full"
                                />
                              </div>
                            )}
                          </div>
                          
                          {/* Neon Effect */}
                          <div className="border rounded p-2 bg-white">
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs font-medium">Neon</label>
                              <input
                                type="checkbox"
                                checked={selectedText.neon?.enabled || false}
                                onChange={(e) => updateSelectedText({
                                  neon: { ...selectedText.neon, enabled: e.target.checked }
                                })}
                                className="rounded"
                              />
                            </div>
                            {selectedText.neon?.enabled && (
                              <div className="grid grid-cols-2 gap-1 text-xs">
                                <input
                                  type="color"
                                  value={selectedText.neon.glowColor || '#00ff00'}
                                  onChange={(e) => updateSelectedText({
                                    neon: { ...selectedText.neon, glowColor: e.target.value }
                                  })}
                                  className="w-full h-6 border rounded"
                                />
                                <input
                                  type="range"
                                  min="5"
                                  max="50"
                                  value={selectedText.neon.glowIntensity || 20}
                                  onChange={(e) => updateSelectedText({
                                    neon: { ...selectedText.neon, glowIntensity: parseInt(e.target.value) }
                                  })}
                                  className="w-full"
                                />
                              </div>
                            )}
                          </div>
                          
                          {/* Splice Effect */}
                          <div className="border rounded p-2 bg-white">
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs font-medium">Splice</label>
                              <input
                                type="checkbox"
                                checked={selectedText.splice?.enabled || false}
                                onChange={(e) => updateSelectedText({
                                  splice: { ...selectedText.splice, enabled: e.target.checked }
                                })}
                                className="rounded"
                              />
                            </div>
                            {selectedText.splice?.enabled && (
                              <div className="grid grid-cols-2 gap-1 text-xs">
                                <input
                                  type="color"
                                  value={selectedText.splice.color || '#ff0000'}
                                  onChange={(e) => updateSelectedText({
                                    splice: { ...selectedText.splice, color: e.target.value }
                                  })}
                                  className="w-full h-6 border rounded"
                                />
                                <input
                                  type="range"
                                  min="1"
                                  max="10"
                                  value={selectedText.splice.offset || 2}
                                  onChange={(e) => updateSelectedText({
                                    splice: { ...selectedText.splice, offset: parseInt(e.target.value) }
                                  })}
                                  className="w-full"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Text Elements List */}
                  {editState.elements.filter(el => el.type === 'text').length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Text Layers ({editState.elements.filter(el => el.type === 'text').length})</h4>
                      {editState.elements
                        .filter(el => el.type === 'text')
                        .sort((a, b) => b.zIndex - a.zIndex)
                        .map((textEl, index) => (
                        <div
                          key={textEl.id}
                          className={`flex items-center justify-between p-2 border rounded cursor-pointer ${
                            selectedTextId === textEl.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedTextId(textEl.id)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">{textEl.id.split('-')[0]}</span>
                            <span className="text-sm truncate max-w-20">{textEl.data.text}</span>
                          </div>
                          <div className="flex gap-1">
                            {!textEl.isVisible && <EyeOff className="w-3 h-3 text-gray-400" />}
                            {textEl.isLocked && <Lock className="w-3 h-3 text-red-400" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {editState.elements.filter(el => el.type === 'text').length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Type className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No text elements yet</p>
                      <p className="text-xs">Choose a text type above to get started</p>
                    </div>
                  )}
                </div>
              )}

              {/* Stickers */}
              {activeTab === 'stickers' && (
                <div className="space-y-4">
                  {selectedTextId && (
                    <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                      <span className="text-sm text-blue-700">Sticker selected</span>
                      <button
                        onClick={deleteSelectedElement}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                    💡 Click on stickers in the canvas to select and move them!
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    {STICKERS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => addStickerElement(emoji)}
                        className="aspect-square p-2 text-2xl border rounded-lg hover:bg-gray-100 transition-colors"
                        title={`Add ${emoji} sticker`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  
                  {editState.elements.filter(el => el.type === 'sticker').length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Current Stickers ({editState.elements.filter(el => el.type === 'sticker').length})</h4>
                      <div className="space-y-2">
                        {editState.elements.filter(el => el.type === 'sticker').map(sticker => (
                          <div 
                            key={sticker.id}
                            className={`flex items-center justify-between p-2 border rounded ${
                              selectedTextId === sticker.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{sticker.data.emoji}</span>
                              <span className="text-sm text-gray-600">Size: {sticker.data.size}px</span>
                            </div>
                            {selectedTextId === sticker.id && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Selected</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {editState.elements.filter(el => el.type === 'sticker').length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Smile className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No stickers yet</p>
                      <p className="text-xs">Click any emoji above to add it</p>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Export Options */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <button
                onClick={() => handleExport('png')}
                disabled={isLoading}
                className="w-full p-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg flex items-center justify-center gap-2 font-medium"
              >
                <Download className="w-4 h-4" />
                {isLoading ? 'Exporting...' : 'Download PNG'}
              </button>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleExport('jpg')}
                  disabled={isLoading}
                  className="flex-1 p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm"
                >
                  JPG
                </button>
                <button
                  onClick={() => onSave?.(canvasRef.current?.toDataURL() || '')}
                  disabled={isLoading}
                  className="flex-1 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center justify-center gap-1"
                >
                  <Save className="w-3 h-3" />
                  Save
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Canvas */}
          <div className="flex-1 bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-2 md:p-4">
            <div className="relative max-w-full max-h-full">
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-[50vh] md:max-h-full object-contain border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg bg-white"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                    cursor: draggedElement ? 'grabbing' : 
                            isDragging ? 'grabbing' : 
                            selectedTextId ? 'move' : 'grab'
                  }}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseLeave}
                />
                
                {/* Inline Text Editor like Canva */}
                {isEditingText && (() => {
                  const textEl = editState.elements.find(el => el.id === isEditingText && el.type === 'text');
                  if (!textEl || !canvasRef.current) return null;
                  
                  const canvas = canvasRef.current;
                  const rect = canvas.getBoundingClientRect();
                  const scaleX = rect.width / canvas.width;
                  const scaleY = rect.height / canvas.height;
                  
                  return (
                    <input
                      type="text"
                      value={editingTextValue}
                      onChange={(e) => setEditingTextValue(e.target.value)}
                      onBlur={() => {
                        // Save changes
                        const updated = editState.elements.map(el => 
                          el.id === isEditingText ? { ...el, data: { ...el.data, text: editingTextValue } } : el
                        );
                        updateEditState({ elements: updated });
                        setIsEditingText(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          // e.target is a generic EventTarget; cast to HTMLInputElement to access blur()
                          (e.target as HTMLInputElement).blur();
                        }
                        if (e.key === 'Escape') {
                          setIsEditingText(null);
                        }
                      }}
                      autoFocus
                      className="absolute bg-transparent border-none outline-none text-center font-bold"
                      style={{
                        left: textEl.x * scaleX + rect.left - window.scrollX - 20,
                        top: (textEl.y - textEl.data.fontSize) * scaleY + rect.top - window.scrollY - 5,
                        fontSize: `${textEl.data.fontSize * Math.min(scaleX, scaleY)}px`,
                        fontFamily: textEl.data.fontFamily,
                        color: textEl.data.color,
                        textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                        minWidth: '100px',
                        zIndex: 1000
                      }}
                    />
                  );
                })()}
              </div>
              <img
                ref={imgRef}
                style={{ display: 'none' }}
                crossOrigin="anonymous"
              />
            </div>
          </div>
        </motion.div>
        
        {/* Floating Text Controls */}
        <FloatingTextControls
          selectedElement={selectedTextId ? editState.elements.find(el => el.id === selectedTextId && el.type === 'text') : null}
          onUpdateElement={updateSelectedElement}
          onDeleteElement={deleteSelectedElement}
          canvasRect={canvasRect ?? undefined}
          isVisible={!!selectedTextId && editState.elements.some(el => el.id === selectedTextId && el.type === 'text')}
        />
        
        {/* Text Resize Handles */}
        <TextResizeHandles
          element={selectedTextId ? editState.elements.find(el => el.id === selectedTextId && el.type === 'text') : null}
          canvasRef={canvasRef}
          onUpdateElement={updateSelectedElement}
          isVisible={!!selectedTextId && !isEditingText && editState.elements.some(el => el.id === selectedTextId && el.type === 'text')}
        />
        
        {/* Snap Guides */}
        <SnapGuides
          isVisible={showSnapGuides && (isDragging || !!draggedElement)}
          canvasRect={canvasRect ?? undefined}
          gridSize={20}
          showGrid={true}
          showGuides={true}
          guideLines={activeGuides}
        />
      </motion.div>
    </AnimatePresence>
  );
}
