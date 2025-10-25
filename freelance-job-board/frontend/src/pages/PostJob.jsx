import { useState } from 'react'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function PostJob() {
  const nav = useNavigate()
  const [form, setForm] = useState({ title: '', description: '', category: '', budget: '' })
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const payload = { ...form, budget: Number(form.budget) }
      const { data } = await api.post('/jobs', payload)
      nav(`/jobs/${data._id}`)
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to create job')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
        <h2 className="text-xl font-semibold">Post a New Job</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Describe your project clearly to attract the best freelancers.</p>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <input className="input" placeholder="Job Title" value={form.title} onChange={(e)=>setForm({...form, title:e.target.value})} required />
          <textarea className="input h-40" placeholder="Job Description" value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})} required />
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="input" placeholder="Category (e.g., Web Development)" value={form.category} onChange={(e)=>setForm({...form, category:e.target.value})} required />
            <input className="input" type="number" min="0" placeholder="Budget ($)" value={form.budget} onChange={(e)=>setForm({...form, budget:e.target.value})} required />
          </div>
          <motion.button whileTap={{ scale: 0.98 }} className="btn btn-primary" type="submit">Create Job</motion.button>
        </form>
      </motion.div>
    </div>
  )
}
