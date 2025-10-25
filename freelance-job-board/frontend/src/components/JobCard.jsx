import { Link } from 'react-router-dom'

const Status = ({ status }) => {
  const cls = status === 'Open' ? 'badge badge-open' : status === 'In Progress' ? 'badge badge-progress' : 'badge badge-completed'
  return <span className={cls}>{status}</span>
}

export default function JobCard({ job }) {
  return (
    <div className="card p-5 transition-transform hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{job.title}</h3>
        <Status status={job.status} />
      </div>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{job.description}</p>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800">{job.category}</span>
        <span className="font-semibold">${job.budget}</span>
      </div>
      <div className="mt-4">
        <Link className="btn btn-primary" to={`/jobs/${job._id}`}>View Details</Link>
      </div>
    </div>
  )
}
