import { useEffect, useRef } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { fromLonLat } from "ol/proj";
import { Fill, Stroke, Style, Circle as CircleStyle } from "ol/style";

function getProjectStyle() {
    return new Style({
        image: new CircleStyle({
            radius: 7,
            fill: new Fill({ color: "#0f172a" }),
            stroke: new Stroke({ color: "#ffffff", width: 2 }),
        }),
        fill: new Fill({
            color: "rgba(15, 23, 42, 0.16)",
        }),
        stroke: new Stroke({
            color: "#0f172a",
            width: 2,
        }),
    });
}

export default function ProjectMiniMap({ geojson }) {
    const mapElementRef = useRef(null);
    const mapRef = useRef(null);
    const vectorSourceRef = useRef(null);

    useEffect(() => {
        if (!mapElementRef.current || mapRef.current) {
            return;
        }

        const vectorSource = new VectorSource();

        const vectorLayer = new VectorLayer({
            source: vectorSource,
            style: getProjectStyle(),
        });

        const map = new Map({
            target: mapElementRef.current,
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
                vectorLayer,
            ],
            view: new View({
                center: fromLonLat([39.7015, 47.2357]),
                zoom: 10,
            }),
        });

        mapRef.current = map;
        vectorSourceRef.current = vectorSource;

        return () => {
            map.setTarget(undefined);
            mapRef.current = null;
        };
    }, []);

    useEffect(() => {
        const map = mapRef.current;
        const vectorSource = vectorSourceRef.current;

        if (!map || !vectorSource) {
            return;
        }

        vectorSource.clear();

        if (!geojson) {
            map.getView().setCenter(fromLonLat([39.7015, 47.2357]));
            map.getView().setZoom(10);
            return;
        }

        try {
            const format = new GeoJSON();
            const features = format.readFeatures(geojson, {
                featureProjection: "EPSG:3857",
            });

            vectorSource.addFeatures(features);

            if (features.length > 0) {
                map.getView().fit(vectorSource.getExtent(), {
                    padding: [30, 30, 30, 30],
                    maxZoom: 15,
                    duration: 400,
                });
            }
        } catch (error) {
            console.error("Ошибка отображения GeoJSON проекта:", error);
        }
    }, [geojson]);

    return (
        <div
            ref={mapElementRef}
            className="h-[260px] w-full overflow-hidden rounded-3xl"
        />
    );
}