// Skin, cosmetic, badge, emoji and emote catalogue data plus pure helpers.
import { rgba } from './utils';

export let runtimeCustomSkins = [];
export function setRuntimeCustomSkins(skins) { runtimeCustomSkins = skins; }
const customSkinImageCache = new Map();

export const SKINS = [
  { id: 'aqua', name: 'Aqua', price: 0, base: '#38bdf8', accent: '#0e7ec2', pattern: 'plain', animated: false, reactive: false, rarity: 'Common' },
  { id: 'sunburst', name: 'Sunburst', price: 0, base: '#fbbf24', accent: '#d97706', pattern: 'core', animated: false, reactive: false, rarity: 'Common' },
  { id: 'mint', name: 'Mint', price: 0, base: '#4ade80', accent: '#16a34a', pattern: 'plain', animated: false, reactive: false, rarity: 'Common' },
  { id: 'berry', name: 'Berry', price: 0, base: '#f472b6', accent: '#be185d', pattern: 'ring', animated: false, reactive: false, rarity: 'Common' },
  { id: 'violet', name: 'Violet Storm', price: 0, base: '#a78bfa', accent: '#6d28d9', pattern: 'dots', animated: false, reactive: false, rarity: 'Rare' },
  { id: 'ember', name: 'Ember', price: 0, base: '#fb7185', accent: '#be123c', pattern: 'core', animated: false, reactive: false, rarity: 'Rare' },
  { id: 'abyss', name: 'Abyss', price: 0, base: '#334155', accent: '#0ea5e9', pattern: 'ring', animated: false, reactive: false, rarity: 'Rare' },
  { id: 'toxic', name: 'Toxic', price: 0, base: '#a3e635', accent: '#3f6212', pattern: 'dots', animated: false, reactive: false, rarity: 'Rare' },
  { id: 'eclipse', name: 'Eclipse', price: 0, base: '#1e1b4b', accent: '#facc15', pattern: 'duo', animated: false, reactive: false, rarity: 'Epic' },
  { id: 'prism', name: 'Prism', price: 0, base: '#22d3ee', accent: '#e879f9', pattern: 'duo', animated: false, reactive: false, rarity: 'Epic' },
  { id: 'blueflame', name: 'Blue Flame', price: 0, base: '#0f3f8e', accent: '#7dd3fc', pattern: 'flame', animated: true, reactive: true, rarity: 'Epic' },
  { id: 'plasma', name: 'Plasma Orb', price: 0, base: '#6d28d9', accent: '#c084fc', pattern: 'plasma', animated: true, reactive: true, rarity: 'Epic' },
  { id: 'galaxy', name: 'Galaxy Core', price: 0, base: '#2b1055', accent: '#8b5cf6', pattern: 'galaxy', animated: true, reactive: false, rarity: 'Legendary' },
  { id: 'toxicslime', name: 'Toxic Slime', price: 0, base: '#3f6212', accent: '#bef264', pattern: 'slime', animated: true, reactive: false, rarity: 'Rare' },
  { id: 'icestorm', name: 'Ice Storm', price: 0, base: '#dbeafe', accent: '#60a5fa', pattern: 'ice', animated: true, reactive: true, rarity: 'Epic' },
  { id: 'lavapulse', name: 'Lava Pulse', price: 0, base: '#4a1305', accent: '#fb923c', pattern: 'lava', animated: true, reactive: true, rarity: 'Legendary' },
  { id: 'cybergrid', name: 'Cyber Grid', price: 0, base: '#051626', accent: '#22d3ee', pattern: 'grid', animated: true, reactive: false, rarity: 'Epic' },
  { id: 'shadoweye', name: 'Shadow Eye', price: 0, base: '#09090b', accent: '#ef4444', pattern: 'shadoweye', animated: true, reactive: true, rarity: 'Legendary' },
  { id: 'rainbowpulse', name: 'Rainbow Aurora', price: 0, base: '#ff4fd8', accent: '#38bdf8', pattern: 'rainbow', animated: true, reactive: true, rarity: 'Mythic' },
  { id: 'voidsingularity', name: 'Void Singularity', price: 0, base: '#05030d', accent: '#a855f7', pattern: 'void', animated: true, reactive: true, rarity: 'Mythic' },
  { id: 'thundercore', name: 'Thunder Core', price: 0, base: '#111827', accent: '#67e8f9', pattern: 'thunder', animated: true, reactive: true, rarity: 'Legendary' },
  { id: 'solarflare', name: 'Solar Flare', price: 0, base: '#7c2d12', accent: '#fb923c', pattern: 'solar', animated: true, reactive: true, rarity: 'Legendary' },
  { id: 'neonsakura', name: 'Neon Sakura', price: 0, base: '#4c1d95', accent: '#f472b6', pattern: 'sakura', animated: true, reactive: true, rarity: 'Epic' },
  { id: 'digitalglitch', name: 'Digital Glitch', price: 0, base: '#070b18', accent: '#22d3ee', pattern: 'glitch', animated: true, reactive: true, rarity: 'Legendary' },
  { id: 'liquidchrome', name: 'Liquid Chrome', price: 0, base: '#6b7280', accent: '#cbd5e1', pattern: 'chrome', animated: true, reactive: true, rarity: 'Legendary' },
  { id: 'frostfire', name: 'Frostfire', price: 0, base: '#1e3a8a', accent: '#f97316', pattern: 'frostfire', animated: true, reactive: true, rarity: 'Legendary' },
  { id: 'phantommist', name: 'Phantom Mist', price: 0, base: '#0a1714', accent: '#34d399', pattern: 'mist', animated: true, reactive: true, rarity: 'Epic' },
  { id: 'cosmicrift', name: 'Cosmic Rift', price: 0, base: '#0b1120', accent: '#a78bfa', pattern: 'rift', animated: true, reactive: true, rarity: 'Mythic' },
  { id: 'arcreactor', name: 'Arc Reactor', price: 0, base: '#071a2a', accent: '#38bdf8', pattern: 'reactor', animated: true, reactive: true, rarity: 'Legendary' },
  { id: 'bloodmoon', name: 'Blood Moon', price: 0, base: '#2b0a10', accent: '#ef4444', pattern: 'bloodmoon', animated: true, reactive: true, rarity: 'Epic' },
  { id: 'emeralddragon', name: 'Emerald Dragon', price: 0, base: '#14532d', accent: '#fde047', pattern: 'dragon', animated: true, reactive: true, rarity: 'Mythic' },
  { id: 'nebulaforge', name: 'Nebula Forge', price: 325, base: '#14082f', accent: '#ff7bd5', pattern: 'nebulaforge', animated: true, reactive: true, rarity: 'Mythic', shopSingle: true, description: 'A forged nebula core with pink-violet starfire pulses.' },
  { id: 'infernotide', name: 'Inferno Tide', price: 295, base: '#2e0d09', accent: '#ff6b4a', pattern: 'infernotide', animated: true, reactive: true, rarity: 'Legendary', shopSingle: true, description: 'Molten waves rolling around the cell with fierce heat glow.' },
  { id: 'aurorafrost', name: 'Aurora Frost', price: 285, base: '#102040', accent: '#7dd3fc', pattern: 'aurorafrost', animated: true, reactive: true, rarity: 'Legendary', shopSingle: true, description: 'Frozen crystal light with a soft northern-aurora shimmer.' },
  { id: 'quantumpulse', name: 'Quantum Pulse', price: 315, base: '#07121b', accent: '#34d399', pattern: 'quantumpulse', animated: true, reactive: true, rarity: 'Legendary', shopSingle: true, description: 'A clean sci-fi reactor core with synchronized pulse rings.' },
  { id: 'stormsurge', name: 'Storm Surge', price: 300, base: '#0b1120', accent: '#60a5fa', pattern: 'stormsurge', animated: true, reactive: true, rarity: 'Legendary', shopSingle: true, description: 'Crackling electric energy racing around a storm-dark shell.' },
  { id: 'moonlotus', name: 'Moon Lotus', price: 275, base: '#341248', accent: '#f9a8d4', pattern: 'moonlotus', animated: true, reactive: true, rarity: 'Epic', shopSingle: true, description: 'A dreamy lunar bloom skin with neon-petal sparkle trails.' },
  { id: 'obsidianflare', name: 'Obsidian Flare', price: 335, base: '#09090b', accent: '#fb923c', pattern: 'obsidianflare', animated: true, reactive: true, rarity: 'Mythic', shopSingle: true, description: 'Dark obsidian energy with a dangerous burning inner flare.' },
  { id: 'starlightnova', name: 'Starlight Nova', price: 345, base: '#1e1b4b', accent: '#67e8f9', pattern: 'starlightnova', animated: true, reactive: true, rarity: 'Mythic', shopSingle: true, description: 'A glossy prismatic nova with rainbow light breathing through.' },
  { id: 'venombyte', name: 'Venom Byte', price: 290, base: '#071a12', accent: '#22d3ee', pattern: 'venombyte', animated: true, reactive: true, rarity: 'Legendary', shopSingle: true, description: 'Toxic digital corruption with snappy animated glitch slices.' },
  { id: 'celestialveil', name: 'Celestial Veil', price: 310, base: '#08111d', accent: '#a78bfa', pattern: 'celestialveil', animated: true, reactive: true, rarity: 'Legendary', shopSingle: true, description: 'A soft cosmic veil with drifting stardust mist and deep glow.' },
  { id: 'prismaticorbit', name: 'Prismatic Orbit', price: 320, base: '#0f172a', accent: '#f472b6', pattern: 'prismaticorbit', animated: true, reactive: true, rarity: 'Mythic', shopSingle: true, description: 'Rift-like circular waves with high-energy prismatic highlights.' },
  { id: 'seraphiccore', name: 'Seraphic Core', price: 480, base: '#0a1228', accent: '#fde68a', pattern: 'seraphiccore', animated: true, reactive: true, rarity: 'Transcendent', shopSingle: true, description: 'Heaven-bright core energy with sacred gold arcs and divine bloom.' },
  { id: 'abyssalnova', name: 'Abyssal Nova', price: 495, base: '#050816', accent: '#7c3aed', pattern: 'abyssalnova', animated: true, reactive: true, rarity: 'Transcendent', shopSingle: true, limited: true, description: 'A black-violet singularity skin with deep-space glow and void surges.' },
  { id: 'chronoshatter', name: 'Chrono Shatter', price: 475, base: '#08131b', accent: '#67e8f9', pattern: 'chronoshatter', animated: true, reactive: true, rarity: 'Transcendent', shopSingle: true, description: 'Time-rift fractures, sharp cyan pulses and high-end crystalline motion.' },
  { id: 'phoenixveil', name: 'Phoenix Veil', price: 465, base: '#2a0c07', accent: '#fb7185', pattern: 'phoenixveil', animated: true, reactive: true, rarity: 'Transcendent', shopSingle: true, description: 'A reborn ember storm with hot phoenix flares circling the shell.' },
  { id: 'crownedeclipse', name: 'Crowned Eclipse', price: 520, base: '#09090f', accent: '#f5d76e', pattern: 'crownedeclipse', animated: true, reactive: true, rarity: 'Transcendent', shopSingle: true, limited: true, description: 'Royal eclipse energy with dark-luxury shine, eclipse halo and prestige glow.' },
  { id: 'nebulareign', name: 'Nebula Reign', price: 510, base: '#12081f', accent: '#60a5fa', pattern: 'nebulareign', animated: true, reactive: true, rarity: 'Transcendent', shopSingle: true, limited: true, description: 'An ultra-polished cosmic ruler skin with aurora waves and starfire depth.' },
];

