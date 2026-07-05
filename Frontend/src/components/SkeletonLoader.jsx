import React from 'react';

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const skeletons = {
    card: (
      <div className="skeleton-card" style={{
        background: 'linear-gradient(90deg, #1a1a2e 25%, #2a2a3e 50%, #1a1a2e 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        borderRadius: '8px',
        padding: '20px',
        margin: '10px 0',
        height: '120px'
      }} />
    ),
    list: (
      <div className="skeleton-list" style={{
        background: 'linear-gradient(90deg, #1a1a2e 25%, #2a2a3e 50%, #1a1a2e 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        borderRadius: '4px',
        padding: '10px',
        margin: '5px 0',
        height: '40px'
      }} />
    ),
  };

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>{skeletons[type] || skeletons.card}</div>
      ))}
    </>
  );
};

export default SkeletonLoader;
