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
use simple_shape::SimpleShapeKind;

#[derive(Clone, serde::Serialize)]
pub struct OccupationResult {
    pub occupation: f64,
    pub elapsed: f64,
}

#[tauri::command]
async fn simple_occupation(shapes: Vec<SimpleShapeKind>) -> OccupationResult {
    let start = std::time::Instant::now();

    let mut min_x = f64::MAX;
    let mut min_y = f64::MAX;
    let mut max_x = f64::MIN;
    let mut max_y = f64::MIN;

    for shape in shapes {
        match shape {
            SimpleShapeKind::Circle(circle) => {
                min_x = utils::min(min_x, circle.x - circle.radius);
                min_y = utils::min(min_y, circle.y - circle.radius);
                max_x = utils::max(max_x, circle.x + circle.radius);
                max_y = utils::max(max_y, circle.y + circle.radius);
            }
            SimpleShapeKind::Rectangle(rectangle) => {
                min_x = utils::min(min_x, rectangle.x);
                min_y = utils::min(min_y, rectangle.y);
                max_x = utils::max(max_x, rectangle.x + rectangle.width);
                max_y = utils::max(max_y, rectangle.y + rectangle.height);
            }
        }
    }

    OccupationResult {
        occupation: (max_x - min_x) * (max_y - min_y),
        elapsed: start.elapsed().as_secs_f64() * 1000.0,
    }
}

#[tauri::command]
async fn object_occupation(shapes: Vec<ObjectShapeKind>) -> OccupationResult {
    let start = std::time::Instant::now();

    let mut min_x = f64::MAX;
    let mut min_y = f64::MAX;
    let mut max_x = f64::MIN;
    let mut max_y = f64::MIN;

    for shape in shapes {
        match shape {
            ObjectShapeKind::Circle(circle) => {
                min_x = utils::min(min_x, circle.base.x - circle.radius);
                min_y = utils::min(min_y, circle.base.y - circle.radius);
                max_x = utils::max(max_x, circle.base.x + circle.radius);
                max_y = utils::max(max_y, circle.base.y + circle.radius);
            }
            ObjectShapeKind::Rectangle(rectangle) => {
                min_x = utils::min(min_x, rectangle.base.x);
                min_y = utils::min(min_y, rectangle.base.y);
                max_x = utils::max(max_x, rectangle.base.x + rectangle.width);
                max_y = utils::max(max_y, rectangle.base.y + rectangle.height);
            }
        }
    }

    OccupationResult {
        occupation: (max_x - min_x) * (max_y - min_y),
        elapsed: start.elapsed().as_secs_f64() * 1000.0,
    }
}

#[tauri::command]
async fn generic_occupation(shapes: Vec<GenericShapeKind>) -> OccupationResult {
    let start = std::time::Instant::now();

    let mut min_x = f64::MAX;
    let mut min_y = f64::MAX;
    let mut max_x = f64::MIN;
    let mut max_y = f64::MIN;

    for shape in shapes {
        match shape {
            GenericShapeKind::Circle(circle) => {
                min_x = utils::min(min_x, circle.x - circle.child.radius);
                min_y = utils::min(min_y, circle.y - circle.child.radius);
                max_x = utils::max(max_x, circle.x + circle.child.radius);
                max_y = utils::max(max_y, circle.y + circle.child.radius);
            }
            GenericShapeKind::Rectangle(rectangle) => {
                min_x = utils::min(min_x, rectangle.x);
                min_y = utils::min(min_y, rectangle.y);
                max_x = utils::max(max_x, rectangle.x + rectangle.child.width);
                max_y = utils::max(max_y, rectangle.y + rectangle.child.height);
            }
        }
    }

    OccupationResult {
        occupation: (max_x - min_x) * (max_y - min_y),
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
