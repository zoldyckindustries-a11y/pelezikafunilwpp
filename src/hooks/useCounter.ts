import { useState, useEffect } from 'react';

interface UseCounterOptions {
  initialValue?: number;
  increment?: {
    min: number;
    max: number;
  };
  interval?: {
    min: number;
    max: number;
  };
  animationDuration?: number;
  autoStart?: boolean;
}

export function useCounter(options: UseCounterOptions = {}) {
  const {
    initialValue = 14832,
    increment = { min: 1, max: 3 },
    interval = { min: 3000, max: 5000 },
    animationDuration = 1000,
    autoStart = true
  } = options;

  const [profileCount, setProfileCount] = useState(initialValue);
  const [displayCount, setDisplayCount] = useState(initialValue);
  const [isActive, setIsActive] = useState(autoStart);

  // Incremento automático do contador
  useEffect(() => {
    if (!isActive) return;

    const intervalId = setInterval(() => {
      const incrementValue = Math.floor(Math.random() * (increment.max - increment.min + 1)) + increment.min;
      setProfileCount(prev => prev + incrementValue);
    }, interval.min + Math.random() * (interval.max - interval.min));

    return () => clearInterval(intervalId);
  }, [isActive, increment.min, increment.max, interval.min, interval.max]);

  // Animação suave do contador exibido
  useEffect(() => {
    if (profileCount === displayCount) return;

    const animateCounter = () => {
      const start = displayCount;
      const end = profileCount;
      const startTime = Date.now();

      const updateCounter = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);
        
        // Easing function para suavizar a animação (ease-out cubic)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (end - start) * easeOut);
        
        setDisplayCount(current);
        
        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        }
      };
      
      requestAnimationFrame(updateCounter);
    };

    animateCounter();
  }, [profileCount, displayCount, animationDuration]);

  const start = () => setIsActive(true);
  const stop = () => setIsActive(false);
  const reset = () => {
    setProfileCount(initialValue);
    setDisplayCount(initialValue);
  };

  const formatCount = (locale = 'pt-BR') => {
    return displayCount.toLocaleString(locale);
  };

  return {
    count: profileCount,
    displayCount,
    isActive,
    start,
    stop,
    reset,
    formatCount
  };
} 