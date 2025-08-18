import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import UIEventBus from '../EventBus';
import { Easing } from '../Animation';

const RadioToggle: React.FC<{}> = ({}) => {
    const [isHovering, setIsHovering] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [on, setOn] = useState(false);

    const onMouseDownHandler = useCallback((event) => {
        setIsActive(true);
        event.preventDefault();
        setOn(!on);
    }, [on]);

    const onMouseUpHandler = useCallback(() => {
        setIsActive(false);
    }, []);

    useEffect(() => {
        UIEventBus.dispatch('radioToggle', on);
        // typing sfx ping
        window.postMessage({ type: 'keydown', key: `_AUTO_` }, '*');
    }, [on]);

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
                    background: on ? '#0f0' : '#fff',
                    borderRadius: 2,
                }}
                animate={isActive ? 'active' : isHovering ? 'hovering' : 'default'}
                variants={iconVars}
            />
        </div>
    );
};

const iconVars = {
    hovering: {
        opacity: 0.8,
        transition: { duration: 0.1, ease: 'easeOut' },
    },
    active: {
        scale: 0.9,
        opacity: 0.5,
        transition: { duration: 0.1, ease: Easing.expOut },
    },
    default: {
        scale: 1,
        opacity: 1,
        transition: { duration: 0.2, ease: 'easeOut' },
    },
};

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

export default RadioToggle;


