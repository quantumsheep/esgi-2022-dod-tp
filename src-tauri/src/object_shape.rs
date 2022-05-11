use crate::shape::Shape;

#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub enum ObjectShapeKind {
    Circle(ObjectCircle),
    Rectangle(ObjectRectangle),
}

#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct ObjectShape {
    pub x: f64,
    pub y: f64,
    pub color: String,
}

#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct ObjectCircle {
    pub base: ObjectShape,

    pub radius: f64,
}

impl Shape for ObjectCircle {
    fn rectangular_area(self: &Self) -> f64 {
        let width = self.radius * 2.0;
        return width * width;
    }
}

#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct ObjectRectangle {
    pub base: ObjectShape,

    pub width: f64,
    pub height: f64,
}

impl Shape for ObjectRectangle {
    fn rectangular_area(self: &Self) -> f64 {
        return self.width * self.height;
    }
}
