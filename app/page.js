'use client'

export default function Home() {
  return (
    <iframe
      srcDoc={`
<!DOCTYPE html>
<html>
<head>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
:root{--red:#CC0000;--red-bright:#FF2222;--black:#0A0A0A;--white:#F0F0F0;}
body{background:var(--black);color:var(--white);font-family:'Nunito',sans-serif;min-height:100vh;overflow-x:hidden;}
nav{position:fixed;top:0;left:0;right:0;display:flex;align-items:center;justify-content:space-between;padding:0 52px;height:96px;background:rgba(10,10,10,0.94);backdrop-filter:blur(20px);border-bottom:1px solid #1e1e1e;z-index:100;}
.logo{font-size:22px;font-weight:800;color:var(--white);text-decoration:none;display:flex;align-items:center;gap:13px;}
.logo img{width:36px;height:36px;object-fit:contain;}
.nav-links{display:flex;align-items:center;gap:6px;list-style:none;}
.nav-links li a{color:#888;text-decoration:none;font-size:16px;font-weight:700;padding:12px 20px;border-radius:10px;transition:all 0.15s;}
.nav-links li a:hover{color:var(--white);background:rgba(255,255,255,0.06);}
.nav-links li a.btn-signup{color:#fff;background:var(--red);border-radius:999px;padding:13px 28px;margin-left:10px;font-weight:800;font-size:16px;transition:all 0.2s;}
.nav-links li a.btn-signup:hover{background:#a80000;transform:translateY(-1px);box-shadow:0 4px 20px rgba(204,0,0,0.4);}
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding-top:96px;position:relative;overflow:hidden;}
.hero-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(204,0,0,0.055) 1px,transparent 1px),linear-gradient(90deg,rgba(204,0,0,0.055) 1px,transparent 1px);background-size:60px 60px;mask-image:radial-gradient(ellipse 90% 80% at 50% 40%,black 20%,transparent 100%);}
.orb-1{position:absolute;width:900px;height:600px;background:radial-gradient(circle,rgba(200,0,0,0.13) 0%,transparent 70%);top:-100px;left:50%;transform:translateX(-50%);border-radius:50%;filter:blur(140px);pointer-events:none;}
.hero-title{position:relative;z-index:10;font-size:clamp(80px,13vw,150px);font-weight:900;letter-spacing:-3px;line-height:1;color:var(--white);text-align:center;margin-bottom:44px;text-shadow:0 0 80px rgba(200,0,0,0.18);}
.hero-title .red{color:var(--red-bright);}
.claim-section{position:relative;z-index:10;width:100%;max-width:680px;padding:0 24px;margin-bottom:40px;}
.claim-box{width:100%;background:#0f0f0f;border:1px solid #272727;border-radius:22px;padding:44px 44px 40px;display:flex;flex-direction:column;gap:26px;box-shadow:0 0 80px rgba(204,0,0,0.07),0 30px 80px rgba(0,0,0,0.7);}
.claim-box-header{text-align:center;}
.claim-box-header h2{font-size:26px;font-weight:800;color:var(--white);letter-spacing:-0.5px;line-height:1.3;}
.claim-box-header p{font-size:14px;color:#4a4a4a;font-weight:600;margin-top:8px;}
.input-row{display:flex;align-items:stretch;border:1.5px solid #2a2a2a;border-radius:999px;overflow:hidden;background:#0a0a0a;transition:border-color 0.2s;height:54px;}
.input-row:focus-within{border-color:rgba(204,0,0,0.5);box-shadow:0 0 0 3px rgba(204,0,0,0.08);}
.input-prefix{display:flex;align-items:center;padding:0 0 0 22px;font-size:15px;font-weight:700;color:#4a4a4a;white-space:nowrap;user-select:none;}
.input-field{flex:1;background:transparent;border:none;outline:none;font-family:'Nunito',sans-serif;font-size:15px;font-weight:700;color:var(--white);padding:0 10px 0 3px;min-width:0;}
.input-field::placeholder{color:#2e2e2e;}
.input-btn{background:var(--red);border:none;outline:none;color:#fff;font-family:'Nunito',sans-serif;font-size:15px;font-weight:800;padding:0 30px;cursor:pointer;border-radius:0 999px 999px 0;transition:background 0.2s;white-space:nowrap;}
.input-btn:hover{background:#a80000;}
.or-row{display:flex;align-items:center;gap:14px;font-size:12px;color:#2e2e2e;font-weight:700;letter-spacing:1px;text-transform:uppercase;}
.or-row hr{flex:1;border:none;border-top:1px solid #1e1e1e;}
.secondary-btns{display:flex;gap:12px;}
.btn-outline{flex:1;display:flex;align-items:center;justify-content:center;padding:14px 20px;border-radius:999px;border:1.5px solid #252525;background:transparent;color:#666;font-family:'Nunito',sans-serif;font-size:14px;font-weight:700;text-decoration:none;cursor:pointer;transition:all 0.2s;}
.btn-outline:hover{border-color:#444;color:var(--white);background:rgba(255,255,255,0.04);}
.stats-bar{position:relative;z-index:10;display:flex;border:1px solid #1a1a1a;background:rgba(12,12,12,0.95);border-radius:14px;overflow:hidden;white-space:nowrap;}
.stat-item{padding:16px 48px;border-right:1px solid #1a1a1a;text-align:center;}
.stat-item:last-child{border-right:none;}
.stat-num{font-size:22px;font-weight:800;color:var(--red-bright);display:block;}
.stat-label{font-size:11px;font-weight:600;color:#444;text-transform:uppercase;letter-spacing:1px;}
</style>
</head>
<body>
<nav>
  <a href="#" class="logo">
    <img src="https://media.discordapp.net/attachments/1492245469785755840/1492688630685106347/scythe.png?ex=69dc3e1e&is=69daec9e&hm=ff8a4b2ed25f7a8b663564ff4c1526d69b7469e999a7e8ea4722dfae6b2c640e&=&format=webp&quality=lossless" alt="scythe" onerror="this.style.display='none'"/>
    fate.rip
  </a>
  <ul class="nav-links">
    <li><a href="https://discord.gg/tdvqDAdRYt" target="_blank">Discord</a></li>
    <li><a href="/pricing" target="_top">Pricing</a></li>
    <li><a href="/dashboard" target="_top">Dashboard</a></li>
    <li><a href="/signup" target="_top" class="btn-signup">Sign Up</a></li>
  </ul>
</nav>
<section class="hero">
  <div class="hero-grid"></div>
  <div class="orb-1"></div>
  <h1 class="hero-title">fate<span class="red">.rip</span></h1>
  <div class="claim-section">
    <div class="claim-box">
      <div class="claim-box-header">
        <h2>Claim your own user today!</h2>
        <p>Your unique profile link, yours forever.</p>
      </div>
      <div class="input-row">
        <div class="input-prefix">fate.rip/</div>
        <input class="input-field" type="text" placeholder="yourname" autocomplete="off" spellcheck="false"/>
        <button class="input-btn">Claim →</button>
      </div>
      <div class="or-row"><hr/>or<hr/></div>
      <div class="secondary-btns">
        <a href="/pricing" target="_top" class="btn-outline">View Pricing</a>
        <a href="https://discord.gg/tdvqDAdRYt" target="_blank" class="btn-outline">Join Discord</a>
      </div>
    </div>
  </div>
  <div class="stats-bar">
    <div class="stat-item"><span class="stat-num">12K+</span><span class="stat-label">Users</span></div>
    <div class="stat-item"><span class="stat-num">99.9%</span><span class="stat-label">Uptime</span></div>
    <div class="stat-item"><span class="stat-num">∞</span><span class="stat-label">Customization</span></div>
  </div>
</section>
</body>
</html>
      `}
      style={{ width: '100%', height: '100vh', border: 'none' }}
    />
  )
}