import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: (SelectOption | string)[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select option',
  className = '',
  buttonClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isOpen]);

  const normalizedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-card-subtle hover:bg-card-muted border border-borderToken text-[13px] text-foreground font-medium transition-all duration-150 cursor-pointer text-left ${
          isOpen ? 'ring-2 ring-primary/30 border-primary bg-card' : ''
        } ${buttonClassName}`}
      >
        <span className={`truncate ${!selectedOption ? 'text-mutedText' : 'text-foreground'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={15}
          className={`text-mutedText transition-transform duration-200 ml-2 flex-shrink-0 ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] bg-card rounded-2xl shadow-float p-1 z-50 border border-borderToken animate-fade-in max-h-56 overflow-y-auto [scrollbar-width:thin]">
            {normalizedOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <div
                  key={opt.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-[13px] cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-primary-soft text-primary font-semibold'
                      : 'text-foreground hover:bg-card-subtle hover:text-primary'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check size={14} className="text-primary flex-shrink-0 ml-2" />}
                </div>
              );
            })}
          </div>
      )}
    </div>
  );
};
