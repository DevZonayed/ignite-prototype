import { cls } from '../data.js'

export default function Classes({ active }) {
  return (
    <section className={'view' + (active ? ' active' : '')} id="view-classes">
      <div className="cardgrid" id="classGrid">
        {cls.map((c, i) => (
          <div className="classcard" key={c[0] + i}>
            <div className="cc">{c[0]}</div>
            <div className="ct">{c[1]} · Digital Innovation</div>
            <div className="cm">
              <div>
                Learners<b>{c[2]}</b>
              </div>
              <div>
                Coverage<b>{c[3]}%</b>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
