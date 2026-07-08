import { useUiStore } from '../../stores';
import { navIcons, IconChevronLeft, IconChevronRight } from '../base/Icons';

const navItems = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: navIcons.dashboard },
  { id: 'control' as const, label: 'Control', icon: navIcons.control },
  { id: 'profiles' as const, label: 'Profiles', icon: navIcons.profiles },
  { id: 'alerts' as const, label: 'Alerts', icon: navIcons.alerts },
  { id: 'remote' as const, label: 'Remote', icon: navIcons.remote },
  { id: 'overlay' as const, label: 'Overlay', icon: navIcons.overlay },
  { id: 'automation' as const, label: 'Automation', icon: navIcons.automation },
  { id: 'integrations' as const, label: 'Integrations', icon: navIcons.integrations },
  { id: 'reports' as const, label: 'Reports', icon: navIcons.reports },
  { id: 'enterprise' as const, label: 'Enterprise', icon: navIcons.enterprise },
  { id: 'sync' as const, label: 'Cloud Sync', icon: navIcons.sync },
  { id: 'backup' as const, label: 'Backup', icon: navIcons.backup },
  { id: 'ai' as const, label: 'AI Insights', icon: navIcons.ai },
  { id: 'settings' as const, label: 'Settings', icon: navIcons.settings },
];

export function Sidebar() {
  const { currentPage, sidebarOpen, navigateTo, toggleSidebar } = useUiStore();

  return (
    <aside
      className={`flex flex-col border-r border-gpu-700 bg-gpu-900/90 backdrop-blur-sm transition-all duration-200 flex-shrink-0 ${
        sidebarOpen ? 'w-56' : 'w-14'
      }`}
    >
      <div className="flex h-14 items-center border-b border-gpu-700 px-3 gap-2.5 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-red-600 flex items-center justify-center flex-shrink-0 shadow-glow">
          <span className="text-white font-bold text-sm">A</span>
        </div>
        {sidebarOpen && (
          <span className="text-sm font-bold tracking-wider text-text-primary">
            AFTERBURNER
          </span>
        )}
      </div>

      <nav className="flex flex-col gap-0.5 p-1.5 flex-1 mt-1">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className={`flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-accent-glow text-accent-bright'
                  : 'text-text-muted hover:bg-gpu-700 hover:text-text-secondary'
              }`}
              title={item.label}
            >
              <Icon size={18} className={isActive ? 'text-accent-bright' : ''} />
              {sidebarOpen && <span>{item.label}</span>}
              {isActive && sidebarOpen && (
                <span className="ml-auto w-1 h-4 rounded-full bg-accent" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-gpu-700 p-1.5">
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center w-full rounded-lg p-2 text-text-muted hover:bg-gpu-700 hover:text-text-secondary transition-colors duration-150"
          title={sidebarOpen ? 'Collapse' : 'Expand'}
        >
          {sidebarOpen ? <IconChevronLeft size={16} /> : <IconChevronRight size={16} />}
        </button>
      </div>
    </aside>
  );
}