export const SHOP_BOOSTERS = [
  { id:'mass', name:'Mass Booster', icon:'🟢', price6h:180, price24h:540, description:'+25% starting mass while active.' },
  { id:'xp', name:'XP Booster', icon:'⭐', price6h:220, price24h:660, description:'Earn 2× XP while active.' },
];

export const SHOP_COSMETICS = [
  { id:'mini_crown', name:'Mini Crown', icon:'👑', slot:'hat', price:260, type:'crown', defaultTransform:{x:0,y:-72,scale:1,rotation:0,layer:'front'} },
  { id:'wizard_hat', name:'Wizard Hat', icon:'🧙', slot:'hat', price:320, type:'wizard', defaultTransform:{x:0,y:-68,scale:1,rotation:-6,layer:'front'} },
  { id:'halo', name:'Halo', icon:'😇', slot:'hat', price:240, type:'halo', defaultTransform:{x:0,y:-78,scale:1,rotation:0,layer:'front'} },
  { id:'devil_horns', name:'Devil Horns', icon:'😈', slot:'hat', price:280, type:'horns', defaultTransform:{x:0,y:-58,scale:1,rotation:0,layer:'front'} },
  { id:'royal_top_hat', name:'Royal Top Hat', icon:'🎩', slot:'hat', price:330, type:'topHat', defaultTransform:{x:0,y:-70,scale:1,rotation:0,layer:'front'} },
  { id:'cat_ears', name:'Cat Ears', icon:'🐱', slot:'hat', price:260, type:'catEars', defaultTransform:{x:0,y:-59,scale:1,rotation:0,layer:'front'} },
  { id:'viking_helmet', name:'Viking Helmet', icon:'🪖', slot:'hat', price:350, type:'viking', defaultTransform:{x:0,y:-61,scale:1,rotation:0,layer:'front'} },
  { id:'neon_headphones', name:'Neon Headphones', icon:'🎧', slot:'hat', price:310, type:'headphones', defaultTransform:{x:0,y:-18,scale:1,rotation:0,layer:'front'} },
  { id:'star_eyes', name:'Star Eyes', icon:'🤩', slot:'overlay', price:190, type:'starEyes', defaultTransform:{x:0,y:-8,scale:1,rotation:0,layer:'front'} },
  { id:'cyber_visor', name:'Cyber Visor', icon:'🥽', slot:'overlay', price:260, type:'visor', defaultTransform:{x:0,y:-10,scale:1,rotation:0,layer:'front'} },
  { id:'pixel_glasses', name:'Pixel Glasses', icon:'😎', slot:'overlay', price:240, type:'pixelGlasses', defaultTransform:{x:0,y:-9,scale:1,rotation:0,layer:'front'} },
  { id:'neon_orbit', name:'Neon Orbit', icon:'🪐', slot:'overlay', price:300, type:'orbit', defaultTransform:{x:0,y:0,scale:1,rotation:-18,layer:'back'} },
  { id:'heart_orbit', name:'Heart Orbit', icon:'💖', slot:'overlay', price:290, type:'heartOrbit', defaultTransform:{x:0,y:0,scale:1,rotation:10,layer:'back'} },
  { id:'sparkle_field', name:'Sparkle Field', icon:'✨', slot:'overlay', price:210, type:'sparkles', defaultTransform:{x:0,y:0,scale:1,rotation:0,layer:'front'} },
  { id:'flame_aura', name:'Flame Aura', icon:'🔥', slot:'overlay', price:340, type:'flameAura', defaultTransform:{x:0,y:0,scale:1.08,rotation:0,layer:'back'} },
  { id:'frost_ring', name:'Frost Ring', icon:'❄️', slot:'overlay', price:300, type:'frostRing', defaultTransform:{x:0,y:0,scale:1.05,rotation:0,layer:'back'} },
  { id:'lightning_burst', name:'Lightning Burst', icon:'⚡', slot:'overlay', price:320, type:'lightning', defaultTransform:{x:0,y:0,scale:1,rotation:0,layer:'front'} },
  { id:'bubble_shield', name:'Bubble Shield', icon:'🫧', slot:'overlay', price:280, type:'bubbleShield', defaultTransform:{x:0,y:0,scale:1.04,rotation:0,layer:'front'} },
  { id:'confetti_field', name:'Confetti Field', icon:'🎉', slot:'overlay', price:250, type:'confetti', defaultTransform:{x:0,y:0,scale:1,rotation:0,layer:'front'} },
  { id:'solar_crown', name:'Solar Crown', icon:'☀️', slot:'overlay', price:360, type:'solarCrown', defaultTransform:{x:0,y:0,scale:1.08,rotation:0,layer:'back'} },
  { id:'void_ring', name:'Void Ring', icon:'🕳️', slot:'overlay', price:345, type:'voidRing', defaultTransform:{x:0,y:0,scale:1.06,rotation:0,layer:'back'} },
  { id:'rune_circle', name:'Rune Circle', icon:'🔮', slot:'overlay', price:335, type:'runeCircle', defaultTransform:{x:0,y:0,scale:1.08,rotation:0,layer:'back'} },
  { id:'toxic_spores', name:'Toxic Spores', icon:'☣️', slot:'overlay', price:295, type:'toxicSpores', defaultTransform:{x:0,y:0,scale:1.04,rotation:0,layer:'back'} },
  { id:'sakura_bloom', name:'Sakura Bloom', icon:'🌸', slot:'overlay', price:305, type:'sakuraBloom', defaultTransform:{x:0,y:0,scale:1.06,rotation:0,layer:'front'} },
  { id:'prism_ring', name:'Prism Ring', icon:'💎', slot:'overlay', price:315, type:'prismRing', defaultTransform:{x:0,y:0,scale:1.04,rotation:0,layer:'back'} },
  { id:'neon_dashes', name:'Neon Dashes', icon:'🌀', slot:'overlay', price:275, type:'neonDashes', defaultTransform:{x:0,y:0,scale:1.03,rotation:0,layer:'back'} },
  { id:'thorn_ring', name:'Thorn Ring', icon:'🌿', slot:'overlay', price:300, type:'thornRing', defaultTransform:{x:0,y:0,scale:1.03,rotation:0,layer:'back'} },
  { id:'plasma_arc', name:'Plasma Arc', icon:'⚛️', slot:'overlay', price:325, type:'plasmaArc', defaultTransform:{x:0,y:0,scale:1.05,rotation:0,layer:'back'} },
  { id:'snowburst', name:'Snowburst', icon:'🧊', slot:'overlay', price:290, type:'snowburst', defaultTransform:{x:0,y:0,scale:1.03,rotation:0,layer:'front'} },
  { id:'celestial_crown', name:'Celestial Crown', icon:'🌟', slot:'hat', price:420, type:'celestialCrown', defaultTransform:{x:0,y:-72,scale:1,rotation:0,layer:'front'} },
  { id:'dragon_horns', name:'Dragon Horns', icon:'🐲', slot:'hat', price:400, type:'dragonHorns', defaultTransform:{x:0,y:-55,scale:1,rotation:0,layer:'front'} },
  { id:'hologram_cap', name:'Hologram Cap', icon:'🧢', slot:'hat', price:380, type:'holoCap', defaultTransform:{x:0,y:-62,scale:1,rotation:-4,layer:'front'} },
  { id:'troll_face', name:'Classic Troll Face', icon:'😏', slot:'overlay', price:350, type:'trollFace', defaultTransform:{x:0,y:-1,scale:1,rotation:0,layer:'front'} },
  { id:'laser_eyes', name:'Inferno Laser Eyes', icon:'👁️', slot:'overlay', price:360, type:'laserEyes', defaultTransform:{x:0,y:-8,scale:1,rotation:0,layer:'front'} },
  { id:'oni_mask', name:'Neon Oni Mask', icon:'👹', slot:'overlay', price:390, type:'oniMask', defaultTransform:{x:0,y:2,scale:1,rotation:0,layer:'front'} },
  { id:'galaxy_smile', name:'Galaxy Smile', icon:'🌌', slot:'overlay', price:330, type:'galaxySmile', defaultTransform:{x:0,y:3,scale:1,rotation:0,layer:'front'} },
  { id:'dragon_ring', name:'Emerald Dragon Ring', icon:'🐉', slot:'overlay', price:410, type:'dragonRing', defaultTransform:{x:0,y:0,scale:1.06,rotation:0,layer:'back'} },
  { id:'chrono_ring', name:'Chrono Ring', icon:'⏱️', slot:'overlay', price:395, type:'chronoRing', defaultTransform:{x:0,y:0,scale:1.05,rotation:0,layer:'back'} },
  { id:'angel_ring', name:'Seraph Halo Ring', icon:'🪽', slot:'overlay', price:430, type:'angelRing', defaultTransform:{x:0,y:0,scale:1.07,rotation:0,layer:'back'} },
  { id:'cosmic_wings', name:'Cosmic Wings', icon:'🪽', slot:'overlay', price:460, type:'cosmicWings', defaultTransform:{x:0,y:0,scale:1.08,rotation:0,layer:'back'} },
  { id:'shadow_flames', name:'Shadow Flame Aura', icon:'💜', slot:'overlay', price:425, type:'shadowFlames', defaultTransform:{x:0,y:0,scale:1.07,rotation:0,layer:'back'} },
  { id:'ocean_aura', name:'Leviathan Ocean Aura', icon:'🌊', slot:'overlay', price:405, type:'oceanAura', defaultTransform:{x:0,y:0,scale:1.06,rotation:0,layer:'back'} },
  { id:'meteor_shower', name:'Meteor Shower', icon:'☄️', slot:'overlay', price:390, type:'meteorShower', defaultTransform:{x:0,y:0,scale:1.03,rotation:0,layer:'front'} },
  { id:'pixel_glitch_fx', name:'Pixel Glitch Storm', icon:'👾', slot:'overlay', price:370, type:'pixelGlitch', defaultTransform:{x:0,y:0,scale:1.03,rotation:0,layer:'front'} },
  { id:'music_notes', name:'Neon Soundwave', icon:'🎵', slot:'overlay', price:355, type:'musicNotes', defaultTransform:{x:0,y:0,scale:1.03,rotation:0,layer:'front'} },
];

