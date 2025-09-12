import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import UIEventBus from '../EventBus';
import { Easing } from '../Animation';

interface BasicToggleProps {
    label?: string;
    defaultValue?: boolean;
    onChange?: (value: boolean) => void;
    className?: string;
    size?: 'small' | 'medium' | 'large';
    variant?: 'default' | 'green' | 'red';
}

const BasicToggle: React.FC<BasicToggleProps> = ({
    label,
    defaultValue = false,
    onChange,
    className = '',
    size = 'medium',
    variant = 'default'
}) => {
    const [isActive, setIsActive] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [toggled, setToggled] = useState(defaultValue);

    // Handle click with proper event management
    const handleClick = useCallback((event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        
        setIsActive(true);
        const newValue = !toggled;
        setToggled(newValue);
        
        // Trigger callback
        onChange?.(newValue);
        
        // Dispatch to event bus for other components
        UIEventBus.dispatch('toggleChange', { 
            label: label || 'toggle', 
            value: newValue 
        });
        
        // Audio feedback
        window.postMessage({ type: 'keydown', key: '_AUTO_' }, '*');
    }, [toggled, onChange, label]);

    const handleMouseUp = useCallback(() => {
        setIsActive(false);
    }, []);

    // Size configurations
    const sizeConfig = {
        small: { width: 8, height: 8 },
        medium: { width: 10, height: 10 },
        large: { width: 12, height: 12 }
    };

    // Variant colors
    const variantColors = {
        default: toggled ? '#fff' : '#666',
        green: toggled ? '#0f0' : '#666',
        red: toggled ? '#f00' : '#666'
    };

    const iconSize = window.innerWidth < 768 
        ? sizeConfig[size].width - 2 
        : sizeConfig[size].width;

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {label && (
                <span 
                    className="font-mono text-sm select-none" 
                    style={{ color: 'white' }}
                >
                    {label}
                </span>
            )}
            
            <div
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onMouseDown={handleClick}
                onMouseUp={handleMouseUp}
                className="cursor-pointer flex items-center justify-center"
                id="prevent-click"
                data-prevent-monitor="true"
                style={{
                    background: 'black',
                    padding: 8,
                    boxSizing: 'border-box',
                }}
            >
                <motion.div
                    style={{
                        width: iconSize,
                        height: iconSize,
                        background: variantColors[variant],
                        borderRadius: 2,
                    }}
                    animate={
                        isActive ? 'active' : 
                        isHovering ? 'hovering' : 
                        'default'
                    }
                    variants={animationVars}
                />
            </div>
        </div>
    );
};

const animationVars = {
    hovering: {
        opacity: 0.8,
        transition: { 
            duration: 0.1, 
            ease: 'easeOut' 
        },
    },
    active: {
        scale: 0.9,
        opacity: 0.5,
        transition: { 
            duration: 0.1, 
            ease: Easing.expOut 
        },
    },
    default: {
        scale: 1,
        opacity: 1,
        transition: { 
            duration: 0.2, 
            ease: 'easeOut' 
        },
    },
};

export default BasicToggle;
