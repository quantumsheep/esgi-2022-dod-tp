/**
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function random(min, max) {
  return Math.random() * (max - min) + min;
}

const kinds = ["Circle", "Rectangle"];
const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"];

const shapes = [];

for (let i = 0; i < 1000; i++) {
  const kind = kinds[Math.floor(random(0, kinds.length))];

  if (kind === "Circle") {
    shapes.push({
      Circle: {
        x: random(0, 900),
        y: random(0, 450),
        color: colors[Math.floor(random(0, colors.length))],
        radius: random(10, 50),
      },
    });
  } else if (kind === "Rectangle") {
    shapes.push({
      Rectangle: {
        x: random(0, 900),
        y: random(0, 450),
        color: colors[Math.floor(random(0, colors.length))],
        width: random(20, 100),
        height: random(20, 100),
      },
    });
  }
}

console.log(JSON.stringify({ shapes }, null, 4));
