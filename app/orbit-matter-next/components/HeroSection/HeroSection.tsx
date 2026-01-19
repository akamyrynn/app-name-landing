"use client";

import { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import {
  TABLE_MATERIALS,
  TABLE_SHAPES,
  CUTOUT_TYPES,
  TableMaterial,
  TableCutout,
} from "../../utils/pageData";
import "./HeroSection.css";

const TableConfigurator3D = dynamic(() => import("./TableConfigurator3D"), {
  ssr: false,
  loading: () => <div className="configurator-loading">Загрузка 3D...</div>,
});

interface HeroSectionProps {
  title: string;
  bodyCopy: string;
  imageSrc: string;
  callouts: string[];
  isPreloaderShowing: boolean;
}

export default function HeroSection({
  title,
  bodyCopy,
}: HeroSectionProps) {
  // Table configuration state
  const [selectedMaterial, setSelectedMaterial] = useState<TableMaterial>(TABLE_MATERIALS[0]);
  const [width, setWidth] = useState(120);
  const [length, setLength] = useState(80);
  const [thickness, setThickness] = useState(4);
  const [shape, setShape] = useState("rectangle");
  const [cutouts, setCutouts] = useState<TableCutout[]>([]);

  const addCutout = (type: string) => {
    const newCutout: TableCutout = {
      id: `cutout-${Date.now()}`,
      type,
      x: 0,
      y: 0,
      width: 30,
      height: 40,
    };
    setCutouts([...cutouts, newCutout]);
  };

  const removeCutout = (id: string) => {
    setCutouts(cutouts.filter((c) => c.id !== id));
  };

  const exportToPDF = () => {
    alert("Экспорт в PDF - функция в разработке");
  };

  const addToCart = () => {
    alert("Добавлено в корзину!");
  };

  const titleLines = title.split("\n");

  return (
    <section className="hero-configurator">
      <div className="configurator-container">
        {/* Left side - 3D Viewer */}
        <div className="configurator-viewer">
          <div className="viewer-header">
            <h1>
              {titleLines.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < titleLines.length - 1 && <br />}
                </span>
              ))}
            </h1>
            <p className="viewer-subtitle">{bodyCopy}</p>
          </div>

          <div className="viewer-canvas">
            <Suspense fallback={<div className="configurator-loading">Загрузка...</div>}>
              <TableConfigurator3D
                material={selectedMaterial}
                width={width / 50}
                length={length / 50}
                thickness={thickness / 50}
                shape={shape}
                cutouts={cutouts}
              />
            </Suspense>
          </div>

          <div className="viewer-info">
            <div className="info-item">
              <span className="info-label">Размеры:</span>
              <span className="info-value">{width} × {length} × {thickness} см</span>
            </div>
            <div className="info-item">
              <span className="info-label">Материал:</span>
              <span className="info-value">{selectedMaterial.name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Форма:</span>
              <span className="info-value">
                {TABLE_SHAPES.find(s => s.id === shape)?.name}
              </span>
            </div>
          </div>
        </div>

        {/* Right side - Controls Panel */}
        <div className="configurator-controls">
          <div className="controls-scroll">
            {/* Material Selection */}
            <div className="control-section">
              <h3 className="control-title">Материал</h3>
              <div className="control-grid">
                {TABLE_MATERIALS.map((mat) => (
                  <button
                    key={mat.id}
                    className={`control-card ${selectedMaterial.id === mat.id ? "active" : ""}`}
                    onClick={() => setSelectedMaterial(mat)}
                  >
                    <div
                      className="material-preview"
                      style={{ backgroundColor: mat.color }}
                    />
                    <span className="control-label">{mat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Shape Selection */}
            <div className="control-section">
              <h3 className="control-title">Форма столешницы</h3>
              <div className="control-grid">
                {TABLE_SHAPES.map((s) => (
                  <button
                    key={s.id}
                    className={`control-btn ${shape === s.id ? "active" : ""}`}
                    onClick={() => setShape(s.id)}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Dimensions */}
            <div className="control-section">
              <h3 className="control-title">Размеры (см)</h3>
              
              <div className="control-slider">
                <label>
                  <span>Длина: {width} см</span>
                  <input
                    type="range"
                    min="60"
                    max="300"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                  />
                </label>
              </div>

              <div className="control-slider">
                <label>
                  <span>Ширина: {length} см</span>
                  <input
                    type="range"
                    min="40"
                    max="200"
                    value={length}
                    onChange={(e) => setLength(Number(e.target.value))}
                  />
                </label>
              </div>

              <div className="control-slider">
                <label>
                  <span>Толщина: {thickness} см</span>
                  <input
                    type="range"
                    min="2"
                    max="10"
                    value={thickness}
                    onChange={(e) => setThickness(Number(e.target.value))}
                  />
                </label>
              </div>
            </div>

            {/* Cutouts */}
            <div className="control-section">
              <h3 className="control-title">Вырезы</h3>
              <div className="control-grid">
                {CUTOUT_TYPES.map((cutout) => (
                  <button
                    key={cutout.id}
                    className="control-btn"
                    onClick={() => addCutout(cutout.id)}
                  >
                    + {cutout.name}
                  </button>
                ))}
              </div>

              {cutouts.length > 0 && (
                <div className="cutouts-list">
                  {cutouts.map((cutout) => (
                    <div key={cutout.id} className="cutout-item">
                      <span>
                        {CUTOUT_TYPES.find(t => t.id === cutout.type)?.name}
                      </span>
                      <button
                        className="cutout-remove"
                        onClick={() => removeCutout(cutout.id)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="control-section">
              <button className="control-btn-primary" onClick={addToCart}>
                Добавить в корзину
              </button>
              <button className="control-btn-secondary" onClick={exportToPDF}>
                Экспорт в PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
