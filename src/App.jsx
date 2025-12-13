import { useState, useRef, useEffect } from 'react';
import PaletteSelector from './components/PaletteSelector';
import SettingsMenu from './components/SettingsMenu';
import { processImage, exportImage, generatePaletteFromImage, PALETTES } from './utils/imageProcessor';
import './App.css';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [processedCanvas, setProcessedCanvas] = useState(null);
  const [selectedPalette, setSelectedPalette] = useState('CGA');
  const [allPalettes, setAllPalettes] = useState(PALETTES);
  const [isProcessing, setIsProcessing] = useState(false);
  const [adjustments, setAdjustments] = useState({
    exposure: 0,
    contrast: 0,
    chrominance: 0,
    dithering: 0
  });
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  const handleImageSelect = async (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);

      // Generate palette from image
      try {
        const generatedPalette = await generatePaletteFromImage(file);

        // Add auto palette to the list
        const newPalettes = { 'Auto (From Image)': generatedPalette, ...PALETTES };
        setAllPalettes(newPalettes);

        // Auto-select the generated palette
        setSelectedPalette('Auto (From Image)');
      } catch (error) {
        console.error('Error generating palette:', error);
      }
    }
  };

  const handlePaletteChange = (paletteName) => {
    setSelectedPalette(paletteName);
  };

  const handleAdjustmentChange = (adjustmentType, value) => {
    setAdjustments(prev => ({
      ...prev,
      [adjustmentType]: value
    }));
  };

  const handleExport = () => {
    if (processedCanvas) {
      exportImage(processedCanvas);
    }
  };

  // Process image when image, palette, or adjustments change
  useEffect(() => {
    if (selectedImage && selectedPalette && allPalettes[selectedPalette]) {
      setIsProcessing(true);
      const palette = allPalettes[selectedPalette];
      processImage(selectedImage, 256, 128, palette, adjustments)
        .then((result) => {
          setProcessedCanvas(result.canvas);
          setIsProcessing(false);
        })
        .catch((error) => {
          console.error('Error processing image:', error);
          setIsProcessing(false);
        });
    }
  }, [selectedImage, selectedPalette, allPalettes, adjustments]);

  // Draw canvas to display
  useEffect(() => {
    if (processedCanvas && canvasRef.current) {
      const displayCtx = canvasRef.current.getContext('2d');
      canvasRef.current.width = processedCanvas.width;
      canvasRef.current.height = processedCanvas.height;
      displayCtx.drawImage(processedCanvas, 0, 0);
    }
  }, [processedCanvas]);

  return (
    <div className="app">
      <SettingsMenu
        adjustments={adjustments}
        onAdjustmentChange={handleAdjustmentChange}
      />

      <header className="app-header">
        <h1 className="app-title">LOWRESLOVE</h1>
        <p className="app-subtitle">RETRO IMAGE CONVERTER</p>
      </header>

      <div className="app-content">
        <div className="preview-section">
          {!selectedImage ? (
            <button
              className="select-photo-button"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="button-content">
                <div className="button-icon">+</div>
                <div className="button-text">SELECT PHOTO</div>
              </div>
            </button>
          ) : (
            <div
              className="preview-container"
              onClick={handleExport}
              title="Click to export image"
            >
              {isProcessing ? (
                <div className="processing-message">PROCESSING...</div>
              ) : (
                <>
                  <canvas ref={canvasRef} className="preview-canvas" />
                  {/* <div className="export-hint">TAP TO EXPORT</div> */}
                </>
              )}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />
          {selectedImage && (
            <button
              className="change-photo-button"
              onClick={() => fileInputRef.current?.click()}
            >
              CHANGE PHOTO
            </button>
          )}
        </div>

        <PaletteSelector
          selectedPalette={selectedPalette}
          onSelectPalette={handlePaletteChange}
          palettes={allPalettes}
        />
      </div>

      <footer className="app-footer">
        <p>8-COLOR PIXEL ART CONVERTER</p>
      </footer>
    </div>
  );
}

export default App;
