import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { roiAPI } from '../api';
import { Pagination, EmptyState } from '../components/Pagination';
import { TableSkeleton } from '../components/Skeleton';
import { formatCurrency, formatDate, formatDateTime } from '../utils/format';
import { FiDollarSign, FiFilter, FiTrendingUp, FiCheckCircle, FiXCircle, FiSkipForward } from 'react-icons/fi';

const statusConfig = {
  credited: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', ring: 'ring-emerald-600/20 dark:ring-emerald-400/30', icon: FiCheckCircle },
  failed: { bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-700 dark:text-red-400', ring: 'ring-red-600/20 dark:ring-red-400/30', icon: FiXCircle },
  skipped: { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', ring: 'ring-amber-600/20 dark:ring-amber-400/30', icon: FiSkipForward },
};

export const Earnings = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const { data: roiHistory, loading, meta } = useFetch(
    () => roiAPI.getHistory({ page, limit: 20, ...(statusFilter && { status: statusFilter }) }),
    [page, statusFilter]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Earnings History</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Track all ROI earnings credited to your account</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 dark:border dark:border-zinc-800 rounded-xl px-3 py-2 shadow-sm">
          <FiFilter className="w-4 h-4 text-gray-400 dark:text-zinc-500" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="text-sm bg-transparent border-0 text-gray-700 dark:text-zinc-300 focus:ring-0 focus:outline-none cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="credited">Credited</option>
            <option value="failed">Failed</option>
            <option value="skipped">Skipped</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      {meta && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="group bg-white dark:bg-zinc-900 dark:border dark:border-zinc-800 dark:shadow-lg dark:shadow-black/20 rounded-2xl p-5 transition-all hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-500/20 rounded-xl flex items-center justify-center">
                <FiDollarSign className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-zinc-400">Total Records</p>
                <p className="text-xl font-bold text-gray-900 dark:text-zinc-100">{meta.total || 0}</p>
              </div>
            </div>
          </div>
          <div className="group bg-white dark:bg-zinc-900 dark:border dark:border-zinc-800 dark:shadow-lg dark:shadow-black/20 rounded-2xl p-5 transition-all hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <FiTrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-zinc-400">Current Page</p>
                <p className="text-xl font-bold text-gray-900 dark:text-zinc-100">{page} / {meta.totalPages || 1}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 dark:border dark:border-zinc-800 dark:shadow-lg dark:shadow-black/20 rounded-2xl overflow-hidden transition-colors">
        {loading ? <TableSkeleton rows={10} cols={5} /> : !roiHistory?.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-gray-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-4"><FiDollarSign className="w-7 h-7 text-gray-400 dark:text-zinc-500" /></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-1">No earnings yet</h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400">Your ROI earnings will appear here once credited</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-zinc-800/50">
                  <tr>
                    {['Date & Time', 'Investment', 'Daily ROI', 'ROI Amount', 'Status'].map((h) => (
                      <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {roiHistory.map((record) => {
                    const config = statusConfig[record.status] || statusConfig.credited;
                    const StatusIcon = config.icon;
                    return (
                      <tr key={record._id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">{formatDate(record.forDate)}</p>
                          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">{formatDateTime(record.createdAt)}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-zinc-400">{formatCurrency(record.investment?.amount || 0)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-zinc-400">{record.investment?.dailyRoiPercent || 0}%</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <FiDollarSign className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(record.amount)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} ring-1 ${config.ring}`}>
                            <StatusIcon className="w-3 h-3" />
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 dark:border-zinc-800"><Pagination page={page} totalPages={meta?.totalPages || 1} onPageChange={setPage} /></div>
          </>
        )}
      </div>
    </div>
  );
};
