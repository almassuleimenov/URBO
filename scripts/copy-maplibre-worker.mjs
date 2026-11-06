// Копирует воркер MapLibre в public/, чтобы Turbopack не ломал его загрузку.
import fs from "node:fs";
const from = "node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs";
const to = "public/vendor/maplibre-gl-worker.mjs";
fs.mkdirSync("public/vendor", { recursive: true });
fs.copyFileSync(from, to);
console.log("maplibre worker →", to);
