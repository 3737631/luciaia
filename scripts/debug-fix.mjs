import * as faceapi from '../node_modules/@vladmandic/face-api/dist/face-api.node-wasm.js';
import { Jimp } from 'jimp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const modelPath = path.join(__dirname, '..', 'node_modules', '@vladmandic', 'face-api', 'model');
const ROOT = path.resolve(__dirname, '..', 'public', 'girls');

const FILES = [
  { girl: "luna", file: "rubio_elegante_studio" },
  { girl: "luna", file: "rubio_fiesta_studio" },
  { girl: "luna", file: "pelirrojo_elegante_car-night" },
  { girl: "kira", file: "moreno_bikini-suave_beach-night" },
  { girl: "kira", file: "moreno_bikini-suave_studio" },
  { girl: "kira", file: "moreno_elegante_beach-night" },
  { girl: "kira", file: "moreno_elegante_studio" },
  { girl: "kira", file: "pelirrojo_bikini-suave_studio" },
  { girl: "sasha", file: "rosa_elegante_beach-night" },
];

async function imageToTensor(filePath) {
  const image = await Jimp.read(filePath);
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  const rgba = image.bitmap.data;
  const rgb = new Uint8Array(w * h * 3);
  for (let i = 0; i < w * h; i++) {
    rgb[i * 3] = rgba[i * 4];
    rgb[i * 3 + 1] = rgba[i * 4 + 1];
    rgb[i * 3 + 2] = rgba[i * 4 + 2];
  }
  const tensor3 = faceapi.tf.tensor3d(rgb, [h, w, 3]);
  const tensor4 = faceapi.tf.expandDims(tensor3, 0);
  return { tensor: tensor4, tensor3, width: w, height: h };
}

async function main() {
  await faceapi.tf.setBackend('wasm');
  await faceapi.tf.ready();
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);

  for (const entry of FILES) {
    const filePath = path.join(ROOT, entry.girl, `${entry.file}.jpg`);
    const { tensor, tensor3, width: w, height: h } = await imageToTensor(filePath);
    const result = await faceapi.detectAllFaces(tensor, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.1 }));
    faceapi.tf.dispose([tensor, tensor3]);

    const valid = result ? result.filter(r => r && r.box && typeof r.score === 'number') : [];
    const mx = 6;

    if (valid.length === 0) {
      console.log(`\n${entry.girl}/${entry.file}: NO_FACE`);
      continue;
    }

    console.log(`\n${entry.girl}/${entry.file}: ${valid.length} faces detected`);
    for (let i = 0; i < valid.length; i++) {
      const d = valid[i];
      const x = d.box.x.toFixed(0);
      const y = d.box.y.toFixed(0);
      const bw = d.box.width.toFixed(0);
      const bh = d.box.height.toFixed(0);
      const score = d.score.toFixed(3);
      const cutLeft = d.box.x < mx ? ' LEFT-CUT' : '';
      const cutTop = d.box.y < mx ? ' TOP-CUT' : '';
      const cutRight = d.box.x + d.box.width > w - mx ? ' RIGHT-CUT' : '';
      const cutBottom = d.box.y + d.box.height > h - mx ? ' BOT-CUT' : '';
      const cx = (d.box.x + d.box.width/2).toFixed(0);
      const cy = (d.box.y + d.box.height/2).toFixed(0);
      console.log(`  Face ${i}: box=(${x},${y},${bw},${bh}) center=(${cx},${cy}) img=${w}x${h} score=${score}${cutLeft}${cutTop}${cutRight}${cutBottom}`);
    }
  }
}

main().catch(console.error);
