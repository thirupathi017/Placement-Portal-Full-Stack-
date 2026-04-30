import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, Briefcase, CheckCircle, PieChart, TrendingUp, ShieldCheck } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart as RePieChart, Pie, Cell 
} from 'recharts';
import StatCard from '../components/StatCard';
import axiosInstance from '../api/axiosInstance';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalStudents: 0, placedCount: 0, activeJobs: 0, totalCompanies: 0 });
  const [deptData, setDeptData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, deptRes] = await Promise.all([
          axiosInstance.get('/api/admin/stats'),
          axiosInstance.get('/api/admin/stats/departments')
        ]);
        setStats(statsRes.data);
        setDeptData(deptRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pieData = [
    { name: 'Placed', value: stats.placedCount },
    { name: 'Unplaced', value: Math.max(0, stats.totalStudents - stats.placedCount) },
  ];

  const COLORS = ['#0ea5e9', '#e2e8f0'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Admin Overview</h1>
        <p className="text-slate-500">Global statistics and placement performance monitoring</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard title="Total Students" value={stats.totalStudents} icon={Users} color="blue" />
        <StatCard title="Total Companies" value={stats.totalCompanies} icon={Building2} color="purple" />
        <StatCard title="Active Jobs" value={stats.activeJobs} icon={Briefcase} color="amber" />
        <StatCard title="Placement %" value={stats.totalStudents > 0 ? ((stats.placedCount / stats.totalStudents) * 100).toFixed(1) + '%' : '0%'} icon={ShieldCheck} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <TrendingUp className="mr-2 text-primary-600" />
            Placement by Department
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="placed" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="unplaced" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <PieChart className="mr-2 text-primary-600" />
            Overall Statistics
          </h2>
          <div className="h-80 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
            <div className="w-1/3 space-y-4">
              <div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                  <span className="text-sm font-bold">Placed</span>
                </div>
                <p className="text-2xl font-bold ml-5">{stats.placedCount}</p>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-slate-200 rounded-full"></div>
                  <span className="text-sm font-bold">Unplaced</span>
                </div>
                <p className="text-2xl font-bold ml-5">{stats.totalStudents - stats.placedCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center">
              <ShieldCheck className="mr-2 text-primary-600" />
              Detailed Departmental Report
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Department</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-center">Total Students</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-center">Placed</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-center">Unplaced</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Placement Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {deptData.length > 0 ? (
                  deptData.map((dept, idx) => {
                    const total = dept.placed + dept.unplaced;
                    const rate = total > 0 ? ((dept.placed / total) * 100).toFixed(1) : 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200">{dept.name}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold text-slate-600 dark:text-slate-400">{total}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-bold text-sm">
                            {dept.placed}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg font-bold text-sm">
                            {dept.unplaced}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden min-w-[100px]">
                              <div 
                                className={`h-full ${parseFloat(rate) > 75 ? 'bg-emerald-500' : parseFloat(rate) > 40 ? 'bg-primary-500' : 'bg-amber-500'}`} 
                                style={{ width: `${rate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-black text-slate-500 w-12">{rate}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">No departmental data available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