export const FREE_SKIN_IDS = SKINS.filter((skin) => !skin.animated).map((skin) => skin.id);
// Every animated skin is now sold individually; formerly pack-only skins get a rarity-based price.
const RARITY_PRICE = { Common: 120, Rare: 180, Epic: 240, Legendary: 300, Mythic: 380, Transcendent: 480 };
export const INDIVIDUAL_SHOP_SKINS = SKINS.filter((skin) => skin.animated).map((skin) => ({
  ...skin,
  shopSingle: true,
  price: skin.price || RARITY_PRICE[skin.rarity] || 250,
}));
export const INDIVIDUAL_SHOP_SKIN_IDS = new Set(INDIVIDUAL_SHOP_SKINS.map((skin) => skin.id));
export const SHOP_SKIN_IDS = INDIVIDUAL_SHOP_SKIN_IDS;
export const findShopSingleSkin = (id) => INDIVIDUAL_SHOP_SKINS.find((skin) => skin.id === id);
export const findCosmetic = (id) => SHOP_COSMETICS.find((item) => item.id === id);

export const PLAYER_BADGES = [
  { id:'moderator', name:'Moderator', short:'M', primary:'#0ea5e9', secondary:'#67e8f9', accent:'#e0f2fe', description:'Official moderation-team badge.' },
  { id:'admin', name:'Administrator', short:'A', primary:'#ef4444', secondary:'#f59e0b', accent:'#fff7ed', description:'Official administrator badge.' },
  { id:'vip', name:'VIP', short:'V', primary:'#d39b0d', secondary:'#fde68a', accent:'#fff7cc', description:'Premium VIP badge with animated golden particles.' },
  { id:'youtube', name:'YouTube', short:'▶', primary:'#dc2626', secondary:'#ff6b6b', accent:'#ffffff', description:'Official YouTube creator badge.' },
  { id:'tiktok', name:'TikTok', short:'♪', primary:'#111827', secondary:'#22d3ee', accent:'#f472b6', description:'Official TikTok creator badge.' },
  { id:'booster', name:'Server Booster', short:'B', primary:'#7c3aed', secondary:'#c4b5fd', accent:'#f5f3ff', description:'Exclusive Discord server booster badge.' },
];
export const findBadge = (id) => PLAYER_BADGES.find((badge) => badge.id === id);

