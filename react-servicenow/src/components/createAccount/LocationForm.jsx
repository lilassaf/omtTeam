import React from "react";
import { Typography } from "@material-tailwind/react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import LocationMarker from "./mapComponents/LocationMarker";
import LocationControl from "./mapComponents/LocationControl";

const LocationForm = ({
  location,
  setLocation,
  locationLoading,
  getCurrentLocation,
  setLocationLoading,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <Typography variant="small" color="gray">
        (Click on the map or use "Use My Location")
      </Typography>

      <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-300 relative">
        <MapContainer
          center={[35.6895, -0.6]}
          zoom={6}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker
            location={location}
            setLocation={setLocation}
            setLocationLoading={setLocationLoading}
          />
          <LocationControl
            position="topright"
            onButtonClick={() => {
              setLocationLoading(true);
              getCurrentLocation().finally(() => {
                setLocationLoading(false);
              });
            }}
            loading={locationLoading}
          />
        </MapContainer>
        {locationLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <div className="text-white">Loading location...</div>
          </div>
        )}
      </div>

      {location && (
        <div className="text-sm text-gray-600 mt-2">
          <strong>Selected Location:</strong> {[
            location.road,
            location.city,
            location.state,
            location.country,
            location.postcode
          ].filter(Boolean).join(", ")}
        </div>
      )}
    </div>
  );
};

export default LocationForm;