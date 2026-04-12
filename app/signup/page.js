'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function SignUp() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignUp = async () => {
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
    <iframe srcDoc={`
<!DOCTYPE html>
<html>
<head>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{background:#0A0A0A;color:#F0F0F0;font-family:'Nunito',sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;}
.box{background:#0f0f0f;border:1px solid #272727;border-radius:22px;padding:44px;width:100%;max-width:460px;display:flex;flex-direction:column;gap:18px;box-shadow:0 0 80px rgba(204,0,0,0.07);}
h2{font-size:22px;font-weight:800;text-align:center;margin-bottom:4px;}
.field-label{font-size:13px;font-weight:700;color:#888;margin-bottom:6px;}
.input-wrap{display:flex;align-items:center;border:1.5px solid #2a2a2a;border-radius:12px;background:#0a0a0a;padding:12px 16px;gap:12px;}
.input-wrap:focus-within{border-color:rgba(204,0,0,0.5);}
.input-wrap span{font-size:18px;flex-shrink:0;}
.input-wrap input{background:transparent;border:none;outline:none;color:#F0F0F0;font-family:'Nunito',sans-serif;font-size:14px;font-weight:700;width:100%;}
.input-wrap input::placeholder{color:#333;}
button{padding:14px;border-radius:999px;background:#CC0000;border:none;color:#fff;font-family:'Nunito',sans-serif;font-size:15px;font-weight:800;cursor:pointer;margin-top:4px;}
button:hover{background:#a80000;}
.msg{text-align:center;font-size:13px;color:#888;}
.login-link{color:#CC0000;text-decoration:none;text-align:center;font-size:13px;font-weight:700;display:block;}
</style>
</head>
<body>
<div class="box">
  <h2>Create a fate.rip account</h2>

  <div>
    <div class="field-label">Email</div>
    <div class="input-wrap">
      <input id="email" type="email" placeholder="Email" />
    </div>
  </div>

  <div>
    <div class="field-label">Password</div>
    <div class="input-wrap">
      <input id="password" type="password" placeholder="Password" />
    </div>
  </div>

  <div>
    <div class="field-label">Username</div>
    <div class="input-wrap">
      <input id="username" type="text" placeholder="fate.rip/" />
    </div>
  </div>

  <button onclick="window.parent.handleSignUp()">Sign Up</button>
  <div class="msg" id="msg"></div>
  <a href="/login" class="login-link">Already have an account? Log in</a>
</div>
</body>
</html>
    `} style={{width:'100%',height:'100vh',border:'none'}} />
  )
}