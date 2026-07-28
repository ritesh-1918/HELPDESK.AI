import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import useConnectionStore from '../../store/connectionStore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

/**
 * A small connection status indicator placed in the header/navbar.
 * Shows the realtime (Supabase WebSocket) connection state:
 * - Green dot: connected
 * - Yellow spin: reconnecting
 * - Red dot: disconnected
 */
const ConnectionStatusIndicator = ({ showLabel = false }) => {
  const { status, message } = useConnectionStore();

  if (status === 'connected') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200 cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              {showLabel && (
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                  Live
                </span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-[11px]">
            <p>Connected — receiving realtime updates</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (status === 'reconnecting') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-50 border border-amber-200 cursor-default">
              <RefreshCw size={12} className="text-amber-500 animate-spin" />
              {showLabel && (
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                  Reconnecting
                </span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-[11px]">
            <p>{message || 'Reconnecting…'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Disconnected
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-50 border border-red-200 cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            {showLabel && (
              <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider">
                Offline
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-[11px] max-w-[200px]">
          <p>{message || 'Disconnected — updates may be delayed'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ConnectionStatusIndicator;
