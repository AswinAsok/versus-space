import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { pollService } from '../../services/pollService';
import { X, Plus } from 'lucide-react';
import type { CreatePollData } from '../../types';

interface CreatePollProps {
  user: User;
  onSuccess: (pollId: string) => void;
}

interface OptionInput {
  id: string;
  title: string;
  image_url: string;
}

export function CreatePoll({ user, onSuccess }: CreatePollProps) {
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState<OptionInput[]>([
    { id: '1', title: '', image_url: '' },
    { id: '2', title: '', image_url: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addOption = () => {
    setOptions([
      ...options,
      { id: Date.now().toString(), title: '', image_url: '' },
    ]);
  };

  const removeOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter((opt) => opt.id !== id));
    }
  };

  const updateOption = (id: string, field: 'title' | 'image_url', value: string) => {
    setOptions(
      options.map((opt) => (opt.id === id ? { ...opt, [field]: value } : opt))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (options.length < 2) {
      setError('Please add at least 2 options');
      return;
    }

    if (options.some((opt) => !opt.title.trim())) {
      setError('All options must have a title');
      return;
    }

    setLoading(true);

    try {
      const pollData: CreatePollData = {
        title,
        options: options.map((opt, index) => ({
          title: opt.title,
          image_url: opt.image_url || null,
          position: index,
        })),
      };

      const poll = await pollService.createPoll(pollData, user.id);
      onSuccess(poll.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-poll-container">
      <form onSubmit={handleSubmit} className="create-poll-form">
        <h2>Create New Poll</h2>

        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="title">Poll Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What should people vote on?"
            required
            disabled={loading}
            maxLength={100}
          />
        </div>

        <div className="options-section">
          <h3>Options</h3>
          {options.map((option, index) => (
            <div key={option.id} className="option-input">
              <div className="option-header">
                <span className="option-number">Option {index + 1}</span>
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(option.id)}
                    className="btn-icon-small"
                    disabled={loading}
                    aria-label="Remove option"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="form-group">
                <input
                  type="text"
                  value={option.title}
                  onChange={(e) => updateOption(option.id, 'title', e.target.value)}
                  placeholder="Option title"
                  required
                  disabled={loading}
                  maxLength={50}
                />
              </div>

              <div className="form-group">
                <input
                  type="url"
                  value={option.image_url}
                  onChange={(e) => updateOption(option.id, 'image_url', e.target.value)}
                  placeholder="Image URL (optional)"
                  disabled={loading}
                />
              </div>

              {option.image_url && (
                <div className="image-preview">
                  <img src={option.image_url} alt={option.title} />
                </div>
              )}
            </div>
          ))}

          {options.length < 6 && (
            <button
              type="button"
              onClick={addOption}
              className="btn-secondary"
              disabled={loading}
            >
              <Plus size={18} />
              Add Option
            </button>
          )}
        </div>

        <button type="submit" className="btn-primary btn-large" disabled={loading}>
          {loading ? 'Creating...' : 'Create Poll'}
        </button>
      </form>
    </div>
  );
}
