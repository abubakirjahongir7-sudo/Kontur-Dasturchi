import {useEffect, useState} from 'react';
import {useDelayRender} from 'remotion';

export type ImageSize = {width: number; height: number};

/** Rasmning asl o'lchamini oladi (render o'lcham aniqlanguncha kutib turadi) */
export const useImageSize = (src: string | null): ImageSize | null => {
  const {delayRender, continueRender} = useDelayRender();
  const [size, setSize] = useState<ImageSize | null>(null);
  const [handle] = useState(() => (src ? delayRender(`Rasm o'lchami: ${src}`) : null));

  useEffect(() => {
    if (!src || handle === null) return;
    const img = new Image();
    img.onload = () => {
      setSize({width: img.naturalWidth, height: img.naturalHeight});
      continueRender(handle);
    };
    img.onerror = () => continueRender(handle);
    img.src = src;
  }, [src, handle, continueRender]);

  return size;
};
