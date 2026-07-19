/**
 * PriorityEscalationPage — Admin page for managing priority escalation rules
 *
 * Features:
 *   - Create, edit, delete escalation rules
 *   - View escalation logs and statistics
 *   - Manually trigger escalation sweeps
 *   - Configure age-based and reopen-based escalation rules
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  AlertTriangle,
  Clock,
  RefreshCw,
  Settings,
  BarChart3,
  Play,
  CheckCircle,
  XCircle,
  History,
} from 'lucide-react';

import { API_CONFIG } from '../../config';

const API_BASE = API_CONFIG.BACKEND_URL;

// ── Priority styles ────────────────────────────────────────────────────────

const PRIORITY_STYLES = {
  critical: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA', label: 'Critical' },
  high: { bg: '#FFF7ED', text: '#EA580C', border: '#FED7AA', label: 'High' },
  medium: { bg: '#FEFCE8', text: '#CA8A04', border: '#FDE68A', label: 'Medium' },
  low: { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0', label: 'Low' },
};

// ── Data fetching helpers ────────────────────────────────────────────────────

async function fetchEscalationRules() {
  const res = await fetch(`${API_BASE}/api/escalation/rules`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function createEscalationRule(ruleData) {
  const res = await fetch(`${API_BASE}/api/escalation/rules`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(ruleData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

async function updateEscalationRule(ruleId, updates) {
  const res = await fetch(`${API_BASE}/api/escalation/rules/${ruleId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

async function deleteEscalationRule(ruleId) {
  const res = await fetch(`${API_BASE}/api/escalation/rules/${ruleId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return true;
}

async function runEscalationSweep(sendAlerts = true) {
  const res = await fetch(`${API_BASE}/api/escalation/sweep?send_alerts=${sendAlerts}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function fetchEscalationLogs(limit = 50) {
  const res = await fetch(`${API_BASE}/api/escalation/logs?limit=${limit}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── PriorityEscalationPage Component ────────────────────────────────────────

export default function PriorityEscalationPage() {
  const [rules, setRules] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sweepLoading, setSweepLoading] = useState(false);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('rules'); // 'rules' | 'logs'

  const [formData, setFormData] = useState({
    rule_name: '',
    rule_description: '',
    from_priority: 'low',
    to_priority: 'medium',
    age_threshold_hours: null,
    reopen_count_threshold: null,
    enabled: true,
    priority_order: 0,
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [rulesData, logsData] = await Promise.all([
        fetchEscalationRules(),
        fetchEscalationLogs(50),
      ]);
      setRules(rulesData);
      setLogs(logsData.logs || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateRule = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await createEscalationRule(formData);
      setSuccess('Escalation rule created successfully');
      setShowRuleForm(false);
      resetForm();
      await loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateRule = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await updateEscalationRule(editingRule.id, formData);
      setSuccess('Escalation rule updated successfully');
      setEditingRule(null);
      resetForm();
      await loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (!window.confirm('Are you sure you want to delete this escalation rule?')) return;
    
    try {
      setError(null);
      await deleteEscalationRule(ruleId);
      setSuccess('Escalation rule deleted successfully');
      await loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRunSweep = async () => {
    try {
      setSweepLoading(true);
      setError(null);
      const result = await runEscalationSweep(true);
      setSuccess(`Escalation sweep complete: ${result.stats.escalated} tickets escalated`);
      await loadData();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSweepLoading(false);
    }
  };

  const handleEditRule = (rule) => {
    setEditingRule(rule);
    setFormData({
      rule_name: rule.rule_name,
      rule_description: rule.rule_description || '',
      from_priority: rule.from_priority,
      to_priority: rule.to_priority,
      age_threshold_hours: rule.age_threshold_hours,
      reopen_count_threshold: rule.reopen_count_threshold,
      enabled: rule.enabled,
      priority_order: rule.priority_order,
    });
    setShowRuleForm(true);
  };

  const resetForm = () => {
    setFormData({
      rule_name: '',
      rule_description: '',
      from_priority: 'low',
      to_priority: 'medium',
      age_threshold_hours: null,
      reopen_count_threshold: null,
      enabled: true,
      priority_order: 0,
    });
    setShowRuleForm(false);
    setEditingRule(null);
  };

  const toggleRuleEnabled = async (rule) => {
    try {
      setError(null);
      await updateEscalationRule(rule.id, { enabled: !rule.enabled });
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                Priority Escalation Rules
              </h1>
              <p className="text-gray-600 mt-1">
                Configure automatic priority escalation for aging and frequently reopened tickets
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRunSweep}
                disabled={sweepLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 
                         disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {sweepLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Run Escalation Sweep
                  </>
                )}
              </button>
              <button
                onClick={() => setShowRuleForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                         flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Rule
              </button>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-green-800 font-medium">Success</p>
              <p className="text-green-700 text-sm">{success}</p>
            </div>
            <button onClick={() => setSuccess(null)} className="text-green-600 hover:text-green-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-6 py-3 font-medium flex items-center gap-2 ${
                activeTab === 'rules'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Settings className="w-4 h-4" />
              Escalation Rules ({rules.length})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-6 py-3 font-medium flex items-center gap-2 ${
                activeTab === 'logs'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <History className="w-4 h-4" />
              Escalation Logs ({logs.length})
            </button>
          </div>

          {/* Rules Tab */}
          {activeTab === 'rules' && (
            <div className="p-6">
              {showRuleForm ? (
                <RuleForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={editingRule ? handleUpdateRule : handleCreateRule}
                  onCancel={resetForm}
                  isEditing={!!editingRule}
                />
              ) : (
                <RulesList
                  rules={rules}
                  onEdit={handleEditRule}
                  onDelete={handleDeleteRule}
                  onToggleEnabled={toggleRuleEnabled}
                />
              )}
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div className="p-6">
              <EscalationLogs logs={logs} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── RuleForm Component ────────────────────────────────────────────────────────

function RuleForm({ formData, setFormData, onSubmit, onCancel, isEditing }) {
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rule Name */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rule Name *
          </label>
          <input
            type="text"
            value={formData.rule_name}
            onChange={(e) => updateField('rule_name', e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Low to Medium after 7 days"
          />
        </div>

        {/* Rule Description */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.rule_description}
            onChange={(e) => updateField('rule_description', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Brief description of what this rule does"
          />
        </div>

        {/* From Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From Priority *
          </label>
          <select
            value={formData.from_priority}
            onChange={(e) => updateField('from_priority', e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* To Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To Priority *
          </label>
          <select
            value={formData.to_priority}
            onChange={(e) => updateField('to_priority', e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        {/* Age Threshold */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Age Threshold (hours)
          </label>
          <input
            type="number"
            value={formData.age_threshold_hours || ''}
            onChange={(e) => updateField('age_threshold_hours', e.target.value ? parseInt(e.target.value) : null)}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 168 (7 days)"
          />
          <p className="text-xs text-gray-500 mt-1">Leave empty to disable age-based escalation</p>
        </div>

        {/* Reopen Count Threshold */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reopen Count Threshold
          </label>
          <input
            type="number"
            value={formData.reopen_count_threshold || ''}
            onChange={(e) => updateField('reopen_count_threshold', e.target.value ? parseInt(e.target.value) : null)}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 2"
          />
          <p className="text-xs text-gray-500 mt-1">Leave empty to disable reopen-based escalation</p>
        </div>

        {/* Priority Order */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority Order
          </label>
          <input
            type="number"
            value={formData.priority_order}
            onChange={(e) => updateField('priority_order', parseInt(e.target.value))}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
          />
          <p className="text-xs text-gray-500 mt-1">Lower numbers are evaluated first</p>
        </div>

        {/* Enabled */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) => updateField('enabled', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Rule Enabled</span>
          </label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isEditing ? 'Update Rule' : 'Create Rule'}
        </button>
      </div>
    </form>
  );
}

// ── RulesList Component ────────────────────────────────────────────────────────

function RulesList({ rules, onEdit, onDelete, onToggleEnabled }) {
  if (rules.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-lg font-medium">No escalation rules configured</p>
        <p className="text-sm">Create your first rule to enable automatic priority escalation</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rules.map((rule) => (
        <div
          key={rule.id}
          className={`p-4 border-2 rounded-lg ${
            rule.enabled ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{rule.rule_name}</h3>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    rule.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {rule.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              {rule.rule_description && (
                <p className="text-sm text-gray-600 mb-3">{rule.rule_description}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">From:</span>
                  <PriorityBadge priority={rule.from_priority} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">To:</span>
                  <PriorityBadge priority={rule.to_priority} />
                </div>
                {rule.age_threshold_hours && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{rule.age_threshold_hours}h age</span>
                  </div>
                )}
                {rule.reopen_count_threshold && (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{rule.reopen_count_threshold}+ reopens</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleEnabled(rule)}
                className={`px-3 py-1 text-sm font-medium rounded ${
                  rule.enabled
                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {rule.enabled ? 'Disable' : 'Enable'}
              </button>
              <button
                onClick={() => onEdit(rule)}
                className="p-2 text-blue-600 hover:bg-blue-100 rounded"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(rule.id)}
                className="p-2 text-red-600 hover:bg-red-100 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── EscalationLogs Component ────────────────────────────────────────────────────

function EscalationLogs({ logs }) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-lg font-medium">No escalation logs yet</p>
        <p className="text-sm">Escalations will appear here once rules are triggered</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <div key={log.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-500">Ticket {log.ticket_id}</span>
                <span className="text-gray-300">→</span>
                <PriorityBadge priority={log.from_priority} />
                <span className="text-gray-500">→</span>
                <PriorityBadge priority={log.to_priority} />
              </div>
              <p className="text-sm text-gray-700">{log.escalation_reason}</p>
              {log.ticket_age_hours && (
                <p className="text-xs text-gray-500 mt-1">
                  Ticket age: {log.ticket_age_hours.toFixed(1)} hours
                </p>
              )}
              {log.reopen_count && (
                <p className="text-xs text-gray-500 mt-1">Reopened {log.reopen_count} times</p>
              )}
            </div>
            <div className="text-right text-xs text-gray-500">
              {new Date(log.escalated_at).toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── PriorityBadge Component ────────────────────────────────────────────────────

function PriorityBadge({ priority }) {
  const style = PRIORITY_STYLES[priority] || PRIORITY_STYLES.medium;
  return (
    <span
      className="px-2 py-1 text-xs font-medium rounded"
      style={{
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
      }}
    >
      {style.label}
    </span>
  );
}
