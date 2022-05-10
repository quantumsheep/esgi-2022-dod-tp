import React, { useEffect, useRef, useState } from "react";
import { Circle, Rectangle, Shape } from "../interfaces/shape";

export type ShapeDisplayProps = {
  shapes: Shape[];
  parentRef: React.MutableRefObject<HTMLDivElement>;
};

export default function ShapeDisplay({ shapes, parentRef }: ShapeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>();
  const [ctx, setCtx] = useState<CanvasRenderingContext2D>();

  const drawCircle = (circle: Circle) => {
    if (!ctx) return;

    ctx.beginPath();
    ctx.fillStyle = circle.color;
    ctx.strokeStyle = "#000000";
    ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
  };

  const drawRectangle = (rectangle: Rectangle) => {
    if (!ctx) return;

    ctx.beginPath();
    ctx.fillStyle = rectangle.color;
    ctx.strokeStyle = "#000000";
    ctx.rect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
    ctx.stroke();
    ctx.fill();
  };

  const drawShape = (shape: Shape) => {
    if (shape.Circle) {
      drawCircle(shape.Circle);
    } else if (shape.Rectangle) {
      drawRectangle(shape.Rectangle);
    }
  };

  const render = () => {
    if (!parentRef.current || !canvasRef.current) return;
    if (!ctx) return;

    const parent = parentRef.current;
    const canvas = canvasRef.current;

    if (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    for (const shape of shapes) {
      drawShape(shape);
    }

    requestAnimationFrame(render);
  };

  useEffect(() => {
    requestAnimationFrame(render);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  return (
    <canvas
      ref={(canvas) => {
        canvasRef.current = canvas ?? undefined;
        setCtx(canvas?.getContext("2d") ?? undefined);
      }}
      style={{
        position: "absolute",
      }}
    ></canvas>
  );
}
