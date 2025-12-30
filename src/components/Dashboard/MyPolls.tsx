import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import {
  useUserPolls,
  useDeletePoll,
  useTogglePollStatus,
  useUserPollCount,
} from '../../hooks/usePollQueries';
import { useUserProfile } from '../../hooks/useUserProfile';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Delete01Icon,
  SquareArrowUpRightIcon,
  Add01Icon,
  GlobeIcon,
  LockIcon,
  Calendar01Icon,
  ToggleOnIcon,
  ToggleOffIcon,
  Copy01Icon,
  Tick01Icon,
  PencilEdit01Icon,
  Cancel01Icon,
  Alert02Icon,
} from '@hugeicons/core-free-icons';
import { FREE_PLAN_POLL_LIMIT } from '../../config/plans';
import styles from './MyPolls.module.css';
import sharedStyles from '../../styles/Shared.module.css';

interface MyPollsProps {
  user: User;
}

interface ModalState {
  type: 'delete' | 'deactivate' | 'activate' | null;
  pollId: string;
  pollTitle: string;
}

export function MyPolls({ user }: MyPollsProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [modalState, setModalState] = useState<ModalState>({
    type: null,
    pollId: '',
    pollTitle: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const { data: polls = [], isLoading, error } = useUserPolls(user.id);
  const { data: pollCount = 0, isLoading: pollCountLoading } = useUserPollCount(user.id);
  const { data: profile } = useUserProfile(user);
  const deletePoll = useDeletePoll();
  const toggleStatus = useTogglePollStatus();

  const isSuperAdmin = profile?.role === 'superadmin';
  const isPro = isSuperAdmin || profile?.plan === 'pro';
  const resolvedPollCount = pollCount ?? polls.length;
  const isAtFreeLimit = !isPro && resolvedPollCount >= FREE_PLAN_POLL_LIMIT;

  const openDeleteModal = (pollId: string, pollTitle: string) => {
    setModalState({ type: 'delete', pollId, pollTitle });
  };

  const openToggleModal = (pollId: string, pollTitle: string, isActive: boolean) => {
    setModalState({ type: isActive ? 'deactivate' : 'activate', pollId, pollTitle });
  };

  const closeModal = () => {
    setModalState({ type: null, pollId: '', pollTitle: '' });
  };

  const handleDelete = async () => {
    if (!modalState.pollId) return;
    setIsProcessing(true);

    try {
      await deletePoll.mutateAsync(modalState.pollId);
      closeModal();
    } catch {
      // Keep modal open on error
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!modalState.pollId) return;
    setIsProcessing(true);

    try {
      const isActivating = modalState.type === 'activate';
      await toggleStatus.mutateAsync({ pollId: modalState.pollId, isActive: isActivating });
      closeModal();
    } catch {
      // Keep modal open on error
    } finally {
      setIsProcessing(false);
    }
  };

  const copyPollLink = async (slug: string, pollId: string) => {
    const url = `${window.location.origin}/poll/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(pollId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading your polls...</p>
      </div>
    );
  }

  return (
    <div className={styles.myPollsContainer}>
      {/* Upgrade Banner - shown at top when at free limit */}
      {isAtFreeLimit && (
        <div className={styles.upgradeBanner}>
          <div className={styles.upgradeBannerContent}>
            <span className={styles.upgradeBannerText}>
              Congratulations! You are eligible for an upgrade
            </span>
            <button
              onClick={() => navigate('/dashboard/settings')}
              className={styles.upgradeBannerButton}
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>My Polls</h1>
          <p className={styles.pageSubtitle}>
            {polls.length} {polls.length === 1 ? 'poll' : 'polls'} in your collection
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/create')}
          className={styles.createButton}
          disabled={isAtFreeLimit || pollCountLoading}
        >
          <HugeiconsIcon icon={Add01Icon} size={18} />
          {isAtFreeLimit ? 'Upgrade to Pro' : 'Create Poll'}
        </button>
      </div>

      {error && (
        <div className={sharedStyles.errorMessage}>
          {error instanceof Error ? error.message : 'Failed to load polls'}
        </div>
      )}

      {polls.length === 0 ? (
        <div className={styles.emptyState}>
          <h2 className={styles.emptyTitle}>Ready to launch your first poll?</h2>
          <p className={styles.emptyDescription}>
            Create engaging polls and start collecting real-time feedback from your audience in
            seconds.
          </p>
          <div className={styles.emptyActions}>
            <button
              onClick={() => navigate('/dashboard/create')}
              className={styles.emptyButton}
              disabled={isAtFreeLimit || pollCountLoading}
            >
              <HugeiconsIcon icon={Add01Icon} size={18} />
              {isAtFreeLimit ? 'Upgrade to Pro' : 'Create Your First Poll'}
            </button>
            <button onClick={() => navigate('/explore')} className={styles.emptyButtonSecondary}>
              <HugeiconsIcon icon={GlobeIcon} size={18} />
              Explore Public Polls
            </button>
          </div>
          <div className={styles.emptyFeatures}>
            <span>
              <HugeiconsIcon icon={Tick01Icon} size={16} /> Real-time results
            </span>
            <span>
              <HugeiconsIcon icon={Tick01Icon} size={16} /> Easy sharing
            </span>
            <span>
              <HugeiconsIcon icon={Tick01Icon} size={16} /> Beautiful visuals
            </span>
          </div>
        </div>
      ) : (
        <div className={styles.pollsGrid}>
          {polls.map((poll, index) => (
            <div
              key={poll.id}
              className={styles.pollCard}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className={styles.pollCardHeader}>
                <div className={styles.pollBadges}>
                  <span
                    className={`${styles.visibilityBadge} ${poll.is_public ? styles.public : styles.private}`}
                  >
                    {poll.is_public ? (
                      <HugeiconsIcon icon={GlobeIcon} size={12} />
                    ) : (
                      <HugeiconsIcon icon={LockIcon} size={12} />
                    )}
                    {poll.is_public ? 'Public' : 'Private'}
                  </span>
                  <div className={styles.pollRight}>
                    <div className={styles.pollMenu}>
                      <button
                        onClick={() => copyPollLink(poll.slug, poll.id)}
                        className={styles.menuButton}
                        title="Copy link"
                      >
                        {copiedId === poll.id ? (
                          <HugeiconsIcon icon={Tick01Icon} size={16} />
                        ) : (
                          <HugeiconsIcon icon={Copy01Icon} size={16} />
                        )}
                      </button>
                      <button
                        onClick={() => navigate(`/dashboard/edit/${poll.id}`)}
                        className={styles.menuButton}
                        title="Edit poll"
                      >
                        <HugeiconsIcon icon={PencilEdit01Icon} size={16} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(poll.id, poll.title)}
                        className={`${styles.menuButton} ${styles.deleteButton}`}
                        title="Delete poll"
                      >
                        <HugeiconsIcon icon={Delete01Icon} size={16} />
                      </button>
                    </div>
                    {poll.is_active ? (
                      <span className={styles.activeDot} title="Active"></span>
                    ) : (
                      <span className={`${styles.statusBadge} ${styles.inactive}`}>Inactive</span>
                    )}
                  </div>
                </div>
              </div>

              <h3 className={styles.pollTitle}>{poll.title}</h3>

              <div className={styles.pollMeta}>
                <span className={styles.pollDate}>
                  <HugeiconsIcon icon={Calendar01Icon} size={14} />
                  {new Date(poll.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div className={styles.pollActions}>
                {poll.is_active ? (
                  <>
                    <button
                      onClick={() => window.open(`/poll/${poll.slug}`, '_blank')}
                      className={styles.viewButton}
                    >
                      <HugeiconsIcon icon={SquareArrowUpRightIcon} size={16} />
                      View Poll
                    </button>
                    <button
                      onClick={() => openToggleModal(poll.id, poll.title, poll.is_active)}
                      className={`${styles.toggleButton} ${styles.toggleDeactivate}`}
                      title="Deactivate"
                    >
                      <HugeiconsIcon icon={ToggleOffIcon} size={16} />
                      Deactivate
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => openToggleModal(poll.id, poll.title, poll.is_active)}
                      className={styles.activateButton}
                    >
                      <HugeiconsIcon icon={ToggleOnIcon} size={16} />
                      Activate Poll
                    </button>
                    <button
                      onClick={() => window.open(`/poll/${poll.slug}`, '_blank')}
                      className={styles.viewButtonSecondary}
                      title="View Poll"
                    >
                      <HugeiconsIcon icon={SquareArrowUpRightIcon} size={16} />
                      View
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {modalState.type === 'delete' && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalHeaderTitle}>Delete Poll</span>
              <button className={styles.modalClose} onClick={closeModal} aria-label="Close modal">
                <HugeiconsIcon icon={Cancel01Icon} size={14} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={`${styles.modalIcon} ${styles.modalIconDanger}`}>
                <HugeiconsIcon icon={Delete01Icon} size={18} />
              </div>
              <h3 className={styles.modalTitle}>Delete this poll?</h3>
              <p className={styles.modalDescription}>
                This action cannot be undone. All votes and data will be permanently removed.
              </p>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.modalButtonSecondary} onClick={closeModal}>
                Cancel
              </button>
              <button
                className={styles.modalButtonDanger}
                onClick={handleDelete}
                disabled={isProcessing}
              >
                {isProcessing ? 'Deleting...' : 'Delete Poll'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation Modal */}
      {modalState.type === 'deactivate' && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalHeaderTitle}>Deactivate Poll</span>
              <button className={styles.modalClose} onClick={closeModal} aria-label="Close modal">
                <HugeiconsIcon icon={Cancel01Icon} size={14} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={`${styles.modalIcon} ${styles.modalIconWarning}`}>
                <HugeiconsIcon icon={Alert02Icon} size={18} />
              </div>
              <h3 className={styles.modalTitle}>Deactivate this poll?</h3>
              <p className={styles.modalDescription}>
                Users won't be able to vote while this poll is inactive. You can reactivate it
                anytime.
              </p>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.modalButtonSecondary} onClick={closeModal}>
                Cancel
              </button>
              <button
                className={styles.modalButtonWarning}
                onClick={handleToggleStatus}
                disabled={isProcessing}
              >
                {isProcessing ? 'Deactivating...' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activate Confirmation Modal */}
      {modalState.type === 'activate' && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalHeaderTitle}>Activate Poll</span>
              <button className={styles.modalClose} onClick={closeModal} aria-label="Close modal">
                <HugeiconsIcon icon={Cancel01Icon} size={14} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalIcon}>
                <HugeiconsIcon icon={ToggleOnIcon} size={18} />
              </div>
              <h3 className={styles.modalTitle}>Activate this poll?</h3>
              <p className={styles.modalDescription}>
                This poll will become live and users will be able to vote on it.
              </p>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.modalButtonSecondary} onClick={closeModal}>
                Cancel
              </button>
              <button
                className={styles.modalButtonPrimary}
                onClick={handleToggleStatus}
                disabled={isProcessing}
              >
                {isProcessing ? 'Activating...' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
