import { useState } from 'react';
import './SettingsMenu.css';

export default function SettingsMenu({ adjustments, onAdjustmentChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeControl, setActiveControl] = useState(null);

  const controls = [
    { id: 'exposure', label: 'EXPOSURE' },
    { id: 'contrast', label: 'CONTRAST' },
    { id: 'chrominance', label: 'CHROMINANCE' },
    { id: 'dithering', label: 'DITHERING' }
  ];

  const handleControlClick = (controlId) => {
    setActiveControl(activeControl === controlId ? null : controlId);
  };

  return (
    <div className="settings-menu">
      <button
        className="settings-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Settings"
      >
                <span className="settings-icon">⚙</span>

      </button>

      {isOpen && (
        <div className="settings-panel">
          <div className="settings-header">ADJUSTMENTS</div>
          {controls.map((control) => (
            <div key={control.id} className="setting-item">
              <button
                className={`setting-label ${activeControl === control.id ? 'active' : ''}`}
                onClick={() => handleControlClick(control.id)}
              >
                {control.label}
                <span className="setting-value">
                  {adjustments[control.id] > 0 ? '+' : ''}
                  {adjustments[control.id]}
                </span>
              </button>
              {activeControl === control.id && (
                <div className="slider-container">
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    value={adjustments[control.id]}
                    onChange={(e) => onAdjustmentChange(control.id, Number(e.target.value))}
                    className="adjustment-slider"
                  />
                  <div className="slider-marks">
                    <span>-10</span>
                    <span>0</span>
                    <span>+10</span>
                  </div>
                </div>
              )}
            </div>
          ))}
          <button
            className="reset-button"
            onClick={() => {
              controls.forEach(control => onAdjustmentChange(control.id, 0));
              setActiveControl(null);
            }}
          >
            RESET ALL
          </button>
        </div>
      )}
    </div>
  );
}
