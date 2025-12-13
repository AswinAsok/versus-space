import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { pollService } from '../../services/pollService';
import { Trash2, ExternalLink, BarChart3 } from 'lucide-react';
import type { Poll } from '../../types';

interface DashboardProps {
  user: User;
  onNavigate: (path: string) => void;
}

export function Dashboard({ user, onNavigate }: DashboardProps) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPolls();
  }, [user.id]);

  const loadPolls = async () => {
    try {
      const data = await pollService.getUserPolls(user.id);
      setPolls(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load polls');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pollId: string) => {
    if (!confirm('Are you sure you want to delete this poll?')) return;

    try {
      await pollService.deletePoll(pollId);
      setPolls(polls.filter((p) => p.id !== pollId));
    } catch (err) {
      alert('Failed to delete poll');
    }
  };

  const toggleStatus = async (pollId: string, isActive: boolean) => {
    try {
      await pollService.updatePollStatus(pollId, !isActive);
      setPolls(
        polls.map((p) => (p.id === pollId ? { ...p, is_active: !isActive } : p))
      );
    } catch (err) {
      alert('Failed to update poll status');
    }
  };

  if (loading) {
    return <div className="loading">Loading your polls...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Your Polls</h1>
        <button onClick={() => onNavigate('/create')} className="btn-primary">
          Create New Poll
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {polls.length === 0 ? (
        <div className="empty-state">
          <BarChart3 size={64} />
          <h2>No polls yet</h2>
          <p>Create your first poll to get started</p>
          <button onClick={() => onNavigate('/create')} className="btn-primary">
            Create Poll
          </button>
        </div>
      ) : (
        <div className="polls-grid">
          {polls.map((poll) => (
            <div key={poll.id} className="poll-card">
              <div className="poll-card-header">
                <h3>{poll.title}</h3>
                <span className={`status-badge ${poll.is_active ? 'active' : 'inactive'}`}>
                  {poll.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="poll-card-meta">
                <span>Created {new Date(poll.created_at).toLocaleDateString()}</span>
              </div>

              <div className="poll-card-actions">
                <button
                  onClick={() => onNavigate(`/poll/${poll.id}`)}
                  className="btn-secondary"
                  title="View poll"
                >
                  <ExternalLink size={16} />
                  View
                </button>

                <button
                  onClick={() => toggleStatus(poll.id, poll.is_active)}
                  className="btn-secondary"
                >
                  {poll.is_active ? 'Deactivate' : 'Activate'}
                </button>

                <button
                  onClick={() => handleDelete(poll.id)}
                  className="btn-danger"
                  title="Delete poll"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
