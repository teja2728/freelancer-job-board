import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../api/axios'
import ReviewModal from '../components/ReviewModal'
import { getSocket } from '../lib/socket'
import toast from 'react-hot-toast'
import ChatBox from '../components/ChatBox'

export default function ClientJobDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const [job, setJob] = useState(null)
  const [openReview, setOpenReview] = useState(false)

  const load = async () => {
    const { data } = await api.get(`/jobs/${id}`)
    setJob(data)
  }

  useEffect(() => {
    load()
    const s = getSocket()
    s.emit('join', { jobId: id })
    const onBid = (payload) => { if (payload.jobId === id) { toast.success('New bid received'); load() } }
    const onClaimed = (payload) => { if (payload.jobId === id) { toast('Job claimed by freelancer'); load() } }
    const onChat = (payload) => { if (payload.jobId === id) { /* ChatBox handles UI; this is optional */ } }
    const onStatus = (payload) => { if (payload.jobId === id) load() }
    const onCompleted = (payload) => { if (payload.jobId === id) { toast.success('Job completed'); setOpenReview(true); load() } }
    s.on('job:bid', onBid)
    s.on('job:claimed', onClaimed)
    s.on('chat:message', onChat)
    s.on('job:status', onStatus)
    s.on('job:completed', onCompleted)
    return () => {
      s.emit('leave', { jobId: id })
      s.off('job:bid', onBid)
      s.off('job:claimed', onClaimed)
      s.off('chat:message', onChat)
      s.off('job:status', onStatus)
      s.off('job:completed', onCompleted)
    }
  }, [id])

  const acceptBid = async (bidId) => { await api.post(`/jobs/${id}/accept/${bidId}`); toast.success('Bid accepted'); load() }
  const confirmComplete = async () => { await api.put(`/jobs/confirm-complete/${id}`); toast.success('Completion confirmed'); setOpenReview(true); load() }
  const submitReview = async ({ rating, comment }) => { await api.post('/reviews', { jobId: id, freelancerId: job.freelancerId._id, rating, comment }); setOpenReview(false); toast.success('Review submitted') }

  if (!job) return null

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold">{job.title}</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">{job.category} • Budget ${job.budget}</div>
          </div>
          <span className={`badge ${job.status==='Open'?'badge-open':job.status==='In Progress'?'badge-progress':'badge-completed'}`}>{job.status}</span>
        </div>
        <p className="mt-3 text-slate-700 dark:text-slate-200">{job.description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <h3 className="font-semibold mb-2">Actions</h3>
          {user?._id===job.clientId?._id && job.status==='Open' && (
            <p className="text-sm text-slate-500">Accept a bid from the list to assign the job.</p>
          )}
          {user?._id===job.clientId?._id && job.status==='In Progress' && job.completedByFreelancer && (
            <button className="btn btn-primary" onClick={confirmComplete}>Confirm Completion</button>
          )}
          {user?._id===job.clientId?._id && job.status==='Completed' && job.freelancerId && (
            <button className="btn btn-primary" onClick={()=>setOpenReview(true)}>Leave Review</button>
          )}
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-2">Bids</h3>
          <div className="space-y-2">
            {job.bids?.map((b)=> (
              <div key={b._id} className="border dark:border-slate-700 p-3 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-medium">{b.freelancerId?.name || 'Freelancer'}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">${b.amount} • {b.message}</div>
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

      {job.freelancerId && (
        <div className="card p-5">
          <h3 className="font-semibold mb-2">Chat</h3>
          <ChatBox jobId={id} peerId={user._id===job.clientId._id ? job.freelancerId._id : job.clientId._id} />
        </div>
      )}

      <ReviewModal open={openReview} onClose={()=>setOpenReview(false)} onSubmit={submitReview} />
    </div>
  )
}
