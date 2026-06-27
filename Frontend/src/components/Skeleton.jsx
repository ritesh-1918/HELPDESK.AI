import React from 'react';

export const Skeleton = ({ className = '', style = {} }) => (
  <div
    style={{
      background: '#f1f5f9',
      borderRadius: '6px',
      position: 'relative',
      overflow: 'hidden',
      ...style
    }}
    className={className}
  >
    <div style={{
      position: 'absolute',
      inset: 0,
      transform: 'translateX(-100%)',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
      animation: 'shimmer 1.5s infinite'
    }} />
    <style>{`
      @keyframes shimmer {
        100% { transform: translateX(100%); }
      }
    `}</style>
  </div>
);

export const StatCardSkeleton = () => (
  <div style={{
    background: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #F0FDF4',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)',
    padding: '24px 28px',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <Skeleton style={{ width: '80px', height: '12px', marginBottom: '8px' }} />
        <Skeleton style={{ width: '120px', height: '36px', marginBottom: '6px' }} />
        <Skeleton style={{ width: '100px', height: '12px' }} />
      </div>
      <Skeleton style={{ width: '40px', height: '40px', borderRadius: '12px' }} />
    </div>
  </div>
);

export const TicketTableSkeleton = ({ count = 10 }) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse">
      <thead>
        <tr style={{ background: '#f8faf9', borderBottom: '1px solid #f0fdf4' }}>
          {['Ticket ID', 'Ticket Info', 'Category', 'Priority', 'Assigned Team', 'Status'].map((h, i) => (
            <th key={i} style={{ padding: '14px 24px', textAlign: 'left', fontSize: '10px', color: '#9ca3af', letterSpacing: '0.1em', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...Array(count)].map((_, i) => (
          <tr key={i} style={{ borderBottom: '1px solid #f9fafb' }}>
            <td style={{ padding: '14px 24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <Skeleton style={{ width: '80px', height: '14px' }} />
                <Skeleton style={{ width: '120px', height: '10px' }} />
              </div>
            </td>
            <td style={{ padding: '14px 24px' }}>
              <div className="flex items-center gap-3">
                <Skeleton style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '220px' }}>
                  <Skeleton style={{ width: '180px', height: '14px' }} />
                  <Skeleton style={{ width: '100px', height: '10px' }} />
                </div>
              </div>
            </td>
            <td style={{ padding: '14px 24px' }}>
              <Skeleton style={{ width: '120px', height: '24px', borderRadius: '8px' }} />
            </td>
            <td style={{ padding: '14px 24px' }}>
              <Skeleton style={{ width: '80px', height: '24px', borderRadius: '100px' }} />
            </td>
            <td style={{ padding: '14px 24px' }}>
              <div className="flex items-center gap-2">
                <Skeleton style={{ width: '28px', height: '28px', borderRadius: '8px' }} />
                <Skeleton style={{ width: '100px', height: '12px' }} />
              </div>
            </td>
            <td style={{ padding: '14px 24px' }}>
              <Skeleton style={{ width: '100px', height: '24px', borderRadius: '100px' }} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
