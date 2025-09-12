import React from 'react';
import UIEventBus from '../EventBus';

type SimpleRadioProps = {
  items?: string[];
  value?: string;
  onChange?: (v: string) => void;
  className?: string;
};

export default function SimpleRadio({
  items = ['A', 'B'],
  value,
  onChange,
  className = '',
}: SimpleRadioProps) {
  const handleChange = (v: string) => {
    // Emit local callback
    onChange?.(v);
    // Notify the rest of the app (follow existing event-bus patterns)
    UIEventBus.dispatch('screenControl', v);
    // Trigger typing SFX via existing synthetic-key mechanism
    try {
      window.postMessage({ type: 'keydown', key: `_AUTO_${v}` }, '*');
    } catch (e) {
      // best-effort
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {items.map((it) => (
        <label key={it} className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="radio"
            name="auxe-simple-radio"
            value={it}
            checked={value === undefined ? undefined : value === it}
            onChange={() => handleChange(it)}
            className="sr-only"
            aria-label={`Select ${it}`}
          />
          <span
            className={`w-5 h-5 rounded-full border border-white flex items-center justify-center transition-colors duration-150 ${
              value === it ? 'bg-white' : 'bg-transparent'
            }`}
            aria-hidden
          >
            {value === it && <span className="w-2 h-2 bg-black rounded-full" />}
          </span>
          <span className="font-mono text-sm" style={{ color: 'white' }}>
            {it}
          </span>
        </label>
      ))}
    </div>
  );
}
