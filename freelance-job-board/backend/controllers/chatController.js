import Chat from '../models/Chat.js'
import Job from '../models/Job.js'

export const sendMessage = async (req, res) => {
  try {
    const { jobId } = req.params
    const { text, receiverId } = req.body
    if (!text) return res.status(400).json({ message: 'Text required' })

    const job = await Job.findById(jobId)
    if (!job) return res.status(404).json({ message: 'Job not found' })

    // Only client or assigned freelancer can chat
    const isParticipant = [job.clientId?.toString(), job.freelancerId?.toString()].includes(req.user._id.toString())
    if (!isParticipant) return res.status(403).json({ message: 'Not authorized for this job chat' })

    let chat = await Chat.findOne({ jobId })
    if (!chat) {
      chat = await Chat.create({ jobId, participants: [job.clientId, job.freelancerId].filter(Boolean), messages: [] })
    }
    chat.messages.push({ senderId: req.user._id, receiverId, text })
    await chat.save()
    res.status(201).json(chat)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const getMessages = async (req, res) => {
  try {
    const { jobId } = req.params
    const job = await Job.findById(jobId)
    if (!job) return res.status(404).json({ message: 'Job not found' })
    const isParticipant = [job.clientId?.toString(), job.freelancerId?.toString()].includes(req.user._id.toString())
    if (!isParticipant) return res.status(403).json({ message: 'Not authorized for this job chat' })

    const chat = await Chat.findOne({ jobId })
    res.json(chat ? chat.messages : [])
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}
