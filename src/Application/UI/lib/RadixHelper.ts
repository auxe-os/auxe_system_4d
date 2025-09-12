/**
 * RadixHelper.ts - Helps integrate Radix UI components with Three.js environment
 * 
 * This helper provides utilities to ensure Radix UI components work properly within the Three.js context,
 * particularly for handling portal mounting and z-index issues.
 */

import { useEffect, useState, CSSProperties } from 'react';

/**
 * Creates a portal container outside the Three.js context for Radix UI components
 * @returns The portal container element
 */
export const useRadixPortalContainer = (): HTMLElement | null => {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  
  useEffect(() => {
    // Check if portal container already exists
    let container = document.getElementById('radix-portal-container');
    
    // Create it if it doesn't
    if (!container) {
      container = document.createElement('div');
      container.id = 'radix-portal-container';
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '2147483647';
      document.body.appendChild(container);
    }
    
    setPortalContainer(container);
    
    // Set up a global event listener for when a radix component receives focus
    const handleRadixFocus = (e: Event) => {
      // Check if the event target is part of a Radix UI component
      const target = e.target as HTMLElement;
      if (
        target.hasAttribute('data-radix-focus-guard') || 
        target.closest('[data-radix-popper-content-wrapper]') ||
        target.closest('[role="dialog"]') ||
        target.closest('[role="menu"]')
      ) {
        // Make sure Three.js doesn't interfere with the UI
        const webgl = document.getElementById('webgl');
        if (webgl) {
          webgl.style.pointerEvents = 'none';
        }
      }
    };

    // Add event listeners
    document.addEventListener('focusin', handleRadixFocus);
    document.addEventListener('mousedown', handleRadixFocus);

    // Cleanup
    return () => {
      document.removeEventListener('focusin', handleRadixFocus);
      document.removeEventListener('mousedown', handleRadixFocus);
      // We don't remove the container as other components might be using it
    };
  }, []);

  return portalContainer;
};

/**
 * Generate a Radix UI compatible style object with proper z-index handling
 * @param customStyles Optional additional styles to include
 * @returns A React CSSProperties style object
 */
export const getRadixStyle = (customStyles: Partial<CSSProperties> = {}): CSSProperties => {
  return {
    zIndex: 2147483647,
    position: 'relative',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    pointerEvents: 'auto',
    ...customStyles
  };
};

/**
 * Manages webgl pointer events based on component state and monitor view
 * @param inMonitor Whether we're currently in monitor view
 */
export const useResetWebGLPointerEvents = (inMonitor: boolean) => {
  useEffect(() => {
    // Define base state for WebGL pointer-events based on monitor state
    const baseWebGLPointerEvents = inMonitor ? 'none' : 'none';
    
    // Set initial state
    const webgl = document.getElementById('webgl');
    if (webgl) {
      webgl.style.pointerEvents = baseWebGLPointerEvents;
    }
    
    // Handle clicks outside Radix components
    const handlePointerReset = (e: Event) => {
      const target = e.target as HTMLElement;
      const webgl = document.getElementById('webgl');
      
      if (!webgl) return;
      
      // If we're clicking on a Radix component, make sure webgl doesn't interfere
      if (
        target.hasAttribute('data-radix-focus-guard') || 
        target.closest('[data-radix-popper-content-wrapper]') ||
        target.closest('[role="dialog"]') ||
        target.closest('[role="menu"]')
      ) {
        webgl.style.pointerEvents = 'none';
      } else {
        // Otherwise, restore to base state
        webgl.style.pointerEvents = baseWebGLPointerEvents;
      }
    };

    document.addEventListener('mousedown', handlePointerReset);
    
    return () => {
      document.removeEventListener('mousedown', handlePointerReset);
    };
  }, [inMonitor]);
};

export default {
  useRadixPortalContainer,
  getRadixStyle,
  useResetWebGLPointerEvents
};
