import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../api/axios'
import BidModal from '../components/BidModal'
import ReviewModal from '../components/ReviewModal'

export default function JobDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const [job, setJob] = useState(null)
  const [openBid, setOpenBid] = useState(false)
  const [openReview, setOpenReview] = useState(false)

  const load = async () => {
    const { data } = await api.get(`/jobs/${id}`)
    setJob(data)
  }
  useEffect(() => { load() }, [id])

  const placeBid = async ({ amount, message }) => { await api.post(`/jobs/${id}/bid`, { amount, message }); setOpenBid(false); load() }
  const claim = async () => { await api.post(`/jobs/${id}/claim`); load() }
  const acceptBid = async (bidId) => { await api.post(`/jobs/${id}/accept/${bidId}`); load() }
  const markCompleted = async () => { await api.post(`/jobs/${id}/complete`); load() }
  const submitReview = async ({ rating, comment }) => { await api.post('/reviews', { jobId: id, freelancerId: job.freelancerId._id, rating, comment }); setOpenReview(false) }

  if (!job) return null

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold">{job.title}</h2>
            <div className="text-sm text-slate-500">{job.category} • Budget ${job.budget}</div>
          </div>
          <div className={`badge ${job.status==='Open'?'badge-open':job.status==='In Progress'?'badge-progress':'badge-completed'}`}>{job.status}</div>
        </div>
        <p className="mt-3 whitespace-pre-wrap text-slate-700 dark:text-slate-200">{job.description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <h3 className="font-semibold mb-2">Actions</h3>
          {user?.role === 'Freelancer' && job.status==='Open' && (
            <div className="flex gap-2">
              <button className="btn btn-primary" onClick={()=>setOpenBid(true)}>Place Bid</button>
              {!job.bids?.length && <button className="btn btn-primary" onClick={claim}>Claim</button>}
            </div>
          )}
          {user?._id===job.clientId?._id && job.status==='Open' && (
            <p className="text-sm text-slate-500">Accept a bid from the list.</p>
          )}
          {user?._id===job.clientId?._id && job.status==='In Progress' && (
            <button className="btn btn-primary" onClick={markCompleted}>Mark Completed</button>
          )}
          {user?._id===job.clientId?._id && job.status==='Completed' && job.freelancerId && (
            <button className="btn btn-primary" onClick={()=>setOpenReview(true)}>Leave Review</button>
          )}
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-2">Bids</h3>
          <div className="space-y-2">
            {job.bids?.map((b)=> (
              <div key={b._id} className="flex items-center justify-between border-b border-white/20 py-2">
                <div>
                  <div className="font-medium">{b.freelancerId?.name || 'Freelancer'}</div>
                  <div className="text-xs text-slate-500">${b.amount}</div>
                </div>
                {user?._id===job.clientId?._id && job.status==='Open' && (
                  <button className="btn btn-primary" onClick={()=>acceptBid(b._id)}>Accept</button>
                )}
              </div>
            ))}
            {!job.bids?.length && <div className="text-sm text-slate-500">No bids yet.</div>}
          </div>
        </div>
      </div>

      <BidModal open={openBid} onClose={()=>setOpenBid(false)} onSubmit={placeBid} />
      <ReviewModal open={openReview} onClose={()=>setOpenReview(false)} onSubmit={submitReview} />
    </div>
  )
}
