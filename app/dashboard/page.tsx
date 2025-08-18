// app/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardIndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/search');
  }, [router]);

  return null;
}
