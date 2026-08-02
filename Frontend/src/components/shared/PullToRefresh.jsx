import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

const PullToRefresh = ({ onRefresh, children }) => {
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef(null);
  const controls = useAnimation();

  const maxPull = 120;
  const threshold = 70;

  const handleTouchStart = (e) => {
    // Only pull to refresh when at the top of the page
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e) => {
    if (!isPulling || isRefreshing) return;
    const y = e.touches[0].clientY;
    const pullDistance = Math.max(0, y - startY);
    
    if (pullDistance > 0) {
      setCurrentY(Math.min(pullDistance, maxPull));
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;
    setIsPulling(false);
    
    if (currentY >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      controls.start({ y: 50, transition: { duration: 0.2 } });
      await onRefresh();
      setIsRefreshing(false);
      controls.start({ y: 0, transition: { duration: 0.3 } });
    } else {
      controls.start({ y: 0, transition: { duration: 0.2 } });
    }
    setCurrentY(0);
  };

  useEffect(() => {
    if (isPulling) {
      // Add resistance to the pull
      controls.set({ y: currentY * 0.4 });
    }
  }, [currentY, isPulling, controls]);

  return (
    <div 
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ 
        minHeight: '100%', 
        position: 'relative', 
        touchAction: currentY > 0 ? 'pan-x' : 'auto' 
      }}
    >
      <motion.div 
        animate={controls}
        style={{
          position: 'absolute',
          top: -50,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 50,
          pointerEvents: 'none'
        }}
      >
        <div 
          className="flex items-center justify-center bg-white rounded-full p-2 shadow-md border border-emerald-100"
          style={{
            opacity: currentY > 10 || isRefreshing ? 1 : 0,
            transform: `scale(${Math.min(1, Math.max(0.5, currentY / threshold))})`,
            transition: isPulling ? 'none' : 'all 0.2s ease-out'
          }}
        >
          <RefreshCw 
            size={22} 
            color="#16a34a" 
            className={isRefreshing ? "animate-spin" : ""}
            style={{ 
              transform: isPulling && !isRefreshing ? `rotate(${currentY * 3}deg)` : 'none'
            }} 
          />
        </div>
      </motion.div>
      <motion.div animate={controls} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </motion.div>
    </div>
  );
};

export default PullToRefresh;
