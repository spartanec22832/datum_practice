import { useEffect, useMemo, useRef } from "react";
import GeoJSON from "ol/format/GeoJSON";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import { fromLonLat } from "ol/proj";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style";

function getDefaultStyle() {
    return new Style({
        image: new CircleStyle({
            radius: 7,
            fill: new Fill({ color: "#0f172a" }),
            stroke: new Stroke({ color: "#ffffff", width: 2 }),
        }),
        fill: new Fill({
            color: "rgba(15, 23, 42, 0.14)",
        }),
        stroke: new Stroke({
            color: "#0f172a",
            width: 2,
        }),
    });
}

function getActiveStyle() {
    return new Style({
        image: new CircleStyle({
            radius: 9,
            fill: new Fill({ color: "#2563eb" }),
            stroke: new Stroke({ color: "#ffffff", width: 3 }),
        }),
        fill: new Fill({
            color: "rgba(37, 99, 235, 0.22)",
        }),
        stroke: new Stroke({
            color: "#2563eb",
            width: 3,
        }),
    });
}

export default function ProjectsMap({ projects, activeProject, onProjectClick }) {
    const mapElementRef = useRef(null);
    const mapRef = useRef(null);
    const vectorLayerRef = useRef(null);
    const vectorSourceRef = useRef(null);
    const activeProjectRef = useRef(null);

    const geoProjects = useMemo(() => {
        return projects.filter(
            (project) =>
                project.geojson &&
                typeof project.geojson === "object" &&
                project.geojson.type
        );
    }, [projects]);

    useEffect(() => {
        activeProjectRef.current = activeProject;
    }, [activeProject]);

    useEffect(() => {
        if (!mapElementRef.current || mapRef.current) {
            return;
        }

        const vectorSource = new VectorSource();

        const vectorLayer = new VectorLayer({
            source: vectorSource,
            style: (feature) => {
                const featureProject = feature.get("project");
                const isActive =
                    activeProjectRef.current &&
                    featureProject?.id === activeProjectRef.current.id;

                return isActive ? getActiveStyle() : getDefaultStyle();
            },
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

        map.on("singleclick", (event) => {
            let clickedProject = null;

            map.forEachFeatureAtPixel(event.pixel, (feature) => {
                clickedProject = feature.get("project");
                return true;
            });

            if (clickedProject && onProjectClick) {
                onProjectClick(clickedProject);
            }
        });

        mapRef.current = map;
        vectorLayerRef.current = vectorLayer;
        vectorSourceRef.current = vectorSource;

        return () => {
            map.setTarget(undefined);
            mapRef.current = null;
        };
    }, [onProjectClick]);

    useEffect(() => {
        const map = mapRef.current;
        const vectorSource = vectorSourceRef.current;
        const vectorLayer = vectorLayerRef.current;

        if (!map || !vectorSource || !vectorLayer) {
            return;
        }

        vectorSource.clear();

        const format = new GeoJSON();

        geoProjects.forEach((project) => {
            try {
                const features = format.readFeatures(project.geojson, {
                    featureProjection: "EPSG:3857",
                });

                features.forEach((feature) => {
                    feature.set("project", project);
                });

                vectorSource.addFeatures(features);
            } catch (error) {
                console.error("Ошибка чтения GeoJSON проекта:", project.title, error);
            }
        });

        vectorLayer.changed();

        if (!activeProject && vectorSource.getFeatures().length > 0) {
            const extent = vectorSource.getExtent();
            map.getView().fit(extent, {
                padding: [40, 40, 40, 40],
                maxZoom: 14,
                duration: 500,
            });
        }
    }, [geoProjects, activeProject]);

    useEffect(() => {
        const map = mapRef.current;
        const vectorLayer = vectorLayerRef.current;
        const vectorSource = vectorSourceRef.current;

        if (!map || !vectorLayer || !vectorSource) {
            return;
        }

        vectorLayer.changed();

        if (!activeProject) {
            if (vectorSource.getFeatures().length > 0) {
                map.getView().fit(vectorSource.getExtent(), {
                    padding: [40, 40, 40, 40],
                    maxZoom: 14,
                    duration: 400,
                });
            }
            return;
        }

        const activeFeatures = vectorSource
            .getFeatures()
            .filter((feature) => feature.get("project")?.id === activeProject.id);

        if (activeFeatures.length === 0) {
            return;
        }

        const activeSource = new VectorSource({
            features: activeFeatures,
        });

        map.getView().fit(activeSource.getExtent(), {
            padding: [60, 60, 60, 60],
            maxZoom: 15,
            duration: 400,
        });
    }, [activeProject]);

    return (
        <section
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex items-start justify-between px-5 py-4">
                <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        Карта проектов
                    </p>
                    <p className="text-sm text-slate-400 dark:text-slate-300">
                        Нажми на карточку проекта или объект на карте, чтобы показать его область
                    </p>
                </div>

                <div
                    className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-300">
                    На карте: {geoProjects.length}
                </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800">
                <div
                    className="h-[420px] w-full bg-slate-50 dark:bg-slate-950/80"
                    ref={mapElementRef}
                />
            </div>
        </section>
    );
}
