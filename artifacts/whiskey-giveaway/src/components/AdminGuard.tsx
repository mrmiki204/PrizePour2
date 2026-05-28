import { useEffect, useState } from 'react';
import { AdminLogin } from '@/pages/AdminLogin';
import { Loader2 } from 'lucide-react';
import { clearAdminToken, getAdminToken } from '@/lib/adminToken';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const [status, setStatus] = useState<'loading' | 'authed' | 'unauthed'>('loading');

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const token = getAdminToken();
      const res = await fetch('/api/admin/me', {
        credentials: 'include',
        headers: token ? { 'X-Admin-Token': token } : undefined,
      });
      if (res.ok) {
        setStatus('authed');
      } else {
        clearAdminToken();
        setStatus('unauthed');
      }
    } catch {
      setStatus('unauthed');
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (status === 'unauthed') {
    return <AdminLogin onSuccess={() => setStatus('authed')} />;
  }

  return <>{children}</>;
}
