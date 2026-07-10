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
  { id: 'marketplace' as const, label: 'Marketplace', icon: navIcons.marketplace },
  { id: 'ai' as const, label: 'AI Insights', icon: navIcons.ai },
  { id: 'settings' as const, label: 'Settings', icon: navIcons.settings },
];

export function Sidebar() {
  const { currentPage, sidebarOpen, navigateTo, toggleSidebar } = useUiStore();

  return (
    <aside
      className={`border-gpu-700 bg-gpu-900/90 flex flex-shrink-0 flex-col border-r backdrop-blur-sm transition-all duration-200 ${
        sidebarOpen ? 'w-56' : 'w-14'
      }`}
    >
      <div className="border-gpu-700 flex h-14 flex-shrink-0 items-center gap-2.5 border-b px-3">
        <div className="from-accent shadow-glow flex size-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br to-red-600">
          <span className="text-sm font-bold text-white">A</span>
        </div>
        {sidebarOpen && (
          <span className="text-text-primary text-sm font-bold tracking-wider">
            AFTERBURNER
          </span>
        )}
      </div>

      <nav className="mt-1 flex flex-1 flex-col gap-0.5 p-1.5">
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
                <span className="bg-accent ml-auto h-4 w-1 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-gpu-700 border-t p-1.5">
        <button
          onClick={toggleSidebar}
          className="text-text-muted hover:bg-gpu-700 hover:text-text-secondary flex w-full items-center justify-center rounded-lg p-2 transition-colors duration-150"
          title={sidebarOpen ? 'Collapse' : 'Expand'}
        >
          {sidebarOpen ? <IconChevronLeft size={16} /> : <IconChevronRight size={16} />}
        </button>
      </div>
    </aside>
  );
}
