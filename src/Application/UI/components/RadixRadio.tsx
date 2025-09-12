import React from 'react';
import * as RadioGroup from '@radix-ui/react-radio-group';
import UIEventBus from '../EventBus';
import { cn } from '../lib/utils';
import { getRadixStyle } from '../lib/RadixHelper';

type RadixRadioProps = {
  items?: string[];
  defaultValue?: string;
};

const SCREEN_MAP: { [key: string]: string } = {
  A: 'https://calm-context-197021.framer.app/',
  Y: 'https://gemini-os-79538617613.us-west1.run.app',
  B: 'https://morphic-ai-answer-engine-generative-nine-delta.vercel.app/',
  C: 'https://morphic-ai-answer-engine-generative-9ro6diyxa.vercel.app/',
  D: 'https://juno-watts-kappa.vercel.app/',
  E: 'https://goonify-66977310969.us-west1.run.app/',
};

export default function RadixRadio({ items = ['A', 'Y', 'B', 'C', 'D', 'E'], defaultValue }: RadixRadioProps) {
  return (
    <RadioGroup.Root
      className="flex gap-2 items-center"
      defaultValue={defaultValue || items[0]}
      onValueChange={(v: string) => {
        // Map selected key to a screen URL and ask MonitorScreen to load it.
        const url = SCREEN_MAP[v] || v;
        UIEventBus.dispatch('setScreenURL', url);
        // trigger typing SFX via existing bridge
        window.postMessage({ type: 'keydown', key: `_AUTO_` }, '*');
      }}
      style={getRadixStyle({
        position: 'relative',
        pointerEvents: 'auto',
        zIndex: 2147483647
      })}
      onClick={(e) => {
        // Stop propagation to prevent events reaching WebGL canvas
        e.stopPropagation();
      }}
    >
      {items.map((it) => (
        <RadioGroup.Item
          key={it}
          value={it}
          className={cn(
            'w-6 h-6 rounded-full flex items-center justify-center border border-white bg-black/80',
            'focus:outline-none focus:ring focus:ring-white/30 hover:bg-black/70'
          )}
          aria-label={`screen-${it}`}
          data-prevent-monitor="true"
          onClick={(e) => {
            // Stop propagation to prevent events reaching WebGL canvas
            e.stopPropagation();
          }}
        >
          <RadioGroup.Indicator className="w-3 h-3 bg-white rounded-full" />
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
}
