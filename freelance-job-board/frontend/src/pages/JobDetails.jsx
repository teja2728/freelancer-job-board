import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../api/axios'
import BidModal from '../components/BidModal'
import ReviewModal from '../components/ReviewModal'
import { getSocket } from '../lib/socket'
import toast from 'react-hot-toast'
import ChatBox from '../components/ChatBox'

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
  useEffect(() => {
    load()
    const s = getSocket()
    s.emit('join', { jobId: id })
    const onBid = (payload) => {
      if (payload.jobId === id) {
        toast.success('New bid received')
        load()
      }
    }
    const onClaimed = (payload) => {
      if (payload.jobId === id) {
        toast.success('Job has been claimed')
        load()
      }
    }
    const onStatus = (payload) => { if (payload.jobId === id) load() }
    const onCompleted = (payload) => { if (payload.jobId === id) load() }
    const onFreelancerMarked = (payload) => { if (payload.jobId === id) toast('Freelancer marked completed') }
    s.on('job:bid', onBid)
    s.on('job:claimed', onClaimed)
    s.on('job:status', onStatus)
    s.on('job:completed', onCompleted)
    s.on('job:freelancer_marked_complete', onFreelancerMarked)
    return () => {
      s.emit('leave', { jobId: id })
      s.off('job:bid', onBid)
      s.off('job:claimed', onClaimed)
      s.off('job:status', onStatus)
      s.off('job:completed', onCompleted)
      s.off('job:freelancer_marked_complete', onFreelancerMarked)
    }
  }, [id])

  const placeBid = async ({ amount, message }) => {
    try {
      await api.post(`/jobs/${id}/bid`, { amount, message })
      toast.success('Bid submitted')
      setOpenBid(false)
      load()
    } catch (e) { toast.error(e?.response?.data?.message || 'Failed to bid') }
  }
  const claim = async () => {
    try {
      await api.post(`/jobs/${id}/claim`)
      toast.success('Job claimed')
      load()
    } catch (e) { toast.error(e?.response?.data?.message || 'Failed to claim') }
  }
  const acceptBid = async (bidId) => { await api.post(`/jobs/${id}/accept/${bidId}`); load() }
  const markCompleted = async () => {
    try {
      await api.put(`/jobs/mark-complete/${id}`)
      toast.success('Marked complete. Waiting for client confirmation.')
      load()
    } catch (e) { toast.error(e?.response?.data?.message || 'Failed') }
  }
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
          {user?.role === 'Freelancer' && job.freelancerId?._id===user._id && job.status==='In Progress' && (
            <button className="btn btn-primary mt-2" onClick={markCompleted}>Mark Completed</button>
          )}
          {user?._id===job.clientId?._id && job.status==='Open' && (
            <p className="text-sm text-slate-500">Accept a bid from the list.</p>
          )}
          {user?._id===job.clientId?._id && job.status==='In Progress' && job.completedByFreelancer && (
            <button className="btn btn-primary" onClick={async ()=>{ await api.put(`/jobs/confirm-complete/${id}`); toast.success('Completion confirmed'); setOpenReview(true); load() }}>Confirm Completion</button>
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

      {/* Chat */}
      {job.freelancerId && (
        <div className="card p-5">
          <h3 className="font-semibold mb-2">Chat</h3>
          <ChatBox jobId={id} peerId={user._id===job.clientId._id ? job.freelancerId._id : job.clientId._id} />
        </div>
      )}

      <BidModal open={openBid} onClose={()=>setOpenBid(false)} onSubmit={placeBid} />
      <ReviewModal open={openReview} onClose={()=>setOpenReview(false)} onSubmit={submitReview} />
    </div>
  )
}
