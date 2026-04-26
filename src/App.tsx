import React, { useEffect, useRef, useState } from 'react';
import { MASS_PRESETS } from './mass-presets';
import { MASS_PRESETS as OLD_MASS_PRESETS } from './old-mass-presets';
import { MorphingMassController } from './morphing-mass-controller';
import { MorphingMassController as OldMorphingMassController } from './old-morphing-mass-controller';
import { GimbalMassController } from './gimbal-mass-controller';
import { HistoricMassController } from './historic-mass-controller';
import { MusicMassController } from './music-mass-controller';
import { AdvancedAudioMassController } from './advanced-audio-mass-controller';
import { Card7Controller } from './card7-controller';
import { Card8Controller } from './card8-controller';
import { Card9Controller } from './card9-controller';
import { Card10Controller } from './card10-controller';
import { Card11Controller } from './card11-controller';
import { Card12Controller } from './card12-controller';
import { Card13Controller } from './card13-controller';
import { Card14Controller } from './card14-controller';
import { Card15Controller } from './card15-controller';
import { Card16Controller } from './card16-controller';
import { Card17Controller } from './card17-controller';
import { Card18Controller } from './card18-controller';
import { Card19Controller } from './card19-controller';
import { Card20Controller } from './card20-controller';
import { Card21Controller } from './card21-controller';
import { Card22Controller } from './card22-controller';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
          controller.resetPointer();
    };

    const handleFocus = () => controller.setActive(true);
    const handleBlur = () => controller.setActive(false);

    containerRef.current.addEventListener('pointermove', handlePointerMove);
    containerRef.current.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    containerRef.current.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      containerRef.current?.removeEventListener('pointermove', handlePointerMove);
      containerRef.current?.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      containerRef.current?.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      controller.destroy();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[400px] flex items-center justify-center"
    />
  );
}

