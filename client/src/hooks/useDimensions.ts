import { useLayoutEffect, useRef, useState } from "react";

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
  any,
  Dimensions
] {
  const ref = useRef<T>();
  const [dimensions, setDimensions] = useState<Dimensions>({} as Dimensions);

  useLayoutEffect(function () {
    if (!ref.current) return;
    handleUpdateDimensions();
    const resizeObserver = new ResizeObserver(handleUpdateDimensions);
    resizeObserver.observe(ref.current);
  }, []);

  function handleUpdateDimensions() {
    console.log("updating dimensions");
    setDimensions(ref.current?.getBoundingClientRect().toJSON());
  }
  return [ref, dimensions];
}
