'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface RoomPreviewProps {
  image: string;
  title: string;
  dictionary: any;
  artworkWidth?: number; // in cm
  artworkHeight?: number; // in cm
}

interface Interior {
  id: string;
  category: 'livingRoom' | 'bedroom' | 'office';
  path: string;
  wallWidthCm: number;
  initialX: number;
  initialY: number;
}

const INTERIORS: Interior[] = [
  { id: 'living-room-1', category: 'livingRoom', path: '/images/interiors/living-room-1-v3.jpg', wallWidthCm: 450, initialX: 50, initialY: 35 },
  { id: 'living-room-2', category: 'livingRoom', path: '/images/interiors/living-room-2-v3.jpg', wallWidthCm: 380, initialX: 50, initialY: 40 },
  { id: 'living-room-3', category: 'livingRoom', path: '/images/interiors/living-room-3-v4.jpg', wallWidthCm: 320, initialX: 50, initialY: 35 },
  { id: 'bedroom-1', category: 'bedroom', path: '/images/interiors/bedroom-1-v4.jpg', wallWidthCm: 320, initialX: 50, initialY: 32 },
  { id: 'bedroom-2', category: 'bedroom', path: '/images/interiors/bedroom-2-v4.jpg', wallWidthCm: 350, initialX: 50, initialY: 33 },
  { id: 'bedroom-3', category: 'bedroom', path: '/images/interiors/bedroom-3-v4.jpg', wallWidthCm: 340, initialX: 50, initialY: 35 },
  { id: 'office-1', category: 'office', path: '/images/interiors/office-1-v7.jpg', wallWidthCm: 380, initialX: 50, initialY: 32 },
  { id: 'office-2', category: 'office', path: '/images/interiors/office-2-v8.jpg', wallWidthCm: 360, initialX: 50, initialY: 42 },
  { id: 'office-3', category: 'office', path: '/images/interiors/office-3-v7.jpg', wallWidthCm: 420, initialX: 50, initialY: 33 },
];

type FrameType = 'noFrame' | 'classic' | 'modern' | 'wood';

const FRAME_TYPES: { id: FrameType; colors: { id: string; hex: string; name: string }[] }[] = [
  { id: 'noFrame', colors: [] },
  { 
    id: 'classic', 
    colors: [
      { id: 'gold', hex: '#B8860B', name: 'Золото' },
      { id: 'silver', hex: '#C0C0C0', name: 'Серебро' },
      { id: 'bronze', hex: '#8B5A2B', name: 'Бронза' },
      { id: 'blackGold', hex: '#1C1C1C', name: 'Черно-золотой' },
    ]
  },
  { 
    id: 'modern', 
    colors: [
      { id: 'black', hex: '#111', name: 'Черный' },
      { id: 'white', hex: '#fff', name: 'Белый' },
      { id: 'gray', hex: '#555', name: 'Серый' },
    ]
  },
  { 
    id: 'wood', 
    colors: [
      { id: 'oak', hex: '#C19A6B', name: 'Дуб' },
      { id: 'walnut', hex: '#3D2B1F', name: 'Орех' },
      { id: 'ash', hex: '#E3DAC9', name: 'Ясень' },
    ]
  },
];

const THICKNESS_OPTIONS = [
  { id: 'slim', cm: 2.0 },
  { id: 'regular', cm: 5.0 },
  { id: 'wide', cm: 10.0 },
];

