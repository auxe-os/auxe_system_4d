import * as THREE from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import GUI from 'lil-gui';
import Application from '../Application';
import Debug from '../Utils/Debug';
import Resources from '../Utils/Resources';
import Sizes from '../Utils/Sizes';
import Camera from '../Camera/Camera';
import EventEmitter from '../Utils/EventEmitter';
import UIEventBus from '../UI/EventBus';

const SCREEN_SIZE = { w: 1280, h: 1024 };
const IFRAME_PADDING = 32;
const IFRAME_SIZE = {
    w: SCREEN_SIZE.w - IFRAME_PADDING,
    h: SCREEN_SIZE.h - IFRAME_PADDING,
};

export default class MonitorScreen extends EventEmitter {
    application: Application;
    scene: THREE.Scene;
    cssScene: THREE.Scene;
    resources: Resources;
    debug: Debug;
    sizes: Sizes;
    debugFolder: GUI;
    screenSize: THREE.Vector2;
    position: THREE.Vector3;
    rotation: THREE.Euler;
    camera: Camera;
    prevInComputer: boolean;
    shouldLeaveMonitor: boolean;
    inComputer: boolean;
    mouseClickInProgress: boolean;
    dimmingPlane: THREE.Mesh;
    videoTextures: { [key in string]: THREE.VideoTexture };
    iframeEl?: HTMLIFrameElement;
    controlsEl?: HTMLDivElement;
    containerEl?: HTMLDivElement;


    constructor() {
        super();
        this.application = new Application();
        this.scene = this.application.scene;
        this.cssScene = this.application.cssScene;
        this.sizes = this.application.sizes;
        this.resources = this.application.resources;
        this.screenSize = new THREE.Vector2(SCREEN_SIZE.w, SCREEN_SIZE.h);
        this.camera = this.application.camera;
        this.position = new THREE.Vector3(0, 950, 255);
        this.rotation = new THREE.Euler(-3 * THREE.MathUtils.DEG2RAD, 0, 0);
        this.videoTextures = {};
        this.mouseClickInProgress = false;
        this.shouldLeaveMonitor = false;

        // Create screen
        this.initializeScreenEvents();
        this.createIframe();
        const maxOffset = this.createTextureLayers();
        this.createEnclosingPlanes(maxOffset);
        this.createPerspectiveDimmer(maxOffset);

        // Listen for UI requests to change the embedded screen URL
        UIEventBus.on('setScreenURL', (url: string) => {
            this.setScreenURL(url);
        });

        // Show/hide inline controls based on focus state
        UIEventBus.on('enterMonitor', () => {
            if (this.controlsEl) this.controlsEl.style.display = 'flex';
        });
        UIEventBus.on('leftMonitor', () => {
            if (this.controlsEl) this.controlsEl.style.display = 'none';
        });
    }

