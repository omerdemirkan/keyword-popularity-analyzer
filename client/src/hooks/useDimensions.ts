import React, {
  MutableRefObject,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

interface Dimensions {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
  x: number;
  y: number;
}

export default function useDimensions<T extends HTMLElement>(): [
  MutableRefObject<T | null>,
  Dimensions
] {
  const ref = useRef<T>(null);
  const [dimensions, setDimensions] = useState<Dimensions>({} as Dimensions);

  useLayoutEffect(function () {
    if (!ref.current) return;
    handleUpdateDimensions();
    const resizeObserver = new ResizeObserver(handleUpdateDimensions);
    const element = ref.current;
    resizeObserver.observe(element);
    return () => resizeObserver.unobserve(element);
  }, []);

  function handleUpdateDimensions() {
    setDimensions(ref.current?.getBoundingClientRect().toJSON());
  }
  return [ref, dimensions];
}
