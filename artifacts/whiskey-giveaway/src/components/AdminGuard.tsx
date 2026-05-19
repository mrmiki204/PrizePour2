import { useEffect, useState } from 'react';
import { AdminLogin } from '@/pages/AdminLogin';
import { Loader2 } from 'lucide-react';

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
      const res = await fetch('/api/admin/me', { credentials: 'include' });
      setStatus(res.ok ? 'authed' : 'unauthed');
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