export function badgePreviewSvg(badge) {
  if (!badge) return '<span style="font-size:38px;opacity:.55">∅</span>';

  if (badge.id === 'youtube') {
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="badge-youtube" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ff7676"/><stop offset="1" stop-color="#dc2626"/></linearGradient></defs><rect x="7" y="14" width="50" height="36" rx="11" fill="url(#badge-youtube)" stroke="#fff" stroke-width="3"/><path d="M27 23l15 9-15 9z" fill="#fff"/></svg>`;
  }

  if (badge.id === 'tiktok') {
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="badge-tiktok" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#22d3ee"/><stop offset=".46" stop-color="#0f172a"/><stop offset="1" stop-color="#f472b6"/></linearGradient></defs><circle cx="32" cy="32" r="27" fill="url(#badge-tiktok)" stroke="#fff" stroke-width="2.5"/><path d="M38 15c2.1 5.2 5.3 8 10 8.5v6.2c-3.7-.2-6.7-1.3-9.7-3.6v11.1c0 6.6-5.1 11.2-11.8 11.2-6.5 0-11.3-4.3-11.3-10.2 0-6.3 5-10.5 11.5-10.5 1 0 2 .1 3 .4v6.3c-.9-.4-1.8-.6-2.8-.6-2.8 0-4.9 1.7-4.9 4.4 0 2.5 2 4.3 4.7 4.3 3 0 4.8-2 4.8-5.4V15z" fill="#fff"/></svg>`;
  }

  if (badge.id === 'booster') {
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="badge-booster" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d8b4fe"/><stop offset="1" stop-color="#7c3aed"/></linearGradient></defs><path d="M32 4L55 13v18c0 14-9 24-23 29C18 55 9 45 9 31V13z" fill="url(#badge-booster)" stroke="#f5f3ff" stroke-width="3"/><circle cx="32" cy="30" r="13" fill="rgba(255,255,255,.14)" stroke="#fff" stroke-width="2"/><path d="M32 18l3.7 7.3 8.1 1.2-5.9 5.7 1.4 8-7.3-3.8-7.3 3.8 1.4-8-5.9-5.7 8.1-1.2z" fill="#fff"/></svg>`;
  }

  const special = badge.id === 'admin'
    ? '<path d="M19 22l5-8 8 7 8-7 5 8-3 5H22z" fill="#fde68a" stroke="#92400e" stroke-width="1.5"/>'
    : badge.id === 'vip'
      ? '<path d="M19 23l5-9 8 7 8-7 5 9-3 6H22z" fill="#fff2a8" stroke="#a16207" stroke-width="1.5"/><circle cx="32" cy="18" r="2" fill="#fff"/>'
      : '<path d="M24 18l5 5 10-11" fill="none" stroke="#ecfeff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>';

  return `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="bg-${badge.id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${badge.secondary}"/><stop offset="1" stop-color="${badge.primary}"/></linearGradient></defs><path d="M32 4L55 13v18c0 14-9 24-23 29C18 55 9 45 9 31V13z" fill="url(#bg-${badge.id})" stroke="${badge.accent}" stroke-width="3"/><path d="M32 9L49 16v15c0 10-6 18-17 23-11-5-17-13-17-23V16z" fill="rgba(2,6,23,.22)"/>${special}<text x="32" y="43" text-anchor="middle" font-size="18" font-weight="1000" fill="white" font-family="Arial">${badge.short}</text></svg>`;
}

