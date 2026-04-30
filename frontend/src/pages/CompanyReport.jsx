import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, ArrowLeft, Loader2, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const CompanyReport = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ jobStats: [], statusStats: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axiosInstance.get('/api/company/analytics');
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#64748b'];

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Loader2 className="animate-spin text-primary-600" size={48} />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-slate-500 hover:text-primary-600 font-medium mb-2 transition-colors"
          >
            <ArrowLeft size={18} className="mr-1" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold">Recruitment Analytics</h1>
          <p className="text-slate-500">Comprehensive report of your hiring pipeline and job performance</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="btn btn-secondary flex items-center space-x-2 w-full md:w-auto justify-center"
        >
          <Download size={18} />
          <span>Export Report</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Applicants per Job */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <TrendingUp className="mr-2 text-primary-600" size={20} />
            Applicants per Job Posting
          </h2>
          <div className="h-80">
            {data.jobStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.jobStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="title" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fill: '#64748b'}} 
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">No job data available</div>
            )}
          </div>
        </motion.div>

        {/* Application Status Distribution */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <PieIcon className="mr-2 text-primary-600" size={20} />
            Pipeline Distribution
          </h2>
          <div className="h-80 flex items-center">
            {data.statusStats.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.statusStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      nameKey="status"
                    >
                      {data.statusStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </>
            ) : (
              <div className="w-full text-center text-slate-400">No application data available</div>
            )}
          </div>
        </motion.div>

        {/* Summary Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 card overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold">Detailed Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Job Title</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-center">Total Applicants</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Market Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.jobStats.map((job, idx) => {
                const total = data.jobStats.reduce((sum, j) => sum + j.count, 0);
                const percent = total > 0 ? ((job.count / total) * 100).toFixed(1) : 0;
                return (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200">{job.title}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block px-3 py-1 bg-primary-50 text-primary-700 rounded-full font-bold text-sm">
                        {job.count}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary-500" 
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-slate-500 w-12">{percent}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CompanyReport;
