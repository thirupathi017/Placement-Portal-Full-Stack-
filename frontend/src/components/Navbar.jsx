import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  User, 
  Bell, 
  LogOut, 
  Menu, 
  X,
  Settings,
  ShieldCheck,
  Building2,
  Trophy
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import axiosInstance from '../api/axiosInstance';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const notifRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll for new notifications every 10 seconds
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get('/api/notifications');
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axiosInstance.put('/api/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Browse Jobs', path: '/jobs', icon: Briefcase },
    { name: 'Applications', path: '/my-applications', icon: FileText },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const companyLinks = [
    { name: 'Dashboard', path: '/company/dashboard', icon: LayoutDashboard },
    { name: 'Manage Jobs', path: '/company/jobs', icon: Briefcase },
    { name: 'Interviews', path: '/company/interviews', icon: Trophy },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Students', path: '/admin/students', icon: User },
    { name: 'Companies', path: '/admin/companies', icon: Building2 },
    { name: 'Placements', path: '/admin/placements', icon: ShieldCheck },
  ];

  const links = user?.role === 'STUDENT' ? studentLinks : 
                user?.role === 'COMPANY' ? companyLinks : 
                user?.role === 'ADMIN' ? adminLinks : [];

  return (
    <nav className="glass sticky top-0 z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-primary-600 p-2 rounded-lg text-white">
            <ShieldCheck size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight">Placement<span className="text-primary-600">Portal</span></span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-6">
          {links.map((link) => {
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link 
                key={link.path} 
                to={link.path}
                className={`flex items-center space-x-1.5 text-sm font-medium transition-colors px-3 py-2 rounded-lg ${
                  isActive 
                    ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/30' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-primary-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <link.icon size={18} />
                <span>{link.name}</span>
              </Link>
            );
          })}
          
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>
          
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
              )}
            </button>
            <NotificationDropdown 
              isOpen={showNotifications} 
              notifications={notifications}
              onMarkAllRead={handleMarkAllRead}
            />
          </div>
          
          <div className="flex items-center space-x-3 ml-4">
            <div className="text-right">
              <p className="text-sm font-bold leading-none">{user?.name}</p>
              <p className="text-xs text-slate-500 mt-1 capitalize">{user?.role?.toLowerCase()}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-4 pb-4 space-y-2">
          {links.map((link) => {
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link 
                key={link.path} 
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 font-bold' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium'
                }`}
              >
                <link.icon size={20} />
                <span>{link.name}</span>
              </Link>
            );
          })}
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 p-3 w-full text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
