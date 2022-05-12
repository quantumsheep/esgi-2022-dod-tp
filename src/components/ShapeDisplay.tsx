import { Box, Button, Flex, HStack } from "@chakra-ui/react";
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

  let [translate, setTranslate] = useState<[number, number]>([0, 0]);

  const render = () => {
    if (!parentRef.current || !canvasRef.current) return;
    if (!ctx) return;

    const canvas = canvasRef.current;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.clientWidth;
    tempCanvas.height = canvas.clientHeight;
    const tempCanvasCtx = tempCanvas.getContext("2d");

    tempCanvasCtx?.translate(translate[0], translate[1]);

    for (const shape of shapes) {
      drawShape(tempCanvasCtx!, tempCanvas, shape);
    }

    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    ctx.drawImage(tempCanvas, 0, 0);
  };

  useEffect(() => {
    requestAnimationFrame(render);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shapes, translate]);

  useEffect(() => {
    function handleResize(e: UIEvent) {
      requestAnimationFrame(render);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  });

  let [dragStart, setDragStart] = useState<[number, number]>();

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    setDragStart([e.clientX, e.clientY]);
    canvasRef.current!.style.cursor = "grabbing";
  }

  function handleMouseUp(e: MouseEvent) {
    setDragStart(undefined);

    if (canvasRef.current) {
      canvasRef.current.style.cursor = "grab";
    }
  }

  function handleMouseMove(e: MouseEvent) {
    if (!dragStart) return;
    if (!ctx) return;

    setTranslate([translate[0] + e.clientX - dragStart[0], translate[1] + e.clientY - dragStart[1]]);
    setDragStart([e.clientX, e.clientY]);
  }

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
    };
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
    <>
      <canvas
        ref={(canvas) => {
          canvasRef.current = canvas ?? undefined;
          setCtx(canvas?.getContext("2d") ?? undefined);
        }}
        onMouseDown={handleMouseDown}
        style={{
          position: "absolute",
          cursor: "grab",
        }}
      ></canvas>
      <Flex position="absolute" bottom="0" right="0" justifyContent="end" alignItems="end" m={3}>
        <HStack borderWidth="1px" borderRadius="lg" pl={3} backgroundColor="white">
          <Box>
            x: {translate[0]}, y: {translate[1]}
          </Box>
          <Button
            onClick={() => {
              setTranslate([0, 0]);
            }}
          >
            Reset
          </Button>
        </HStack>
      </Flex>
    </>
  );
}
