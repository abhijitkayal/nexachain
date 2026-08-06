import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  FiHome, FiTrendingUp, FiUsers, FiDollarSign, FiLogOut, FiMenu, FiX,
  FiGitBranch, FiChevronLeft, FiChevronRight, FiSun, FiMoon,
} from 'react-icons/fi';
import { useState } from 'react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: FiHome },
  { path: '/investments', label: 'Investments', icon: FiTrendingUp },
  { path: '/referrals', label: 'Referrals', icon: FiUsers },
  { path: '/referral-tree', label: 'Referral Tree', icon: FiGitBranch },
  { path: '/earnings', label: 'Earnings', icon: FiDollarSign },
];

export const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, sidebarCollapsed, toggleSidebar } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarWidth = sidebarCollapsed ? 'w-[72px]' : 'w-64';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 bg-white dark:bg-zinc-900 border-r border-slate-200/80 dark:border-zinc-800 shadow-[1px_0_0_0_rgba(0,0,0,0.02)] transition-all duration-300 ease-out ${sidebarWidth} z-30`}
      >
        {/* Logo + Collapse Toggle */}
        <div className="flex items-center h-16 px-4 border-b border-slate-200/80 dark:border-zinc-800">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white text-sm font-bold shadow-sm">
                IP
              </div>
              <h1 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight truncate">
                InvestPro
              </h1>
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white text-sm font-bold shadow-sm mx-auto">
              IP
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-zinc-500 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-colors ${sidebarCollapsed ? 'hidden' : ''}`}
            aria-label="Toggle sidebar"
          >
            <FiChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="mx-auto mt-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-zinc-500 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Expand sidebar"
          >
            <FiChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Nav Items */}
        <nav className={`flex-1 px-3 py-4 space-y-0.5 ${sidebarCollapsed ? 'mt-1' : ''}`}>
          {!sidebarCollapsed && (
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-600">
              Menu
            </p>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={sidebarCollapsed ? item.label : undefined}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
                } ${sidebarCollapsed ? 'justify-center' : ''}`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary-600" />
                )}
                <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? '' : 'opacity-80 group-hover:opacity-100'}`} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-slate-200/80 dark:border-zinc-800">
          {!sidebarCollapsed ? (
            <>
              <div className="flex items-center gap-3 mb-2 px-2 py-2 rounded-lg">
                <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-500/20 ring-2 ring-white dark:ring-zinc-900 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-primary-700 dark:text-primary-400">
                    {user?.fullName?.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">{user?.fullName}</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-500/10 dark:hover:text-red-400 rounded-lg transition-colors"
              >
                <FiLogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-500/20 ring-2 ring-white dark:ring-zinc-900 flex items-center justify-center"
                title={user?.fullName}
              >
                <span className="text-sm font-semibold text-primary-700 dark:text-primary-400">
                  {user?.fullName?.charAt(0)}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-500/10 dark:hover:text-red-400 rounded-lg transition-colors"
                title="Logout"
              >
                <FiLogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800 h-16 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-600 text-white text-xs font-bold">
              IP
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">InvestPro</h1>
          </div>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <FiSun className="w-5 h-5 text-amber-400" />
          ) : (
            <FiMoon className="w-5 h-5 text-slate-600" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px]" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="w-72 h-full bg-white dark:bg-zinc-900 shadow-xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 h-16 px-5 border-b border-slate-200/80 dark:border-zinc-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white text-sm font-bold">
                IP
              </div>
              <h1 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight">InvestPro</h1>
            </div>
            <nav className="px-3 py-4 space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary-600" />
                    )}
                    <Icon className="w-[18px] h-[18px]" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Header (Desktop) - Floating */}
      <header
        className={`hidden lg:flex items-center justify-end h-16 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-zinc-800 sticky top-0 z-20 transition-all duration-300 ease-out ${
          sidebarCollapsed ? 'ml-[72px]' : 'ml-64'
        }`}
      >
        <div className="flex items-center gap-2 px-6">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <FiSun className="w-[18px] h-[18px] text-amber-400" />
            ) : (
              <FiMoon className="w-[18px] h-[18px] text-slate-500" />
            )}
          </button>
          <div className="w-px h-6 bg-slate-200 dark:bg-zinc-800 mx-1" />
          <div className="flex items-center gap-2.5 pl-1 pr-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-500/20 ring-2 ring-white dark:ring-zinc-900 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary-700 dark:text-primary-400">
                {user?.fullName?.charAt(0)}
              </span>
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-zinc-300">{user?.fullName}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ease-out min-h-screen pt-16 lg:pt-0 ${
          sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'
        }`}
      >
        <div className="p-4 lg:p-6 max-w-[1600px] mx-auto">{children}</div>
      </main>
    </div>
  );
};