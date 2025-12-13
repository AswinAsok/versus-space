import { useState, useEffect, useRef, useCallback } from 'react';
import ReactSpeedometer, { Transition } from 'react-d3-speedometer';
import CountUp from '../ReactBits/CountUp/CountUp';
import Counter from '../ReactBits/Counter/Counter';
import { voteService } from '../../services/voteService';
import { getSessionId } from '../../utils/sessionId';
import { RateCalculator } from '../../utils/rateCalculator';
import sharedStyles from '../../styles/Shared.module.css';
import type { PollOption } from '../../types';
import styles from './VotingInterface.module.css';

interface VotingInterfaceProps {
  pollId: string;
  options: PollOption[];
}

interface FloatingNumber {
  id: number;
  value: string;
  x: number;
  y: number;
  optionId: string;
}


// Generate places array based on the number of digits in the value
const getPlacesForValue = (value: number): number[] => {
  if (value === 0) return [1];
  const digits = Math.floor(Math.log10(Math.abs(value))) + 1;
  return Array.from({ length: digits }, (_, i) => Math.pow(10, digits - 1 - i));
};

// Presents poll options, tracks vote velocity, and delegates vote persistence.
export function VotingInterface({ pollId, options }: VotingInterfaceProps) {
  const [userVotes, setUserVotes] = useState<Map<string, number>>(new Map());
  const [votingRates, setVotingRates] = useState<Map<string, number>>(new Map());
  const rateCalculatorRef = useRef(new RateCalculator());
  const sessionId = getSessionId();

  // Gamification state
  const [combo, setCombo] = useState(0);
  const [comboTimer, setComboTimer] = useState<NodeJS.Timeout | null>(null);
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([]);
  const [heatLevels, setHeatLevels] = useState<Map<string, number>>(new Map());
  const [screenShake, setScreenShake] = useState(false);
  const [confetti, setConfetti] = useState<
    { id: number; particles: { x: number; y: number; color: string }[] }[]
  >([]);
  const [initialCountAnimationDone, setInitialCountAnimationDone] = useState(false);

  const floatingIdRef = useRef(0);
  const confettiIdRef = useRef(0);
  const totalUserVotesRef = useRef(0);
  const initialCountAnimationDoneRef = useRef(false);

  // Cool down heat levels over time
  useEffect(() => {
    const heatInterval = setInterval(() => {
      setHeatLevels((prev) => {
        const newMap = new Map(prev);
        newMap.forEach((value, key) => {
          if (value > 0) {
            newMap.set(key, Math.max(0, value - 0.5));
          }
        });
        return newMap;
      });
    }, 100);
    return () => clearInterval(heatInterval);
  }, []);

  useEffect(() => {
    // Refresh vote rates on a small cadence to create the live feel.
    const interval = setInterval(() => {
      const newRates = new Map<string, number>();
      options.forEach((option) => {
        newRates.set(option.id, rateCalculatorRef.current.getRate(option.id));
      });
      setVotingRates(newRates);
    }, 100);

    return () => clearInterval(interval);
  }, [options]);

  const spawnConfetti = useCallback((x: number, y: number) => {
    const id = confettiIdRef.current++;
    const colors = ['#ff0', '#f0f', '#0ff', '#0f0', '#f00', '#00f'];
    const particles = Array.from({ length: 30 }, () => ({
      x: x + (Math.random() - 0.5) * 200,
      y: y + (Math.random() - 0.5) * 200,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    setConfetti((prev) => [...prev, { id, particles }]);
    setTimeout(() => {
      setConfetti((prev) => prev.filter((c) => c.id !== id));
    }, 1000);
  }, []);

  const triggerScreenShake = useCallback(() => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 150);
  }, []);

  const markInitialAnimationDone = useCallback(() => {
    if (initialCountAnimationDoneRef.current) return;
    initialCountAnimationDoneRef.current = true;
    setInitialCountAnimationDone(true);
  }, []);

  const handleVote = async (optionId: string, event: React.MouseEvent) => {
    const button = event.currentTarget as HTMLButtonElement;
    const buttonRect = button.getBoundingClientRect();
    const parentRect = button.closest(`.${styles.votingOption}`)?.getBoundingClientRect();

    // Position from button's top center with slight random horizontal offset
    const x = parentRect
      ? buttonRect.left - parentRect.left + buttonRect.width / 2 + (Math.random() - 0.5) * 40
      : buttonRect.width / 2;
    const y = parentRect ? buttonRect.top - parentRect.top - 10 : 0;

    const voteValue = 1;

    // Update combo
    if (comboTimer) clearTimeout(comboTimer);
    setCombo((prev) => prev + 1);
    const newTimer = setTimeout(() => {
      setCombo(0);
    }, 1000);
    setComboTimer(newTimer);

    // Increase heat level
    setHeatLevels((prev) => {
      const newMap = new Map(prev);
      newMap.set(optionId, Math.min(10, (newMap.get(optionId) || 0) + 1));
      return newMap;
    });

    // Spawn floating number
    const floatId = floatingIdRef.current++;
    setFloatingNumbers((prev) => [...prev, { id: floatId, value: '+1', x, y, optionId }]);
    setTimeout(() => {
      setFloatingNumbers((prev) => prev.filter((f) => f.id !== floatId));
    }, 1000);

    // Track total votes for effects
    totalUserVotesRef.current += voteValue;
    const totalVotes = totalUserVotesRef.current;

    if (totalVotes === 50) {
      spawnConfetti(event.clientX, event.clientY);
    }
    if (totalVotes === 100) {
      spawnConfetti(event.clientX, event.clientY);
      triggerScreenShake();
    }

    // Screen shake on high combos
    if (combo > 0 && combo % 10 === 0) {
      triggerScreenShake();
    }

    try {
      // Cast multiple votes if crit
      for (let i = 0; i < voteValue; i++) {
        await voteService.castVote(pollId, optionId, null);
      }

      // Maintain a local sliding window rate to avoid extra network traffic.
      rateCalculatorRef.current.addVote(optionId);

      // Track what the current user has contributed for contextual feedback.
      setUserVotes((prev) => {
        const newMap = new Map(prev);
        newMap.set(optionId, (newMap.get(optionId) || 0) + voteValue);
        return newMap;
      });

      await voteService.updateUserSession(sessionId, pollId);
    } catch (error) {
      console.error('Failed to cast vote:', error);
    }
  };

  if (options.length === 0) {
    return <div className={sharedStyles.noOptions}>No options available</div>;
  }

  const totalVotes = options.reduce((sum, opt) => sum + opt.vote_count, 0);
  const leadingOption = options.reduce((a, b) => (a.vote_count > b.vote_count ? a : b));

  return (
    <div className={`${styles.votingInterface} ${screenShake ? styles.shake : ''}`}>
      {/* Combo indicator */}
      {combo > 1 && (
        <div className={styles.comboIndicator}>
          <span className={styles.comboNumber}>{combo}x</span>
          <span className={styles.comboLabel}>COMBO</span>
        </div>
      )}

      {/* Confetti */}
      {confetti.map((c) => (
        <div key={c.id} className={styles.confettiContainer}>
          {c.particles.map((p, i) => (
            <div
              key={i}
              className={styles.confettiParticle}
              style={{
                left: p.x,
                top: p.y,
                backgroundColor: p.color,
                animationDelay: `${Math.random() * 0.2}s`,
              }}
            />
          ))}
        </div>
      ))}

      {options.map((option, index) => {
        const percentage = totalVotes > 0 ? (option.vote_count / totalVotes) * 100 : 50;
        const userVoteCount = userVotes.get(option.id) || 0;
        const rate = votingRates.get(option.id) || 0;
        const heat = heatLevels.get(option.id) || 0;
        const variantClass = styles[`variant${index}` as keyof typeof styles] || styles.variant0;
        const isLeading = option.id === leadingOption.id && totalVotes > 0;

        return (
          <div
            key={option.id}
            className={`${styles.votingOption} ${variantClass} ${heat > 5 ? styles.onFire : ''} ${isLeading ? styles.leading : ''}`}
            style={
              {
                width: `${percentage}%`,
                '--heat-intensity': heat / 10,
              } as React.CSSProperties
            }
          >
            {option.image_url && (
              <div className={styles.optionBackground}>
                <img src={option.image_url} alt={option.title} />
              </div>
            )}

            {/* Heat glow overlay */}
            {heat > 0 && <div className={styles.heatGlow} style={{ opacity: heat / 15 }} />}

            {/* Floating numbers */}
            {floatingNumbers
              .filter((f) => f.optionId === option.id)
              .map((f) => (
                <div
                  key={f.id}
                  className={styles.floatingNumber}
                  style={
                    {
                      left: f.x,
                      top: f.y,
                      '--drift': `${(Math.random() - 0.5) * 30}px`,
                    } as React.CSSProperties
                  }
                >
                  {f.value}
                </div>
              ))}

            <div className={styles.optionContent}>
              {/* Giant speedometer as background */}
              <div className={styles.speedometerBg}>
                <ReactSpeedometer
                  maxValue={20}
                  value={Math.min(rate, 20)}
                  needleColor="rgba(255,255,255,0.9)"
                  needleTransitionDuration={200}
                  needleTransition={Transition.easeQuadIn}
                  segments={5}
                  segmentColors={[
                    'rgba(255,255,255,0.03)',
                    'rgba(255,255,255,0.06)',
                    'rgba(255,255,255,0.1)',
                    index === 0
                      ? 'rgba(62,207,142,0.25)'
                      : index === 1
                        ? 'rgba(147,51,234,0.25)'
                        : 'rgba(59,130,246,0.25)',
                    index === 0
                      ? 'rgba(62,207,142,0.5)'
                      : index === 1
                        ? 'rgba(147,51,234,0.5)'
                        : 'rgba(59,130,246,0.5)',
                  ]}
                  currentValueText=""
                  textColor="transparent"
                  valueTextFontSize="0"
                  labelFontSize="0"
                  ringWidth={35}
                  width={420}
                  height={260}
                  paddingVertical={0}
                  paddingHorizontal={0}
                />
              </div>

              <div className={styles.optionInfo}>
                <h2 className={styles.optionTitle}>{option.title}</h2>

                <button
                  onClick={(e) => handleVote(option.id, e)}
                  className={`${styles.voteButton} ${heat > 7 ? styles.buttonOnFire : ''}`}
                >
                  <span className={styles.buttonPulse} />
                  +1 {option.title}
                  {isLeading && <span className={styles.crownIcon}>👑</span>}
                </button>

                <div className={styles.voteStats}>
                  <div className={styles.rateDisplay}>
                    <CountUp
                      to={parseFloat(rate.toFixed(1))}
                      from={initialCountAnimationDone ? rate : 0}
                      duration={0.8}
                      className={`${styles.rateNumber} ${rate > 5 ? styles.hotRate : ''}`}
                      startWhen={!initialCountAnimationDone}
                      onEnd={markInitialAnimationDone}
                    />
                    <span className={styles.rateLabel}>pts/sec</span>
                  </div>

                  <div className={styles.voteCount} data-count={option.vote_count.toLocaleString()}>
                    {!initialCountAnimationDone ? (
                      <CountUp
                        to={option.vote_count}
                        from={0}
                        duration={1.2}
                        separator=","
                        className={styles.countNumber}
                        startWhen={true}
                        onEnd={markInitialAnimationDone}
                      />
                    ) : (
                      <Counter
                        value={option.vote_count}
                        fontSize={104}
                        places={getPlacesForValue(option.vote_count)}
                        gap={4}
                        textColor={index === 0 ? '#3ecf8e' : '#a855f7'}
                        fontWeight={700}
                        gradientFrom="transparent"
                        gradientTo="transparent"
                        gradientHeight={0}
                      />
                    )}
                    <span className={styles.countLabel}>points</span>
                  </div>

                  {userVoteCount > 0 && (
                    <div className={styles.userVotes}>
                      You've scored <strong>{userVoteCount}</strong> for {option.title}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
