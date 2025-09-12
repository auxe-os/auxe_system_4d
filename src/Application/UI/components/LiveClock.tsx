import React, { useEffect, useState } from 'react';
import UIEventBus from '../EventBus';

type LiveClockProps = {
  small?: boolean;
};

const LiveClock: React.FC<LiveClockProps> = ({ small = false }) => {
  const [time, setTime] = useState<string>(() => new Date().toLocaleTimeString());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(id);
  }, []);

  // Emit a time-tick event on the event bus every minute (useful for other systems)
  useEffect(() => {
    const minuteTick = setInterval(() => {
      UIEventBus.dispatch('timeTick', { time: new Date().toISOString() });
    }, 60_000);
    return () => clearInterval(minuteTick);
  }, []);

  return (
    <div className={small ? 'text-xs font-mono' : 'text-sm font-mono'} style={{ color: 'white' }}>
      {time}
    </div>
  );
};

export default LiveClock;
