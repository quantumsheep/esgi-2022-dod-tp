import { ShapeBase } from "../interfaces/shape";

export class Circle implements ShapeBase {
    kind: string;
    radius: number;
    x: number;
    y: number;
    color: string;

    constructor(x: number, y: number, radius: number, color: string) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.kind = 'circle';
        this.color = color;
    }
  }