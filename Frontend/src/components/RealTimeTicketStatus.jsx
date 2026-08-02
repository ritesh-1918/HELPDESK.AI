/**
 * Real-Time Ticket Status Component
 * 
 * Displays live ticket status updates using WebSocket connection.
 * Shows badges and notifications when ticket properties change.
 */

import React, { useEffect, useState } from 'react';
import { useTicketUpdates } from '../contexts/WebSocketContext';
import { 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  User, 
  Tag, 
  TrendingUp,
  Bell,
  X
} from 'lucide-react';

const RealTimeTicketStatus = ({ ticketId, initialStatus, onStatusChange }) => {
  const [status, setStatus] = useState(initialStatus);
  const [notifications, setNotifications] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Subscribe to ticket updates
  useTicketUpdates(ticketId, (message) => {
    console.log('[TicketStatus] Update received:', message);
    
    const { update_type, data } = message;
    const timestamp = new Date(message.timestamp);
    
    // Update status
    if (data) {
      setStatus(prev => ({ ...prev, ...data }));
      onStatusChange?.(data);
    }
    
    setLastUpdate(timestamp);
    
    // Add notification
    const notification = {
      id: Date.now(),
      type: update_type,
      message: formatUpdateMessage(update_type, data),
      timestamp
    };
    
    setNotifications(prev => [notification, ...prev].slice(0, 5));
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  });

  const formatUpdateMessage = (updateType, data) => {
    switch (updateType) {
      case 'status_changed':
        return `Status changed to ${data.status}`;
      case 'priority_changed':
        return `Priority updated to ${data.priority}`;
      case 'assigned':
        return `Assigned to ${data.assigned_to_name || 'agent'}`;
      case 'comment_added':
        return 'New comment added';
      case 'resolved':
        return 'Ticket marked as resolved';
      case 'reopened':
        return 'Ticket reopened';
      default:
        return 'Ticket updated';
    }
  };

  const getStatusColor = (statusValue) => {
    const colors = {
      open: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      closed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return colors[statusValue] || colors.open;
  };

  const getPriorityColor = (priorityValue) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return colors[priorityValue] || colors.medium;
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Status Badges */}
      <div className="flex flex-wrap gap-2">
        {/* Status Badge */}
        {status.status && (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status.status)}`}>
            {status.status === 'open' && <AlertCircle className="w-4 h-4 mr-1" />}
            {status.status === 'in_progress' && <Clock className="w-4 h-4 mr-1" />}
            {status.status === 'resolved' && <CheckCircle className="w-4 h-4 mr-1" />}
            {status.status === 'closed' && <CheckCircle className="w-4 h-4 mr-1" />}
            {status.status.replace('_', ' ').toUpperCase()}
          </span>
        )}

        {/* Priority Badge */}
        {status.priority && (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(status.priority)}`}>
            <TrendingUp className="w-4 h-4 mr-1" />
            {status.priority.toUpperCase()}
          </span>
        )}

        {/* Category Badge */}
        {status.category && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
            <Tag className="w-4 h-4 mr-1" />
            {status.category}
          </span>
        )}

        {/* Assigned To Badge */}
        {status.assigned_to_name && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">
            <User className="w-4 h-4 mr-1" />
            {status.assigned_to_name}
          </span>
        )}
      </div>

      {/* Last Update Timestamp */}
      {lastUpdate && (
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <Clock className="w-3 h-3 mr-1" />
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      )}

      {/* Real-Time Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-start justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg animate-fade-in"
            >
              <div className="flex items-start space-x-2 flex-1">
                <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">
                    {notification.message}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    {notification.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => dismissNotification(notification.id)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RealTimeTicketStatus;

/* Add this to your global CSS for the fade-in animation:
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
*/
