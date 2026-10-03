// Source: Google Maps Platform Code Assist
import { useEffect, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

/**
 * Declarative Polyline component for @vis.gl/react-google-maps
 */
export default function MapPolyline({
  path,
  strokeColor = '#a078ff',
  strokeOpacity = 0.9,
  strokeWeight = 4,
  zIndex = 1,
}) {
  const map = useMap();
  const polylineRef = useRef(null);

  useEffect(() => {
    if (!map || typeof window === 'undefined' || !window.google?.maps || !path || path.length < 2) {
      return;
    }

    const options = {
      path,
      strokeColor,
      strokeOpacity,
      strokeWeight,
      zIndex,
      map,
    };

    if (!polylineRef.current) {
      polylineRef.current = new window.google.maps.Polyline(options);
    } else {
      polylineRef.current.setOptions(options);
      polylineRef.current.setMap(map);
    }

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
    };
  }, [map, path, strokeColor, strokeOpacity, strokeWeight, zIndex]);

  return null;
}
