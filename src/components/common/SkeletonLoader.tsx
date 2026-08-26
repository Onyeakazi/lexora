import React from 'react';

interface SkeletonProps {
  height?: string;
  width?: string;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({
  height = '1rem',
  width = '100%',
  className = ''
}) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ height, width, marginBottom: '0.5rem' }}
    />
  );
};

export const WordDetailsSkeleton: React.FC = () => {
  return (
    <div style={{ padding: '1rem 0' }}>
      <SkeletonLoader height="3rem" width="60%" />
      <SkeletonLoader height="1.25rem" width="30%" />
      <div style={{ height: '1.5rem' }} />
      <SkeletonLoader height="4rem" width="100%" />
      <SkeletonLoader height="4rem" width="100%" />
      <div style={{ height: '1rem' }} />
      <SkeletonLoader height="2rem" width="40%" />
      <SkeletonLoader height="1.5rem" width="90%" />
      <SkeletonLoader height="1.5rem" width="85%" />
    </div>
  );
};
