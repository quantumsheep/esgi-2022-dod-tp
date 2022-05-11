#[derive(Clone, serde::Serialize)]
pub struct OccupationResult {
    pub occupation: f64,
    pub elapsed: f64,
}

#[derive(Clone, serde::Serialize)]
pub struct FilterResult<T> {
    pub filtered: Vec<T>,
    pub elapsed: f64,
}

#[derive(Clone, serde::Serialize)]
pub struct MutationResult<T> {
    pub values: Vec<T>,
    pub elapsed: f64,
}
