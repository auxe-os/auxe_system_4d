import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface FormComponentProps {
    label?: string;
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    onSubmit?: (value: string) => void;
    type?: 'text' | 'password' | 'email' | 'number';
    required?: boolean;
    disabled?: boolean;
    className?: string;
    autoFocus?: boolean;
    maxLength?: number;
}

/**
 * FormComponent - A template for creating form inputs that work
 * seamlessly with the AuxeOS Three.js environment
 */
const FormComponent: React.FC<FormComponentProps> = ({
    label,
    placeholder = '',
    value = '',
    onChange,
    onSubmit,
    type = 'text',
    required = false,
    disabled = false,
    className = '',
    autoFocus = false,
    maxLength
}) => {
    const [internalValue, setInternalValue] = useState(value);
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Handle value changes
    const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setInternalValue(newValue);
        onChange?.(newValue);
        
        // Trigger typing SFX for each character
        window.postMessage({ 
            type: 'keydown', 
            key: `_AUTO_${newValue[newValue.length - 1] || ''}` 
        }, '*');
    }, [onChange]);

    // Handle form submission
    const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            onSubmit?.(internalValue);
            
            // Audio feedback for submit
            window.postMessage({ type: 'keydown', key: '_AUTO_ENTER' }, '*');
        }
    }, [internalValue, onSubmit]);

    // Handle focus events
    const handleFocus = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
        event.stopPropagation();
        setIsFocused(true);
        
        // Disable WebGL interactions while input is focused
        const webglElement = document.getElementById('webgl');
        if (webglElement) {
            webglElement.style.pointerEvents = 'none';
        }
    }, []);

    const handleBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
        event.stopPropagation();
        setIsFocused(false);
        
        // Re-enable WebGL interactions
        const webglElement = document.getElementById('webgl');
        if (webglElement) {
            webglElement.style.pointerEvents = '';
        }
    }, []);

    // Sync internal value with prop
    useEffect(() => {
        setInternalValue(value);
    }, [value]);

    // Auto-focus if requested
    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);

    return (
        <motion.div
            className={`form-component ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            initial="default"
            animate={isFocused ? "focused" : isHovered ? "hovered" : "default"}
            variants={containerVars}
            style={styles.container}
        >
            {label && (
                <label style={styles.label}>
                    {label}
                    {required && <span style={styles.required}>*</span>}
                </label>
            )}
            
            <div style={styles.inputWrapper}>
                <input
                    ref={inputRef}
                    type={type}
                    value={internalValue}
                    placeholder={placeholder}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    disabled={disabled}
                    required={required}
                    maxLength={maxLength}
                    style={{
                        ...styles.input,
                        ...(disabled ? styles.disabled : {}),
                        ...(isFocused ? styles.focused : {})
                    }}
                    id="prevent-click"
                    data-prevent-monitor="true"
                    onClick={(e) => e.stopPropagation()}
                />
                
                {/* Visual focus indicator */}
                <motion.div
                    style={styles.focusIndicator}
                    animate={isFocused ? "visible" : "hidden"}
                    variants={indicatorVars}
                />
            </div>
        </motion.div>
    );
};

const containerVars = {
    default: {
        scale: 1,
        transition: {
            duration: 0.2,
            ease: 'easeOut',
        },
    },
    hovered: {
        scale: 1.02,
        transition: {
            duration: 0.15,
            ease: 'easeOut',
        },
    },
    focused: {
        scale: 1.02,
        transition: {
            duration: 0.15,
            ease: 'easeOut',
        },
    },
};

const indicatorVars = {
    visible: {
        opacity: 1,
        scaleX: 1,
        transition: {
            duration: 0.2,
            ease: 'easeOut',
        },
    },
    hidden: {
        opacity: 0,
        scaleX: 0,
        transition: {
            duration: 0.15,
            ease: 'easeIn',
        },
    },
};

interface StyleSheetCSS {
    [key: string]: React.CSSProperties;
}

const styles: StyleSheetCSS = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        position: 'relative',
        zIndex: 1000,
        pointerEvents: 'auto',
    },
    label: {
        fontFamily: 'monospace',
        fontSize: 12,
        color: 'white',
        fontWeight: 'bold',
        marginBottom: 4,
    },
    required: {
        color: '#ff4444',
        marginLeft: 2,
    },
    inputWrapper: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
    },
    input: {
        fontFamily: 'monospace',
        fontSize: 14,
        color: 'white',
        backgroundColor: 'black',
        border: '1px solid white',
        padding: '8px 12px',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s ease',
    },
    focused: {
        borderColor: '#00ff00',
        boxShadow: '0 0 0 1px #00ff00',
    },
    disabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
        backgroundColor: '#111',
    },
    focusIndicator: {
        position: 'absolute',
        bottom: -1,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: '#00ff00',
        transformOrigin: 'left',
    },
};

export default FormComponent;
