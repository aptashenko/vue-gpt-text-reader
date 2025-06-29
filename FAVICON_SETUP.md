# Favicon Setup

## Current Favicon

The app now uses a custom favicon designed for the language learning application:

- **File**: `public/favicon.svg`
- **Design**: Book with text lines and a globe symbol
- **Colors**: Purple gradient (#667eea to #764ba2) matching the app theme
- **Size**: 32x32 pixels

## Browser Support

The favicon is configured to work across different browsers and devices:

- **SVG favicon**: Modern browsers (primary)
- **PNG fallbacks**: For older browsers (referenced but not yet created)
- **Apple touch icon**: For iOS devices (referenced but not yet created)
- **Web manifest**: For PWA support

## To Generate Additional Formats

For complete browser support, you can generate additional favicon formats:

1. **Online favicon generators**:
   - [Favicon.io](https://favicon.io/)
   - [RealFaviconGenerator](https://realfavicongenerator.net/)

2. **Convert SVG to PNG/ICO**:
   - Use the `favicon.svg` as source
   - Generate sizes: 16x16, 32x32, 180x180 (Apple touch icon)

3. **Place generated files in `/public/`**:
   - `favicon-16x16.png`
   - `favicon-32x32.png`
   - `apple-touch-icon.png`

## Current Configuration

The `index.html` includes:
- SVG favicon (primary)
- PNG fallbacks (referenced)
- Apple touch icon (referenced)
- Web manifest for PWA
- Meta description for SEO

## Customization

To modify the favicon:
1. Edit `public/favicon.svg`
2. Update colors in the gradient definitions
3. Modify the book or globe design as needed
4. Regenerate PNG versions if needed 