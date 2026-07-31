import { useState } from 'react';
import MainMenuScreen from '@/components/menu/MainMenuScreen';
import SkinsModal from '@/components/menu/SkinsModal';
import ProfileModal from '@/components/menu/ProfileModal';
import GameScreen from '@/components/game/GameScreen';
import { loadProfile, saveProfile, addXp, xpForLevel } from '@/game/save';

export default function Play() {
  const [profile, setProfile] = useState(() => loadProfile());
  const [playing, setPlaying] = useState(false);
  const [modal, setModal] = useState(null);

  const update = (patch) => {
    const next = { ...profile, ...patch };
    setProfile(next);
    saveProfile(next);
  };

  const handleMatchEnd = (result) => {
    const coins = Math.max(10, Math.round(result.maxMass / 40));
    const xp = Math.max(15, Math.round(result.maxMass / 25 + result.kills * 20));
    const next = {
      ...profile,
      coins: profile.coins + coins,
      stats: {
        ...profile.stats,
        games: profile.stats.games + 1,
        highestMass: Math.max(profile.stats.highestMass, Math.round(result.maxMass)),
        timePlayed: Math.round(profile.stats.timePlayed + result.time),
        cellsEaten: profile.stats.cellsEaten + result.kills,
      },
    };
    const { levelsGained, tokensGained } = addXp(next, xp);
    setProfile(next);
    saveProfile(next);
    return { ...result, coins, xp, tokens: tokensGained, levelsGained };
  };

  if (playing) {
    return <GameScreen profile={profile} onExit={() => setPlaying(false)} onMatchEnd={handleMatchEnd} />;
  }

  return (
    <>
      <MainMenuScreen
        profile={{ ...profile, xpPercent: (profile.xp / xpForLevel(profile.level)) * 100 }}
        onNickname={(nickname) => update({ nickname })}
        onPlay={() => setPlaying(true)}
        onOpenModal={setModal}
      />
      {modal === 'skins' && (
        <SkinsModal
          profile={profile}
          onEquip={(skin) => update({ skin })}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'profile' && <ProfileModal profile={profile} onClose={() => setModal(null)} />}
    </>
  );
}