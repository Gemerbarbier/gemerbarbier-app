import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";

declare global {
  interface Window {
    google: any;
  }
}

const GoogleMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        // Fetch maps configuration from edge function
        const { data, error: configError } = await supabase.functions.invoke('get-maps-config');
        
        if (configError) throw configError;
        if (!data?.apiKey || !data?.placeId) {
          throw new Error('Maps configuration not available');
        }

        const { apiKey, placeId } = data;

        // Load Google Maps script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=sk`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
          if (!mapRef.current || !window.google) return;

          // Dark mode styling for the map
          const darkModeStyles = [
            { elementType: "geometry", stylers: [{ color: "#1a1a1a" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a1a" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#8b8b8b" }] },
            {
              featureType: "administrative.locality",
              elementType: "labels.text.fill",
              stylers: [{ color: "#d4af37" }],
            },
            {
              featureType: "poi",
              elementType: "labels.text.fill",
              stylers: [{ color: "#8b8b8b" }],
            },
            {
              featureType: "poi.park",
              elementType: "geometry",
              stylers: [{ color: "#1f1f1f" }],
            },
            {
              featureType: "poi.park",
              elementType: "labels.text.fill",
              stylers: [{ color: "#6b6b6b" }],
            },
            {
              featureType: "road",
              elementType: "geometry",
              stylers: [{ color: "#2d2d2d" }],
            },
            {
              featureType: "road",
              elementType: "geometry.stroke",
              stylers: [{ color: "#1f1f1f" }],
            },
            {
              featureType: "road",
              elementType: "labels.text.fill",
              stylers: [{ color: "#8b8b8b" }],
            },
            {
              featureType: "road.highway",
              elementType: "geometry",
              stylers: [{ color: "#3d3d3d" }],
            },
            {
              featureType: "road.highway",
              elementType: "geometry.stroke",
              stylers: [{ color: "#1f1f1f" }],
            },
            {
              featureType: "road.highway",
              elementType: "labels.text.fill",
              stylers: [{ color: "#a8a8a8" }],
            },
            {
              featureType: "transit",
              elementType: "geometry",
              stylers: [{ color: "#2d2d2d" }],
            },
            {
              featureType: "transit.station",
              elementType: "labels.text.fill",
              stylers: [{ color: "#8b8b8b" }],
            },
            {
              featureType: "water",
              elementType: "geometry",
              stylers: [{ color: "#0f0f0f" }],
            },
            {
              featureType: "water",
              elementType: "labels.text.fill",
              stylers: [{ color: "#515151" }],
            },
            {
              featureType: "water",
              elementType: "labels.text.stroke",
              stylers: [{ color: "#0f0f0f" }],
            },
          ];

          // Create a service to get place details
          const service = new (window as any).google.maps.places.PlacesService(
            document.createElement('div')
          );

          service.getDetails(
            {
              placeId: placeId,
              fields: ['geometry', 'name', 'formatted_address'],
            },
            (place: any, status: any) => {
              if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
                const location = place.geometry.location;

                // Initialize the map
                const map = new (window as any).google.maps.Map(mapRef.current!, {
                  center: location,
                  zoom: 16,
                  styles: darkModeStyles,
                  mapTypeControl: false,
                  streetViewControl: false,
                  fullscreenControl: true,
                });

                // Add a marker for the location
                const marker = new (window as any).google.maps.Marker({
                  position: location,
                  map: map,
                  title: place.name || 'Gemerbarbier',
                  animation: (window as any).google.maps.Animation.DROP,
                  cursor: 'pointer',
                });

                // Add click listener to open Google Maps in new tab
                marker.addListener('click', () => {
                  const lat = location.lat();
                  const lng = location.lng();
                  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${placeId}`;
                  window.open(url, '_blank');
                });

                setLoading(false);
              } else {
                throw new Error('Failed to load place details');
              }
            }
          );
        };

        script.onerror = () => {
          throw new Error('Failed to load Google Maps');
        };

        document.head.appendChild(script);
      } catch (err) {
        console.error('Error initializing map:', err);
        setError(err instanceof Error ? err.message : 'Failed to load map');
        setLoading(false);
      }
    };

    initMap();
  }, []);

  if (error) {
    return (
      <Card className="overflow-hidden border-border">
        <div className="aspect-video bg-gradient-dark flex items-center justify-center">
          <div className="text-center space-y-4 p-8">
            <MapPin className="w-16 h-16 text-destructive mx-auto" />
            <p className="text-muted-foreground text-lg">
              Nepodarilo sa načítať mapu
            </p>
            <p className="text-sm text-muted-foreground">
              {error}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-border">
      <div className="aspect-video relative">
        {loading && (
          <div className="absolute inset-0 bg-gradient-dark flex items-center justify-center z-10">
            <div className="text-center space-y-4">
              <MapPin className="w-16 h-16 text-accent mx-auto animate-pulse" />
              <p className="text-muted-foreground text-lg">
                Načítavam mapu...
              </p>
            </div>
          </div>
        )}
        <div ref={mapRef} className="w-full h-full" />
      </div>
    </Card>
  );
};

export default GoogleMap;