export function getDefaultCosmeticTransform(item) {
  return { ...(item?.defaultTransform || {x:0,y:0,scale:1,rotation:0}) };
}

export const SHOP_EMOJIS = [
  {id:'smile',name:'Big Smile',icon:'😀',price:0,description:'A cheerful smile above your cell.'},
  {id:'laugh',name:'Laughing',icon:'😂',price:150,description:'Laugh with tears during a match.'},
  {id:'heart',name:'Heart Eyes',icon:'😍',price:180,description:'Show some love to nearby players.'},
  {id:'cool',name:'Cool',icon:'😎',price:220,description:'A cool reaction for clean plays.'},
  {id:'shock',name:'Shocked',icon:'😮',price:190,description:'React to an unexpected split.'},
  {id:'cry',name:'Crying',icon:'😢',price:190,description:'For the moments that hurt.'},
  {id:'angry',name:'Angry',icon:'😡',price:240,description:'A fiery reaction above your cell.'},
  {id:'devil',name:'Purple Devil',icon:'😈',price:280,description:'Celebrate a mischievous play.'},
  {id:'catlaugh',name:'Cat Laugh',icon:'😹',price:260,description:'A laughing cat reaction.'},
  {id:'fire',name:'On Fire',icon:'🔥',price:300,description:'Show everyone you are on a streak.'},
];
export const SHOP_EMOTES = [
  {id:'bounce',name:'Bounce Jump',icon:'↥',price:0,duration:1.05,description:'Your cells bounce up from the map.'},
  {id:'spin',name:'Full Spin',icon:'⟳',price:400,duration:1.1,description:'Spin every one of your cells once.'},
  {id:'pulse',name:'Power Pulse',icon:'◎',price:350,duration:1.15,description:'Pulse larger and settle smoothly.'},
  {id:'wobble',name:'Happy Wobble',icon:'〰',price:375,duration:1.2,description:'A playful side-to-side wobble.'},
  {id:'backflip',name:'Backflip',icon:'⤴',price:450,duration:1.25,description:'Leap up and complete a smooth backflip.'},
  {id:'shake',name:'Rapid Shake',icon:'⚡',price:320,duration:1.0,description:'Shake quickly before settling back down.'},
  {id:'squash',name:'Jelly Squash',icon:'↔',price:360,duration:1.2,description:'Stretch wide and squash like soft jelly.'},
  {id:'zoom',name:'Mega Pop',icon:'✦',price:420,duration:1.05,description:'Expand dramatically and pop back into place.'},
  {id:'dance',name:'Victory Dance',icon:'♫',price:520,duration:1.45,description:'Bounce and dance after a clean play.'},
  {id:'wave',name:'Cell Wave',icon:'≈',price:480,duration:1.4,description:'Send a flowing wave through all your cells.'},
  {id:'orbit',name:'Orbit Swirl',icon:'◉',price:600,duration:1.5,description:'Your split cells swirl around their centre.'},
  {id:'tornado',name:'Tornado Spin',icon:'🌀',price:650,duration:1.35,description:'Twist rapidly like a miniature tornado.'},
  {id:'heartbeat',name:'Heartbeat',icon:'♥',price:440,duration:1.25,description:'Pulse with a strong double heartbeat.'},
  {id:'moonwalk',name:'Moonwalk',icon:'☾',price:540,duration:1.3,description:'Slide sideways and glide smoothly back.'},
  {id:'jelly',name:'Jelly Jiggle',icon:'◌',price:390,duration:1.35,description:'A fast soft-body jiggle across every cell.'},
  {id:'drift',name:'Side Drift',icon:'➜',price:500,duration:1.3,description:'Lean and drift sideways before snapping back.'},
  {id:'victory',name:'Victory Hop',icon:'★',price:580,duration:1.45,description:'A high celebratory hop with a gentle twist.'},
  {id:'doublebounce',name:'Double Bounce',icon:'⇈',price:460,duration:1.35,description:'Two energetic jumps with a soft landing.'},
];
export const findShopEmoji = (id) => SHOP_EMOJIS.find((item) => item.id === id);
export const findShopEmote = (id) => SHOP_EMOTES.find((item) => item.id === id);

