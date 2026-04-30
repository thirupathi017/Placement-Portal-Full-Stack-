import React from 'react';
import { Bell, Check, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown = ({ isOpen, notifications, onMarkAllRead }) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="absolute top-12 right-0 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
        <h3 className="font-bold flex items-center space-x-2">
          <Bell size={18} className="text-primary-600" />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>
          )}
        </h3>
        {unreadCount > 0 && (
          <button 
            onClick={onMarkAllRead}
            className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
          >
            <Check size={14} />
            <span>Mark all read</span>
          </button>
        )}
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500 flex flex-col items-center">
            <Info size={32} className="text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!notification.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}
              >
                <p className={`text-sm ${!notification.isRead ? 'font-medium text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
                  {notification.message}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