    initializeScreenEvents() {
        document.addEventListener(
            'mousemove',
            (event) => {
                // Preserve synthetic flag if present (e.g., bridged from iframe)
                // Otherwise, compute based on container bounds
                let isInComputer = (event as any).inComputer === true;
                if (!isInComputer && this.containerEl && (event as any).clientX !== undefined) {
                    const rect = this.containerEl.getBoundingClientRect();
                    const x = (event as any).clientX;
                    const y = (event as any).clientY;
                    isInComputer = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
                }

                // @ts-ignore
                event.inComputer = isInComputer;

                // Keep focus when hovering anywhere inside container (including controls)
                // @ts-ignore
                this.inComputer = event.inComputer;

                if (this.inComputer && !this.prevInComputer) {
                    this.camera.trigger('enterMonitor');
                }

                if (
                    !this.inComputer &&
                    this.prevInComputer &&
                    !this.mouseClickInProgress
                ) {
                    this.camera.trigger('leftMonitor');
                }

                if (
                    !this.inComputer &&
                    this.mouseClickInProgress &&
                    this.prevInComputer
                ) {
                    this.shouldLeaveMonitor = true;
                } else {
                    this.shouldLeaveMonitor = false;
                }

                this.application.mouse.trigger('mousemove', [event]);

                this.prevInComputer = this.inComputer;
            },
            false
        );
        document.addEventListener(
            'mousedown',
            (event) => {
                // Preserve synthetic flag if present (e.g., dispatched from iframe handlers)
                // Otherwise, compute based on container bounds
                let isInComputer = (event as any).inComputer === true;
                if (!isInComputer && this.containerEl && (event as any).clientX !== undefined) {
                    const rect = this.containerEl.getBoundingClientRect();
                    const x = (event as any).clientX;
                    const y = (event as any).clientY;
                    isInComputer = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
                }
                // @ts-ignore
                event.inComputer = isInComputer;
                // @ts-ignore
                this.inComputer = event.inComputer;
                this.application.mouse.trigger('mousedown', [event]);

                this.mouseClickInProgress = true;
                this.prevInComputer = this.inComputer;
            },
            false
        );
        document.addEventListener(
            'mouseup',
            (event) => {
                // Preserve synthetic flag if present (e.g., dispatched from iframe handlers)
                // Otherwise, compute based on container bounds
                let isInComputer = (event as any).inComputer === true;
                if (!isInComputer && this.containerEl && (event as any).clientX !== undefined) {
                    const rect = this.containerEl.getBoundingClientRect();
                    const x = (event as any).clientX;
                    const y = (event as any).clientY;
                    isInComputer = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
                }
                // @ts-ignore
                event.inComputer = isInComputer;
                // Retain focus if mouseup occurred inside container
                // @ts-ignore
                this.inComputer = event.inComputer;
                this.application.mouse.trigger('mouseup', [event]);

                if (this.shouldLeaveMonitor) {
                    this.camera.trigger('leftMonitor');
                    this.shouldLeaveMonitor = false;
                }

                this.mouseClickInProgress = false;
                this.prevInComputer = this.inComputer;
            },
            false
        );
    }

    /**
     * Creates the iframe for the computer screen
     */
    createIframe() {
        // Create container
        const container = document.createElement('div');
        container.style.width = this.screenSize.width + 'px';
        container.style.height = this.screenSize.height + 'px';
        container.style.opacity = '1';
        container.style.background = '#1d2e2f';
        this.containerEl = container as HTMLDivElement;

        // Create iframe
        const iframe = document.createElement('iframe');

        // Bubble mouse move events to the main application, so we can affect the camera
        iframe.onload = () => {
            if (iframe.contentWindow) {
                window.addEventListener('message', (event) => {
                    // Trust messages only from approved origins (external apps + same-origin)
                    try {
                        const allowed = [
                            window.location.origin,
                            'https://auxe.framer.website',
                            'https://gemini-95-79538617613.us-west1.run.app',
                            'https://auxedj-79538617613.us-west1.run.app',
                            'http://localhost:3000',
                        ];
                        if (event.origin && allowed.indexOf(event.origin) === -1) return;
                    } catch (e) {}

                    var evt = new CustomEvent(event.data.type, {
                        bubbles: true,
                        cancelable: false,
                    });

                    // @ts-ignore
                    evt.inComputer = true;
                    if (event.data.type === 'mousemove') {
                        var clRect = iframe.getBoundingClientRect();
                        const { top, left, width, height } = clRect;
                        const widthRatio = width / IFRAME_SIZE.w;
                        const heightRatio = height / IFRAME_SIZE.h;

                        // @ts-ignore
                        evt.clientX = Math.round(
                            event.data.clientX * widthRatio + left
                        );
                        //@ts-ignore
                        evt.clientY = Math.round(
                            event.data.clientY * heightRatio + top
                        );
                    } else if (event.data.type === 'keydown') {
                        // @ts-ignore
                        evt.key = event.data.key;
                    } else if (event.data.type === 'keyup') {
                        // @ts-ignore
                        evt.key = event.data.key;
                    }

                    iframe.dispatchEvent(evt);
                });
            }
        };

        // Set iframe attributes
        // PROD default URL (original)
        iframe.src = 'https://auxe.framer.website/?editSite';
        /**
         * Use dev server is query params are present
         *
         * Warning: This will not work unless the dev server is running on localhost:3000
         * Also running the dev server causes browsers to freak out over unsecure connections
         * in the iframe, so it will flag a ton of issues.
         */
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('dev')) {
            iframe.src = 'http://localhost:3000/';
        }
        iframe.style.width = this.screenSize.width + 'px';
        iframe.style.height = this.screenSize.height + 'px';
        iframe.style.padding = IFRAME_PADDING + 'px';
        iframe.style.boxSizing = 'border-box';
        iframe.style.opacity = '1';
        // Make sure the iframe can emit focus events reliably when clicked
        // Some browsers require tabindex for focus events on the element
        // without affecting tab order for keyboard users
        iframe.tabIndex = -1;
        iframe.className = 'jitter';
        iframe.id = 'computer-screen';
        iframe.frameBorder = '0';
        iframe.title = 'HeffernanOS';
        // Allow common embed permissions (e.g., YouTube)
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share';
        // Reduce cross-origin leakage
        // @ts-ignore
        iframe.referrerPolicy = 'no-referrer';

