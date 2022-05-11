#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod simple_shape;

use simple_shape::{SimpleShape, SimpleShapeKind};

#[derive(Clone, serde::Serialize)]
pub struct SimpleOccupationResult {
    pub occupation: f64,
    pub elapsed: f64,
}

#[tauri::command]
async fn simple_occupation(shapes: Vec<SimpleShapeKind>) -> SimpleOccupationResult {
    let start = std::time::Instant::now();

    let occupation = shapes.iter().fold(0.0, |acc, shape| {
        acc + match shape {
            SimpleShapeKind::Circle(circle) => circle.rectangular_area(),
            SimpleShapeKind::Rectangle(rectangle) => rectangle.rectangular_area(),
        }
    });

    SimpleOccupationResult {
        occupation,
        elapsed: start.elapsed().as_secs_f64() * 1000.0,
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![simple_occupation])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
