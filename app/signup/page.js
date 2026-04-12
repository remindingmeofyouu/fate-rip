'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function SignUp() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSignUp = async () => {
    const email = document.getElementById('email')?.value
    const password = document.getElementById('password')?.value
    const username = document.getElementById('username')?.value

    if (!email || !password || !username) {
      setMessage('Please fill in all fields!')
      return
    }

    setLoading(true)
    setMessage('')

    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) { setMessage(error.message); setLoading(false); return }

    const { error: dbError } = await supabase.from('users').insert([{ username, email }])
    if (dbError) { setMessage('Username already taken!'); setLoading(false); return }

    setMessage('Account created! Check your email to confirm.')
    setLoading(false)
  }

  return (
    <div style={{background:'#0A0A0A',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Nunito,sans-serif'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        .box{background:#0f0f0f;border:1px solid #272727;border-radius:22px;padding:44px;width:100%;max-width:460px;display:flex;flex-direction:column;gap:18px;box-shadow:0 0 80px rgba(204,0,0,0.07);}
        h2{font-size:22px;font-weight:800;text-align:center;color:#F0F0F0;margin-bottom:4px;}
        .field-label{font-size:13px;font-weight:700;color:#888;margin-bottom:6px;}
        .input-wrap{display:flex;align-items:center;border:1.5px solid #2a2a2a;border-radius:12px;background:#0a0a0a;padding:12px 16px;}
        .input-wrap:focus-within{border-color:rgba(204,0,0,0.5);}
        .input-wrap input{background:transparent;border:none;outline:none;color:#F0F0F0;font-family:'Nunito',sans-serif;font-size:14px;font-weight:700;width:100%;}
        .input-wrap input::placeholder{color:#333;}
        .btn{padding:14px;border-radius:999px;background:#CC0000;border:none;color:#fff;font-family:'Nunito',sans-serif;font-size:15px;font-weight:800;cursor:pointer;margin-top:4px;width:100%;}
        .btn:hover{background:#a80000;}
        .btn:disabled{opacity:0.6;cursor:not-allowed;}
        .msg{text-align:center;font-size:13px;color:#888;}
        .login-link{color:#CC0000;text-decoration:none;text-align:center;font-size:13px;font-weight:700;display:block;}
      `}</style>
      <div className="box">
        <h2>Create a fate.rip account</h2>
        <div>
          <div className="field-label">Email</div>
          <div className="input-wrap">
            <input id="email" type="email" placeholder="Email" />
          </div>
        </div>
        <div>
          <div className="field-label">Password</div>
          <div className="input-wrap">
            <input id="password" type="password" placeholder="Password" />
          </div>
        </div>
        <div>
          <div className="field-label">Username</div>
          <div className="input-wrap">
            <input id="username" type="text" placeholder="fate.rip/" />
          </div>
        </div>
        <button className="btn" onClick={handleSignUp} disabled={loading}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
        {message && <div className="msg">{message}</div>}
        <a href="/login" className="login-link">Already have an account? Log in</a>
      </div>
    </div>
  )
}