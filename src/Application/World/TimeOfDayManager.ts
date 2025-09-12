import * as THREE from 'three';
import Application from '../Application';
import Time from '../Utils/Time';
import UIEventBus from '../UI/EventBus';

interface TimeOfDayKeyframe {
    time: number; // Hour of the day (0-24)
    directionalLightColor: THREE.Color;
    directionalLightIntensity: number;
    directionalLightPosition: THREE.Vector3;
    ambientLightColor: THREE.Color;
    ambientLightIntensity: number;
}

interface LightSettings {
    directionalLightColor: THREE.Color;
    directionalLightIntensity: number;
    directionalLightPosition: THREE.Vector3;
    ambientLightColor: THREE.Color;
    ambientLightIntensity: number;
}

export default class TimeOfDayManager {
    application: Application;
    scene: THREE.Scene;
    time: Time;

    directionalLight: THREE.DirectionalLight;
    ambientLight: THREE.AmbientLight;

    public simulatedTimeScale: number = 60; // 1 minute in real-time = 1 hour in simulated time (adjust as needed)
    public isPaused: boolean = false;
    public currentTimeInDay: number = 0;
    public manualTimeOfDay: 'auto' | 'day' | 'night' = 'auto';

    private DAY_LIGHT_SETTINGS: LightSettings = {
        directionalLightColor: new THREE.Color(0xffffff),
        directionalLightIntensity: 1.5,
        directionalLightPosition: new THREE.Vector3(0, 10000, 0),
        ambientLightColor: new THREE.Color(0x808080),
        ambientLightIntensity: 0.8,
    };

    private NIGHT_LIGHT_SETTINGS: LightSettings = {
        directionalLightColor: new THREE.Color(0x000000),
        directionalLightIntensity: 0,
        directionalLightPosition: new THREE.Vector3(0, 10000, 0),
        ambientLightColor: new THREE.Color(0x050505),
        ambientLightIntensity: 0.1,
    };

    // Keyframes for time of day
    private keyframes: TimeOfDayKeyframe[] = [
        {
            time: 0, // Midnight
            directionalLightColor: new THREE.Color(0x000000),
            directionalLightIntensity: 0,
            directionalLightPosition: new THREE.Vector3(0, 10000, 0),
            ambientLightColor: new THREE.Color(0x050505),
            ambientLightIntensity: 0.1,
        },
        {
            time: 6, // Dawn
            directionalLightColor: new THREE.Color(0xffa060),
            directionalLightIntensity: 0.8,
            directionalLightPosition: new THREE.Vector3(5000, 10000, 5000),
            ambientLightColor: new THREE.Color(0x404040),
            ambientLightIntensity: 0.4,
        },
        {
            time: 12, // Midday
            directionalLightColor: new THREE.Color(0xffffff),
            directionalLightIntensity: 1.5,
            directionalLightPosition: new THREE.Vector3(0, 10000, 0),
            ambientLightColor: new THREE.Color(0x808080),
            ambientLightIntensity: 0.8,
        },
        {
            time: 18, // Dusk
            directionalLightColor: new THREE.Color(0xff6000),
            directionalLightIntensity: 0.8,
            directionalLightPosition: new THREE.Vector3(-5000, 10000, -5000),
            ambientLightColor: new THREE.Color(0x404040),
            ambientLightIntensity: 0.4,
        },
        {
            time: 24, // End of day (same as midnight for loop)
            directionalLightColor: new THREE.Color(0x000000),
            directionalLightIntensity: 0,
            directionalLightPosition: new THREE.Vector3(0, 10000, 0),
            ambientLightColor: new THREE.Color(0x050505),
            ambientLightIntensity: 0.1,
        },
    ];

    constructor() {
        this.application = new Application();
        this.scene = this.application.scene;
        this.time = this.application.time;

        this.setupLights();

        // UIEventBus.on('dayNightToggle', (state: 'day' | 'night') => {
        //     this.manualTimeOfDay = state;
        // });
    }

    setupLights() {
        // Directional Light
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        this.directionalLight.position.set(0, 10000, 0);
        this.scene.add(this.directionalLight);

        // Ambient Light
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(this.ambientLight);
    }

    update() {
        if (this.isPaused && this.manualTimeOfDay === 'auto') return;

        let currentLightSettings: LightSettings;

        if (this.manualTimeOfDay === 'day') {
            currentLightSettings = this.DAY_LIGHT_SETTINGS;
        } else if (this.manualTimeOfDay === 'night') {
            currentLightSettings = this.NIGHT_LIGHT_SETTINGS;
        } else { // manualTimeOfDay === 'auto'
            const totalSecondsInDay = 24 * 60 * 60; // 24 hours * 60 minutes * 60 seconds
            const currentTimeInSeconds = (this.time.elapsed / 1000) * this.simulatedTimeScale;
            this.currentTimeInDay = (currentTimeInSeconds / totalSecondsInDay) * 24; // Current hour (0-24)

            let currentKeyframe: TimeOfDayKeyframe | null = null;
            let nextKeyframe: TimeOfDayKeyframe | null = null;
            let interpolationFactor = 0;

            for (let i = 0; i < this.keyframes.length - 1; i++) {
                const kf1 = this.keyframes[i];
                const kf2 = this.keyframes[i + 1];

                if (this.currentTimeInDay >= kf1.time && this.currentTimeInDay < kf2.time) {
                    currentKeyframe = kf1;
                    nextKeyframe = kf2;
                    interpolationFactor = (this.currentTimeInDay - kf1.time) / (kf2.time - kf1.time);
                    break;
                }
            }

            // Handle the wrap-around from 23:59 to 00:00
            if (!currentKeyframe && this.currentTimeInDay >= this.keyframes[this.keyframes.length - 1].time) {
                currentKeyframe = this.keyframes[this.keyframes.length - 2]; // Last actual keyframe (e.g., 18:00)
                nextKeyframe = this.keyframes[this.keyframes.length - 1]; // 24:00 (which is 00:00)
                interpolationFactor = (this.currentTimeInDay - currentKeyframe.time) / (nextKeyframe.time - currentKeyframe.time);
            }

            if (currentKeyframe && nextKeyframe) {
                currentLightSettings = {
                    directionalLightColor: new THREE.Color().lerpColors(currentKeyframe.directionalLightColor, nextKeyframe.directionalLightColor, interpolationFactor),
                    directionalLightIntensity: THREE.MathUtils.lerp(currentKeyframe.directionalLightIntensity, nextKeyframe.directionalLightIntensity, interpolationFactor),
                    directionalLightPosition: new THREE.Vector3().lerpVectors(currentKeyframe.directionalLightPosition, nextKeyframe.directionalLightPosition, interpolationFactor),
                    ambientLightColor: new THREE.Color().lerpColors(currentKeyframe.ambientLightColor, nextKeyframe.ambientLightColor, interpolationFactor),
                    ambientLightIntensity: THREE.MathUtils.lerp(currentKeyframe.ambientLightIntensity, nextKeyframe.ambientLightIntensity, interpolationFactor),
                };
            } else {
                // Fallback to a default if no keyframe is found (shouldn't happen with 0-24 range)
                currentLightSettings = this.keyframes[0];
            }
        }

        // Apply interpolated or manual settings
        this.directionalLight.color.copy(currentLightSettings.directionalLightColor);
        this.directionalLight.intensity = currentLightSettings.directionalLightIntensity;
        this.directionalLight.position.copy(currentLightSettings.directionalLightPosition);
        this.ambientLight.color.copy(currentLightSettings.ambientLightColor);
        this.ambientLight.intensity = currentLightSettings.ambientLightIntensity;
    }
}
