import { media } from '../data.js'

export default function Media({ active }) {
  return (
    <section className={'view' + (active ? ' active' : '')} id="view-media">
      <div className="toolbar">
        <div className="filter">Type: All</div>
        <div className="filter">Unit: All</div>
        <span className="sp"></span>
        <button className="btnP"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v12M8 11l4 4 4-4M4 21h16" /></svg> Upload media</button>
      </div>
      <div className="panel">
        <div className="media-grid" id="mediaGrid">
          {media.map((m) => (
            <div className="mcard" key={m[3]}>
              <div className="mt" style={{ background: m[2] }}><span style={{ fontFamily: 'var(--fd)', fontWeight: 900, fontSize: '15px' }}>.{m[1]}</span></div>
              <div className="mm"><div className="mn">{m[0]}</div><div className="ms">{m[3]}</div></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
