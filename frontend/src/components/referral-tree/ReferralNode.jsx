import { useState } from 'react';
import { FiChevronRight, FiChevronDown, FiDollarSign } from 'react-icons/fi';
import { formatDate, formatCurrency } from '../../utils/format';

const statusStyles = {
  active: 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400',
  inactive: 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  blocked: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400',
};

export const ReferralNode = ({ node, depth = 0 }) => {
  const [expanded, setExpanded] = useState(depth < 2);
  const [showEarnings, setShowEarnings] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const totalEarnings = (node.totalRoiEarned || 0) + (node.totalLevelIncome || 0);

  return (
    <div>
      <div
        className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
        style={{ marginLeft: depth * 28 }}
      >
        {/* Expand/Collapse button */}
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded transition-colors flex-shrink-0"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? (
              <FiChevronDown className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
            ) : (
              <FiChevronRight className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
            )}
          </button>
        ) : (
          <div className="w-6 flex-shrink-0" />
        )}

        {/* Node content */}
        <div className="flex-1 flex items-center gap-3 p-2 bg-white dark:bg-zinc-900 dark:border dark:border-zinc-800 dark:shadow-lg dark:shadow-black/20 rounded-lg min-w-0 transition-colors">
          {/* Avatar */}
          <div className="w-9 h-9 bg-primary-100 dark:bg-primary-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-primary-700 dark:text-primary-400">
              {node.fullName?.charAt(0)}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-medium text-gray-900 dark:text-zinc-100 truncate">{node.fullName}</p>
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${statusStyles[node.status] || 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400'}`}>
                {node.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-500 mt-0.5 flex-wrap">
              <span className="font-mono bg-gray-100 dark:bg-zinc-800 px-1 rounded">{node.referralCode}</span>
              <span>Level {node.level}</span>
              <span>{formatDate(node.createdAt)}</span>
            </div>
          </div>

          {/* Earnings toggle */}
          <button
            onClick={() => setShowEarnings(!showEarnings)}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 transition-colors ${
              showEarnings ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700'
            }`}
          >
            <FiDollarSign className="w-3 h-3" />
            {formatCurrency(totalEarnings)}
          </button>

          {/* Children count badge */}
          {hasChildren && (
            <span className="text-xs bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 px-2 py-1 rounded-full font-medium flex-shrink-0">
              {node.children.length}
            </span>
          )}
        </div>
      </div>

      {/* Earnings breakdown (collapsible) */}
      {showEarnings && (
        <div
          className="flex items-center gap-4 ml-12 py-1.5 px-3 text-xs"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500 dark:text-zinc-500">ROI:</span>
            <span className="font-medium text-green-600 dark:text-green-400">{formatCurrency(node.totalRoiEarned || 0)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500 dark:text-zinc-500">Level Income:</span>
            <span className="font-medium text-blue-600 dark:text-blue-400">{formatCurrency(node.totalLevelIncome || 0)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500 dark:text-zinc-500">Wallet:</span>
            <span className="font-medium text-purple-600 dark:text-purple-400">{formatCurrency(node.walletBalance || 0)}</span>
          </div>
        </div>
      )}

      {/* Children */}
      {expanded && hasChildren && (
        <div className="border-l-2 border-gray-100 dark:border-zinc-800 ml-5">
          {node.children.map((child) => (
            <ReferralNode key={child._id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};