        // Keep a handle for dynamic URL switching
        this.iframeEl = iframe;

        // Ensure click sounds fire for all interactions inside the computer screen (cross-origin safe)
        // Synthesize host-level mouse/touch events when interacting with the iframe
        const fireHostEvent = (type: 'mousedown' | 'mouseup') => {
            const ev: any = new CustomEvent(type, { bubbles: true, cancelable: false });
            ev.inComputer = true;
            document.dispatchEvent(ev);
        };
        const handlers: [string, () => void][] = [
            ['pointerdown', () => fireHostEvent('mousedown')],
            ['pointerup', () => fireHostEvent('mouseup')],
            ['mousedown', () => fireHostEvent('mousedown')],
            ['mouseup', () => fireHostEvent('mouseup')],
            ['touchstart', () => fireHostEvent('mousedown')],
            ['touchend', () => fireHostEvent('mouseup')],
            // Fallbacks for cross-origin iframes: only true press/release via focus/blur
            ['focus', () => fireHostEvent('mousedown')],
            ['blur', () => fireHostEvent('mouseup')],
        ];
        handlers.forEach(([evt, fn]) => iframe.addEventListener(evt as any, fn, { passive: true } as any));

        // Add iframe to container
        container.appendChild(iframe);

        // Inline controls overlay inside monitor container
        this.createScreenControls(container);

