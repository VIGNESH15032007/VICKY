import React from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';

export const getGoogleMapsApiKey = () => {
  return import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
};

export const getGoogleMapsMapId = () => {
  return import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';
};

export const isGoogleMapsConfigured = () => {
  const key = getGoogleMapsApiKey();
  return Boolean(
    key &&
    !key.includes('your_google_maps_api_key') &&
    !key.includes('placeholder')
  );
};

export default function GoogleMapsProvider({ children, fallback = null }) {
  const apiKey = getGoogleMapsApiKey();
  const configured = isGoogleMapsConfigured();

  if (!configured) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center p-6 bg-surface-container-lowest border border-surface-container-high/60 rounded-2xl text-center">
        <div className="max-w-md flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">map</span>
          </div>
          <h3 className="text-base font-bold text-on-surface">
            Google Maps API Key Required
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            To view the real Google Map with real-time transit telemetry, configure your API key in <code className="px-1.5 py-0.5 rounded bg-surface-container-high text-primary font-mono text-[11px]">.env.local</code>:
          </p>
          <div className="w-full bg-surface-container p-3 rounded-xl border border-surface-container-high text-left">
            <pre className="text-[11px] font-mono text-tertiary select-all overflow-x-auto">
              VITE_GOOGLE_MAPS_API_KEY=AIzaSy...
            </pre>
          </div>
          <div className="text-[11px] text-outline">
            Need a key? Visit the{' '}
            <a
              href="https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_git_agentskills_v1"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline hover:text-primary-fixed"
            >
              Google Maps Demo Key Quickstart
            </a>{' '}
            or Google Cloud Console.
          </div>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey} libraries={['maps', 'marker', 'geometry']}>
      {children}
    </APIProvider>
  );
}
