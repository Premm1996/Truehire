'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EmployeeDashboardPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  useEffect(() => {
    // Redirect to profile page for this employee only if not already on profile page
    if (window.location.pathname !== `/employee-dashboard/${params.id}/profile`) {
      router.push(`/employee-dashboard/${params.id}/profile`);
    }
  }, [router, params.id]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-white">Redirecting...</div>
    </div>
  );
}
