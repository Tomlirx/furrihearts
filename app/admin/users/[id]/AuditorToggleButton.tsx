'use client';

import { useState } from 'react';
import { toggleUserAuditor } from '@/app/actions/admin';

export default function AuditorToggleButton({ userId, isAuditor }: { userId: string; isAuditor: boolean }) {
  const [auditor, setAuditor] = useState(isAuditor);

  const handleToggle = async () => {
    setAuditor(!auditor);
    await toggleUserAuditor(userId, !auditor);
  };

  return (
    <button className={`admin-btn ${auditor ? 'danger' : 'success'}`} onClick={handleToggle}>
      {auditor ? 'Revoke Auditor' : 'Grant Auditor'}
    </button>
  );
}
