import { useUiStore } from '../../stores';

/* ================================================================
   ArmourySidebar — 48px icon-only navigation rail.
   Icons map to real app pages.
   ================================================================ */

type PageId = Parameters<ReturnType<typeof useUiStore.getState>['navigateTo']>[0];

interface NavIcon {
  id: PageId;
  label: string;
  path: React.ReactNode;
}

const navItems: NavIcon[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: (
      <>
        <circle cx="12" cy="12" r="9" />
        <line x1="12" y1="8" x2="12" y2="8.01" />
        <path d="M11 12h1v4h1" />
      </>
    ),
  },
  {
    id: 'control',
    label: 'Control',
    path: (
      <>
        <rect x="3" y="4" width="18" height="12" rx="1" />
        <line x1="7" y1="20" x2="17" y2="20" />
        <line x1="12" y1="16" x2="12" y2="20" />
      </>
    ),
  },
  {
    id: 'profiles',
    label: 'Profiles',
    path: (
      <>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
  },
  {
    id: 'alerts',
    label: 'Alerts',
    path: (
      <>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </>
    ),
  },
  {
    id: 'remote',
    label: 'Remote',
    path: (
      <>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
        <circle cx="12" cy="10" r="1" fill="currentColor" />
      </>
    ),
  },
  {
    id: 'overlay',
    label: 'Overlay',
    path: (
      <>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8" />
        <path d="M12 17v4" />
        <path d="M7 8h4v4H7z" />
      </>
    ),
  },
  {
    id: 'sync',
    label: 'Cloud Sync',
    path: (
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    ),
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    path: (
      <>
        <rect x="2" y="6" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </>
    ),
  },
  {
    id: 'automation',
    label: 'Automation',
    path: (
      <>
        <line x1="4" y1="7" x2="4" y2="17" />
        <line x1="12" y1="4" x2="12" y2="14" />
        <line x1="20" y1="9" x2="20" y2="20" />
        <circle cx="4" cy="19" r="2" />
        <circle cx="12" cy="16" r="2" />
        <circle cx="20" cy="7" r="2" />
      </>
    ),
  },
  {
    id: 'integrations',
    label: 'Integrations',
    path: (
      <>
        <path d="M15 7h3a5 5 0 0 1 0 10h-3" />
        <path d="M9 17H6a5 5 0 0 1 0-10h3" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </>
    ),
  },
  {
    id: 'ai',
    label: 'AI Insights',
    path: (
      <>
        <path d="M12 2a7 7 0 0 0-4 12.7V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.3A7 7 0 0 0 12 2z" />
        <line x1="9" y1="22" x2="15" y2="22" />
      </>
    ),
  },
  {
    id: 'reports',
    label: 'Reports',
    path: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </>
    ),
  },
  {
    id: 'enterprise',
    label: 'Enterprise',
    path: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="1" />
        <line x1="8" y1="9" x2="8" y2="9.01" />
        <line x1="12" y1="9" x2="12" y2="9.01" />
        <line x1="16" y1="9" x2="16" y2="9.01" />
        <line x1="8" y1="13" x2="8" y2="13.01" />
        <line x1="12" y1="13" x2="12" y2="13.01" />
        <line x1="16" y1="13" x2="16" y2="13.01" />
      </>
    ),
  },
  {
    id: 'backup',
    label: 'Backup',
    path: (
      <>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </>
    ),
  },
];

function NavButton({ item, active, onClick }: { item: NavIcon; active: boolean; onClick: () => void }) {
  return (
    <button
      className={`ac-sidebar__item ${active ? 'ac-sidebar__item--active' : ''}`}
      onClick={onClick}
      title={item.label}
      aria-label={item.label}
    >
      <svg
        className="ac-sidebar__icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {item.path}
      </svg>
    </button>
  );
}

export function ArmourySidebar() {
  const { currentPage, navigateTo } = useUiStore();

  return (
    <aside className="ac-sidebar">
      {/* Hamburger / menu */}
      <button className="ac-sidebar__item" title="Menu" aria-label="Menu" style={{ marginBottom: 6 }}>
        <svg className="ac-sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </button>

      <nav className="ac-sidebar__nav">
        {navItems.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            active={currentPage === item.id}
            onClick={() => navigateTo(item.id)}
          />
        ))}
      </nav>

      <div className="ac-sidebar__bottom">
        <button className="ac-sidebar__item" title="Notifications" aria-label="Notifications">
          <svg className="ac-sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="ac-sidebar__badge">N</span>
        </button>
        <button
          className={`ac-sidebar__item ${currentPage === 'settings' ? 'ac-sidebar__item--active' : ''}`}
          title="Settings"
          aria-label="Settings"
          onClick={() => navigateTo('settings')}
        >
          <svg className="ac-sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
