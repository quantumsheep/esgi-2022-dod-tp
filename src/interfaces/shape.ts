export interface ShapeBase {
  x: number;
  y: number;

  color: string;
}

export interface Circle extends ShapeBase {
  radius: number;
}

export interface Rectangle extends ShapeBase {
  width: number;
  height: number;
}

export interface Shape {
  Circle: Circle;
  Rectangle: Rectangle;
}
