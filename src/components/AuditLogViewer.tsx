import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Eye, Download, Filter, Calendar, User, Search, ChevronDown,
  ChevronUp, AlertCircle, CheckCircle2, X
} from 'lucide-react';
import { AuditLog, auditLogService } from '../services/audit.service';

interface AuditLogViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuditLogViewer({ isOpen, onClose }: AuditLogViewerProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'info' | 'warning' | 'error' | 'critical'>('all');
  const [pageSize, setPageSize] = useState(50);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadLogs();
    }
  }, [isOpen]);

  useEffect(() => {
    applyFilters();
  }, [logs, searchTerm, filterSeverity]);

  const loadLogs = () => {
    const auditLogs = auditLogService.getHistory(pageSize);
    setLogs(auditLogs);
  };

  const applyFilters = () => {
    let filtered = logs;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        log =>
          log.action.toLowerCase().includes(term) ||
          log.userEmail.toLowerCase().includes(term) ||
          log.resource?.name?.toLowerCase().includes(term) ||
          log.errorMessage?.toLowerCase().includes(term)
      );
    }

    if (filterSeverity !== 'all') {
      filtered = filtered.filter(log => log.severity === filterSeverity);
    }

    setFilteredLogs(filtered);
  };

  const getSeverityColor = (severity: AuditLog['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'error':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
  };

  const getSeverityIcon = (severity: AuditLog['severity'], status: string) => {
    if (status === 'failed') {
      return <AlertCircle className="w-4 h-4" />;
    }
    return <CheckCircle2 className="w-4 h-4" />;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  const exportLogs = () => {
    const csvContent = [
      ['时间', '用户', '操作', '资源', '严重程度', '状态'].join(','),
      ...filteredLogs.map(log =>
        [
          formatTimestamp(log.timestamp),
          log.userEmail,
          log.action,
          `${log.resource?.type || ''} - ${log.resource?.name || ''}`,
          log.severity,
          log.status
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${Date.now()}.csv`;
    a.click();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-neutral-950 border border-[#2F3336] rounded-xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2F3336]">
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-[#1D9BF0]" />
            <h2 className="text-lg font-bold text-white">审计日志</h2>
            <span className="text-xs text-[#8B949E]">
              {filteredLogs.length} / {logs.length} 条
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-900 rounded transition-colors"
          >
            <X className="w-5 h-5 text-[#8B949E]" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-[#2F3336] space-y-3">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#8B949E]" />
              <input
                type="text"
                placeholder="搜索用户、操作、资源..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-neutral-900 border border-[#2F3336] rounded-lg pl-10 pr-3 py-2 text-xs text-white placeholder-[#8B949E] focus:outline-none focus:border-[#1D9BF0]"
              />
            </div>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as any)}
              className="bg-neutral-900 border border-[#2F3336] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#1D9BF0]"
            >
              <option value="all">全部严重程度</option>
              <option value="info">信息</option>
              <option value="warning">警告</option>
              <option value="error">错误</option>
              <option value="critical">严重</option>
            </select>
            <button
              onClick={exportLogs}
              className="px-3 py-2 bg-[#1D9BF0] hover:bg-[#38BDF8] text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              导出
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="flex-1 overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-[#8B949E]">
              <p className="text-sm">暂无审计日志</p>
            </div>
          ) : (
            <div className="divide-y divide-[#2F3336]">
              {filteredLogs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-neutral-900/50 transition-colors"
                >
                  {/* Row */}
                  <div
                    className="p-3 cursor-pointer flex items-center justify-between gap-4"
                    onClick={() =>
                      setExpandedLog(expandedLog === log.id ? null : log.id)
                    }
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="shrink-0">
                        {getSeverityIcon(log.severity, log.status)}
                      </div>
                      <div className="flex-1 min-w-0 grid grid-cols-4 gap-4 text-xs">
                        <div className="text-[#8B949E]">
                          {formatTimestamp(log.timestamp)}
                        </div>
                        <div className="text-white font-mono truncate">
                          {log.userEmail}
                        </div>
                        <div className="text-white font-medium">{log.action}</div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getSeverityColor(
                              log.severity
                            )}`}
                          >
                            {log.severity}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="p-1 text-[#8B949E] hover:text-white">
                      {expandedLog === log.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Expanded Details */}
                  {expandedLog === log.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="bg-neutral-900/50 px-3 pb-3 border-t border-[#2F3336]"
                    >
                      <div className="text-xs space-y-2 text-[#8B949E]">
                        {log.resource && (
                          <div>
                            <span className="font-medium text-white">资源:</span>{' '}
                            {log.resource.type} - {log.resource.id}
                          </div>
                        )}
                        {log.status === 'failed' && log.errorMessage && (
                          <div>
                            <span className="font-medium text-red-400">错误:</span>{' '}
                            {log.errorMessage}
                          </div>
                        )}
                        {log.changes && (
                          <div>
                            <span className="font-medium text-white">更改:</span>
                            <div className="mt-1 font-mono text-[10px] space-y-1">
                              {Object.entries(log.changes).map(([key, value]) => (
                                <div key={key}>
                                  {key}: {JSON.stringify(value)}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {logs.length > pageSize && (
          <div className="border-t border-[#2F3336] p-3 text-center text-xs text-[#8B949E]">
            显示最近 {pageSize} 条记录
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default AuditLogViewer;

