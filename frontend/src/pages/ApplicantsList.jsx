import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, FileText, CheckCircle, XCircle, Calendar, ArrowLeft, Loader2 } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import StatusBadge from '../components/StatusBadge';

const ApplicantsList = () => {
  const { id } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobRes, appRes] = await Promise.all([
          axiosInstance.get(`/api/jobs/${id}`),
          axiosInstance.get(`/api/jobs/${id}/applicants`)
        ]);
        setJob(jobRes.data);
        setApplicants(appRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleStatusUpdate = async (appId, status) => {
    try {
      await axiosInstance.put(`/api/applications/${appId}/status`, { status });
      setApplicants(applicants.map(a => a.id === appId ? { ...a, status } : a));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-600" size={40} /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-slate-500 hover:text-primary-600 font-medium mb-6 transition-colors"
      >
        <ArrowLeft size={20} className="mr-1" />
        Back to Jobs
      </button>

      <header className="mb-8">
        <h1 className="text-3xl font-bold">{job?.title}</h1>
        <div className="flex items-center space-x-4 mt-2 text-slate-500">
          <p className="font-medium">Applicants: {applicants.length}</p>
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <p className="font-medium text-primary-600">Min CGPA: {job?.eligibilityCgpa}</p>
        </div>
      </header>

      <div className="card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Student Name</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Dept / CGPA</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Applied Date</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Resume</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {applicants.map((app) => (
              <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold">{app.studentName}</div>
                  <div className="text-xs text-slate-500">{app.rollNumber}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">{app.department}</div>
                  <div className="text-xs font-bold text-primary-600">CGPA: {app.cgpa}</div>
                </td>
                <td className="px-6 py-4 text-slate-500 text-sm">
                  {new Date(app.appliedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <a 
                    href={app.resumeUrl?.startsWith('http') ? app.resumeUrl : `http://localhost:8080${app.resumeUrl}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-primary-600 hover:underline text-sm font-medium"
                  >
                    <FileText size={16} className="mr-1" />
                    PDF
                  </a>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={app.status} />
                </td>
                <td className="px-6 py-4">
                  {app.status === 'APPLIED' ? (
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleStatusUpdate(app.id, 'SHORTLISTED')}
                        className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                        title="Shortlist"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(app.id, 'REJECTED')}
                        className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                        title="Reject"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  ) : app.status === 'SHORTLISTED' ? (
                    <button 
                      className="btn btn-primary py-1 px-3 text-xs flex items-center"
                      onClick={() => navigate('/company/interviews', { state: { appId: app.id } })}
                    >
                      <Calendar size={14} className="mr-1" />
                      Schedule
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">No actions</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {applicants.length === 0 && (
          <div className="p-12 text-center">
            <Users size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-500">No applicants for this job yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicantsList;
