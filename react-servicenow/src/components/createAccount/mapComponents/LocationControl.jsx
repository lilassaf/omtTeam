import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import L from "leaflet";
import { useMap } from "react-leaflet";
import { Button } from "@material-tailwind/react";

const ReactControlPortal = ({ children, container }) => {
  if (!container) return null;
  return ReactDOM.createPortal(children, container);
};

const LocationControl = React.memo(({ position, onButtonClick, loading }) => {
  const map = useMap();
  const controlContainerRef = useRef(null);

  useEffect(() => {
    const div = L.DomUtil.create("div", "leaflet-bar leaflet-control leaflet-control-custom");
    controlContainerRef.current = div;

    L.DomEvent.disableClickPropagation(div);
    L.DomEvent.disableScrollPropagation(div);

    const CustomControl = L.Control.extend({
      options: { position },
      onAdd: () => div,
      onRemove: () => div.parentNode?.removeChild(div),
    });

    const control = new CustomControl();
    map.addControl(control);

    return () => map.removeControl(control);
  }, [map, position]);

  return (
    <ReactControlPortal container={controlContainerRef.current}>
      <Button
        onClick={onButtonClick}
        variant="filled"
        color="blue"
        size="sm"
        disabled={loading}
      >
        {loading ? "Getting Location..." : "Use My Location"}
      </Button>
    </ReactControlPortal>
  );
});

export default LocationControl;