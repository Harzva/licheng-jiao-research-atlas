import { readdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import jsQR from "jsqr";
import { PNG } from "pngjs";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDir, "..");
const qrDir = resolve(root, "review/qr");
const pngFiles = (await readdir(qrDir)).filter((name) => name.endsWith(".png")).sort();
const failures = [];

for (const name of pngFiles) {
  const image = PNG.sync.read(await readFile(resolve(qrDir, name)));
  const pixels = new Uint8ClampedArray(image.data.buffer, image.data.byteOffset, image.data.byteLength);
  const decoded = jsQR(pixels, image.width, image.height, { inversionAttempts: "dontInvert" });
  if (!decoded?.data?.startsWith("https://harzva.github.io/")) {
    failures.push(`${name}: QR code did not decode to the public GitHub Pages site`);
  }
}

if (failures.length) {
  failures.forEach((failure) => console.error(failure));
  process.exit(1);
}

console.log(`QR verification passed for ${pngFiles.length} review figures.`);
