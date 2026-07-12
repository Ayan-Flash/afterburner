import { useEffect, useState } from 'react';
import { useGpuStore } from '../../stores';
import { cpuService, type CpuInfo } from '../../services/cpuService';
import { appService } from '../../services/gpuService';

interface SpecGroup {
  lines: string[];
}

export function ArmouryHeader() {
  const gpus = useGpuStore((s) => s.gpus);
  const gpuName = gpus[0]?.name ?? 'GPU';
  const [cpuInfo, setCpuInfo] = useState<CpuInfo | null>(null);
  const [appInfo, setAppInfo] = useState<{ name: string; version: string; platform: string } | null>(null);

  useEffect(() => {
    cpuService.getInfo().then(setCpuInfo).catch(() => {});
    appService.getInfo().then(setAppInfo).catch(() => {});
  }, []);

  const specGroups: SpecGroup[] = [
    { lines: [gpuName, cpuInfo ? `${cpuInfo.model}` : 'CPU'] },
    { lines: appInfo ? [`v${appInfo.version}`, appInfo.platform] : ['Loading...'] },
  ];

  return (
    <header className="ac-header">
      <span className="ac-header__title">Dashboard</span>

      <div className="ac-header__specs">
        {specGroups.map((group, gi) => (
          <div key={gi} className="ac-header__spec-group">
            {group.lines.map((line, li) => (
              <div key={li} className="ac-header__spec-line">
                <span className="ac-header__specs-dot" />
                <span>{line}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="ac-header__right">
        <button className="ac-header__icon-btn" title="Layout view" aria-label="Layout view">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M4 4h7v16H4z" />
            <path d="M14 4h6v7h-6z" />
            <path d="M14 14h6v6h-6z" />
            <text x="6.5" y="15" fontSize="8" fill="currentColor" stroke="none" fontWeight="700">R</text>
          </svg>
        </button>
        <button className="ac-header__icon-btn ac-header__icon-btn--active" title="Grid view" aria-label="Grid view">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="3" y="3" width="8" height="8" rx="1" />
            <rect x="13" y="3" width="8" height="8" rx="1" />
            <rect x="3" y="13" width="8" height="8" rx="1" />
            <rect x="13" y="13" width="8" height="8" rx="1" />
          </svg>
        </button>
      </div>
    </header>
  );
}
