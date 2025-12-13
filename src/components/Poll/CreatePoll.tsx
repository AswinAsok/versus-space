import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { pollService } from '../../services/pollService';
import { X, Plus, Globe, Lock, Key, Code2, Crown } from 'lucide-react';
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
      <div className={styles.createPollInner}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Create a new poll</h1>
          <p className={styles.pageSubtitle}>
            Set up your question and options to start collecting votes
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.createPollForm}>
          {error && <div className={sharedStyles.errorMessage}>{error}</div>}

          {/* Poll Question Card */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Poll Question</h3>
            <p className={styles.cardDescription}>What would you like to ask?</p>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What should people vote on?"
              required
              disabled={loading}
              maxLength={100}
              className={styles.pollQuestionInput}
            />
          </div>

          {/* Answer Options Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>Answer Options</h3>
                <p className={styles.cardDescription}>Add the choices people can vote for</p>
              </div>
              {options.length < 6 && (
                <button type="button" className={styles.addOptionButton} disabled>
                  <Plus size={16} />
                  Add
                  <span className={styles.proBadge}>
                    <Crown size={10} />
                    Pro
                  </span>
                </button>
              )}
            </div>
            <div className={styles.optionsList}>
              {options.map((option, index) => (
                <div
                  key={option.id}
                  className={styles.optionInput}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className={styles.optionHeader}>
                    <span className={styles.optionNumber}>
                      <span className={styles.optionBadge}>{index + 1}</span>
                    </span>
                    <input
                      type="text"
                      value={option.title}
                      onChange={(e) => updateOption(option.id, 'title', e.target.value)}
                      placeholder="Option title"
                      required
                      disabled={loading}
                      maxLength={50}
                      className={styles.optionTitleInput}
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(option.id)}
                        className={styles.removeOptionButton}
                        disabled={loading}
                        aria-label="Remove option"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visibility Card */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Visibility</h3>
            <p className={styles.cardDescription}>Choose who can see and vote on your poll</p>
            <div className={styles.visibilityToggle}>
              <button
                type="button"
                className={`${styles.visibilityOption} ${isPublic ? styles.visibilityActive : ''}`}
                onClick={() => setIsPublic(true)}
                disabled={loading}
              >
                <div className={styles.visibilityIcon}>
                  <Globe size={18} />
                </div>
                <div className={styles.visibilityText}>
                  <span className={styles.visibilityName}>Public</span>
                  <span className={styles.visibilityDesc}>Anyone can vote</span>
                </div>
              </button>
              <button
                type="button"
                className={`${styles.visibilityOption} ${!isPublic ? styles.visibilityActive : ''}`}
                onClick={() => setIsPublic(false)}
                disabled={loading}
              >
                <div className={styles.visibilityIcon}>
                  <Lock size={18} />
                </div>
                <div className={styles.visibilityText}>
                  <span className={styles.visibilityName}>Private</span>
                  <span className={styles.visibilityDesc}>Requires access key</span>
                </div>
              </button>
            </div>

            {!isPublic && (
              <div className={styles.accessKeySection}>
                <label htmlFor="accessKey" className={styles.accessKeyLabel}>
                  <Key size={14} />
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
                  className={styles.accessKeyInput}
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Creating...' : 'Create Poll'}
          </button>
        </form>

        {/* Footer */}
        <footer className={styles.footer}>
          <span>&copy; 2025 versus.space</span>
          <div className={styles.footerRight}>
            <a
              href="https://neal.fun"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerLink}
            >
              inspiration from neal<span className={styles.footerDot}>.</span>fun
            </a>
            <span className={styles.footerDivider}>·</span>
            <a
              href="https://github.com/AswinAsok"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerLink}
            >
              <Code2 size={14} />
              built by aswinasok<span className={styles.footerDot}>.</span>
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
