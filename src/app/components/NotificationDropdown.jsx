//File: src/app/components/NotificationDropdown.jsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from "@/context/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";
import { FaBell, FaCheck, FaSync } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const NotificationDropdown = ({ currentUser, onUnreadCountChange }) => {
  const { theme } = useTheme();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const pollingRef = useRef(null);

  /**
   * Fetch notifications
   */
  const fetchNotifications = useCallback(async () => {
    if (!currentUser?.id) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/notifications/${currentUser.id}`);
      if (!res.ok) throw new Error("Failed to fetch notifications");

      const data = await res.json();
      setNotifications(data);
      const unread = data.filter(n => !n.read).length;
      setUnreadCount(unread);
      onUnreadCountChange?.(unread); // 🔔 Send count up
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.id]);

  
  useEffect(() => {
    if (!currentUser?.id) return;
  
    // Poll every 30 seconds for notifications, regardless of dropdown state
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);
  
    return () => clearInterval(interval);
  }, [currentUser?.id, fetchNotifications]);
  

  /**
   * Mark notifications as read
   */
  const markAsRead = async (ids) => {
    if (!ids.length) return;
    
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: ids }),
      });

      // Optimistically update UI
      setNotifications(prev => 
        prev.map(n => ids.includes(n.id) ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => {
        const updated = Math.max(prev - ids.length, 0);
        onUnreadCountChange?.(updated);
        return updated;
      });

    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  /**
   * Handle click on notification
   */

  const handleNotificationClick = (notification) => {
    markAsRead([notification.id]);
  

    switch (notification.type) {
      case "SUBMISSION":
        router.push(`/my-work-request?requestId=${notification.relatedId}&submission=true`);
        break;
      case "MESSAGE":
        router.push(`/my-work-request?requestId=${notification.relatedId}&message=true`);
        break;
      case "NEW_BID":
        router.push(`/my-work-request?requestId=${notification.relatedId}`);
        break;
      case "BID_ACCEPTED":
        router.push(`/my-contracts?contractId=${notification.relatedId}`);
        break;
      default:
        if (notification.link) {
          router.push(notification.link);
        } else {
          toast.error("Failed to navigate. The link might be broken.");
        }
    }
  
    // Close the dropdown after clicking
    setIsOpen(false);
  };
  

  /**
   * Get Icon based on type
   */
  const getIcon = (type) => {
    const icons = {
      'NEW_BID': '💰',
      'BID_ACCEPTED': '✅',
      'SUBMISSION': '📝',
      'FEEDBACK': '💬',
      'MESSAGE': '✉️',
    };
    return icons[type] || '🔔';
  };

  /**
   * Render Component
   */
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-full relative ${
          theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
        }`}
        aria-label="Notifications"
      >
        <FaBell className="text-lg" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute right-0 mt-2 w-80 rounded-md shadow-lg z-50 ${
              theme === 'dark' 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
            }`}
          >
            <div className="p-3 border-b flex justify-between items-center">
              <h3 className="font-semibold">Notifications</h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={fetchNotifications}
                  disabled={isLoading}
                  className="text-xs p-1 rounded hover:bg-opacity-20 hover:bg-gray-500"
                  aria-label="Refresh"
                >
                  <FaSync className={`text-xs ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                {notifications.some(n => !n.read) && (
                  <button 
                    onClick={() => markAsRead(notifications.filter(n => !n.read).map(n => n.id))}
                    className="text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-opacity-20 hover:bg-gray-500"
                  >
                    <FaCheck size={10} /> Mark all
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b cursor-pointer ${!notification.read ? 'bg-blue-50 dark:bg-gray-700' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <span className="text-lg">{getIcon(notification.type)}</span>
                    <div>
                      <p className="text-sm font-medium">{notification.relatedTitle}</p>
                      <p className="text-xs">{notification.message}</p>
                      <p className="text-[10px] text-gray-400">{new Date(notification.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
