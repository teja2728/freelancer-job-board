import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register() {
  const { register } = useAuth()
  const nav = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Client' })
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await register(form)
      nav('/dashboard')
    } catch (e) {
      setError(e?.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
        <h2 className="text-xl font-semibold">Create account</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Join the marketplace</p>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <input className="input" placeholder="Name" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} required />
          <input className="input" placeholder="Email" type="email" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} required />
          <input className="input" placeholder="Password" type="password" value={form.password} onChange={(e)=>setForm({...form, password:e.target.value})} required />
          <select className="input" value={form.role} onChange={(e)=>setForm({...form, role:e.target.value})}>
            <option>Client</option>
            <option>Freelancer</option>
          </select>
          <motion.button whileTap={{ scale: 0.98 }} className="btn btn-primary w-full" type="submit">Register</motion.button>
        </form>
        <p className="mt-3 text-sm">Already have an account? <Link className="text-brand-600" to="/login">Login</Link></p>
      </motion.div>
    </div>
  )
}
