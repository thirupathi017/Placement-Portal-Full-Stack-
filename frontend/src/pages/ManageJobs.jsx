import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, Users, MoreVertical, Plus, Briefcase, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import JobTypeBadge from '../components/JobTypeBadge';

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axiosInstance.get('/api/jobs/my');
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    try {
      await axiosInstance.delete(`/api/jobs/${id}`);
      setJobs(jobs.filter(j => j.id !== id));
    } catch (err) {
      alert('Failed to delete job');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Manage Job Postings</h1>
          <p className="text-slate-500">Track and update your active recruitment drives</p>
        </div>
        <Link to="/company/jobs/new" className="btn btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>Post New Job</span>
        </Link>
      </header>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Job Title</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Type</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">LPA</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Deadline</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Applicants</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 font-bold">{job.title}</td>
                <td className="px-6 py-4"><JobTypeBadge type={job.jobType} /></td>
                <td className="px-6 py-4 font-medium">{job.packageLpa} LPA</td>
                <td className="px-6 py-4 text-slate-500">{new Date(job.lastDate).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <Link to={`/company/jobs/${job.id}/applicants`} className="flex items-center text-primary-600 font-bold hover:underline">
                    <Users size={16} className="mr-1" />
                    <span>View ({job.applicantsCount || 0})</span>
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                    job.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <Link to={`/company/jobs/${job.id}/edit`} className="p-1.5 text-slate-400 hover:text-primary-600 transition-colors">
                      <Edit2 size={18} />
                    </Link>
                    <button 
                      onClick={() => handleDelete(job.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
        
        {jobs.length === 0 && !loading && (
          <div className="p-12 text-center">
            <Briefcase size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-500">No job postings yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageJobs;
