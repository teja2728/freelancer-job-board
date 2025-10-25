import { useEffect, useMemo, useState } from 'react'
import api from '../api/axios'
import JobCard from '../components/JobCard'

export default function JobList() {
  const [jobs, setJobs] = useState([])
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [minBudget, setMinBudget] = useState('')
  const [maxBudget, setMaxBudget] = useState('')
  const [sort, setSort] = useState('latest')

  const params = useMemo(() => ({ q, category, minBudget, maxBudget, sort }), [q, category, minBudget, maxBudget, sort])

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get('/jobs', { params })
      setJobs(data)
    }
    load()
  }, [q, category, minBudget, maxBudget, sort])

  return (
    <div>
      <div className="card p-4 mb-4 grid gap-3 sm:grid-cols-6">
        <input className="input sm:col-span-2" placeholder="Search" value={q} onChange={(e)=>setQ(e.target.value)} />
        <input className="input" placeholder="Category" value={category} onChange={(e)=>setCategory(e.target.value)} />
        <input className="input" type="number" placeholder="Min Budget" value={minBudget} onChange={(e)=>setMinBudget(e.target.value)} />
        <input className="input" type="number" placeholder="Max Budget" value={maxBudget} onChange={(e)=>setMaxBudget(e.target.value)} />
        <select className="input" value={sort} onChange={(e)=>setSort(e.target.value)}>
          <option value="latest">Latest</option>
          <option value="budget">Budget</option>
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((j) => (
          <JobCard key={j._id} job={j} />
        ))}
      </div>
    </div>
  )
}
