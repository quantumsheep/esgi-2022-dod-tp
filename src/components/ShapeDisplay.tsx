import React, { useRef } from "react";

export type ShapeDisplayProps = {};

export default function ShapeDisplay(props: ShapeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>() as React.MutableRefObject<HTMLCanvasElement>;

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
      }}
    ></canvas>
  );
}
