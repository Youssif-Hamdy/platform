import React, { useEffect, useRef, useState, memo } from 'react';

export const LazySection: React.FC<{ children: React.ReactNode; rootMargin?: string }> = memo(({ children, rootMargin = '200px' }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current || visible) return;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [visible, rootMargin]);

  return <div ref={ref}>{visible ? children : null}</div>;
});

export const Stars: React.FC<{ avg: number; className?: string }> = memo(({ avg, className }) => {
  const fullStars = Math.floor(avg);
  const hasHalf = avg - fullStars >= 0.5;
  return (
    <div className={`flex items-center ${className || ''}`}>
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < fullStars || (i === fullStars && hasHalf);
        return (
          <svg
            key={i}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`${filled ? 'text-amber-400' : 'text-gray-300'} w-4 h-4 ml-0.5`}
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.95-.69l1.07-3.292z" />
          </svg>
        );
      })}
    </div>
  );
});





