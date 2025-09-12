import React, { useState, useEffect } from 'react';
import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import { cn } from '../lib/utils';
import { getRadixStyle } from '../lib/RadixHelper';
// import UIEventBus from '../EventBus'; // Adjust path as needed

interface RadixWrapperProps {
    trigger?: React.ReactNode;
    children?: React.ReactNode;
    onOpenChange?: (open: boolean) => void;
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
    className?: string;
}

/**
 * RadixWrapper - A template for creating Radix UI dropdown components
 * that work seamlessly with the Three.js environment
 */
const RadixWrapper: React.FC<RadixWrapperProps> = ({
    trigger,
    children,
    onOpenChange,
    side = 'bottom',
    align = 'start',
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);

    // Handle open state changes
    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        onOpenChange?.(open);
    };

    // Manage WebGL pointer events when dropdown is open
    useEffect(() => {
        const webglElement = document.getElementById('webgl');
        if (!webglElement) return;
        
        if (isOpen) {
            // Disable WebGL interactions while dropdown is open
            const originalPointerEvents = webglElement.style.pointerEvents;
            webglElement.style.pointerEvents = 'none';
            
            return () => {
                // Restore original pointer events when dropdown closes
                webglElement.style.pointerEvents = originalPointerEvents;
            };
        }
    }, [isOpen]);

    return (
        <RadixDropdown.Root onOpenChange={handleOpenChange}>
            {/* Trigger Button */}
            <RadixDropdown.Trigger asChild>
                <button
                    className={cn(
                        "flex items-center justify-center",
                        "bg-transparent border border-white/20",
                        "text-white hover:bg-white/10",
                        "transition-colors duration-150",
                        "focus:outline-none focus:ring-1 focus:ring-white/30",
                        className
                    )}
                    data-prevent-monitor="true"
                    onClick={(e) => {
                        // Prevent event from reaching WebGL canvas
                        e.stopPropagation();
                    }}
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: 9999,
                    }}
                >
                    {trigger || '⋯'}
                </button>
            </RadixDropdown.Trigger>

            {/* Content Portal */}
            <RadixDropdown.Portal>
                <RadixDropdown.Content
                    side={side}
                    align={align}
                    sideOffset={8}
                    className={cn(
                        "z-50 min-w-[8rem] rounded-md border p-1",
                        "border-white/30 bg-black text-white shadow-md",
                        "animate-in fade-in-0 zoom-in-95"
                    )}
                    style={getRadixStyle({
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                    })}
                    avoidCollisions
                    collisionPadding={8}
                    onCloseAutoFocus={(event) => {
                        // Prevent auto-focus behavior that might interfere
                        event.preventDefault();
                    }}
                    onEscapeKeyDown={(event) => {
                        // Handle escape key properly
                        event.preventDefault();
                    }}
                    onInteractOutside={(event) => {
                        // Prevent outside clicks from propagating to WebGL
                        event.stopPropagation();
                    }}
                >
                    {children}
                </RadixDropdown.Content>
            </RadixDropdown.Portal>
        </RadixDropdown.Root>
    );
};

// Example dropdown items for reference
export const DropdownItem: React.FC<{
    children: React.ReactNode;
    onSelect?: () => void;
    className?: string;
}> = ({ children, onSelect, className = '' }) => (
    <RadixDropdown.Item
        className={cn(
            "px-2 py-1.5 text-sm cursor-pointer rounded-sm",
            "hover:bg-white/10 focus:bg-white/10",
            "outline-none transition-colors duration-150",
            className
        )}
        onSelect={(e) => {
            e.preventDefault();
            onSelect?.();
            
            // Optional: Trigger typing SFX
            window.postMessage({ type: 'keydown', key: '_AUTO_' }, '*');
        }}
    >
        {children}
    </RadixDropdown.Item>
);

export const DropdownSeparator: React.FC<{
    className?: string;
}> = ({ className = '' }) => (
    <RadixDropdown.Separator
        className={cn(
            "-mx-1 my-1 h-px bg-white/20",
            className
        )}
    />
);

export const DropdownLabel: React.FC<{
    children: React.ReactNode;
    className?: string;
}> = ({ children, className = '' }) => (
    <RadixDropdown.Label
        className={cn(
            "px-2 py-1.5 text-sm font-semibold text-white/70",
            className
        )}
    >
        {children}
    </RadixDropdown.Label>
);

export default RadixWrapper;
