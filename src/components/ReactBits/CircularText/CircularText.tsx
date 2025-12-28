import { useState } from 'react';
import './CircularText.css';

interface CircularTextProps {
  text: string;
  spinDuration?: number;
  onHover?: 'slowDown' | 'speedUp' | 'pause' | 'goBonkers';
  className?: string;
  radius?: number;
  highlightWord?: string;
  highlightColor?: string;
}

export default function CircularText({
  text,
  spinDuration = 20,
  onHover = 'speedUp',
  className = '',
  radius = 50,
  highlightWord = '',
  highlightColor = '#3ecf8e',
}: CircularTextProps) {
  const [isHovered, setIsHovered] = useState(false);

  const letters = text.split('');
  const angleStep = 360 / letters.length;

  // Find positions of highlight word
  const getHighlightIndices = () => {
    if (!highlightWord) return new Set<number>();
    const indices = new Set<number>();
    let pos = 0;
    while ((pos = text.indexOf(highlightWord, pos)) !== -1) {
      for (let i = pos; i < pos + highlightWord.length; i++) {
        indices.add(i);
      }
      pos += 1;
    }
    return indices;
  };

  const highlightIndices = getHighlightIndices();

  const getAnimationDuration = () => {
    if (!isHovered) return spinDuration;
    switch (onHover) {
      case 'slowDown':
        return spinDuration * 2;
      case 'speedUp':
        return spinDuration / 4;
      case 'pause':
        return 0;
      case 'goBonkers':
        return spinDuration / 20;
      default:
        return spinDuration;
    }
  };

  const duration = getAnimationDuration();

  return (
    <div className={className} style={{ position: 'absolute' }}>
      <div
        className="circular-text"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          animation: duration > 0 ? `spin ${duration}s linear infinite` : 'none',
          transform: isHovered && onHover === 'goBonkers' ? 'scale(0.9)' : 'scale(1)',
          position: 'relative',
        }}
      >
        {letters.map((letter, index) => {
          const isHighlighted = highlightIndices.has(index);
          return (
            <span
              key={index}
              className={isHighlighted ? 'glitch-letter' : ''}
              style={{
                transform: `rotate(${index * angleStep}deg)`,
                transformOrigin: `0 ${radius}px`,
                color: isHighlighted ? highlightColor : '#ffffff',
              }}
            >
              {letter}
            </span>
          );
        })}
      </div>
    </div>
  );
}
