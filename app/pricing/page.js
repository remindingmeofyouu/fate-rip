export const metadata = {
  title: 'fate.rip | Pricing',
}
export default function Pricing() {
  return (
    <main className="pg">
      <div className="header">
        <div className="eyebrow">Pricing</div>
        <div className="title">Simple plans for every<br/><span>fate</span></div>
        <div className="sub">Start free. Upgrade once, keep it forever.</div>
      </div>

      <div className="cards">
        <div className="card">
          <div>
            <div className="plan-name">Free</div>
            <div className="price"><span className="price-free">$0</span></div>
          </div>
          <div className="divider"/>
          <div className="features">
            {["Basic customization","Basic effects","Add your socials","1 alias"].map(f => (
              <div key={f} className="feat"><span className="dot"><svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#e02020" strokeWidth="2"><path d="M2 5l2 2 4-4"/></svg></span>{f}</div>
            ))}
            {["Advanced effects","Advanced customization","Exclusive badge","Discord role","Priority support","2 aliases"].map(f => (
              <div key={f} className="feat dim"><span className="dot"><svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#333" strokeWidth="2"><path d="M3 3l4 4M7 3l-4 4"/></svg></span>{f}</div>
            ))}
          </div>
          <button className="btn btn-free">Get started free</button>
        </div>

        <div className="card premium">
          <div className="badge">PREMIUM</div>
          <div>
            <div className="plan-name">Premium</div>
            <div className="price">
              <span className="price-num">$5</span>
              <div className="price-tag">
                <span className="price-once">one-time</span>
                <span className="price-per">pay once, forever</span>
              </div>
            </div>
          </div>
          <div className="divider"/>
          <div className="features">
            {["Basic customization","Basic effects","Add your socials","Advanced effects","Advanced customization","Exclusive badge","Exclusive Discord role","Priority support","2 aliases"].map(f => (
              <div key={f} className="feat"><span className="dot"><svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#e02020" strokeWidth="2"><path d="M2 5l2 2 4-4"/></svg></span>{f}</div>
            ))}
          </div>
          <button className="btn btn-premium">Get Premium</button>
        </div>
      </div>
      <div className="note">Payments securely handled by Stripe. One payment, lifetime access.</div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        .pg{font-family:'DM Sans',sans-serif;background:#0d0d0d;min-height:100vh;padding:48px 24px;display:flex;flex-direction:column;align-items:center;gap:40px;}
        .header{text-align:center;}
        .eyebrow{font-size:12px;color:#e02020;text-transform:uppercase;letter-spacing:2px;font-weight:500;margin-bottom:12px;}
        .title{font-size:36px;font-weight:600;color:#fff;letter-spacing:-0.5px;line-height:1.15;}
        .title span{color:#e02020;}
        .sub{font-size:15px;color:#555;margin-top:10px;}
        .cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;width:100%;max-width:700px;}
        .card{background:#111;border-radius:14px;padding:28px;display:flex;flex-direction:column;gap:20px;border:1px solid #1e1e1e;}
        .card.premium{border-color:#e02020;position:relative;overflow:hidden;}
        .card.premium::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:#e02020;}
        .badge{position:absolute;top:16px;right:16px;background:#e02020;color:#fff;font-size:11px;font-weight:600;padding:3px 10px;border-radius:999px;letter-spacing:0.5px;}
        .plan-name{font-size:13px;font-weight:500;color:#666;text-transform:uppercase;letter-spacing:1px;}
        .price{display:flex;align-items:baseline;gap:4px;}
        .price-num{font-size:40px;font-weight:600;color:#fff;letter-spacing:-1px;}
        .price-tag{display:flex;flex-direction:column;gap:2px;margin-left:2px;}
        .price-per{font-size:12px;color:#555;line-height:1.2;}
        .price-once{font-size:11px;color:#e02020;font-weight:500;line-height:1.2;}
        .price-free{font-size:40px;font-weight:600;color:#fff;}
        .divider{height:1px;background:#1e1e1e;}
        .features{display:flex;flex-direction:column;gap:10px;flex:1;}
        .feat{display:flex;align-items:center;gap:10px;font-size:13px;color:#aaa;}
        .feat .dot{width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:#1a1a1a;}
        .feat.dim{color:#444;}
        .btn{width:100%;padding:12px;border-radius:999px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;cursor:pointer;border:none;transition:opacity 0.15s;margin-top:auto;}
        .btn-free{background:#1e1e1e;color:#888;}
        .btn-free:hover{color:#fff;}
        .btn-premium{background:#e02020;color:#fff;}
        .btn-premium:hover{opacity:0.85;}
        .note{font-size:12px;color:#444;text-align:center;}
      `}</style>
    </main>
  )
}