function OldMorphingBlob({ 
  controllerRef, 
  isVantablack,
  isJarvis
}: { 
  controllerRef: React.MutableRefObject<any>;
  isVantablack: boolean;
  isJarvis: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const controller = new OldMorphingMassController(containerRef.current, {
      preset: OLD_MASS_PRESETS[0]
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
          controller.resetPointer();
    };

    const handleFocus = () => controller.setActive(true);
    const handleBlur = () => controller.setActive(false);

    containerRef.current.addEventListener('pointermove', handlePointerMove);
    containerRef.current.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    containerRef.current.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      containerRef.current?.removeEventListener('pointermove', handlePointerMove);
      containerRef.current?.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      containerRef.current?.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      controller.destroy();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[400px] flex items-center justify-center"
    />
  );
}

function Card7Blob({
  controllerRef,
  isVantablack,
  isJarvis
}: {
  controllerRef: React.MutableRefObject<any>;
  isVantablack: boolean;
  isJarvis: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const controller = new Card7Controller(containerRef.current, {
      preset: OLD_MASS_PRESETS[0]
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
          controller.resetPointer();
    };

    const handleFocus = () => controller.setActive(true);
    const handleBlur = () => controller.setActive(false);

    containerRef.current.addEventListener('pointermove', handlePointerMove);
    containerRef.current.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    containerRef.current.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      containerRef.current?.removeEventListener('pointermove', handlePointerMove);
      containerRef.current?.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      containerRef.current?.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      controller.destroy();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[400px] flex items-center justify-center"
    />
  );
}

function Card8Blob({
  controllerRef,
  isVantablack,
  isJarvis
}: {
  controllerRef: React.MutableRefObject<any>;
  isVantablack: boolean;
  isJarvis: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const controller = new Card8Controller(containerRef.current, {
      preset: OLD_MASS_PRESETS[0]
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
      controller.resetPointer();
    };

    const handleFocus = () => controller.setActive(true);
    const handleBlur = () => controller.setActive(false);

    containerRef.current.addEventListener('pointermove', handlePointerMove);
    containerRef.current.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    containerRef.current.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      containerRef.current?.removeEventListener('pointermove', handlePointerMove);
      containerRef.current?.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      containerRef.current?.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      controller.destroy();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[400px] flex items-center justify-center"
    />
  );
}

function Card9Blob({
  controllerRef,
  isVantablack,
  isJarvis
}: {
  controllerRef: React.MutableRefObject<any>;
  isVantablack: boolean;
  isJarvis: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const controller = new Card9Controller(containerRef.current, {
      preset: OLD_MASS_PRESETS[0]
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
      controller.resetPointer();
    };

    const handleFocus = () => controller.setActive(true);
    const handleBlur = () => controller.setActive(false);

    containerRef.current.addEventListener('pointermove', handlePointerMove);
    containerRef.current.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    containerRef.current.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      containerRef.current?.removeEventListener('pointermove', handlePointerMove);
      containerRef.current?.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      containerRef.current?.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      controller.destroy();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[400px] flex items-center justify-center"
    />
  );
}

function Card10Blob({
  controllerRef,
  isVantablack,
  isJarvis
}: {
  controllerRef: React.MutableRefObject<any>;
  isVantablack: boolean;
  isJarvis: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const controller = new Card10Controller(containerRef.current, {
      preset: OLD_MASS_PRESETS[0]
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
      controller.resetPointer();
    };

    const handleFocus = () => controller.setActive(true);
    const handleBlur = () => controller.setActive(false);

    containerRef.current.addEventListener('pointermove', handlePointerMove);
    containerRef.current.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    containerRef.current.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      containerRef.current?.removeEventListener('pointermove', handlePointerMove);
      containerRef.current?.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      containerRef.current?.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      controller.destroy();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[400px] flex items-center justify-center"
    />
  );
}

function GimbalMorphingBlob({
  controllerRef, 
  isVantablack,
  isJarvis,
  gimbalSpeed
}: { 
  controllerRef: React.MutableRefObject<any>;
  isVantablack: boolean;
  isJarvis: boolean;
  gimbalSpeed: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const controller = new GimbalMassController(containerRef.current, {
      preset: OLD_MASS_PRESETS[0]
    });
    controller.setVantablack(isVantablack);
    controller.setJarvis(isJarvis);
    if (controller.setGimbalSpeed) controller.setGimbalSpeed(gimbalSpeed);
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
          controller.resetPointer();
    };

    const handleFocus = () => controller.setActive(true);
    const handleBlur = () => controller.setActive(false);

    containerRef.current.addEventListener('pointermove', handlePointerMove);
    containerRef.current.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    containerRef.current.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      containerRef.current?.removeEventListener('pointermove', handlePointerMove);
      containerRef.current?.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      containerRef.current?.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      controller.destroy();
    };
  }, []);

  useEffect(() => {
    if (controllerRef.current && controllerRef.current.setGimbalSpeed) {
      controllerRef.current.setGimbalSpeed(gimbalSpeed);
    }
  }, [gimbalSpeed]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[400px] flex items-center justify-center"
    />
  );
}

function HistoricMorphingBlob({ 
  controllerRef, 
  isVantablack,
  isJarvis
}: { 
  controllerRef: React.MutableRefObject<any>;
  isVantablack: boolean;
  isJarvis: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const controller = new HistoricMassController(containerRef.current, {
      preset: OLD_MASS_PRESETS[0]
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
          controller.resetPointer();
    };

    const handleFocus = () => controller.setActive(true);
    const handleBlur = () => controller.setActive(false);

    containerRef.current.addEventListener('pointermove', handlePointerMove);
    containerRef.current.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    containerRef.current.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      containerRef.current?.removeEventListener('pointermove', handlePointerMove);
      containerRef.current?.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      containerRef.current?.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      controller.destroy();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[400px] flex items-center justify-center"
    />
  );
}

function MusicMorphingBlob({ 
  controllerRef, 
  isVantablack,
  isJarvis
}: { 
  controllerRef: React.MutableRefObject<any>;
  isVantablack: boolean;
  isJarvis: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const controller = new MusicMassController(containerRef.current, {
      preset: OLD_MASS_PRESETS[0]
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
          controller.resetPointer();
    };

    const handleFocus = () => controller.setActive(true);
    const handleBlur = () => controller.setActive(false);

    containerRef.current.addEventListener('pointermove', handlePointerMove);
    containerRef.current.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    containerRef.current.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      containerRef.current?.removeEventListener('pointermove', handlePointerMove);
      containerRef.current?.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      containerRef.current?.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      controller.destroy();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[400px] flex items-center justify-center"
    />
  );
}

function AdvancedAudioMorphingBlob({ 
  controllerRef, 
  isVantablack,
  isJarvis
}: { 
  controllerRef: React.MutableRefObject<any>;
  isVantablack: boolean;
  isJarvis: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [debugData, setDebugData] = useState({ kick: 0, snare: 0, custom: 0, intensity: 0 });
  const [toggles, setToggles] = useState({ kick: false, snare: false, custom: true, intensity: true });

  useEffect(() => {
    if (!containerRef.current) return;

    const controller = new AdvancedAudioMassController(containerRef.current, {
      preset: OLD_MASS_PRESETS[0]
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
          controller.resetPointer();
    };

    const handleFocus = () => controller.setActive(true);
    const handleBlur = () => controller.setActive(false);

    containerRef.current.addEventListener('pointermove', handlePointerMove);
    containerRef.current.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    containerRef.current.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    let frame: number;
    const updateDebug = () => {
      if (controllerRef.current) {
        setDebugData({
          kick: controllerRef.current.kick || 0,
          snare: controllerRef.current.snare || 0,
          custom: controllerRef.current.custom || 0,
          intensity: controllerRef.current.intensity || 0,
        });
      }
      frame = requestAnimationFrame(updateDebug);
    };
    updateDebug();

    return () => {
      containerRef.current?.removeEventListener('pointermove', handlePointerMove);
      containerRef.current?.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      containerRef.current?.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      cancelAnimationFrame(frame);
      controller.destroy();
    };
  }, []);

  const toggleFeature = (feature: 'kick' | 'snare' | 'custom' | 'intensity') => {
    setToggles(prev => {
      const next = { ...prev, [feature]: !prev[feature] };
      if (controllerRef.current) {
        if (feature === 'kick') controllerRef.current.enableKick = next.kick;
        if (feature === 'snare') controllerRef.current.enableSnare = next.snare;
        if (feature === 'custom') controllerRef.current.enableCustom = next.custom;
        if (feature === 'intensity') controllerRef.current.enableIntensity = next.intensity;
      }
      return next;
    });
  };

  return (
    <div className="relative w-full h-full">
      <div 
        ref={containerRef} 
        className="w-full h-full min-h-[400px] flex items-center justify-center"
      />
      
      {/* Debug UI Overlay */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md p-4 rounded-xl border border-white/10 flex flex-col gap-3 z-10 w-48">
        <div className="text-xs font-bold text-white/50 uppercase tracking-wider mb-1">DSP Debug</div>
        
        {/* Kick */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={toggles.kick} 
                onChange={() => toggleFeature('kick')}
                className="accent-white"
              />
              <span className={toggles.kick ? "text-white" : "text-white/50"}>Kick</span>
            </label>
            <span className="text-white/50 font-mono">{(debugData.kick * 100).toFixed(0)}</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-white transition-all duration-75" style={{ width: `${debugData.kick * 100}%` }} />
          </div>
        </div>

        {/* Snare */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={toggles.snare} 
                onChange={() => toggleFeature('snare')}
                className="accent-white"
              />
              <span className={toggles.snare ? "text-white" : "text-white/50"}>Snare</span>
            </label>
            <span className="text-white/50 font-mono">{(debugData.snare * 100).toFixed(0)}</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-white transition-all duration-75" style={{ width: `${debugData.snare * 100}%` }} />
          </div>
        </div>

        {/* Custom */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={toggles.custom} 
                onChange={() => toggleFeature('custom')}
                className="accent-white"
              />
              <span className={toggles.custom ? "text-white" : "text-white/50"}>Custom / Onset</span>
            </label>
            <span className="text-white/50 font-mono">{(debugData.custom * 100).toFixed(0)}</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-white transition-all duration-75" style={{ width: `${debugData.custom * 100}%` }} />
          </div>
        </div>

        {/* Intensity */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={toggles.intensity} 
                onChange={() => toggleFeature('intensity')}
                className="accent-white"
              />
              <span className={toggles.intensity ? "text-white" : "text-white/50"}>Intensity Curve</span>
            </label>
            <span className="text-white/50 font-mono">{(debugData.intensity * 100).toFixed(0)}</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-white transition-all duration-75" style={{ width: `${debugData.intensity * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Card11Blob({
  controllerRef,
  isVantablack,
  isJarvis
}: {
  controllerRef: React.MutableRefObject<any>;
  isVantablack: boolean;
  isJarvis: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const controller = new Card11Controller(containerRef.current, {
      preset: OLD_MASS_PRESETS[0]
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
      controller.resetPointer();
    };

    const handleFocus = () => controller.setActive(true);
    const handleBlur = () => controller.setActive(false);

    containerRef.current.addEventListener('pointermove', handlePointerMove);
    containerRef.current.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    containerRef.current.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      containerRef.current?.removeEventListener('pointermove', handlePointerMove);
      containerRef.current?.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      containerRef.current?.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      controller.destroy();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[400px] flex items-center justify-center"
    />
  );
}

function Card12Blob({
  controllerRef,
  isVantablack,
  isJarvis
}: {
  controllerRef: React.MutableRefObject<any>;
  isVantablack: boolean;
  isJarvis: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const controller = new Card12Controller(containerRef.current, {
      preset: OLD_MASS_PRESETS[0]
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
      controller.resetPointer();
    };

    const handleFocus = () => controller.setActive(true);
    const handleBlur = () => controller.setActive(false);

    containerRef.current.addEventListener('pointermove', handlePointerMove);
    containerRef.current.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    containerRef.current.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      containerRef.current?.removeEventListener('pointermove', handlePointerMove);
      containerRef.current?.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      containerRef.current?.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      controller.destroy();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[400px] flex items-center justify-center"
    />
  );
}

function Card13Blob({
  controllerRef,
  isVantablack,
  isJarvis
}: {
  controllerRef: React.MutableRefObject<any>;
  isVantablack: boolean;
  isJarvis: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const controller = new Card13Controller(containerRef.current, {
      preset: OLD_MASS_PRESETS[0]
    });
    controller.setVantablack(isVantablack);
    controller.setJarvis(isJarvis);
    controllerRef.current = controller;

    const handlePointerMove = (event: PointerEvent) => {
      controller.setPointer(event.clientX, event.clientY);
    };
    const handlePointerDown = () => { controller.setActive(true); controller.setEnergy(0.9); };
    const handlePointerUp = () => { controller.setEnergy(0.3); };
    const handlePointerLeave = () => { controller.setActive(false); controller.setEnergy(0.18); controller.resetPointer(); };
    const handleFocus = () => controller.setActive(true);
    const handleBlur = () => controller.setActive(false);

    containerRef.current.addEventListener('pointermove', handlePointerMove);
    containerRef.current.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    containerRef.current.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      containerRef.current?.removeEventListener('pointermove', handlePointerMove);
      containerRef.current?.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      containerRef.current?.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      controller.destroy();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full min-h-[400px] flex items-center justify-center" />;
}

function Card14Blob({
  controllerRef,
  isVantablack,
  isJarvis
}: {
  controllerRef: React.MutableRefObject<any>;
  isVantablack: boolean;
  isJarvis: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const controller = new Card14Controller(containerRef.current, {
      preset: OLD_MASS_PRESETS[0]
    });
    controller.setVantablack(isVantablack);
    controller.setJarvis(isJarvis);
    controllerRef.current = controller;

    const handlePointerMove = (event: PointerEvent) => {
      controller.setPointer(event.clientX, event.clientY);
    };
    const handlePointerDown = () => { controller.setActive(true); controller.setEnergy(0.9); };
    const handlePointerUp = () => { controller.setEnergy(0.3); };
    const handlePointerLeave = () => { controller.setActive(false); controller.setEnergy(0.18); controller.resetPointer(); };
    const handleFocus = () => controller.setActive(true);
    const handleBlur = () => controller.setActive(false);

    containerRef.current.addEventListener('pointermove', handlePointerMove);
    containerRef.current.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    containerRef.current.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      containerRef.current?.removeEventListener('pointermove', handlePointerMove);
      containerRef.current?.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      containerRef.current?.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      controller.destroy();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full min-h-[400px] flex items-center justify-center" />;
}

function Card15Blob({
  controllerRef,
  isVantablack,
  isJarvis
}: {
  controllerRef: React.MutableRefObject<any>;
  isVantablack: boolean;
  isJarvis: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const controller = new Card15Controller(containerRef.current, {
      preset: OLD_MASS_PRESETS[0]
    });
    controller.setVantablack(isVantablack);
    controller.setJarvis(isJarvis);
    controllerRef.current = controller;

    const handlePointerMove = (event: PointerEvent) => {
      controller.setPointer(event.clientX, event.clientY);
    };
    const handlePointerDown = () => { controller.setActive(true); controller.setEnergy(0.9); };
    const handlePointerUp = () => { controller.setEnergy(0.3); };
    const handlePointerLeave = () => { controller.setActive(false); controller.setEnergy(0.18); controller.resetPointer(); };
    const handleFocus = () => controller.setActive(true);
    const handleBlur = () => controller.setActive(false);

    containerRef.current.addEventListener('pointermove', handlePointerMove);
    containerRef.current.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    containerRef.current.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      containerRef.current?.removeEventListener('pointermove', handlePointerMove);
      containerRef.current?.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      containerRef.current?.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      controller.destroy();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full min-h-[400px] flex items-center justify-center" />;
}

function Card16Blob({
  controllerRef,
  isVantablack,
  isJarvis
}: {
  controllerRef: React.MutableRefObject<any>;
  isVantablack: boolean;
  isJarvis: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const controller = new Card16Controller(containerRef.current, {
      preset: OLD_MASS_PRESETS[0]
    });
    controller.setVantablack(isVantablack);
    controller.setJarvis(isJarvis);
    controllerRef.current = controller;

    const handlePointerMove = (event: PointerEvent) => {
      controller.setPointer(event.clientX, event.clientY);
    };
    const handlePointerDown = () => { controller.setActive(true); controller.setEnergy(0.9); };
    const handlePointerUp = () => { controller.setEnergy(0.3); };
    const handlePointerLeave = () => { controller.setActive(false); controller.setEnergy(0.18); controller.resetPointer(); };
    const handleFocus = () => controller.setActive(true);
    const handleBlur = () => controller.setActive(false);

    containerRef.current.addEventListener('pointermove', handlePointerMove);
    containerRef.current.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    containerRef.current.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      containerRef.current?.removeEventListener('pointermove', handlePointerMove);
      containerRef.current?.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      containerRef.current?.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      controller.destroy();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full min-h-[400px] flex items-center justify-center" />;
}

function makeCardBlob(ControllerClass: any) {
  return function CardBlob({
    controllerRef,
    isVantablack,
    isJarvis
  }: {
    controllerRef: React.MutableRefObject<any>;
    isVantablack: boolean;
    isJarvis: boolean;
  }) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!containerRef.current) return;

      const controller = new ControllerClass(containerRef.current, {
        preset: OLD_MASS_PRESETS[0]
      });
      controller.setVantablack(isVantablack);
      controller.setJarvis(isJarvis);
      controllerRef.current = controller;

      const handlePointerMove = (event: PointerEvent) => {
        controller.setPointer(event.clientX, event.clientY);
      };
      const handlePointerDown = () => { controller.setActive(true); controller.setEnergy(0.9); };
      const handlePointerUp = () => { controller.setEnergy(0.3); };
      const handlePointerLeave = () => { controller.setActive(false); controller.setEnergy(0.18); controller.resetPointer(); };
      const handleFocus = () => controller.setActive(true);
      const handleBlur = () => controller.setActive(false);

      containerRef.current.addEventListener('pointermove', handlePointerMove);
      containerRef.current.addEventListener('pointerdown', handlePointerDown);
      window.addEventListener('pointerup', handlePointerUp);
      containerRef.current.addEventListener('pointerleave', handlePointerLeave);
      window.addEventListener('focus', handleFocus);
      window.addEventListener('blur', handleBlur);

      return () => {
        containerRef.current?.removeEventListener('pointermove', handlePointerMove);
        containerRef.current?.removeEventListener('pointerdown', handlePointerDown);
        window.removeEventListener('pointerup', handlePointerUp);
        containerRef.current?.removeEventListener('pointerleave', handlePointerLeave);
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('blur', handleBlur);
        controller.destroy();
      };
    }, []);

    return <div ref={containerRef} className="w-full h-full min-h-[400px] flex items-center justify-center" />;
  };
}

const Card17Blob = makeCardBlob(Card17Controller);
const Card18Blob = makeCardBlob(Card18Controller);
const Card19Blob = makeCardBlob(Card19Controller);
const Card20Blob = makeCardBlob(Card20Controller);
const Card21Blob = makeCardBlob(Card21Controller);
const Card22Blob = makeCardBlob(Card22Controller);

export default function App() {
  const controllerRef = useRef<any>(null);
  const [presetIndex, setPresetIndex] = useState(0);
  const [isVantablack, setIsVantablack] = useState(false);
  const [isJarvis, setIsJarvis] = useState(false);
  const [gimbalSpeed, setGimbalSpeed] = useState(1.0);
  const [useTimeline, setUseTimeline] = useState(false);
  
  // ─── Visible carousel (16 audio cards) ───
  // cardIndex 0–5 are kept in the codebase but hidden from the carousel
  // (legacy / debug). Visible cycle starts at cardIndex 6 (zoogaze).
  // Each visible card maps to a URL hash slug for shareable links.
  const VISIBLE_START = 6;
  const SF = 'Snare Flux';        // dual-band flux + notKick gate
  const ER = 'Event Reactive';    // event flux + squiggle / split
  const FD = 'Ferrofluid Direct'; // audio → shader uniforms
  const SF_M = 'dual-band flux + notKick gate';
  const ER_M = 'event flux + squiggle / split';
  const FD_M = 'audio → shader uniforms';
  const VISIBLE_CARDS = [
    { slug: 'zoogaze',    title: 'zoogaze',    family: SF, motion: SF_M, Blob: Card7Blob  },
    { slug: 'foyou',      title: 'foyou',      family: SF, motion: SF_M, Blob: Card13Blob },
    { slug: 'threed',     title: 'threed',     family: FD, motion: FD_M, Blob: Card18Blob },
    { slug: 'softtouch',  title: 'softtouch',  family: FD, motion: FD_M, Blob: Card12Blob },
    { slug: 'charcoal',   title: 'charcoal',   family: FD, motion: FD_M, Blob: Card9Blob  },
    { slug: 'knees',      title: 'knees',      family: ER, motion: ER_M, Blob: Card8Blob  },
    { slug: 'echoplxjm',  title: 'echoplxjm',  family: SF, motion: SF_M, Blob: Card10Blob },
    { slug: 'gotsumthin', title: 'gotsumthin', family: ER, motion: ER_M, Blob: Card11Blob },
    { slug: 'ca',         title: 'ca',         family: ER, motion: ER_M, Blob: Card14Blob },
    { slug: 'elevated',   title: 'elevated',   family: FD, motion: FD_M, Blob: Card15Blob },
    { slug: 'echoplxjm2', title: 'echoplxjm2', family: SF, motion: SF_M, Blob: Card16Blob },
    { slug: 'dq2',        title: 'dq2',        family: ER, motion: ER_M, Blob: Card17Blob },
    { slug: 'elevated2',  title: 'elevated2',  family: SF, motion: SF_M, Blob: Card19Blob },
    { slug: 'untitled5',  title: 'untitled5',  family: ER, motion: ER_M, Blob: Card20Blob },
    { slug: 'mashup24',   title: 'mashup24',   family: FD, motion: FD_M, Blob: Card21Blob },
    { slug: 'mirror',     title: 'mirror',     family: SF, motion: SF_M, Blob: Card22Blob },
  ];
  const VISIBLE_END = VISIBLE_START + VISIBLE_CARDS.length - 1;
  const TOTAL_CARDS = VISIBLE_START + VISIBLE_CARDS.length;

  // Initial card from URL hash, falling back to zoogaze (the cycle start).
  const [cardIndex, setCardIndex] = useState(() => {
    if (typeof window === 'undefined') return VISIBLE_START;
    const slug = window.location.hash.replace('#', '');
    const i = VISIBLE_CARDS.findIndex(c => c.slug === slug);
    return i >= 0 ? VISIBLE_START + i : VISIBLE_START;
  });

  // Sync URL hash whenever cardIndex changes (no page reload).
  useEffect(() => {
    if (cardIndex < VISIBLE_START) return;
    const slug = VISIBLE_CARDS[cardIndex - VISIBLE_START]?.slug;
    if (slug && typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${slug}`);
    }
  }, [cardIndex]);

  // Honor back/forward & manual hash edits.
  useEffect(() => {
    const onHashChange = () => {
      const slug = window.location.hash.replace('#', '');
      const i = VISIBLE_CARDS.findIndex(c => c.slug === slug);
      if (i >= 0) setCardIndex(VISIBLE_START + i);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const currentCard = cardIndex >= VISIBLE_START ? VISIBLE_CARDS[cardIndex - VISIBLE_START] : null;

  const copyShareLink = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href).catch(() => {});
  };

  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.setVantablack(isVantablack);
    }
  }, [isVantablack]);

  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.setJarvis(isJarvis);
    }
    if (isJarvis) {
      const audio = new Audio('/quaddamage.wav');
      audio.volume = 0.5;
      audio.play().catch(e => console.error("Audio play failed:", e));
    }
  }, [isJarvis]);

  useEffect(() => {
    if (controllerRef.current && controllerRef.current.useTimeline !== undefined) {
      controllerRef.current.useTimeline = useTimeline;
    }
  }, [useTimeline]);

  // Arrow nav cycles within the visible range only (skips hidden cards 0–5).
  const cycleNext = (prev: number) => {
    if (prev < VISIBLE_START || prev >= VISIBLE_END) return VISIBLE_START;
    return prev + 1;
  };
  const cyclePrev = (prev: number) => {
    if (prev <= VISIBLE_START || prev > VISIBLE_END) return VISIBLE_END;
    return prev - 1;
  };
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setCardIndex(cycleNext);
      if (e.key === 'ArrowLeft') setCardIndex(cyclePrev);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const nextCard = () => setCardIndex(cycleNext);
  const prevCard = () => setCardIndex(cyclePrev);

  const handleCycleVariant = () => {
    if (!controllerRef.current) return;
    const currentPresets = cardIndex === 0 ? MASS_PRESETS : OLD_MASS_PRESETS;
    const nextIndex = (presetIndex + 1) % currentPresets.length;
    setPresetIndex(nextIndex);
    controllerRef.current.setPreset(currentPresets[nextIndex]);
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
    <div className="min-h-screen bg-[#111111] text-white font-sans flex flex-col items-center justify-center p-8 overflow-hidden">
      <div className="w-full max-w-4xl flex flex-col gap-8 relative">

        <div className="text-center text-sm tracking-wide">
          <span className="text-gray-300">Cameron Brooks</span>
          <span className="text-gray-600"> · </span>
          <a href="mailto:ca.br@me.com" className="text-gray-400 hover:text-gray-200 transition-colors">ca.br@me.com</a>
        </div>

        {/* Carousel Container */}
        <div className="relative w-full flex items-center justify-center">
          <button 
            onClick={prevCard} 
            className="absolute left-[-1rem] md:left-[-4rem] z-10 p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronLeft size={32} />
          </button>

          {/* The Blob Card */}
          <div 
            className="relative w-full aspect-square md:aspect-video flex items-center justify-center overflow-hidden rounded-[40px] transition-colors duration-500 shadow-2xl border border-white/10"
            style={{ backgroundColor: cardIndex === 0 ? MASS_PRESETS[presetIndex % MASS_PRESETS.length].backgroundColor : OLD_MASS_PRESETS[presetIndex % OLD_MASS_PRESETS.length].backgroundColor }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={cardIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {currentCard ? (
                  <currentCard.Blob controllerRef={controllerRef} isVantablack={isVantablack} isJarvis={isJarvis} />
                ) : cardIndex === 0 ? (
                  <MorphingBlob controllerRef={controllerRef} isVantablack={isVantablack} isJarvis={isJarvis} />
                ) : cardIndex === 2 ? (
                  <GimbalMorphingBlob controllerRef={controllerRef} isVantablack={isVantablack} isJarvis={isJarvis} gimbalSpeed={gimbalSpeed} />
                ) : cardIndex === 3 ? (
                  <HistoricMorphingBlob controllerRef={controllerRef} isVantablack={isVantablack} isJarvis={isJarvis} />
                ) : cardIndex === 4 ? (
                  <MusicMorphingBlob controllerRef={controllerRef} isVantablack={isVantablack} isJarvis={isJarvis} />
                ) : cardIndex === 5 ? (
                  <AdvancedAudioMorphingBlob controllerRef={controllerRef} isVantablack={isVantablack} isJarvis={isJarvis} />
                ) : (
                  <OldMorphingBlob controllerRef={controllerRef} isVantablack={isVantablack} isJarvis={isJarvis} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <button 
            onClick={nextCard} 
            className="absolute right-[-1rem] md:right-[-4rem] z-10 p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronRight size={32} />
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-wrap justify-center gap-4">
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
            
            {cardIndex === 5 && (
              <button 
                onClick={() => setUseTimeline(!useTimeline)}
                className={`px-6 py-3 border rounded-full font-medium transition-colors ${
                  useTimeline 
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.5)]' 
                    : 'border-white/20 hover:bg-white/10 text-gray-300'
                }`}
              >
                {useTimeline ? 'Mode: Timeline' : 'Mode: Live DSP'}
              </button>
            )}

            {currentCard && (
              <button
                onClick={() => {
                  if (controllerRef.current && controllerRef.current.enableAudio) {
                    controllerRef.current.enableAudio();
                  }
                }}
                className="px-6 py-3 bg-fuchsia-600 text-white border border-fuchsia-500 rounded-full font-medium hover:bg-fuchsia-500 transition-colors shadow-[0_0_15px_rgba(192,38,211,0.5)] flex items-center gap-2"
              >
                <Play size={18} />
                Play {currentCard.title}
              </button>
            )}
            {currentCard && (
              <button
                onClick={copyShareLink}
                className="px-6 py-3 border border-white/20 rounded-full font-medium hover:bg-white/10 transition-colors text-gray-300"
                title="Copy link to this track"
              >
                Copy link
              </button>
            )}
          </div>

          <div className={`w-full max-w-xs mx-auto mt-2 transition-opacity duration-300 ${cardIndex >= VISIBLE_START || cardIndex === 2 ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
            <div className="flex justify-between text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">
              <span>Gimbal Speed</span>
              <span>{gimbalSpeed.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="4.0"
              step="0.1"
              value={gimbalSpeed}
              onChange={(e) => setGimbalSpeed(parseFloat(e.target.value))}
              disabled={cardIndex < VISIBLE_START && cardIndex !== 2}
              className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>

          {currentCard && (
            <dl className="flex gap-8 text-center">
              <div>
                <dt className="text-sm text-gray-500 mb-1">Track</dt>
                <dd className="font-medium text-gray-300">{currentCard.title}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 mb-1">Family</dt>
                <dd className="font-medium text-gray-300">{currentCard.family}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 mb-1">Motion</dt>
                <dd className="font-medium text-gray-300">{currentCard.motion}</dd>
              </div>
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}
