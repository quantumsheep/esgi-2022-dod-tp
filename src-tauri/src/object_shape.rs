use crate::{
    coordinates::{Coordinates, MinMaxCoordinates},
    shape::{FilterResult, OccupationResult},
};
use rayon::prelude::*;

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

pub fn object_occupation(shapes: Vec<ObjectShapeKind>, threads: usize) -> OccupationResult {
    fn fold(coordinates: MinMaxCoordinates, shape: &ObjectShapeKind) -> MinMaxCoordinates {
        match shape {
            ObjectShapeKind::Circle(circle) => coordinates.min_max(&MinMaxCoordinates::from(
                Coordinates::new(circle.base.x - circle.radius, circle.base.y - circle.radius),
                Coordinates::new(circle.base.x + circle.radius, circle.base.y + circle.radius),
            )),
            ObjectShapeKind::Rectangle(rectangle) => coordinates.min_max(&MinMaxCoordinates::from(
                Coordinates::new(rectangle.base.x, rectangle.base.y),
                Coordinates::new(
                    rectangle.base.x + rectangle.width,
                    rectangle.base.y + rectangle.height,
                ),
            )),
        }
    }

    let coordinates;
    let start = std::time::Instant::now();

    if threads > 0 {
        let pool = rayon::ThreadPoolBuilder::new()
            .num_threads(threads)
            .build()
            .unwrap();

        coordinates = pool.install(|| {
            shapes
                .par_iter()
                .fold(|| MinMaxCoordinates::new(), fold)
                .reduce(|| MinMaxCoordinates::new(), |a, b| a.min_max(&b))
        });
    } else {
        coordinates = shapes.iter().fold(MinMaxCoordinates::new(), fold);
    }

    OccupationResult {
        occupation: coordinates.area(),
        elapsed: start.elapsed().as_secs_f64() * 1000.0,
    }
}

pub fn object_filter(
    shapes: Vec<ObjectShapeKind>,
    kind: String,
    threads: usize,
) -> FilterResult<ObjectShapeKind> {
    let kind = kind.to_lowercase();
    let is_circle = kind == "circle";
    let is_rectangle = kind == "rectangle";

    let filter = |shape: &ObjectShapeKind| -> bool {
        match shape {
            ObjectShapeKind::Circle(_) => is_circle,
            ObjectShapeKind::Rectangle(_) => is_rectangle,
        }
    };

    let filtered;
    let start = std::time::Instant::now();

    if threads > 0 {
        let pool = rayon::ThreadPoolBuilder::new()
            .num_threads(threads)
            .build()
            .unwrap();

        filtered = pool.install(|| shapes.into_par_iter().filter(filter).collect());
    } else {
        filtered = shapes.into_iter().filter(|a| filter(a)).collect();
    }

    FilterResult::<ObjectShapeKind> {
        filtered,
        elapsed: start.elapsed().as_secs_f64() * 1000.0,
    }
}
