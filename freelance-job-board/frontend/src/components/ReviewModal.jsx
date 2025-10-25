import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const faces = ['😡','😕','😐','🙂','😍']

export default function ReviewModal({ open, onClose, onSubmit }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  const submit = (e) => {
    e.preventDefault()
    onSubmit({ rating, comment })
    setComment('')
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} className="card p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Leave a Review</h3>
            <form onSubmit={submit} className="space-y-3">
              <div className="flex items-center gap-2">
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button" onClick={() => setRating(n)} className={`text-2xl ${n<=rating ? '' : 'opacity-50'}`}>{faces[n-1]}</button>
                ))}
              </div>
              <textarea className="input h-28" placeholder="Your feedback" value={comment} onChange={(e) => setComment(e.target.value)} />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
                <button className="btn btn-primary" type="submit">Submit</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
