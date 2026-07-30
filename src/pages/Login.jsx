import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from '../components/ThemeToggle'

export default function Login() {
  const { loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [err, setErr] = useState('')

  const handleGoogleSuccess = async (response) => {
    setErr('')
    try {
      await loginWithGoogle(response.credential)
      navigate('/')
    } catch (e) {
      setErr(e.response?.data?.detail || 'Google sign-in failed. Try again.')
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <ThemeToggle />
        <h1>ExpenseFlow</h1>
        <p className="sub">Sign in with your Google account to track daily expenses</p>
        <div className="google-login">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setErr('Google sign-in was cancelled or failed.')}
          />
        </div>
        <div className="err">{err}</div>
      </div>
    </div>
  )
}
