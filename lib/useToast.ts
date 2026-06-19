import { useState } from 'react';

export function useToast() {
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  const showToast = (msg: string, type: string = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  return { toast, showToast };
}
