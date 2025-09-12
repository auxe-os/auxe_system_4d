# MuteToggle Component Analysis

**File:** `src/Application/UI/components/MuteToggle.tsx`

## Component Overview

The MuteToggle is a fundamental interactive control that toggles audio mute state. It demonstrates core patterns used throughout the AuxeOS interface including state management, animation, event handling, and WebGL compatibility.

## Key Patterns Demonstrated

### 1. **Basic Toggle Pattern**
```tsx
const [muted, setMuted] = useState(false);

const onMouseDownHandler = useCallback(
    (event) => {
        setIsActive(true);
        event.preventDefault();
        setMuted(!muted);
    },
    [muted]
);
```

### 2. **Responsive Icon Sizing**
```tsx
const iconSize = window.innerWidth < 768 ? 8 : 10;
```

### 3. **Event Bus Integration**
```tsx
useEffect(() => {
    UIEventBus.dispatch('muteToggle', muted);
}, [muted]);
```

### 4. **Framer Motion Animation States**
```tsx
const iconVars = {
    hovering: {
        opacity: 0.8,
        transition: { duration: 0.1, ease: 'easeOut' },
    },
    active: {
        scale: 0.8,
        opacity: 0.5,
        transition: { duration: 0.1, ease: Easing.expOut },
    },
    default: {
        scale: 1,
        opacity: 1,
        transition: { duration: 0.2, ease: 'easeOut' },
    },
};
```

## WebGL Integration

### Event Propagation Prevention
```tsx
// All interactive elements include these attributes
id="prevent-click"
onMouseDown={onMouseDownHandler}
```

### Visual State Management
- Uses hover states to provide immediate feedback
- Active state shows user interaction is registered
- Smooth transitions between states using Framer Motion

## Event Management

### State Updates
```tsx
const onMouseDownHandler = useCallback(
    (event) => {
        setIsActive(true);
        event.preventDefault();
        setMuted(!muted);
    },
    [muted]  // Dependency ensures latest state
);
```

### Cross-Component Communication
```tsx
useEffect(() => {
    UIEventBus.dispatch('muteToggle', muted);
}, [muted]);
```

## Animation Details

### Icon State Animations
- **Default**: Normal scale and opacity
- **Hovering**: Reduced opacity for feedback
- **Active**: Smaller scale and lower opacity for "pressed" effect

### Easing Curves
- Uses custom `Easing.expOut` for natural feel
- Different durations for different interactions (100ms active, 200ms default)

## Styling Strategy

### StyleSheetCSS Object
```tsx
const styles: StyleSheetCSS = {
    container: {
        background: 'black',
        textAlign: 'center',
        display: 'flex',
        boxSizing: 'border-box',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
    },
};
```

### Icon Management
- Uses imported SVG assets
- Dynamic src switching based on state
- Responsive sizing

## Performance Considerations

### useCallback Usage
```tsx
const onMouseDownHandler = useCallback(/* ... */, [muted]);
const onMouseUpHandler = useCallback(/* ... */, []);
```

### Minimal Re-renders
- State changes are isolated to necessary updates
- Event handlers are memoized with proper dependencies

## Accessibility Features

- **Semantic HTML**: Uses proper button semantics
- **Visual Feedback**: Clear hover and active states
- **Audio Feedback**: Integrates with typing SFX system

## Common Modifications

### Adding New States
```tsx
const [loading, setLoading] = useState(false);

// Add to animation variants
const iconVars = {
    // ... existing states
    loading: {
        rotate: 360,
        transition: { duration: 1, repeat: Infinity, ease: 'linear' },
    },
};
```

### Custom Icons
```tsx
// Import your custom icons
import customIcon from '../../../static/textures/UI/custom.svg';

// Use in render
<motion.img
    src={customCondition ? customIcon : defaultIcon}
    // ... rest of props
/>
```

### Different Event Types
```tsx
// Listen for different events
UIEventBus.on('audioStateChange', (audioData) => {
    setMuted(audioData.muted);
});

// Dispatch with more data
UIEventBus.dispatch('muteToggle', { 
    muted, 
    timestamp: Date.now(),
    source: 'user-interaction' 
});
```

## Integration with Other Components

### InfoOverlay Usage
The MuteToggle is embedded within InfoOverlay and appears when `volumeVisible` state is true.

### Audio System Integration
The component dispatches events that are consumed by the AudioManager for actual audio control.

## Testing Considerations

### Manual Testing Checklist
- [ ] Click toggles state correctly
- [ ] Hover effects work smoothly
- [ ] Icon changes appropriately
- [ ] Events are dispatched
- [ ] No interference with WebGL canvas
- [ ] Responsive sizing works on mobile

### Debug Tips
```tsx
// Add debugging to event handlers
const onMouseDownHandler = useCallback((event) => {
    console.log('MuteToggle clicked:', { muted, event });
    // ... rest of handler
}, [muted]);
```

## Related Components

- **RadioToggle**: Similar toggle pattern for radio state
- **FreeCamToggle**: Camera mode toggle with state indicator
- **VolumeSlider**: Could be added for granular volume control

This component serves as an excellent template for creating other toggle-style controls in the AuxeOS interface.
