import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';

interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

interface DropdownMenuContentProps {
  children: React.ReactNode;
  className?: string;
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

interface DropdownMenuLabelProps {
  children: React.ReactNode;
  className?: string;
}

interface DropdownMenuSeparatorProps {
  className?: string;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div ref={dropdownRef} className="relative">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === DropdownMenuTrigger) {
            const triggerElement = child as React.ReactElement<React.ComponentProps<typeof DropdownMenuTrigger>>;
            return React.cloneElement(triggerElement, { onClick: toggleDropdown });
          }
        }
        return child;
      })}
      
      {isOpen && (
        <div className="absolute top-full left-0 z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-200 bg-white p-1 text-slate-950 shadow-md" style={{ marginTop: '4px' }}>
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child) && child.type === DropdownMenuContent) {
              return child;
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
};

const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps & { onClick?: () => void }> = ({ 
  children, 
  className,
  style,
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-slate-100 focus:text-slate-900",
        className
      )}
      style={style}
    >
      {children}
    </button>
  );
};

const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  );
};

const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({ 
  children, 
  className,
  onClick 
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 focus:bg-slate-100 focus:text-slate-900",
        className
      )}
    >
      {children}
    </button>
  );
};

const DropdownMenuLabel: React.FC<DropdownMenuLabelProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn("px-2 py-1.5 text-sm font-semibold", className)}>
      {children}
    </div>
  );
};

const DropdownMenuSeparator: React.FC<DropdownMenuSeparatorProps> = ({ 
  className 
}) => {
  return (
    <div className={cn("mx-1 my-1 h-px bg-slate-100", className)} />
  );
};

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
};

