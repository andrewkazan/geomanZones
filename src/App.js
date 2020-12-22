import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import SideBar from "./SibeBar";
import "./styles.css";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import { createMap } from "./utils";
import config from "./config";
import ErrorComponent from "./ErrorCompoment";

function App() {
  const [zones, setZones] = useState([]);
  const [isEditZone, setIsEditZone] = useState(false);
  const [isError, setIsError] = useState({});
  const [selectZone, setSelectZone] = useState({});

  const map = useRef(null);
  const newZones = useRef([]);
  const isMarkerDrag = useRef(false);
  const isZoneDrag = useRef(false);
  const mapZones = useRef(null);
  const mapEditZones = useRef(null);
  const clickedZone = useRef({});
  const isDragZoneMode = useRef(false);

  const isShowError = useMemo(() => Object.keys(isError).length !== 0, [
    isError,
  ]);

  const initMap = () => {
    map.current = createMap(config.mapCenter, config.mapZoom);
    mapZones.current = L.featureGroup().addTo(map.current);
    mapEditZones.current = L.featureGroup().addTo(map.current);
    map.current.pm.setLang("ru");

    map.current.on("pm:create", (e) => {
      if (newZones.current.length) {
        e.layer.remove();
        return;
      }

      newZones.current.push(e.layer);

      drawPmControls();
    });
  };

  const drawZones = () => {
    mapZones.current.clearLayers();
    zones.forEach((zone) =>
      L.polygon(zone.points, getZoneOptions(zone))
        .on("click", () => handleSelectZone(zone))
        .addTo(mapZones.current)
    );
  };

  const handleAddZone = () => {
    if (isEditZone.current) return;

    setSelectZone({
      id: new Date().getTime(),
      isNewZone: true,
      title: "",
      comment: "",
    });
    setIsEditZone(true);

    drawPmControls();
  };

  const drawPmControls = () => {
    if (!newZones.current.length) {
      map.current.pm.enableDraw("Polygon");
    } else {
      map.current.pm.disableDraw();
    }
  };

  const handleSaveZone = () => {
    const polygons = newZones.current.map((zone) => zone._latlngs);

    if (!polygons.length) {
      setIsError({ isError: true, typeError: "Не создана зона на карте" });
      return;
    }

    if (selectZone.hasOwnProperty("isNewZone")) {
      const newZoneForState = {
        id: selectZone.id,
        title: selectZone.title,
        comment: selectZone.comment,
        points: polygons[0][0],
      };

      setZones([...zones, newZoneForState]);
    } else {
      const findIndexCurrentSaveZone = zones.findIndex(
        (item) => item.id === selectZone.id
      );
      if (findIndexCurrentSaveZone !== -1) {
        const newZoneForState = {
          ...selectZone,
          title: selectZone.title,
          comment: selectZone.comment,
          points: polygons[0][0],
        };
        const newArr = Object.assign([], zones, {
          [findIndexCurrentSaveZone]: newZoneForState,
        });
        setZones([...newArr]);
      }

      isDragZoneMode.current = !isDragZoneMode.current;
    }

    removeDrawnZones();
    setIsEditZone(false);
    setIsError({});
    clearZone();
  };

  const clearZone = () => {
    setSelectZone({});
    clickedZone.current = {};
  };

  const removeDrawnZones = () => {
    if (newZones.current.length) {
      map.current.removeLayer(newZones.current[0]);
    }
    newZones.current = [];
  };

  const handleSelectZone = useCallback(
    (zone) => {
      if (isEditZone) return;

      if (clickedZone.current && clickedZone.current.id === zone.id) {
        clearZone();
        return;
      }

      setSelectZone(zone);
      clickedZone.current = zone;

      if (zone.points && zone.points.length) {
        map.current.fitBounds(zone.points, { maxZoom: 16 });
      }
    },
    [selectZone]
  );

  const handleClickOnEditable = (e) => {
    if (isDragZoneMode.current) return;

    mapZones.current.clearLayers();
    L.DomEvent.stopPropagation(e);
    map.current.pm.enableGlobalEditMode();
  };

  const handleEditZone = () => {
    setIsEditZone(true);
    drawPmControls();
  };

  const handleMarkerDrag = (e) => {
    setTimeout(
      () => (isMarkerDrag.current = e.type === "pm:markerdragstart"),
      0
    );
  };

  const handleZoneDrag = (e) => {
    setTimeout(() => (isZoneDrag.current = e.type === "pm:dragstart"), 0);
    mapZones.current.clearLayers();
  };

  const drawEditZones = () => {
    mapEditZones.current.clearLayers();
    removeDrawnZones();

    if (
      !(
        isEditZone &&
        selectZone &&
        selectZone.points &&
        Array.isArray(selectZone.points) &&
        selectZone.points.length
      )
    ) {
      return;
    }

    L.polygon(selectZone.points, {
      ...config.polygonStyles,
      ...config.activeStyles,
    })
      .on("click", handleClickOnEditable)
      .on("pm:markerdragstart", handleMarkerDrag)
      .on("pm:markerdragend", handleMarkerDrag)
      .on("pm:dragstart", handleZoneDrag)
      .on("pm:dragend", handleZoneDrag)
      .addTo(mapEditZones.current);

    newZones.current = mapEditZones.current.getLayers();

    drawPmControls();
  };

  const toggleDragZoneMode = () => {
    if (map.current.pm.globalEditEnabled()) {
      map.current.pm.disableGlobalEditMode();
    }

    map.current.pm.toggleGlobalDragMode();
    isDragZoneMode.current = !isDragZoneMode.current;
  };

  const getZoneOptions = (zone) => {
    let addStyles = {
      pmIgnore: true,
    };

    if (clickedZone.current && clickedZone.current.id === zone.id) {
      addStyles = isEditZone
        ? {
            ...addStyles,
            ...config.hiddenStyles,
          }
        : {
            ...addStyles,
            ...config.activeStyles,
          };
    }

    return {
      ...config.polygonStyles,
      ...addStyles,
    };
  };

  const handleDeleteZone = () => {
    const newZones = zones.filter((zone) => zone.id !== selectZone.id);
    setZones([...newZones]);
    setSelectZone({});
  };

  useEffect(() => {
    if (!map.current) initMap();
  }, []);

  useEffect(() => {
    if (!isEditZone) {
      drawZones();
    }
  }, [zones, selectZone, isEditZone]);

  useEffect(() => {
    drawEditZones();
  }, [isEditZone]);

  return (
    <div className="mainContainer">
      <SideBar
        {...{
          zones,
          handleAddZone,
          selectZone,
          isEditZone,
          handleEditZone,
          setSelectZone,
          setIsEditZone,
          setIsError,
          handleSaveZone,
          removeDrawnZones,
          handleSelectZone,
          drawZones,
          toggleDragZoneMode,
          isDragZoneMode,
          handleDeleteZone,
        }}
      />
      <div className="mapContainer" id="mapId" />
      {isShowError && <ErrorComponent {...{ ...isError, setIsError }} />}
    </div>
  );
}

export default App;
