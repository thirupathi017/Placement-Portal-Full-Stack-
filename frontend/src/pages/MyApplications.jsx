import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Loader2, Send } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import ApplicationCard from '../components/ApplicationCard';
import StatusBadge from '../components/StatusBadge';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await axiosInstance.get('/api/applications/my');
        setApplications(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Application History</h1>
        <p className="text-slate-500 mt-1">Track the status of all your job applications</p>
      </header>

      {/* Stats summary */}
      {!loading && applications.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Applied', value: applications.length, color: 'text-primary-600' },
            { label: 'Under Review', value: applications.filter(a => a.status === 'APPLIED').length, color: 'text-amber-500' },
            { label: 'Shortlisted', value: applications.filter(a => ['SHORTLISTED','INTERVIEW_SCHEDULED'].includes(a.status)).length, color: 'text-blue-500' },
            { label: 'Selected', value: applications.filter(a => a.status === 'SELECTED').length, color: 'text-emerald-600' },
          ].map(s => (
            <div key={s.label} className="card p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary-600" size={40} />
        </div>
      ) : applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((app) => (
            <ApplicationCard key={app.id} application={app} />
          ))}
        </div>
      ) : (
        <div className="card p-16 text-center">
          <Send size={48} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-xl font-bold">No applications yet</h2>
          <p className="text-slate-500 mt-2">Browse the jobs page to find opportunities and start applying.</p>
        </div>
      )}
    </div>
  );
};

export default MyApplications;
