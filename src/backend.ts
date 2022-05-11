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

export interface MutationResult<T> {
  values: T[];
  elapsed: number;
}

export async function simpleOccupation(shapes: Shape[], threads: number) {
  return await invoke<OccupationResult>("simple_occupation", { shapes, threads });
}

export async function simpleFilter(shapes: Shape[], kind: string, threads: number): Promise<FilterResult<Shape>> {
  return await invoke<FilterResult<Shape>>("simple_filter", { shapes, kind, threads });
}

export async function simpleMutationCirclesToRectangles(shapes: Shape[], threads: number) {
  return await invoke<MutationResult<Shape>>("simple_mutation_circles_to_rectangles", { shapes, threads });
}

export async function objectOccupation(shapes: Shape[], threads: number) {
  return await invoke<OccupationResult>("object_occupation", { shapes: shapesSimpleAsObject(shapes), threads });
}

export async function objectFilter(shapes: Shape[], kind: string, threads: number): Promise<FilterResult<Shape>> {
  const result = await invoke<FilterResult<ObjectShape>>("object_filter", { shapes: shapesSimpleAsObject(shapes), kind, threads });

  return {
    filtered: shapesObjectAsSimple(result.filtered),
    elapsed: result.elapsed,
  };
}

export async function objectMutationCirclesToRectangles(shapes: Shape[], threads: number): Promise<MutationResult<Shape>> {
  const result = await invoke<MutationResult<ObjectShape>>("object_mutation_circles_to_rectangles", { shapes: shapesSimpleAsObject(shapes), threads });

  return {
    values: shapesObjectAsSimple(result.values),
    elapsed: result.elapsed,
  };
}

export async function genericOccupation(shapes: Shape[], threads: number) {
  return await invoke<OccupationResult>("generic_occupation", { shapes: shapesSimpleAsGeneric(shapes), threads });
}

export async function genericFilter(shapes: Shape[], kind: string, threads: number): Promise<FilterResult<Shape>> {
  const result = await invoke<FilterResult<GenericShape>>("generic_filter", { shapes: shapesSimpleAsGeneric(shapes), kind, threads });

  return {
    filtered: shapesGenericAsSimple(result.filtered),
    elapsed: result.elapsed,
  };
}

export async function genericMutationCirclesToRectangles(shapes: Shape[], threads: number): Promise<MutationResult<Shape>> {
  const result = await invoke<MutationResult<GenericShape>>("generic_mutation_circles_to_rectangles", { shapes: shapesSimpleAsGeneric(shapes), threads });

  return {
    values: shapesGenericAsSimple(result.values),
    elapsed: result.elapsed,
  };
}