        // Create CSS plane
        this.createCssPlane(container);
    }



    /**
     * Creates a CSS plane and GL plane to properly occlude the CSS plane
     * @param element the element to create the css plane for
     */
    createCssPlane(element: HTMLElement) {
        // Create CSS3D object
        const object = new CSS3DObject(element);

        // copy monitor position and rotation
        object.position.copy(this.position);
        object.rotation.copy(this.rotation);

        // Add to CSS scene
        this.cssScene.add(object);

        // Create GL plane
        const material = new THREE.MeshLambertMaterial();
        material.side = THREE.DoubleSide;
        material.opacity = 0;
        material.transparent = true;
        // NoBlending allows the GL plane to occlude the CSS plane
        material.blending = THREE.NoBlending;

        // Create plane geometry
        const geometry = new THREE.PlaneGeometry(
            this.screenSize.width,
            this.screenSize.height
        );

        // Create the GL plane mesh
        const mesh = new THREE.Mesh(geometry, material);

        // Copy the position, rotation and scale of the CSS plane to the GL plane
        mesh.position.copy(object.position);
        mesh.rotation.copy(object.rotation);
        mesh.scale.copy(object.scale);

        // Add to gl scene
        this.scene.add(mesh);
    }

    /**
     * Creates the texture layers for the computer screen
     * @returns the maximum offset of the texture layers
     */
    createTextureLayers() {
        const textures = this.resources.items.texture;

        this.getVideoTextures('video-1');
        this.getVideoTextures('video-2');

        // Scale factor to multiply depth offset by
        const scaleFactor = 4;

        // Construct the texture layers
        const layers = {
            smudge: {
                texture: textures.monitorSmudgeTexture,
                blending: THREE.AdditiveBlending,
                opacity: 0.12,
                offset: 24,
            },
            innerShadow: {
                texture: textures.monitorShadowTexture,
                blending: THREE.NormalBlending,
                opacity: 1,
                offset: 5,
            },
            video: {
                texture: this.videoTextures['video-1'],
                blending: THREE.AdditiveBlending,
                opacity: 0.5,
                offset: 10,
            },
            video2: {
                texture: this.videoTextures['video-2'],
                blending: THREE.AdditiveBlending,
                opacity: 0.1,
                offset: 15,
            },
        };

        // Declare max offset
        let maxOffset = -1;

        // Add the texture layers to the screen
        for (const [_, layer] of Object.entries(layers)) {
            const offset = layer.offset * scaleFactor;
            this.addTextureLayer(
                layer.texture,
                layer.blending,
                layer.opacity,
                offset
            );
            // Calculate the max offset
            if (offset > maxOffset) maxOffset = offset;
        }

        // Return the max offset
        return maxOffset;
    }

    getVideoTextures(videoId: string) {
        const video = document.getElementById(videoId);
        if (!video) {
            setTimeout(() => {
                this.getVideoTextures(videoId);
            }, 100);
        } else {
            this.videoTextures[videoId] = new THREE.VideoTexture(
                video as HTMLVideoElement
            );
        }
    }

    /**
     * Adds a texture layer to the screen
     * @param texture the texture to add
     * @param blending the blending mode
     * @param opacity the opacity of the texture
     * @param offset the offset of the texture, higher values are further from the screen
     */
    addTextureLayer(
        texture: THREE.Texture,
        blendingMode: THREE.Blending,
        opacity: number,
        offset: number
    ) {
        // Create material
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            blending: blendingMode,
            side: THREE.DoubleSide,
            opacity,
            transparent: true,
        });

        // Create geometry
        const geometry = new THREE.PlaneGeometry(
            this.screenSize.width,
            this.screenSize.height
        );

        // Create mesh
        const mesh = new THREE.Mesh(geometry, material);

        // Copy position and apply the depth offset
        mesh.position.copy(
            this.offsetPosition(this.position, new THREE.Vector3(0, 0, offset))
        );

        // Copy rotation
        mesh.rotation.copy(this.rotation);

        this.scene.add(mesh);
    }

    setScreenURL(url: string) {
        if (this.iframeEl) {
            this.iframeEl.src = url;
        }
    }

    createScreenControls(container: HTMLElement) {
        const wrapper = document.createElement('div');
        wrapper.id = 'screen-controls';
        wrapper.style.position = 'absolute';
        wrapper.style.left = '50%';
        // Position higher up inside the monitor viewport to avoid overlapping footer UI
        wrapper.style.bottom = '128px';
        wrapper.style.transform = 'translateX(-50%)';
        wrapper.style.display = 'none';
        wrapper.style.gap = '8px';
        wrapper.style.padding = '6px';
        wrapper.style.background = 'rgba(0,0,0,0.6)';
        wrapper.style.border = '1px solid #fff';
        wrapper.style.borderRadius = '9999px';
        wrapper.style.pointerEvents = 'auto';
        wrapper.style.zIndex = '2';
        wrapper.id = 'prevent-click';

        const makeBtn = (label: string, url: string) => {
            const btn = document.createElement('button');
            btn.id = 'prevent-click';
            btn.setAttribute('aria-label', `Open ${label}`);
            btn.style.width = '28px';
            btn.style.height = '28px';
            btn.style.borderRadius = '9999px';
            btn.style.border = '1px solid #fff';
            btn.style.background = '#000';
            btn.style.color = '#fff';
            btn.style.cursor = 'pointer';
            btn.textContent = label;
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.setScreenURL(url);
            });
            return btn;
        };

        // A → original site
        wrapper.appendChild(
            makeBtn('A', 'https://auxe.framer.website/?editSite')
        );
        // Y → original external app
        wrapper.appendChild(
            makeBtn(
                'Y',
                'https://gemini-95-79538617613.us-west1.run.app'
            )
        );
        // B → original external app
        wrapper.appendChild(
            makeBtn('B', 'https://auxedj-79538617613.us-west1.run.app')
        );
        // G → goonify app
        wrapper.appendChild(
            makeBtn('G', 'https://f4pview-79538617613.us-west1.run.app')
        );
        // I → Insta Stories Viewer
        wrapper.appendChild(
            makeBtn('I', 'https://insta-stories-viewer.com/')
        );

        container.appendChild(wrapper);
        this.controlsEl = wrapper as HTMLDivElement;
    }

    /**
     * Creates enclosing planes for the computer screen
     * @param maxOffset the maximum offset of the texture layers
     */
    createEnclosingPlanes(maxOffset: number) {
        // Create planes, lots of boiler plate code here because I'm lazy
        const planes = {
            left: {
                size: new THREE.Vector2(maxOffset, this.screenSize.height),
                position: this.offsetPosition(
                    this.position,
                    new THREE.Vector3(
                        -this.screenSize.width / 2,
                        0,
                        maxOffset / 2
                    )
                ),
                rotation: new THREE.Euler(0, 90 * THREE.MathUtils.DEG2RAD, 0),
            },
            right: {
                size: new THREE.Vector2(maxOffset, this.screenSize.height),
                position: this.offsetPosition(
                    this.position,
                    new THREE.Vector3(
                        this.screenSize.width / 2,
                        0,
                        maxOffset / 2
                    )
                ),
                rotation: new THREE.Euler(0, 90 * THREE.MathUtils.DEG2RAD, 0),
            },
            top: {
                size: new THREE.Vector2(this.screenSize.width, maxOffset),
                position: this.offsetPosition(
                    this.position,
                    new THREE.Vector3(
                        0,
                        this.screenSize.height / 2,
                        maxOffset / 2
                    )
                ),
                rotation: new THREE.Euler(90 * THREE.MathUtils.DEG2RAD, 0, 0),
            },
            bottom: {
                size: new THREE.Vector2(this.screenSize.width, maxOffset),
                position: this.offsetPosition(
                    this.position,
                    new THREE.Vector3(
                        0,
                        -this.screenSize.height / 2,
                        maxOffset / 2
                    )
                ),
                rotation: new THREE.Euler(90 * THREE.MathUtils.DEG2RAD, 0, 0),
            },
        };

        // Add each of the planes
        for (const [_, plane] of Object.entries(planes)) {
            this.createEnclosingPlane(plane);
        }
    }

    /**
     * Creates a plane for the enclosing planes
     * @param plane the plane to create
     */
    createEnclosingPlane(plane: EnclosingPlane) {
        const material = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            color: 0x48493f,
        });

        const geometry = new THREE.PlaneGeometry(plane.size.x, plane.size.y);
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.copy(plane.position);
        mesh.rotation.copy(plane.rotation);

        this.scene.add(mesh);
    }

    createPerspectiveDimmer(maxOffset: number) {
        const material = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            color: 0x000000,
            transparent: true,
            blending: THREE.AdditiveBlending,
        });

        const plane = new THREE.PlaneGeometry(
            this.screenSize.width,
            this.screenSize.height
        );

        const mesh = new THREE.Mesh(plane, material);

        mesh.position.copy(
            this.offsetPosition(
                this.position,
                new THREE.Vector3(0, 0, maxOffset - 5)
            )
        );

        mesh.rotation.copy(this.rotation);

        this.dimmingPlane = mesh;

        this.scene.add(mesh);
    }

    /**
     * Offsets a position vector by another vector
     * @param position the position to offset
     * @param offset the offset to apply
     * @returns the new offset position
     */
    offsetPosition(position: THREE.Vector3, offset: THREE.Vector3) {
        const newPosition = new THREE.Vector3();
        newPosition.copy(position);
        newPosition.add(offset);
        return newPosition;
    }

    update() {
        if (this.dimmingPlane) {
            const planeNormal = new THREE.Vector3(0, 0, 1);
            const viewVector = new THREE.Vector3();
            viewVector.copy(this.camera.instance.position);
            viewVector.sub(this.position);
            viewVector.normalize();

            const dot = viewVector.dot(planeNormal);

            // calculate the distance from the camera vector to the plane vector
            const dimPos = this.dimmingPlane.position;
            const camPos = this.camera.instance.position;

            const distance = Math.sqrt(
                (camPos.x - dimPos.x) ** 2 +
                    (camPos.y - dimPos.y) ** 2 +
                    (camPos.z - dimPos.z) ** 2
            );

            const opacity = 1 / (distance / 10000);

            const DIM_FACTOR = 0.7;

            // @ts-ignore
            this.dimmingPlane.material.opacity =
                (1 - opacity) * DIM_FACTOR + (1 - dot) * DIM_FACTOR;
        }
    }
}
