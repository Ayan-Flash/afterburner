import { useEffect, useState } from 'react';
import { useEnterpriseStore } from '../stores/enterpriseStore';
import { IconSettings, IconShield, IconGlobe, IconX } from '../components/base/Icons';

function formatDate(ts: number) {
  return new Date(ts * 1000).toLocaleString();
}

export function EnterprisePage() {
  const { config, policies, loading, error, fetchConfig, saveConfig, fetchPolicies, createPolicy, deletePolicy, togglePolicy, clearError } = useEnterpriseStore();

  const [appName, setAppName] = useState('GPUControl Pro');
  const [primaryColor, setPrimaryColor] = useState('#f04747');
  const [showBranding, setShowBranding] = useState(true);
  const [policiesEnabled, setPoliciesEnabled] = useState(true);
  const [enforcementLevel, setEnforcementLevel] = useState<'Recommended' | 'Enforced' | 'Strict'>('Recommended');
  const [centralEnabled, setCentralEnabled] = useState(false);
  const [serverUrl, setServerUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [syncInterval, setSyncInterval] = useState(300);
  const [machineName, setMachineName] = useState('');
  const [syncPolicies, setSyncPolicies] = useState(true);
  const [syncProfiles, setSyncProfiles] = useState(true);

  const [newPolicyName, setNewPolicyName] = useState('');
  const [newPolicyDesc, setNewPolicyDesc] = useState('');
  const [newPolicyTarget, setNewPolicyTarget] = useState<'all' | 'vendor'>('all');
  const [newPolicyVendor, setNewPolicyVendor] = useState('nvidia');

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'branding' | 'policies' | 'centralized'>('branding');

  useEffect(() => {
    fetchConfig();
    fetchPolicies();
  }, [fetchConfig, fetchPolicies]);

  useEffect(() => {
    if (config) {
      setAppName(config.branding.app_name);
      setPrimaryColor(config.branding.primary_color);
      setShowBranding(config.branding.show_branding);
      setPoliciesEnabled(config.policies_enabled);
      setEnforcementLevel(config.enforcement_level);
      setCentralEnabled(config.centralized.enabled);
      setServerUrl(config.centralized.server_url);
      setApiKey(config.centralized.api_key);
      setSyncInterval(config.centralized.sync_interval_secs);
      setMachineName(config.centralized.machine_name);
      setSyncPolicies(config.centralized.sync_policies);
      setSyncProfiles(config.centralized.sync_profiles);
    }
  }, [config]);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    await saveConfig({
      branding: {
        ...config.branding,
        app_name: appName,
        primary_color: primaryColor,
        show_branding: showBranding,
      },
      centralized: {
        ...config.centralized,
        enabled: centralEnabled,
        server_url: serverUrl,
        api_key: apiKey,
        sync_interval_secs: syncInterval,
        machine_name: machineName,
        sync_policies: syncPolicies,
        sync_profiles: syncProfiles,
      },
      policies_enabled: policiesEnabled,
      enforcement_level: enforcementLevel,
    });
    setSaving(false);
  };

  const handleCreatePolicy = async () => {
    if (!newPolicyName.trim()) return;
    const target = newPolicyTarget === 'all'
      ? { AllGpus: {} }
      : { ByVendor: newPolicyVendor };
    await createPolicy(newPolicyName, newPolicyDesc, target);
    setNewPolicyName('');
    setNewPolicyDesc('');
  };

  if (loading && !config) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="border-accent-primary size-8 animate-spin rounded-full border-b-2" />
      </div>
    );
  }

  const tabs = [
    { id: 'branding' as const, label: 'Branding', icon: IconSettings },
    { id: 'policies' as const, label: 'Group Policies', icon: IconShield },
    { id: 'centralized' as const, label: 'Centralized Management', icon: IconGlobe },
  ];

  return (
    <div className="space-y-6">
      <div className="section-header">
        <h2 className="text-text-primary text-lg font-semibold">Enterprise</h2>
        <p className="text-text-secondary mt-1 text-sm">Group policies, branding, and centralized management</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
          <button onClick={clearError} className="float-right text-red-400/70 hover:text-red-400">&times;</button>
        </div>
      )}

      <div className="border-gpu-800 flex gap-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-accent-primary text-text-primary'
                : 'text-text-secondary hover:text-text-primary border-transparent'
            }`}
          >
            <tab.icon className="size-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'branding' && (
        <div className="card space-y-4 p-5">
          <h3 className="text-text-primary text-sm font-semibold">Application Branding</h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-text-secondary mb-1 block text-xs font-medium">Application Name</label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="bg-gpu-800 border-gpu-700 text-text-primary focus:border-accent-primary w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="text-text-secondary mb-1 block text-xs font-medium">Primary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="bg-gpu-800 border-gpu-700 size-10 cursor-pointer rounded-lg border"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="bg-gpu-800 border-gpu-700 text-text-primary focus:border-accent-primary flex-1 rounded-lg border px-3 py-2 font-mono text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={showBranding}
              onChange={(e) => setShowBranding(e.target.checked)}
              className="border-gpu-600 bg-gpu-800 accent-accent-primary rounded"
            />
            <span className="text-text-primary text-sm">Show branding in UI</span>
          </label>

          {showBranding && (
            <div className="bg-gpu-800 text-text-secondary rounded-lg p-3 text-xs">
              <p className="mb-1">Preview:</p>
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg" style={{ background: primaryColor }} />
                <span className="text-sm font-semibold" style={{ color: primaryColor }}>{appName}</span>
                <span className="text-text-muted">Enterprise Edition</span>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'policies' && (
        <div className="space-y-4">
          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-text-primary text-sm font-semibold">Group Policies</h3>
              <div className="flex items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={policiesEnabled}
                    onChange={(e) => setPoliciesEnabled(e.target.checked)}
                    className="border-gpu-600 bg-gpu-800 accent-accent-primary rounded"
                  />
                  <span className="text-text-secondary text-xs">Enable policies</span>
                </label>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-2">
              <select
                value={enforcementLevel}
                onChange={(e) => setEnforcementLevel(e.target.value as 'Recommended' | 'Enforced' | 'Strict')}
                className="bg-gpu-800 border-gpu-700 text-text-primary rounded-lg border px-2 py-1.5 text-sm"
              >
                <option value="Recommended">Recommended</option>
                <option value="Enforced">Enforced</option>
                <option value="Strict">Strict</option>
              </select>
              <span className="text-text-secondary text-xs">
                {enforcementLevel === 'Recommended' && 'Users can override policy settings'}
                {enforcementLevel === 'Enforced' && 'Policy settings are locked for users'}
                {enforcementLevel === 'Strict' && 'Policies enforced with compliance logging'}
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="text-text-secondary text-xs font-medium uppercase tracking-wider">Create New Policy</h4>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  value={newPolicyName}
                  onChange={(e) => setNewPolicyName(e.target.value)}
                  placeholder="Policy name"
                  className="bg-gpu-800 border-gpu-700 text-text-primary focus:border-accent-primary w-48 rounded-lg border px-3 py-1.5 text-sm focus:outline-none"
                />
                <input
                  type="text"
                  value={newPolicyDesc}
                  onChange={(e) => setNewPolicyDesc(e.target.value)}
                  placeholder="Description"
                  className="bg-gpu-800 border-gpu-700 text-text-primary focus:border-accent-primary w-64 rounded-lg border px-3 py-1.5 text-sm focus:outline-none"
                />
                <select
                  value={newPolicyTarget}
                  onChange={(e) => setNewPolicyTarget(e.target.value as 'all' | 'vendor')}
                  className="bg-gpu-800 border-gpu-700 text-text-primary rounded-lg border px-2 py-1.5 text-sm"
                >
                  <option value="all">All GPUs</option>
                  <option value="vendor">By Vendor</option>
                </select>
                {newPolicyTarget === 'vendor' && (
                  <select
                    value={newPolicyVendor}
                    onChange={(e) => setNewPolicyVendor(e.target.value)}
                    className="bg-gpu-800 border-gpu-700 text-text-primary rounded-lg border px-2 py-1.5 text-sm"
                  >
                    <option value="nvidia">NVIDIA</option>
                    <option value="amd">AMD</option>
                    <option value="intel">Intel</option>
                  </select>
                )}
                <button onClick={handleCreatePolicy} className="btn-primary px-3 py-1.5 text-xs">
                  Create
                </button>
              </div>
            </div>
          </div>

          {policies.length === 0 ? (
            <div className="card p-6 text-center">
              <IconShield className="text-text-muted mx-auto mb-2 size-10" />
              <p className="text-text-secondary text-sm">No group policies defined</p>
            </div>
          ) : (
            <div className="space-y-2">
              {policies.map((p) => (
                <div key={p.id} className="card flex items-center justify-between p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <button
                      onClick={() => togglePolicy(p.id, !p.enabled)}
                      className={`relative h-5 w-8 rounded-full transition-colors ${
                        p.enabled ? 'bg-accent-primary' : 'bg-gpu-700'
                      }`}
                    >
                      <div className={`absolute top-0.5 size-3.5 rounded-full bg-white transition-transform ${
                        p.enabled ? 'translate-x-4' : 'translate-x-0.5'
                      }`} />
                    </button>
                    <div className="min-w-0">
                      <p className="text-text-primary text-sm font-medium">{p.name}</p>
                      <p className="text-text-secondary text-xs">{p.description}</p>
                      <p className="text-text-muted mt-0.5 text-xs">
                        Priority {p.priority} &middot; {formatDate(p.created_at)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deletePolicy(p.id)}
                    className="btn-ghost p-1.5 text-xs text-red-400/60 hover:text-red-400"
                  >
                    <IconX className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'centralized' && (
        <div className="card space-y-4 p-5">
          <h3 className="text-text-primary text-sm font-semibold">Centralized Management Server</h3>

          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={centralEnabled}
              onChange={(e) => setCentralEnabled(e.target.checked)}
              className="border-gpu-600 bg-gpu-800 accent-accent-primary rounded"
            />
            <span className="text-text-primary text-sm">Enable centralized management</span>
          </label>

          {centralEnabled && (
            <div className="border-accent-primary/30 space-y-3 border-l-2 pl-6">
              <div>
                <label className="text-text-secondary mb-1 block text-xs font-medium">Server URL</label>
                <input
                  type="text"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  placeholder="https://mgmt.example.com"
                  className="bg-gpu-800 border-gpu-700 text-text-primary focus:border-accent-primary w-full max-w-md rounded-lg border px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="text-text-secondary mb-1 block text-xs font-medium">API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-gpu-800 border-gpu-700 text-text-primary focus:border-accent-primary w-full max-w-md rounded-lg border px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-text-secondary mb-1 block text-xs font-medium">Machine Name</label>
                  <input
                    type="text"
                    value={machineName}
                    onChange={(e) => setMachineName(e.target.value)}
                    className="bg-gpu-800 border-gpu-700 text-text-primary focus:border-accent-primary w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-text-secondary mb-1 block text-xs font-medium">Sync Interval</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={syncInterval}
                      onChange={(e) => setSyncInterval(Number(e.target.value))}
                      min={30}
                      className="bg-gpu-800 border-gpu-700 text-text-primary focus:border-accent-primary w-24 rounded-lg border px-3 py-2 text-sm focus:outline-none"
                    />
                    <span className="text-text-secondary text-xs">seconds</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-text-secondary text-xs font-medium">Sync Settings</p>
                <label className="flex cursor-pointer items-center gap-2">
                  <input type="checkbox" checked={syncPolicies} onChange={(e) => setSyncPolicies(e.target.checked)} className="border-gpu-600 bg-gpu-800 accent-accent-primary rounded" />
                  <span className="text-text-primary text-sm">Sync group policies</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input type="checkbox" checked={syncProfiles} onChange={(e) => setSyncProfiles(e.target.checked)} className="border-gpu-600 bg-gpu-800 accent-accent-primary rounded" />
                  <span className="text-text-primary text-sm">Sync GPU profiles</span>
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary px-6 py-2 text-sm">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
