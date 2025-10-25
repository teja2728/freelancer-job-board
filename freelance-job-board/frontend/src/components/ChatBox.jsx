import { useEffect, useRef, useState } from 'react'
import { getSocket } from '../lib/socket'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext.jsx'

export default function ChatBox({ jobId, peerId }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const listRef = useRef(null)

  // Load history and wire socket
  useEffect(() => {
    const load = async () => {
      const { data } = await api.get(`/chat/messages/${jobId}`)
      setMessages(data || [])
    }
    load()
    const s = getSocket()
    s.emit('join', { jobId })
    const onMessage = (payload) => {
      if (payload.jobId === jobId) {
        setMessages((prev) => [...prev, { senderId: payload.senderId, receiverId: payload.receiverId, text: payload.text, timestamp: payload.timestamp }])
        // auto-scroll
        requestAnimationFrame(() => {
          listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
        })
      }
    }
    s.on('chat:message', onMessage)
    return () => {
      s.emit('leave', { jobId })
      s.off('chat:message', onMessage)
    }
  }, [jobId])

  const send = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    await api.post(`/chat/send/${jobId}`, { text, receiverId: peerId })
    setText('')
  }

  return (
    <div className="flex flex-col h-80">
      <div ref={listRef} className="flex-1 overflow-y-auto space-y-2 pr-1">
        {messages.map((m, idx) => {
          const mine = m.senderId?.toString?.() === user._id
          return (
            <div key={idx} className={`max-w-[75%] ${mine ? 'ml-auto text-right' : ''}`}>
              <div className={`inline-block px-3 py-2 rounded-2xl ${mine ? 'bg-gradient-to-r from-indigo-500 to-pink-500 text-white' : 'bg-white/70 dark:bg-slate-800/60 border border-white/20'}`}>
                <div className="text-sm whitespace-pre-wrap">{m.text}</div>
                <div className="text-[10px] opacity-70 mt-1">{new Date(m.timestamp || Date.now()).toLocaleTimeString()}</div>
              </div>
            </div>
          )
        })}
      </div>
      <form onSubmit={send} className="mt-3 flex gap-2">
        <input className="input flex-1" placeholder="Type a message" value={text} onChange={(e)=>setText(e.target.value)} />
        <button className="btn btn-primary" type="submit">Send</button>
      </form>
    </div>
  )
}
