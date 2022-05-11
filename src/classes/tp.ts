import { Shape } from "../interfaces/shape";
import { Emission } from "./Emission";
import { Conversion } from "../interfaces/conversion";
import { Rectangle } from "./Rectangle";
import { Circle } from "./Circle";
import { Space } from "./Space";
import { CircleRectangleMutation } from "./CircleRectangleMutation";
import { Filter } from "./Filter";

const os = require('os');


export function tp1(shapes: Array<Shape>): Space {
    const space: Emission = new Emission()
    const rects: Array<Shape> = []
    const conversion: Conversion = new Conversion()

    shapes.forEach(shape => {
        if (shape instanceof Rectangle) {
            rects.push(shape)
        } else if (shape instanceof Circle) {
            rects.push(conversion.convert(shape))
        } else {
            throw new Error('Unknown shape')
        }

    })

    return space.output(rects) as Space;
}

export function tp2(shapes: Array<Shape>): Space {
    const space: Emission = new Emission()
    const conversion: Conversion = new Conversion()
    const mutation = new CircleRectangleMutation(conversion)

    const rects = space.output(new Filter("rectangle").output(shapes))
    const circles = space.output(mutation.output(new Filter("circle").output(shapes)))

    return space.output([rects, circles] ) as Space;
}

export function tp3(shapes: Array<Shape>): void {
   console.error("NOT IMPLEMENTED")

}

