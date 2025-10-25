import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../api/axios'

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState({ jobs: [], stats: {} })

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get('/jobs/me/list')
      setData(data)
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {Object.entries({
          Total: data.stats?.total || 0,
          Open: data.stats?.open || 0,
          'In Progress': data.stats?.inProgress || 0,
          Completed: data.stats?.completed || 0,
        }).map(([k, v]) => (
          <div key={k} className="card p-5">
            <div className="text-sm text-slate-500">{k}</div>
            <div className="text-2xl font-bold">{v}</div>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <h3 className="text-lg font-semibold mb-3">{user.role === 'Client' ? 'Your Posted Jobs' : 'Your Active Jobs'}</h3>
        <div className="space-y-2">
          {data.jobs.map((j) => (
            <div key={j._id} className="flex justify-between border-b border-white/30 py-2">
              <div>
                <div className="font-medium">{j.title}</div>
                <div className="text-xs text-slate-500">{j.category}</div>
              </div>
              <div className="text-sm">{j.status}</div>
            </div>
          ))}
          {!data.jobs.length && <div className="text-sm text-slate-500">No jobs yet.</div>}
        </div>
      </div>
    </div>
  )
}
