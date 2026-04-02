import React, { useEffect, useRef, useState } from 'react';
import { MASS_PRESETS } from './mass-presets';
import { MorphingMassController } from './morphing-mass-controller';

function MorphingBlob({ 
  controllerRef, 
  isVantablack,
  isJarvis
}: { 
  controllerRef: React.MutableRefObject<MorphingMassController | null>;
  isVantablack: boolean;
  isJarvis: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const controller = new MorphingMassController(containerRef.current, {
      preset: MASS_PRESETS[0]
    });
    controller.setVantablack(isVantablack);
    controller.setJarvis(isJarvis);
    controllerRef.current = controller;

    const handlePointerMove = (event: PointerEvent) => {
      controller.setPointer(event.clientX, event.clientY);
    };

    const handlePointerDown = () => {
      controller.setActive(true);
      controller.setEnergy(0.9);
    };

    const handlePointerUp = () => {
      controller.setEnergy(0.3);
    };

    const handlePointerLeave = () => {
      controller.setActive(false);
      controller.setEnergy(0.18);
    };

    const handleFocus = () => controller.setActive(true);
    const handleBlur = () => controller.setActive(false);

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      controller.destroy();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[600px] flex items-center justify-center"
    />
  );
}

export default function App() {
  const controllerRef = useRef<MorphingMassController | null>(null);
  const [presetIndex, setPresetIndex] = useState(0);
  const [isVantablack, setIsVantablack] = useState(false);
  const [isJarvis, setIsJarvis] = useState(false);

  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.setVantablack(isVantablack);
    }
  }, [isVantablack]);

  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.setJarvis(isJarvis);
    }
  }, [isJarvis]);

  const handleCycleVariant = () => {
    if (!controllerRef.current) return;
    const nextIndex = (presetIndex + 1) % MASS_PRESETS.length;
    setPresetIndex(nextIndex);
    controllerRef.current.setPreset(MASS_PRESETS[nextIndex]);
  };

  const handlePulseMass = () => {
    if (!controllerRef.current) return;
    controllerRef.current.setEnergy(1.0);
    setTimeout(() => {
      if (controllerRef.current) {
        controllerRef.current.setEnergy(0.18);
      }
    }, 200);
  };

  const toggleVantablack = () => {
    setIsVantablack(!isVantablack);
  };

  const toggleJarvis = () => {
    setIsJarvis(!isJarvis);
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* Left Column - Text Content */}
        <div className="flex flex-col justify-center p-12 lg:p-24 z-10 max-w-3xl mx-auto">
          <h1 className="text-5xl lg:text-6xl font-medium tracking-tight mb-8">
            What's Material?
          </h1>
          <p className="text-[17px] text-gray-300 mb-6 leading-relaxed">
            Material Design is a design system built and supported by Google designers and developers. <strong>Material.io</strong> includes in-depth UX guidance and UI component implementations for Android, Flutter, and the Web.
          </p>
          <p className="text-[17px] text-gray-300 mb-12 leading-relaxed">
            The latest version, Material 3, enables personal, adaptive, and expressive experiences – from dynamic color and enhanced accessibility, to foundations for large screen layouts and design tokens. M3 Expressive takes this a step further by adding more flexible components, vibrant styles, and fully integrated motion.
          </p>
          
          <div className="flex flex-wrap gap-4 mb-12">
            <button 
              onClick={handleCycleVariant}
              className="px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-colors"
            >
              Cycle variant
            </button>
            <button 
              onClick={handlePulseMass}
              className="px-6 py-3 border border-white/20 rounded-full font-medium hover:bg-white/10 transition-colors"
            >
              Pulse mass
            </button>
            <button 
              onClick={toggleVantablack}
              className={`px-6 py-3 border rounded-full font-medium transition-colors ${
                isVantablack 
                  ? 'bg-black text-white border-black shadow-[0_0_15px_rgba(0,0,0,0.5)]' 
                  : 'border-white/20 hover:bg-white/10 text-gray-300'
              }`}
            >
              {isVantablack ? 'Vantablack: ON' : 'Vantablack: OFF'}
            </button>
            <button 
              onClick={toggleJarvis}
              className={`px-6 py-3 border rounded-full font-medium transition-colors ${
                isJarvis 
                  ? 'bg-[#00ccff] text-black border-[#00ccff] shadow-[0_0_15px_rgba(0,204,255,0.5)]' 
                  : 'border-white/20 hover:bg-white/10 text-gray-300'
              }`}
            >
              {isJarvis ? 'Quad/Oil: ON' : 'Quad/Oil: OFF'}
            </button>
          </div>

          <dl className="grid grid-cols-3 gap-8 mb-12 border-t border-white/10 pt-8">
            <div>
              <dt className="text-sm text-gray-500 mb-1">Preset</dt>
              <dd className="font-medium text-gray-300">{MASS_PRESETS[presetIndex].name}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 mb-1">Family</dt>
              <dd className="font-medium text-gray-300 capitalize">Ferrofluid / Sludge</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 mb-1">Motion</dt>
              <dd className="font-medium text-gray-300">magnetic pull + fluid noise</dd>
            </div>
          </dl>

          <div className="space-y-4 mb-8">
            <div className="bg-[#1e1e1e] p-6 rounded-3xl flex items-center justify-between cursor-pointer hover:bg-[#2a2a2a] transition-colors border border-white/5">
              <div>
                <span className="text-xl font-medium block mb-1">UX foundations</span>
                <span className="text-sm text-gray-400">Foundations like color, type, and shape are customizable systems in Material</span>
              </div>
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center shrink-0 ml-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
              </div>
            </div>
            <div className="bg-[#1e1e1e] p-6 rounded-3xl flex items-center justify-between cursor-pointer hover:bg-[#2a2a2a] transition-colors border border-white/5">
              <div>
                <span className="text-xl font-medium block mb-1">Open-source code</span>
                <span className="text-sm text-gray-400">Multi-platform code to build beautiful products, faster</span>
              </div>
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center shrink-0 ml-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
              </div>
            </div>
            <div className="bg-[#1e1e1e] p-6 rounded-3xl flex items-center justify-between cursor-pointer hover:bg-[#2a2a2a] transition-colors border border-white/5">
              <div>
                <span className="text-xl font-medium block mb-1">Tutorials, case studies & news</span>
                <span className="text-sm text-gray-400">Follow Material's blog for updates, deep dives, and more</span>
              </div>
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center shrink-0 ml-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - The Blob */}
        <div 
          className="relative flex items-center justify-center overflow-hidden rounded-l-[40px] my-4 mr-4 min-w-0 min-h-0 transition-colors duration-500"
          style={{ backgroundColor: MASS_PRESETS[presetIndex].backgroundColor }}
        >
          <MorphingBlob controllerRef={controllerRef} isVantablack={isVantablack} />
        </div>
      </div>
    </div>
  );
}
