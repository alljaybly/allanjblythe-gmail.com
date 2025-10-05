import { useState, useEffect, RefObject, useRef } from 'react';
import { debounce } from 'lodash-es';

interface Dimensions {
  width: number;
  height: number;
}

export function useDebouncedResize(elementRef: RefObject<HTMLElement>, debounceMs = 100): Dimensions {
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 });
  const previousDimensions = useRef<Dimensions>({ width: 0, height: 0 });

  useEffect(() => {
    if (!elementRef.current) return;

    // Initialize with the current dimensions
    const initialWidth = elementRef.current.offsetWidth;
    const initialHeight = elementRef.current.offsetHeight;
    if (initialWidth > 0 && initialHeight > 0) {
      setDimensions({ width: initialWidth, height: initialHeight });
      previousDimensions.current = { width: initialWidth, height: initialHeight };
    }


    const handleResize = debounce((entries: ResizeObserverEntry[]) => {
      if (!entries || entries.length === 0) return;

      const { width, height } = entries[0].contentRect;
      
      // Guard: Only update if the change is significant enough (> 1px)
      if (
        Math.abs(width - previousDimensions.current.width) > 1 ||
        Math.abs(height - previousDimensions.current.height) > 1
      ) {
        previousDimensions.current = { width, height };
        setDimensions({ width, height });
      }
    }, debounceMs);

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(elementRef.current);

    return () => {
      handleResize.cancel();
      resizeObserver.disconnect();
    };
  }, [elementRef, debounceMs]);

  return dimensions;
}
