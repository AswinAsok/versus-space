import { useRef, useEffect, useCallback } from 'react';
import './CurvedLoop.css';

interface TextSegment {
  text: string;
  isNumber?: boolean;
}

interface CurvedLoopProps {
  segments: TextSegment[];
  speed?: number;
  curveAmount?: number;
  direction?: 'left' | 'right';
  interactive?: boolean;
  className?: string;
}

export default function CurvedLoop({
  segments,
  speed = 2,
  curveAmount = 300,
  direction = 'left',
  interactive = true,
  className = '',
}: CurvedLoopProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const offsetRef = useRef(0);
  const isDragging = useRef(false);
  const lastX = useRef(0);
  const velocityRef = useRef(direction === 'left' ? -speed : speed);
  const animationRef = useRef<number>();
  const pathIdRef = useRef(`curve-path-${Math.random().toString(36).slice(2, 9)}`);

  const viewBoxWidth = 2000;
  const viewBoxHeight = 120;

  // Curve going UP (convex) - control point is BELOW the baseline
  const curveDepth = curveAmount * 0.3;
  const curvePath = `M -200,${viewBoxHeight * 0.35} Q ${viewBoxWidth / 2},${viewBoxHeight * 0.35 + curveDepth} ${viewBoxWidth + 200},${viewBoxHeight * 0.35}`;

  // Build the full text from segments
  const fullText = segments.map(s => s.text).join('');

  // Repeat enough times to fill the screen continuously
  const repeatCount = 10;

  const animate = useCallback(() => {
    if (!isDragging.current) {
      offsetRef.current += velocityRef.current;

      // Get approximate length of one segment iteration
      const segmentLength = fullText.length * 25; // Approximate px per character

      // Reset seamlessly when we've scrolled one full segment
      if (direction === 'left') {
        if (offsetRef.current <= -segmentLength) {
          offsetRef.current += segmentLength;
        }
      } else {
        if (offsetRef.current >= segmentLength) {
          offsetRef.current -= segmentLength;
        }
      }
    }

    if (textRef.current) {
      const textPath = textRef.current.querySelector('textPath');
      if (textPath) {
        textPath.setAttribute('startOffset', `${offsetRef.current}px`);
      }
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [fullText.length, direction]);

  useEffect(() => {
    // Start with offset that shows text from the beginning
    offsetRef.current = 0;
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    isDragging.current = true;
    lastX.current = e.clientX;
    velocityRef.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!interactive || !isDragging.current) return;
    const delta = e.clientX - lastX.current;
    offsetRef.current += delta * 0.5;
    lastX.current = e.clientX;
  };

  const handlePointerUp = () => {
    if (!interactive) return;
    isDragging.current = false;
    velocityRef.current = direction === 'left' ? -speed : speed;
  };

  // Render segments with different colors
  const renderSegments = () => {
    const allSegments: React.ReactNode[] = [];
    for (let i = 0; i < repeatCount; i++) {
      segments.forEach((segment, idx) => {
        allSegments.push(
          <tspan
            key={`${i}-${idx}`}
            className={segment.isNumber ? 'curved-loop-number' : 'curved-loop-label'}
          >
            {segment.text}
          </tspan>
        );
      });
    }
    return allSegments;
  };

  return (
    <div className={`curved-loop-container ${className}`}>
      <svg
        ref={svgRef}
        className="curved-loop-svg"
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        preserveAspectRatio="xMidYMid slice"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <defs>
          <path id={pathIdRef.current} d={curvePath} fill="none" />
        </defs>
        <text ref={textRef} className="curved-loop-text">
          <textPath href={`#${pathIdRef.current}`} startOffset="0">
            {renderSegments()}
          </textPath>
        </text>
      </svg>
    </div>
  );
}
