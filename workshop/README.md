# AuxeOS Component Workshop

Welcome to the comprehensive guide for building and understanding components in the AuxeOS portfolio website. This workshop will teach you how to create components that seamlessly integrate with the Three.js environment while maintaining accessibility and performance.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Component Patterns](#component-patterns)
3. [Essential Patterns](#essential-patterns)
4. [Component Templates](#component-templates)
5. [Best Practices](#best-practices)
6. [Common Pitfalls](#common-pitfalls)
7. [Testing & Debugging](#testing--debugging)

## Architecture Overview

The AuxeOS portfolio uses a three-layer architecture:

### 1. WebGL Layer (Three.js Scene)
- Core 3D environment, models, and visual effects
- Managed by `src/Application/` with render/update loops
- Canvas element mounted in `#webgl`

### 2. CSS3D Layer 
- DOM elements projected in 3D space (mainly the monitor iframe)
- Uses `CSS3DRenderer` in `src/Application/Renderer.ts`
- Mounted in `#css`

### 3. UI Layer (React)
- Loading screens, overlays, controls, and interactive elements
- React 18 with Concurrent Mode and automatic batching
- Two mount points: `#ui` (non-interactive) and `#ui-interactive` (interactive)

## Component Patterns

### Core Component Structure

Every AuxeOS component follows this basic structure:

```tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import UIEventBus from '../EventBus';
import { cn } from '../lib/utils';

interface ComponentProps {
    // Define your component props with TypeScript
    children?: React.ReactNode;
    className?: string;
    // ... other props
}

const Component: React.FC<ComponentProps> = ({ 
    children,
    className,
    ...props 
}) => {
    // State management
    const [state, setState] = useState(initialValue);
    
    // Event handlers
    const handleClick = useCallback((event: React.MouseEvent) => {
        // Always prevent event propagation to avoid WebGL canvas interference
        event.stopPropagation();
        
        // Your logic here
        
        // Dispatch events via UIEventBus for cross-component communication
        UIEventBus.dispatch('eventName', data);
        
        // Trigger typing SFX for user feedback
        window.postMessage({ type: 'keydown', key: '_AUTO_' }, '*');
    }, [dependencies]);
    
    // Effect hooks for setup and cleanup
    useEffect(() => {
        // Setup logic
        
        return () => {
            // Cleanup logic
        };
    }, []);
    
    return (
        <motion.div
            className={cn("default-classes", className)}
            onClick={handleClick}
            // Always include these attributes for WebGL compatibility
            id="prevent-click"
            data-prevent-monitor="true"
        >
            {children}
        </motion.div>
    );
};

export default Component;
```

### Styling Patterns

Components use a hybrid approach:

1. **StyleSheetCSS Objects**: For component-specific styles
2. **Tailwind Classes**: For utility styles
3. **CSS Variables**: For theme consistency

```tsx
// StyleSheetCSS pattern (preferred for complex components)
const styles: StyleSheetCSS = {
    container: {
        background: 'black',
        padding: 4,
        paddingLeft: 16,
        paddingRight: 16,
        textAlign: 'center',
        display: 'flex',
        boxSizing: 'border-box',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
    },
    wrapper: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
    },
};

// Tailwind + cn utility pattern (preferred for simple components)
<div className={cn(
    "flex items-center justify-center px-4 py-2",
    "bg-black text-white border border-white/30",
    "hover:bg-white/10 transition-colors duration-150",
    className
)} />
```

## Essential Patterns

### 1. Event Bus Communication

Use the UIEventBus for cross-component communication:

```tsx
import UIEventBus from '../EventBus';

// Listening to events
useEffect(() => {
    UIEventBus.on('eventName', (data) => {
        // Handle event
    });
}, []);

// Dispatching events
UIEventBus.dispatch('eventName', { data: 'value' });
```

### 2. Animation with Framer Motion

Standard animation variants for consistency:

```tsx
const animationVars = {
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.2,
            ease: 'easeOut',
        },
    },
    hidden: {
        opacity: 0,
        scale: 0.95,
        transition: {
            duration: 0.15,
            ease: 'easeIn',
        },
    },
    hover: {
        scale: 1.05,
        transition: {
            duration: 0.1,
            ease: 'easeOut',
        },
    },
    active: {
        scale: 0.95,
        transition: {
            duration: 0.1,
            ease: 'easeOut',
        },
    },
};
```

### 3. WebGL Compatibility

Always include these attributes to prevent Three.js interference:

```tsx
<div
    id="prevent-click"
    data-prevent-monitor="true"
    onClick={(e) => e.stopPropagation()}
    style={{ pointerEvents: 'auto', zIndex: 999 }}
>
    {/* Component content */}
</div>
```

### 4. Audio Feedback

Trigger typing sound effects for user interactions:

```tsx
// Basic typing SFX
window.postMessage({ type: 'keydown', key: '_AUTO_' }, '*');

// Character-specific SFX (for typing animations)
window.postMessage({ type: 'keydown', key: `_AUTO_${character}` }, '*');
```

### 5. Responsive Design

Mobile-first responsive patterns:

```tsx
const iconSize = window.innerWidth < 768 ? 8 : 10;

const responsiveStyles = {
    fontSize: window.innerWidth < 768 ? 12 : 16,
    padding: window.innerWidth < 768 ? 8 : 16,
};

// CSS approach
<div className="text-xs md:text-sm p-2 md:p-4" />
```

## Component Templates

See the following files for complete component templates:

- `templates/BasicToggle.tsx` - Simple toggle component
- `templates/AnimatedOverlay.tsx` - Overlay with typing animation
- `templates/RadixWrapper.tsx` - Radix UI integration
- `templates/FormComponent.tsx` - Form input component
- `examples/` - Real-world component examples

## Best Practices

### 1. TypeScript Usage
- Always define interfaces for props
- Use proper typing for event handlers
- Leverage the `StyleSheetCSS` type for style objects

### 2. Performance
- Use `useCallback` for event handlers
- Memoize expensive calculations with `useMemo`
- Properly clean up event listeners and intervals

### 3. Accessibility
- Include proper ARIA labels
- Ensure keyboard navigation works
- Use semantic HTML elements

### 4. State Management
- Keep component state local when possible
- Use UIEventBus for cross-component communication
- Avoid prop drilling

### 5. Styling
- Use the `cn` utility for conditional classes
- Maintain consistent spacing and colors
- Follow the established color scheme (black backgrounds, white text)

## Common Pitfalls

### 1. WebGL Canvas Interference
- Always call `e.stopPropagation()` on interactive elements
- Include `id="prevent-click"` and `data-prevent-monitor="true"`
- Set `pointerEvents: 'auto'` for interactive elements

### 2. Z-Index Issues
- Use the `getRadixStyle()` helper for Radix components
- Be mindful of the layering system
- Portal components to avoid z-index conflicts

### 3. Event Bubbling
- Stop propagation on all interactive elements
- Use the UIEventBus instead of native DOM events

### 4. Memory Leaks
- Always clean up event listeners
- Clear intervals and timeouts
- Remove UIEventBus listeners on unmount

## Testing & Debugging

### Development Tools
- Use `#debug` in URL for debug UI
- Add `console.log` statements for state tracking
- Use React DevTools for component inspection

### Testing Checklist
- [ ] Component renders without errors
- [ ] Interactions don't interfere with WebGL canvas
- [ ] Responsive design works on mobile
- [ ] Event bus communication functions correctly
- [ ] Animations perform smoothly
- [ ] Audio feedback triggers appropriately
- [ ] Component cleans up properly on unmount

## File Structure

Components should be organized as follows:

```
src/Application/UI/components/
├── YourComponent.tsx          # Main component file
├── ui/                        # Reusable UI primitives
│   ├── button.tsx
│   ├── dropdown-menu.tsx
│   └── radio-group.tsx
├── overlays/                  # Overlay components
├── controls/                  # Interactive controls
└── layout/                    # Layout components
```

## Next Steps

1. Review the example components in the `examples/` folder
2. Use the component templates in `templates/` to create new components
3. Follow the patterns established in existing components
4. Test thoroughly with the WebGL environment
5. Document any new patterns you discover

Happy component building! 🚀
