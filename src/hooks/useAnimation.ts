import { useState, useEffect } from 'react';

interface UseAnimationOptions {
  delay?: number;
  duration?: number;
  initialVisible?: boolean;
}

export function useAnimation(options: UseAnimationOptions = {}) {
  const { delay = 0, duration = 500, initialVisible = false } = options;
  const [isVisible, setIsVisible] = useState(initialVisible);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const startExit = (callback?: () => void) => {
    setIsExiting(true);
    setTimeout(() => {
      if (callback) callback();
    }, duration);
  };

  const getTransitionClasses = (baseClasses = '') => {
    return `transition-all duration-${duration} ease-out ${
      isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
    } ${isExiting ? 'opacity-0 scale-95' : ''} ${baseClasses}`;
  };

  return {
    isVisible,
    isExiting,
    setIsVisible,
    startExit,
    getTransitionClasses
  };
} 