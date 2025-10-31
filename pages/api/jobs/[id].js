import { jobs } from '../../../utils/jobs'

export default function handler(req, res) {
  const { id } = req.query
  const job = jobs.find(j => String(j.id) === String(id))
  if (!job) return res.status(404).json({ error: 'Not found' })
  res.status(200).json(job)
}
