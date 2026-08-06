import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { referralAPI } from '../api';
import { Pagination, EmptyState } from '../components/Pagination';
import { TableSkeleton } from '../components/Skeleton';
import { formatCurrency, formatDate, formatDateTime } from '../utils/format';
import { FiChevronRight, FiChevronDown, FiUser, FiUsers, FiDollarSign, FiTrendingUp, FiCopy } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const TreeNode = ({ node, depth = 0 }) => {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children?.length > 0;

  return (
    <div style={{ marginLeft: depth * 28 }}>
      <div className="flex items-center gap-2 py-1.5">
        {hasChildren ? (
          <button onClick={() => setExpanded(!expanded)} className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
            {expanded ? <FiChevronDown className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" /> : <FiChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />}
          </button>
        ) : <div className="w-6" />}
        <div className="flex-1 flex items-center gap-3 px-3 py-2.5 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-800 hover:border-primary-200 dark:hover:border-primary-500/30 transition-all">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-sm font-semibold text-white">{node.fullName?.charAt(0)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-zinc-100 truncate">{node.fullName}</p>
            <p className="text-xs text-gray-400 dark:text-zinc-500">Level {node.level} &middot; {formatDate(node.createdAt)}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(node.totalRoiEarned || 0)}</p>
            <p className="text-xs text-gray-400 dark:text-zinc-500">earned</p>
          </div>
          {hasChildren && (
            <span className="text-xs px-2 py-0.5 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-full font-medium">{node.children.length}</span>
          )}
        </div>
      </div>
      {expanded && hasChildren && (
        <div className="border-l-2 border-gray-200 dark:border-zinc-800 ml-3">
          {node.children.map((child) => <TreeNode key={child._id} node={child} depth={depth + 1} />)}
        </div>
      )}
    </div>
  );
};

export const Referrals = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('direct');
  const [page, setPage] = useState(1);
  const { data: tree, loading: treeLoading } = useFetch(() => referralAPI.getTree(5), []);
  const { data: direct, loading: directLoading, meta: directMeta } = useFetch(() => referralAPI.getDirect({ page, limit: 10 }), [page]);
  const { data: income, loading: incomeLoading, meta: incomeMeta } = useFetch(() => referralAPI.getIncome({ page, limit: 10 }), [page]);

  const tabs = [
    { key: 'direct', label: 'Direct Referrals', icon: FiUser },
    { key: 'income', label: 'Income History', icon: FiDollarSign },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Referrals</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Grow your network and track referral earnings</p>
      </div>

      {/* Referral Code Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-violet-600 rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <FiCopy className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-primary-100">Your Referral Code</p>
            <p className="text-lg font-bold text-white font-mono tracking-wider">{user?.referralCode || 'N/A'}</p>
          </div>
        </div>
        <button
          onClick={() => { navigator.clipboard.writeText(user?.referralCode || ''); toast.success('Copied!'); }}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-medium transition-colors"
        >
          Copy Code
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800/50 rounded-xl p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setPage(1); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 shadow-sm' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-300'}`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Direct Referrals Tab */}
      {activeTab === 'direct' && (
        directLoading ? <TableSkeleton rows={5} cols={4} /> : !direct?.length ? <EmptyState message="No direct referrals yet" /> : (
          <div className="bg-white dark:bg-zinc-900 dark:border dark:border-zinc-800 dark:shadow-lg dark:shadow-black/20 rounded-2xl overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-zinc-800/50">
                  <tr>{['Member', 'Email', 'Joined', 'ROI Earned'].map((h) => <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {direct.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-white">{u.fullName?.charAt(0)}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-zinc-100">{u.fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-zinc-400">{u.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-zinc-400">{formatDate(u.createdAt)}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(u.totalRoiEarned || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 dark:border-zinc-800"><Pagination page={page} totalPages={directMeta?.totalPages || 1} onPageChange={setPage} /></div>
          </div>
        )
      )}

      {/* Income History Tab */}
      {activeTab === 'income' && (
        incomeLoading ? <TableSkeleton rows={5} cols={5} /> : !income?.length ? <EmptyState message="No referral income yet" /> : (
          <div className="bg-white dark:bg-zinc-900 dark:border dark:border-zinc-800 dark:shadow-lg dark:shadow-black/20 rounded-2xl overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-zinc-800/50">
                  <tr>{['From', 'Level', 'Percent', 'Amount', 'Date'].map((h) => <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {income.map((inc) => (
                    <tr key={inc._id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-zinc-100">{inc.fromUser?.fullName}</td>
                      <td className="px-6 py-4"><span className="text-xs px-2.5 py-1 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-full font-medium">Level {inc.level}</span></td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-zinc-400">{inc.percent}%</td>
                      <td className="px-6 py-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(inc.amount)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-zinc-400">{formatDateTime(inc.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 dark:border-zinc-800"><Pagination page={page} totalPages={incomeMeta?.totalPages || 1} onPageChange={setPage} /></div>
          </div>
        )
      )}
    </div>
  );
};
