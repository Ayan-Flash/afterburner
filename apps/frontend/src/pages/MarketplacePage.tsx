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
  return '★'.repeat(full) + '☆'.repeat(5 - full);
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
    <div className="space-y-6">
      <div className="section-header">
        <h2 className="text-lg font-semibold text-text-primary">Profile Marketplace</h2>
        <p className="text-sm text-text-secondary mt-1">Browse, share, and download community GPU tuning profiles</p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
          <button onClick={clearError} className="float-right text-red-400/70 hover:text-red-400">&times;</button>
        </div>
      )}

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <IconStore className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Browse Profiles</h3>
              <p className="text-xs text-text-secondary">{profiles.length} profile{profiles.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setShowImport(!showImport)} className="btn-ghost p-1.5" title="Import profile">
              <IconUpload className="w-4 h-4" />
            </button>
            <button onClick={fetchProfiles} className="btn-ghost p-1.5" title="Refresh">
              <IconRefresh className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-gpu-800 border border-gpu-700 text-text-primary text-sm"
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
            className="flex-1 px-3 py-1.5 rounded-lg bg-gpu-800 border border-gpu-700 text-text-primary text-sm focus:outline-none focus:border-accent-primary"
          />
        </div>

        {showImport && (
          <div className="mb-4 space-y-2">
            <textarea
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder="Paste profile JSON here..."
              rows={4}
              className="w-full px-3 py-2 rounded-lg bg-gpu-800 border border-gpu-700 text-text-primary text-sm focus:outline-none focus:border-accent-primary font-mono"
            />
            <div className="flex gap-2">
              <button onClick={handleImport} className="btn-primary text-xs px-4 py-1.5">Import</button>
              <button onClick={() => setShowImport(false)} className="btn-ghost text-xs px-4 py-1.5">Cancel</button>
            </div>
          </div>
        )}

        {profiles.length === 0 ? (
          <p className="text-xs text-text-muted text-center py-6">No profiles found. Import one or check back later.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {profiles.map((p) => (
              <div
                key={p.id}
                className={`px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                  selected?.id === p.id
                    ? 'bg-accent-primary/10 border-accent-primary/40'
                    : 'bg-gpu-800 border-gpu-700 hover:border-gpu-600'
                }`}
                onClick={() => selectProfile(p.id)}
              >
                <div className="flex items-start justify-between mb-1">
                  <h4 className="text-sm font-semibold text-text-primary">{p.name}</h4>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteProfile(p.id); }}
                    className="btn-ghost p-0.5 text-text-muted hover:text-red-400"
                  >
                    <IconTrash2 className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs text-text-secondary mb-1 line-clamp-2">{p.description}</p>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <span className="text-yellow-400">{stars(p.rating_avg)}</span>
                  <span>({formatCount(p.rating_count)})</span>
                  <span>&middot;</span>
                  <span>{formatCount(p.download_count)} dl</span>
                </div>
                <div className="flex items-center gap-1 mt-1 flex-wrap">
                  <span className="text-xs px-1.5 py-0.5 rounded bg-gpu-700 text-text-muted">{p.gpu_model}</span>
                  {p.tags.slice(0, 2).map((t) => (
                    <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-gpu-700 text-text-muted">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="card p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">{selected.name}</h3>
              <p className="text-xs text-text-secondary">by {selected.author} &middot; {formatDate(selected.created_at)}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={handleExport} className="btn-ghost p-1.5" title="Export profile">
                <IconDownload className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-sm text-text-secondary mb-3">{selected.description}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="px-3 py-2 rounded-lg bg-gpu-800">
              <p className="text-xs text-text-secondary">GPU Model</p>
              <p className="text-sm text-text-primary">{selected.gpu_model}</p>
            </div>
            <div className="px-3 py-2 rounded-lg bg-gpu-800">
              <p className="text-xs text-text-secondary">Vendor</p>
              <p className="text-sm text-text-primary">{selected.gpu_vendor}</p>
            </div>
            <div className="px-3 py-2 rounded-lg bg-gpu-800">
              <p className="text-xs text-text-secondary">Driver</p>
              <p className="text-sm text-text-primary">{selected.driver_version}</p>
            </div>
            <div className="px-3 py-2 rounded-lg bg-gpu-800">
              <p className="text-xs text-text-secondary">Downloads</p>
              <p className="text-sm text-text-primary">{formatCount(selected.download_count)}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mb-4">
            {selected.tags.map((t) => (
              <span key={t} className="text-xs px-2 py-0.5 rounded bg-accent-primary/10 text-accent-primary">{t}</span>
            ))}
          </div>

          <div className="border-t border-gpu-700 pt-4 mt-4">
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Rate this profile</h4>
            <div className="flex items-center gap-3">
              <select
                value={ratingScore}
                onChange={(e) => setRatingScore(Number(e.target.value))}
                className="px-2 py-1 rounded bg-gpu-800 border border-gpu-700 text-text-primary text-sm"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>{'★'.repeat(n)}{'☆'.repeat(5 - n)}</option>
                ))}
              </select>
              <input
                type="text"
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="Optional comment..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-gpu-800 border border-gpu-700 text-text-primary text-sm focus:outline-none focus:border-accent-primary"
              />
              <button onClick={handleRate} className="btn-primary text-xs px-3 py-1.5">Rate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
