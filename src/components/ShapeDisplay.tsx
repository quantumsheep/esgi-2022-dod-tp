import React, { useEffect, useRef, useState } from "react";
import { Circle, Rectangle, Shape } from "../interfaces/shape";

export type ShapeDisplayProps = {
  shapes: Shape[];
  parentRef: React.MutableRefObject<HTMLDivElement>;
};

export default function ShapeDisplay({ shapes, parentRef }: ShapeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>();
  const [ctx, setCtx] = useState<CanvasRenderingContext2D>();

  const drawCircle = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, circle: Circle) => {
    ctx.beginPath();
    ctx.fillStyle = circle.color;
    ctx.strokeStyle = "#000000";
    ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
  };

  const drawRectangle = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, rectangle: Rectangle) => {
    ctx.beginPath();
    ctx.fillStyle = rectangle.color;
    ctx.strokeStyle = "#000000";
    ctx.rect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
    ctx.stroke();
    ctx.fill();
  };

  const drawShape = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, shape: Shape) => {
    if (shape.Circle) {
      drawCircle(ctx, canvas, shape.Circle);
    } else if (shape.Rectangle) {
      drawRectangle(ctx, canvas, shape.Rectangle);
    }
  };

  const render = () => {
    if (!parentRef.current || !canvasRef.current) return;
    if (!ctx) return;

    const canvas = canvasRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const shape of shapes) {
      drawShape(ctx, canvas, shape);
    }
  };

  useEffect(() => {
    requestAnimationFrame(render);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shapes]);

  useEffect(() => {
    function handleResize(e: UIEvent) {
      requestAnimationFrame(render);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  });

  useEffect(() => {
    let stop = false;

    function resizeCanvas() {
      if (!parentRef.current || !canvasRef.current) return;
      if (stop) return;

      const parent = parentRef.current;
      const canvas = canvasRef.current;

      const dimension = parent.getBoundingClientRect();

      if (canvas.width !== dimension.width || canvas.height !== dimension.height) {
        canvas.width = dimension.width;
        canvas.height = dimension.height;

        render();
      }

      requestAnimationFrame(resizeCanvas);
    }

    requestAnimationFrame(resizeCanvas);

    return () => {
      stop = true;
    };
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
