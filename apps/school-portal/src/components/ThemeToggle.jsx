export default function ThemeToggle({ theme, onToggle }) {
  return (
    <div className={'toggle' + (theme !== 'dark' ? ' off' : '')} id="themeToggle" onClick={onToggle}>
      <span></span>
    </div>
  )
}
