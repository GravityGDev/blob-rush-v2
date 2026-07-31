import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import SkinPicker from './SkinPicker';

export default function MainMenu({ profile, onStart, onProfileChange }) {
  const [name, setName] = useState(profile.nickname || '');

  const start = () => {
    onProfileChange({ ...profile, nickname: name.trim() || 'Blob' });
    onStart(name.trim() || 'Blob');
  };

  return (
    <div className="absolute inset-0 grid place-items-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl bg-slate-900/90 p-6 ring-1 ring-white/10 shadow-2xl">
        <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-emerald-300 to-fuchsia-300">
          Blob Rush
        </h1>
        <p className="mt-1 text-xs text-slate-400">Eat, split, survive. Mouse to move · Space to split · W to feed.</p>

        <div className="mt-5 space-y-4">
          <Input
            value={name}
            maxLength={16}
            placeholder="Your nickname"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && start()}
            className="bg-slate-950/70 border-white/10 text-slate-100 placeholder:text-slate-500"
          />
          <div>
            <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">Skin</div>
            <SkinPicker
              owned={profile.ownedSkins}
              value={profile.skin}
              onChange={(skin) => onProfileChange({ ...profile, skin })}
            />
          </div>
          <Button onClick={start} className="w-full h-11 text-base font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950">
            Play
          </Button>
        </div>

        <div className="mt-4 flex justify-between text-xs text-slate-400">
          <span>Level {profile.level}</span>
          <span>{profile.coins.toLocaleString()} coins</span>
        </div>
      </div>
    </div>
  );
}