import { usePoll } from '../../hooks/usePoll';
import { VotingInterface } from './VotingInterface';
import { Share2 } from 'lucide-react';
import styles from './PollView.module.css';
import sharedStyles from '../../styles/Shared.module.css';

interface PollViewProps {
  pollId: string;
}

// Fetches poll data and renders the voting experience with sharing actions.
export function PollView({ pollId }: PollViewProps) {
  const { poll, loading, error } = usePoll(pollId);

  const handleShare = () => {
    const url = window.location.href;
    // Prefer the native share sheet where available, otherwise fall back to clipboard.
    if (navigator.share) {
      navigator.share({
        title: poll?.title,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return <div className={sharedStyles.loading}>Loading poll...</div>;
  }

  if (error || !poll) {
    return <div className={sharedStyles.errorContainer}>Poll not found</div>;
  }

  return (
    <div className={styles.pollViewContainer}>
      <div className={styles.pollHeader}>
        <h1 className={styles.pollTitle}>{poll.title}</h1>
        <button onClick={handleShare} className={sharedStyles.btnShare} title="Share poll">
          <Share2 size={20} />
        </button>
      </div>

      <VotingInterface pollId={poll.id} options={poll.options} />
    </div>
  );
}
