// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { useCallback } from "react";
import { useControl } from "react-map-gl";

// Geofence drawing control using mapbox-gl-draw
const DrawControl = ({ draw, onCreate, onModeChange, onGeofenceCompletable }) => {
  const onRender = () => {
    //mapbox-gl-draw initiates control with two items
    const featureCollection = draw.getAll();
    if (
      featureCollection.features.length > 0 &&
      featureCollection.features[0].geometry.coordinates[0].length > 2
    ) {
      onGeofenceCompletable(true);
    }
  };

  // This is needed because the bundler is not making the passed
  // function available to the mapbox-gl-draw library.
  const drawCreate = useCallback((e) => onCreate(e), []);
  const drawModeChange = useCallback((e) => onModeChange(e), []);

  useControl(
    ({ map }) => {
      map.on("draw.create", drawCreate);
      map.on("draw.modechange", drawModeChange);
      map.on("draw.render", onRender);

      return draw;
    },
    ({ map }) => {
      map.off("draw.create", drawCreate);
      map.off("draw.modechange", drawModeChange);
      map.off("draw.render", onRender);
    }
  );

  return null;
};

export default DrawControl;
