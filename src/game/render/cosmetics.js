// Cosmetic rendering: hats, overlays and premium cosmetic art.
import { TAU } from '../utils';
import { findCosmetic, getDefaultCosmeticTransform } from '../skins';

export function drawFivePointStar(ctx, x, y, outer, inner, rotation = -Math.PI / 2) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = rotation + i * Math.PI / 5;
    const rr = i % 2 === 0 ? outer : inner;
    const px = x + Math.cos(a) * rr;
    const py = y + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

export function getCosmeticLayer(item, transform) {
  const explicit = transform?.layer;
  if (explicit === 'back' || explicit === 'front') return explicit;
  return 'front';
}

export function getCosmeticRenderEntries(p, drawLayer = null) {
  const equipped = { hat: null, overlay: null, ...(p?.equippedCosmetics || {}) };
  const transforms = p?.cosmeticTransforms || {};
  const preview = p?.cosmeticPreview || null;
  if (preview?.id) {
    const item = findCosmetic(preview.id);
    if (item) equipped[item.slot] = item.id;
  }
  return ['overlay', 'hat'].map((slot) => {
    const id = equipped[slot];
    const item = findCosmetic(id);
    if (!item) return null;
    const transform = preview?.id === id
      ? { ...getDefaultCosmeticTransform(item), ...(preview.transform || {}) }
      : { ...getDefaultCosmeticTransform(item), ...(transforms[id] || {}) };
    return { item, transform, layer: getCosmeticLayer(item, transform) };
  }).filter((entry) => entry && (!drawLayer || entry.layer === drawLayer));
}

