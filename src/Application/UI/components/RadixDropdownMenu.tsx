import React, { useState, useEffect } from 'react';
import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import UIEventBus from '../EventBus';

/**
 * RadixDropdownMenu Component
 * 
 * Uses Radix UI for an accessible dropdown menu
 * Includes event propagation handling to prevent issues with Three.js canvas
 */
const RadixDropdownMenu: React.FC = () => {
  // Track dropdown open state to manage WebGL pointer-events
  const [isOpen, setIsOpen] = useState(false);
  
  // Toggle WebGL pointer-events when dropdown opens/closes
  useEffect(() => {
    const webglElement = document.getElementById('webgl');
    if (!webglElement) return;
    
    if (isOpen) {
      // Save original pointer-events value and set to none while dropdown is open
      const originalPointerEvents = webglElement.style.pointerEvents;
      webglElement.style.pointerEvents = 'none';
      
      return () => {
        // Restore original pointer-events when dropdown closes
        webglElement.style.pointerEvents = originalPointerEvents;
      };
    }
  }, [isOpen]);

  return (
    <RadixDropdown.Root onOpenChange={setIsOpen}>
      {/* Trigger button with explicit event stopping */}
      <RadixDropdown.Trigger asChild>
        <button
          aria-label="open menu"
          className="flex w-9 h-9 items-center justify-center rounded-full px-2 py-1 text-sm outline-none"
          style={{ color: 'white', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)' }}
          data-prevent-monitor="true"
          onClick={(e) => {
            // Stop event propagation to prevent reaching WebGL canvas
            e.stopPropagation();
          }}
        >
          ⋯
        </button>
      </RadixDropdown.Trigger>

      {/* Content with high z-index and pointer-events enabled */}
      <RadixDropdown.Portal>
        <RadixDropdown.Content
          side="bottom"
          align="end"
          sideOffset={8}
          className="z-50 min-w-[8rem] rounded-md border bg-black p-1 text-white shadow-md"
          style={{ 
            zIndex: 2147483647, /* Maximum z-index value */
            border: '1px solid rgba(255,255,255,0.12)',
            position: 'relative',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            pointerEvents: 'auto'
          }}
          avoidCollisions
          collisionPadding={8}
          onCloseAutoFocus={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => event.preventDefault()}
          onInteractOutside={(event) => {
            // Prevent outside clicks from propagating to WebGL canvas
            event.stopPropagation();
          }}
        >
          <RadixDropdown.Item
            className="px-2 py-1.5 text-sm hover:bg-white/10 cursor-pointer rounded-sm outline-none"
            onSelect={(e) => {
              // Example action: open embedded terminal page in monitor
              e.stopPropagation();
              UIEventBus.dispatch('setMonitorURL', 'static/iframe-pages/video.html');
            }}
          >
            Open monitor page
          </RadixDropdown.Item>

          <RadixDropdown.Item
            className="px-2 py-1.5 text-sm hover:bg-white/10 cursor-pointer rounded-sm outline-none"
            onSelect={(e) => {
              e.stopPropagation();
              UIEventBus.dispatch('muteToggle', null);
            }}
          >
            Toggle mute
          </RadixDropdown.Item>
          
          <RadixDropdown.Item
            className="px-2 py-1.5 text-sm hover:bg-white/10 cursor-pointer rounded-sm outline-none"
            onSelect={(e) => {
              e.stopPropagation();
              UIEventBus.dispatch('freeCamToggle', null);
            }}
          >
            Toggle free camera
          </RadixDropdown.Item>
        </RadixDropdown.Content>
      </RadixDropdown.Portal>
    </RadixDropdown.Root>
  );
};

export default RadixDropdownMenu;
