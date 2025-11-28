# Assets Folder

This folder contains images, icons, and other static assets for the app.

## Structure

- `images/` - Image files (PNG, JPG, etc.)
- `icons/` - Icon files (PNG, SVG, etc.)

## Usage in Code

Import images/icons like this:

```typescript
import HistoryIcon from '../assets/icons/history.png';
import CloseIcon from '../assets/icons/close.png';

// Then use in Image component:
<Image source={HistoryIcon} style={{width: 24, height: 24}} />
```

## Supported Formats

- PNG (recommended for icons)
- JPG/JPEG (for photos)
- SVG (requires react-native-svg library)

## Best Practices

- Use PNG for icons with transparency
- Use 2x and 3x versions for retina displays (e.g., icon@2x.png, icon@3x.png)
- Keep file sizes small for better performance

