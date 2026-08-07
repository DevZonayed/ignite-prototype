import ThemeToggle from '../components/ThemeToggle.jsx'

export default function Settings({ active, theme, onToggleTheme }) {
  return (
    <section className={'view' + (active ? ' active' : '')} id="view-settings">
      <div className="panel" style={{ maxWidth: '640px' }}>
        <div className="ph">
          <h3>School profile</h3>
        </div>
        <div className="settingrow">
          <div className="sl">
            <div className="sll">School name</div>
            <div className="sd">Bright Future Academy</div>
          </div>
          <span className="rowbtn">Edit</span>
        </div>
        <div className="settingrow">
          <div className="sl">
            <div className="sll">Region</div>
            <div className="sd">Lagos</div>
          </div>
          <span className="rowbtn">Edit</span>
        </div>
        <div className="settingrow">
          <div className="sl">
            <div className="sll">Academic calendar</div>
            <div className="sd">Term 2 · 2026 · timezone WAT</div>
          </div>
          <span className="rowbtn">Edit</span>
        </div>
        <div className="settingrow">
          <div className="sl">
            <div className="sll">Dark theme</div>
            <div className="sd">Switch the portal appearance</div>
          </div>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>
    </section>
  )
}
