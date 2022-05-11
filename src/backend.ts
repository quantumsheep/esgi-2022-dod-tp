import { invoke } from "@tauri-apps/api/tauri";
import { Shape } from "./interfaces/shape";

export interface OccupationResult {
  occupation: number;
  elapsed: number;
}

export async function simpleOccupation(shapes: Shape[]) {
  return await invoke<OccupationResult>("simple_occupation", { shapes });
}

export async function objectOccupation(shapes: Shape[]) {
  const shapesAsObject = shapes.map((enu) => {
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

  return await invoke<OccupationResult>("object_occupation", { shapes: shapesAsObject });
}

export async function genericOccupation(shapes: Shape[]) {
  const shapesAsGeneric = shapes.map((enu) => {
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

  return await invoke<OccupationResult>("generic_occupation", { shapes: shapesAsGeneric });
}
