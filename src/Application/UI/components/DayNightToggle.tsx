import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import UIEventBus from '../EventBus';
import { Easing } from '../Animation';

interface DayNightToggleProps {}

const DayNightToggle: React.FC<DayNightToggleProps> = ({}) => {
    const [isHovering, setIsHovering] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [isDay, setIsDay] = useState(true); // Assuming it starts as day

    const onMouseDownHandler = useCallback(
        (event: React.MouseEvent<HTMLDivElement>) => {
            setIsActive(true);
            event.preventDefault();
            setIsDay(!isDay);
        },
        [isDay]
    );

    const onMouseUpHandler = useCallback(() => {
        setIsActive(false);
    }, []);

    // Day/night toggle effects removed to avoid altering monitor visual state.
    // Kept local state for UI but we no longer dispatch a global event.
    useEffect(() => {
        // Intentionally no-op: removing global day/night effect to prevent side-effects on monitor.
    }, [isDay]);

    return (
        <div
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            style={styles.container}
            onMouseDown={onMouseDownHandler}
            onMouseUp={onMouseUpHandler}
            className="icon-control-container"
            id="prevent-click"
        >
            <motion.div
                id="prevent-click"
                style={{
                    width: window.innerWidth < 768 ? 8 : 10,
                    height: window.innerWidth < 768 ? 8 : 10,
                    background: isDay ? '#FFFF00' : '#808080', // Yellow for day, Gray for night
                    borderRadius: 2,
                }}
                animate={
                    isActive ? 'active' : isHovering ? 'hovering' : 'default'
                }
                variants={iconVars}
            />
        </div>
    );
};

const iconVars = {
    hovering: {
        opacity: 0.8,
        transition: {
            duration: 0.1,
            ease: 'easeOut',
        },
    },
    active: {
        scale: 0.8,
        opacity: 0.5,
        transition: {
            duration: 0.1,
            ease: Easing.expOut,
        },
    },
    default: {
        scale: 1,
        opacity: 1,
        transition: {
            duration: 0.2,
            ease: 'easeOut',
        },
    },
};

interface StyleSheetCSS {
    [key: string]: React.CSSProperties;
}

const styles: StyleSheetCSS = {
    container: {
        background: 'black',
        textAlign: 'center',
        display: 'flex',
        boxSizing: 'border-box',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        paddingLeft: 8,
        paddingRight: 8,
    },
};

export default DayNightToggle;
