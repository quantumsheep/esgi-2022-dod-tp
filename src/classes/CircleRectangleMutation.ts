import { Conversion } from "../interfaces/conversion";
import { Pipeline } from "../interfaces/pipeline";
import { Shape } from "../interfaces/shape";

export class CircleRectangleMutation implements Pipeline {

    conversion: Conversion;

    constructor(conversion: Conversion) {
        this.conversion = conversion;
    }

    output(input: Array<Shape>): Array<Shape> {
        if (this.conversion) {
            return input.map(shape => this.conversion.convert(shape));

        } else {
            return input;
        }
    }
}