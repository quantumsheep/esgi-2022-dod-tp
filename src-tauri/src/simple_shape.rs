#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub enum SimpleShapeKind {
    Circle(SimpleCircle),
    Rectangle(SimpleRectangle),
}

pub trait SimpleShape {
    fn rectangular_area(self: &Self) -> f64;
}

#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct SimpleCircle {
    pub x: f64,
    pub y: f64,

    pub radius: f64,
}

impl SimpleShape for SimpleCircle {
    fn rectangular_area(self: &Self) -> f64 {
        let width = self.radius * 2.0;
        return width * width;
    }
}

#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct SimpleRectangle {
    pub x: f64,
    pub y: f64,

    pub width: f64,
    pub height: f64,
}

impl SimpleShape for SimpleRectangle {
    fn rectangular_area(self: &Self) -> f64 {
        return self.width * self.height;
    }
}