export default function RoomPreview({ image, title, dictionary, artworkWidth = 60, artworkHeight = 40 }: RoomPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'livingRoom' | 'bedroom' | 'office'>('livingRoom');
  const [selectedInterior, setSelectedInterior] = useState(INTERIORS[0]);
  
  const [frameType, setFrameType] = useState<FrameType>('noFrame');
  const [selectedColor, setSelectedColor] = useState(FRAME_TYPES[1].colors[0]);
  const [thickness, setThickness] = useState(THICKNESS_OPTIONS[1]);
  
  const [isMounted, setIsMounted] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragInfo = useRef({ startX: 0, startY: 0, startPosX: 0, startPosY: 0 });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setPosition({ x: selectedInterior.initialX, y: selectedInterior.initialY });
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, selectedInterior]);

  useEffect(() => {
    const typeDef = FRAME_TYPES.find(t => t.id === frameType);
    if (typeDef && typeDef.colors.length > 0) {
      if (!typeDef.colors.some(c => c.id === selectedColor.id)) {
        setSelectedColor(typeDef.colors[0]);
      }
    }
  }, [frameType]);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragInfo.current = { startX: clientX, startY: clientY, startPosX: position.x, startPosY: position.y };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
      const deltaX = ((clientX - dragInfo.current.startX) / rect.width) * 100;
      const deltaY = ((clientY - dragInfo.current.startY) / rect.height) * 100;
      setPosition({
        x: Math.max(1, Math.min(99, dragInfo.current.startPosX + deltaX)),
        y: Math.max(1, Math.min(99, dragInfo.current.startPosY + deltaY))
      });
    };
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  if (!isMounted) return null;

  const t = dictionary.viewInRoom;
  const wallWidthCm = selectedInterior.wallWidthCm;
  const frameWidthCm = frameType === 'noFrame' ? 0 : thickness.cm;
  const artworkWidthPercent = (artworkWidth / wallWidthCm) * 100;
  const frameWidthPercent = (frameWidthCm / wallWidthCm) * 100;
  const totalWidthPercent = artworkWidthPercent + (frameWidthPercent * 2);

  const renderFrameBG = () => {
    if (frameType === 'noFrame') return null;
    const hex = selectedColor.hex;

    if (frameType === 'classic') {
       return (
         <div 
           className="absolute inset-0 pointer-events-none z-[-1]"
           style={{
             backgroundColor: hex,
             boxShadow: `
                inset 0 0 10px rgba(0,0,0,0.3),
                inset 4px 4px 8px rgba(255,255,255,0.1),
                inset -4px -4px 8px rgba(0,0,0,0.2),
                
                /* Intermediate profiles to simulate baguette volume */
                inset 0 0 0 calc(${thickness.cm * 0.2}cm / 2) rgba(0,0,0,0.1),
                inset 0 0 0 calc(${thickness.cm * 0.4}cm / 2) rgba(255,255,255,0.02),
                
                0 40px 100px rgba(0,0,0,0.5)
             `,
             border: '1px solid rgba(0,0,0,0.1)',
             borderRadius: '2px'
           }}
         />
       );
    }

    if (frameType === 'modern') {
       return (
         <div 
           className="absolute inset-0 pointer-events-none z-[-1]"
           style={{
             backgroundColor: hex,
             boxShadow: `0 20px 50px rgba(0,0,0,0.2)`,
             border: '1px solid rgba(0,0,0,0.05)'
           }}
         />
       );
    }

    if (frameType === 'wood') {
       return (
         <div 
           className="absolute inset-0 pointer-events-none z-[-1]"
           style={{
             backgroundColor: hex,
             boxShadow: `0 25px 60px rgba(0,0,0,0.3), inset 0 0 10px rgba(0,0,0,0.2)`,
             border: '1px solid rgba(0,0,0,0.1)'
           }}
         />
       );
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="mt-6 flex items-center gap-3 rounded-full border border-stone-200 bg-white px-8 py-3.5 text-xs font-bold uppercase tracking-[0.25em] text-stone-600 transition-all hover:bg-stone-800 hover:text-white hover:border-stone-800 shadow-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v14.25A2.25 2.25 0 0 0 3.75 19.5h16.5a2.25 2.25 0 0 0 2.25-2.25V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125Z" />
        </svg>
        {t.button}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-white animate-in fade-in duration-500 overflow-hidden">
          <div className="flex items-center justify-between border-b border-stone-100 px-8 py-5 bg-white">
            <h2 className="font-serif text-xl font-light text-stone-900 uppercase tracking-[0.15em]">{t.title}</h2>
            <button onClick={() => setIsOpen(false)} className="rounded-full p-2 text-stone-400 hover:bg-stone-50 hover:text-stone-900 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex flex-1 flex-col lg:flex-row min-h-0 bg-stone-50">
            <div className="relative flex-1 bg-[#fbfbfb] overflow-hidden flex items-center justify-center p-6 lg:p-14">
               <div ref={containerRef} className="relative w-full h-full max-w-6xl aspect-video rounded-sm overflow-hidden shadow-[0_20px_100px_rgba(0,0,0,0.12)] border border-white select-none bg-stone-100">
                  <Image src={selectedInterior.path} alt="Interior" fill className="object-cover pointer-events-none" priority />
                  
                  <div 
                    onMouseDown={handleMouseDown} onTouchStart={handleMouseDown}
                    className={`absolute transition-transform duration-150 ease-out flex items-center justify-center cursor-grab ${isDragging ? 'cursor-grabbing scale-[1.002]' : ''}`}
                    style={{
                      left: `${position.x}%`,
                      top: `${position.y}%`,
                      width: `${totalWidthPercent}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: 20
                    }}
                  >
                       <div 
                         className="relative w-full h-full flex items-center justify-center overflow-visible"
                         style={{ padding: `${(frameWidthPercent / totalWidthPercent) * 100}%` }}
                       >
                          {renderFrameBG()}

                          <div className={`relative w-full shadow-[inset_0_0_15px_rgba(0,0,0,0.3)] bg-white overflow-hidden`}>
                              <img src={image} alt={title} className="block w-full h-auto pointer-events-none" />
                              <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/10 via-transparent to-black/20 mix-blend-overlay opacity-30" />
                          </div>
                       </div>
                  </div>
               </div>
            </div>

            <div className="w-full border-t border-stone-200 bg-white p-8 lg:w-[450px] lg:border-l lg:border-t-0 flex flex-col overflow-y-auto">
              <div className="space-y-12">
                <div className="space-y-6">
                   <div className="flex gap-1 p-1 bg-stone-50 rounded-2xl border border-stone-100">
                    {(['livingRoom', 'bedroom', 'office'] as const).map(cat => (
                      <button
                        key={cat}
                        onClick={() => {
                          setActiveCategory(cat);
                          setSelectedInterior(INTERIORS.find(i => i.category === cat) || INTERIORS[0]);
                        }}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${
                          activeCategory === cat ? 'bg-white text-stone-900 shadow-sm border border-stone-100' : 'text-stone-400 hover:text-stone-600'
                        }`}
                      >
                        {t.categories[cat]}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {INTERIORS.filter(i => i.category === activeCategory).map((interior) => (
                      <button
                        key={interior.id}
                        onClick={() => setSelectedInterior(interior)}
                        className={`group relative aspect-video overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                          selectedInterior.id === interior.id ? 'border-stone-900 ring-4 ring-stone-900/5 scale-95' : 'border-transparent opacity-40 hover:opacity-100'
                        }`}
                      >
                        <Image src={interior.path} alt={interior.id} fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-stone-100" />

                <div className="space-y-6">
                  <h3 className="text-[11px] uppercase tracking-[0.3em] text-stone-400 font-bold">{t.selectFrame}</h3>
                  <div className="grid grid-cols-4 gap-4">
                    {FRAME_TYPES.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setFrameType(type.id)}
                        className={`flex flex-col items-center gap-3 transition-all group`}
                      >
                        <div 
                          className={`h-14 w-14 rounded-md border-2 p-1.5 transition-all ${frameType === type.id ? 'border-stone-900 ring-4 ring-stone-900/5 scale-105 shadow-sm' : 'border-stone-100 opacity-40 hover:opacity-100'}`}
                        >
                           <div className="w-full h-full relative flex items-center justify-center bg-white shadow-inner rounded-sm overflow-hidden">
                             {type.id === 'noFrame' && (
                               <div className="w-2/3 h-2/3 border border-stone-200" />
                             )}
                             {type.id === 'classic' && (
                               <div className="w-4/5 h-4/5 border-[3px] border-stone-800 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.4),inset_0_0_4px_rgba(0,0,0,0.5)]" />
                             )}
                             {type.id === 'modern' && (
                               <div className="w-4/5 h-4/5 border-[1px] border-stone-800" />
                             )}
                             {type.id === 'wood' && (
                               <div className="w-4/5 h-4/5 border-[2px] border-stone-600 bg-stone-50" />
                             )}
                           </div>
                        </div>
                        <span className={`text-[9px] font-bold uppercase tracking-tight text-center transition-colors ${frameType === type.id ? 'text-stone-900' : 'text-stone-400'}`}>
                          {(t as any)[type.id]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {frameType !== 'noFrame' && (
                  <div className="space-y-6 animate-in slide-in-from-top-4 duration-400">
                    <h3 className="text-[11px] uppercase tracking-[0.3em] text-stone-400 font-bold">Цвет Рамы</h3>
                    <div className="flex flex-wrap gap-5">
                       {FRAME_TYPES.find(t => t.id === frameType)?.colors.map((color) => (
                         <button
                           key={color.id}
                           onClick={() => setSelectedColor(color)}
                           className="flex flex-col items-center gap-2 transition-all"
                         >
                           <div 
                             className={`h-11 w-11 rounded-md border-2 p-0.5 transition-all ${selectedColor.id === color.id ? 'border-stone-900 ring-4 ring-stone-900/5 scale-105' : 'border-stone-100 opacity-60 hover:opacity-100'}`}
                           >
                              <div 
                                className="w-full h-full rounded-sm shadow-inner border border-stone-900/10"
                                style={{ backgroundColor: color.hex }}
                              />
                           </div>
                           <span className={`text-[8px] font-bold uppercase tracking-tighter transition-colors ${selectedColor.id === color.id ? 'text-stone-900' : 'text-stone-500'}`}>
                             {color.name}
                           </span>
                         </button>
                       ))}
                    </div>
                  </div>
                )}

                {frameType !== 'noFrame' && (
                  <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                    <h3 className="text-[11px] uppercase tracking-[0.3em] text-stone-400 font-bold">{t.selectThickness}</h3>
                    <div className="flex gap-1.5 bg-stone-50 p-1.5 rounded-2xl border border-stone-100">
                      {THICKNESS_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setThickness(opt)}
                          className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                            thickness.id === opt.id ? 'bg-stone-900 text-white shadow-lg' : 'text-stone-400 hover:text-stone-600'
                          }`}
                        >
                          {(t.thickness as any)[opt.id]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-auto pt-10 text-center">
                 <div className="text-[10px] text-stone-400 uppercase tracking-[0.4em] font-bold">
                    {artworkWidth} x {artworkHeight} cm
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
