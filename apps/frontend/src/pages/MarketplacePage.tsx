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
        <h2 className="text-text-primary text-lg font-semibold">Profile Marketplace</h2>
        <p className="text-text-secondary mt-1 text-sm">Browse, share, and download community GPU tuning profiles</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
          <button onClick={clearError} className="float-right text-red-400/70 hover:text-red-400">&times;</button>
        </div>
      )}

      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/20">
              <IconStore className="size-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-text-primary text-sm font-semibold">Browse Profiles</h3>
              <p className="text-text-secondary text-xs">{profiles.length} profile{profiles.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setShowImport(!showImport)} className="btn-ghost p-1.5" title="Import profile">
              <IconUpload className="size-4" />
            </button>
            <button onClick={fetchProfiles} className="btn-ghost p-1.5" title="Refresh">
              <IconRefresh className="size-4" />
            </button>
          </div>
        </div>

        <div className="mb-4 flex gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gpu-800 border-gpu-700 text-text-primary rounded-lg border px-3 py-1.5 text-sm"
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
            className="bg-gpu-800 border-gpu-700 text-text-primary focus:border-accent-primary flex-1 rounded-lg border px-3 py-1.5 text-sm focus:outline-none"
          />
        </div>

        {showImport && (
          <div className="mb-4 space-y-2">
            <textarea
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder="Paste profile JSON here..."
              rows={4}
              className="bg-gpu-800 border-gpu-700 text-text-primary focus:border-accent-primary w-full rounded-lg border px-3 py-2 font-mono text-sm focus:outline-none"
            />
            <div className="flex gap-2">
              <button onClick={handleImport} className="btn-primary px-4 py-1.5 text-xs">Import</button>
              <button onClick={() => setShowImport(false)} className="btn-ghost px-4 py-1.5 text-xs">Cancel</button>
            </div>
          </div>
        )}

        {profiles.length === 0 ? (
          <p className="text-text-muted py-6 text-center text-xs">No profiles found. Import one or check back later.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {profiles.map((p) => (
              <div
                key={p.id}
                className={`cursor-pointer rounded-lg border px-4 py-3 transition-colors ${
                  selected?.id === p.id
                    ? 'bg-accent-primary/10 border-accent-primary/40'
                    : 'bg-gpu-800 border-gpu-700 hover:border-gpu-600'
                }`}
                onClick={() => selectProfile(p.id)}
              >
                <div className="mb-1 flex items-start justify-between">
                  <h4 className="text-text-primary text-sm font-semibold">{p.name}</h4>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteProfile(p.id); }}
                    className="btn-ghost text-text-muted p-0.5 hover:text-red-400"
                  >
                    <IconTrash2 className="size-3" />
                  </button>
                </div>
                <p className="text-text-secondary mb-1 line-clamp-2 text-xs">{p.description}</p>
                <div className="text-text-muted flex items-center gap-2 text-xs">
                  <span className="text-yellow-400">{stars(p.rating_avg)}</span>
                  <span>({formatCount(p.rating_count)})</span>
                  <span>&middot;</span>
                  <span>{formatCount(p.download_count)} dl</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1">
                  <span className="bg-gpu-700 text-text-muted rounded px-1.5 py-0.5 text-xs">{p.gpu_model}</span>
                  {p.tags.slice(0, 2).map((t) => (
                    <span key={t} className="bg-gpu-700 text-text-muted rounded px-1.5 py-0.5 text-xs">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="card p-5">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="text-text-primary text-sm font-semibold">{selected.name}</h3>
              <p className="text-text-secondary text-xs">by {selected.author} &middot; {formatDate(selected.created_at)}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={handleExport} className="btn-ghost p-1.5" title="Export profile">
                <IconDownload className="size-4" />
              </button>
            </div>
          </div>

          <p className="text-text-secondary mb-3 text-sm">{selected.description}</p>

          <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="bg-gpu-800 rounded-lg px-3 py-2">
              <p className="text-text-secondary text-xs">GPU Model</p>
              <p className="text-text-primary text-sm">{selected.gpu_model}</p>
            </div>
            <div className="bg-gpu-800 rounded-lg px-3 py-2">
              <p className="text-text-secondary text-xs">Vendor</p>
              <p className="text-text-primary text-sm">{selected.gpu_vendor}</p>
            </div>
            <div className="bg-gpu-800 rounded-lg px-3 py-2">
              <p className="text-text-secondary text-xs">Driver</p>
              <p className="text-text-primary text-sm">{selected.driver_version}</p>
            </div>
            <div className="bg-gpu-800 rounded-lg px-3 py-2">
              <p className="text-text-secondary text-xs">Downloads</p>
              <p className="text-text-primary text-sm">{formatCount(selected.download_count)}</p>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap gap-1">
            {selected.tags.map((t) => (
              <span key={t} className="bg-accent-primary/10 text-accent-primary rounded px-2 py-0.5 text-xs">{t}</span>
            ))}
          </div>

          <div className="border-gpu-700 mt-4 border-t pt-4">
            <h4 className="text-text-secondary mb-3 text-xs font-semibold uppercase tracking-wider">Rate this profile</h4>
            <div className="flex items-center gap-3">
              <select
                value={ratingScore}
                onChange={(e) => setRatingScore(Number(e.target.value))}
                className="bg-gpu-800 border-gpu-700 text-text-primary rounded border px-2 py-1 text-sm"
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
                className="bg-gpu-800 border-gpu-700 text-text-primary focus:border-accent-primary flex-1 rounded-lg border px-3 py-1.5 text-sm focus:outline-none"
              />
              <button onClick={handleRate} className="btn-primary px-3 py-1.5 text-xs">Rate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