export const SHOP_REDEEM_CODES = {
  'WELCOME500': { type:'coins', amount:500, label:'+500 coins' },
  'MASS6H': { type:'boost', boost:'mass', hours:6, label:'+6h Mass Booster' },
  'XP24H': { type:'boost', boost:'xp', hours:24, label:'+24h XP Booster' },
  'SPARKLE': { type:'cosmetic', cosmeticId:'sparkle_field', label:'Sparkle Field cosmetic' },
};

export function getShopCosmeticPreviewScale(item) {
  if (!item) return 1;
  if (item.slot === 'hat') return 2.05;
  if (['starEyes','visor','pixelGlasses','trollFace','laserEyes','oniMask','galaxySmile'].includes(item.type)) return 1.62;
  if (['sparkles','confetti','sakuraBloom','snowburst','meteorShower','pixelGlitch','musicNotes'].includes(item.type)) return 1.48;
  if (['orbit','heartOrbit','flameAura','frostRing','bubbleShield','solarCrown','voidRing','runeCircle','toxicSpores','prismRing','neonDashes','thornRing','plasmaArc','dragonRing','chronoRing','angelRing','cosmicWings','shadowFlames','oceanAura'].includes(item.type)) return 1.3;
  return 1.42;
}

export function getCosmeticShopCategory(item) {
  if (!item) return 'all';
  if (item.slot === 'hat') return 'hats';
  if (['starEyes','visor','pixelGlasses','trollFace','laserEyes','oniMask','galaxySmile'].includes(item.type)) return 'face';
  if (['orbit','heartOrbit','frostRing','bubbleShield','solarCrown','voidRing','runeCircle','prismRing','neonDashes','thornRing','plasmaArc','dragonRing','chronoRing','angelRing'].includes(item.type)) return 'rings';
  if (['flameAura','toxicSpores','cosmicWings','shadowFlames','oceanAura'].includes(item.type)) return 'auras';
  return 'effects';
}

