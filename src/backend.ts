import { invoke } from "@tauri-apps/api/tauri";
import { Circle, Rectangle, Shape, ShapeBase } from "./interfaces/shape";

interface GenericShape {
  Circle?: ShapeBase & { child: Omit<Circle, keyof ShapeBase> };
  Rectangle?: ShapeBase & { child: Omit<Rectangle, keyof ShapeBase> };
}

function shapesSimpleAsGeneric(shapes: Shape[]): GenericShape[] {
  return shapes.map((enu) => {
    for (const key in enu) {
      const { x, y, color, ...child } = enu[key as keyof Shape];
      return {
        [key]: {
          x, y, color,
          child,
        },
      };
    }

    throw new Error("Unknown shape");
  });
}

function shapesGenericAsSimple(shapes: GenericShape[]): Shape[] {
  return shapes.map((enu) => {
    for (const key in enu) {
      const { child, ...rest } = enu[key as keyof GenericShape] as any;
      return {
        [key]: {
          ...rest,
          ...child,
        },
      } as Shape;
    }

    throw new Error("Unknown shape");
  });
}

interface ObjectShape {
  Circle?: Omit<Circle, keyof ShapeBase> & { base: ShapeBase };
  Rectangle?: Omit<Rectangle, keyof ShapeBase> & { base: ShapeBase };
}

function shapesSimpleAsObject(shapes: Shape[]): ObjectShape[] {
  return shapes.map((enu) => {
    for (const key in enu) {
      const { x, y, color, ...rest } = enu[key as keyof Shape];
      return {
        [key]: {
          base: { x, y, color },
          ...rest
        },
      };
    }

    throw new Error("Unknown shape");
  });
}

function shapesObjectAsSimple(shapes: ObjectShape[]): Shape[] {
  return shapes.map((enu) => {
    for (const key in enu) {
      const { base, ...rest } = enu[key as keyof ObjectShape] as any;
      return {
        [key]: {
          ...base,
          ...rest,
        },
      } as Shape;
    }

    throw new Error("Unknown shape");
  });
}

export interface OccupationResult {
  occupation: number;
  elapsed: number;
}

export interface FilterResult<T> {
  filtered: T[];
  elapsed: number;
}

export async function simpleOccupation(shapes: Shape[], threads: number) {
  return await invoke<OccupationResult>("simple_occupation", { shapes, threads });
}

export async function simpleFilter(shapes: Shape[], kind: string, threads: number) {
  return await invoke<FilterResult<Shape>>("simple_filter", { shapes, kind, threads });
}

export async function objectOccupation(shapes: Shape[], threads: number) {
  return await invoke<OccupationResult>("object_occupation", { shapes: shapesSimpleAsObject(shapes), threads });
}

export async function objectFilter(shapes: Shape[], kind: string, threads: number) {
  const result = await invoke<FilterResult<ObjectShape>>("object_filter", { shapes: shapesSimpleAsObject(shapes), kind, threads });

  return {
    filtered: shapesObjectAsSimple(result.filtered),
    elapsed: result.elapsed,
  };
}

export async function genericOccupation(shapes: Shape[], threads: number) {
  return await invoke<OccupationResult>("generic_occupation", { shapes: shapesSimpleAsGeneric(shapes), threads });
}

export async function genericFilter(shapes: Shape[], kind: string, threads: number) {
  const result = await invoke<FilterResult<GenericShape>>("generic_filter", { shapes: shapesSimpleAsGeneric(shapes), kind, threads });

  return {
    filtered: shapesGenericAsSimple(result.filtered),
    elapsed: result.elapsed,
  };
}
