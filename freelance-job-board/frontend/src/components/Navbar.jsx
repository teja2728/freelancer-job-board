import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { motion } from 'framer-motion'
import { FaMoon, FaSun } from 'react-icons/fa'

export default function Navbar() {
  const { user, logout, dark, toggleDark } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/40 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-extrabold text-lg">
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">Freelance</span> Board
        </Link>
        <nav className="flex items-center gap-3">
          <Link to="/jobs" className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">Jobs</Link>
          {user?.role === 'Client' && (
            <Link to="/post-job" className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">Post Job</Link>
          )}
          {user && (
            <Link to="/dashboard" className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">Dashboard</Link>
          )}
          <button onClick={toggleDark} className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Toggle theme">
            {dark ? <FaSun /> : <FaMoon />}
          </button>
          {user ? (
            <motion.button whileTap={{ scale: 0.96 }} onClick={handleLogout} className="btn btn-primary">Logout</motion.button>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
