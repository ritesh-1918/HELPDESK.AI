/**
 * SLA Breach Prediction Dashboard
 * 
 * Displays at-risk tickets, prediction analytics, and proactive alerting controls.
 */

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  TrendingUp,
  Clock,
  Bell,
  RefreshCw,
  BarChart3,
  Activity,
  Shield,
  Zap
} from 'lucide-react';

const SLAPredictionDashboard = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [atRiskTickets, setAtRiskTickets] = useState([]);
  const [alertHistory, setAlertHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('medium');
  const [lastScanTime, setLastScanTime] = useState(null);

  useEffect(() => {
    loadDashboardData();
    // Refresh every 5 minutes
    const interval = setInterval(loadDashboardData, 300000);
    return () => clearInterval(interval);
  }, [selectedRiskLevel]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load dashboard statistics
      const statsResponse = await fetch('/api/sla-prediction/dashboard-stats', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const stats = await statsResponse.json();
      setDashboardStats(stats);

      // Load at-risk tickets
      const ticketsResponse = await fetch(
        `/api/sla-prediction/at-risk?min_risk_level=${selectedRiskLevel}&limit=50`,
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
      );
      const ticketsData = await ticketsResponse.json();
      setAtRiskTickets(ticketsData.tickets || []);

      // Load alert history
      const historyResponse = await fetch('/api/sla-prediction/alert-history?limit=20', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const historyData = await historyResponse.json();
      setAlertHistory(historyData.alerts || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerAlertScan = async () => {
    setScanning(true);
    try {
      const response = await fetch('/api/sla-prediction/scan-and-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          min_risk_level: selectedRiskLevel,
          send_notifications: true
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setLastScanTime(new Date(result.timestamp));
        alert(`Scan complete: ${result.alerts_sent} alerts sent, ${result.escalations_triggered} escalations triggered`);
        loadDashboardData(); // Refresh data
      } else {
        alert('Scan failed. Please try again.');
      }
    } catch (error) {
      console.error('Error triggering scan:', error);
      alert('Error triggering scan');
    } finally {
      setScanning(false);
    }
  };

  const getRiskBadgeColor = (riskLevel) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200',
      safe: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200'
    };
    return colors[riskLevel] || colors.medium;
  };

  const formatTimeRemaining = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
    return `${Math.floor(minutes / 1440)}d`;
  };

  if (loading && !dashboardStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-lg text-gray-600 dark:text-gray-400">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            SLA Breach Prediction
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Proactive monitoring and alerting for at-risk tickets
          </p>
        </div>
        <button
          onClick={triggerAlertScan}
          disabled={scanning}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {scanning ? (
            <>
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Bell className="w-5 h-5 mr-2" />
              Scan & Alert
            </>
          )}
        </button>
      </div>

      {/* Statistics Cards */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total At Risk */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total At Risk</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {dashboardStats.total_at_risk}
                </p>
              </div>
              <AlertTriangle className="w-12 h-12 text-orange-500" />
            </div>
          </div>

          {/* Critical Tickets */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Needs Immediate Action</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                  {dashboardStats.requires_immediate_attention}
                </p>
              </div>
              <Zap className="w-12 h-12 text-red-500" />
            </div>
          </div>

          {/* Monitoring */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Requires Monitoring</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
                  {dashboardStats.requires_monitoring}
                </p>
              </div>
              <Activity className="w-12 h-12 text-yellow-500" />
            </div>
          </div>

          {/* Avg Probability */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Breach Probability</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {(dashboardStats.average_breach_probability * 100).toFixed(0)}%
                </p>
              </div>
              <BarChart3 className="w-12 h-12 text-blue-500" />
            </div>
          </div>
        </div>
      )}

      {/* Risk Distribution */}
      {dashboardStats && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2" />
            Risk Distribution
          </h2>
          <div className="flex space-x-2">
            {Object.entries(dashboardStats.risk_distribution).map(([level, count]) => (
              <div
                key={level}
                className={`flex-1 ${getRiskBadgeColor(level)} border rounded-lg p-4 text-center`}
              >
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-sm capitalize mt-1">{level}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Contributing Factors */}
      {dashboardStats && dashboardStats.top_contributing_factors.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Top Contributing Factors
          </h2>
          <div className="space-y-2">
            {dashboardStats.top_contributing_factors.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">{item.factor}</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {item.count} tickets
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* At-Risk Tickets Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <Shield className="w-6 h-6 mr-2" />
            At-Risk Tickets
          </h2>
          <select
            value={selectedRiskLevel}
            onChange={(e) => setSelectedRiskLevel(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="low">Low and above</option>
            <option value="medium">Medium and above</option>
            <option value="high">High and above</option>
            <option value="critical">Critical only</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Ticket</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Risk</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Probability</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Time Remaining</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Priority</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {atRiskTickets.map((ticket) => (
                <tr key={ticket.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        #{ticket.id.substring(0, 8)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                        {ticket.subject}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskBadgeColor(ticket.prediction.risk_level.value || ticket.prediction.risk_level)}`}>
                      {(ticket.prediction.risk_level.value || ticket.prediction.risk_level).toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {(ticket.prediction.probability * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatTimeRemaining(ticket.prediction.time_to_breach_minutes)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm capitalize text-gray-700 dark:text-gray-300">
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => window.location.href = `/tickets/${ticket.id}`}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {atRiskTickets.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No at-risk tickets found at this risk level
            </div>
          )}
        </div>
      </div>

      {/* Last Scan Info */}
      {lastScanTime && (
        <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
          Last scan: {lastScanTime.toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default SLAPredictionDashboard;
