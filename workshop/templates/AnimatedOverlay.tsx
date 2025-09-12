import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
// import UIEventBus from '../EventBus'; // Adjust path as needed

interface AnimatedOverlayProps {
    visible: boolean;
    title?: string;
    subtitle?: string;
    children?: React.ReactNode;
    className?: string;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    animationSpeed?: number;
}

const AnimatedOverlay: React.FC<AnimatedOverlayProps> = ({
    visible,
    title = '',
    subtitle = '',
    children,
    className = '',
    position = 'top-left',
    animationSpeed = 1
}) => {
    const [titleText, setTitleText] = useState('');
    const [subtitleText, setSubtitleText] = useState('');
    const [showChildren, setShowChildren] = useState(false);
    const visibleRef = useRef(visible);

    // Typing animation function
    const typeText = (
        text: string,
        setText: React.Dispatch<React.SetStateAction<string>>,
        onComplete?: () => void
    ) => {
        let i = 0;
        const typeChar = () => {
            if (i < text.length && visibleRef.current) {
                const char = text[i];
                setText(prev => prev + char);
                
                // Trigger typing SFX for each character
                window.postMessage({ 
                    type: 'keydown', 
                    key: `_AUTO_${char}` 
                }, '*');
                
                i++;
                setTimeout(typeChar, (Math.random() * 50 + 30) * animationSpeed);
            } else if (onComplete) {
                onComplete();
            }
        };
        typeChar();
    };

    // Reset and start typing when visibility changes
    useEffect(() => {
        visibleRef.current = visible;
        
        if (visible && title) {
            setTitleText('');
            setSubtitleText('');
            setShowChildren(false);
            
            // Start typing title
            setTimeout(() => {
                typeText(title, setTitleText, () => {
                    // After title, type subtitle if provided
                    if (subtitle) {
                        setTimeout(() => {
                            typeText(subtitle, setSubtitleText, () => {
                                setTimeout(() => setShowChildren(true), 250);
                            });
                        }, 200);
                    } else {
                        setTimeout(() => setShowChildren(true), 250);
                    }
                });
            }, 100);
        } else {
            setTitleText('');
            setSubtitleText('');
            setShowChildren(false);
        }
    }, [visible, title, subtitle, animationSpeed]);

    // Position styles
    const positionStyles = {
        'top-left': { top: 16, left: 16 },
        'top-right': { top: 16, right: 16 },
        'bottom-left': { bottom: 16, left: 16 },
        'bottom-right': { bottom: 16, right: 16 },
        'center': { 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)' 
        }
    };

    if (!visible && !titleText && !subtitleText) {
        return null;
    }

    return (
        <motion.div
            className={`absolute ${className}`}
            style={{
                ...positionStyles[position],
                zIndex: 1000,
                pointerEvents: 'none'
            }}
            initial="hidden"
            animate={visible ? "visible" : "hidden"}
            variants={overlayVars}
        >
            <div style={styles.container}>
                {titleText && (
                    <div style={styles.titleContainer}>
                        <span style={styles.title}>{titleText}</span>
                        {titleText === title && (
                            <div style={styles.cursor} className="blinking-cursor" />
                        )}
                    </div>
                )}
                
                {subtitleText && (
                    <div style={styles.subtitleContainer}>
                        <span style={styles.subtitle}>{subtitleText}</span>
                        {subtitleText === subtitle && (
                            <div style={styles.cursor} className="blinking-cursor" />
                        )}
                    </div>
                )}
                
                {showChildren && children && (
                    <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        style={styles.childrenContainer}
                    >
                        {children}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

const overlayVars = {
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: 'easeOut',
        },
    },
    hidden: {
        opacity: 0,
        y: -8,
        transition: {
            duration: 0.2,
            ease: 'easeIn',
        },
    },
};

interface StyleSheetCSS {
    [key: string]: React.CSSProperties;
}

const styles: StyleSheetCSS = {
    container: {
        background: 'black',
        border: '1px solid white',
        padding: 8,
        paddingLeft: 16,
        paddingRight: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        minWidth: 200,
    },
    titleContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
    },
    subtitleContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
    },
    title: {
        fontFamily: 'monospace',
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
        lineHeight: '1.2',
    },
    subtitle: {
        fontFamily: 'monospace',
        fontSize: 12,
        color: '#ccc',
        lineHeight: '1.2',
    },
    cursor: {
        width: 8,
        height: 2,
        background: 'white',
    },
    childrenContainer: {
        marginTop: 8,
        paddingTop: 8,
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
    },
};

export default AnimatedOverlay;
