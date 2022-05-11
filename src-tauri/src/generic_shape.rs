#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub enum GenericShapeKind {
    Circle(GenericShape<GenericCircle>),
    Rectangle(GenericShape<GenericRectangle>),
}

#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct GenericShape<T> {
    pub x: f64,
    pub y: f64,
    pub color: String,

    pub child: T,
}

#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct GenericCircle {
    pub radius: f64,
}

#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct GenericRectangle {
    pub width: f64,
    pub height: f64,
}
