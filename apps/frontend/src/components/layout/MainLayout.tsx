import { TitleBar } from '../armoury/TitleBar';
import { ArmourySidebar } from '../armoury/ArmourySidebar';
import { ArmouryHeader } from '../armoury/ArmouryHeader';

/* ================================================================
   MainLayout — Armoury Crate shell.

   Structure (top→bottom):
     TitleBar        (custom frameless, 32px)
     ┣ ArmourySidebar (48px icon rail, left)
     ┗ Main area
       ┣ ArmouryHeader (Dashboard title + system specs)
       ┗ Page content  (flex-1, scrolls if needed)
   ================================================================ */

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div
      className="ac-app"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
      }}
    >
      <TitleBar />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <ArmourySidebar />

        <div className="ac-main">
          <ArmouryHeader />
          {children}
        </div>
      </div>
    </div>
  );
}
