import React, {useEffect, useState} from 'react';
import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';

let loadPromise: Promise<void> | null = null;

function loadToolPilotFonts(): Promise<void> {
  if (loadPromise) return loadPromise;
  const faces = [
    new FontFace('Inter', `url("${staticFile('fonts/InterVariable.woff2')}")`, {
      weight: '100 900',
      style: 'normal',
      display: 'swap',
    }),
    new FontFace(
      'JetBrains Mono',
      `url("${staticFile('fonts/JetBrainsMono-Regular.woff2')}")`,
      {
        weight: '400',
        style: 'normal',
        display: 'swap',
      },
    ),
    new FontFace(
      'JetBrains Mono',
      `url("${staticFile('fonts/JetBrainsMono-Bold.woff2')}")`,
      {
        weight: '700',
        style: 'normal',
        display: 'swap',
      },
    ),
  ];
  loadPromise = Promise.all(faces.map((face) => face.load())).then((loaded) => {
    for (const face of loaded) document.fonts.add(face);
  });
  return loadPromise;
}

/**
 * Blocks the Remotion screenshot until the local, licensed brand fonts are
 * ready. Rendering with fallback fonts would silently change every layout.
 */
export const FontLoader: React.FC = () => {
  const [handle] = useState(() => delayRender('Loading ToolPilot fonts'));

  useEffect(() => {
    let active = true;
    loadToolPilotFonts()
      .then(() => {
        if (active) continueRender(handle);
      })
      .catch((error: unknown) => {
        if (active) {
          cancelRender(
            error instanceof Error
              ? error
              : new Error('Could not load ToolPilot fonts'),
          );
        }
      });
    return () => {
      active = false;
    };
  }, [handle]);

  return null;
};
