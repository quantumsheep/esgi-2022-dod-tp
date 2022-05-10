export interface ShapeBase {
  x: number;
  y: number;

  color: string;
}

export interface GenericShape extends ShapeBase {
  kind: 'generic';
  width: number;
  height: number;
}

export interface Circle extends ShapeBase {
  kind: "circle";

  radius: number;
}

export interface Rectangle extends ShapeBase {
  kind: "rectangle";

  width: number;
  height: number;
}



export type Shape = Circle | Rectangle;
