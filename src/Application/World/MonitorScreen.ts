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
        
        // Initial url cache prefill for common URLs
        setTimeout(() => {
            // These are our common navigation targets
            ['https://calm-context-197021.framer.app/', 
             'https://cg-phive-sticky-cards.vercel.app/',
             'https://morphic-ai-answer-engine-generative-nine-delta.vercel.app/',
             'https://morphic-ai-answer-engine-generative-9ro6diyxa.vercel.app/',
             'https://juno-watts-kappa.vercel.app/',
             'https://goonify-66977310969.us-west1.run.app/'].forEach(url => {
                if (!this.visitedUrls.has(url)) {
                    this.visitedUrls.add(url);
                }
             });
        }, 5000);
    }

    initializeScreenEvents() {
        const isEventFromPreventedUI = (ev: Event) => {
            let node = (ev.target as Node | null);
            while (node) {
                if (node instanceof HTMLElement) {
                    try {
                        if (node.getAttribute && node.getAttribute('data-prevent-monitor') === 'true') return true;
                    } catch (e) {}
                    if (node.id === 'prevent-click') return true;
                    if (node.classList && node.classList.contains('prevent-monitor')) return true;
                }
                node = node.parentNode;
            }
            return false;
        };

        document.addEventListener(
            'mousemove',
            (event) => {
                if (isEventFromPreventedUI(event)) {
                    // ensure mouse move is still forwarded to application.input but not treated as in-computer
                    // @ts-ignore
                    event.inComputer = false;
                    this.application.mouse.trigger('mousemove', [event]);
                    this.prevInComputer = this.inComputer;
                    return;
                }
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
                if (isEventFromPreventedUI(event)) {
                    // @ts-ignore
                    event.inComputer = false;
                    this.application.mouse.trigger('mousedown', [event]);
                    this.mouseClickInProgress = true;
                    this.prevInComputer = this.inComputer;
                    return;
                }
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
                if (isEventFromPreventedUI(event)) {
                    // @ts-ignore
                    event.inComputer = false;
                    this.application.mouse.trigger('mouseup', [event]);
                    if (this.shouldLeaveMonitor) {
                        this.camera.trigger('leftMonitor');
                        this.shouldLeaveMonitor = false;
                    }
                    this.mouseClickInProgress = false;
                    this.prevInComputer = this.inComputer;
                    return;
                }
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
        container.style.position = 'relative'; // Enable positioning for the loading indicator
        this.containerEl = container as HTMLDivElement;
        
        // Track loading state internally without UI indicators

        // Create iframe
        const iframe = document.createElement('iframe');

        // Bubble mouse move events to the main application, so we can affect the camera
        iframe.onload = () => {
            if (iframe.contentWindow) {
                // Cache the initial URL
                this.visitedUrls.add(iframe.src);
                this.isLoading = false;
                
                window.addEventListener('message', (event) => {
                    // Trust messages only from approved origins (external apps + same-origin)
                    try {
                        const allowed = [
                            window.location.origin,
                            'https://auxe.framer.website',
                            'https://cg-phive-sticky-cards.vercel.app/',
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
                
                // Cache the loaded URL for faster navigation
                this.visitedUrls.add(iframe.src);
            }
            
            // For the initial load only - subsequent loads are handled by the event listener in setIframeSrc
            if (!iframe.dataset.initialLoadComplete) {
                iframe.dataset.initialLoadComplete = 'true';
                // Dispatch loading end event when the iframe actually loads
                UIEventBus.dispatch('iframeLoadingEnd', {});
            }
        };

        // Set iframe attributes
        UIEventBus.dispatch('iframeLoadingStart', {});
        // PROD default URL (changed to single URL requested)
        iframe.src = 'https://auxiliary-gwezk1pjy-jayashiyan-gmailcoms-projects.vercel.app/';
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
        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-forms'); // Set sandbox attribute for security and layout stability

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
        // Controls are hidden for now (kept in code for future re-enable)
        // this.createScreenControls(container);
 
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

    // Track current state for navigation optimizations
    private currentUrl: string = '';
    private isLoading: boolean = false;
    private visitedUrls: Set<string> = new Set();

    setScreenURL(url: string) {
        // Use setIframeSrc to ensure loading events are dispatched
        this.setIframeSrc(url);
    }

    setIframeSrc(url: string) {
        // Don't reload if it's the same URL (performance optimization)
        if (this.currentUrl === url && this.visitedUrls.has(url)) {
            return;
        }

        // Track state internally but don't show loading UI
        this.currentUrl = url;
        this.isLoading = true;
        
        // Set up the onload handler if not already set
        if (this.iframeEl && !this.iframeEl.dataset.listenerAdded) {
            this.iframeEl.addEventListener('load', () => {
                // Mark URL as visited for future optimizations
                this.visitedUrls.add(this.iframeEl?.src || '');
                this.isLoading = false;
            });
            this.iframeEl.dataset.listenerAdded = 'true';
        }
        
        // Handle timeout for loading - prevent hung loading states
        const loadingTimeout = setTimeout(() => {
            if (this.isLoading) {
                this.isLoading = false;
                console.log('Loading timeout for URL:', url);
            }
        }, 8000); // 8 second timeout
        
        // Listen for one-time load event to clear the timeout
        const handleLoad = () => {
            clearTimeout(loadingTimeout);
            if (this.iframeEl) {
                this.iframeEl.removeEventListener('load', handleLoad);
            }
        };
        
        if (this.iframeEl) {
            this.iframeEl.addEventListener('load', handleLoad, { once: true });
            this.iframeEl.src = url;
        }
    }

    // Helper methods (assuming these were intended to be part of the class)
    private createEnclosingPlanes(maxOffset: number) {
        // Placeholder implementation
        console.log('createEnclosingPlanes called with maxOffset:', maxOffset);
    }

    private createPerspectiveDimmer(maxOffset: number) {
        // Placeholder implementation
        console.log('createPerspectiveDimmer called with maxOffset:', maxOffset);
    }

    private createScreenControls(container: HTMLDivElement) {
        // Create a container for the screen controls
        const controlsContainer = document.createElement('div');
        controlsContainer.id = 'screen-controls';
        controlsContainer.style.position = 'absolute';
        controlsContainer.style.bottom = '60px'; // Higher up from the bottom
        controlsContainer.style.left = '0';
        controlsContainer.style.width = '100%';
        controlsContainer.style.display = 'none'; // Initially hidden
        controlsContainer.style.justifyContent = 'center';
        controlsContainer.style.gap = '10px'; // Increased gap for better spacing
      
        // Controls are hidden for now; keep implementation in code for future re-enable.
        // (controlsContainer creation retained above but not appended)
        // this.controlsEl = controlsContainer;
        // container.appendChild(controlsContainer);
    }

    private offsetPosition(position: THREE.Vector3, offset: THREE.Vector3) {
        return position.clone().add(offset);
    }
    
    // We've replaced the preload method with a simpler approach in the constructor
    
    update() {
        // Add any update logic that needs to run every frame
        // This method is called from World.update()
    }
}