"use client";

import { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import {
  TABLE_MATERIALS,
  TABLE_SHAPES,
  TABLE_COATINGS,
  CUTOUT_TYPES,
  TableMaterial,
  TableCutout,
  TableCoating,
} from "../../utils/pageData";
import { generateTechnicalDrawingPDF } from "../../utils/technicalDrawingGenerator";
import "./HeroSection.css";
import CheckoutModal from "../CheckoutModal";

const MATERIAL_PRICES: Record<string, number> = {
  wood051: 12000,
  wood084: 15000,
  woodfloor048: 13000,
  wood069: 18000,  // 2K
  wood009: 25000,  // 4K Тест
};

const COATING_PRICES: Record<string, number> = {
  none: 0,
  "osmo-3032": 2500,
  "osmo-3062": 2200,
  "osmo-3040": 2800,
  "osmo-3067": 2800,
  "osmo-3074": 3000,
  "osmo-3044": 2500,
  "osmo-3073": 2800,
  "osmo-3075": 3200,
  "osmo-3028": 2500,
};

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
  const [selectedCoating, setSelectedCoating] = useState<TableCoating>(TABLE_COATINGS[0]);
  const [width, setWidth] = useState(120);
  const [length, setLength] = useState(80);
  const [thickness, setThickness] = useState(4);
  const [shape, setShape] = useState("rectangle");
  const [cutouts, setCutouts] = useState<TableCutout[]>([]);

  // Checkout state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Price calculation
  const calculatePrice = () => {
    const area = (width / 100) * (length / 100); // m2
    const basePrice = MATERIAL_PRICES[selectedMaterial.id] || 10000;
    const coatingPrice = COATING_PRICES[selectedCoating.id] || 0;
    const thicknessFactor = 1 + ((thickness - 4) * 0.05); // +5% for each cm above 4
    const cutoutsPrice = cutouts.length * 1500;

    let total = (area * basePrice * thicknessFactor) + cutoutsPrice + (area * coatingPrice);

    // Shape complexity
    if (shape !== 'rectangle') total *= 1.15;

    return Math.round(total / 100) * 100; // Round to 100s
  };

  const addCutout = (type: string) => {
    const newCutout: TableCutout = {
      id: `cutout-${Date.now()}`,
      type,
      x: 0,
      y: 0,
      width: 30 / 50,
      height: 40 / 50,
      rotation: 90, // Fix default orientation (perpendicular to table)
    };
    setCutouts([...cutouts, newCutout]);
  };

  const updateCutoutProperty = (id: string, property: keyof TableCutout, value: number) => {
    setCutouts(cutouts.map(c =>
      c.id === id ? { ...c, [property]: value } : c
    ));
  };

  const removeCutout = (id: string) => {
    setCutouts(cutouts.filter((c) => c.id !== id));
  };

  const exportToPDF = async () => {
    await generateTechnicalDrawingPDF({
      material: selectedMaterial,
      coating: selectedCoating,
      shape,
      width,
      length,
      thickness: thickness / 50, // Convert to 3D units
      cutouts,
      price: calculatePrice()
    });
  };

  return (
    <section className="hero-configurator">
      {/* 1. Fullscreen 3D Viewer Background */}
      <div className="configurator-viewer">
        <div className="viewer-canvas">
          <Suspense fallback={<div className="configurator-loading">Загрузка 3D...</div>}>
            <TableConfigurator3D
              material={selectedMaterial}
              coating={selectedCoating}
              width={width / 50}
              length={length / 50}
              thickness={thickness / 50}
              shape={shape}
              cutouts={cutouts}
            />
          </Suspense>
        </div>
      </div>

      {/* 2. Left Top Panel - Add Elements */}
      <div className="glass-panel add-elements-panel">
        <button className="add-btn" onClick={() => addCutout('sink')}>
          <span>Кухонная раковина</span>
          <div className="add-btn-icon">+</div>
        </button>
      </div>

      {/* 3. Left Panel - Sink Position Controls (shows when cutouts exist) */}
      {cutouts.length > 0 && (
        <div className="glass-panel sink-position-panel">
          {cutouts.map((cutout) => (
            <div key={cutout.id} className="sink-control-row">
              <span className="sink-label">
                {CUTOUT_TYPES.find(t => t.id === cutout.type)?.name}
              </span>
              <div className="sink-sliders">
                <div className="sink-slider-group">
                  <span className="sink-slider-label">X</span>
                  <input
                    type="range"
                    min={-(width / 50) / 2}
                    max={(width / 50) / 2}
                    step={0.05}
                    value={cutout.x}
                    onChange={(e) => updateCutoutProperty(cutout.id, 'x', Number(e.target.value))}
                  />
                </div>
                <div className="sink-slider-group">
                  <span className="sink-slider-label">Y</span>
                  <input
                    type="range"
                    min={-(length / 50) / 2}
                    max={(length / 50) / 2}
                    step={0.05}
                    value={cutout.y}
                    onChange={(e) => updateCutoutProperty(cutout.id, 'y', Number(e.target.value))}
                  />
                </div>
                <div className="sink-slider-group">
                  <span className="sink-slider-label">R</span>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="5"
                    value={cutout.rotation || 0}
                    onChange={(e) => updateCutoutProperty(cutout.id, 'rotation', Number(e.target.value))}
                  />
                </div>
              </div>
              <button
                className="sink-remove-btn"
                onClick={() => removeCutout(cutout.id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 4. Right Top Panel - Material Selection */}
      <div className="glass-panel material-panel" data-lenis-prevent>
        <div className="controls-scroll">
          <div className="control-section">
            <div className="control-header">
              <h3>Материал столешницы</h3>
            </div>
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

          {/* Coating Selection */}
          <div className="control-section">
            <div className="control-header">
              <h3>Покрытие (OSMO)</h3>
            </div>
            <div className="control-grid coating-grid">
              {TABLE_COATINGS.map((coat) => (
                <button
                  key={coat.id}
                  className={`control-card ${selectedCoating.id === coat.id ? "active" : ""}`}
                  onClick={() => setSelectedCoating(coat)}
                >
                  <div
                    className="coating-preview"
                    style={{
                      backgroundColor: coat.color,
                      boxShadow: coat.clearcoat > 0 ? 'inset 0 0 10px rgba(255,255,255,0.5)' : 'none'
                    }}
                  />
                  <span className="control-label">{coat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Right Bottom Panel - Shape & Dimensions Controls */}
      <div className="glass-panel configurator-controls" data-lenis-prevent>
        <div className="controls-scroll">

          {/* Shape Selection */}
          <div className="control-section">
            <div className="control-header">
              <h3>Форма</h3>
            </div>
            <div className="shape-grid">
              {TABLE_SHAPES.map((s) => (
                <button
                  key={s.id}
                  className={`shape-btn ${shape === s.id ? "active" : ""}`}
                  onClick={() => setShape(s.id)}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Dimensions */}
          <div className="control-section">
            <div className="control-header">
              <h3>Размеры</h3>
            </div>

            <div className="control-slider">
              <div className="slider-label">
                <span>Длина</span>
                <span>{width} см</span>
              </div>
              <input
                className="slider-track"
                type="range"
                min="60"
                max="300"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
              />
            </div>

            <div className="control-slider">
              <div className="slider-label">
                <span>Ширина</span>
                <span>{length} см</span>
              </div>
              <input
                className="slider-track"
                type="range"
                min="40"
                max="200"
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
              />
            </div>

            <div className="control-slider">
              <div className="slider-label">
                <span>Толщина</span>
                <span>{thickness} см</span>
              </div>
              <input
                className="slider-track"
                type="range"
                min="2"
                max="10"
                value={thickness}
                onChange={(e) => setThickness(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 6. Bottom Action Bar */}
      <div className="glass-panel action-bar">
        <div className="price-badge">
          <span className="price-label">ЦЕНА</span>
          <span className="price-value">{calculatePrice().toLocaleString('ru-RU')} ₽</span>
        </div>

        <button
          className="action-btn btn-primary"
          onClick={() => setIsCheckoutOpen(true)}
        >
          <span className="action-text">ОФОРМИТЬ ЗАЯВКУ</span>
          <span className="action-icon arrow-right">→</span>
        </button>

        <button
          className="action-btn btn-secondary"
          onClick={exportToPDF}
        >
          <span className="action-text">СКАЧАТЬ PDF</span>
          <span className="action-icon arrow-down">↓</span>
        </button>
      </div>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        config={{
          material: selectedMaterial,
          coating: selectedCoating,
          shape,
          width,
          length,
          thickness,
          cutouts
        }}
        totalPrice={calculatePrice()}
      />
    </section>
  );
}
