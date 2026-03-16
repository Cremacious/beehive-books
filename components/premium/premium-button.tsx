'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Settings } from 'lucide-react';

export function UpgradeButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      if (!res.ok) return;
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      // network error
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleUpgrade}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Sparkles className="w-4 h-4" />
      )}
      {loading ? 'Redirecting…' : 'Upgrade to Premium'}
    </button>
  );
}

export function ManageSubscriptionButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);

  async function handlePortal() {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      if (!res.ok) return;
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      // network error
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handlePortal}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Settings className="w-4 h-4" />
      )}
      {loading ? 'Loading…' : 'Manage Subscription'}
    </button>
  );
}
