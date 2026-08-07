import { useState } from 'react'
import { initialAnnPosts } from '../data.js'

const audiences = ['All parents', 'By school', 'By class']

const mediaChips = [
  { color: '#7c3aed', label: 'MP4', text: 'Testing your lamp' },
  { color: '#0ea5e9', label: 'IMG', text: 'Kit checklist' },
  { color: '#ef4444', label: 'PDF', text: 'LG-305 manual' },
]

export default function Announcements({ active, onToast }) {
  const [posts, setPosts] = useState(initialAnnPosts)
  const [title, setTitle] = useState('')
  const [msg, setMsg] = useState("Dear parents, please ensure your child brings the Little Genius Kit for this week's Smart Reading Lamp build.")
  const [aud, setAud] = useState('All parents')
  const [selectedMedia, setSelectedMedia] = useState([])

  function toggleMedia(i) {
    setSelectedMedia((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]))
  }

  function post() {
    const t = (title || '').trim() || 'Announcement'
    const m = (msg || '').trim() || '—'
    setPosts((prev) => [[t, m, aud, 'just now'], ...prev])
    setTitle('')
    onToast('Posted to parents · ' + aud)
  }

  return (
    <section className={'view' + (active ? ' active' : '')} id="view-announcements">
      <div className="grid2">
        <div className="panel">
          <div className="ph"><h3>New post to parents</h3></div>
          <div style={{ padding: '4px 2px' }}>
            <div className="edlabel">Title</div>
            <input
              id="annTitle"
              placeholder="e.g. Little Genius Kit — Term 3 update"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', border: '1.5px solid var(--border)', borderRadius: '9px', padding: '11px 13px', fontSize: '13px', background: 'var(--surface)', color: 'var(--text)', fontFamily: 'inherit', marginBottom: '12px' }}
            />
            <div className="edlabel">Message</div>
            <textarea
              id="annMsg"
              rows="3"
              placeholder="Write an announcement or homework note for parents…"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', border: '1.5px solid var(--border)', borderRadius: '9px', padding: '11px 13px', fontSize: '13px', background: 'var(--surface)', color: 'var(--text)', fontFamily: 'inherit', resize: 'vertical', marginBottom: '12px' }}
            />
            <div className="edlabel">Attach media</div>
            <div className="matrow" id="annMedia" style={{ marginBottom: '12px' }}>
              {mediaChips.map((c, i) => (
                <div
                  key={i}
                  className={'matchip' + (selectedMedia.includes(i) ? ' on' : '')}
                  data-annmedia=""
                  onClick={() => toggleMedia(i)}
                >
                  <span className="mi" style={{ background: c.color }}>{c.label}</span> {c.text}
                </div>
              ))}
            </div>
            <div className="edlabel">Audience</div>
            <div id="annAud" style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', marginBottom: '14px' }}>
              {audiences.map((a) => (
                <button key={a} className={'annseg' + (aud === a ? ' on' : '')} data-aud={a} onClick={() => setAud(a)}>{a}</button>
              ))}
            </div>
            <button className="btnP" id="annPost" onClick={post}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg> Post to parents</button>
          </div>
        </div>
        <div className="panel">
          <div className="ph"><h3>Recent posts</h3></div>
          <div id="annList">
            {posts.map((p, i) => (
              <div className="annitem" key={i}>
                <div className="at">{p[0]}</div>
                <div className="am">{p[1]}</div>
                <div className="ameta"><span>👥 {p[2]}</span><span>·</span><span>{p[3]}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
