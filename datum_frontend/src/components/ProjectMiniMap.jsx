import { useEffect, useRef } from "react";
import GeoJSON from "ol/format/GeoJSON";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import { fromLonLat } from "ol/proj";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import { defaults as defaultControls } from "ol/control/defaults";
import { defaults as defaultInteractions } from "ol/interaction/defaults";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style";

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

export default function ProjectMiniMap({
    geojson,
    interactive = true,
    className = "h-[260px] w-full overflow-hidden rounded-3xl",
}) {
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
            controls: interactive
                ? undefined
                : defaultControls({ attribution: false, rotate: false, zoom: false }),
            interactions: interactive
                ? undefined
                : defaultInteractions({
                      altShiftDragRotate: false,
                      doubleClickZoom: false,
                      dragPan: false,
                      keyboard: false,
                      mouseWheelZoom: false,
                      pinchRotate: false,
                      pinchZoom: false,
                      shiftDragZoom: false,
                  }),
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
    }, [interactive]);

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
                    duration: interactive ? 400 : 0,
                });
            }
        } catch (error) {
            console.error("Ошибка отображения GeoJSON проекта:", error);
        }
    }, [geojson, interactive]);

    return <div ref={mapElementRef} className={className} />;
}
