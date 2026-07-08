import { useUiStore } from '../../stores';

const navItems = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: '◉' },
  { id: 'control' as const, label: 'Control', icon: '◈' },
  { id: 'profiles' as const, label: 'Profiles', icon: '◇' },
  { id: 'alerts' as const, label: 'Alerts', icon: '▲' },
  { id: 'settings' as const, label: 'Settings', icon: '⚙' },
];

export function Sidebar() {
  const { currentPage, sidebarOpen, navigateTo, toggleSidebar } = useUiStore();

  return (
    <aside
      className={`flex flex-col border-r border-surface-700 bg-surface-800 transition-all duration-200 ${
        sidebarOpen ? 'w-56' : 'w-16'
      }`}
    >
      <div className="flex h-14 items-center border-b border-surface-700 px-4">
        {sidebarOpen && (
          <h1 className="text-sm font-bold tracking-wide text-primary-400">GPUControl</h1>
        )}
        <button
          onClick={toggleSidebar}
          className={`ml-auto rounded-lg p-1.5 text-surface-400 hover:bg-surface-700 hover:text-surface-200 ${
            !sidebarOpen && 'mx-auto'
          }`}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </div>

      <nav className="flex flex-col gap-1 p-2">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-600/20 text-primary-400'
                  : 'text-surface-300 hover:bg-surface-700 hover:text-surface-100'
              }`}
              title={item.label}
            >
              <span className="text-lg">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
