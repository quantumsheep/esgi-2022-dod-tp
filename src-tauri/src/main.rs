#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod coordinates;
mod generic_shape;
mod object_shape;
mod shape;
mod simple_shape;

use generic_shape::GenericShapeKind;
use object_shape::ObjectShapeKind;
use shape::{FilterResult, OccupationResult};
use simple_shape::SimpleShapeKind;

#[tauri::command]
async fn simple_occupation(shapes: Vec<SimpleShapeKind>, threads: usize) -> OccupationResult {
    simple_shape::simple_occupation(shapes, threads)
}

#[tauri::command]
async fn simple_filter(
    shapes: Vec<SimpleShapeKind>,
    kind: String,
    threads: usize,
) -> FilterResult<SimpleShapeKind> {
    simple_shape::simple_filter(shapes, kind, threads)
}

#[tauri::command]
async fn object_occupation(shapes: Vec<ObjectShapeKind>, threads: usize) -> OccupationResult {
    object_shape::object_occupation(shapes, threads)
}

#[tauri::command]
async fn object_filter(
    shapes: Vec<ObjectShapeKind>,
    kind: String,
    threads: usize,
) -> FilterResult<ObjectShapeKind> {
    object_shape::object_filter(shapes, kind, threads)
}

#[tauri::command]
async fn generic_occupation(shapes: Vec<GenericShapeKind>, threads: usize) -> OccupationResult {
    generic_shape::generic_occupation(shapes, threads)
}

#[tauri::command]
async fn generic_filter(
    shapes: Vec<GenericShapeKind>,
    kind: String,
    threads: usize,
) -> FilterResult<GenericShapeKind> {
    generic_shape::generic_filter(shapes, kind, threads)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            simple_occupation,
            simple_filter,
            object_occupation,
            object_filter,
            generic_occupation,
            generic_filter,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
