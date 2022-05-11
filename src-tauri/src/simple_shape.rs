use crate::{
    coordinates::{Coordinates, MinMaxCoordinates},
    shape::{FilterResult, MutationResult, OccupationResult},
};
use rayon::prelude::*;

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

pub fn simple_occupation(shapes: Vec<SimpleShapeKind>, threads: usize) -> OccupationResult {
    fn fold(coordinates: MinMaxCoordinates, shape: &SimpleShapeKind) -> MinMaxCoordinates {
        match shape {
            SimpleShapeKind::Circle(circle) => coordinates.min_max(&MinMaxCoordinates::from(
                Coordinates::new(circle.x - circle.radius, circle.y - circle.radius),
                Coordinates::new(circle.x + circle.radius, circle.y + circle.radius),
            )),
            SimpleShapeKind::Rectangle(rectangle) => coordinates.min_max(&MinMaxCoordinates::from(
                Coordinates::new(rectangle.x, rectangle.y),
                Coordinates::new(
                    rectangle.x + rectangle.width,
                    rectangle.y + rectangle.height,
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

pub fn simple_filter(
    shapes: Vec<SimpleShapeKind>,
    kind: String,
    threads: usize,
) -> FilterResult<SimpleShapeKind> {
    let kind = kind.to_lowercase();
    let is_circle = kind == "circle";
    let is_rectangle = kind == "rectangle";

    let filter = |shape: &SimpleShapeKind| -> bool {
        match shape {
            SimpleShapeKind::Circle(_) => is_circle,
            SimpleShapeKind::Rectangle(_) => is_rectangle,
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

    FilterResult::<SimpleShapeKind> {
        filtered,
        elapsed: start.elapsed().as_secs_f64() * 1000.0,
    }
}

pub fn simple_mutation_circles_to_rectangles(
    shapes: Vec<SimpleShapeKind>,
    threads: usize,
) -> MutationResult<SimpleShapeKind> {
    fn map(shape: SimpleShapeKind) -> SimpleShapeKind {
        if let SimpleShapeKind::Circle(circle) = shape {
            SimpleShapeKind::Rectangle(SimpleRectangle {
                x: circle.x - circle.radius,
                y: circle.y - circle.radius,
                color: circle.color,
                width: circle.radius * 2.0,
                height: circle.radius * 2.0,
            })
        } else {
            shape
        }
    }

    let values;
    let start = std::time::Instant::now();

    if threads > 0 {
        let pool = rayon::ThreadPoolBuilder::new()
            .num_threads(threads)
            .build()
            .unwrap();

        values = pool.install(|| shapes.into_par_iter().map(map).collect());
    } else {
        values = shapes.into_iter().map(map).collect();
    }

    MutationResult::<SimpleShapeKind> {
        values,
        elapsed: start.elapsed().as_secs_f64() * 1000.0,
    }
}
