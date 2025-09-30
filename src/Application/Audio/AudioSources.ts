import AudioManager from './AudioManager';
import * as THREE from 'three';
import UIEventBus from '../UI/EventBus';
import { Vector3 } from 'three';

export class AudioSource {
    manager: AudioManager;

    constructor(manager: AudioManager) {
        this.manager = manager;
    }

    update() {}
}
export class ComputerAudio extends AudioSource {
    lastKey: string;

    constructor(manager: AudioManager) {
        super(manager);

        document.addEventListener('mousedown', (event) => {
            // @ts-ignore
            if (event.inComputer) {
                this.manager.playAudio('mouseDown', {
                    volume: 0.8,
                    position: new THREE.Vector3(800, -300, 1200),
                });
            }
        });

        document.addEventListener('mouseup', (event) => {
            // @ts-ignore
            if (event.inComputer) {
                this.manager.playAudio('mouseUp', {
                    volume: 0.8,
                    position: new THREE.Vector3(800, -300, 1200),
                });
            }
        });

        document.addEventListener('keyup', (event) => {
            // @ts-ignore
            if (event.inComputer) {
                this.lastKey = '';
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key.includes('_AUTO_')) {
                this.manager.playAudio('ccType', {
                    volume: 0.1,
                    randDetuneScale: 0,
                    pitch: 20,
                });
                return;
            }
            if (this.lastKey === event.key) return;
            this.lastKey = event.key;

            // @ts-ignore
            if (event.inComputer) {
                this.manager.playAudio('keyboardKeydown', {
                    volume: 0.8,
                    position: new THREE.Vector3(-300, -400, 1200),
                });
            }
        });
    }
}

export class AmbienceAudio extends AudioSource {
    poolKey: string;
    private lastUpdateTime: number = 0;
    private updateInterval: number = 100; // milliseconds
    private currentFreq: number = 100; // Initial frequency
    private currentVolume: number = 0.05; // Initial volume
    private interpolationFactor: number = 0.1; // How quickly to interpolate

    constructor(manager: AudioManager) {
        super(manager);
        UIEventBus.on('loadingScreenDone', () => {
            this.poolKey = this.manager.playAudio('office', {
                volume: this.currentVolume,
                loop: true,
                randDetuneScale: 0,
                filter: {
                    type: 'lowpass',
                    frequency: this.currentFreq,
                },
            });
            this.manager.playAudio('startup', {
                volume: 0.4,
                randDetuneScale: 0,
            });
        });
    }

    mapValues(
        input: number,
        input_start: number,
        input_end: number,
        output_start: number,
        output_end: number
    ) {
        return (
            output_start +
            ((output_end - output_start) / (input_end - input_start)) *
                (input - input_start)
        );
    }

    update() {
        const currentTime = this.manager.application.time.elapsed;

        if (currentTime - this.lastUpdateTime < this.updateInterval) {
            return;
        }

        this.lastUpdateTime = currentTime;

        const cameraPosition =
            this.manager.application.camera.instance.position;
        const y = cameraPosition.y;
        const x = cameraPosition.x;
        const z = cameraPosition.z;

        // calculate distance to origin
        const distance = Math.sqrt(x * x + y * y + z * z);

        const targetFreq = this.mapValues(distance, 0, 10000, 100, 22000);
        const targetVolume = Math.min(Math.max(this.mapValues(distance, 1200, 10000, 0, 0.2), 0.05), 0.1);

        // Interpolate current values towards target values
        this.currentFreq = this.currentFreq + (targetFreq - this.currentFreq) * this.interpolationFactor;
        this.currentVolume = this.currentVolume + (targetVolume - this.currentVolume) * this.interpolationFactor;

        this.manager.setAudioFilterFrequency(this.poolKey, this.currentFreq - 3000);
        this.manager.setAudioVolume(this.poolKey, this.currentVolume);
    }
}

export class RadioAudio extends AudioSource {
    private currentKey: string | null = null;
    private isOn: boolean = false;
    private playlist: string[] = ['radio1', 'radio2', 'radio3'];

    constructor(manager: AudioManager) {
        super(manager);
        UIEventBus.on('radioToggle', (on: boolean) => {
            if (on) {
                this.start();
            } else {
                this.stop();
            }
        });
        UIEventBus.on('radioNext', () => {
            if (this.isOn) this.next();
        });
    }

    private start() {
        this.isOn = true;
        this.playRandom();
    }

    private stop() {
        this.isOn = false;
        if (this.currentKey) {
            this.manager.stopAudio(this.currentKey);
            this.currentKey = null;
        }
    }

    private next() {
        if (!this.isOn) return;
        this.playRandom();
    }

    private playRandom() {
        const pick = this.playlist[Math.floor(Math.random() * this.playlist.length)];
        this.currentKey = this.manager.playAudio(pick, {
            volume: 0.4,
            randDetuneScale: 0,
            loop: true,
            position: new THREE.Vector3(200, -300, 900),
        });
    }
}
