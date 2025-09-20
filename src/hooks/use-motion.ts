import { useCallback, useEffect, useRef, useState } from 'react';

export type MotionPermission = 'unknown' | 'granted' | 'denied';

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function useMotion() {
  const [supported, setSupported] = useState<boolean>(false);
  const [permission, setPermission] = useState<MotionPermission>('unknown');
  const [y, setY] = useState<number>(0);

  const latestYRef = useRef<number>(0);
  const rafId = useRef<number | null>(null);
  const ticking = useRef<boolean>(false);

  const smooth = (prev: number, next: number, factor = 0.2) => prev + (next - prev) * factor;

  const scheduleUpdate = () => {
    if (ticking.current) return;
    ticking.current = true;
    rafId.current = requestAnimationFrame(() => {
      setY((prev) => smooth(prev, latestYRef.current));
      ticking.current = false;
    });
  };

  const handleDeviceMotion = (event: DeviceMotionEvent) => {
    const ay = event.accelerationIncludingGravity?.y;
    if (typeof ay !== 'number') return;
    // Map acceleration to pixels and clamp
    const mapped = clamp(-ay * 4, -40, 40);
    latestYRef.current = mapped;
    scheduleUpdate();
  };

  const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
    const beta = event.beta; // front-back tilt, -180..180
    if (typeof beta !== 'number') return;
    const mapped = clamp(-(beta / 2), -40, 40);
    latestYRef.current = mapped;
    scheduleUpdate();
  };

  const addListeners = () => {
    // Prefer devicemotion if available
    if ('DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', handleDeviceMotion, { passive: true } as EventListenerOptions);
    }
    if ('DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleDeviceOrientation, { passive: true } as EventListenerOptions);
    }
  };

  const removeListeners = () => {
    window.removeEventListener('devicemotion', handleDeviceMotion as any);
    window.removeEventListener('deviceorientation', handleDeviceOrientation as any);
    if (rafId.current) cancelAnimationFrame(rafId.current);
    ticking.current = false;
  };

  useEffect(() => {
    setSupported('DeviceMotionEvent' in window || 'DeviceOrientationEvent' in window);
    return () => removeListeners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enable = useCallback(async () => {
    // iOS 13+ requires permission via a user gesture
    let granted = true;
    try {
      const DM: any = (window as any).DeviceMotionEvent;
      const DO: any = (window as any).DeviceOrientationEvent;
      if (typeof DM?.requestPermission === 'function') {
        const res = await DM.requestPermission();
        granted = res === 'granted';
      } else if (typeof DO?.requestPermission === 'function') {
        const res = await DO.requestPermission();
        granted = res === 'granted';
      }
    } catch (_e) {
      granted = false;
    }

    if (!granted) {
      setPermission('denied');
      return false;
    }

    setPermission('granted');
    addListeners();
    return true;
  }, []);

  return { y, supported, permission, enable } as const;
}
