import React, { useEffect } from "react";
import { Marker, useMapEvents, useMap } from "react-leaflet";

const LocationMarker = ({ location, setLocation, setLocationLoading }) => {
  const map = useMap();

  const reverseGeocode = async (lat, lng) => {
    setLocationLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      
      const locationData = {
        latitude: lat,
        longitude: lng,
        road: data.address?.road || '',
        city: data.address?.city || data.address?.town || data.address?.village || '',
        state: data.address?.state || '',
        country: data.address?.country || '',
        postcode: data.address?.postcode || '',
      };
      
      setLocation(locationData);
      return locationData;
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return {
        latitude: lat,
        longitude: lng,
        road: '',
        city: '',
        state: '',
        country: '',
        postcode: '',
      };
    } finally {
      setLocationLoading(false);
    }
  };

  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      const locationData = await reverseGeocode(lat, lng);
      map.flyTo([lat, lng], 11, { animate: true, duration: 1 });
    }
  });

  useEffect(() => {
    if (location?.latitude && location?.longitude) {
      map.flyTo([location.latitude, location.longitude], 11, {
        animate: true,
        duration: 1,
      });
    }
  }, [location?.latitude, location?.longitude, map]);

  return location?.latitude && location?.longitude ? (
    <Marker position={[location.latitude, location.longitude]} />
  ) : null;
};

export default LocationMarker;