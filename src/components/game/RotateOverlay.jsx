// Portrait "rotate your phone" prompt, verbatim from the original build.
export default function RotateOverlay() {
  return (
    <div id="rotateOverlay">
      <div className="rotate-card">
        <div className="rotate-phone">📱</div>
        <h2>Rotate to landscape</h2>
        <p>Blob Rush is designed for wide-screen play. Turn your phone sideways to continue.</p>
      </div>
    </div>
  );
}