import { useState } from 'react';
import MainMenuScreen from '@/components/menu/MainMenuScreen';
import { loadProfile, saveProfile, xpForLevel } from '@/game/save';

export default function MenuPreview() {
  const [profile, setProfile] = useState(() => loadProfile());

  const setNickname = (nickname) => {
    const next = { ...profile, nickname };
    setProfile(next);
    saveProfile(next);
  };

  return (
    <MainMenuScreen
      profile={{ ...profile, xpPercent: (profile.xp / xpForLevel(profile.level)) * 100 }}
      onNickname={setNickname}
      onPlay={() => { window.location.href = '/'; }}
    />
  );
}