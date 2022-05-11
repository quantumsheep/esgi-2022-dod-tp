#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod generic_shape;
mod object_shape;
mod simple_shape;
mod utils;

use generic_shape::GenericShapeKind;
use object_shape::ObjectShapeKind;
use rayon::prelude::*;
use simple_shape::SimpleShapeKind;
use utils::{Coordinates, MinMaxCoordinates};

#[derive(Clone, serde::Serialize)]
pub struct OccupationResult {
    pub occupation: f64,
    pub elapsed: f64,
}

#[tauri::command]
async fn simple_occupation(shapes: Vec<SimpleShapeKind>, threads: usize) -> OccupationResult {
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

    let mut coordinates = MinMaxCoordinates::new();
    let start = std::time::Instant::now();

    if threads > 1 {
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
        coordinates = shapes.iter().fold(coordinates, fold);
    }

    OccupationResult {
        occupation: coordinates.area(),
        elapsed: start.elapsed().as_secs_f64() * 1000.0,
    }
}

#[tauri::command]
async fn object_occupation(shapes: Vec<ObjectShapeKind>, threads: usize) -> OccupationResult {
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

    let mut coordinates = MinMaxCoordinates::new();
    let start = std::time::Instant::now();

    if threads > 1 {
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
        coordinates = shapes.iter().fold(coordinates, fold);
    }

    OccupationResult {
        occupation: coordinates.area(),
        elapsed: start.elapsed().as_secs_f64() * 1000.0,
    }
}

#[tauri::command]
async fn generic_occupation(shapes: Vec<GenericShapeKind>, threads: usize) -> OccupationResult {
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

    let mut coordinates = MinMaxCoordinates::new();
    let start = std::time::Instant::now();

    if threads > 1 {
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
        coordinates = shapes.iter().fold(coordinates, fold);
    }

    OccupationResult {
        occupation: coordinates.area(),
        elapsed: start.elapsed().as_secs_f64() * 1000.0,
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            simple_occupation,
            object_occupation,
            generic_occupation,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
