// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useState, useEffect } from "react";
import { Amplify } from "aws-amplify";
import { fetchAuthSession } from "aws-amplify/auth";
import { LocationClient } from "@aws-sdk/client-location";
import { IDENTITY_POOL_ID, REGION, MAP, PLACE } from "./configuration";
import {
  ROUTES_PANEL,
  GEOFENCES_PANEL,
  TRACKERS_PANEL,
  MAP_CONTAINER,
  GEOFENCE_DRAWING_MODE,
  DEVICE_POSITION_HISTORY_VIEWER,
} from "./constants";
import PlacesLayer from "./components/places/PlacesLayer";
import RoutesLayer from "./components/routes/RoutesLayer";
import GeofencesLayer from "./components/geofences/GeofencesLayer";
import TrackersLayer from "./components/trackers/TrackersLayer";
import { MapView } from "@aws-amplify/ui-react-geo";
import { NavigationControl } from "react-map-gl";
import "@aws-amplify/ui-react/styles.css";
import "@aws-amplify/ui-react-geo/styles.css";
import "./index.css";

// Configuring Amplify Geo with existing Amazon Cognito and Amazon Location Service information
// Fill values in configuration.js
Amplify.configure({
  Auth: {
    Cognito: {
      identityPoolId: IDENTITY_POOL_ID, // REQUIRED - Amazon Cognito Identity Pool ID
      allowGuestAccess: true,
    },
  },
  Geo: {
    LocationService: {
      maps: {
        items: {
          [MAP.NAME]: {
            // REQUIRED - Amazon Location Service Map resource name
            style: MAP.STYLE, // REQUIRED - String representing the style of map resource
          },
        },
        default: MAP.NAME, // REQUIRED - Amazon Location Service Map resource name to set as default
      },
      // Amplify.configure requires searchIndices, while LocationSearch requires search_indices
      searchIndices: {
        items: [PLACE], // REQUIRED - Amazon Location Service Place Index name
        default: PLACE, // REQUIRED - Amazon Location Service Place Index name to set as default
      },
      search_indices: {
        items: [PLACE], // REQUIRED - Amazon Location Service Place Index name
        default: PLACE, // REQUIRED - Amazon Location Service Place Index name to set as default
      },
      region: REGION, // REQUIRED - Amazon Location Service Region
    },
  },
});

const App = () => {
  const [credentials, setCredentials] = useState();
  const [client, setClient] = useState();
  const [clickedLngLat, setClickedLngLat] = useState();
  const [openedPanel, setOpenedPanel] = useState();
  const [openedInfoBox, setOpenedInfoBox] = useState();

  //Fetch credentials when the app loads
  useEffect(() => {
    const fetchCredentials = async () => {
      // Fetch AWS credentials from Amazon Cognito using Amplify Auth and storing it in state
      const authSession = await fetchAuthSession();
      setCredentials(authSession.credentials);
    };
    fetchCredentials();
  }, []);

  // Instantiate client for aws-sdk whenever the credentials change
  useEffect(() => {
    if (credentials != null) {
      // Instantiate client for aws-sdk method calls
      const client = new LocationClient({
        credentials,
        region: REGION,
      });

      setClient(client);
    }
  }, [credentials]);

  // Store coordinates of clicked position on the map
  const handleMapClick = (e) => {
    if (e.lngLat) {
      setClickedLngLat(e.lngLat);
    }
  };

  // Update state of the currently opened panel
  const handlePanelChange = (panel) => {
    setOpenedPanel(panel);
  };

  return (
    <>
      {client ? (
        <MapView
          id={MAP_CONTAINER}
          width="100%"
          height="100vh"
          initialViewState={{
            longitude: -123.1187,
            latitude: 49.2819,
            zoom: 11,
          }}
          mapStyle={MAP.NAME}
          onClick={handleMapClick}
          maxZoom={16}
        >
          <NavigationControl position="bottom-right" />
          <PlacesLayer />
          <RoutesLayer
            client={client}
            clickedLngLat={clickedLngLat}
            isOpenedPanel={openedPanel === ROUTES_PANEL ? true : false}
            onPanelChange={handlePanelChange}
          />
          <GeofencesLayer
            client={client}
            isOpenedPanel={openedPanel === GEOFENCES_PANEL ? true : false}
            onPanelChange={handlePanelChange}
            isDrawing={openedInfoBox === GEOFENCE_DRAWING_MODE ? true : false}
            onDrawingChange={(status) =>
              status ? setOpenedInfoBox(GEOFENCE_DRAWING_MODE) : setOpenedInfoBox()
            }
          />
          <TrackersLayer
            client={client}
            clickedLngLat={clickedLngLat}
            isOpenedPanel={openedPanel === TRACKERS_PANEL ? true : false}
            onPanelChange={handlePanelChange}
            isViewingDeviceHistory={openedInfoBox === DEVICE_POSITION_HISTORY_VIEWER ? true : false}
            onViewingDeviceHistoryChange={(status) =>
              status ? setOpenedInfoBox(DEVICE_POSITION_HISTORY_VIEWER) : setOpenedInfoBox()
            }
          />
        </MapView>
      ) : (
        <h1>Loading...</h1>
      )}
    </>
  );
};

export default App;
