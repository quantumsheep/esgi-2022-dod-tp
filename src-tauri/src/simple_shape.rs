use crate::shape::Shape;

#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub enum SimpleShapeKind {
    Circle(SimpleCircle),
    Rectangle(SimpleRectangle),
}

#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct SimpleCircle {
    pub x: f64,
    pub y: f64,
    pub color: String,

    pub radius: f64,
}

impl Shape for SimpleCircle {
    fn rectangular_area(self: &Self) -> f64 {
        let width = self.radius * 2.0;
        return width * width;
    }
}

#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct SimpleRectangle {
    pub x: f64,
    pub y: f64,
    pub color: String,

    pub width: f64,
    pub height: f64,
}

impl Shape for SimpleRectangle {
    fn rectangular_area(self: &Self) -> f64 {
        return self.width * self.height;
    }
}
