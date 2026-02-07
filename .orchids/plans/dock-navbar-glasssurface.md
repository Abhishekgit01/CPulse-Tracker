# Dock Navbar with GlassSurface Effect

## Requirements
Replace the current navbar with a macOS-style animated Dock component that uses the existing GlassSurface liquid glass effect. The Dock will feature magnetic magnification on hover, smooth spring animations, and tooltip labels - creating a modern, interactive navigation experience.

## Current State Analysis

### Existing Components
1. **GlassSurface.tsx** - Liquid glass effect with SVG displacement maps, chromatic aberration, and CSS fallbacks
2. **App.tsx** - Current navbar with floating pill buttons (Links + action buttons)
3. **framer-motion v12.33.0** - Already installed, supports motion/react import style

### Current Navbar Structure
- **Left side**: Logo + desktop nav pills (Search, College, Leaderboard, Compare, Daily, Dashboard)
- **Right side**: Enhanced/Classic toggle, Theme toggle, Login/Register OR User profile/Logout
- **Mobile**: Hamburger menu with dropdown

## Proposed Solution

### Architecture
Create a new `Dock.tsx` component that wraps each dock item in `GlassSurface`, combining the magnetic magnification animation with the liquid glass visual effect.

### Design Decisions
1. **Bottom-fixed dock** - Position at bottom center of screen (like macOS dock)
2. **GlassSurface integration** - Each DockItem wrapped in GlassSurface for the liquid glass effect
3. **Responsive behavior** - Full dock on desktop, collapsed hamburger on mobile
4. **Active state indication** - Current route highlighted with glow effect
5. **Authentication-aware** - Show Login/Register or User/Logout based on auth state

## Implementation Phases

### Phase 1: Create Dock Component
Create `cpulse-frontend/src/components/ui/Dock.tsx` with the provided Dock code, modified to integrate GlassSurface:
- Import GlassSurface component
- Wrap each DockItem in GlassSurface with customized props (brightness, blur, borderRadius)
- Style the dock panel itself with GlassSurface for the container
- Export DockItem, DockLabel, DockIcon, and default Dock

### Phase 2: Integrate Dock into App.tsx
Modify `cpulse-frontend/src/App.tsx`:
- Import the new Dock component
- Replace the current `<nav>` section with the Dock
- Create dock items array with navigation links + actions
- Pass router navigation via `useNavigate` for onClick handlers
- Handle active route styling via `useLocation`

### Phase 3: Create Dock Items Configuration
Define dock items in App.tsx:
```tsx
const dockItems: DockItemData[] = [
  { icon: <HomeIcon />, label: "Home", onClick: () => navigate("/") },
  { icon: <SearchIcon />, label: "Search", onClick: () => navigate("/search") },
  { icon: <CollegeIcon />, label: "College", onClick: () => navigate("/college") },
  { icon: <LeaderboardIcon />, label: "Leaderboard", onClick: () => navigate("/leaderboard") },
  { icon: <CompareIcon />, label: "Compare", onClick: () => navigate("/compare") },
  { icon: <CalendarIcon />, label: "Daily", onClick: () => navigate("/problem-of-day") },
  // Conditional: Dashboard (if logged in)
  // Conditional: Login/Register OR User/Logout
  { icon: <ThemeIcon />, label: darkMode ? "Light Mode" : "Dark Mode", onClick: toggleDarkMode },
];
```

### Phase 4: Style Customization
Customize the Dock appearance:
- Panel background: Use GlassSurface with dark theme settings
- Item hover: Magnification from 50px to 70px
- Active route: Indigo glow indicator dot below icon
- Icon colors: Match current navbar icon colors (indigo, purple, etc.)

### Phase 5: Mobile Responsiveness
Handle mobile layout:
- Hide dock on screens < 768px (md breakpoint)
- Show floating action button that opens a glass overlay menu
- Reuse GlassSurface for mobile menu items

### Phase 6: Polish & Accessibility
- Add keyboard navigation (Tab through items)
- Add ARIA labels for screen readers
- Ensure focus-visible styles work with GlassSurface
- Test spring animation performance

## Technical Specifications

### Dock Props Configuration
```tsx
<Dock
  items={dockItems}
  className="bg-[#060010]/80"
  spring={{ mass: 0.1, stiffness: 150, damping: 12 }}
  magnification={70}
  distance={200}
  panelHeight={68}
  dockHeight={256}
  baseItemSize={50}
/>
```

### GlassSurface Integration per DockItem
```tsx
<GlassSurface
  width={size}  // animated via motion value
  height={size}
  borderRadius={size / 2}  // circular
  brightness={isActive ? 60 : 50}
  backgroundOpacity={isActive ? 0.08 : 0.04}
  blur={12}
  className="cursor-pointer"
>
  <DockIcon>{icon}</DockIcon>
</GlassSurface>
```

### Active Route Indicator
```tsx
{isActive && (
  <motion.div
    layoutId="dock-indicator"
    className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"
  />
)}
```

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/ui/Dock.tsx` | CREATE | New Dock component with GlassSurface integration |
| `src/App.tsx` | MODIFY | Replace navbar with Dock, add dock items config |
| `src/components/ui/GlassSurface.tsx` | MINOR | May need to expose animated width/height support |

## Dependencies
- `framer-motion` (motion/react) - Already installed v12.33.0
- `react-router-dom` - Already installed v6.22.3

## Risks & Mitigations
1. **Performance**: Many GlassSurface instances with SVG filters could be heavy
   - Mitigation: Use simpler GlassSurface settings (lower blur, no chromatic aberration for inactive items)
   
2. **Browser compatibility**: SVG filters not supported in Safari/Firefox
   - Mitigation: GlassSurface already has CSS backdrop-filter fallback

3. **Animation conflicts**: Framer-motion spring + GlassSurface ResizeObserver
   - Mitigation: Use motion values directly in GlassSurface or debounce updates

## Success Criteria
- Dock renders at bottom center of screen with liquid glass effect
- Hover magnification animates smoothly (60fps)
- Tooltip labels appear above icons on hover
- Active route shows indicator dot
- Mobile shows alternative navigation (hamburger/overlay)
- All existing navigation routes remain functional
