use crate::{
    coordinates::{Coordinates, MinMaxCoordinates},
    shape::{FilterResult, MutationResult, OccupationResult},
};
use rayon::prelude::*;

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

pub fn generic_occupation(shapes: Vec<GenericShapeKind>, threads: usize) -> OccupationResult {
    fn fold(coordinates: MinMaxCoordinates, shape: &GenericShapeKind) -> MinMaxCoordinates {
        match shape {
            GenericShapeKind::Circle(circle) => coordinates.min_max(&MinMaxCoordinates::from(
                Coordinates::new(
                    circle.x - circle.child.radius,
                    circle.y - circle.child.radius,
                ),
                Coordinates::new(
                    circle.x + circle.child.radius,
                    circle.y + circle.child.radius,
                ),
            )),
            GenericShapeKind::Rectangle(rectangle) => {
                coordinates.min_max(&MinMaxCoordinates::from(
                    Coordinates::new(rectangle.x, rectangle.y),
                    Coordinates::new(
                        rectangle.x + rectangle.child.width,
                        rectangle.y + rectangle.child.height,
                    ),
                ))
            }
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

pub fn generic_filter(
    shapes: Vec<GenericShapeKind>,
    kind: String,
    threads: usize,
) -> FilterResult<GenericShapeKind> {
    let kind = kind.to_lowercase();
    let is_circle = kind == "circle";
    let is_rectangle = kind == "rectangle";

    let filter = |shape: &GenericShapeKind| -> bool {
        match shape {
            GenericShapeKind::Circle(_) => is_circle,
            GenericShapeKind::Rectangle(_) => is_rectangle,
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

    FilterResult::<GenericShapeKind> {
        filtered,
        elapsed: start.elapsed().as_secs_f64() * 1000.0,
    }
}

pub fn generic_mutation_circles_to_rectangles(
    shapes: Vec<GenericShapeKind>,
    threads: usize,
) -> MutationResult<GenericShapeKind> {
    fn map(shape: GenericShapeKind) -> GenericShapeKind {
        if let GenericShapeKind::Circle(circle) = shape {
            GenericShapeKind::Rectangle(GenericShape::<GenericRectangle> {
                x: circle.x - circle.child.radius,
                y: circle.y - circle.child.radius,
                color: circle.color,
                child: GenericRectangle {
                    width: circle.child.radius * 2.0,
                    height: circle.child.radius * 2.0,
                },
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

    MutationResult::<GenericShapeKind> {
        values,
        elapsed: start.elapsed().as_secs_f64() * 1000.0,
    }
}
