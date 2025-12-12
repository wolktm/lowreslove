# LowResLove - Retro Image Converter

A retro-style image converter that transforms photos into low-resolution, 8-color pixel art. Built with React and Vite, installable as a Progressive Web App.

## Features

- Convert images to low resolution (256x128 with aspect ratio preserved)
- Auto-generated palette from your image using k-means color quantization
- 8-color palette conversion with multiple retro palettes:
  - Auto (From Image) - automatically extracted from your photo
  - CGA (IBM PC)
  - Commodore 64
  - ZX Spectrum
  - Apple II
  - Gameboy
  - Pico-8
- 8x upscaling for crisp display on modern screens
- Retro terminal-style interface
- Export processed images
- Installable as PWA on Android and other platforms

## Getting Started

### Install dependencies
```bash
npm install
```

### Run development server
```bash
npm run dev
```

### Build for production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

## How to Use

1. Click "SELECT PHOTO" to choose an image
2. The app automatically generates a custom 8-color palette from your image
3. Switch between the auto-generated palette or classic retro palettes
4. Preview the converted image in real-time
5. Tap the preview to export the result

## Technical Details

- **Framework**: React 19
- **Build Tool**: Vite 7
- **PWA Support**: vite-plugin-pwa
- **Image Processing**: HTML5 Canvas API
- **Color Quantization**: K-means clustering for palette extraction, nearest-neighbor for palette matching

## Deployment

### GitHub Pages (Recommended)

1. **Update the repository name** in [package.json](package.json:13):
   ```json
   "homepage": "https://YOUR_USERNAME.github.io/lowreslove"
   ```
   Replace `YOUR_USERNAME` with your GitHub username.

2. **Initialize git repository** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

3. **Create a GitHub repository** named `lowreslove` and push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/lowreslove.git
   git branch -M main
   git push -u origin main
   ```

4. **Deploy to GitHub Pages**:
   ```bash
   npm run deploy
   ```

5. **Enable GitHub Pages** in your repository settings:
   - Go to Settings > Pages
   - Source should be set to `gh-pages` branch
   - Your app will be live at `https://YOUR_USERNAME.github.io/lowreslove`

### Other Deployment Options

This app can also be deployed to:
- **Vercel**: `vercel --prod`
- **Netlify**: Drag and drop the `dist` folder
- **Cloudflare Pages**: Connect your GitHub repository

The PWA manifest allows it to be installed on Android devices as a standalone app.

## License

ISC
