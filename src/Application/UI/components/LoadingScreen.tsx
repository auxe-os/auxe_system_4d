import React, { useCallback, useEffect, useRef, useState } from 'react';
import eventBus from '../EventBus';

type LoadingProps = {};

const ASCII_LOGO = `
    _   __  __  _  _  ____
   / \  \ \/ / | \| |/ ___|
  / _ \  \  /  | .  | |
 / ___ \ /  \  | |\  | |___
/_/   \_\_/\_\ |_| \_|\____|
`;

const LoadingScreen: React.FC<LoadingProps> = () => {
    // State for loading progress
    const [progress, setProgress] = useState(0);
    const [toLoad, setToLoad] = useState(0);
    const [loaded, setLoaded] = useState(0);
    const progressRef = useRef(0);
    const [displayProgress, setDisplayProgress] = useState(0);
    const animationFrameIdRef = useRef<number | null>(null);

    // State for UI animations and visibility
    const [overlayOpacity, setLoadingOverlayOpacity] = useState(1);
    const [loadingTextOpacity, setLoadingTextOpacity] = useState(1);
    const [startPopupOpacity, setStartPopupOpacity] = useState(0);
    const [webGLErrorOpacity, setWebGLErrorOpacity] = useState(0);
    const [doneLoading, setDoneLoading] = useState(false);
    const [webGLError, setWebGLError] = useState(false);

    // State for the boot sequence
    const [showBiosInfo, setShowBiosInfo] = useState(false);
    const [showLoadingResources, setShowLoadingResources] = useState(false);
    const [resources, setResources] = useState<string[]>([]);

    useEffect(() => {
        eventBus.on('loadedSource', (data) => {
            setProgress(data.progress);
            setToLoad(data.toLoad);
            setLoaded(data.loaded);

            setResources((prevResources) => {
                const newResources = [
                    ...prevResources,
                    `Loaded ${data.sourceName}${getSpace(
                        data.sourceName
                    )} ... ${Math.round(data.progress * 100)}%`,
                ];
                if (newResources.length > 8) {
                    newResources.shift();
                }
                return newResources;
            });
        });
    }, []);

    const [mobileWarning, setMobileWarning] = useState(window.innerWidth < 768);

    useEffect(() => {
        if (progress >= 1 && !webGLError) {
            setDoneLoading(true);

            setTimeout(() => {
                setLoadingTextOpacity(0);
                setTimeout(() => {
                    setStartPopupOpacity(1);
                }, 500);
            }, 1000);
        }
    }, [progress]);

    useEffect(() => {
        if (webGLError) {
            setTimeout(() => {
                setWebGLErrorOpacity(1);
            }, 500);
        }
    }, [webGLError]);
    
    useEffect(() => {
        const loop = () => {
            const target = progressRef.current;
            setDisplayProgress((currentDisplayProgress: number) => {
                const diff = target - currentDisplayProgress;
                
                if (Math.abs(diff) < 0.001) {
                    if (target >= 1) {
                         if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
                        return 1;
                    }
                    return target;
                }
                
                const newDisplayProgress = currentDisplayProgress + diff * 0.1;
                return newDisplayProgress;
            });
            animationFrameIdRef.current = requestAnimationFrame(loop);
        };
        animationFrameIdRef.current = requestAnimationFrame(loop);
        return () => {
            if(animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
        };
    }, []);

    const start = useCallback(() => {
        setLoadingOverlayOpacity(0);
        
        // Create and resume AudioContext directly on user gesture
        // This needs to be in a user-triggered event handler to avoid browser warnings
        try {
            const AudioContext =
                // @ts-ignore
                window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContext();
            // Ensure we resume in the same call stack as the user gesture
            audioContext.resume().then(() => {
                console.log('AudioContext resumed successfully');
                eventBus.dispatch('audioContextResumed', { context: audioContext });
            }).catch(err => {
                console.warn('Failed to resume AudioContext:', err);
            });
        } catch (err) {
            console.error('Error initializing AudioContext:', err);
        }

        eventBus.dispatch('loadingScreenDone', {});
        const ui = document.getElementById('ui');
        if (ui) ui.style.pointerEvents = 'none';
    }, []);

    const getSpace = (sourceName: string) => {
        let spaces = '';
        for (let i = 0; i < 24 - sourceName.length; i++) spaces += '\xa0';
        return spaces;
    };

    const getCurrentDate = () => {
        const date = new Date();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();
        const monthFormatted = month < 10 ? `0${month}` : month;
        const dayFormatted = day < 10 ? `0${day}` : day;
        return `${monthFormatted}/${dayFormatted}/${year}`;
    };

    const detectWebGLContext = () => {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return gl instanceof WebGLRenderingContext;
    };

    return (
        <div
            style={Object.assign({}, styles.overlay, { opacity: overlayOpacity, transform: `scale(${overlayOpacity === 0 ? 1.1 : 1})` })}
            className="scan-lines"
        >
            {startPopupOpacity === 0 && loadingTextOpacity === 0 && (
                <div style={styles.blinkingContainer}>
                    <span className="blinking-cursor" />
                </div>
            )}
            {!webGLError && (
                <div
                    style={Object.assign({}, styles.overlayText, {
                        opacity: loadingTextOpacity,
                    })}
                >
                    <div
                        style={styles.header}
                        className="loading-screen-header"
                    >
                        <div style={styles.logoContainer}>
                            <div>
                                <p style={styles.green}>
                                    <b>auxeOS,</b>{' '}
                                </p>
                                <p style={styles.green}>
                                    <b></b>
                                </p>
                            </div>
                        </div>
                        <div style={styles.headerInfo}>
                            <p>Released: 01/13/2000</p>
                            <p>auxeOSBIOS (C)2000 auxeOS Inc.,</p>
                        </div>
                    </div>
                    <div style={styles.body} className="loading-screen-body">
                        <p>HSP S13 2000-2022 Special UC131S</p>
                        <div style={styles.spacer} />
                        {showBiosInfo && (
                            <>
                                <p>HSP Showcase(tm) XX 113</p>
                                <p>Checking RAM : {14000} OK</p>
                                <div style={styles.spacer} />
                                <div style={styles.spacer} />
                                {showLoadingResources ? (
                                    progress == 1 ? (
                                        <p>FINISHED LOADING RESOURCES</p>
                                    ) : (
                                        <p className="loading">
                                            LOADING RESOURCES ({loaded}/
                                            {toLoad === 0 ? '-' : toLoad})
                                        </p>
                                    )
                                ) : (
                                    <p className="loading">WAIT</p>
                                )}
                            </>
                        )}
                        <div style={styles.spacer} />
                        <div style={styles.resourcesLoadingList}>
                            {resources.map((sourceName) => (
                                <p key={sourceName}>{sourceName}</p>
                            ))}
                        </div>
                        <div style={styles.spacer} />
                        {showLoadingResources && doneLoading && (
                            <p>
                                All Content Loaded, launching{' '}
                                <b style={styles.green}>
                                    'auxeOS'
                                </b>{' '}
                                V1.0
                            </p>
                        )}
                        <div style={styles.spacer} />
                        <span className="blinking-cursor" />
                    </div>
                    <div
                        style={styles.footer}
                        className="loading-screen-footer"
                    >
                        <p>
                            Press <b>DEL</b> to enter SETUP , <b>ESC</b> to skip
                            memory test
                        </p>
                        <p>{getCurrentDate()}</p>
                    </div>
                </div>
            )}
            <div
                style={Object.assign({}, styles.popupContainer, {
                    opacity: startPopupOpacity,
                })}
            >
                <div style={styles.startPopup}>
                    {/* <p style={styles.red}>
                        <b>THIS SITE IS CURRENTLY A W.I.P.</b>
                    </p>
                    <p>But do enjoy what I have done so far :)</p>
                    <div style={styles.spacer} />
                    <div style={styles.spacer} /> */}
                    <p>auxe OS</p>
                    {mobileWarning && (
                        <>
                            <br />
                            <b>
                                <p style={styles.warning}>
                                    WARNING: This experience is best viewed on
                                </p>
                                <p style={styles.warning}>
                                    a desktop or laptop computer.
                                </p>
                            </b>
                            <br />
                        </>
                    )}
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <p>Click start to begin{'\xa0'}</p>
                        <span className="blinking-cursor" />
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginTop: '16px',
                        }}
                    >
                        <div className="bios-start-button" onClick={start}>
                            <p>START</p>
                        </div>
                    </div>
                </div>
            </div>
            {webGLError && (
                <div
                    style={Object.assign({}, styles.popupContainer, {
                        opacity: webGLErrorOpacity,
                    })}
                >
                    <div style={styles.startPopup}>
                        <p>
                            <b style={{ color: 'red' }}>CRITICAL ERROR:</b> No
                            WebGL Detected
                        </p>
                        <div style={styles.spacer} />
                        <div style={styles.spacer} />

                        <p>WebGL is required to run this site.</p>
                        <p>
                            Please enable it or switch to a browser which
                            supports WebGL
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

// ... styles remain the same
const styles: StyleSheetCSS = {
    overlay: {
        backgroundColor: 'black',
        width: '100%',
        height: '100%',
        display: 'flex',
        transition: 'opacity 0.2s, transform 0.2s',
        MozTransition: 'opacity 0.2s, transform 0.2s',
        WebkitTransition: 'opacity 0.2s, transform 0.2s',
        OTransition: 'opacity 0.2s, transform 0.2s',
        msTransition: 'opacity 0.2s, transform 0.2s',

        transitionTimingFunction: 'ease-in-out',
        MozTransitionTimingFunction: 'ease-in-out',
        WebkitTransitionTimingFunction: 'ease-in-out',
        OTransitionTimingFunction: 'ease-in-out',
        msTransitionTimingFunction: 'ease-in-out',

        boxSizing: 'border-box',
        fontSize: 16,
        letterSpacing: 0.8,
    },

    spacer: {
        height: 16,
    },
    header: {
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'row',
    },
    popupContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    warning: {
        color: 'yellow',
    },
    blinkingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        boxSizing: 'border-box',
        padding: 48,
    },
    loginContainer: {
        padding: 48,
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
    },
    startPopup: {
        backgroundColor: '#000',
        padding: 24,
        border: '7px solid #fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        maxWidth: 500,
    },
    headerInfo: {
        marginLeft: 64,
    },
    green: {
        color: '#00ff00',
    },
    link: {
        color: '#4598ff',
        cursor: 'pointer',
    },
    overlayText: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    body: {
        flex: 1,
        display: 'flex',
        width: '100%',
        boxSizing: 'border-box',
        flexDirection: 'column',
    },
    logoContainer: {
        display: 'flex',
        flexDirection: 'row',
    },
    resourcesLoadingList: {
        display: 'flex',
        paddingLeft: 32,
        paddingBottom: 32,
        flexDirection: 'column',
    },
    logoImage: {
        width: 64,
        height: 42,
        imageRendering: 'pixelated',
        marginRight: 16,
    },
    footer: {
        boxSizing: 'border-box',
        width: '100%',
    },
    ascii: {
        color: '#00ff00',
        fontSize: 10,
        lineHeight: '10px',
    }
};

export default LoadingScreen;
