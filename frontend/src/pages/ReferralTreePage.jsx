import { useFetch } from '../hooks/useFetch';
import { referralAPI } from '../api';
import { ReferralTree } from '../components/referral-tree/ReferralTree';
import { FiUsers, FiRefreshCw, FiDollarSign, FiTrendingUp, FiPocket, FiShare2 } from 'react-icons/fi';
import { formatCurrency } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, color, gradient }) => (
  <div className="group relative bg-white dark:bg-zinc-900 dark:border dark:border-zinc-800 dark:shadow-lg dark:shadow-black/20 rounded-2xl p-5 overflow-hidden transition-all hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30">
    <div className={`absolute -top-6 -right-6 w-20 h-20 ${gradient} rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
    <div className="relative flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} transition-transform group-hover:scale-110`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">{label}</p>
        <p className="text-xl font-bold text-gray-900 dark:text-zinc-100 mt-0.5">{value}</p>
      </div>
    </div>
  </div>
);

export const ReferralTreePage = () => {
  const { user } = useAuth();
  const { data: tree, loading, error, refetch } = useFetch(() => referralAPI.getTree(10), []);
  const { data: stats } = useFetch(() => referralAPI.getTreeStats(), []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Referral Tree</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Visualize your complete referral network hierarchy</p>
        </div>
        <button
          onClick={refetch} disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-all shadow-sm"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FiUsers} label="Total Referrals" value={stats.totalReferrals || 0} color="bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" gradient="bg-blue-500" />
          <StatCard icon={FiDollarSign} label="Team ROI Earned" value={formatCurrency(stats.earnings?.totalTeamRoi || 0)} color="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" gradient="bg-emerald-500" />
          <StatCard icon={FiTrendingUp} label="Team Level Income" value={formatCurrency(stats.earnings?.totalTeamLevelIncome || 0)} color="bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400" gradient="bg-amber-500" />
          <StatCard icon={FiPocket} label="Team Wallet Balance" value={formatCurrency(stats.earnings?.totalTeamWallet || 0)} color="bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400" gradient="bg-violet-500" />
        </div>
      )}

      {/* Share Code */}
      <div className="bg-white dark:bg-zinc-900 dark:border dark:border-zinc-800 dark:shadow-lg dark:shadow-black/20 rounded-2xl p-5 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-500/20 rounded-xl flex items-center justify-center">
              <FiShare2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">Share your referral link</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400">Invite friends to grow your network</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <code className="px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-mono font-bold text-primary-600 dark:text-primary-400">
              {user?.referralCode || 'N/A'}
            </code>
            <button
              onClick={() => { navigator.clipboard.writeText(user?.referralCode || ''); toast.success('Copied!'); }}
              className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm font-medium transition-colors shadow-lg shadow-primary-500/20"
            >
              Copy
            </button>
          </div>
        </div>
      </div>

      {/* Tree Container */}
      <div className="bg-white dark:bg-zinc-900 dark:border dark:border-zinc-800 dark:shadow-lg dark:shadow-black/20 rounded-2xl p-6 min-h-[400px] transition-colors">
        <div className="flex items-center gap-2 mb-5">
          <FiUsers className="w-5 h-5 text-primary-500" />
          <h2 className="text-base font-semibold text-gray-900 dark:text-zinc-100">Network Hierarchy</h2>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                <div className="w-6 h-6 bg-gray-200 dark:bg-zinc-700 rounded" />
                <div className="w-10 h-10 bg-gray-200 dark:bg-zinc-700 rounded-xl" />
                <div className="flex-1 space-y-2"><div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-1/4" /><div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-1/3" /></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-red-100 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mb-4"><FiUsers className="w-7 h-7 text-red-500 dark:text-red-400" /></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-1">Failed to load tree</h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mb-5">{error}</p>
            <button onClick={refetch} className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/20">Try Again</button>
          </div>
        ) : !tree || !tree.children || tree.children.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-gray-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-4"><FiUsers className="w-7 h-7 text-gray-400 dark:text-zinc-500" /></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-1">No referrals yet</h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400">Share your referral code to invite others and build your tree</p>
          </div>
        ) : <ReferralTree data={tree} />}
      </div>
    </div>
  );
};
