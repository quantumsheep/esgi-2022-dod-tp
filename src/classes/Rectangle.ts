import { ShapeBase } from "../interfaces/shape";

export class Rectangle implements ShapeBase {
    kind: "rectangle";

    width: number;
    height: number;
    x: number;
    y: number;
    color: string;

    constructor(x: number, y: number, width: number, height: number, color: string) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.kind = "rectangle";
        this.color = color;
    }
  }