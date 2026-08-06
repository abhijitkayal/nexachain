export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'primary', trend }) => {
  const colorConfig = {
    primary: {
      bg: 'bg-gradient-to-br from-primary-500 to-primary-600',
      light: 'bg-primary-50 dark:bg-primary-500/10',
      text: 'text-primary-600 dark:text-primary-400',
      iconBg: 'bg-primary-100 dark:bg-primary-500/20',
    },
    green: {
      bg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      light: 'bg-emerald-50 dark:bg-emerald-500/10',
      text: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-100 dark:bg-emerald-500/20',
    },
    yellow: {
      bg: 'bg-gradient-to-br from-amber-500 to-amber-600',
      light: 'bg-amber-50 dark:bg-amber-500/10',
      text: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-100 dark:bg-amber-500/20',
    },
    purple: {
      bg: 'bg-gradient-to-br from-violet-500 to-violet-600',
      light: 'bg-violet-50 dark:bg-violet-500/10',
      text: 'text-violet-600 dark:text-violet-400',
      iconBg: 'bg-violet-100 dark:bg-violet-500/20',
    },
  };

  const config = colorConfig[color] || colorConfig.primary;

  return (
    <div className="group relative bg-white dark:bg-zinc-900 dark:border dark:border-zinc-800 dark:shadow-lg dark:shadow-black/20 rounded-2xl p-5 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30 hover:-translate-y-0.5">
      {/* Decorative gradient blob */}
      <div className={`absolute -top-8 -right-8 w-24 h-24 ${config.bg} rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mt-1.5 tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${config.iconBg} transition-transform group-hover:scale-110`}>
          <Icon className={`w-5 h-5 ${config.text}`} />
        </div>
      </div>

      {/* Bottom accent line */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${config.bg} opacity-0 group-hover:opacity-100 transition-opacity`} />
    </div>
  );
};
