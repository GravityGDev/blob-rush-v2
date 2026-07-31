import { useState } from 'react';
import MainMenuScreen from '@/components/menu/MainMenuScreen';
import SkinsModal from '@/components/menu/SkinsModal';
import ProfileModal from '@/components/menu/ProfileModal';
import ShopModal from '@/components/menu/ShopModal';
import SeasonPassModal from '@/components/menu/SeasonPassModal';
import LuckyModal from '@/components/menu/LuckyModal';
import SettingsModal from '@/components/menu/SettingsModal';
import ServerModal from '@/components/menu/ServerModal';
import StaffModal from '@/components/menu/StaffModal';
import GameScreen from '@/components/game/GameScreen';
import RotateOverlay from '@/components/game/RotateOverlay';
import '@/styles/blobrush-game.css';
import { loadProfile, saveProfile, addXp, xpForLevel } from '@/game/save';
import { addSeasonProgress, boosterActive } from '@/game/progression';
import { findMode, findRoom } from '@/game/rooms';

export default function Play() {
  const [profile, setProfile] = useState(() => loadProfile());
  const [playing, setPlaying] = useState(false);
  const [modal, setModal] = useState(null);

  const commit = (next) => { setProfile(next); saveProfile(next); };
  const update = (patch) => commit({ ...profile, ...patch });

  const handleMatchEnd = (result) => {
    const coins = Math.max(10, Math.round(result.maxMass / 40));
    const baseXp = Math.max(15, Math.round(result.maxMass / 25 + result.kills * 20));
    const xp = boosterActive(profile, 'xp') ? baseXp * 2 : baseXp;
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
    addSeasonProgress(next, Math.round(xp / 2));
    commit(next);
    return { ...result, coins, xp, tokens: tokensGained, levelsGained };
  };

  if (playing) {
    return (
      <>
        <GameScreen profile={profile} onProfile={commit} onExit={() => setPlaying(false)} onMatchEnd={handleMatchEnd} />
        <RotateOverlay />
      </>
    );
  }

  const mode = findMode(profile.room.modeId);
  const room = findRoom(profile.room.roomId);
  const close = () => setModal(null);

  return (
    <>
      <MainMenuScreen
        profile={{ ...profile, xpPercent: (profile.xp / xpForLevel(profile.level)) * 100 }}
        roomLabel={`${mode.name} · ${room.label}`}
        roomMeta={`${room.region} · ${room.players}/${room.capacity} players`}
        onNickname={(nickname) => update({ nickname })}
        onPlay={() => setPlaying(true)}
        onOpenModal={setModal}
      />
      {modal === 'skins' && <SkinsModal profile={profile} onEquip={(skin) => update({ skin })} onProfile={commit} onClose={close} />}
      {modal === 'profile' && <ProfileModal profile={profile} onClose={close} />}
      {modal === 'shop' && <ShopModal profile={profile} onProfile={commit} onClose={close} />}
      {modal === 'season' && <SeasonPassModal profile={profile} onProfile={commit} onClose={close} />}
      {modal === 'lucky' && <LuckyModal profile={profile} onProfile={commit} onClose={close} />}
      {modal === 'settings' && <SettingsModal profile={profile} onChange={(settings) => update({ settings })} onClose={close} />}
      {modal === 'server' && <ServerModal profile={profile} onSelect={(room2) => update({ room: room2 })} onClose={close} />}
      {(modal === 'admin' || modal === 'moderation') && (
        <StaffModal mode={modal} profile={profile} onProfile={commit} onClose={close} />
      )}
      <RotateOverlay />
    </>
  );
}