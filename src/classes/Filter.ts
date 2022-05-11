import { Pipeline } from "../interfaces/pipeline";

export class Filter implements Pipeline {
    type: string;

    constructor(type: string) {
        this.type = type;
    }

    output(input: Array<Shape>): Array<Shape> {
        return input.filter(shape => shape.kind === this.type);
    }


}