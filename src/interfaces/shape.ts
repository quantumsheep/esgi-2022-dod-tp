import { Circle } from "../classes/Circle";
import { Rectangle } from "../classes/Rectangle";
import { Space } from "../classes/Space";

export interface ShapeBase {
  x: number;
  y: number;

  kind: string;
}



export type Shape = Circle | Rectangle | Space;
