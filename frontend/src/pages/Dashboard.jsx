import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, walletAPI, roiAPI } from '../api';
import { StatCard } from '../components/StatCard';
import { CardSkeleton, ChartSkeleton } from '../components/Skeleton';
import { formatCurrency } from '../utils/format';
import { FiTrendingUp, FiDollarSign, FiUsers, FiCreditCard, FiCopy, FiPlay, FiArrowUpRight, FiArrowDownRight, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell,
} from 'recharts';

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 dark:bg-zinc-800 border border-zinc-700 dark:border-zinc-600 rounded-xl px-4 py-3 shadow-2xl shadow-black/40">
      <p className="text-xs font-medium text-zinc-400 dark:text-zinc-300 mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-zinc-300 dark:text-zinc-200">{entry.name}:</span>
          <span className="font-semibold text-white dark:text-zinc-100">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

const CustomLegend = ({ payload }) => (
  <div className="flex items-center justify-center gap-6 mt-4">
    {payload?.map((entry, i) => (
      <div key={i} className="flex items-center gap-2 text-sm">
        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
        <span className="text-gray-600 dark:text-zinc-400">{entry.value}</span>
      </div>
    ))}
  </div>
);

export const Dashboard = () => {
  const { user } = useAuth();
  const [depositAmount, setDepositAmount] = useState('');
  const [depositing, setDepositing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { data: summary, loading: summaryLoading, refetch } = useFetch(() => dashboardAPI.getSummary());
  const { data: chart, loading: chartLoading } = useFetch(() => dashboardAPI.getEarningsChart(30));

  const handleDeposit = async (e) => {
    e.preventDefault();
    setDepositing(true);
    try {
      const res = await walletAPI.deposit(Number(depositAmount));
      toast.success(res.data.message);
      setDepositAmount('');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Deposit failed');
    } finally {
      setDepositing(false);
    }
  };

  const handleProcessRoi = async () => {
    setProcessing(true);
    try {
      const res = await roiAPI.trigger();
      toast.success(`ROI processed: ${res.data.data.processed} credited, ${res.data.data.skipped} skipped`);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'ROI processing failed');
    } finally {
      setProcessing(false);
    }
  };

  if (summaryLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <ChartSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-r from-primary-600 via-primary-500 to-violet-500 rounded-2xl p-6 lg:p-8 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ij48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnYtMmgtNHY0aC0ydjJoMnY0aDJ2Mmg0di00aDJ2LTJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative">
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">Welcome back, {user?.name || 'Investor'}</h1>
          <p className="text-primary-100 text-sm lg:text-base">Here's what's happening with your investments today.</p>
        </div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        <StatCard title="Total Invested" value={formatCurrency(summary?.totalInvested || 0)} icon={FiCreditCard} color="primary" subtitle="Active capital" />
        <StatCard title="Today's ROI" value={formatCurrency(summary?.todaysRoi || 0)} icon={FiTrendingUp} color="green" subtitle="Daily earnings" />
        <StatCard title="Total Level Income" value={formatCurrency(summary?.totalLevelIncome || 0)} icon={FiUsers} color="purple" subtitle="Team rewards" />
        <StatCard title="Wallet Balance" value={formatCurrency(summary?.walletBalance || 0)} icon={FiDollarSign} color="yellow" subtitle="Available funds" />
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Wallet Deposit */}
        <div className="bg-white dark:bg-zinc-900 dark:border dark:border-zinc-800 dark:shadow-lg dark:shadow-black/20 rounded-2xl p-6 transition-colors">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
              <FiDollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-zinc-100">Add Funds</h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400">Deposit to your wallet</p>
            </div>
          </div>
          <form onSubmit={handleDeposit} className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5">Amount</label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                min="1" max="1000000" placeholder="0.00" required
              />
            </div>
            <button type="submit" disabled={depositing} className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 text-sm font-medium transition-all shadow-lg shadow-emerald-500/20">
              {depositing ? 'Depositing...' : 'Deposit'}
            </button>
          </form>
        </div>

        {/* Referral Code */}
        <div className="bg-white dark:bg-zinc-900 dark:border dark:border-zinc-800 dark:shadow-lg dark:shadow-black/20 rounded-2xl p-6 transition-colors">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
              <FiUsers className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-zinc-100">Referral Code</h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400">Share & earn together</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 px-4 py-2.5 rounded-xl">
              <span className="text-lg font-mono font-bold text-primary-600 dark:text-primary-400 tracking-wider">{user?.referralCode || 'N/A'}</span>
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(user?.referralCode || ''); toast.success('Copied!'); }}
              className="px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20"
            >
              <FiCopy className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Process ROI */}
      <div className="bg-white dark:bg-zinc-900 dark:border dark:border-zinc-800 dark:shadow-lg dark:shadow-black/20 rounded-2xl p-6 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center">
              <FiZap className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-zinc-100">Process ROI</h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400">Trigger daily ROI & level income distribution</p>
            </div>
          </div>
          <button
            onClick={handleProcessRoi} disabled={processing}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-xl hover:from-violet-600 hover:to-violet-700 disabled:opacity-50 text-sm font-medium transition-all shadow-lg shadow-violet-500/20"
          >
            <FiPlay className="w-4 h-4" />
            {processing ? 'Processing...' : 'Process Now'}
          </button>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Area Chart */}
        <div className="bg-white dark:bg-zinc-900 dark:border dark:border-zinc-800 dark:shadow-lg dark:shadow-black/20 rounded-2xl p-6 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-zinc-100">Earnings Trend</h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">Last 30 days performance</p>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
              <FiArrowUpRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Live</span>
            </div>
          </div>
          {chartLoading ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chart || []} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradientRoi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradientLevel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-zinc-800" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="roi" stroke="#3b82f6" strokeWidth={2.5} fill="url(#gradientRoi)" name="ROI" dot={false} activeDot={{ r: 5, strokeWidth: 2, fill: '#3b82f6' }} />
                <Area type="monotone" dataKey="levelIncome" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#gradientLevel)" name="Level Income" dot={false} activeDot={{ r: 5, strokeWidth: 2, fill: '#8b5cf6' }} />
                <Legend content={<CustomLegend />} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bar Chart */}
        <div className="bg-white dark:bg-zinc-900 dark:border dark:border-zinc-800 dark:shadow-lg dark:shadow-black/20 rounded-2xl p-6 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-zinc-100">Daily Breakdown</h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">Income distribution by day</p>
            </div>
          </div>
          {chartLoading ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chart || []} margin={{ top: 5, right: 5, left: -15, bottom: 0 }} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-zinc-800" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(113,113,122,0.08)' }} />
                <Bar dataKey="roi" fill="#3b82f6" name="ROI" radius={[6, 6, 0, 0]} />
                <Bar dataKey="levelIncome" fill="#8b5cf6" name="Level Income" radius={[6, 6, 0, 0]} />
                <Legend content={<CustomLegend />} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
