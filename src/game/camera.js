// Camera smoothing and zoom fitting.
import { WORLD_SIZE, START_MASS, radiusFromMass } from './constants';
import { state } from './state';

export function createCamera() {
  return {
    x: WORLD_SIZE / 2,
    y: WORLD_SIZE / 2,
    scale: 0.8,
    renderScale: 0.2,
    fixedScale: null,
    fixedZoomEnabled: false,
    smoothedMass: START_MASS,
    smoothedLargestMass: START_MASS,
    smoothedBoundsW: radiusFromMass(START_MASS) * 2,
    smoothedBoundsH: radiusFromMass(START_MASS) * 2,
  };
}

export function updateCamera(cam, player, dt, w, h) {
  if (!player.cells.length) return;

  let totalMass = 0;
  let largestMass = 0;
  let left = Infinity;
  let right = -Infinity;
  let top = Infinity;
  let bottom = -Infinity;
  let sumX = 0;
  let sumY = 0;

  for (const c of player.cells) {
    const r = radiusFromMass(c.mass);
    totalMass += c.mass;
    largestMass = Math.max(largestMass, c.mass);
    left = Math.min(left, c.x - r);
    right = Math.max(right, c.x + r);
    top = Math.min(top, c.y - r);
    bottom = Math.max(bottom, c.y + r);
    sumX += c.x;
    sumY += c.y;
  }

  const boundsCx = (left + right) * 0.5;
  const boundsCy = (top + bottom) * 0.5;
  const meanCx = sumX / player.cells.length;
  const meanCy = sumY / player.cells.length;
  const cx = boundsCx * 0.78 + meanCx * 0.22;
  const cy = boundsCy * 0.78 + meanCy * 0.22;
  const boundsW = Math.max(1, right - left);
  const boundsH = Math.max(1, bottom - top);

  // Smooth the measurements before calculating zoom. This stops sudden camera
  // jumps when mass is eaten, ejected, split or merged in a single frame.
  const massBlend = 1 - Math.exp(-dt * 2.8);
  const formationBlend = 1 - Math.exp(-dt * (boundsW > cam.smoothedBoundsW || boundsH > cam.smoothedBoundsH ? 7.2 : 2.35));
  cam.smoothedMass += (totalMass - cam.smoothedMass) * massBlend;
  cam.smoothedLargestMass += (largestMass - cam.smoothedLargestMass) * massBlend;
  cam.smoothedBoundsW += (boundsW - cam.smoothedBoundsW) * formationBlend;
  cam.smoothedBoundsH += (boundsH - cam.smoothedBoundsH) * formationBlend;

  const minDimension = Math.max(1, Math.min(w, h));
  const massRatio = Math.max(0.2, cam.smoothedMass / START_MASS);
  const massLog = Math.max(0, Math.min(2.6, Math.log2(Math.max(1, massRatio))));

  // Keep a comfortably large cell on screen at 5K, then zoom out continuously
  // as mass grows.
  const desiredTotalRadiusPx = minDimension * (0.185 + massLog * 0.006);
  const totalMassFit = desiredTotalRadiusPx / Math.max(1, radiusFromMass(cam.smoothedMass));
  const desiredLargestRadiusPx = minDimension * 0.205;
  const largestCellFit = desiredLargestRadiusPx / Math.max(1, radiusFromMass(cam.smoothedLargestMass));

  // Formation fit only zooms out when split cells actually spread apart.
  const splitCount = player.cells.length;
  const formationPadding = 1.32 + Math.min(0.22, Math.log2(Math.max(1, splitCount)) * 0.045);
  const fitX = w / Math.max(1, cam.smoothedBoundsW * formationPadding);
  const fitY = h / Math.max(1, cam.smoothedBoundsH * formationPadding);
  const massTarget = Math.max(0.038, Math.min(0.82, totalMassFit, largestCellFit, fitX, fitY));

  const profile = state.profile;
  const zoomMultiplier = Math.max(0.5, Math.min(1.8, Number(profile?.settings?.cameraZoom || 100) / 100));
  const fixedZoom = !!profile?.settings?.fixedCameraZoom;
  if (cam.fixedZoomEnabled !== fixedZoom || !Number.isFinite(cam.fixedScale)) {
    cam.fixedZoomEnabled = fixedZoom;
    cam.fixedScale = massTarget;
  }
  if (!fixedZoom) cam.fixedScale = massTarget;
  const target = Math.max(0.035, Math.min(1.45, (fixedZoom ? cam.fixedScale : massTarget) * zoomMultiplier));

  cam.x += (cx - cam.x) * (1 - Math.exp(-dt * 5.6));
  cam.y += (cy - cam.y) * (1 - Math.exp(-dt * 5.6));

  // Zoom out quickly enough to keep splits visible, but return inward slowly
  // and naturally after cells regroup or mass decreases.
  const zoomRate = target < cam.scale ? 5.6 : 1.65;
  cam.scale += (target - cam.scale) * (1 - Math.exp(-dt * zoomRate));

  // Culling uses the dynamic mass/formation scale before the manual zoom
  // multiplier, so the zoom slider changes presentation, not the render budget.
  cam.renderScale += (massTarget - cam.renderScale) * (1 - Math.exp(-dt * 4.5));
}