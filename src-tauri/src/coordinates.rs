pub struct Coordinates {
    pub x: f64,
    pub y: f64,
}

impl Coordinates {
    pub fn new(x: f64, y: f64) -> Self {
        Self { x, y }
    }
}

pub struct MinMaxCoordinates {
    pub min: Coordinates,
    pub max: Coordinates,
}

impl MinMaxCoordinates {
    pub fn new() -> MinMaxCoordinates {
        MinMaxCoordinates {
            min: Coordinates::new(f64::MAX, f64::MAX),
            max: Coordinates::new(f64::MIN, f64::MIN),
        }
    }

    pub fn from(min: Coordinates, max: Coordinates) -> MinMaxCoordinates {
        MinMaxCoordinates { min, max }
    }

    pub fn min_max(&self, other: &MinMaxCoordinates) -> MinMaxCoordinates {
        MinMaxCoordinates {
            min: Coordinates::new(min(self.min.x, other.min.x), min(self.min.y, other.min.y)),
            max: Coordinates::new(max(self.max.x, other.max.x), max(self.max.y, other.max.y)),
        }
    }

    pub fn area(&self) -> f64 {
        (self.max.x - self.min.x) * (self.max.y - self.min.y)
    }
}

fn min<T: PartialOrd>(a: T, b: T) -> T {
    if a < b {
        a
    } else {
        b
    }
}

fn max<T: PartialOrd>(a: T, b: T) -> T {
    if a > b {
        a
    } else {
        b
    }
}
