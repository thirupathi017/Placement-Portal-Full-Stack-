import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, AlertCircle, Loader2 } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import JobCard from '../components/JobCard';
import FilterBar from '../components/FilterBar';

const JobListing = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dept: '',
    jobType: '',
    minPackage: '',
    companyName: ''
  });
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());

  const [isVerified, setIsVerified] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.dept) params.append('department', filters.dept);
      if (filters.jobType) params.append('jobType', filters.jobType);
      if (filters.minPackage) params.append('minCGPA', filters.minPackage);
      if (filters.companyName) params.append('company', filters.companyName);

      const res = await axiosInstance.get(`/api/jobs?${params.toString()}`);
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const res = await axiosInstance.get('/api/applications/my');
      const ids = new Set(res.data.map(app => app.jobId));
      setAppliedJobIds(ids);
    } catch (err) {
      console.error('Failed to fetch applications', err);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get('/api/students/profile');
      setIsVerified(res.data.verified);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchMyApplications();
    fetchProfile();
  }, []);

  const handleApply = async (jobId) => {
    if (!isVerified) {
      alert('Action Denied: Your account is not verified by the admin yet. You cannot apply for jobs until your profile is approved.');
      return;
    }

    try {
      await axiosInstance.post('/api/applications', { jobId });
      setAppliedJobIds(prev => {
        const next = new Set(prev);
        next.add(jobId);
        return next;
      });
      alert('Applied successfully! It has been added to your application history.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Explore Opportunities</h1>
        <p className="text-slate-500">Find the perfect job or internship for your career</p>
      </header>

      <div className="mb-10">
        <FilterBar filters={filters} setFilters={setFilters} onSearch={fetchJobs} />
      </div>

      {loading || loadingProfile ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary-600 mb-4" size={48} />
          <p className="text-slate-500 font-medium">Loading opportunities...</p>
        </div>
      ) : jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {jobs.map((job) => (
            <JobCard 
              key={job.id} 
              job={job} 
              onApply={handleApply} 
              isApplied={appliedJobIds.has(job.id)} 
              isVerified={isVerified}
            />
          ))}
        </div>
      ) : (
        <div className="card p-20 text-center">
          <div className="inline-flex p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
            <AlertCircle size={40} className="text-slate-400" />
          </div>
          <h2 className="text-xl font-bold">No jobs found</h2>
          <p className="text-slate-500 mt-2">Try adjusting your filters or search terms.</p>
          <button 
            onClick={() => { setFilters({ dept: '', jobType: '', minPackage: '', companyName: '' }); fetchJobs(); }}
            className="btn btn-outline mt-6"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default JobListing;
