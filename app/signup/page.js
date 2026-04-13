'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function SignUp() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState('')
  const [usernameTimer, setUsernameTimer] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const u = params.get('username')
    if (u) {
      const input = document.getElementById('username')
      if (input) {
        input.value = u
        checkUsername(u)
      }
    }
  }, [])

  const checkUsername = (value) => {
    if (usernameTimer) clearTimeout(usernameTimer)
    if (!value) { setUsernameStatus(''); return }

    const valid = /^[a-zA-Z0-9_]+$/.test(value)
    if (!valid) { setUsernameStatus('invalid'); return }
    if (value.length < 3) { setUsernameStatus('short'); return }

    setUsernameStatus('checking')
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('users')
        .select('username')
        .eq('username', value)
        .single()
      setUsernameStatus(data ? 'taken' : 'available')
    }, 500)
    setUsernameTimer(timer)
  }

  const handleSignUp = async () => {
    const email = document.getElementById('email')?.value
    const password = document.getElementById('password')?.value
    const username = document.getElementById('username')?.value

    if (!email || !password || !username) {
      setMessage('Please fill in all fields!')
      return
    }

    if (username.length < 3) {
      setMessage('Username must be at least 3 characters!')
      return
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setMessage('Only letters, numbers, and _ allowed!')
      return
    }

    if (usernameStatus === 'taken') {
      setMessage('Username already taken!')
      return
    }

    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signUp({ email, password })
    if (error) { setMessage(error.message); setLoading(false); return }

    const { error: dbError } = await supabase.from('users').insert([{ username, email }])
    if (dbError) { setMessage('Username already taken!'); setLoading(false); return }

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
        .eye-btn { background: none; border: none; cursor: pointer; padding: 8px; margin-left: 4px; color: #444; display: flex; align-items: center; transition: color 0.15s; border-radius: 6px; flex-shrink: 0; }
        .eye-btn:hover { color: #888; }
        .username-status { font-size: 12px; font-weight: 700; margin-top: 6px; padding-left: 4px; }
        .status-available { color: #22c55e; }
        .status-taken { color: #e02020; }
        .status-checking { color: #555; }
        .btn { padding: 14px; border-radius: 999px; background: #CC0000; border: none; color: #fff; font-family: 'Nunito', sans-serif; font-size: 15px; font-weight: 800; cursor: pointer; margin-top: 4px; width: 100%; transition: background 0.2s; }
        .btn:hover { background: #a80000; }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .msg { text-align: center; font-size: 13px; color: #888; }
        .login-link { color: #CC0000; text-decoration: none; text-align: center; font-size: 13px; font-weight: 700; display: block; }
        .login-link:hover { color: #ff2222; }
      `}</style>
      <div className="box">
        <h2>Create a fate.rip account</h2>
        <div>
          <div className="field-label">Email</div>
          <div className="input-wrap">
            <input id="email" type="email" placeholder="your@email.com" />
          </div>
        </div>
        <div>
          <div className="field-label">Password</div>
          <div className="input-wrap">
            <input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" />
            <button className="eye-btn" onClick={() => setShowPassword(!showPassword)} type="button">
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </div>
        <div>
          <div className="field-label">Username</div>
          <div className="input-wrap">
            <input id="username" type="text" placeholder="fate.rip/" onChange={(e) => checkUsername(e.target.value)} />
          </div>
          {usernameStatus === 'available' && <div className="username-status status-available">✓ This username is available!</div>}
          {usernameStatus === 'taken' && <div className="username-status status-taken">✗ Sorry, this username is taken!</div>}
          {usernameStatus === 'checking' && <div className="username-status status-checking">Checking...</div>}
          {usernameStatus === 'invalid' && <div className="username-status status-taken">✗ Only letters, numbers, and _ allowed!</div>}
          {usernameStatus === 'short' && <div className="username-status status-taken">✗ Username must be at least 3 characters!</div>}
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