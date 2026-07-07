import * as faceapi from '../node_modules/@vladmandic/face-api/dist/face-api.node-wasm.js';
import { Jimp } from 'jimp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const modelPath = path.join(__dirname, '..', 'node_modules', '@vladmandic', 'face-api', 'model');
const girlsDir = path.join(__dirname, '..', 'public', 'girls');

const GIRLS = ['luna', 'nia', 'vera', 'alma', 'kira', 'maya', 'sasha', 'yuki'];
const MARGIN_RATIO = 0.03;
const MIN_CONFIDENCE = 0.4;
const MULTI_FACE_MIN_CONFIDENCE = 0.4;

let badImages = [];

async function initBackend() {
  await faceapi.tf.setBackend('wasm');
  await faceapi.tf.ready();
  console.log('Backend:', faceapi.tf.getBackend());
}

async function loadModels() {
  await initBackend();
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
  console.log('Models loaded');
}

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

async function checkImage(filePath, girl) {
  try {
    const { tensor, tensor3, width: imgWidth, height: imgHeight } = await imageToTensor(filePath);

    const result = await faceapi
      .detectAllFaces(tensor, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.1 }))

    faceapi.tf.dispose([tensor, tensor3]);

    if (!result || result.length === 0) {
      return { bad: true, reason: 'no_face', confidence: 0 };
    }

    const validResults = result.filter(r => r && r.box && typeof r.score === 'number');
    if (validResults.length === 0) {
      return { bad: true, reason: 'no_valid_face', confidence: 0 };
    }

    const highConfResults = validResults.filter(r => r.score >= MULTI_FACE_MIN_CONFIDENCE);
    if (highConfResults.length > 1) {
      return { bad: true, reason: `multiple_faces(${highConfResults.length})`, confidence: highConfResults[0].score };
    }
    if (highConfResults.length === 0) {
      return { bad: true, reason: `no_highconf_face(max=${validResults[0].score.toFixed(3)})`, confidence: validResults[0].score };
    }

    const detection = highConfResults[0];
    const box = detection.box;
    const conf = detection.score;

    let issues = [];
    const mx = MARGIN_RATIO;

    if (conf < MIN_CONFIDENCE) {
      issues.push(`low_confidence(${conf.toFixed(3)})`);
    }

    if (box.x < imgWidth * mx) {
      issues.push('face_cut_left');
    }
    if (box.y < imgHeight * mx) {
      issues.push('face_cut_top');
    }
    if (box.x + box.width > imgWidth * (1 - mx)) {
      issues.push('face_cut_right');
    }
    if (box.y + box.height > imgHeight * (1 - mx)) {
      issues.push('face_cut_bottom');
    }

    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    const idealCenterX = imgWidth * 0.5;
    const idealCenterY = imgHeight * 0.4;
    const dx = Math.abs(centerX - idealCenterX) / imgWidth;
    const dy = Math.abs(centerY - idealCenterY) / imgHeight;
    if (dx > 0.2) {
      issues.push(`off_center_h(dx=${dx.toFixed(2)})`);
    }
    if (dy > 0.2) {
      issues.push(`off_center_v(dy=${dy.toFixed(2)})`);
    }

    if (issues.length > 0) {
      const detail = `conf=${conf.toFixed(3)} box=(${box.x.toFixed(0)},${box.y.toFixed(0)},${box.width.toFixed(0)},${box.height.toFixed(0)}) img=${imgWidth}x${imgHeight}`;
      return { bad: true, reason: issues.join(', '), confidence: conf, detail };
    }

    return { bad: false, confidence: conf };
  } catch (err) {
    return { bad: true, reason: `error: ${err.message}`, confidence: 0 };
  }
}

async function main() {
  console.log('Loading models...');
  await loadModels();

  for (const girl of GIRLS) {
    const dir = path.join(girlsDir, girl);
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg'));
    console.log(`\n=== ${girl} (${files.length}) ===`);
    let girlBad = 0;

    for (const file of files) {
      const filePath = path.join(dir, file);
      const combo = file.replace('.jpg', '');
      const result = await checkImage(filePath, girl);
      if (result.bad) {
        badImages.push({ girl, file: combo, ...result });
        girlBad++;
        console.log(`  ✗ ${combo}: ${result.reason}`);
      } else {
        process.stdout.write('.');
      }
    }
    if (girlBad === 0) console.log('  All OK');
  }

  console.log(`\n\n=== SUMMARY ===`);
  console.log(`Total bad images: ${badImages.length}`);

  const byGirl = {};
  for (const bi of badImages) {
    if (!byGirl[bi.girl]) byGirl[bi.girl] = [];
    byGirl[bi.girl].push(bi.file);
  }
  for (const [girl, files] of Object.entries(byGirl)) {
    console.log(`\n${girl} (${files.length}):`);
    for (const f of files) {
      console.log(`  ${f}`);
    }
  }

  const reportPath = path.join(__dirname, '..', 'bad-images.json');
  fs.writeFileSync(reportPath, JSON.stringify(badImages, null, 2));
  console.log(`\nReport saved to bad-images.json`);
}

main().catch(console.error);
