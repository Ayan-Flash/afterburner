import { useEffect, useState } from 'react';
import { useMarketplaceStore } from '../stores/marketplaceStore';
import { IconStore, IconRefresh, IconTrash2, IconDownload, IconUpload } from '../components/base/Icons';

function formatDate(ts: number) {
  return new Date(ts * 1000).toLocaleString();
}

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function stars(rating: number) {
  const full = Math.round(rating);
  return '\u2605'.repeat(full) + '\u2606'.repeat(5 - full);
}

export function MarketplacePage() {
  const { profiles, selected, filter, search, error, fetchProfiles, setFilter, setSearch, selectProfile, deleteProfile, rateProfile, importProfile, exportProfile, clearError } = useMarketplaceStore();

  const [importJson, setImportJson] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleImport = () => {
    if (importJson.trim()) {
      importProfile(importJson.trim());
      setImportJson('');
      setShowImport(false);
    }
  };

  const handleExport = async () => {
    if (!selected) return;
    const json = await exportProfile(selected.id);
    if (json) {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selected.name.replace(/\s+/g, '_')}.gpuprofile`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleRate = () => {
    if (!selected) return;
    rateProfile(selected.id, ratingScore, ratingComment, 'local-user');
    setRatingComment('');
  };

  return (
    <div className="ac-page">
      <div className="ac-page-header">
        <div className="ac-page-header__left">
          <div className="ac-page-header__title">Profile Marketplace</div>
          <div className="ac-page-header__desc">Browse, share, and download community GPU tuning profiles</div>
        </div>
      </div>

      {error && (
        <div className="ac-banner ac-banner--error">
          {error}
          <button onClick={clearError} className="ac-banner__close">&times;</button>
        </div>
      )}

      <div className="ac-page-card">
        <div className="ac-page-card__body" style={{display: 'flex', flexDirection: 'column', gap: 16}}>
          <div className="ac-page-header">
            <div className="ac-page-header__left" style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12}}>
              <div style={{display: 'flex', width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: 'rgba(52,211,153,0.2)'}}>
                <IconStore style={{width: 20, height: 20, color: '#34d399'}} />
              </div>
              <div>
                <h3 style={{color: 'var(--ac-text-primary)', fontSize: 13, fontWeight: 600}}>Browse Profiles</h3>
                <p style={{color: 'var(--ac-text-secondary)', fontSize: 12}}>{profiles.length} profile{profiles.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="ac-page-header__right" style={{gap: 4}}>
              <button onClick={() => setShowImport(!showImport)} className="ac-btn ac-btn--ghost ac-btn--icon" title="Import profile">
                <IconUpload style={{width: 16, height: 16}} />
              </button>
              <button onClick={fetchProfiles} className="ac-btn ac-btn--ghost ac-btn--icon" title="Refresh">
                <IconRefresh style={{width: 16, height: 16}} />
              </button>
            </div>
          </div>

          <div style={{display: 'flex', gap: 12}}>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="ac-input ac-input--sm ac-select"
            >
              <option value="all">All</option>
              <option value="mine">My Profiles</option>
              <option value="rated">Top Rated</option>
              <option value="popular">Popular</option>
            </select>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search profiles..."
              className="ac-input ac-input--sm ac-input--wide"
            />
          </div>

          {showImport && (
            <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder="Paste profile JSON here..."
                rows={4}
                className="ac-input ac-input--wide"
                style={{fontFamily: 'var(--ac-font-mono)', resize: 'vertical'}}
              />
              <div style={{display: 'flex', gap: 8}}>
                <button onClick={handleImport} className="ac-btn ac-btn--primary ac-btn--sm">Import</button>
                <button onClick={() => setShowImport(false)} className="ac-btn ac-btn--ghost ac-btn--sm">Cancel</button>
              </div>
            </div>
          )}

          {profiles.length === 0 ? (
            <p style={{color: 'var(--ac-text-muted)', fontSize: 12, padding: 24, textAlign: 'center'}}>No profiles found. Import one or check back later.</p>
          ) : (
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12}}>
              {profiles.map((p) => (
                <div
                  key={p.id}
                  className="ac-page-card"
                  style={{
                    cursor: 'pointer',
                    borderColor: selected?.id === p.id ? 'rgba(0,170,220,0.4)' : undefined,
                    background: selected?.id === p.id ? 'rgba(0,170,220,0.1)' : undefined,
                  }}
                  onClick={() => selectProfile(p.id)}
                >
                  <div className="ac-page-card__body" style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                    <div className="ac-page-header" style={{gap: 0}}>
                      <h4 style={{color: 'var(--ac-text-primary)', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1}}>{p.name}</h4>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteProfile(p.id); }}
                        className="ac-btn ac-btn--ghost ac-btn--icon"
                        style={{color: 'var(--ac-text-muted)', width: 20, height: 20}}
                      >
                        <IconTrash2 style={{width: 12, height: 12}} />
                      </button>
                    </div>
                    <p style={{color: 'var(--ac-text-secondary)', fontSize: 12, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>{p.description}</p>
                    <div style={{display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ac-text-muted)', fontSize: 12}}>
                      <span style={{color: '#fbbf24'}}>{stars(p.rating_avg)}</span>
                      <span>({formatCount(p.rating_count)})</span>
                      <span>&middot;</span>
                      <span>{formatCount(p.download_count)} dl</span>
                    </div>
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4}}>
                      <span style={{background: 'var(--ac-bg-input)', color: 'var(--ac-text-muted)', borderRadius: 3, padding: '1px 6px', fontSize: 12}}>{p.gpu_model}</span>
                      {p.tags.slice(0, 2).map((t) => (
                        <span key={t} style={{background: 'var(--ac-bg-input)', color: 'var(--ac-text-muted)', borderRadius: 3, padding: '1px 6px', fontSize: 12}}>{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selected && (
        <div className="ac-page-card">
          <div className="ac-page-card__body" style={{display: 'flex', flexDirection: 'column', gap: 16}}>
            <div className="ac-page-header">
              <div>
                <h3 style={{color: 'var(--ac-text-primary)', fontSize: 13, fontWeight: 600}}>{selected.name}</h3>
                <p style={{color: 'var(--ac-text-secondary)', fontSize: 12}}>by {selected.author} &middot; {formatDate(selected.created_at)}</p>
              </div>
              <div className="ac-page-header__right" style={{gap: 4}}>
                <button onClick={handleExport} className="ac-btn ac-btn--ghost ac-btn--icon" title="Export profile">
                  <IconDownload style={{width: 16, height: 16}} />
                </button>
              </div>
            </div>

            <p style={{color: 'var(--ac-text-secondary)', fontSize: 13}}>{selected.description}</p>

            <div className="ac-grid-4">
              <div style={{background: 'var(--ac-bg-input)', borderRadius: 8, padding: '8px 12px'}}>
                <p style={{color: 'var(--ac-text-secondary)', fontSize: 12}}>GPU Model</p>
                <p style={{color: 'var(--ac-text-primary)', fontSize: 13}}>{selected.gpu_model}</p>
              </div>
              <div style={{background: 'var(--ac-bg-input)', borderRadius: 8, padding: '8px 12px'}}>
                <p style={{color: 'var(--ac-text-secondary)', fontSize: 12}}>Vendor</p>
                <p style={{color: 'var(--ac-text-primary)', fontSize: 13}}>{selected.gpu_vendor}</p>
              </div>
              <div style={{background: 'var(--ac-bg-input)', borderRadius: 8, padding: '8px 12px'}}>
                <p style={{color: 'var(--ac-text-secondary)', fontSize: 12}}>Driver</p>
                <p style={{color: 'var(--ac-text-primary)', fontSize: 13}}>{selected.driver_version}</p>
              </div>
              <div style={{background: 'var(--ac-bg-input)', borderRadius: 8, padding: '8px 12px'}}>
                <p style={{color: 'var(--ac-text-secondary)', fontSize: 12}}>Downloads</p>
                <p style={{color: 'var(--ac-text-primary)', fontSize: 13}}>{formatCount(selected.download_count)}</p>
              </div>
            </div>

            <div style={{display: 'flex', flexWrap: 'wrap', gap: 4}}>
              {selected.tags.map((t) => (
                <span key={t} className="ac-badge ac-badge--blue" style={{textTransform: 'none', fontSize: 12}}>{t}</span>
              ))}
            </div>

            <div style={{borderTop: '1px solid var(--ac-border-subtle)', paddingTop: 16}}>
              <h4 className="ac-subtitle" style={{marginBottom: 12}}>Rate this profile</h4>
              <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                <select
                  value={ratingScore}
                  onChange={(e) => setRatingScore(Number(e.target.value))}
                  className="ac-input ac-input--sm ac-select"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>{'\u2605'.repeat(n)}{'\u2606'.repeat(5 - n)}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="Optional comment..."
                  className="ac-input ac-input--sm ac-input--wide"
                />
                <button onClick={handleRate} className="ac-btn ac-btn--primary ac-btn--sm">Rate</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
