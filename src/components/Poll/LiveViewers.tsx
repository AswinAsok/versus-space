import { useLiveViewers } from '../../hooks/useLiveViewers';
import styles from './LiveViewers.module.css';

interface LiveViewersProps {
  pollId: string | undefined;
}

export function LiveViewers({ pollId }: LiveViewersProps) {
  const { viewerCount, isConnected } = useLiveViewers({
    pollId,
    enabled: !!pollId,
  });

  if (!pollId || !isConnected || viewerCount === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.liveDot}>
        <span className={styles.dotPulse} />
        <span className={styles.dotCore} />
      </div>
      <span className={styles.count}>{viewerCount}</span>
      <span className={styles.label}>watching</span>
    </div>
  );
}
