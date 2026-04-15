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
import { Card23Controller } from './card23-controller';
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
const Card23Blob = makeCardBlob(Card23Controller);

export default function App() {
  const controllerRef = useRef<any>(null);
  const [presetIndex, setPresetIndex] = useState(0);
  const [isVantablack, setIsVantablack] = useState(false);
  const [isJarvis, setIsJarvis] = useState(false);
  const [gimbalSpeed, setGimbalSpeed] = useState(1.0);
  const [useTimeline, setUseTimeline] = useState(false);
  
  const [cardIndex, setCardIndex] = useState(0);
  const TOTAL_CARDS = 23;

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setCardIndex((prev) => (prev + 1) % TOTAL_CARDS);
      if (e.key === 'ArrowLeft') setCardIndex((prev) => (prev - 1 + TOTAL_CARDS) % TOTAL_CARDS);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const nextCard = () => setCardIndex((prev) => (prev + 1) % TOTAL_CARDS);
  const prevCard = () => setCardIndex((prev) => (prev - 1 + TOTAL_CARDS) % TOTAL_CARDS);

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
                {cardIndex === 0 ? (
                  <MorphingBlob controllerRef={controllerRef} isVantablack={isVantablack} isJarvis={isJarvis} />
                ) : cardIndex === 2 ? (
                  <GimbalMorphingBlob controllerRef={controllerRef} isVantablack={isVantablack} isJarvis={isJarvis} gimbalSpeed={gimbalSpeed} />
                ) : cardIndex === 3 ? (
                  <HistoricMorphingBlob controllerRef={controllerRef} isVantablack={isVantablack} isJarvis={isJarvis} />
                ) : cardIndex === 4 ? (
                  <MusicMorphingBlob controllerRef={controllerRef} isVantablack={isVantablack} isJarvis={isJarvis} />
                ) : cardIndex === 5 ? (
                  <AdvancedAudioMorphingBlob controllerRef={controllerRef} isVantablack={isVantablack} isJarvis={isJarvis} />
                ) : cardIndex === 6 ? (
                  <Card7Blob controllerRef={controllerRef} isVantablack={isVantablack} isJarvis={isJarvis} />
                ) : cardIndex === 7 ? (
                  <Card8Blob controllerRef={controllerRef} isVantablack={isVantablack} isJarvis={isJarvis} />
                ) : cardIndex === 8 ? (
                  <Card9Blob controllerRef={controllerRef} isVantablack={isVantablack} isJarvis={isJarvis} />
                ) : cardIndex === 9 ? (
                  <Card10Blob controllerRef={controllerRef} isVantablack={isVantablack} isJarvis={isJarvis} />
                ) : cardIndex === 10 ? (
                  <Card11Blob controllerRef={controllerRef} isVantablack={isVantablack} isJarvis={isJarvis} />
                ) : cardIndex === 11 ? (
                  <Card12Blob controllerRef={controllerRef} isVantablack={isVantablack} isJarvis={isJarvis} />
                ) : cardIndex === 12 ? (
                  <Card13Blob controllerRef={controllerRef} isVantablack={isVantablack} isJarvis={isJarvis} />
                ) : cardIndex === 13 ? (
                  <Card14Blob controllerRef={controllerRef} isVantablack={isVantablack} isJarvis={isJarvis} />
                ) : cardIndex === 14 ? (
                  <Card15Blob controllerRef={controllerRef} isVantablack={isVantablack} isJarvis={isJarvis} />
                ) : cardIndex === 15 ? (
                  <Card16Blob controllerRef={controllerRef} isVantablack={isVantablack} isJarvis={isJarvis} />
                ) : cardIndex === 16 ? (
                  <Card17Blob controllerRef={controllerRef} isVantablack={isVantablack} isJarvis={isJarvis} />
                ) : cardIndex === 17 ? (
                  <Card18Blob controllerRef={controllerRef} isVantablack={isVantablack} isJarvis={isJarvis} />
                ) : cardIndex === 18 ? (
                  <Card19Blob controllerRef={controllerRef} isVantablack={isVantablack} isJarvis={isJarvis} />
                ) : cardIndex === 19 ? (
                  <Card20Blob controllerRef={controllerRef} isVantablack={isVantablack} isJarvis={isJarvis} />
                ) : cardIndex === 20 ? (
                  <Card21Blob controllerRef={controllerRef} isVantablack={isVantablack} isJarvis={isJarvis} />
                ) : cardIndex === 21 ? (
                  <Card22Blob controllerRef={controllerRef} isVantablack={isVantablack} isJarvis={isJarvis} />
                ) : cardIndex === 22 ? (
                  <Card23Blob controllerRef={controllerRef} isVantablack={isVantablack} isJarvis={isJarvis} />
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

        <div className="text-center text-gray-500 text-sm font-medium tracking-widest uppercase">
          Variant {cardIndex + 1} of {TOTAL_CARDS} (Use Arrow Keys)
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

            {cardIndex >= 4 && cardIndex <= 22 && (
              <button
                onClick={() => {
                  if (controllerRef.current && controllerRef.current.enableAudio) {
                    controllerRef.current.enableAudio();
                  }
                }}
                className="px-6 py-3 bg-fuchsia-600 text-white border border-fuchsia-500 rounded-full font-medium hover:bg-fuchsia-500 transition-colors shadow-[0_0_15px_rgba(192,38,211,0.5)] flex items-center gap-2"
              >
                <Play size={18} />
                Play {cardIndex === 4 ? 'ms.mp3' : cardIndex === 5 ? 'ms.mp3' : cardIndex === 6 ? 'ms.mp3' : cardIndex === 7 ? 'knees.mp3' : cardIndex === 8 ? 'charcoal.mp3' : cardIndex === 9 ? 'zoogaze.mp3' : cardIndex === 10 ? 'echoplxjm.mp3' : cardIndex === 11 ? 'gotsumthin.mp3' : cardIndex === 12 ? 'softtouch.mp3' : cardIndex === 13 ? 'foyou.mp3' : cardIndex === 14 ? 'ca.mp3' : cardIndex === 15 ? 'elevated.mp3' : cardIndex === 16 ? 'echoplxjm2.mp3' : cardIndex === 17 ? 'dq2.mp3' : cardIndex === 18 ? 'threed.mp3' : cardIndex === 19 ? 'elevated2.mp3' : cardIndex === 20 ? 'untitled5.mp3' : cardIndex === 21 ? 'mashup24.mp3' : 'mirror.mp3'}
              </button>
            )}
          </div>

          <div className={`w-full max-w-xs mx-auto mt-2 transition-opacity duration-300 ${cardIndex === 2 ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
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
              disabled={cardIndex !== 2}
              className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>

          <dl className="flex gap-8 text-center">
            <div>
              <dt className="text-sm text-gray-500 mb-1">Preset</dt>
              <dd className="font-medium text-gray-300">
                {cardIndex === 0 
                  ? MASS_PRESETS[presetIndex % MASS_PRESETS.length].name 
                  : OLD_MASS_PRESETS[presetIndex % OLD_MASS_PRESETS.length].name}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 mb-1">Family</dt>
              <dd className="font-medium text-gray-300 capitalize">
                {cardIndex === 0 ? 'Ferrofluid / Sludge' : cardIndex === 2 ? 'Aerotrim Gimbal' : cardIndex === 3 ? 'Historic Blob' : cardIndex === 4 ? 'Sonic Mass' : cardIndex === 5 ? 'Advanced Audio' : cardIndex === 6 ? 'Snare Flux' : cardIndex === 7 ? 'Event Reactive' : cardIndex === 8 ? 'Snare Flux' : cardIndex === 9 ? 'Event Reactive' : cardIndex === 10 ? 'Snare Flux' : cardIndex === 11 ? 'Event Reactive' : cardIndex === 12 ? 'Snare Flux' : cardIndex === 13 ? 'Event Reactive' : cardIndex === 14 ? 'Snare Flux' : cardIndex === 15 ? 'Event Reactive' : cardIndex === 16 ? 'Snare Flux' : cardIndex === 17 ? 'Event Reactive' : cardIndex === 18 ? 'Snare Flux' : cardIndex === 19 ? 'Event Reactive' : cardIndex === 20 ? 'Snare Flux' : cardIndex === 21 ? 'Event Reactive' : cardIndex === 22 ? 'Snare Flux' : 'Magnetic Orbits'}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 mb-1">Motion</dt>
              <dd className="font-medium text-gray-300">
                {cardIndex === 0 ? 'magnetic pull + fluid noise' : cardIndex === 2 ? '3-axis gimbal + slooge' : cardIndex === 3 ? 'saw blade spin' : cardIndex === 4 ? 'audio reactive displacement' : cardIndex === 5 ? 'dual-mode DSP + timeline' : cardIndex === 6 ? 'dual-band flux + notKick gate' : cardIndex === 7 ? 'event flux + squiggle/split' : cardIndex === 8 ? 'dual-band flux + notKick gate' : cardIndex === 9 ? 'event flux + squiggle/split' : cardIndex === 10 ? 'dual-band flux + notKick gate' : cardIndex === 11 ? 'event flux + squiggle/split' : cardIndex === 12 ? 'dual-band flux + notKick gate' : cardIndex === 13 ? 'event flux + squiggle/split' : cardIndex === 14 ? 'dual-band flux + notKick gate' : cardIndex === 15 ? 'event flux + squiggle/split' : cardIndex === 16 ? 'dual-band flux + notKick gate' : cardIndex === 17 ? 'event flux + squiggle/split' : cardIndex === 18 ? 'dual-band flux + notKick gate' : cardIndex === 19 ? 'event flux + squiggle/split' : cardIndex === 20 ? 'dual-band flux + notKick gate' : cardIndex === 21 ? 'event flux + squiggle/split' : cardIndex === 22 ? 'dual-band flux + notKick gate' : 'orbiting magnets + displacement'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
