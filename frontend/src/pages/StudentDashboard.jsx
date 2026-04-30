import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Send, CheckCircle, Clock, Trophy } from 'lucide-react';
import StatCard from '../components/StatCard';
import axiosInstance from '../api/axiosInstance';
import ApplicationCard from '../components/ApplicationCard';

const StudentDashboard = () => {
  const [stats, setStats] = useState({ applied: 0, shortlisted: 0, interviews: 0, offers: 0 });
  const [recentApps, setRecentApps] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appsRes, eventsRes, profileRes] = await Promise.all([
          axiosInstance.get('/api/applications/my'),
          axiosInstance.get('/api/interviews/my').catch(() => ({ data: [] })),
          axiosInstance.get('/api/students/profile')
        ]);
        
        const apps = appsRes.data;
        const events = eventsRes.data;
        const profile = profileRes.data;
        
        setRecentApps(apps.slice(0, 5));
        setUpcomingEvents(events.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)));
        
        setStats({
          applied: apps.length,
          shortlisted: apps.filter(a => a.status === 'SHORTLISTED' || a.status === 'SELECTED').length,
          interviews: events.length,
          offers: profile.offers || 0
        });
        setIsVerified(profile.verified);
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
      <header className="mb-8">
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <p className="text-slate-500">Track your recruitment progress and upcoming events</p>
      </header>

      {!loading && !isVerified && (
        <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-xl text-amber-600">
              <Clock className="animate-pulse" size={24} />
            </div>
            <div>
              <p className="font-bold text-amber-900 dark:text-amber-100">Verification Pending</p>
              <p className="text-sm text-amber-700 dark:text-amber-300">Your account is currently being reviewed by the admin. You'll be able to apply for jobs once verified.</p>
            </div>
          </div>
          <button 
            onClick={() => window.location.href = '/profile'}
            className="px-4 py-2 bg-white dark:bg-slate-800 text-amber-600 border border-amber-200 dark:border-amber-700 rounded-lg text-sm font-bold hover:bg-amber-50 transition-colors shadow-sm"
          >
            Check Profile
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard title="Total Applications" value={stats.applied} icon={Send} color="blue" />
        <StatCard title="Shortlisted" value={stats.shortlisted} icon={CheckCircle} color="green" />
        <StatCard title="Interviews" value={stats.interviews} icon={Clock} color="purple" />
        <StatCard title="Offers Received" value={stats.offers} icon={Trophy} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center">
              <Clock className="mr-2 text-primary-600" />
              Recent Applications
            </h2>
            <button className="text-primary-600 font-bold text-sm hover:underline">View All</button>
          </div>

          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl"></div>)
            ) : recentApps.length > 0 ? (
              recentApps.map(app => <ApplicationCard key={app.id} application={app} />)
            ) : (
              <div className="card p-12 text-center">
                <Briefcase size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500">No applications yet. Start exploring jobs!</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <Trophy className="mr-2 text-amber-500" />
            Upcoming Events
          </h2>
          <div className="card p-6">
            <div className="space-y-6">
              {(() => {
                const now = new Date();
                const filteredEvents = upcomingEvents.filter(event => {
                  const scheduledTime = new Date(event.scheduledAt);
                  const diffInMinutes = (now - scheduledTime) / (1000 * 60);
                  return diffInMinutes <= 60; // Keep if not yet expired by more than 1 hour
                });

                if (filteredEvents.length > 0) {
                  return filteredEvents.slice(0, 4).map(event => {
                    const date = new Date(event.scheduledAt);
                    const month = date.toLocaleString('default', { month: 'short' });
                    const day = date.getDate();
                    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    
                    const nowInner = new Date();
                    const scheduledTimeInner = new Date(event.scheduledAt);
                    const diffInMinutesInner = (nowInner - scheduledTimeInner) / (1000 * 60);
                    const isExpired = diffInMinutesInner > 60;

                    return (
                      <div key={event.id} className="flex space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex flex-col items-center justify-center text-primary-600">
                          <span className="text-xs font-bold uppercase">{month}</span>
                          <span className="text-lg font-bold">{day}</span>
                        </div>
                        <div>
                          <p className="font-bold text-sm">{event.companyName} - {event.jobTitle}</p>
                          <p className="text-xs text-slate-500">Round {event.round} ({event.mode})</p>
                          <div className="flex items-center text-xs font-medium mt-1">
                            <span className="text-primary-600">{time}</span>
                            <span className="mx-2 text-slate-300">•</span>
                            {event.mode === 'ONLINE' ? (
                              <a 
                                href={event.venueOrLink} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-primary-600 hover:underline flex items-center"
                              >
                                Join Meeting
                              </a>
                            ) : (
                              <span className="text-slate-600">{event.venueOrLink}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  });
                } else {
                  return (
                    <div className="text-center py-6">
                      <p className="text-slate-500 text-sm">No upcoming interviews scheduled yet.</p>
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
