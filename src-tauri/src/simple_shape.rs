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

#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct SimpleRectangle {
    pub x: f64,
    pub y: f64,
    pub color: String,

    pub width: f64,
    pub height: f64,
}
