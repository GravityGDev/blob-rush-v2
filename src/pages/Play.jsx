const GAME_URL = 'https://media.base44.com/files/public/6a6bd9617f65c58d9eca35f3/f02428707_BlobRush-Admin-Layout-Performance-Fix-Playtest-1.html';

export default function Play() {
  return (
    <div className="fixed inset-0 overflow-hidden bg-slate-950">
      <iframe
        src={GAME_URL}
        title="Blob Rush"
        className="h-full w-full border-0"
        allow="autoplay; fullscreen; gamepad"
      />
    </div>
  );
}