import { ShapeBase } from "../interfaces/shape";

export class Space implements ShapeBase {
    kind: string;
    x: number;
    y: number;

    width: number;
    height: number;

    colors: Array<string>;

    constructor(x: number, y: number, width: number, height: number, colors: Array<string>) {
        this.x = x;
        this.y = y;
        this.colors = colors;
        this.kind = 'space';

        this.width = 0;
        this.height = 0;
    }

}