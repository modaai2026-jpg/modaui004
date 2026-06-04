import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Notification, notificationService } from '../services/notification.service';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    // 订阅所有通知
    const unsubscribe = notificationService.subscribe('all', () => {
      updateNotifications();
    });

    // 初始加载
    updateNotifications();

    return unsubscribe;
  }, []);

  const updateNotifications = () => {
    const allNotifications = notificationService.getHistory(100);
    setNotifications(filter === 'unread' ? allNotifications.filter(n => !n.read) : allNotifications);
  };

  const handleMarkAsRead = (notificationId: string) => {
    notificationService.markAsRead(notificationId);
    updateNotifications();
  };

  const handleClear = () => {
    notificationService.clearHistory();
    setNotifications([]);
  };

  const getIcon = (level: string) => {
    switch (level) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = (level: string) => {
    switch (level) {
      case 'success':
        return 'bg-green-500/10 border-green-500/20';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20';
      case 'error':
      case 'critical':
        return 'bg-red-500/10 border-red-500/20';
      default:
        return 'bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed right-0 top-0 bottom-0 w-96 bg-neutral-950 border-l border-[#2F3336] z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#2F3336]">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-[#1D9BF0]" />
                <h2 className="text-sm font-bold text-white">消息中心</h2>
                {notificationService.getUnread().length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                    {notificationService.getUnread().length}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-neutral-900 rounded transition-colors"
              >
                <X className="w-5 h-5 text-[#8B949E]" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 px-4 pt-3 pb-2 border-b border-[#2F3336]">
              <button
                onClick={() => {
                  setFilter('all');
                  updateNotifications();
                }}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  filter === 'all'
                    ? 'bg-[#1D9BF0] text-white'
                    : 'text-[#8B949E] hover:text-white'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => {
                  setFilter('unread');
                  updateNotifications();
                }}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  filter === 'unread'
                    ? 'bg-[#1D9BF0] text-white'
                    : 'text-[#8B949E] hover:text-white'
                }`}
              >
                未读
              </button>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex items-center justify-center h-full text-[#8B949E]">
                  <p className="text-sm">暂无通知</p>
                </div>
              ) : (
                <div className="space-y-2 p-3">
                  {notifications.map((notif) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 rounded-lg border ${getBgColor(notif.level)} cursor-pointer transition-all hover:border-opacity-50 ${
                        !notif.read ? 'ring-1 ring-[#1D9BF0]/30' : ''
                      }`}
                      onClick={() => handleMarkAsRead(notif.id)}
                    >
                      <div className="flex gap-3">
                        <div className="shrink-0 mt-0.5">
                          {getIcon(notif.level)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-bold text-white">{notif.title}</p>
                            <span className="text-[10px] text-[#8B949E] shrink-0">
                              {new Date(notif.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-xs text-[#8B949E] mt-1 line-clamp-2">
                            {notif.message}
                          </p>
                          {notif.details && (
                            <div className="mt-2 text-[10px] text-[#6B7280] space-y-1">
                              {Object.entries(notif.details).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span>{key}:</span>
                                  <span className="text-white font-mono">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {!notif.read && (
                            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-[#1D9BF0]" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-[#2F3336] p-3">
                <button
                  onClick={handleClear}
                  className="w-full text-xs font-medium text-[#8B949E] hover:text-white py-2 px-3 rounded transition-colors hover:bg-neutral-900"
                >
                  清空所有
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default NotificationCenter;

