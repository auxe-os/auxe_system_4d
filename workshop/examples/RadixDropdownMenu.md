# RadixDropdownMenu Component Analysis

**File:** `src/Application/UI/components/RadixDropdownMenu.tsx`

## Component Overview

The RadixDropdownMenu demonstrates advanced integration patterns for using Radix UI primitives within the Three.js environment. It showcases accessibility features, portal management, z-index handling, and event propagation control.

## Key Patterns Demonstrated

### 1. **Radix UI Integration**
```tsx
import * as RadixDropdown from '@radix-ui/react-dropdown-menu';

const RadixDropdownMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <RadixDropdown.Root onOpenChange={setIsOpen}>
      {/* Component structure */}
    </RadixDropdown.Root>
  );
};
```

### 2. **WebGL Pointer Events Management**
```tsx
useEffect(() => {
    const webglElement = document.getElementById('webgl');
    if (!webglElement) return;
    
    if (isOpen) {
        const originalPointerEvents = webglElement.style.pointerEvents;
        webglElement.style.pointerEvents = 'none';
        
        return () => {
            webglElement.style.pointerEvents = originalPointerEvents;
        };
    }
}, [isOpen]);
```

### 3. **Portal-Based Rendering**
```tsx
<RadixDropdown.Portal>
    <RadixDropdown.Content
        // Portal content with proper z-index
        style={{ zIndex: 2147483647 }}
    >
        {/* Menu items */}
    </RadixDropdown.Content>
</RadixDropdown.Portal>
```

## WebGL Integration

### Preventing Canvas Interference
The component implements several strategies to prevent Three.js canvas interactions from interfering with the dropdown:

1. **Pointer Events Management**: Disables WebGL pointer events when open
2. **Event Propagation Control**: Stops events from reaching the canvas
3. **Z-Index Layering**: Uses maximum z-index for proper stacking

### Trigger Button Protection
```tsx
<RadixDropdown.Trigger asChild>
    <button
        data-prevent-monitor="true"
        onClick={(e) => e.stopPropagation()}
        style={{ 
            color: 'white', 
            background: 'transparent', 
            border: '1px solid rgba(255,255,255,0.12)' 
        }}
    >
        ⋯
    </button>
</RadixDropdown.Trigger>
```

## Event Management

### State Synchronization
```tsx
const [isOpen, setIsOpen] = useState(false);

// Radix handles open/close, we track state for side effects
<RadixDropdown.Root onOpenChange={setIsOpen}>
```

### Menu Item Actions
```tsx
<RadixDropdown.Item
    onSelect={(e) => {
        e.preventDefault();
        UIEventBus.dispatch('muteToggle', !currentMuteState);
        window.postMessage({ type: 'keydown', key: '_AUTO_' }, '*');
    }}
>
    Toggle Mute
</RadixDropdown.Item>
```

## Advanced Portal Handling

### Content Configuration
```tsx
<RadixDropdown.Content
    side="bottom"
    align="end"
    sideOffset={8}
    avoidCollisions
    collisionPadding={8}
    style={{
        zIndex: 2147483647,
        border: '1px solid rgba(255,255,255,0.12)',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        pointerEvents: 'auto'
    }}
/>
```

### Event Handling
```tsx
onCloseAutoFocus={(event) => event.preventDefault()}
onEscapeKeyDown={(event) => event.preventDefault()}
onInteractOutside={(event) => {
    event.stopPropagation();
}}
```

## Styling Strategy

### Theme Integration
```tsx
const menuItemStyles = {
    base: "px-2 py-1.5 text-sm cursor-pointer rounded-sm outline-none",
    interactive: "hover:bg-white/10 cursor-pointer",
    colors: "text-white bg-transparent"
};
```

### Backdrop Effects
```tsx
style={{
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
}}
```

## Accessibility Features

### ARIA Integration
- Radix provides comprehensive ARIA attributes automatically
- Keyboard navigation (arrow keys, Enter, Escape)
- Focus management
- Screen reader support

### Custom Enhancements
```tsx
<button
    aria-label="open menu"
    className="flex w-9 h-9 items-center justify-center"
>
    ⋯
</button>
```

## Performance Considerations

### Effect Cleanup
```tsx
useEffect(() => {
    if (isOpen) {
        const cleanup = () => {
            // Restore original state
        };
        return cleanup;
    }
}, [isOpen]);
```

### Event Listener Management
- Radix handles most event listeners internally
- Component only manages WebGL-specific interactions
- No memory leaks from manual listeners

## Common Modifications

### Adding New Menu Items
```tsx
<RadixDropdown.Item
    onSelect={() => {
        // Your action
        UIEventBus.dispatch('customEvent', data);
        window.postMessage({ type: 'keydown', key: '_AUTO_' }, '*');
    }}
>
    Custom Action
</RadixDropdown.Item>
```

### Custom Styling
```tsx
<RadixDropdown.Content
    className="custom-dropdown-content"
    style={{
        ...getRadixStyle(),
        // Custom overrides
        backgroundColor: 'rgba(20, 20, 20, 0.95)',
    }}
>
```

### Different Trigger Elements
```tsx
<RadixDropdown.Trigger asChild>
    <div className="custom-trigger">
        <Icon name="settings" />
        <span>Settings</span>
    </div>
</RadixDropdown.Trigger>
```

## Integration Patterns

### With UIEventBus
```tsx
// Dispatch events from menu items
UIEventBus.dispatch('viewChange', 'monitor');
UIEventBus.dispatch('muteToggle', !muted);
UIEventBus.dispatch('freeCamToggle', !freeCam);
```

### With Audio System
```tsx
// Trigger typing SFX for interactions
window.postMessage({ type: 'keydown', key: '_AUTO_' }, '*');
```

## Testing Considerations

### Manual Testing Checklist
- [ ] Dropdown opens/closes correctly
- [ ] Menu items respond to clicks
- [ ] Keyboard navigation works (arrows, Enter, Escape)
- [ ] WebGL canvas doesn't interfere
- [ ] Backdrop blur effect renders
- [ ] Events are dispatched correctly
- [ ] Mobile responsiveness

### Debug Patterns
```tsx
const handleOpenChange = (open: boolean) => {
    console.log('Dropdown state:', { open, timestamp: Date.now() });
    setIsOpen(open);
};
```

## Error Handling

### Graceful Degradation
```tsx
useEffect(() => {
    const webglElement = document.getElementById('webgl');
    if (!webglElement) {
        console.warn('WebGL element not found, skipping pointer events management');
        return;
    }
    // ... rest of effect
}, [isOpen]);
```

## Related Components

- **SimpleDropdown**: Custom implementation without Radix
- **RadixRadio**: Radio button implementation using Radix
- **ContextMenu**: Right-click context menu variant

## Best Practices Demonstrated

1. **Portal Usage**: Proper portal mounting for z-index control
2. **Event Management**: Comprehensive event handling and propagation
3. **Accessibility**: Leveraging Radix's built-in accessibility features  
4. **Performance**: Efficient state management and cleanup
5. **Integration**: Seamless Three.js and React integration

This component serves as the gold standard for integrating complex UI libraries with the AuxeOS Three.js environment while maintaining accessibility and performance.
