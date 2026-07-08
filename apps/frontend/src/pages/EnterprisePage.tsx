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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary" />
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
        <h2 className="text-lg font-semibold text-text-primary">Enterprise</h2>
        <p className="text-sm text-text-secondary mt-1">Group policies, branding, and centralized management</p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
          <button onClick={clearError} className="float-right text-red-400/70 hover:text-red-400">&times;</button>
        </div>
      )}

      <div className="flex gap-1 border-b border-gpu-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-accent-primary text-text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'branding' && (
        <div className="card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">Application Branding</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Application Name</label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gpu-800 border border-gpu-700 text-text-primary text-sm focus:outline-none focus:border-accent-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Primary Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-lg bg-gpu-800 border border-gpu-700 cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-gpu-800 border border-gpu-700 text-text-primary text-sm font-mono focus:outline-none focus:border-accent-primary"
                />
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showBranding}
              onChange={(e) => setShowBranding(e.target.checked)}
              className="rounded border-gpu-600 bg-gpu-800 accent-accent-primary"
            />
            <span className="text-sm text-text-primary">Show branding in UI</span>
          </label>

          {showBranding && (
            <div className="px-3 py-3 rounded-lg bg-gpu-800 text-xs text-text-secondary">
              <p className="mb-1">Preview:</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg" style={{ background: primaryColor }} />
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-primary">Group Policies</h3>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policiesEnabled}
                    onChange={(e) => setPoliciesEnabled(e.target.checked)}
                    className="rounded border-gpu-600 bg-gpu-800 accent-accent-primary"
                  />
                  <span className="text-xs text-text-secondary">Enable policies</span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <select
                value={enforcementLevel}
                onChange={(e) => setEnforcementLevel(e.target.value as any)}
                className="px-2 py-1.5 rounded-lg bg-gpu-800 border border-gpu-700 text-text-primary text-sm"
              >
                <option value="Recommended">Recommended</option>
                <option value="Enforced">Enforced</option>
                <option value="Strict">Strict</option>
              </select>
              <span className="text-xs text-text-secondary">
                {enforcementLevel === 'Recommended' && 'Users can override policy settings'}
                {enforcementLevel === 'Enforced' && 'Policy settings are locked for users'}
                {enforcementLevel === 'Strict' && 'Policies enforced with compliance logging'}
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-medium text-text-secondary uppercase tracking-wider">Create New Policy</h4>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  value={newPolicyName}
                  onChange={(e) => setNewPolicyName(e.target.value)}
                  placeholder="Policy name"
                  className="px-3 py-1.5 rounded-lg bg-gpu-800 border border-gpu-700 text-text-primary text-sm w-48 focus:outline-none focus:border-accent-primary"
                />
                <input
                  type="text"
                  value={newPolicyDesc}
                  onChange={(e) => setNewPolicyDesc(e.target.value)}
                  placeholder="Description"
                  className="px-3 py-1.5 rounded-lg bg-gpu-800 border border-gpu-700 text-text-primary text-sm w-64 focus:outline-none focus:border-accent-primary"
                />
                <select
                  value={newPolicyTarget}
                  onChange={(e) => setNewPolicyTarget(e.target.value as any)}
                  className="px-2 py-1.5 rounded-lg bg-gpu-800 border border-gpu-700 text-text-primary text-sm"
                >
                  <option value="all">All GPUs</option>
                  <option value="vendor">By Vendor</option>
                </select>
                {newPolicyTarget === 'vendor' && (
                  <select
                    value={newPolicyVendor}
                    onChange={(e) => setNewPolicyVendor(e.target.value)}
                    className="px-2 py-1.5 rounded-lg bg-gpu-800 border border-gpu-700 text-text-primary text-sm"
                  >
                    <option value="nvidia">NVIDIA</option>
                    <option value="amd">AMD</option>
                    <option value="intel">Intel</option>
                  </select>
                )}
                <button onClick={handleCreatePolicy} className="btn-primary text-xs px-3 py-1.5">
                  Create
                </button>
              </div>
            </div>
          </div>

          {policies.length === 0 ? (
            <div className="card p-6 text-center">
              <IconShield className="w-10 h-10 mx-auto text-text-muted mb-2" />
              <p className="text-sm text-text-secondary">No group policies defined</p>
            </div>
          ) : (
            <div className="space-y-2">
              {policies.map((p) => (
                <div key={p.id} className="card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => togglePolicy(p.id, !p.enabled)}
                      className={`w-8 h-5 rounded-full transition-colors relative ${
                        p.enabled ? 'bg-accent-primary' : 'bg-gpu-700'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                        p.enabled ? 'translate-x-4' : 'translate-x-0.5'
                      }`} />
                    </button>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary">{p.name}</p>
                      <p className="text-xs text-text-secondary">{p.description}</p>
                      <p className="text-xs text-text-muted mt-0.5">
                        Priority {p.priority} &middot; {formatDate(p.created_at)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deletePolicy(p.id)}
                    className="btn-ghost text-xs p-1.5 text-red-400/60 hover:text-red-400"
                  >
                    <IconX className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'centralized' && (
        <div className="card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">Centralized Management Server</h3>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={centralEnabled}
              onChange={(e) => setCentralEnabled(e.target.checked)}
              className="rounded border-gpu-600 bg-gpu-800 accent-accent-primary"
            />
            <span className="text-sm text-text-primary">Enable centralized management</span>
          </label>

          {centralEnabled && (
            <div className="space-y-3 pl-6 border-l-2 border-accent-primary/30">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Server URL</label>
                <input
                  type="text"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  placeholder="https://mgmt.example.com"
                  className="w-full max-w-md px-3 py-2 rounded-lg bg-gpu-800 border border-gpu-700 text-text-primary text-sm focus:outline-none focus:border-accent-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full max-w-md px-3 py-2 rounded-lg bg-gpu-800 border border-gpu-700 text-text-primary text-sm focus:outline-none focus:border-accent-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Machine Name</label>
                  <input
                    type="text"
                    value={machineName}
                    onChange={(e) => setMachineName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-gpu-800 border border-gpu-700 text-text-primary text-sm focus:outline-none focus:border-accent-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Sync Interval</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={syncInterval}
                      onChange={(e) => setSyncInterval(Number(e.target.value))}
                      min={30}
                      className="w-24 px-3 py-2 rounded-lg bg-gpu-800 border border-gpu-700 text-text-primary text-sm focus:outline-none focus:border-accent-primary"
                    />
                    <span className="text-xs text-text-secondary">seconds</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-text-secondary">Sync Settings</p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={syncPolicies} onChange={(e) => setSyncPolicies(e.target.checked)} className="rounded border-gpu-600 bg-gpu-800 accent-accent-primary" />
                  <span className="text-sm text-text-primary">Sync group policies</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={syncProfiles} onChange={(e) => setSyncProfiles(e.target.checked)} className="rounded border-gpu-600 bg-gpu-800 accent-accent-primary" />
                  <span className="text-sm text-text-primary">Sync GPU profiles</span>
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary text-sm px-6 py-2">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
