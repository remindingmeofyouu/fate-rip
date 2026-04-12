export default function Pricing() {
  return (
    <main style={{fontFamily:"'DM Sans',sans-serif",background:"#0d0d0d",minHeight:"100vh",padding:"48px 24px",display:"flex",flexDirection:"column",alignItems:"center",gap:"40px"}}>
      
      <div style={{textAlign:"center"}}>
        <p style={{fontSize:"12px",color:"#e02020",textTransform:"uppercase",letterSpacing:"2px",fontWeight:500,marginBottom:"12px"}}>Pricing</p>
        <h1 style={{fontSize:"36px",fontWeight:600,color:"#fff",letterSpacing:"-0.5px",lineHeight:1.15}}>Simple plans for every<br/><span style={{color:"#e02020"}}>fate</span></h1>
        <p style={{fontSize:"15px",color:"#555",marginTop:"10px"}}>Start free. Upgrade once, keep it forever.</p>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:"16px",width:"100%",maxWidth:"700px"}}>
        
        {/* Free */}
        <div style={{background:"#111",borderRadius:"14px",padding:"28px",display:"flex",flexDirection:"column",gap:"20px",border:"1px solid #1e1e1e"}}>
          <div>
            <p style={{fontSize:"13px",fontWeight:500,color:"#666",textTransform:"uppercase",letterSpacing:"1px"}}>Free</p>
            <p style={{fontSize:"40px",fontWeight:600,color:"#fff"}}>$0</p>
          </div>
          <div style={{height:"1px",background:"#1e1e1e"}}/>
          <div style={{display:"flex",flexDirection:"column",gap:"10px",flex:1}}>
            {["Basic customization","Basic effects","Add your socials","1 alias"].map(f => (
              <Feature key={f} label={f} active />
            ))}
            {["Advanced effects","Advanced customization","Exclusive badge","Discord role","Priority support","2 aliases"].map(f => (
              <Feature key={f} label={f} active={false} />
            ))}
          </div>
          <button style={{width:"100%",padding:"12px",borderRadius:"999px",fontFamily:"inherit",fontSize:"14px",fontWeight:500,cursor:"pointer",border:"none",background:"#1e1e1e",color:"#888",marginTop:"auto"}}>
            Get started free
          </button>
        </div>

        {/* Premium */}
        <div style={{background:"#111",borderRadius:"14px",padding:"28px",display:"flex",flexDirection:"column",gap:"20px",border:"1px solid #e02020",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:"#e02020"}}/>
          <div style={{position:"absolute",top:"16px",right:"16px",background:"#e02020",color:"#fff",fontSize:"11px",fontWeight:600,padding:"3px 10px",borderRadius:"999px",letterSpacing:"0.5px"}}>PREMIUM</div>
          <div>
            <p style={{fontSize:"13px",fontWeight:500,color:"#666",textTransform:"uppercase",letterSpacing:"1px"}}>Premium</p>
            <div style={{display:"flex",alignItems:"baseline",gap:"4px"}}>
              <span style={{fontSize:"40px",fontWeight:600,color:"#fff",letterSpacing:"-1px"}}>$5</span>
              <div style={{display:"flex",flexDirection:"column",gap:"2px",marginLeft:"2px"}}>
                <span style={{fontSize:"11px",color:"#e02020",fontWeight:500}}>one-time</span>
                <span style={{fontSize:"12px",color:"#555"}}>pay once, forever</span>
              </div>
            </div>
          </div>
          <div style={{height:"1px",background:"#1e1e1e"}}/>
          <div style={{display:"flex",flexDirection:"column",gap:"10px",flex:1}}>
            {["Everything in Free","Advanced effects","Advanced customization","Exclusive badge","Exclusive Discord role","Priority support","2 aliases"].map(f => (
              <Feature key={f} label={f} active />
            ))}
          </div>
          <button style={{width:"100%",padding:"12px",borderRadius:"999px",fontFamily:"inherit",fontSize:"14px",fontWeight:500,cursor:"pointer",border:"none",background:"#e02020",color:"#fff",marginTop:"auto"}}>
            Get Premium
          </button>
        </div>
      </div>

      <p style={{fontSize:"12px",color:"#444",textAlign:"center"}}>Payments securely handled by Stripe. One payment, lifetime access.</p>
    </main>
  )
}

function Feature({ label, active }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:"10px",fontSize:"13px",color: active ? "#aaa" : "#444"}}>
      <span style={{width:"16px",height:"16px",borderRadius:"50%",background:"#1a1a1a",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        {active
          ? <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#e02020" strokeWidth="2"><path d="M2 5l2 2 4-4"/></svg>
          : <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#333" strokeWidth="2"><path d="M3 3l4 4M7 3l-4 4"/></svg>
        }
      </span>
      {label}
    </div>
  )
}