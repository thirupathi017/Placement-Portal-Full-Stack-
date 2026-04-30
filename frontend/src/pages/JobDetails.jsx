import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, IndianRupee, Calendar, GraduationCap, Building2, Clock, CheckCircle, ArrowLeft, Loader2, AlertCircle, ShieldAlert } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import JobTypeBadge from '../components/JobTypeBadge';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [isVerified, setIsVerified] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobAndStatus = async () => {
      try {
        const [jobRes, appsRes, profileRes] = await Promise.all([
          axiosInstance.get(`/api/jobs/${id}`),
          axiosInstance.get('/api/applications/my').catch(() => ({ data: [] })),
          axiosInstance.get('/api/students/profile').catch(() => ({ data: { verified: true } }))
        ]);
        
        setJob(jobRes.data);
        setIsVerified(profileRes.data.verified);
        
        // Check if current job ID is in the user's applications
        const applied = appsRes.data.some(app => app.jobId === parseInt(id));
        setIsApplied(applied);
        
      } catch (err) {
        setError('Failed to load job details. It may have been removed.');
      } finally {
        setLoading(false);
      }
    };
    fetchJobAndStatus();
  }, [id]);

  const handleApply = async () => {
    if (!isVerified) {
      alert('Action Denied: Your account is not verified by the admin yet. You cannot apply for jobs until your profile is approved.');
      return;
    }
    setApplying(true);
    try {
      await axiosInstance.post('/api/applications', { jobId: job.id });
      setIsApplied(true);
      alert('Application submitted successfully! It has been added to your application history.');
      // Optional: don't navigate away, let them see it says "Applied" now
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply. You might have already applied.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="animate-spin text-primary-600" size={48} /></div>;

  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <AlertCircle size={64} className="mx-auto text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Oops!</h2>
        <p className="text-slate-500 mb-6">{error}</p>
        <button onClick={() => navigate('/jobs')} className="btn btn-primary">Back to Jobs</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button 
        onClick={() => navigate('/jobs')} 
        className="flex items-center text-slate-500 hover:text-primary-600 font-medium mb-6 transition-colors"
      >
        <ArrowLeft size={20} className="mr-1" />
        Back to Jobs
      </button>

      {/* Header Section */}
      <div className="card overflow-hidden border-none shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 mb-8">
        <div className="h-32 bg-primary-600 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 rounded-3xl bg-white dark:bg-slate-800 p-1 shadow-lg">
              <div className="w-full h-full rounded-[20px] bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                <Building2 size={48} />
              </div>
            </div>
          </div>
          <div className="absolute top-4 right-6 flex space-x-2">
            <JobTypeBadge type={job.jobType} />
            {job.status === 'OPEN' ? (
              <span className="bg-emerald-500/20 text-emerald-100 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                Actively Hiring
              </span>
            ) : (
              <span className="bg-rose-500/20 text-rose-100 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                Closed
              </span>
            )}
          </div>
        </div>
        
        <div className="pt-16 pb-8 px-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-white leading-tight">{job.title}</h1>
            <p className="text-primary-600 font-bold tracking-wide text-lg mt-1">{job.companyName}</p>
          </div>
          
          <button 
            onClick={handleApply}
            disabled={applying || isApplied || job.status !== 'OPEN'}
            className={`btn px-8 py-3 text-lg flex items-center justify-center space-x-2 shadow-lg w-full md:w-auto ${
              isApplied 
                ? 'bg-emerald-500 text-white cursor-not-allowed border-none hover:bg-emerald-500 opacity-100 shadow-emerald-600/30' 
                : !isVerified
                ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-600/30'
                : 'btn-primary shadow-primary-600/30'
            }`}
          >
            {applying ? (
              <Loader2 className="animate-spin" size={20} />
            ) : isApplied ? (
              <CheckCircle size={20} />
            ) : !isVerified ? (
              <ShieldAlert size={20} />
            ) : (
              <CheckCircle size={20} />
            )}
            <span>
              {applying ? 'Applying...' : isApplied ? 'Applied' : !isVerified ? 'Verification Pending' : job.status === 'OPEN' ? 'Apply Now' : 'Applications Closed'}
            </span>
          </button>
        </div>

        {!isVerified && (
          <div className="mx-8 mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start space-x-3">
            <ShieldAlert className="text-amber-600 flex-shrink-0" size={20} />
            <div>
              <p className="text-sm font-bold text-amber-800 dark:text-amber-200">Account Verification Required</p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Your profile is currently being reviewed by the administration. You will be able to apply for jobs once your account is verified. 
                Please ensure your profile information is complete.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4">
              <Briefcase className="mr-3 text-primary-600" />
              Job Description
            </h2>
            <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
              {job.description}
            </div>
          </div>

          <div className="card p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4">
              <GraduationCap className="mr-3 text-primary-600" />
              Eligibility Criteria
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Eligible Departments</h3>
                <div className="flex flex-wrap gap-2">
                  {job.eligibleDepartments.split(',').map(dept => (
                    <span key={dept} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {dept.trim()}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Minimum CGPA Required</h3>
                <p className="text-xl font-black text-slate-700 dark:text-slate-200">{job.eligibilityCgpa} CGPA</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="card p-6 bg-slate-50/50 dark:bg-slate-800/50">
            <h3 className="font-bold text-slate-800 dark:text-white mb-6">Key Information</h3>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <IndianRupee className="text-emerald-500 mt-1 mr-4" size={24} />
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Compensation</p>
                  <p className="font-black text-lg text-slate-700 dark:text-slate-200">{job.packageLpa} LPA</p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="text-blue-500 mt-1 mr-4" size={24} />
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Location</p>
                  <p className="font-bold text-slate-700 dark:text-slate-200">{job.location}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Calendar className="text-amber-500 mt-1 mr-4" size={24} />
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Apply By</p>
                  <p className="font-bold text-slate-700 dark:text-slate-200">{new Date(job.lastDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Clock className="text-indigo-500 mt-1 mr-4" size={24} />
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Posted On</p>
                  <p className="font-bold text-slate-700 dark:text-slate-200">{new Date(job.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
