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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    const { error: dbError } = await supabase
      .from('users')
      .insert([{ username, email }])

    if (dbError) {
      setMessage('Username already taken!')
      setLoading(false)
      return
    }

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
.box{background:#0f0f0f;border:1px solid #272727;border-radius:22px;padding:44px;width:100%;max-width:460px;display:flex;flex-direction:column;gap:20px;box-shadow:0 0 80px rgba(204,0,0,0.07);}
h2{font-size:24px;font-weight:800;text-align:center;}
input{width:100%;padding:14px 18px;border-radius:999px;border:1.5px solid #2a2a2a;background:#0a0a0a;color:#F0F0F0;font-family:'Nunito',sans-serif;font-size:14px;font-weight:700;outline:none;}
input:focus{border-color:rgba(204,0,0,0.5);}
button{padding:14px;border-radius:999px;background:#CC0000;border:none;color:#fff;font-family:'Nunito',sans-serif;font-size:15px;font-weight:800;cursor:pointer;}
button:hover{background:#a80000;}
.msg{text-align:center;font-size:13px;color:#888;}
a{color:#CC0000;text-decoration:none;text-align:center;font-size:13px;font-weight:700;}
</style>
</head>
<body>
<div class="box">
  <h2>Create your account</h2>
  <input id="username" type="text" placeholder="Username" />
  <input id="email" type="email" placeholder="Email" />
  <input id="password" type="password" placeholder="Password" />
  <button onclick="window.parent.handleSignUp()">Sign Up</button>
  <div class="msg" id="msg"></div>
  <a href="/login">Already have an account? Log in</a>
</div>
</body>
</html>
    `} style={{width:'100%',height:'100vh',border:'none'}} />
  )
}