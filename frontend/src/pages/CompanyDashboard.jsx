import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Users, CheckCircle, BarChart3, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import axiosInstance from '../api/axiosInstance';

const CompanyDashboard = () => {
  const [stats, setStats] = useState({ activeJobs: 0, totalApplicants: 0, shortlisted: 0 });
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, statsRes] = await Promise.all([
          axiosInstance.get('/api/jobs/my'),
          axiosInstance.get('/api/company/stats').catch(() => ({ data: { activeJobs: 0, totalApplicants: 0, shortlisted: 0 } }))
        ]);
        
        const jobs = jobsRes.data;
        setRecentJobs(jobs.slice(0, 3));
        setStats(statsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Employer Dashboard</h1>
          <p className="text-slate-500">Manage your recruitment campaigns and candidates</p>
        </div>
        <Link to="/company/jobs/new" className="btn btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>Post New Job</span>
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard title="Active Job Postings" value={stats.activeJobs} icon={Briefcase} color="blue" />
        <StatCard title="Total Applicants" value={stats.totalApplicants} icon={Users} color="purple" />
        <StatCard title="Shortlisted Candidates" value={stats.shortlisted} icon={CheckCircle} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Recent Job Postings</h2>
            <Link to="/company/jobs" className="text-primary-600 font-bold text-sm hover:underline">Manage All</Link>
          </div>

          <div className="space-y-4">
            {recentJobs.map(job => (
              <div key={job.id} className="card p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">{job.title}</h3>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-slate-500 font-medium">
                    <span>{job.jobType.replace('_', ' ')}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span>{job.location}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-xl font-bold">{job.applicantsCount || 0}</p>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Applicants</p>
                  </div>
                  <Link 
                    to={`/company/jobs/${job.id}/applicants`}
                    className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:text-primary-600 transition-colors"
                  >
                    <ArrowRight size={20} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-6">Recruitment Insights</h2>
          <div className="card p-6">
            <div className="flex flex-col items-center justify-center py-8">
              <BarChart3 size={64} className="text-primary-100 dark:text-primary-900/30 mb-4" />
              <p className="text-slate-500 text-center text-sm">
                Advanced analytics and reporting will appear here as you receive more applications.
              </p>
            </div>
            <Link to="/company/reports" className="btn btn-secondary w-full text-sm text-center">View Full Report</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
