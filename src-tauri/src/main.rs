#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod generic_shape;
mod object_shape;
mod shape;
mod simple_shape;

use generic_shape::GenericShapeKind;
use object_shape::ObjectShapeKind;
use shape::Shape;
use simple_shape::SimpleShapeKind;

#[derive(Clone, serde::Serialize)]
pub struct OccupationResult {
    pub occupation: f64,
    pub elapsed: f64,
}

#[tauri::command]
async fn simple_occupation(shapes: Vec<SimpleShapeKind>) -> OccupationResult {
    let start = std::time::Instant::now();

    let occupation = shapes.iter().fold(0.0, |acc, shape| {
        acc + match shape {
            SimpleShapeKind::Circle(circle) => circle.rectangular_area(),
            SimpleShapeKind::Rectangle(rectangle) => rectangle.rectangular_area(),
        }
    });

    OccupationResult {
        occupation,
        elapsed: start.elapsed().as_secs_f64() * 1000.0,
    }
}

#[tauri::command]
async fn object_occupation(shapes: Vec<ObjectShapeKind>) -> OccupationResult {
    let start = std::time::Instant::now();

    let occupation = shapes.iter().fold(0.0, |acc, shape| {
        acc + match shape {
            ObjectShapeKind::Circle(circle) => circle.rectangular_area(),
            ObjectShapeKind::Rectangle(rectangle) => rectangle.rectangular_area(),
        }
    });

    OccupationResult {
        occupation,
        elapsed: start.elapsed().as_secs_f64() * 1000.0,
    }
}

#[tauri::command]
async fn generic_occupation(shapes: Vec<GenericShapeKind>) -> OccupationResult {
    let start = std::time::Instant::now();

    let occupation = shapes.iter().fold(0.0, |acc, shape| {
        acc + match shape {
            GenericShapeKind::Circle(circle) => circle.rectangular_area(),
            GenericShapeKind::Rectangle(rectangle) => rectangle.rectangular_area(),
        }
    });

    OccupationResult {
        occupation,
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
