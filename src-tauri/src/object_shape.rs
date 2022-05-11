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

#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct ObjectRectangle {
    pub base: ObjectShape,

    pub width: f64,
    pub height: f64,
}
