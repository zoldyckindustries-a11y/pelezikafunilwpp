'use client';

import { useEffect } from 'react';
import Home from '@/app/page';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function ResultadoFB() {
  useEffect(() => {
    if (!(window as any)._fbPixelInitialized) {
      import('react-facebook-pixel')
        .then((x) => x.default)
        .then((ReactPixel) => {
          ReactPixel.init('691938970226836');
          ReactPixel.pageView();
          (window as any)._fbPixelInitialized = true;
        });
    }
  }, []);

  return <Home />;
}
