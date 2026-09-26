import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import { 
  Users, 
  FileDown, 
  LogOut, 
  User as UserIcon, 
  LayoutDashboard, 
  UserPlus,
  Menu,
  X,
  Map,
  Database,
  Zap,
  LayoutGrid,
  Activity,
  ChevronLeft
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const adminNavItems: NavItem[] = [
  { path: '/admin', label: 'Network Control', icon: <LayoutGrid size={18} /> },
  { path: '/admin/organisations', label: 'Organization Management', icon: <Map size={18} /> },
  { path: '/admin/reports', label: 'Global Members Registry', icon: <FileDown size={18} /> },
];

const organisationNavItems: NavItem[] = [
  { path: '/organisation', label: 'Command Terminal', icon: <LayoutDashboard size={18} /> },
  { path: '/organisation/volunteers', label: 'Volunteers Management', icon: <Users size={18} /> },
  { path: '/organisation/reports', label: 'Our Members’ Data Registry', icon: <Database size={18} /> },
];

const volunteerNavItems: NavItem[] = [
  { path: '/volunteer', label: 'Volunteers Management', icon: <Zap size={18} /> },
  { path: '/volunteer/new-member', label: 'Enrollment Hub', icon: <UserPlus size={18} /> },
];

const memberUpdatesNavItems: NavItem[] = [
  { path: '/member-updates', label: 'Member Registry Updates', icon: <Activity size={18} /> },
];

const SIDEBAR_STORAGE_KEY = 'ssk_dashboard_sidebar_open';

const DashboardLayout: React.FC<{ children: React.ReactNode; title: string; hideHeader?: boolean; }> = ({ children, title, hideHeader = false }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Remember desktop sidebar state (true = expanded, false = completely 0px hidden)
    const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState<boolean>(() => {
        try {
            const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
            return saved !== null ? JSON.parse(saved) : true; // default expanded on desktop
        } catch {
            return true;
        }
    });

    const toggleDesktopSidebar = () => {
        setIsDesktopSidebarOpen(prev => {
            const next = !prev;
            try {
                localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(next));
            } catch (e) {
                console.error("Storage error:", e);
            }
            return next;
        });
    };

    const handleHeaderToggle = () => {
        if (window.innerWidth < 768) {
            setIsMobileMenuOpen(prev => !prev);
        } else {
            toggleDesktopSidebar();
        }
    };

    // Close mobile menu on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Prevent background body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const getNavItems = () => {
        if (user?.role === Role.MasterAdmin) return adminNavItems;
        if (user?.role === Role.Organisation) return organisationNavItems;
        if (user?.role === Role.Volunteer) return volunteerNavItems;
        if (user?.role === Role.MemberUpdates) return memberUpdatesNavItems;
        return [];
    };

    const getRoleConfig = () => {
        switch (user?.role) {
            case Role.MasterAdmin:
                return { label: 'MASTER ADMIN', shortLabel: 'ADMIN', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' };
            case Role.Organisation:
                return { label: 'ORG LEAD', shortLabel: 'ORG', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
            case Role.Volunteer:
                return { label: 'VOLUNTEER', shortLabel: 'VOL', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' };
            case Role.MemberUpdates:
                return { label: 'UPDATES OPERATOR', shortLabel: 'OPS', color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' };
            default:
                return { label: 'GUEST', shortLabel: 'GUEST', color: 'text-white', bg: 'bg-white/5', border: 'border-white/10' };
        }
    };

    const navItems = getNavItems();
    const { label: roleLabel, shortLabel, color: roleColor, bg: roleBg, border: roleBorder } = getRoleConfig();

    return (
        <div className="min-h-screen bg-black flex flex-col text-white selection:bg-orange-500/40">
            {/* Main Header with Toggle Button */}
            <Header 
                showSidebarToggle={true}
                isSidebarOpen={isDesktopSidebarOpen}
                onToggleSidebar={handleHeaderToggle}
            />

            <div className="flex flex-1 overflow-hidden relative">
                {/* Desktop Sidebar (Two states: 1. Full Expanded w-72; 2. Completely Hidden w-0, no icons, no left space) */}
                <aside 
                    className={`hidden md:flex flex-col bg-[#050505] shadow-2xl relative z-30 transition-all duration-300 ease-in-out shrink-0 select-none overflow-hidden ${
                        isDesktopSidebarOpen 
                            ? 'w-72 border-r border-white/5 opacity-100' 
                            : 'w-0 border-r-0 opacity-0 pointer-events-none'
                    }`}
                    aria-hidden={!isDesktopSidebarOpen}
                >
                    <div className="w-72 flex flex-col h-full flex-1">
                        {/* Sidebar Header with Brand & Collapse Button */}
                        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/5">
                            <div className="flex items-center gap-2.5 overflow-hidden">
                                <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></div>
                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white truncate font-cinzel">
                                    Navigation Panel
                                </span>
                            </div>
                            <button
                                onClick={toggleDesktopSidebar}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-orange-600/20 text-gray-400 hover:text-white transition-all active:scale-95 border border-white/5 text-[9px] font-black uppercase tracking-wider group"
                                title="Collapse Sidebar (Hide Completely)"
                                aria-label="Collapse Sidebar"
                            >
                                <span className="group-hover:text-orange-400">Hide Sidebar</span>
                                <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                            </button>
                        </div>

                        {/* Scrollable Nav Area */}
                        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar flex flex-col justify-between">
                            <div>
                                {/* Role Indicator Badge */}
                                <div className="mb-6 px-1">
                                    <div className={`inline-block px-4 py-1.5 rounded-full border ${roleBg} ${roleColor} ${roleBorder} text-[9px] font-black tracking-[0.25em] shadow-lg shadow-black/40`}>
                                        {roleLabel}
                                    </div>
                                </div>

                                <p className="text-[9px] uppercase tracking-[0.4em] text-gray-500 font-black mb-3 px-2">Menu Sections</p>
                                {/* Nav Items List */}
                                <nav className="space-y-2">
                                    {navItems.map(item => (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            end={item.path === '/admin' || item.path === '/organisation' || item.path === '/volunteer' || item.path === '/member-updates'}
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                                                    isActive
                                                        ? 'bg-orange-600 text-white shadow-[0_10px_25px_-5px_rgba(234,102,12,0.4)] font-bold'
                                                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                                }`
                                            }
                                        >
                                            <span className="shrink-0 flex items-center justify-center text-orange-400">{item.icon}</span>
                                            <span className="text-[11px] uppercase tracking-wider font-black leading-tight truncate">
                                                {item.label}
                                            </span>
                                        </NavLink>
                                    ))}
                                </nav>
                            </div>
                        </div>

                        {/* Desktop Sidebar Bottom Profile & Logout */}
                        <div className="p-4 border-t border-white/5 bg-black/40 space-y-3">
                            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                                <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-orange-500 shadow-inner">
                                    <UserIcon size={18} strokeWidth={1.5} />
                                </div>
                                <div className="overflow-hidden flex-1">
                                    <p className="text-xs font-bold text-white truncate leading-tight">{user?.name || 'Authorized User'}</p>
                                    <p className={`text-[9px] font-black uppercase tracking-wider mt-0.5 truncate opacity-70 ${roleColor}`}>
                                        {user?.organisationName || 'Remote Link'}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2.5 p-3 rounded-xl bg-red-600/10 hover:bg-red-600 hover:text-white text-red-500 transition-all text-[10px] font-black tracking-[0.3em] border border-red-600/20 uppercase active:scale-95"
                            >
                                <LogOut size={15} />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Dynamic Viewport - Automatically Expands to 100% width when sidebar is collapsed */}
                <main className="flex-1 p-3 sm:p-6 md:p-10 lg:p-12 overflow-y-auto bg-[#020202] custom-scrollbar min-w-0 w-full transition-all duration-300">
                    {!hideHeader && (
                        <div className="mb-6 sm:mb-8 md:mb-12 max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 border-b border-white/5 pb-6 sm:pb-8">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 flex-wrap">
                                    {/* Always accessible Sidebar Toggle button */}
                                    <button
                                        onClick={handleHeaderToggle}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-orange-600/20 text-gray-300 hover:text-white border border-white/10 hover:border-orange-500/30 transition-all active:scale-95 group shrink-0"
                                        title={isDesktopSidebarOpen ? "Collapse sidebar (Hide completely)" : "Expand sidebar (Show full menu)"}
                                        aria-label="Toggle Sidebar Navigation"
                                    >
                                        <Menu size={15} className="text-orange-500 group-hover:rotate-180 transition-transform duration-300 shrink-0" />
                                        <span className="text-[10px] font-black uppercase tracking-wider">
                                            {isDesktopSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
                                        </span>
                                    </button>

                                    <div className="h-1.5 w-1.5 rounded-full bg-orange-600 animate-pulse"></div>
                                    <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.4em] font-black text-gray-500">
                                        Secure Environment
                                    </span>
                                </div>
                                <h1 className="font-cinzel text-xl sm:text-3xl md:text-4xl text-white tracking-tight leading-tight uppercase break-words">
                                    {title}
                                </h1>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-2 sm:py-2.5 bg-white/[0.02] rounded-xl sm:rounded-2xl border border-white/10 backdrop-blur-3xl shadow-xl shrink-0 self-start sm:self-auto">
                               <Activity size={14} className="text-green-500 animate-pulse" />
                               <div className="flex flex-col">
                                   <span className="text-[7px] font-black uppercase tracking-[0.3em] text-gray-500">Registry Sync</span>
                                   <span className="text-[8px] font-mono text-green-500/90 uppercase font-semibold">Live Nominal</span>
                               </div>
                            </div>
                        </div>
                    )}

                    <div className="max-w-7xl mx-auto min-w-0 w-full">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Off-Canvas Drawer (Overlay) */}
            {isMobileMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 bg-black/85 z-[110] backdrop-blur-sm transition-opacity duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-hidden="true"
                ></div>
                <div 
                  className="fixed inset-y-0 left-0 w-[85%] max-w-[320px] bg-[#070707] border-r border-white/10 z-[120] flex flex-col shadow-[25px_0_60px_rgba(0,0,0,0.95)] animate-in slide-in-from-left duration-300"
                  role="dialog"
                  aria-modal="true"
                >
                    {/* Drawer Header */}
                    <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/60">
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-cinzel font-bold text-white tracking-tight">
                                SSK <span className="text-orange-500">PEOPLE</span>
                            </span>
                            <span className="text-[8px] px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold uppercase tracking-wider">
                                {shortLabel}
                            </span>
                        </div>
                        <button 
                            onClick={() => setIsMobileMenuOpen(false)} 
                            className="flex items-center gap-1.5 px-3 py-1.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors active:scale-95 text-[9px] font-black uppercase tracking-wider border border-white/10"
                            aria-label="Close menu"
                        >
                            <span>Hide Sidebar</span>
                            <X size={15} className="text-orange-500" />
                        </button>
                    </div>

                    {/* Drawer Menu Items */}
                    <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                        <p className="text-[9px] uppercase tracking-[0.3em] text-gray-500 font-black mb-3 px-2">Navigation</p>
                        <nav className="space-y-1.5">
                            {navItems.map(item => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all ${
                                        isActive 
                                            ? 'bg-orange-600 text-white shadow-lg font-bold' 
                                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                        }`
                                    }
                                >
                                    <span className="text-orange-400 shrink-0">{item.icon}</span>
                                    <span className="uppercase tracking-wider text-[11px] font-black">{item.label}</span>
                                </NavLink>
                            ))}
                        </nav>
                    </div>

                    {/* Drawer Footer with User & Sign Out */}
                    <div className="p-4 border-t border-white/10 bg-black/80 space-y-3">
                        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                            <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-orange-500 shrink-0">
                                <UserIcon size={18} />
                            </div>
                            <div className="overflow-hidden flex-1">
                                <p className="text-xs font-bold text-white truncate leading-tight">{user?.name || 'User'}</p>
                                <p className={`text-[8px] font-black uppercase tracking-wider mt-0.5 truncate ${roleColor}`}>{roleLabel}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => {
                                setIsMobileMenuOpen(false);
                                handleLogout();
                            }} 
                            className="w-full flex items-center justify-center gap-2 p-3 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-600/20 rounded-xl font-black uppercase tracking-widest text-[10px] transition-colors active:scale-95"
                        >
                            <LogOut size={14} />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
              </>
            )}
        </div>
    );
};

export default DashboardLayout;