export function getAvailableSkins() {
  return [...SKINS, ...runtimeCustomSkins];
}

export const getSkin = (id) => getAvailableSkins().find((s) => s.id === id) || SKINS[0];

export function getCustomSkinImage(skin) {
  if (!skin?.imageData) return null;
  let image = customSkinImageCache.get(skin.id);
  if (!image) {
    image = new Image();
    image.decoding = 'async';
    image.src = skin.imageData;
    customSkinImageCache.set(skin.id, image);
  } else if (image.src !== skin.imageData) {
    image.src = skin.imageData;
  }
  return image;
}

export function getSkinStroke(skin, t, reactiveLevel = 0) {
  if (skin.pattern === 'rainbow') return `hsl(${(t * 140) % 360}, 95%, ${70 + reactiveLevel * 10}%)`;
  if (skin.pattern === 'ice') return rgba('#ffffff', .95);
  if (skin.pattern === 'chrome') return `hsl(${210 + Math.sin(t * 1.8) * 18}, 26%, ${72 + reactiveLevel * 8}%)`;
  if (skin.pattern === 'void') return `hsl(${270 + Math.sin(t * 2.4) * 12}, 96%, ${64 + reactiveLevel * 10}%)`;
  if (skin.pattern === 'solar') return `hsl(${28 + Math.sin(t * 2.2) * 8}, 98%, ${62 + reactiveLevel * 10}%)`;
  if (skin.pattern === 'frostfire') return `hsl(${reactiveLevel > 0.5 ? 22 : 198}, 95%, ${68 + reactiveLevel * 8}%)`;
  if (skin.pattern === 'bloodmoon') return rgba('#fb7185', .94);
  if (skin.reactive) return rgba(skin.accent, 0.9 + reactiveLevel * 0.08);
  return skin.accent;
}