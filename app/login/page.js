'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleLogin = async () => {
    const email = document.getElementById('email')?.value
    const password = document.getElementById('password')?.value

    if (!email || !password) {
      setMessage('Please fill in all fields!')
      return
    }

    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div style={{ background: '#0A0A0A', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        .box { background: #0f0f0f; border: 1px solid #272727; border-radius: 22px; padding: 44px; width: 100%; max-width: 460px; display: flex; flex-direction: column; gap: 18px; box-shadow: 0 0 80px rgba(204,0,0,0.07); }
        h2 { font-size: 22px; font-weight: 800; text-align: center; color: #F0F0F0; margin-bottom: 4px; }
        .field-label { font-size: 13px; font-weight: 700; color: #888; margin-bottom: 6px; }
        .input-wrap { display: flex; align-items: center; border: 1.5px solid #2a2a2a; border-radius: 12px; background: #0a0a0a; padding: 12px 16px; transition: border-color 0.2s; }
        .input-wrap:focus-within { border-color: rgba(204,0,0,0.5); }
        .input-wrap input { background: transparent; border: none; outline: none; color: #F0F0F0; font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 700; width: 100%; }
        .input-wrap input::placeholder { color: #333; }
        .btn { padding: 14px; border-radius: 999px; background: #CC0000; border: none; color: #fff; font-family: 'Nunito', sans-serif; font-size: 15px; font-weight: 800; cursor: pointer; margin-top: 4px; width: 100%; transition: background 0.2s; }
        .btn:hover { background: #a80000; }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .msg { text-align: center; font-size: 13px; color: #888; }
        .bottom-links { display: flex; flex-direction: column; gap: 8px; }
        .link { color: #CC0000; text-decoration: none; text-align: center; font-size: 13px; font-weight: 700; display: block; transition: color 0.15s; }
        .link:hover { color: #ff2222; }
        .divider { display: flex; align-items: center; gap: 12px; font-size: 12px; color: #2e2e2e; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
        .divider hr { flex: 1; border: none; border-top: 1px solid #1e1e1e; }
        .logo { text-align: center; font-size: 20px; font-weight: 800; color: #F0F0F0; margin-bottom: 4px; }
        .logo span { color: #CC0000; }
      `}</style>

      <div className="box">
        <div className="logo">fate<span>.rip</span></div>
        <h2>Welcome back</h2>

        <div>
          <div className="field-label">Email</div>
          <div className="input-wrap">
            <input id="email" type="email" placeholder="your@email.com" />
          </div>
        </div>

        <div>
          <div className="field-label">Password</div>
          <div className="input-wrap">
            <input id="password" type="password" placeholder="••••••••" onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
          </div>
        </div>

        <button className="btn" onClick={handleLogin} disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>

        {message && <div className="msg">{message}</div>}

        <div className="divider"><hr />or<hr /></div>

        <div className="bottom-links">
          <a href="/signup" className="link">Don't have an account? Sign up</a>
        </div>
      </div>
    </div>
  )
}