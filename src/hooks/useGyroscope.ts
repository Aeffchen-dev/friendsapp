import { useState, useEffect } from 'react';
import { Motion } from '@capacitor/motion';
import { Capacitor } from '@capacitor/core';

interface GyroscopeData {
  x: number;
  y: number;
  z: number;
}

export function useGyroscope() {
  const [gyroData, setGyroData] = useState<GyroscopeData>({ x: 0, y: 0, z: 0 });
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    let accelHandler: any;

    const initializeMotion = async () => {
      if (!Capacitor.isNativePlatform()) {
        // Fallback for web - use DeviceMotionEvent
        if (window.DeviceMotionEvent) {
          const handleDeviceMotion = (event: DeviceMotionEvent) => {
            if (event.accelerationIncludingGravity) {
              setGyroData({
                x: event.accelerationIncludingGravity.x || 0,
                y: event.accelerationIncludingGravity.y || 0,
                z: event.accelerationIncludingGravity.z || 0,
              });
            }
          };

          // Request permission for iOS 13+
          if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
            try {
              const permission = await (DeviceMotionEvent as any).requestPermission();
              if (permission === 'granted') {
                window.addEventListener('devicemotion', handleDeviceMotion);
                setIsSupported(true);
              }
            } catch (error) {
              console.log('Motion permission denied');
            }
          } else {
            // For other browsers that support DeviceMotion
            window.addEventListener('devicemotion', handleDeviceMotion);
            setIsSupported(true);
          }

          return () => {
            window.removeEventListener('devicemotion', handleDeviceMotion);
          };
        }
        return;
      }

      try {
        // Native platform - use Capacitor Motion plugin
        accelHandler = await Motion.addListener('accel', (event) => {
          setGyroData({
            x: event.accelerationIncludingGravity.x,
            y: event.accelerationIncludingGravity.y,
            z: event.accelerationIncludingGravity.z,
          });
        });

        setIsSupported(true);
      } catch (error) {
        console.log('Motion not supported or permission denied');
        setIsSupported(false);
      }
    };

    initializeMotion();

    return () => {
      if (accelHandler) {
        accelHandler.remove();
      }
    };
  }, []);

  // Convert gyroscope data to smooth translation values
  const getTranslateY = () => {
    if (!isSupported) return 0;
    
    // Use Y axis (tilt forward/backward) and limit the movement
    // Scale down the movement and add smoothing
    const movement = Math.max(-20, Math.min(20, gyroData.y * -2));
    return movement;
  };

  return {
    gyroData,
    isSupported,
    translateY: getTranslateY(),
  };
}