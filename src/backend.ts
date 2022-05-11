import { invoke } from "@tauri-apps/api/tauri";
import { Shape } from "./interfaces/shape";

export interface SimpleOccupationResult {
  occupation: number;
  elapsed: number;
}

export async function simpleOccupation(shapes: Shape[]) {
  return await invoke<SimpleOccupationResult>("simple_occupation", { shapes });
}
