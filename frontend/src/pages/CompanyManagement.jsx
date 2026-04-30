import React, { useEffect, useState } from 'react';
import {
  Building2, Globe, CheckCircle, XCircle, ShieldCheck, Mail,
  Briefcase, MapPin, Calendar, DollarSign, Users, FileText,
  ChevronRight, Clock, Layers
} from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

const CompanyManagement = () => {
  const [companies, setCompanies]     = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState('companies');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedJob, setSelectedJob]         = useState(null);

  useEffect(() => {
    fetchCompanies();
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axiosInstance.get('/api/admin/jobs');
      setPendingJobs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await axiosInstance.get('/api/admin/companies');
      setCompanies(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ── Company actions ── */
  const handleVerify = async (id) => {
    try {
      await axiosInstance.put(`/api/admin/companies/${id}/verify`);
      setCompanies(companies.map(c => c.id === id ? { ...c, verified: true } : c));
    } catch (err) {
      console.error(err);
    }
  };

  /* ── Job actions ── */
  const handleVerifyJob = async (id) => {
    try {
      const res = await axiosInstance.put(`/api/admin/jobs/${id}/verify`);
      setPendingJobs(pendingJobs.map(j => j.id === id ? res.data : j));
      if (selectedJob?.id === id) setSelectedJob(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectJob = async (id) => {
    try {
      const res = await axiosInstance.put(`/api/admin/jobs/${id}/reject`);
      setPendingJobs(pendingJobs.map(j => j.id === id ? res.data : j));
      if (selectedJob?.id === id) setSelectedJob(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Unverify: moves OPEN → PENDING, immediately hides job from students
  const handleUnverifyJob = async (id) => {
    try {
      const res = await axiosInstance.put(`/api/admin/jobs/${id}/unverify`);
      setPendingJobs(pendingJobs.map(j => j.id === id ? res.data : j));
      if (selectedJob?.id === id) setSelectedJob(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) return;
    try {
      await axiosInstance.delete(`/api/admin/jobs/${id}`);
      setPendingJobs(pendingJobs.filter(j => j.id !== id));
      if (selectedJob?.id === id) setSelectedJob(null);
    } catch (err) {
      console.error(err);
    }
  };

  /* ── Helpers ── */
  const pendingJobsCount = pendingJobs.filter(j => j.status === 'PENDING').length;
  const pendingCompaniesCount = companies.filter(c => !c.verified).length;

  const statusStyle = (status) => {
    switch (status) {
      case 'OPEN':     return 'bg-emerald-50 text-emerald-600';
      case 'PENDING':  return 'bg-amber-50   text-amber-600';
      case 'REJECTED': return 'bg-rose-50    text-rose-600';
      default:         return 'bg-slate-50   text-slate-600';
    }
  };

  /* ═══════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════ */
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* ── Header ── */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Approvals</h1>
          <p className="text-slate-500">Verify companies and new job postings</p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('companies')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'companies'
                ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600'
                : 'text-slate-500'
            }`}
          >
            Companies
            {pendingCompaniesCount > 0 && (
              <span className="ml-2 bg-amber-100 text-amber-700 text-xs font-black px-1.5 py-0.5 rounded-full">
                {pendingCompaniesCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'jobs'
                ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600'
                : 'text-slate-500'
            }`}
          >
            Job Postings
            {pendingJobsCount > 0 && (
              <span className="ml-2 bg-amber-100 text-amber-700 text-xs font-black px-1.5 py-0.5 rounded-full">
                {pendingJobsCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ══════════════ COMPANIES TAB ══════════════ */}
      {activeTab === 'companies' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />
            ))
          ) : companies.length === 0 ? (
            <div className="col-span-full card p-12 text-center">
              <CheckCircle size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-500 font-medium">No companies registered yet.</p>
            </div>
          ) : companies.map((company) => (
            <div key={company.id} className="card p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center text-primary-600">
                    <Building2 size={32} />
                  </div>
                  {company.verified ? (
                    <span className="flex items-center text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                      <ShieldCheck size={14} className="mr-1" /> Verified
                    </span>
                  ) : (
                    <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                      Pending
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-bold mb-1">{company.companyName}</h2>
                <p className="text-slate-500 text-sm font-medium mb-4">{company.industry}</p>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                    <Globe size={16} className="mr-2 text-slate-400" />
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 truncate">
                      {company.website?.replace('https://', '')}
                    </a>
                  </div>
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                    <Mail size={16} className="mr-2 text-slate-400" />
                    <span className="truncate">{company.email}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex space-x-3">
                {!company.verified && (
                  <button onClick={() => handleVerify(company.id)} className="btn btn-primary flex-1 py-2 text-sm">
                    Verify Company
                  </button>
                )}
                <button onClick={() => setSelectedCompany(company)} className="btn btn-secondary flex-1 py-2 text-sm">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

      /* ══════════════ JOB POSTINGS TAB ══════════════ */
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pendingJobs.length === 0 ? (
            <div className="col-span-full card p-12 text-center">
              <CheckCircle size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-500 font-medium">No job postings found.</p>
            </div>
          ) : pendingJobs.map((job) => (
            <div key={job.id} className="card p-6 flex flex-col justify-between">
              <div>
                {/* Status + Type row */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex space-x-2">
                    <div className="bg-primary-50 dark:bg-primary-950/30 p-2 rounded-lg text-primary-600 font-bold text-xs">
                      {job.jobType}
                    </div>
                    <div className={`px-2 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider ${statusStyle(job.status)}`}>
                      {job.status}
                    </div>
                  </div>
                  <div className="text-primary-600 font-bold">{job.packageLpa} LPA</div>
                </div>

                <h2 className="text-xl font-bold mb-1">{job.title}</h2>
                <div className="flex items-center text-slate-500 text-sm mb-3">
                  <Building2 size={14} className="mr-1.5" />
                  {job.companyName}
                </div>

                {job.location && (
                  <div className="flex items-center text-slate-500 text-sm mb-3">
                    <MapPin size={14} className="mr-1.5" />
                    {job.location}
                  </div>
                )}

                <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-4">
                  {job.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {job.eligibleDepartments?.split(',').map(dept => (
                    <span key={dept} className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      {dept.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions — only View Details + Verify */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <button
                  onClick={() => setSelectedJob(job)}
                  className="btn btn-secondary flex-1 py-2 text-xs"
                >
                  View Details
                </button>

                {job.status === 'PENDING' && (
                  <button
                    onClick={() => handleVerifyJob(job.id)}
                    className="btn btn-primary flex-1 py-2 text-xs"
                  >
                    Verify
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══════════════ COMPANY DETAILS MODAL ══════════════ */}
      {selectedCompany && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="card w-full max-w-lg p-8 relative">
            <button
              onClick={() => setSelectedCompany(null)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <XCircle size={24} className="text-slate-400" />
            </button>

            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center text-primary-600">
                <Building2 size={40} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{selectedCompany.companyName}</h2>
                <p className="text-slate-500 font-medium">{selectedCompany.industry}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">HR Contact</p>
                  <p className="font-bold">{selectedCompany.hrName}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                  <p className={selectedCompany.verified ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                    {selectedCompany.verified ? 'Verified' : 'Pending Verification'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</p>
                <p className="font-medium flex items-center">
                  <Mail size={16} className="mr-2 text-slate-400" />
                  {selectedCompany.email}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Official Website</p>
                <p className="font-medium flex items-center">
                  <Globe size={16} className="mr-2 text-slate-400" />
                  <a href={selectedCompany.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                    {selectedCompany.website}
                  </a>
                </p>
              </div>
            </div>

            <div className="mt-8">
              {!selectedCompany.verified && (
                <button
                  onClick={() => {
                    handleVerify(selectedCompany.id);
                    setSelectedCompany(prev => ({ ...prev, verified: true }));
                  }}
                  className="btn btn-primary w-full py-3"
                >
                  Verify Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ JOB DETAILS MODAL ══════════════ */}
      {selectedJob && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="card w-full max-w-2xl p-8 relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setSelectedJob(null)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <XCircle size={24} className="text-slate-400" />
            </button>

            {/* Modal header */}
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center text-primary-600 shrink-0">
                <Briefcase size={36} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold">{selectedJob.title}</h2>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${statusStyle(selectedJob.status)}`}>
                    {selectedJob.status}
                  </span>
                </div>
                <div className="flex items-center text-slate-500 text-sm">
                  <Building2 size={14} className="mr-1.5" />
                  {selectedJob.companyName}
                </div>
              </div>
            </div>

            {/* Key info grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <DollarSign size={11} /> Package
                </p>
                <p className="font-black text-primary-600 text-lg">{selectedJob.packageLpa} LPA</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Briefcase size={11} /> Job Type
                </p>
                <p className="font-bold">{selectedJob.jobType}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Users size={11} /> Min CGPA
                </p>
                <p className="font-bold">{selectedJob.eligibilityCgpa ?? '—'}</p>
              </div>
              {selectedJob.location && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <MapPin size={11} /> Location
                  </p>
                  <p className="font-bold">{selectedJob.location}</p>
                </div>
              )}
              {selectedJob.lastDate && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Calendar size={11} /> Last Date
                  </p>
                  <p className="font-bold">{new Date(selectedJob.lastDate).toLocaleDateString()}</p>
                </div>
              )}
              {selectedJob.createdAt && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Clock size={11} /> Posted On
                  </p>
                  <p className="font-bold">{new Date(selectedJob.createdAt).toLocaleDateString()}</p>
                </div>
              )}
            </div>

            {/* Eligible Departments */}
            {selectedJob.eligibleDepartments && (
              <div className="mb-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Users size={11} /> Eligible Departments
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.eligibleDepartments.split(',').map(dept => (
                    <span key={dept} className="bg-primary-50 dark:bg-primary-950/30 text-primary-700 px-3 py-1 rounded-full text-xs font-bold">
                      {dept.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {selectedJob.description && (
              <div className="mb-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <FileText size={11} /> Job Description
                </p>
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedJob.description}
                </p>
              </div>
            )}

            {/* Rounds */}
            {selectedJob.rounds && selectedJob.rounds.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                  <Layers size={11} /> Recruitment Rounds
                </p>
                <div className="space-y-2">
                  {selectedJob.rounds.map((round, i) => (
                    <div key={i} className="flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4 py-3">
                      <span className="w-6 h-6 bg-primary-600 text-white text-xs font-black rounded-full flex items-center justify-center mr-3 shrink-0">
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-bold text-sm">{round.roundName}</p>
                        {round.description && <p className="text-xs text-slate-500">{round.description}</p>}
                      </div>
                      <ChevronRight size={16} className="ml-auto text-slate-300" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal action buttons */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-3">
              {selectedJob.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => handleVerifyJob(selectedJob.id)}
                    className="btn btn-primary flex-1 py-3"
                  >
                    <ShieldCheck size={16} className="mr-2" /> Approve Job
                  </button>
                  <button
                    onClick={() => handleRejectJob(selectedJob.id)}
                    className="btn btn-outline border-rose-200 text-rose-500 hover:bg-rose-50 flex-1 py-3"
                  >
                    Reject
                  </button>
                </>
              )}
              {selectedJob.status === 'OPEN' && (
                <button
                  onClick={() => handleUnverifyJob(selectedJob.id)}
                  className="btn btn-outline border-amber-200 text-amber-600 hover:bg-amber-50 flex-1 py-3"
                >
                  Unverify (Withdraw)
                </button>
              )}
              {selectedJob.status === 'REJECTED' && (
                <button
                  onClick={() => handleVerifyJob(selectedJob.id)}
                  className="btn btn-primary flex-1 py-3"
                >
                  <ShieldCheck size={16} className="mr-2" /> Re-Approve
                </button>
              )}
              <button
                onClick={() => { handleDeleteJob(selectedJob.id); setSelectedJob(null); }}
                className="btn btn-outline border-rose-200 text-rose-500 hover:bg-rose-50 px-4 py-3"
                title="Delete permanently"
              >
                <XCircle size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyManagement;
