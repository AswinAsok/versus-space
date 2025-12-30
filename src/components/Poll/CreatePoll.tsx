import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useCreatePoll, useUpdatePoll, useUserPollCount } from '../../hooks/usePollQueries';
import { useUserProfile } from '../../hooks/useUserProfile';
import { CreatePollSEO } from '../SEO/SEO';
import { HugeiconsIcon } from '@hugeicons/react';
import { GlobeIcon, LockIcon, Key01Icon, Clock01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
import type { CreatePollData, PollWithOptions } from '../../types';
import { FREE_PLAN_POLL_LIMIT, FREE_PLAN_POLL_DURATION_MINUTES } from '../../config/plans';
import { MouseLoader } from '../Loading/MouseLoader';
import styles from './CreatePoll.module.css';
import sharedStyles from '../../styles/Shared.module.css';

interface CreatePollProps {
  user: User;
  onSuccess: (slug: string) => void;
  editPoll?: PollWithOptions;
}

interface OptionInput {
  id: string;
  title: string;
  image_url: string;
}

export function CreatePoll({ user, onSuccess, editPoll }: CreatePollProps) {
  const isEditMode = !!editPoll;

  const [title, setTitle] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [accessKey, setAccessKey] = useState('');
  const [options, setOptions] = useState<OptionInput[]>([
    { id: '1', title: '', image_url: '' },
    { id: '2', title: '', image_url: '' },
  ]);
  const [error, setError] = useState('');

  const createPoll = useCreatePoll();
  const updatePoll = useUpdatePoll();
  const loading = createPoll.isPending || updatePoll.isPending;
  const { data: profile, isLoading: profileLoading } = useUserProfile(user);
  const { data: pollCount = 0, isLoading: pollCountLoading } = useUserPollCount(user.id);
  const [durationMinutes, setDurationMinutes] = useState<number | ''>(FREE_PLAN_POLL_DURATION_MINUTES);
  const [maxVotesPerIp, setMaxVotesPerIp] = useState<number | ''>('');
  const [autoVoteIntervalSeconds, setAutoVoteIntervalSeconds] = useState<number>(30);
  const [globalTargetVotes, setGlobalTargetVotes] = useState<number>(50);
  const [autoVotesEnabled, setAutoVotesEnabled] = useState(false);
  const [showFreeUserModal, setShowFreeUserModal] = useState(false);

  const isSuperAdmin = profile?.role === 'superadmin';
  const isPro = isSuperAdmin || profile?.plan === 'pro';
  const isAtFreeLimit = !isPro && !isEditMode && pollCount >= FREE_PLAN_POLL_LIMIT;

  // Load existing poll data when editing
  useEffect(() => {
    if (editPoll) {
      setTitle(editPoll.title);
      setIsPublic(editPoll.is_public);
      setAccessKey(editPoll.access_key || '');
      setMaxVotesPerIp(editPoll.max_votes_per_ip ?? '');
      setAutoVoteIntervalSeconds(editPoll.auto_vote_interval_seconds || 30);

      // Load options
      if (editPoll.options && editPoll.options.length > 0) {
        setOptions(
          editPoll.options.map((opt) => ({
            id: opt.id,
            title: opt.title,
            image_url: opt.image_url || '',
          }))
        );

        // Check if auto votes are enabled (any option has simulated_enabled)
        const hasAutoVotes = editPoll.options.some((opt) => opt.simulated_enabled);
        setAutoVotesEnabled(hasAutoVotes);

        // Calculate total target votes from per-option targets
        if (hasAutoVotes) {
          const totalTarget = editPoll.options.reduce(
            (sum, opt) => sum + (opt.simulated_target_votes || 0),
            0
          );
          setGlobalTargetVotes(totalTarget > 0 ? totalTarget : 50);
        }
      }
    }
  }, [editPoll]);

  useEffect(() => {
    if (!profile || isPro) return;
    setIsPublic(true);
    setAccessKey('');
    setAutoVotesEnabled(false);
    setDurationMinutes(FREE_PLAN_POLL_DURATION_MINUTES);
    setMaxVotesPerIp('');
  }, [profile, isPro]);

  const updateOption = (id: string, field: 'title' | 'image_url', value: string) => {
    setOptions(options.map((opt) => (opt.id === id ? { ...opt, [field]: value } : opt)));
  };

  const validateForm = (): boolean => {
    setError('');

    if (options.length < 2) {
      setError('Please add at least 2 options');
      return false;
    }

    if (options.some((opt) => !opt.title.trim())) {
      setError('All options must have a title');
      return false;
    }

    if (!isPublic && !accessKey.trim()) {
      setError('Private polls require an access key');
      return false;
    }

    if (durationMinutes !== '' && durationMinutes <= 0) {
      setError('Timer must be greater than 0 minutes or left blank');
      return false;
    }

    if (maxVotesPerIp !== '' && maxVotesPerIp <= 0) {
      setError('Max votes per IP must be greater than 0 or left blank');
      return false;
    }

    if (isAtFreeLimit) {
      setError(
        `Free plan limit reached. Upgrade to Pro to create more than ${FREE_PLAN_POLL_LIMIT} polls.`
      );
      return false;
    }

    if (!isPro && !isPublic) {
      setError('Private polls are available on the Pro plan.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Show confirmation modal for free users creating new polls
    if (!isPro && !isEditMode) {
      setShowFreeUserModal(true);
      return;
    }

    await submitPoll();
  };

  const submitPoll = async () => {
    setShowFreeUserModal(false);

    try {
      const effectiveAutoVotesEnabled = isPro ? autoVotesEnabled : false;
      const effectiveDuration = isPro ? durationMinutes : FREE_PLAN_POLL_DURATION_MINUTES;
      const effectiveMaxVotesPerIp = isPro ? maxVotesPerIp : '';
      const effectiveInterval = isPro ? autoVoteIntervalSeconds : 30;

      // Calculate per-option target votes (divide equally among options)
      const perOptionTarget = effectiveAutoVotesEnabled
        ? Math.floor(globalTargetVotes / options.length)
        : null;

      if (isEditMode && editPoll) {
        // Update existing poll
        const updatedPoll = await updatePoll.mutateAsync({
          pollId: editPoll.id,
          data: {
            title,
            is_public: isPublic,
            access_key: isPublic ? null : accessKey,
            max_votes_per_ip: effectiveMaxVotesPerIp === '' ? null : effectiveMaxVotesPerIp,
            auto_vote_interval_seconds: effectiveInterval || 30,
            options: options.map((opt, index) => ({
              id: opt.id,
              title: opt.title,
              image_url: opt.image_url || null,
              position: index,
              simulated_enabled: effectiveAutoVotesEnabled,
              simulated_target_votes: perOptionTarget,
            })),
          },
        });
        onSuccess(updatedPoll.slug);
      } else {
        // Create new poll
        const endsAt =
          effectiveDuration === ''
            ? undefined
            : new Date(Date.now() + effectiveDuration * 60 * 1000);

        const pollData: CreatePollData = {
          title,
          is_public: isPublic,
          access_key: isPublic ? undefined : accessKey,
          ends_at: endsAt ? endsAt.toISOString() : undefined,
          max_votes_per_ip: effectiveMaxVotesPerIp === '' ? undefined : effectiveMaxVotesPerIp,
          auto_vote_interval_seconds: effectiveInterval || 30,
          options: options.map((opt, index) => ({
            title: opt.title,
            image_url: opt.image_url || null,
            position: index,
            simulated_enabled: effectiveAutoVotesEnabled,
            simulated_target_votes: perOptionTarget,
          })),
        };

        const poll = await createPoll.mutateAsync({ data: pollData, userId: user.id });
        onSuccess(poll.slug);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEditMode
            ? 'Failed to update poll'
            : 'Failed to create poll'
      );
    }
  };

  if (profileLoading || pollCountLoading) {
    return (
      <div className={styles.createPollContainer}>
        <div className={styles.createPollInner}>
          <MouseLoader />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.createPollContainer}>
      {/* SEO meta tags for create poll page */}
      {!isEditMode && <CreatePollSEO />}
      <div className={styles.createPollInner}>
        {/* Upgrade Banner - shown at top when at free limit */}
        {isAtFreeLimit && (
          <div className={styles.upgradeBanner}>
            <div className={styles.upgradeBannerContent}>
              <span className={styles.upgradeBannerText}>
                Congratulations! You are eligible for an upgrade
              </span>
              <a href="/dashboard/settings" className={styles.upgradeBannerButton}>
                Upgrade to Pro
              </a>
            </div>
          </div>
        )}

        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>{isEditMode ? 'Edit poll' : 'Create a new poll'}</h1>
          <p className={styles.pageSubtitle}>
            {isEditMode
              ? 'Update your poll settings and options'
              : 'Set up your question and options to start collecting votes'}
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
            {!isEditMode && (
              <p className={styles.inputHint}>
                This will be used to create your poll's shareable link
              </p>
            )}
          </div>

          {/* Answer Options Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>Possible Options</h3>
                <p className={styles.cardDescription}>Add the choices people can vote for</p>
              </div>
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
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Poll Controls */}
          <div className={`${styles.card} ${!isPro ? styles.lockedCard : ''}`}>
            {!isPro && (
              <p className={styles.proDescription}>
                Control how long the poll runs and prevent spam
              </p>
            )}
            <h3 className={styles.cardTitle}>
              Poll Controls
              {!isPro && <span className={styles.proBadge}>Pro</span>}
            </h3>
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
                  disabled={loading || !isPro}
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
                  disabled={loading || !isPro}
                />
                <p className={styles.controlHint}>
                  Stops automated scripts and heavy repeat voters.
                </p>
              </div>
            </div>
          </div>

          {/* Auto Votes Card */}
          <div className={`${styles.card} ${!isPro ? styles.lockedCard : ''}`}>
            {!isPro && (
              <p className={styles.proDescription}>
                Simulate engagement by automatically adding votes
              </p>
            )}
            <h3 className={styles.cardTitle}>
              Auto Votes
              {!isPro && <span className={styles.proBadge}>Pro</span>}
            </h3>
            <p className={styles.cardDescription}>
              Simulate engagement by automatically adding votes to your poll.
            </p>
            <div className={styles.autoVotesSection}>
              <div className={styles.autoVotesToggleRow}>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={autoVotesEnabled}
                    onChange={(e) => setAutoVotesEnabled(e.target.checked)}
                    disabled={loading || !isPro}
                  />
                  <span className={styles.toggleSwitch} />
                  Enable auto votes
                </label>
              </div>
              {autoVotesEnabled && isPro && (
                <div className={styles.autoVotesFields}>
                  <div className={styles.sliderItem}>
                    <div className={styles.sliderHeader}>
                      <label className={styles.controlLabel}>Total target votes</label>
                      <input
                        type="number"
                        min={10}
                        max={50000}
                        value={globalTargetVotes}
                        onChange={(e) =>
                          setGlobalTargetVotes(
                            Math.min(50000, Math.max(10, Number(e.target.value) || 10))
                          )
                        }
                        className={styles.sliderValueInput}
                        disabled={loading || !isPro}
                      />
                    </div>
                    <div className={styles.sliderWrapper}>
                      <input
                        type="range"
                        min={10}
                        max={50000}
                        step={10}
                        value={globalTargetVotes}
                        onChange={(e) => setGlobalTargetVotes(Number(e.target.value))}
                        className={styles.slider}
                        disabled={loading || !isPro}
                      />
                      <div className={styles.sliderTicks}>
                        <span>10</span>
                        <span>10k</span>
                        <span>20k</span>
                        <span>30k</span>
                        <span>40k</span>
                        <span>50k</span>
                      </div>
                    </div>
                    <p className={styles.controlHint}>
                      Distributed equally among all options for fairness.
                    </p>
                  </div>
                  <div className={styles.sliderItem}>
                    <div className={styles.sliderHeader}>
                      <label className={styles.controlLabel}>Vote interval</label>
                      <div className={styles.sliderValueWithUnit}>
                        <input
                          type="number"
                          min={5}
                          max={300}
                          value={autoVoteIntervalSeconds}
                          onChange={(e) =>
                            setAutoVoteIntervalSeconds(
                              Math.min(300, Math.max(5, Number(e.target.value) || 5))
                            )
                          }
                          className={styles.sliderValueInput}
                          disabled={loading || !isPro}
                        />
                        <span className={styles.sliderUnit}>sec</span>
                      </div>
                    </div>
                    <div className={styles.sliderWrapper}>
                      <input
                        type="range"
                        min={5}
                        max={300}
                        step={5}
                        value={autoVoteIntervalSeconds}
                        onChange={(e) => setAutoVoteIntervalSeconds(Number(e.target.value))}
                        className={styles.slider}
                        disabled={loading || !isPro}
                      />
                      <div className={styles.sliderTicks}>
                        <span>5s</span>
                        <span>1m</span>
                        <span>2m</span>
                        <span>3m</span>
                        <span>4m</span>
                        <span>5m</span>
                      </div>
                    </div>
                    <p className={styles.controlHint}>
                      Lower = faster simulation, higher = more natural pacing.
                    </p>
                  </div>
                </div>
              )}
              {isPro && (
                <div className={styles.infoBox}>
                  <strong>Fair distribution:</strong> Auto votes are split equally among all options
                  to ensure no option gets an unfair advantage. This creates realistic engagement
                  while maintaining poll integrity.
                </div>
              )}
            </div>
          </div>

          {/* Visibility Card */}
          <div className={`${styles.card} ${!isPro ? styles.lockedCard : ''}`}>
            {!isPro && (
              <p className={styles.proDescription}>
                Control poll visibility with public or private access
              </p>
            )}
            <h3 className={styles.cardTitle}>
              Visibility
              {!isPro && <span className={styles.proBadge}>Pro</span>}
            </h3>
            <p className={styles.cardDescription}>Choose who can see and vote on your poll</p>
            <div className={styles.visibilityToggle}>
              <button
                type="button"
                className={`${styles.visibilityOption} ${isPublic ? styles.visibilityActive : ''}`}
                onClick={() => setIsPublic(true)}
                disabled={loading || !isPro}
              >
                <div className={styles.visibilityIcon}>
                  <HugeiconsIcon icon={GlobeIcon} size={18} />
                </div>
                <div className={styles.visibilityText}>
                  <span className={styles.visibilityName}>Public</span>
                  <span className={styles.visibilityDesc}>Anyone can vote</span>
                </div>
              </button>
              <button
                type="button"
                className={`${styles.visibilityOption} ${!isPublic ? styles.visibilityActive : ''}`}
                onClick={() => isPro && setIsPublic(false)}
                disabled={loading || !isPro}
              >
                <div className={styles.visibilityIcon}>
                  <HugeiconsIcon icon={LockIcon} size={18} />
                </div>
                <div className={styles.visibilityText}>
                  <span className={styles.visibilityName}>Private</span>
                  <span className={styles.visibilityDesc}>Requires access key</span>
                </div>
              </button>
            </div>

            {!isPublic && isPro && (
              <div className={styles.accessKeySection}>
                <label htmlFor="accessKey" className={styles.accessKeyLabel}>
                  <HugeiconsIcon icon={Key01Icon} size={14} />
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
          <button type="submit" className={styles.submitButton} disabled={loading || isAtFreeLimit}>
            {isAtFreeLimit
              ? 'Upgrade to Pro'
              : loading
                ? isEditMode
                  ? 'Saving...'
                  : 'Creating...'
                : isEditMode
                  ? 'Save Changes'
                  : 'Create Poll'}
          </button>
        </form>
      </div>

      {/* Free User Timer Confirmation Modal */}
      {showFreeUserModal && (
        <div className={styles.modalOverlay} onClick={() => setShowFreeUserModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalHeaderTitle}>Poll Settings</span>
              <button
                className={styles.modalClose}
                onClick={() => setShowFreeUserModal(false)}
                aria-label="Close modal"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={14} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalIcon}>
                <HugeiconsIcon icon={Clock01Icon} size={18} />
              </div>
              <h3 className={styles.modalTitle}>Auto-close Timer</h3>
              <p className={styles.modalDescription}>
                Your poll will automatically close in <strong>{FREE_PLAN_POLL_DURATION_MINUTES} minutes</strong>.
              </p>
              <p className={styles.modalSubtext}>
                Upgrade to Pro for custom timer settings.
              </p>
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.modalButtonSecondary}
                onClick={() => setShowFreeUserModal(false)}
              >
                Cancel
              </button>
              <button
                className={styles.modalButtonPrimary}
                onClick={submitPoll}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Poll'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
