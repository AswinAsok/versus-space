import { usePoll } from '../../hooks/usePoll';
import { VotingInterface } from './VotingInterface';
import { Share2 } from 'lucide-react';

interface PollViewProps {
  pollId: string;
}

export function PollView({ pollId }: PollViewProps) {
  const { poll, loading, error } = usePoll(pollId);

  const handleShare = () => {
    const url = window.location.href;
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
    return <div className="loading">Loading poll...</div>;
  }

  if (error || !poll) {
    return <div className="error-container">Poll not found</div>;
  }

  return (
    <div className="poll-view-container">
      <div className="poll-header">
        <h1 className="poll-title">{poll.title}</h1>
        <button onClick={handleShare} className="btn-share" title="Share poll">
          <Share2 size={20} />
        </button>
      </div>

      <VotingInterface pollId={poll.id} options={poll.options} />
    </div>
  );
}
