# Home Button Color Fixed

## Change Applied

Changed the Home button color from green to purple/violet to match the Advanced Security page theme.

### Before:
- Background: `linear-gradient(45deg, var(--success), #059669)` (green)
- Box-shadow: `rgba(16, 185, 129, 0.3)` (green glow)
- Hover shadow: `rgba(16, 185, 129, 0.6)` (green glow intense)

### After:
- Background: `linear-gradient(45deg, var(--primary-violet), var(--accent-violet))` (purple)
- Box-shadow: `rgba(139, 92, 246, 0.3)` (purple glow)
- Hover shadow: `rgba(139, 92, 246, 0.6)` (purple glow intense)

## CSS Changes

File: `advanced-security-enhanced.html`
Lines: ~109-121

```css
.home-btn {
    background: linear-gradient(45deg, var(--primary-violet), var(--accent-violet));
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
}

.home-btn:hover {
    box-shadow: 0 0 30px rgba(139, 92, 246, 0.6);
}
```

The Home button now perfectly matches the purple/violet theme of the Advanced Security Center page.