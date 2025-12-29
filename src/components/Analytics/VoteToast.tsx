import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import styles from './VoteToast.module.css';

interface Toast {
  id: string;
  optionTitle: string;
  pollTitle: string;
  count: number;
  isSimulated: boolean;
}

interface VoteToastProps {
  pollIds: string[];
  pollTitles: Map<string, string>;
}

export function VoteToast({ pollIds, pollTitles }: VoteToastProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const removeToast = useCallback((key: string) => {
    setToasts(prev => prev.filter(t => `${t.optionTitle}-${t.pollTitle}` !== key));
    const timeout = timeoutRefs.current.get(key);
    if (timeout) {
      clearTimeout(timeout);
      timeoutRefs.current.delete(key);
    }
  }, []);

  const addToast = useCallback((optionTitle: string, pollTitle: string, isSimulated: boolean) => {
    const key = `${optionTitle}-${pollTitle}`;

    setToasts(prev => {
      const existing = prev.find(t => `${t.optionTitle}-${t.pollTitle}` === key);

      if (existing) {
        // Increment count for existing toast
        return prev.map(t =>
          `${t.optionTitle}-${t.pollTitle}` === key
            ? { ...t, count: t.count + 1 }
            : t
        );
      } else {
        // Add new toast, keep max 3
        const newToast: Toast = {
          id: crypto.randomUUID(),
          optionTitle,
          pollTitle,
          count: 1,
          isSimulated,
        };
        return [...prev, newToast].slice(-3);
      }
    });

    // Reset timeout for this toast
    const existingTimeout = timeoutRefs.current.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const timeout = setTimeout(() => {
      removeToast(key);
    }, 3000);
    timeoutRefs.current.set(key, timeout);
  }, [removeToast]);

  // Subscribe to real-time votes
  useEffect(() => {
    if (pollIds.length === 0) return;

    const channel = supabase
      .channel('vote-toasts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'votes' },
        async (payload) => {
          const vote = payload.new as any;

          if (!pollIds.includes(vote.poll_id)) return;

          // Get option title
          const { data: optionData } = await supabase
            .from('poll_options')
            .select('title')
            .eq('id', vote.option_id)
            .single();

          addToast(
            optionData?.title || 'Unknown',
            pollTitles.get(vote.poll_id) || 'Unknown',
            vote.is_simulated || false
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      // Clear all timeouts
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      timeoutRefs.current.clear();
    };
  }, [pollIds, pollTitles, addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className={styles.toastContainer}>
      {toasts.map((toast) => (
        <div
          key={`${toast.optionTitle}-${toast.pollTitle}`}
          className={styles.toast}
          onClick={() => removeToast(`${toast.optionTitle}-${toast.pollTitle}`)}
        >
          <div className={styles.toastDot} />
          <div className={styles.toastContent}>
            <span className={styles.toastOption}>
              {toast.optionTitle}
              {toast.count > 1 && <span className={styles.count}>×{toast.count}</span>}
            </span>
            <span className={styles.toastPoll}>{toast.pollTitle}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
