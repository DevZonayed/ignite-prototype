export default function Toast({ message, visible }) {
  const style = {
    position: 'fixed',
    left: '50%',
    bottom: '28px',
    transform: visible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(20px)',
    background: 'var(--text)',
    color: 'var(--surface)',
    padding: '11px 18px',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: 600,
    boxShadow: 'var(--shadow)',
    opacity: visible ? 1 : 0,
    pointerEvents: 'none',
    transition: '.25s',
    zIndex: 200,
  }
  return <div id="toast" style={style}>{message}</div>
}
