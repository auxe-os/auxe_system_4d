import React, { useEffect, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import LoadingScreen from './components/LoadingScreen';
import HelpPrompt from './components/HelpPrompt';
import InterfaceUI from './components/InterfaceUI';
import eventBus from './EventBus';
import './style.css';
import { injectSpeedInsights } from "@vercel/speed-insights";

const App = () => {
    const [loading, setLoading] = useState(true);
    const isDebug = window.location.search.includes('debug');

    useEffect(() => {
        eventBus.on('loadingScreenDone', () => {
            setLoading(false);
        });
        injectSpeedInsights(); // Call the function here
    }, []);

    return (
        <div id="ui-app">
            {!loading && <HelpPrompt />}
            <LoadingScreen />
        </div>
    );
};

const createUI = () => {
    const container = document.getElementById('ui')!;
    // @ts-ignore
    const root: Root = createRoot(container);
    root.render(<App />);
};

const createVolumeUI = () => {
    const container = document.getElementById('ui-interactive')!;
    // @ts-ignore
    const root: Root = createRoot(container);
    root.render(<InterfaceUI />);
};

export { createUI, createVolumeUI };
