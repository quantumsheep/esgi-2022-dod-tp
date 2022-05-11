import { Shape } from "./shape";

export interface Pipeline {
    output: (input: Array<Shape>) => Array<Shape> | Shape;
}
