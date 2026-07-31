import '@/styles/blobrush-modal.css';

export default function ModalShell({ title, onClose, extraHead, className = '', bodyClass = '', beforeBody = null, children }) {
  return (
    <div className="modal-backdrop" onPointerDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`modal ${className}`}>
        <div className="modal-head">
          <h2>{title}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {extraHead}
            <button className="close-btn" onClick={onClose} aria-label="Close">✕</button>
          </div>
        </div>
        {beforeBody}
        <div className={`modal-scroll ${bodyClass}`}>{children}</div>
      </div>
    </div>
  );
}