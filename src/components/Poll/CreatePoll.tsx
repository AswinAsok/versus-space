import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { pollService } from '../../services/pollService';
import { X, Plus, Globe, Lock, Key, Sparkles, ListPlus, Info } from 'lucide-react';
import type { CreatePollData } from '../../types';
import styles from './CreatePoll.module.css';
import sharedStyles from '../../styles/Shared.module.css';

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
  const [isPublic, setIsPublic] = useState(true);
  const [accessKey, setAccessKey] = useState('');
  const [options, setOptions] = useState<OptionInput[]>([
    { id: '1', title: '', image_url: '' },
    { id: '2', title: '', image_url: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addOption = () => {
    setOptions([...options, { id: Date.now().toString(), title: '', image_url: '' }]);
  };

  const removeOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter((opt) => opt.id !== id));
    }
  };

  const updateOption = (id: string, field: 'title' | 'image_url', value: string) => {
    setOptions(options.map((opt) => (opt.id === id ? { ...opt, [field]: value } : opt)));
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

    if (!isPublic && !accessKey.trim()) {
      setError('Private polls require an access key');
      return;
    }

    setLoading(true);

    try {
      const pollData: CreatePollData = {
        title,
        is_public: isPublic,
        access_key: isPublic ? undefined : accessKey,
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
    <div className={styles.createPollContainer}>
      <div className={styles.pageHeader}>
        <span className={styles.pageBadge}>
          <Sparkles size={14} />
          New Poll
        </span>
        <h1 className={styles.pageTitle}>Create a New Poll</h1>
        <p className={styles.pageSubtitle}>
          Set up your question and options to start collecting votes
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.createPollForm}>
        {error && <div className={sharedStyles.errorMessage}>{error}</div>}

        <div className={sharedStyles.formGroup}>
          <label htmlFor="title">Poll Question</label>
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

        <div className={styles.optionsSection}>
          <h3 className={styles.sectionTitle}>
            <ListPlus size={20} />
            Answer Options
          </h3>
          {options.map((option, index) => (
            <div
              key={option.id}
              className={styles.optionInput}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className={styles.optionHeader}>
                <span className={styles.optionNumber}>
                  <span className={styles.optionBadge}>{index + 1}</span>
                  Option
                </span>
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(option.id)}
                    className={sharedStyles.btnIconSmall}
                    disabled={loading}
                    aria-label="Remove option"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className={sharedStyles.formGroup}>
                <input
                  type="text"
                  value={option.title}
                  onChange={(e) => updateOption(option.id, 'title', e.target.value)}
                  placeholder="Enter option title"
                  required
                  disabled={loading}
                  maxLength={50}
                />
              </div>

              <div className={sharedStyles.formGroup}>
                <input
                  type="url"
                  value={option.image_url}
                  onChange={(e) => updateOption(option.id, 'image_url', e.target.value)}
                  placeholder="Image URL (optional)"
                  disabled={loading}
                />
              </div>

              {option.image_url && (
                <div className={styles.imagePreview}>
                  <img src={option.image_url} alt={option.title} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.visibilitySection}>
          <label className={styles.visibilityLabel}>Poll Visibility</label>
          <div className={styles.visibilityToggle}>
            <button
              type="button"
              className={`${styles.visibilityOption} ${isPublic ? styles.visibilityActive : ''}`}
              onClick={() => setIsPublic(true)}
              disabled={loading}
            >
              <div className={styles.visibilityIcon}>
                <Globe size={24} />
              </div>
              <span>Public</span>
            </button>
            <button
              type="button"
              className={`${styles.visibilityOption} ${!isPublic ? styles.visibilityActive : ''}`}
              onClick={() => setIsPublic(false)}
              disabled={loading}
            >
              <div className={styles.visibilityIcon}>
                <Lock size={24} />
              </div>
              <span>Private</span>
            </button>
          </div>
          <div className={styles.visibilityHint}>
            <Info size={16} />
            {isPublic
              ? 'Public polls appear on the leaderboard and anyone can vote.'
              : 'Private polls require an access key to vote.'}
          </div>
        </div>

        {!isPublic && (
          <div className={sharedStyles.formGroup} style={{ marginTop: '1rem' }}>
            <label htmlFor="accessKey">
              <Key
                size={16}
                style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }}
              />
              Access Key
            </label>
            <input
              id="accessKey"
              type="text"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              placeholder="Enter a secret key for participants"
              disabled={loading}
              maxLength={50}
            />
          </div>
        )}

        <div className={styles.formActions}>
          {options.length < 6 && (
            <button
              type="button"
              onClick={addOption}
              className={sharedStyles.btnSecondary}
              disabled={loading}
            >
              <Plus size={18} />
              Add Option
            </button>
          )}
          <button
            type="submit"
            className={`${sharedStyles.btnPrimary} ${sharedStyles.btnLarge}`}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Poll'}
          </button>
        </div>
      </form>
    </div>
  );
}
