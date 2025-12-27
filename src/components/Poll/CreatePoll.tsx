import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { pollFacade } from '../../core/appServices';
import { CreatePollSEO } from '../SEO/SEO';
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
  simulated_enabled: boolean;
  simulated_target_votes: number | '';
}

export function CreatePoll({ user, onSuccess }: CreatePollProps) {
  const [title, setTitle] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [accessKey, setAccessKey] = useState('');
  const [options, setOptions] = useState<OptionInput[]>([
    { id: '1', title: '', image_url: '', simulated_enabled: false, simulated_target_votes: '' },
    { id: '2', title: '', image_url: '', simulated_enabled: false, simulated_target_votes: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number | ''>('');
  const [maxVotesPerIp, setMaxVotesPerIp] = useState<number | ''>('');
  const [autoVoteIntervalSeconds, setAutoVoteIntervalSeconds] = useState<number>(30);
  const removeOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter((opt) => opt.id !== id));
    }
  };

  const updateOption = (
    id: string,
    field: 'title' | 'image_url' | 'simulated_enabled' | 'simulated_target_votes',
    value: string | number | boolean | ''
  ) => {
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

    if (durationMinutes !== '' && durationMinutes <= 0) {
      setError('Timer must be greater than 0 minutes or left blank');
      return;
    }

    if (maxVotesPerIp !== '' && maxVotesPerIp <= 0) {
      setError('Max votes per IP must be greater than 0 or left blank');
      return;
    }

    setLoading(true);

    try {
      const endsAt =
        durationMinutes === '' ? undefined : new Date(Date.now() + durationMinutes * 60 * 1000);

      const pollData: CreatePollData = {
        title,
        is_public: isPublic,
        access_key: isPublic ? undefined : accessKey,
        ends_at: endsAt ? endsAt.toISOString() : undefined,
        max_votes_per_ip: maxVotesPerIp === '' ? undefined : maxVotesPerIp,
        auto_vote_interval_seconds: autoVoteIntervalSeconds || 30,
        options: options.map((opt, index) => ({
          title: opt.title,
          image_url: opt.image_url || null,
          position: index,
          simulated_enabled: Boolean(opt.simulated_enabled && opt.simulated_target_votes !== ''),
          simulated_target_votes:
            opt.simulated_target_votes === '' ? null : Number(opt.simulated_target_votes),
        })),
      };

      const poll = await pollFacade.createPoll(pollData, user.id);
      onSuccess(poll.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.createPollContainer}>
      {/* SEO meta tags for create poll page */}
      <CreatePollSEO />
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

                  <div className={styles.optionAdvancedRow}>
                    <label className={styles.smallLabel}>
                      Target votes
                      <input
                        type="number"
                        min={0}
                        placeholder="e.g. 100"
                        value={option.simulated_target_votes}
                        onChange={(e) =>
                          updateOption(
                            option.id,
                            'simulated_target_votes',
                            e.target.value === '' ? '' : Number(e.target.value)
                          )
                        }
                        className={styles.optionTitleInput}
                        disabled={loading}
                      />
                    </label>
                    <label className={styles.toggleLabel}>
                      <input
                        type="checkbox"
                        checked={option.simulated_enabled}
                        onChange={(e) =>
                          updateOption(option.id, 'simulated_enabled', e.target.checked)
                        }
                        disabled={loading}
                      />
                      <span className={styles.toggleSwitch} />
                      Auto votes
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Poll Controls */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Poll Controls</h3>
            <p className={styles.cardDescription}>
              Control how long the poll runs and prevent spam by limiting votes per IP.
            </p>
            <div className={styles.controlsGrid}>
              <div className={styles.controlItem}>
                <label className={styles.controlLabel}>Auto-close timer (minutes)</label>
                <input
                  type="number"
                  min={0}
                  placeholder="Leave blank for no timer"
                  value={durationMinutes}
                  onChange={(e) =>
                    setDurationMinutes(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className={styles.controlInput}
                  disabled={loading}
                />
                <p className={styles.controlHint}>
                  After this time, voting stops and results are shown in grayscale.
                </p>
              </div>
              <div className={styles.controlItem}>
                <label className={styles.controlLabel}>Max votes per IP</label>
                <input
                  type="number"
                  min={0}
                  placeholder="Leave blank for unlimited"
                  value={maxVotesPerIp}
                  onChange={(e) =>
                    setMaxVotesPerIp(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className={styles.controlInput}
                  disabled={loading}
                />
                <p className={styles.controlHint}>Stops automated scripts and heavy repeat voters.</p>
              </div>
              <div className={styles.controlItem}>
                <label className={styles.controlLabel}>Auto-vote interval (seconds)</label>
                <input
                  type="number"
                  min={5}
                  value={autoVoteIntervalSeconds}
                  onChange={(e) => setAutoVoteIntervalSeconds(Number(e.target.value) || 30)}
                  className={styles.controlInput}
                  disabled={loading}
                />
                <p className={styles.controlHint}>
                  How often simulated votes are considered for options with a target.
                </p>
              </div>
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
              inspired from neal<span className={styles.footerDot}>.</span>fun
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
