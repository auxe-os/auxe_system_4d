# Real-World Component Examples

This folder contains annotated examples of actual components from the AuxeOS portfolio, showing how the patterns are applied in practice.

## Examples Overview

### 1. Toggle Components
- `MuteToggle.md` - Analysis of the mute/volume toggle
- `FreeCamToggle.md` - Camera mode switching component
- `RadioToggle.md` - Radio indicator component

### 2. Overlay Components  
- `InfoOverlay.md` - Main system information overlay
- `HelpPrompt.md` - Interactive help text with typing animation
- `LoadingScreen.md` - Complex startup sequence with multiple states

### 3. Navigation Components
- `RadixDropdownMenu.md` - Accessible dropdown with WebGL integration
- `RadixRadio.md` - Screen selector radio buttons
- `SimpleRadio.md` - Basic radio group implementation

### 4. Layout Components
- `InterfaceUI.md` - Main UI container and layout manager
- `App.md` - Root application component structure

## What Each Example Covers

Each example file includes:

1. **Component Overview** - What the component does and where it's used
2. **Key Patterns** - Specific patterns and techniques demonstrated
3. **WebGL Integration** - How it handles Three.js canvas interactions
4. **Event Management** - UIEventBus usage and event handling
5. **Animation Details** - Framer Motion implementation
6. **Accessibility Features** - ARIA labels, keyboard navigation, etc.
7. **Performance Considerations** - Optimization techniques used
8. **Common Modifications** - How to extend or customize the component

## Learning Path

1. Start with `MuteToggle.md` for basic toggle patterns
2. Progress to `InfoOverlay.md` for complex state management
3. Study `RadixDropdownMenu.md` for advanced integration patterns
4. Review `LoadingScreen.md` for comprehensive examples

## Code Locations

Each example references the actual component files:
- Source: `src/Application/UI/components/[ComponentName].tsx`
- Types: `src/types.d.ts`
- Styles: `src/Application/UI/style.css`
- Utils: `src/Application/UI/lib/utils.ts`
