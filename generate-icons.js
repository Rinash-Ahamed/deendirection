#!/usr/bin/env node
/**
 * generate-icons.js
 * Run once after npm install to generate placeholder PNG icons.
 * Replace public/icons/icon-192.png and icon-512.png with your real logos.
 *
 * Usage: node generate-icons.js
 * Requires: npm install -g sharp  OR  npx sharp-cli
 */

import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx    = canvas.getContext('2d');

  // Background
  const bg = ctx.createRadialGradient(size/2, size*0.3, 0, size/2, size/2, size*0.7);
  bg.addColorStop(0, '#1A5C42');
  bg.addColorStop(1, '#0A0A0A');
  ctx.fillStyle = bg;
  ctx.roundRect(0, 0, size, size, size * 0.22);
  ctx.fill();

  const s = size / 120; // scale factor (design at 120)

  // Arch outline
  ctx.beginPath();
  ctx.moveTo(18*s, 128*s);
  ctx.lineTo(18*s, 62*s);
  ctx.quadraticCurveTo(18*s, 14*s, 60*s, 10*s);
  ctx.quadraticCurveTo(102*s, 14*s, 102*s, 62*s);
  ctx.lineTo(102*s, 128*s);
  ctx.closePath();
  ctx.strokeStyle = 'rgba(212,175,55,0.85)';
  ctx.lineWidth = 2.5 * s;
  ctx.stroke();
  ctx.fillStyle = 'rgba(212,175,55,0.05)';
  ctx.fill();

  // Compass circle
  ctx.beginPath();
  ctx.arc(60*s, 72*s, 22*s, 0, Math.PI*2);
  ctx.strokeStyle = 'rgba(212,175,55,0.75)';
  ctx.lineWidth = 1.8 * s;
  ctx.stroke();

  // North needle
  ctx.beginPath();
  ctx.moveTo(60*s, 50*s);
  ctx.lineTo(64*s, 72*s);
  ctx.lineTo(60*s, 68*s);
  ctx.lineTo(56*s, 72*s);
  ctx.closePath();
  ctx.fillStyle = '#D4AF37';
  ctx.fill();

  // Center dot
  ctx.beginPath();
  ctx.arc(60*s, 72*s, 3*s, 0, Math.PI*2);
  ctx.fillStyle = '#D4AF37';
  ctx.fill();

  // Base bar
  ctx.fillStyle = 'rgba(212,175,55,0.7)';
  ctx.roundRect(20*s, 126*s, 80*s, 3.5*s, 2*s);
  ctx.fill();

  return canvas;
}

const sizes = [192, 512];
const outDir = path.join(__dirname, 'public', 'icons');

for (const sz of sizes) {
  try {
    const canvas = drawIcon(sz);
    const buf = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(outDir, `icon-${sz}.png`), buf);
    console.log(`✓ Generated icon-${sz}.png`);
  } catch (e) {
    console.warn(`⚠ Could not generate icon-${sz}.png (canvas not available) — add your own PNG icons to public/icons/`);
  }
}
