import React, { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CustomTimePickerProps {
  value: string; // "HH:mm" in 24h
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export const CustomTimePicker: React.FC<CustomTimePickerProps> = ({
  value,
  onChange,
  placeholder = '12:00 AM',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [renderOpen, setRenderOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse value to h, m, ampm
  let initH = '12';
  let initM = '00';
  let initAmpm = 'AM';
  
  if (value) {
    const [vh, vm] = value.split(':').map(Number);
    initAmpm = vh >= 12 ? 'PM' : 'AM';
    const h12 = vh % 12 || 12;
    initH = h12 < 10 ? `0${h12}` : `${h12}`;
    initM = vm < 10 ? `0${vm}` : `${vm}`;
  }

  const [hour, setHour] = useState(initH);
  const [minute, setMinute] = useState(initM);
  const [ampm, setAmpm] = useState(initAmpm);

  useEffect(() => {
    if (value) {
      const [vh, vm] = value.split(':').map(Number);
      const am = vh >= 12 ? 'PM' : 'AM';
      const h12 = vh % 12 || 12;
      setHour(h12 < 10 ? `0${h12}` : `${h12}`);
      setMinute(vm < 10 ? `0${vm}` : `${vm}`);
      setAmpm(am);
    }
  }, [value]);

  useEffect(() => {
    if (isOpen) {
      setRenderOpen(true);
      setIsClosing(false);
    } else if (renderOpen) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setRenderOpen(false);
        setIsClosing(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, renderOpen]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  const updateTime = (h: string, m: string, a: string) => {
    let h24 = parseInt(h, 10);
    if (a === 'PM' && h24 !== 12) h24 += 12;
    if (a === 'AM' && h24 === 12) h24 = 0;
    
    const formattedH = h24 < 10 ? `0${h24}` : `${h24}`;
    onChange(`${formattedH}:${m}`);
  };

  const handleHourSelect = (h: string) => {
    setHour(h);
    updateTime(h, minute, ampm);
  };
  
  const handleMinuteSelect = (m: string) => {
    setMinute(m);
    updateTime(hour, m, ampm);
  };
  
  const handleAmpmSelect = (a: string) => {
    setAmpm(a);
    updateTime(hour, minute, a);
  };

  const hours = Array.from({ length: 12 }, (_, i) => {
    const h = i + 1;
    return h < 10 ? `0${h}` : `${h}`;
  });
  
  const minutes = Array.from({ length: 60 }, (_, i) => {
    return i < 10 ? `0${i}` : `${i}`;
  });

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white border border-borderToken text-[13px] font-medium text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-sm transition-all"
      >
        <div className="flex items-center gap-2.5">
          <Clock size={16} className="text-mutedText" />
          <span className={value ? 'text-foreground' : 'text-mutedText/60'}>
            {value ? `${hour}:${minute} ${ampm}` : placeholder}
          </span>
        </div>
        <Clock size={14} className="text-mutedText opacity-0" />
      </button>

      {renderOpen && (
        <div 
          className={`absolute left-0 right-0 top-[calc(100%+6px)] bg-card rounded-2xl shadow-float border border-borderToken z-50 flex overflow-hidden p-1 ${
            isClosing ? 'animate-popup-exit' : 'animate-popup-enter'
          }`}
          onClick={e => e.stopPropagation()}
        >
          {/* Hours */}
          <div className="flex-1 flex flex-col h-48 overflow-y-auto [scrollbar-width:none]">
            {hours.map(h => (
              <button
                key={`h-${h}`}
                type="button"
                onClick={() => handleHourSelect(h)}
                className={`py-2 text-[13px] rounded-lg transition-colors ${
                  hour === h ? 'bg-card-muted font-bold text-foreground' : 'text-textSecondary hover:bg-card-subtle'
                }`}
              >
                {h}
              </button>
            ))}
          </div>
          
          {/* Minutes */}
          <div className="flex-1 flex flex-col h-48 overflow-y-auto [scrollbar-width:none] border-l border-borderToken">
            {minutes.map(m => (
              <button
                key={`m-${m}`}
                type="button"
                onClick={() => handleMinuteSelect(m)}
                className={`py-2 text-[13px] rounded-lg transition-colors ${
                  minute === m ? 'bg-card-muted font-bold text-foreground' : 'text-textSecondary hover:bg-card-subtle'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* AM/PM */}
          <div className="flex-1 flex flex-col h-48 overflow-y-auto [scrollbar-width:none] border-l border-borderToken">
            {['AM', 'PM'].map(a => (
              <button
                key={`a-${a}`}
                type="button"
                onClick={() => handleAmpmSelect(a)}
                className={`py-2 text-[13px] rounded-lg transition-colors ${
                  ampm === a ? 'bg-card-muted font-bold text-foreground' : 'text-textSecondary hover:bg-card-subtle'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
