import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function BidModal({ open, onClose, onSubmit }) {
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')

  const submit = (e) => {
    e.preventDefault()
    onSubmit({ amount: Number(amount), message })
    setAmount('')
    setMessage('')
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} className="card p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Place a Bid</h3>
            <form onSubmit={submit} className="space-y-3">
              <input className="input" type="number" min="0" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              <textarea className="input h-28" placeholder="Message (optional)" value={message} onChange={(e) => setMessage(e.target.value)} />
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
