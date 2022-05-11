import { Pipeline } from "../interfaces/pipeline";
import { Shape } from "../interfaces/shape";
import { Rectangle } from "./Rectangle";
import { Circle } from "./Circle";
import { Space } from "./Space";

export class Emission implements Pipeline {

    output(input: Array<Shape>): Shape {
        let minTopX = Number.MAX_VALUE;
        let minTopY = Number.MAX_VALUE;
        let maxBottomX  = Number.MIN_VALUE;
        let maxBottomY = Number.MIN_VALUE;

        let res: Space;

        let colors = new Set<string>();

        input.forEach(shape => {
            if (shape instanceof Rectangle) {
                let rect = shape as Rectangle;
                minTopX = Math.min(minTopX, rect.x);
                minTopY = Math.min(minTopY, rect.y);
                maxBottomX = Math.max(maxBottomX, rect.x + rect.width);
                maxBottomY = Math.max(maxBottomY, rect.y + rect.height);
                colors.add(rect.color);

            } else if (shape instanceof Circle) {
                let circle = shape as Circle;
                minTopX = Math.min(minTopX, circle.x - circle.radius);
                minTopY = Math.min(minTopY, circle.y - circle.radius);
                maxBottomX = Math.max(maxBottomX, circle.x + circle.radius);
                maxBottomY = Math.max(maxBottomY, circle.y + circle.radius);
                colors.add(circle.color);

            } else {
                throw new Error('Unknown shape');

            }
        });

        res = new Space(minTopX, minTopY, maxBottomX - minTopX, maxBottomY - minTopY, Array.from(colors));

        return res;

    }

}