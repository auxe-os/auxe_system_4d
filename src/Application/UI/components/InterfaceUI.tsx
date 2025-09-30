import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import UIEventBus from '../EventBus';
import InfoOverlay from './InfoOverlay';
import LiveClock from './LiveClock';

interface InterfaceUIProps {}

const InterfaceUI: React.FC<InterfaceUIProps> = React.memo(() => {
    const [initLoad, setInitLoad] = useState(true);
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [inMonitor, setInMonitor] = useState(false);
    const [showScreenSwitcher, setShowScreenSwitcher] = useState(false);
    const interfaceRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        UIEventBus.on('loadingScreenDone', () => {
            setLoading(false);
        });

        // find element by id and set ref
        const element = document.getElementById('ui-interactive');
        if (element) {
            // @ts-ignore
            interfaceRef.current = element;
        }
    }, []);

    const initMouseDownHandler = useCallback(() => {
        setVisible(true);
        setInitLoad(false);
    }, []);

    useEffect(() => {
        if (!loading && initLoad) {
            document.addEventListener('mousedown', initMouseDownHandler);
            return () => {
                document.removeEventListener('mousedown', initMouseDownHandler);
            };
        }
    }, [loading, initLoad]);

    useEffect(() => {
        UIEventBus.on('enterMonitor', () => {
            setVisible(false);
            setInitLoad(false);
            if (interfaceRef.current) {
                interfaceRef.current.style.pointerEvents = 'none';
            }
            setInMonitor(true);
            setShowScreenSwitcher(true);
        });
        UIEventBus.on('leftMonitor', () => {
            setVisible(true);
            if (interfaceRef.current) {
                interfaceRef.current.style.pointerEvents = 'auto';
            }
            setInMonitor(false);
            setShowScreenSwitcher(false);
        });
    }, []);

    // Non-invasive portal mount into #ui-interactive
    const interactivePortal =
        interfaceRef.current && !loading
            ? createPortal(
                  <>
                      <div style={{ position: 'absolute', right: 16, top: 16, pointerEvents: 'auto' }} id="prevent-click">
                          <LiveClock small />
                      </div>

                      {showScreenSwitcher && (
                          <div 
                              style={{ 
                                  position: 'absolute', 
                                  right: 16, 
                                  bottom: 64, 
                                  pointerEvents: 'auto',
                                  zIndex: 999,
                              }} 
                              id="prevent-click"
                              data-prevent-monitor="true"
                          >
                              {/* Screen switcher controls would go here */}
                          </div>
                      )}
                  </>,
                  interfaceRef.current
              )
            : null;

    // Reverted: remove bottom monitor-navigation buttons and event dispatch

    return !loading ? (
        <>
            <motion.div
                initial="hide"
                variants={vars}
                animate={visible ? 'visible' : 'hide'}
                style={styles.wrapper}
                className="interface-wrapper"
                id="prevent-click"
            >
                <InfoOverlay visible={visible} />
            </motion.div>
            {interactivePortal}
        </>
    ) : (
        <></>
    );
});

const vars = {
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.5,
            delay: 0.3,
            ease: 'easeOut',
        },
    },
    hide: {
        x: -32,
        opacity: 0,
        transition: {
            duration: 0.3,
            ease: 'easeOut',
        },
    },
};

interface StyleSheetCSS {
    [key: string]: React.CSSProperties;
}

const styles: StyleSheetCSS = {
    wrapper: {
        width: '100%',
        display: 'flex',
        position: 'absolute',
        boxSizing: 'border-box',
    },
    
    bottomBar: {
        position: 'absolute',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        pointerEvents: 'auto',
        background: 'rgba(0,0,0,0.6)',
        padding: 6,
        border: '1px solid #fff',
    },
    iconButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        borderRadius: 9999,
        background: '#000',
        color: '#fff',
        border: '1px solid #fff',
        cursor: 'pointer',
    },
    iconLabel: {
        fontSize: 12,
        lineHeight: '12px',
        color: '#fff',
    },
};

export default InterfaceUI;
