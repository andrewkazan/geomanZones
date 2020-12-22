import L from "leaflet";
import noData from "./../assets/images/Nodata.png";

export const createMap = (
  startPoint,
  startZoom = 16,
  mapOptions,
  tileOptions
) => {
  const map = L.map("mapId", {
    zoomControl: false,
    ...mapOptions,
  }).setView(startPoint, startZoom);
  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 18,
      id: "CartoDB.VoyagerLabelsUnder",
      errorTileUrl: noData,
      ...tileOptions,
    }
  )
    .on("tileerror", (e) => {
      console.error("Tile not load:", e);
    })
    .addTo(map);
  return map;
};
