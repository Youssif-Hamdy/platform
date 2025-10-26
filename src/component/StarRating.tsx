import React, { useCallback, useMemo, useState } from 'react';

type StarRatingProps = {
  value?: number;
  defaultValue?: number;
  onChange?: (rating: number) => void;
  maxStars?: number;
  readOnly?: boolean;
  size?: number;
  colorActive?: string;
  colorInactive?: string;
  allowClear?: boolean;
  ariaLabel?: string;
  className?: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function StarRating({
  value,
  defaultValue = 0,
  onChange,
  maxStars = 5,
  readOnly = false,
  size = 28,
  colorActive = '#f5a623',
  colorInactive = '#d6d6d6',
  allowClear = true,
  ariaLabel = 'Rating',
  className,
}: StarRatingProps) {
  const isControlled = typeof value === 'number';
  const [internalValue, setInternalValue] = useState<number>(clamp(defaultValue, 0, maxStars));
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const currentValue = isControlled ? clamp(value as number, 0, maxStars) : internalValue;
  const displayValue = hoveredIndex !== null ? hoveredIndex + 1 : currentValue;

  const starIndexes = useMemo(() => Array.from({ length: maxStars }, (_, i) => i), [maxStars]);

  const commitChange = useCallback(
    (next: number) => {
      const clamped = clamp(next, 0, maxStars);
      if (!isControlled) setInternalValue(clamped);
      if (onChange) onChange(clamped);
    },
    [isControlled, maxStars, onChange]
  );

  const handleClick = useCallback(
    (index: number) => {
      if (readOnly) return;
      const next = index + 1;
      if (allowClear && next === currentValue) {
        commitChange(0);
      } else {
        commitChange(next);
      }
    },
    [allowClear, commitChange, currentValue, readOnly]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (readOnly) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        commitChange(currentValue + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        commitChange(currentValue - 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        commitChange(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        commitChange(maxStars);
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (hoveredIndex !== null) {
          handleClick(hoveredIndex);
        }
      }
    },
    [commitChange, currentValue, handleClick, hoveredIndex, maxStars, readOnly]
  );

  return (
    <div
      role={readOnly ? 'img' : 'slider'}
      aria-label={ariaLabel}
      aria-valuenow={readOnly ? undefined : currentValue}
      aria-valuemin={readOnly ? undefined : 0}
      aria-valuemax={readOnly ? undefined : maxStars}
      tabIndex={readOnly ? -1 : 0}
      onKeyDown={handleKeyDown}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        cursor: readOnly ? 'default' : 'pointer',
        userSelect: 'none',
      }}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      {starIndexes.map((index) => {
        const filled = index < displayValue;
        const fill = filled ? colorActive : colorInactive;
        return (
          <span
            key={index}
            onMouseEnter={() => !readOnly && setHoveredIndex(index)}
            onClick={() => handleClick(index)}
            aria-hidden="true"
            style={{ lineHeight: 0, display: 'inline-flex' }}
          >
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill={fill}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2l2.955 6.216 6.86.998-4.958 4.83 1.171 6.836L12 17.77l-6.028 3.11 1.171-6.836L2.185 9.214l6.86-.998L12 2z" />
            </svg>
          </span>
        );
      })}
    </div>
  );
}

















