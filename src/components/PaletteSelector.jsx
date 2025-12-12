export default function PaletteSelector({ selectedPalette, onSelectPalette, palettes }) {
  return (
    <div className="palette-selector">
      <h2 className="palette-title">SELECT PALETTE</h2>
      <div className="palette-grid">
        {Object.keys(palettes).map((paletteName) => (
          <div
            key={paletteName}
            className={`palette-item ${selectedPalette === paletteName ? 'selected' : ''}`}
            onClick={() => onSelectPalette(paletteName)}
          >
            <div className="palette-name">{paletteName}</div>
            <div className="palette-colors">
              {palettes[paletteName].map((color, index) => (
                <div
                  key={index}
                  className="palette-color"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
