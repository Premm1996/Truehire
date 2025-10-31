import { jobs } from '../../utils/jobs'

export default function handler(req, res) {
  res.status(200).json(jobs)
}
