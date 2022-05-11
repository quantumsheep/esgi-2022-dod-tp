import { Circle } from "@chakra-ui/react";
import { Rectangle } from "../classes/Rectangle";
import { Shape } from "./shape";

export class Conversion {
    convert(shape: Shape): Shape {
        if (shape instanceof Rectangle) {
            return shape;
        } else if (shape instanceof Circle) {
            const circle = shape as Circle;
            const x = circle.x - circle.radius;
            const y = circle.y - circle.radius;
            const width = circle.radius * 2;
            const height = circle.radius * 2;

            return new Rectangle(x, y, width, height, circle.color);
        } else {
            throw new Error("Unknown shape");
        }
    }

}