import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { investmentAPI, planAPI } from '../api';
import { Pagination, EmptyState } from '../components/Pagination';
import { TableSkeleton } from '../components/Skeleton';
import { formatCurrency, formatDate } from '../utils/format';
import toast from 'react-hot-toast';
import { FiPlus, FiX, FiTrendingUp, FiClock, FiTarget, FiLayers, FiChevronRight } from 'react-icons/fi';

const CreatePlanForm = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({ name: '', minAmount: '', maxAmount: '', dailyRoiPercent: '', durationDays: '', levelIncomePercents: '10,5,3,2,1' });
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await planAPI.create({ name: form.name, minAmount: Number(form.minAmount), maxAmount: Number(form.maxAmount), dailyRoiPercent: Number(form.dailyRoiPercent), durationDays: Number(form.durationDays), levelIncomePercents: form.levelIncomePercents.split(',').map(Number) });
      toast.success('Plan created'); onSuccess(); onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create plan'); }
    finally { setLoading(false); }
  };
  return (
    <div className="bg-white dark:bg-zinc-900 dark:border dark:border-zinc-800 dark:shadow-lg dark:shadow-black/20 rounded-2xl p-6 transition-colors">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Create New Plan</h2>
        <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">
          <FiX className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[{ name: 'name', label: 'Plan Name', type: 'text', placeholder: 'e.g. Gold Plan' }, { name: 'dailyRoiPercent', label: 'Daily ROI %', type: 'number', step: '0.1', min: '0', max: '100' }, { name: 'minAmount', label: 'Min Amount', type: 'number', min: '1' }, { name: 'maxAmount', label: 'Max Amount', type: 'number', min: '1' }, { name: 'durationDays', label: 'Duration (Days)', type: 'number', min: '1' }, { name: 'levelIncomePercents', label: 'Level Income % (comma-separated)', type: 'text', placeholder: '10,5,3,2,1' }].map((field) => (
            <div key={field.name}>
              <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5">{field.label}</label>
              <input type={field.type} name={field.name} value={form[field.name]} onChange={handleChange} placeholder={field.placeholder} step={field.step} min={field.min} max={field.max} required className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
            </div>
          ))}
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 text-sm font-medium transition-all shadow-lg shadow-primary-500/20">{loading ? 'Creating...' : 'Create Plan'}</button>
          <button type="button" onClick={onClose} className="px-5 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 text-sm text-gray-700 dark:text-zinc-300 transition-colors">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export const Investments = () => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [showCreateInvestment, setShowCreateInvestment] = useState(false);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [amount, setAmount] = useState('');
  const [creating, setCreating] = useState(false);
  const { data: investments, loading, meta, refetch: refetchInvestments } = useFetch(() => investmentAPI.list({ page, limit: 10, status: status || undefined }), [page, status]);
  const { data: plans, refetch: refetchPlans } = useFetch(() => planAPI.list());

  const handleCreateInvestment = async (e) => {
    e.preventDefault(); setCreating(true);
    try {
      await investmentAPI.create({ planId: selectedPlan, amount: Number(amount) });
      toast.success('Investment created'); setShowCreateInvestment(false); setSelectedPlan(''); setAmount(''); refetchInvestments();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create investment'); }
    finally { setCreating(false); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Investments</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Manage your investment portfolio</p>
        </div>
        <button onClick={() => setShowCreateInvestment(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 text-sm font-medium transition-all shadow-lg shadow-primary-500/20">
          <FiPlus className="w-4 h-4" /> New Investment
        </button>
      </div>

      {showCreatePlan && <CreatePlanForm onClose={() => setShowCreatePlan(false)} onSuccess={refetchPlans} />}

      {/* Create Investment Form */}
      {showCreateInvestment && (
        <div className="bg-white dark:bg-zinc-900 dark:border dark:border-zinc-800 dark:shadow-lg dark:shadow-black/20 rounded-2xl p-6 transition-colors">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">New Investment</h2>
            <button onClick={() => setShowCreateInvestment(false)} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">
              <FiX className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
            </button>
          </div>
          <form onSubmit={handleCreateInvestment} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5">Select Plan</label>
                <select value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)} required className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all">
                  <option value="">Choose a plan...</option>
                  {(plans || []).map((plan) => (
                    <option key={plan._id} value={plan._id}>{plan.name} | {formatCurrency(plan.minAmount)}-{formatCurrency(plan.maxAmount)} | {plan.dailyRoiPercent}% daily</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5">Amount</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required min="1" placeholder="Enter amount" className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={creating} className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 text-sm font-medium transition-all shadow-lg shadow-primary-500/20">{creating ? 'Creating...' : 'Invest Now'}</button>
              <button type="button" onClick={() => setShowCreateInvestment(false)} className="px-5 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 text-sm text-gray-700 dark:text-zinc-300 transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Plans */}
      <div className="bg-white dark:bg-zinc-900 dark:border dark:border-zinc-800 dark:shadow-lg dark:shadow-black/20 rounded-2xl p-6 transition-colors">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-zinc-100">Available Plans</h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">Choose from our investment tiers</p>
          </div>
          {/* <button onClick={() => setShowCreatePlan(true)} className="flex items-center gap-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
            <FiPlus className="w-3.5 h-3.5" /> Add Plan
          </button> */}
        </div>
        {plans?.length === 0 ? <EmptyState message="No plans yet." /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(plans || []).map((plan) => (
              <div key={plan._id} className="group relative bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl p-5 hover:border-primary-300 dark:hover:border-primary-500/50 hover:bg-primary-50/50 dark:hover:bg-primary-500/5 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-zinc-100">{plan.name}</h3>
                  <FiChevronRight className="w-4 h-4 text-gray-400 dark:text-zinc-500 group-hover:text-primary-500 transition-colors" />
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-400">
                    <FiTarget className="w-3.5 h-3.5 text-primary-500" />
                    <span>{formatCurrency(plan.minAmount)} - {formatCurrency(plan.maxAmount)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FiTrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{plan.dailyRoiPercent}% daily ROI</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-400">
                    <FiClock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{plan.durationDays} days duration</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-400">
                    <FiLayers className="w-3.5 h-3.5 text-violet-500" />
                    <span>{plan.levelIncomePercents?.join(' / ')}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800/50 rounded-xl p-1 w-fit">
        {['', 'active', 'completed'].map((s) => (
          <button key={s} onClick={() => { setStatus(s); setPage(1); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${status === s ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 shadow-sm' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-300'}`}>{s || 'All'}</button>
        ))}
      </div>

      {/* Investments Table */}
      {loading ? <TableSkeleton rows={5} cols={6} /> : investments?.length === 0 ? <EmptyState message="No investments found" /> : (
        <div className="bg-white dark:bg-zinc-900 dark:border dark:border-zinc-800 dark:shadow-lg dark:shadow-black/20 rounded-2xl overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-zinc-800/50">
                <tr>
                  {['Plan', 'Amount', 'Daily ROI', 'Start', 'End', 'Status'].map((h) => (
                    <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {investments.map((inv) => (
                  <tr key={inv._id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900 dark:text-zinc-100">{inv.plan?.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900 dark:text-zinc-100">{formatCurrency(inv.amount)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">{inv.dailyRoiPercent}%</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-zinc-400">{formatDate(inv.startDate)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-zinc-400">{formatDate(inv.endDate)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${inv.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-600/20 dark:ring-emerald-400/30' : inv.status === 'completed' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 ring-1 ring-blue-600/20 dark:ring-blue-400/30' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 ring-1 ring-red-600/20 dark:ring-red-400/30'}`}>{inv.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-100 dark:border-zinc-800"><Pagination page={page} totalPages={meta?.totalPages || 1} onPageChange={setPage} /></div>
        </div>
      )}
    </div>
  );
};