function drawPremiumCosmeticArt(ctx, item, u, t) {
  const type = item?.type;
  if (!['celestialCrown','dragonHorns','holoCap','trollFace','laserEyes','oniMask','galaxySmile','dragonRing','chronoRing','angelRing','cosmicWings','shadowFlames','oceanAura','meteorShower','pixelGlitch','musicNotes'].includes(type)) return false;

  if (type === 'celestialCrown') {
    ctx.shadowColor='#fde68a'; ctx.shadowBlur=u*.13; ctx.lineWidth=Math.max(1.5,u*.022); ctx.strokeStyle='#92400e';
    const g=ctx.createLinearGradient(0,-u*.42,0,u*.22); g.addColorStop(0,'#fff7c2'); g.addColorStop(.45,'#facc15'); g.addColorStop(1,'#f59e0b'); ctx.fillStyle=g;
    ctx.beginPath(); ctx.moveTo(-u*.38,u*.17); ctx.lineTo(-u*.30,-u*.18); ctx.lineTo(-u*.13,u*.01); ctx.lineTo(0,-u*.38); ctx.lineTo(u*.14,u*.01); ctx.lineTo(u*.31,-u*.2); ctx.lineTo(u*.39,u*.17); ctx.lineTo(u*.31,u*.28); ctx.lineTo(-u*.31,u*.28); ctx.closePath(); ctx.fill(); ctx.stroke();
    for (const [x,col] of [[-.22,'#38bdf8'],[0,'#f472b6'],[.22,'#a78bfa']]) { ctx.fillStyle=col; drawFivePointStar(ctx,x*u,u*.12,u*.055,u*.025,t*.3); ctx.fill(); }
  } else if (type === 'dragonHorns') {
    ctx.lineWidth=Math.max(2,u*.025); ctx.strokeStyle='#14532d'; ctx.shadowColor='#4ade80'; ctx.shadowBlur=u*.08;
    for (const sx of [-1,1]) { const g=ctx.createLinearGradient(sx*u*.05,0,sx*u*.42,-u*.48); g.addColorStop(0,'#166534'); g.addColorStop(.5,'#4ade80'); g.addColorStop(1,'#d9f99d'); ctx.fillStyle=g; ctx.beginPath(); ctx.moveTo(sx*u*.08,u*.18); ctx.bezierCurveTo(sx*u*.18,-u*.08,sx*u*.48,-u*.2,sx*u*.38,-u*.5); ctx.bezierCurveTo(sx*u*.18,-u*.33,sx*u*.02,-u*.12,sx*u*.01,u*.16); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  } else if (type === 'holoCap') {
    ctx.shadowColor='#22d3ee'; ctx.shadowBlur=u*.1; ctx.lineWidth=Math.max(2,u*.022); ctx.strokeStyle='#a5f3fc';
    const g=ctx.createLinearGradient(-u*.32,-u*.3,u*.32,u*.22); g.addColorStop(0,'rgba(34,211,238,.92)'); g.addColorStop(.5,'rgba(99,102,241,.78)'); g.addColorStop(1,'rgba(244,114,182,.88)'); ctx.fillStyle=g;
    ctx.beginPath(); ctx.arc(0,0,u*.31,Math.PI,TAU); ctx.lineTo(u*.31,u*.11); ctx.lineTo(-u*.31,u*.11); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(u*.14,u*.12,u*.34,u*.085,-.08,0,TAU); ctx.fill(); ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.75)'; ctx.beginPath(); ctx.arc(0,-u*.01,u*.22,Math.PI*1.08,Math.PI*1.9); ctx.stroke();
  } else if (type === 'trollFace') {
    ctx.shadowColor='rgba(255,255,255,.38)'; ctx.shadowBlur=u*.04; ctx.fillStyle='rgba(255,255,255,.95)'; ctx.strokeStyle='#050505'; ctx.lineWidth=Math.max(2,u*.027);
    ctx.beginPath(); ctx.moveTo(-u*.38,-u*.15); ctx.bezierCurveTo(-u*.32,-u*.42,u*.22,-u*.45,u*.38,-u*.15); ctx.bezierCurveTo(u*.48,u*.08,u*.25,u*.37,-u*.02,u*.38); ctx.bezierCurveTo(-u*.32,u*.39,-u*.47,u*.12,-u*.38,-u*.15); ctx.fill(); ctx.stroke();
    ctx.fillStyle='#fff'; for (const sx of [-1,1]) { ctx.beginPath(); ctx.ellipse(sx*u*.17,-u*.13,u*.10,u*.075,sx*.18,0,TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle='#050505'; ctx.beginPath(); ctx.arc(sx*u*.16,-u*.12,u*.025,0,TAU); ctx.fill(); ctx.fillStyle='#fff'; }
    ctx.beginPath(); ctx.moveTo(-u*.28,u*.02); ctx.bezierCurveTo(-u*.08,u*.24,u*.23,u*.23,u*.32,-u*.01); ctx.bezierCurveTo(u*.17,u*.37,-u*.17,u*.39,-u*.31,u*.08); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle='#111'; ctx.lineWidth=Math.max(1,u*.014); for (let i=-2;i<=2;i++) { const x=i*u*.095; ctx.beginPath(); ctx.moveTo(x,u*.14); ctx.lineTo(x+u*.02,u*.29); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(-u*.28,-u*.25); ctx.quadraticCurveTo(-u*.15,-u*.34,-u*.03,-u*.26); ctx.moveTo(u*.05,-u*.26); ctx.quadraticCurveTo(u*.2,-u*.35,u*.31,-u*.22); ctx.stroke();
  } else if (type === 'laserEyes') {
    ctx.globalCompositeOperation='screen'; ctx.lineCap='round';
    for (const sx of [-1,1]) { const x=sx*u*.19; const beam=ctx.createLinearGradient(x,0,sx*u*.64,u*.08); beam.addColorStop(0,'#fff'); beam.addColorStop(.16,'#fb7185'); beam.addColorStop(1,'rgba(239,68,68,0)'); ctx.strokeStyle=beam; ctx.shadowColor='#ef4444'; ctx.shadowBlur=u*.14; ctx.lineWidth=Math.max(4,u*.075); ctx.beginPath(); ctx.moveTo(x,-u*.06); ctx.lineTo(sx*u*.68,u*.07+Math.sin(t*8+sx)*u*.018); ctx.stroke(); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(x,-u*.06,u*.07,0,TAU); ctx.fill(); }
  } else if (type === 'oniMask') {
    ctx.shadowColor='#f43f5e'; ctx.shadowBlur=u*.1; ctx.lineWidth=Math.max(2,u*.025); ctx.strokeStyle='#450a0a'; ctx.fillStyle='#dc2626';
    ctx.beginPath(); ctx.moveTo(-u*.33,-u*.2); ctx.quadraticCurveTo(0,-u*.43,u*.33,-u*.2); ctx.lineTo(u*.28,u*.22); ctx.lineTo(0,u*.38); ctx.lineTo(-u*.28,u*.22); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle='#fef3c7'; for (const sx of [-1,1]) { ctx.beginPath(); ctx.moveTo(sx*u*.18,-u*.22); ctx.lineTo(sx*u*.34,-u*.43); ctx.lineTo(sx*u*.29,-u*.12); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    ctx.fillStyle='#fde047'; for (const sx of [-1,1]) { ctx.beginPath(); ctx.moveTo(sx*u*.24,-u*.08); ctx.lineTo(sx*u*.07,-u*.02); ctx.lineTo(sx*u*.23,u*.03); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle='#fff'; for (let i=-2;i<=2;i++) { const x=i*u*.09; ctx.beginPath(); ctx.moveTo(x,u*.16); ctx.lineTo(x+u*.035,u*.29); ctx.lineTo(x-u*.025,u*.29); ctx.closePath(); ctx.fill(); }
  } else if (type === 'galaxySmile') {
    const hue=(t*45)%360; ctx.shadowColor=`hsl(${hue} 95% 70%)`; ctx.shadowBlur=u*.13; ctx.strokeStyle=`hsl(${hue} 95% 72%)`; ctx.lineWidth=Math.max(3,u*.04); ctx.lineCap='round';
    for (const sx of [-1,1]) { ctx.beginPath(); ctx.arc(sx*u*.19,-u*.08,u*.055,0,TAU); ctx.stroke(); }
    ctx.beginPath(); ctx.arc(0,-u*.03,u*.30,.18*Math.PI,.82*Math.PI); ctx.stroke();
    for (let i=0;i<9;i++) { const a=i*2.4+t*.3; const d=u*(.14+(i%4)*.1); ctx.fillStyle=i%2?'#f9a8d4':'#67e8f9'; drawFivePointStar(ctx,Math.cos(a)*d,Math.sin(a)*d,u*.025,u*.011,a); ctx.fill(); }
  } else if (type === 'dragonRing') {
    ctx.shadowColor='#4ade80'; ctx.shadowBlur=u*.1; ctx.strokeStyle='#22c55e'; ctx.lineWidth=Math.max(4,u*.055); ctx.beginPath(); ctx.arc(0,0,u*.59,.2,TAU-.2); ctx.stroke();
    for (let i=0;i<12;i++) { const a=i/12*TAU+t*.08; ctx.fillStyle=i%2?'#86efac':'#15803d'; ctx.beginPath(); ctx.arc(Math.cos(a)*u*.59,Math.sin(a)*u*.59,u*.035,0,TAU); ctx.fill(); }
    ctx.save(); ctx.translate(u*.56,-u*.18); ctx.rotate(.55); ctx.fillStyle='#a3e635'; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(u*.18,-u*.08); ctx.lineTo(u*.12,u*.08); ctx.closePath(); ctx.fill(); ctx.restore();
  } else if (type === 'chronoRing') {
    ctx.shadowColor='#22d3ee'; ctx.shadowBlur=u*.1; ctx.lineWidth=Math.max(2,u*.024); ctx.strokeStyle='#67e8f9'; ctx.beginPath(); ctx.arc(0,0,u*.6,0,TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(0,0,u*.49,0,TAU); ctx.stroke();
    for (let i=0;i<12;i++) { const a=i/12*TAU+t*.12; ctx.save(); ctx.rotate(a); ctx.fillStyle=i%3===0?'#f8fafc':'#0ea5e9'; ctx.fillRect(u*.5,-u*.018,u*(i%3===0?.13:.08),u*.036); ctx.restore(); }
    ctx.strokeStyle='#fff'; ctx.lineWidth=Math.max(2,u*.028); ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(t*.8)*u*.31,Math.sin(t*.8)*u*.31); ctx.moveTo(0,0); ctx.lineTo(Math.cos(-t*1.7)*u*.22,Math.sin(-t*1.7)*u*.22); ctx.stroke();
  } else if (type === 'angelRing') {
    ctx.globalCompositeOperation='screen'; ctx.shadowColor='#fde68a'; ctx.shadowBlur=u*.13; ctx.lineWidth=Math.max(3,u*.035); ctx.strokeStyle='rgba(255,248,210,.95)'; ctx.beginPath(); ctx.arc(0,0,u*.58,0,TAU); ctx.stroke(); ctx.strokeStyle='#facc15'; ctx.lineWidth=Math.max(1.5,u*.018); ctx.beginPath(); ctx.arc(0,0,u*.68,0,TAU); ctx.stroke();
    for (let i=0;i<8;i++) { const a=i/8*TAU-t*.05; ctx.fillStyle='#fff7ed'; drawFivePointStar(ctx,Math.cos(a)*u*.63,Math.sin(a)*u*.63,u*.04,u*.016,a); ctx.fill(); }
  } else if (type === 'cosmicWings') {
    ctx.globalCompositeOperation='screen'; ctx.shadowColor='#a78bfa'; ctx.shadowBlur=u*.12; ctx.lineWidth=Math.max(2,u*.022);
    for (const sx of [-1,1]) { for (let i=0;i<5;i++) { const y=(i-2)*u*.1; const g=ctx.createLinearGradient(sx*u*.18,y,sx*u*.78,y-u*.12); g.addColorStop(0,'rgba(129,140,248,.25)'); g.addColorStop(.55,'rgba(167,139,250,.8)'); g.addColorStop(1,'rgba(103,232,249,.08)'); ctx.fillStyle=g; ctx.strokeStyle='rgba(196,181,253,.7)'; ctx.beginPath(); ctx.moveTo(sx*u*.13,y); ctx.quadraticCurveTo(sx*u*.48,y-u*.22,sx*u*(.72+i*.025),y-u*.1); ctx.quadraticCurveTo(sx*u*.45,y+u*.08,sx*u*.13,y); ctx.fill(); ctx.stroke(); } }
  } else if (type === 'shadowFlames') {
    ctx.globalCompositeOperation='screen'; for (let i=0;i<16;i++) { const a=i/16*TAU+t*.11; const base=u*.55; const h=u*(.15+.09*Math.sin(t*3+i)); ctx.save(); ctx.rotate(a); const g=ctx.createLinearGradient(base,0,base+h,0); g.addColorStop(0,'rgba(88,28,135,.15)'); g.addColorStop(.5,'rgba(168,85,247,.88)'); g.addColorStop(1,'rgba(244,114,182,0)'); ctx.fillStyle=g; ctx.shadowColor='#a855f7'; ctx.shadowBlur=u*.08; ctx.beginPath(); ctx.moveTo(base,-u*.045); ctx.quadraticCurveTo(base+h*.7,-u*.08,base+h,0); ctx.quadraticCurveTo(base+h*.55,u*.09,base,u*.045); ctx.closePath(); ctx.fill(); ctx.restore(); }
  } else if (type === 'oceanAura') {
    ctx.globalCompositeOperation='screen'; ctx.strokeStyle='#38bdf8'; ctx.shadowColor='#0ea5e9'; ctx.shadowBlur=u*.09; ctx.lineWidth=Math.max(2,u*.025);
    for (let ring=0;ring<3;ring++) { ctx.beginPath(); const rr=u*(.5+ring*.09); for (let i=0;i<=40;i++) { const a=i/40*TAU; const wave=Math.sin(a*5-t*3+ring)*u*.025; const x=Math.cos(a)*(rr+wave), y=Math.sin(a)*(rr+wave); if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);} ctx.closePath(); ctx.stroke(); }
    for (let i=0;i<9;i++) { const a=i*2.4-t*.2; const d=u*(.45+(i%3)*.1); ctx.fillStyle='rgba(186,230,253,.65)'; ctx.beginPath(); ctx.arc(Math.cos(a)*d,Math.sin(a)*d,u*(.025+(i%2)*.012),0,TAU); ctx.fill(); }
  } else if (type === 'meteorShower') {
    ctx.globalCompositeOperation='screen'; for (let i=0;i<9;i++) { const a=i*2.399+t*(.25+(i%3)*.035); const d=u*(.3+(i%4)*.1); const x=Math.cos(a)*d, y=Math.sin(a)*d; ctx.save(); ctx.translate(x,y); ctx.rotate(a+.7); const g=ctx.createLinearGradient(-u*.18,0,u*.05,0); g.addColorStop(0,'rgba(251,146,60,0)'); g.addColorStop(1,'#fff7ed'); ctx.strokeStyle=g; ctx.shadowColor='#fb923c'; ctx.shadowBlur=u*.08; ctx.lineWidth=Math.max(2,u*.025); ctx.beginPath(); ctx.moveTo(-u*.18,0); ctx.lineTo(0,0); ctx.stroke(); ctx.fillStyle=i%2?'#fde047':'#67e8f9'; ctx.beginPath(); ctx.arc(u*.025,0,u*.035,0,TAU); ctx.fill(); ctx.restore(); }
  } else if (type === 'pixelGlitch') {
    ctx.globalCompositeOperation='screen'; const cols=['#22d3ee','#f472b6','#a78bfa','#4ade80']; for(let i=0;i<22;i++){const phase=(t*(.45+(i%4)*.07)+i*.137)%1;const a=i*2.399;const d=u*(.25+phase*.48);const s=u*(.025+(i%3)*.018);ctx.fillStyle=cols[i%cols.length];ctx.globalAlpha=1-phase;ctx.fillRect(Math.cos(a)*d-s/2,Math.sin(a)*d-s/2,s*(i%2?1.8:1),s);} ctx.globalAlpha=1;
  } else if (type === 'musicNotes') {
    const notes=['♪','♫','♬','♩']; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.font=`900 ${Math.max(10,u*.13)}px Arial`; for(let i=0;i<12;i++){const phase=(t*.16+i/12)%1;const a=i*2.399+t*.1;const d=u*(.25+phase*.42);ctx.globalAlpha=1-phase;ctx.fillStyle=i%2?'#f472b6':'#67e8f9';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=u*.06;ctx.fillText(notes[i%notes.length],Math.cos(a)*d,Math.sin(a)*d);}ctx.globalAlpha=1;
  }
  return true;
}

export function drawCellCosmetics(ctx, p, c, r, t, drawLayer = 'front') {
  const entries = getCosmeticRenderEntries(p, drawLayer);
  if (!entries.length) return;
  for (const { item, transform } of entries) {
    const scale = Math.max(0.35, Math.min(2.2, Number(transform.scale || 1)));
    const x = c.x + (Number(transform.x || 0) / 100) * r;
    const y = c.y + (Number(transform.y || 0) / 100) * r;
    const rot = Number(transform.rotation || 0) * Math.PI / 180;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(scale, scale);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    const u = r;
    if (drawPremiumCosmeticArt(ctx, item, u, t)) {
      // Rendered by the premium art helper.
    } else if (item.type === 'crown') {
      ctx.shadowColor = 'rgba(250,204,21,.65)'; ctx.shadowBlur = u * .08;
      ctx.fillStyle = '#facc15'; ctx.strokeStyle = '#a16207'; ctx.lineWidth = Math.max(1.5, u*.025);
      ctx.beginPath();
      ctx.moveTo(-u*.32,u*.08); ctx.lineTo(-u*.24,-u*.18); ctx.lineTo(-u*.08,u*.02); ctx.lineTo(0,-u*.25); ctx.lineTo(u*.1,u*.02); ctx.lineTo(u*.26,-u*.18); ctx.lineTo(u*.34,u*.08); ctx.lineTo(u*.3,u*.22); ctx.lineTo(-u*.3,u*.22); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle='#fef3c7';
      for (const dx of [-.2,0,.2]) { ctx.beginPath(); ctx.arc(dx*u,u*.12,u*.035,0,TAU); ctx.fill(); }
    } else if (item.type === 'wizard') {
      ctx.fillStyle='#7c3aed'; ctx.strokeStyle='#c4b5fd'; ctx.lineWidth=Math.max(1.5,u*.025);
      ctx.beginPath(); ctx.moveTo(-u*.34,u*.12); ctx.quadraticCurveTo(0,-u*.55,u*.16,u*.16); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle='#4c1d95'; ctx.beginPath(); ctx.ellipse(0,u*.17,u*.38,u*.09,0,0,TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle='#fde68a';
      for (const s of [[-.08,-.16],[.03,-.31],[.08,-.04]]) { drawFivePointStar(ctx,s[0]*u,s[1]*u,u*.035,u*.016); ctx.fill(); }
    } else if (item.type === 'halo') {
      ctx.shadowColor='rgba(253,224,71,.9)'; ctx.shadowBlur=u*.1;
      ctx.strokeStyle='#fde047'; ctx.lineWidth=Math.max(2,u*.045);
      ctx.beginPath(); ctx.ellipse(0,0,u*.34,u*.11,0,0,TAU); ctx.stroke();
    } else if (item.type === 'horns') {
      ctx.fillStyle='#ef4444'; ctx.strokeStyle='#7f1d1d'; ctx.lineWidth=Math.max(1.5,u*.022);
      for (const sx of [-1,1]) { ctx.beginPath(); ctx.moveTo(sx*u*.11,u*.16); ctx.quadraticCurveTo(sx*u*.32,-u*.18,sx*u*.22,-u*.35); ctx.quadraticCurveTo(sx*u*.05,-u*.18,sx*u*.02,u*.14); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    } else if (item.type === 'starEyes') {
      ctx.fillStyle='#fde047'; ctx.strokeStyle='#92400e'; ctx.lineWidth=Math.max(1,u*.018);
      for (const sx of [-1,1]) { drawFivePointStar(ctx,sx*u*.22,0,u*.13,u*.06,t*.7); ctx.fill(); ctx.stroke(); }
    } else if (item.type === 'visor') {
      const g=ctx.createLinearGradient(-u*.38,0,u*.38,0); g.addColorStop(0,'#0ea5e9'); g.addColorStop(.5,'#e0f2fe'); g.addColorStop(1,'#a855f7');
      ctx.fillStyle=g; ctx.strokeStyle='#082f49'; ctx.lineWidth=Math.max(1.5,u*.022);
      ctx.beginPath(); ctx.roundRect(-u*.4,-u*.12,u*.8,u*.24,u*.1); ctx.fill(); ctx.stroke();
      ctx.strokeStyle='rgba(255,255,255,.65)'; ctx.beginPath(); ctx.moveTo(-u*.25,-u*.02); ctx.lineTo(u*.18,-u*.06); ctx.stroke();
    } else if (item.type === 'orbit') {
      ctx.strokeStyle=`hsl(${(t*120)%360},95%,68%)`; ctx.lineWidth=Math.max(1.5,u*.025);
      ctx.beginPath(); ctx.ellipse(0,0,u*.62,u*.23,0,0,TAU); ctx.stroke();
      const a=t*2.2; ctx.fillStyle='#fff'; ctx.shadowColor=ctx.strokeStyle; ctx.shadowBlur=u*.08;
      ctx.beginPath(); ctx.arc(Math.cos(a)*u*.62,Math.sin(a)*u*.23,u*.055,0,TAU); ctx.fill();
    } else if (item.type === 'sparkles') {
      const spots=[[-.42,-.24,.09],[.4,-.18,.07],[-.32,.32,.06],[.34,.3,.1],[0,-.44,.055]];
      for (let i=0;i<spots.length;i++) { const [sx,sy,sr]=spots[i]; ctx.fillStyle=i%2?'#f9a8d4':'#fef08a'; drawFivePointStar(ctx,sx*u,sy*u,sr*u,sr*u*.42,t*(.6+i*.1)); ctx.fill(); }
    } else if (item.type === 'topHat') {
      ctx.shadowColor='rgba(168,85,247,.55)'; ctx.shadowBlur=u*.08;
      const g=ctx.createLinearGradient(0,-u*.42,0,u*.2); g.addColorStop(0,'#312e81'); g.addColorStop(.55,'#111827'); g.addColorStop(1,'#020617');
      ctx.fillStyle=g; ctx.strokeStyle='#a78bfa'; ctx.lineWidth=Math.max(1.5,u*.024);
      ctx.beginPath(); ctx.roundRect(-u*.23,-u*.4,u*.46,u*.45,u*.06); ctx.fill(); ctx.stroke();
      ctx.fillStyle='#7c3aed'; ctx.fillRect(-u*.23,-u*.04,u*.46,u*.09);
      ctx.fillStyle='#020617'; ctx.beginPath(); ctx.ellipse(0,u*.08,u*.37,u*.095,0,0,TAU); ctx.fill(); ctx.stroke();
    } else if (item.type === 'catEars') {
      ctx.fillStyle='#f9a8d4'; ctx.strokeStyle='#831843'; ctx.lineWidth=Math.max(1.5,u*.024);
      for (const sx of [-1,1]) { ctx.beginPath(); ctx.moveTo(sx*u*.06,u*.16); ctx.lineTo(sx*u*.32,-u*.34); ctx.lineTo(sx*u*.42,u*.14); ctx.closePath(); ctx.fill(); ctx.stroke(); }
      ctx.fillStyle='#fce7f3';
      for (const sx of [-1,1]) { ctx.beginPath(); ctx.moveTo(sx*u*.14,u*.08); ctx.lineTo(sx*u*.31,-u*.22); ctx.lineTo(sx*u*.34,u*.08); ctx.closePath(); ctx.fill(); }
    } else if (item.type === 'viking') {
      ctx.fillStyle='#94a3b8'; ctx.strokeStyle='#334155'; ctx.lineWidth=Math.max(1.5,u*.024);
      ctx.beginPath(); ctx.arc(0,0,u*.28,Math.PI,TAU); ctx.lineTo(u*.28,u*.17); ctx.lineTo(-u*.28,u*.17); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle='#f8fafc';
      for (const sx of [-1,1]) { ctx.beginPath(); ctx.moveTo(sx*u*.22,-u*.02); ctx.quadraticCurveTo(sx*u*.48,-u*.2,sx*u*.42,-u*.43); ctx.quadraticCurveTo(sx*u*.24,-u*.25,sx*u*.13,-u*.02); ctx.closePath(); ctx.fill(); ctx.stroke(); }
      ctx.fillStyle='#f59e0b'; ctx.fillRect(-u*.31,u*.06,u*.62,u*.08);
    } else if (item.type === 'headphones') {
      ctx.strokeStyle='#22d3ee'; ctx.lineWidth=Math.max(3,u*.065); ctx.shadowColor='#22d3ee'; ctx.shadowBlur=u*.08;
      ctx.beginPath(); ctx.arc(0,0,u*.36,Math.PI*1.08,Math.PI*1.92); ctx.stroke();
      ctx.fillStyle='#0f172a'; ctx.strokeStyle='#a855f7'; ctx.lineWidth=Math.max(2,u*.035);
      for (const sx of [-1,1]) { ctx.beginPath(); ctx.roundRect(sx*u*.31-u*.09,-u*.02,u*.18,u*.28,u*.07); ctx.fill(); ctx.stroke(); }
    } else if (item.type === 'pixelGlasses') {
      ctx.fillStyle='#111827'; ctx.strokeStyle='#22d3ee'; ctx.lineWidth=Math.max(1.5,u*.025);
      for (const sx of [-1,1]) { ctx.beginPath(); ctx.rect(sx*u*.22-u*.18,-u*.12,u*.36,u*.24); ctx.fill(); ctx.stroke(); }
      ctx.fillRect(-u*.08,-u*.035,u*.16,u*.07);
      ctx.fillStyle='rgba(236,72,153,.75)'; ctx.fillRect(-u*.37,-u*.09,u*.28,u*.05);
      ctx.fillStyle='rgba(34,211,238,.75)'; ctx.fillRect(u*.09,-u*.02,u*.28,u*.05);
    } else if (item.type === 'heartOrbit') {
      ctx.strokeStyle='#fb7185'; ctx.lineWidth=Math.max(1.5,u*.025); ctx.shadowColor='#fb7185'; ctx.shadowBlur=u*.08;
      ctx.beginPath(); ctx.ellipse(0,0,u*.62,u*.24,0,0,TAU); ctx.stroke();
      const a=t*1.9; const hx=Math.cos(a)*u*.62, hy=Math.sin(a)*u*.24;
      ctx.fillStyle='#f43f5e'; ctx.beginPath(); ctx.moveTo(hx,hy+u*.04); ctx.bezierCurveTo(hx-u*.12,hy-u*.05,hx-u*.08,hy-u*.16,hx,hy-u*.08); ctx.bezierCurveTo(hx+u*.08,hy-u*.16,hx+u*.12,hy-u*.05,hx,hy+u*.04); ctx.fill();
    } else if (item.type === 'flameAura') {
      ctx.strokeStyle='#fb923c'; ctx.fillStyle='rgba(249,115,22,.36)'; ctx.lineWidth=Math.max(1.5,u*.022); ctx.shadowColor='#f97316'; ctx.shadowBlur=u*.1;
      for (let i=0;i<12;i++) { const a=i/12*TAU+t*.18; const inner=u*.48; const outer=u*(.64+.06*Math.sin(t*4+i)); ctx.beginPath(); ctx.moveTo(Math.cos(a-.12)*inner,Math.sin(a-.12)*inner); ctx.quadraticCurveTo(Math.cos(a)*outer,Math.sin(a)*outer,Math.cos(a+.12)*inner,Math.sin(a+.12)*inner); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    } else if (item.type === 'frostRing') {
      ctx.strokeStyle='#7dd3fc'; ctx.lineWidth=Math.max(2,u*.035); ctx.shadowColor='#38bdf8'; ctx.shadowBlur=u*.09;
      ctx.beginPath(); ctx.arc(0,0,u*.56,0,TAU); ctx.stroke();
      ctx.fillStyle='#e0f2fe';
      for (let i=0;i<10;i++) { const a=i/10*TAU-t*.12; const x=Math.cos(a)*u*.59,y=Math.sin(a)*u*.59; drawFivePointStar(ctx,x,y,u*.045,u*.02,a); ctx.fill(); }
    } else if (item.type === 'lightning') {
      ctx.fillStyle='#fde047'; ctx.strokeStyle='#ca8a04'; ctx.lineWidth=Math.max(1,u*.014); ctx.shadowColor='#fde047'; ctx.shadowBlur=u*.08;
      for (let i=0;i<6;i++) { const a=i/6*TAU+t*.1; ctx.save(); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(u*.46,-u*.05); ctx.lineTo(u*.68,-u*.15); ctx.lineTo(u*.61,u*.01); ctx.lineTo(u*.78,u*.01); ctx.lineTo(u*.52,u*.23); ctx.lineTo(u*.58,u*.07); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
    } else if (item.type === 'bubbleShield') {
      const g=ctx.createRadialGradient(-u*.18,-u*.2,u*.04,0,0,u*.62); g.addColorStop(0,'rgba(255,255,255,.42)'); g.addColorStop(.3,'rgba(125,211,252,.11)'); g.addColorStop(1,'rgba(14,165,233,.02)');
      ctx.fillStyle=g; ctx.strokeStyle='rgba(125,211,252,.8)'; ctx.lineWidth=Math.max(2,u*.03); ctx.shadowColor='#38bdf8'; ctx.shadowBlur=u*.07;
      ctx.beginPath(); ctx.arc(0,0,u*.59,0,TAU); ctx.fill(); ctx.stroke();
      ctx.strokeStyle='rgba(255,255,255,.7)'; ctx.lineWidth=Math.max(1,u*.018); ctx.beginPath(); ctx.arc(-u*.16,-u*.18,u*.25,Math.PI*1.05,Math.PI*1.55); ctx.stroke();
    } else if (item.type === 'solarCrown') {
      ctx.shadowColor='rgba(250,204,21,.9)'; ctx.shadowBlur=u*.12;
      ctx.strokeStyle='#f59e0b'; ctx.lineWidth=Math.max(2,u*.03);
      ctx.beginPath(); ctx.arc(0,0,u*.58,0,TAU); ctx.stroke();
      for (let i=0;i<14;i++) { const a=i/14*TAU+t*.08; ctx.save(); ctx.rotate(a); ctx.fillStyle=i%2?'#fb923c':'#fde047'; ctx.beginPath(); ctx.moveTo(u*.56,0); ctx.lineTo(u*.8,-u*.045); ctx.lineTo(u*.8,u*.045); ctx.closePath(); ctx.fill(); ctx.restore(); }
    } else if (item.type === 'voidRing') {
      const g=ctx.createRadialGradient(0,0,u*.15,0,0,u*.68); g.addColorStop(0,'rgba(15,23,42,.02)'); g.addColorStop(.56,'rgba(99,102,241,.1)'); g.addColorStop(1,'rgba(168,85,247,.56)');
      ctx.fillStyle=g; ctx.strokeStyle='#8b5cf6'; ctx.lineWidth=Math.max(2,u*.032); ctx.shadowColor='#8b5cf6'; ctx.shadowBlur=u*.1;
      ctx.beginPath(); ctx.arc(0,0,u*.61,0,TAU); ctx.fill(); ctx.stroke();
      ctx.strokeStyle='rgba(255,255,255,.4)'; ctx.lineWidth=Math.max(1,u*.014); ctx.setLineDash([u*.06,u*.07]); ctx.beginPath(); ctx.arc(0,0,u*.49,0,TAU); ctx.stroke(); ctx.setLineDash([]);
    } else if (item.type === 'runeCircle') {
      ctx.strokeStyle='#67e8f9'; ctx.lineWidth=Math.max(2,u*.026); ctx.shadowColor='#06b6d4'; ctx.shadowBlur=u*.08;
      ctx.beginPath(); ctx.arc(0,0,u*.6,0,TAU); ctx.stroke();
      ctx.beginPath(); ctx.arc(0,0,u*.46,0,TAU); ctx.stroke();
      const marks=['✦','ᚠ','✧','ᚱ','✦','ᚢ','✧','ᚲ'];
      ctx.fillStyle='#cffafe'; ctx.font=`${Math.max(8,u*.14)}px Baloo 2`; ctx.textAlign='center'; ctx.textBaseline='middle';
      for (let i=0;i<marks.length;i++) { const a=i/marks.length*TAU+t*.05; ctx.save(); ctx.translate(Math.cos(a)*u*.53, Math.sin(a)*u*.53); ctx.rotate(a+Math.PI/2); ctx.fillText(marks[i],0,0); ctx.restore(); }
    } else if (item.type === 'toxicSpores') {
      ctx.strokeStyle='#84cc16'; ctx.lineWidth=Math.max(2,u*.024); ctx.shadowColor='#65a30d'; ctx.shadowBlur=u*.08;
      ctx.beginPath(); ctx.arc(0,0,u*.58,0,TAU); ctx.stroke();
      for (let i=0;i<10;i++) { const a=i/10*TAU-t*.12; const d=u*(.52+.08*Math.sin(t*2+i)); ctx.fillStyle=i%2?'#a3e635':'#4d7c0f'; ctx.beginPath(); ctx.arc(Math.cos(a)*d,Math.sin(a)*d,u*(i%3===0?.085:.055),0,TAU); ctx.fill(); }
    } else if (item.type === 'sakuraBloom') {
      const petals=10;
      for (let i=0;i<petals;i++) { const a=i/petals*TAU+t*.08; ctx.save(); ctx.rotate(a); ctx.translate(u*.58,0); ctx.rotate(a*0.5); ctx.fillStyle=i%2?'#f9a8d4':'#fbcfe8'; for (const dir of [-1,1]) { ctx.beginPath(); ctx.moveTo(0,0); ctx.quadraticCurveTo(u*.07*dir,-u*.08,0,-u*.16); ctx.quadraticCurveTo(-u*.07*dir,-u*.08,0,0); ctx.fill(); } ctx.restore(); }
    } else if (item.type === 'prismRing') {
      const cols=['#22d3ee','#818cf8','#f472b6','#facc15','#4ade80'];
      ctx.lineWidth=Math.max(2,u*.03); ctx.shadowBlur=u*.08;
      for (let i=0;i<cols.length;i++) { ctx.strokeStyle=cols[i]; ctx.shadowColor=cols[i]; ctx.beginPath(); ctx.arc(0,0,u*.58,(i/cols.length)*TAU,((i+1)/cols.length)*TAU-0.08); ctx.stroke(); }
      for (let i=0;i<8;i++) { const a=i/8*TAU+t*.06; ctx.save(); ctx.translate(Math.cos(a)*u*.58,Math.sin(a)*u*.58); ctx.rotate(a); ctx.fillStyle=cols[i%cols.length]; ctx.beginPath(); ctx.moveTo(0,-u*.09); ctx.lineTo(u*.07,0); ctx.lineTo(0,u*.09); ctx.lineTo(-u*.07,0); ctx.closePath(); ctx.fill(); ctx.restore(); }
    } else if (item.type === 'neonDashes') {
      const cols=['#22d3ee','#60a5fa','#a78bfa']; ctx.lineWidth=Math.max(3,u*.05); ctx.lineCap='round';
      for (let i=0;i<15;i++) { const a=i/15*TAU+t*.12; const a2=a+0.18; ctx.strokeStyle=cols[i%cols.length]; ctx.shadowColor=cols[i%cols.length]; ctx.shadowBlur=u*.06; ctx.beginPath(); ctx.arc(0,0,u*(.56+(i%2)*.04),a,a2); ctx.stroke(); }
    } else if (item.type === 'thornRing') {
      ctx.strokeStyle='#4ade80'; ctx.lineWidth=Math.max(2,u*.024); ctx.shadowColor='#16a34a'; ctx.shadowBlur=u*.06;
      ctx.beginPath(); ctx.arc(0,0,u*.56,0,TAU); ctx.stroke();
      for (let i=0;i<12;i++) { const a=i/12*TAU-t*.04; ctx.save(); ctx.rotate(a); ctx.fillStyle=i%2?'#15803d':'#86efac'; ctx.beginPath(); ctx.moveTo(u*.55,0); ctx.lineTo(u*.76,-u*.05); ctx.lineTo(u*.7,u*.01); ctx.lineTo(u*.79,u*.09); ctx.closePath(); ctx.fill(); ctx.restore(); }
    } else if (item.type === 'plasmaArc') {
      const cols=['#38bdf8','#818cf8','#a855f7'];
      for (let i=0;i<3;i++) { ctx.strokeStyle=cols[i]; ctx.lineWidth=Math.max(2,u*.022); ctx.shadowColor=cols[i]; ctx.shadowBlur=u*.08; ctx.beginPath(); for (let s=0;s<=12;s++) { const a=(s/12)*TAU + i*TAU/3 + t*(i%2?0.5:-0.42); const rr=u*(.46 + (s%2?0.13:0.03)); const px=Math.cos(a)*rr, py=Math.sin(a)*rr; if (s===0) ctx.moveTo(px,py); else ctx.lineTo(px,py); } ctx.stroke(); }
    } else if (item.type === 'snowburst') {
      ctx.strokeStyle='#dbeafe'; ctx.lineWidth=Math.max(2,u*.02); ctx.shadowColor='#7dd3fc'; ctx.shadowBlur=u*.07;
      for (let i=0;i<8;i++) { const a=i/8*TAU+t*.05; ctx.save(); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(u*.38,0); ctx.lineTo(u*.68,0); ctx.moveTo(u*.55,-u*.08); ctx.lineTo(u*.62,0); ctx.lineTo(u*.55,u*.08); ctx.stroke(); ctx.restore(); }
      ctx.beginPath(); ctx.arc(0,0,u*.53,0,TAU); ctx.stroke();
    } else if (item.type === 'confetti') {
      const colours=['#f472b6','#fde047','#22d3ee','#4ade80','#a78bfa'];
      for (let i=0;i<18;i++) { const a=(i*2.399+t*.12)%TAU; const d=u*(.25+(i%5)*.09); const x=Math.cos(a)*d,y=Math.sin(a)*d; ctx.save(); ctx.translate(x,y); ctx.rotate(a+t*(i%2?1:-1)); ctx.fillStyle=colours[i%colours.length]; ctx.fillRect(-u*.025,-u*.055,u*.05,u*.11); ctx.restore(); }
    }
    ctx.restore();
  }
}