import * as faceapi from '../node_modules/@vladmandic/face-api/dist/face-api.node-wasm.js';
import { Jimp } from 'jimp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const modelPath = path.join(__dirname, '..', 'node_modules', '@vladmandic', 'face-api', 'model');
const ROOT = path.resolve(__dirname, '..', 'public', 'girls');

const BAD_IMAGES = [
  { girl: "luna", file: "moreno_casual_neon-room" },
  { girl: "luna", file: "moreno_elegante_neon-room" },
  { girl: "luna", file: "moreno_fiesta_neon-room" },
  { girl: "luna", file: "pelirrojo_casual_studio" },
  { girl: "luna", file: "pelirrojo_elegante_neon-room" },
  { girl: "luna", file: "rubio_elegante_studio" },
  { girl: "luna", file: "rubio_fiesta_studio" },
  { girl: "luna", file: "moreno_elegante_beach-night" },
  { girl: "luna", file: "pelirrojo_elegante_car-night" },
  { girl: "luna", file: "rosa_elegante_neon-room" },
  { girl: "nia", file: "moreno_elegante_car-night" },
  { girl: "kira", file: "moreno_bikini-suave_beach-night" },
  { girl: "kira", file: "moreno_bikini-suave_studio" },
  { girl: "kira", file: "moreno_elegante_beach-night" },
  { girl: "kira", file: "moreno_elegante_studio" },
  { girl: "kira", file: "moreno_fiesta_beach-night" },
  { girl: "kira", file: "pelirrojo_bikini-suave_beach-night" },
  { girl: "kira", file: "pelirrojo_bikini-suave_studio" },
  { girl: "kira", file: "pelirrojo_elegante_beach-night" },
  { girl: "kira", file: "pelirrojo_elegante_studio" },
  { girl: "kira", file: "pelirrojo_fiesta_studio" },
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

  let passed = 0, failed = 0;
  for (const entry of BAD_IMAGES) {
    const filePath = path.join(ROOT, entry.girl, `${entry.file}.jpg`);
    if (!fs.existsSync(filePath)) { console.log(`  MISSING ${entry.girl}/${entry.file}`); failed++; continue; }
    const { tensor, tensor3, width: w, height: h } = await imageToTensor(filePath);
    const result = await faceapi.detectAllFaces(tensor, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.1 }));
    faceapi.tf.dispose([tensor, tensor3]);

    const valid = result ? result.filter(r => r && r.box && typeof r.score === 'number') : [];
    if (valid.length === 0) { console.log(`  ✗ ${entry.girl}/${entry.file}: no_face`); failed++; continue; }
    const highConf = valid.filter(r => r.score >= 0.4);
    if (highConf.length > 1) { console.log(`  ✗ ${entry.girl}/${entry.file}: multiple_faces(${highConf.length})`); failed++; continue; }
    if (highConf.length === 0) { console.log(`  ✗ ${entry.girl}/${entry.file}: no_highconf_face`); failed++; continue; }

    const box = highConf[0].box;
    const mx = 0.03;
    let issues = [];
    if (box.x < w * mx) issues.push('face_cut_left');
    if (box.y < h * mx) issues.push('face_cut_top');
    if (box.x + box.width > w * (1 - mx)) issues.push('face_cut_right');
    if (box.y + box.height > h * (1 - mx)) issues.push('face_cut_bottom');
    if (issues.length > 0) { console.log(`  ✗ ${entry.girl}/${entry.file}: ${issues.join(',')}`); failed++; continue; }

    console.log(`  ✓ ${entry.girl}/${entry.file} (conf=${valid[0].score.toFixed(3)})`);
    passed++;
  }

  console.log(`\n${passed} passed, ${failed} failed`);
}

main().catch(console.error);
