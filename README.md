# Dynamics Calculator

A browser-based physics simulation and calculator for visualizing **Projectile**, **Circular**, and **Spring** motion — with real-time animation, vector data tables, and live metrics.

---

## Preview

> Add here after capturing the simulator in action.
> <video controls src="20260604-1254-09.6634699.mp4" title="Title"></video>

---

## Overview

Dynamics Calculator is a vanilla JavaScript physics tool that lets you configure motion parameters, watch an animated simulation on canvas, and read instantaneous vector data in real time. Designed for students, educators, and anyone curious about classical mechanics.

---

## Modes

| Mode | Description |
|------|-------------|
| **Projectile** | Simulate launch angle, initial velocity, and gravity to trace a trajectory arc |
| **Circular** | Visualize uniform circular motion with radius, speed, and angular velocity |
| **Spring** | Model simple harmonic motion using spring constant, mass, and displacement |

---

## Features

- **Live canvas animation** — real-time physics rendered frame-by-frame on an HTML5 `<canvas>`
- **Play / Pause control** — pause the simulation at any moment to inspect state
- **Reset** — restart the simulation with current parameters instantly
- **Real-time metrics panel** — live readout of key physics quantities as the simulation runs
- **Instantaneous vector data table** — timestamped position, velocity, and acceleration vectors
- **Mode switching** — seamlessly switch between Projectile, Circular, and Spring modes
- **Dynamic input fields** — sidebar inputs update automatically per selected motion type

---

## Tech Stack

- Vanilla HTML, CSS, JavaScript (no framework or build step)
- HTML5 Canvas API for rendering
- Tabler Icons (`ti` icon font)

---

## File Structure

```
├── index.html   # App shell, layout, and canvas
├── style.css    # Styles and theme variables
└── script.js    # Physics engine, animation loop, and UI logic
```

---

## Getting Started

No installation or build step required — just open in a browser.

```bash
# Option 1: Open directly
open index.html
```

---

## Usage

1. Select a **motion type** from the sidebar tabs — Projectile, Circular, or Spring.
2. Adjust the **input parameters** that appear in the sidebar for your chosen mode.
3. Watch the **canvas animation** update in real time.
4. Use **Pause** to freeze the simulation and inspect the current state.
5. Use **Reset** to restart with the same parameters.
6. Read live values from the **Real-time Metrics** panel and the **Vector Data** table below the canvas.

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

---

## License

MIT — see [LICENSE](./LICENSE) for details.
