"use client";

"use client";

import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import {
  TABLE_SHAPES,
  CUTOUT_TYPES,
  TableMaterial,
  TableCutout,
  TableCoating,
} from "../../utils/pageData";
import { fetchMaterials, fetchCoatings, fetchPricingRules, PricingRule } from "../../utils/dbService";
import { generateTechnicalDrawingPDF } from "../../utils/technicalDrawingGenerator";
import "./HeroSection.css";
import CheckoutModal from "../CheckoutModal";

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
  // DB Data State
  const [dbMaterials, setDbMaterials] = useState<TableMaterial[]>([]);
  const [dbCoatings, setDbCoatings] = useState<TableCoating[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Table configuration state
  const [selectedMaterial, setSelectedMaterial] = useState<TableMaterial | null>(null);
  const [selectedCoating, setSelectedCoating] = useState<TableCoating | null>(null);
  const [width, setWidth] = useState(120);
  const [length, setLength] = useState(80);
  const [thickness, setThickness] = useState(4);
  const [shape, setShape] = useState("rectangle");
  const [cutouts, setCutouts] = useState<TableCutout[]>([]);

  // Checkout state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [mats, coats, rules] = await Promise.all([
          fetchMaterials(),
          fetchCoatings(),
          fetchPricingRules()
        ]);

        setDbMaterials(mats);
        setDbCoatings(coats);
        setPricingRules(rules);

        // Set defaults
        if (mats.length > 0) setSelectedMaterial(mats[0]);
        if (coats.length > 0) setSelectedCoating(coats[0]);

        setIsLoadingData(false);
      } catch (error) {
        console.error("Failed to load configurator data", error);
        // Fallback or error state
        setIsLoadingData(false);
      }
    };
    loadData();
  }, []);

  // Price calculation
  const calculatePrice = () => {
    if (!selectedMaterial) return 0;

    // Base area price
    const areaM2 = (width / 100) * (length / 100);
    const materialPrice = selectedMaterial.pricePerM2 || 0;
    let total = areaM2 * materialPrice;

    // Add coating price
    if (selectedCoating && selectedCoating.pricePerM2) {
      total += areaM2 * selectedCoating.pricePerM2;
    }

    // Apply thickness modifier (base is 4cm)
    const thicknessRule = pricingRules.find(r => r.ruleType === 'thickness' && r.ruleKey === 'per_cm');
    if (thicknessRule && thickness > 4) {
      const extraCm = thickness - 4;
      // Exponential growth for thickness is harsh, maybe linear? Using multiplier as per existing logic
      // Existing logic was: 1 + ((thickness - 4) * 0.05)
      // DB rule assumes multiplier (e.g. 1.05) per cm? Or simple adder? 
      // Let's assume multiplier is "base multiplier per extra cm"
      // If db multiplier is 1.05, then total * 1.05 for each extra cm
      total *= Math.pow(thicknessRule.multiplier, extraCm);
    } else if (!thicknessRule && thickness > 4) {
      // Fallback logic
      total *= (1 + ((thickness - 4) * 0.05));
    }

    // Shape complexity
    const shapeRule = pricingRules.find(r => r.ruleType === 'shape' && r.ruleKey === shape);
    if (shapeRule) {
      total *= shapeRule.multiplier;
      total += shapeRule.fixedAddon;
    } else if (shape !== 'rectangle') {
      // Fallback
      total *= 1.15;
    }

    // Cutouts
    let cutoutsPrice = 0;
    for (const cutout of cutouts) {
      const cutoutRule = pricingRules.find(r => r.ruleType === 'cutout' && r.ruleKey === cutout.type);
      if (cutoutRule) {
        // Apply multiplier to the WHOLE table price? Probably not properly implemented in current scheme
        // Usually cutout is a fixed addon
        cutoutsPrice += cutoutRule.fixedAddon;
      } else {
        cutoutsPrice += 1500; // Fallback
      }
    }

    total += cutoutsPrice;

    return Math.round(total / 100) * 100; // Round to 100s
  };

  const addCutout = (type: string) => {
    const newCutout: TableCutout = {
      id: `cutout-${Date.now()}`,
      type,
      x: 0,
      y: 0,
      width: 0.6, // 30cm in 3D units
      height: 0.8, // 40cm in 3D units
      rotation: 0,
    };
    setCutouts([...cutouts, newCutout]);
  };

  // Calculate bounds for cutout position based on current table and cutout size
  const getCutoutBounds = (cutout: TableCutout) => {
    const tableW = width / 50; // Table width in 3D units
    const tableL = length / 50; // Table length in 3D units
    const cutW = cutout.width;
    const cutH = cutout.height;

    // Account for rotation - when rotated 90 degrees, width/height swap
    const rotRad = (cutout.rotation || 0) * (Math.PI / 180);
    const effectiveW = Math.abs(cutW * Math.cos(rotRad)) + Math.abs(cutH * Math.sin(rotRad));
    const effectiveH = Math.abs(cutW * Math.sin(rotRad)) + Math.abs(cutH * Math.cos(rotRad));

    return {
      minX: -(tableW / 2) + (effectiveW / 2),
      maxX: (tableW / 2) - (effectiveW / 2),
      minY: -(tableL / 2) + (effectiveH / 2),
      maxY: (tableL / 2) - (effectiveH / 2),
    };
  };

  const updateCutoutProperty = (id: string, property: keyof TableCutout, value: number) => {
    setCutouts(cutouts.map(c => {
      if (c.id !== id) return c;

      const updated = { ...c, [property]: value };

      // Clamp position to stay within table bounds
      const bounds = getCutoutBounds(updated);
      if (updated.x < bounds.minX) updated.x = bounds.minX;
      if (updated.x > bounds.maxX) updated.x = bounds.maxX;
      if (updated.y < bounds.minY) updated.y = bounds.minY;
      if (updated.y > bounds.maxY) updated.y = bounds.maxY;

      return updated;
    }));
  };

  const removeCutout = (id: string) => {
    setCutouts(cutouts.filter((c) => c.id !== id));
  };

  const exportToPDF = async () => {
    if (!selectedMaterial || !selectedCoating) return;
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
            {selectedMaterial && selectedCoating ? (
              <TableConfigurator3D
                material={selectedMaterial}
                coating={selectedCoating}
                width={width / 50}
                length={length / 50}
                thickness={thickness / 50}
                shape={shape}
                cutouts={cutouts}
              />
            ) : null}
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

      {/* 3. Left Panel - Sink Position & Size Controls (shows when cutouts exist) */}
      {cutouts.length > 0 && (
        <div className="glass-panel sink-position-panel">
          {cutouts.map((cutout) => {
            const bounds = getCutoutBounds(cutout);
            // Convert to cm for display
            const widthCm = Math.round(cutout.width * 50);
            const heightCm = Math.round(cutout.height * 50);
            const xCm = Math.round(cutout.x * 50);
            const yCm = Math.round(cutout.y * 50);

            return (
              <div key={cutout.id} className="sink-control-row">
                <div className="sink-control-header">
                  <span className="sink-label">
                    {CUTOUT_TYPES.find(t => t.id === cutout.type)?.name}
                  </span>
                  <button
                    className="sink-remove-btn"
                    onClick={() => removeCutout(cutout.id)}
                  >
                    ×
                  </button>
                </div>
                <div className="sink-sliders">
                  {/* Width control */}
                  <div className="sink-slider-group">
                    <div className="slider-with-input">
                      <span className="sink-slider-label">Ширина</span>
                      <input
                        type="number"
                        className="sink-number-input"
                        min={10}
                        max={Math.round(Math.min(width - 5, 100))}
                        value={widthCm}
                        onChange={(e) => updateCutoutProperty(cutout.id, 'width', Number(e.target.value) / 50)}
                      />
                      <span className="sink-unit">см</span>
                    </div>
                    <input
                      type="range"
                      min={0.2}
                      max={Math.min(width / 50 - 0.1, 2)}
                      step={0.02}
                      value={cutout.width}
                      onChange={(e) => updateCutoutProperty(cutout.id, 'width', Number(e.target.value))}
                    />
                  </div>

                  {/* Height/Depth control */}
                  <div className="sink-slider-group">
                    <div className="slider-with-input">
                      <span className="sink-slider-label">Глубина</span>
                      <input
                        type="number"
                        className="sink-number-input"
                        min={10}
                        max={Math.round(Math.min(length - 5, 75))}
                        value={heightCm}
                        onChange={(e) => updateCutoutProperty(cutout.id, 'height', Number(e.target.value) / 50)}
                      />
                      <span className="sink-unit">см</span>
                    </div>
                    <input
                      type="range"
                      min={0.2}
                      max={Math.min(length / 50 - 0.1, 1.5)}
                      step={0.02}
                      value={cutout.height}
                      onChange={(e) => updateCutoutProperty(cutout.id, 'height', Number(e.target.value))}
                    />
                  </div>

                  {/* X Position control */}
                  <div className="sink-slider-group">
                    <div className="slider-with-input">
                      <span className="sink-slider-label">X смещ.</span>
                      <input
                        type="number"
                        className="sink-number-input"
                        min={Math.round(bounds.minX * 50)}
                        max={Math.round(bounds.maxX * 50)}
                        value={xCm}
                        onChange={(e) => updateCutoutProperty(cutout.id, 'x', Number(e.target.value) / 50)}
                      />
                      <span className="sink-unit">см</span>
                    </div>
                    <input
                      type="range"
                      min={bounds.minX}
                      max={bounds.maxX}
                      step={0.02}
                      value={Math.max(bounds.minX, Math.min(bounds.maxX, cutout.x))}
                      onChange={(e) => updateCutoutProperty(cutout.id, 'x', Number(e.target.value))}
                    />
                  </div>

                  {/* Y Position control */}
                  <div className="sink-slider-group">
                    <div className="slider-with-input">
                      <span className="sink-slider-label">Y смещ.</span>
                      <input
                        type="number"
                        className="sink-number-input"
                        min={Math.round(bounds.minY * 50)}
                        max={Math.round(bounds.maxY * 50)}
                        value={yCm}
                        onChange={(e) => updateCutoutProperty(cutout.id, 'y', Number(e.target.value) / 50)}
                      />
                      <span className="sink-unit">см</span>
                    </div>
                    <input
                      type="range"
                      min={bounds.minY}
                      max={bounds.maxY}
                      step={0.02}
                      value={Math.max(bounds.minY, Math.min(bounds.maxY, cutout.y))}
                      onChange={(e) => updateCutoutProperty(cutout.id, 'y', Number(e.target.value))}
                    />
                  </div>

                  {/* Rotation control */}
                  <div className="sink-slider-group">
                    <div className="slider-with-input">
                      <span className="sink-slider-label">Поворот</span>
                      <input
                        type="number"
                        className="sink-number-input"
                        min={0}
                        max={360}
                        step={15}
                        value={cutout.rotation || 0}
                        onChange={(e) => updateCutoutProperty(cutout.id, 'rotation', Number(e.target.value))}
                      />
                      <span className="sink-unit">°</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      step={15}
                      value={cutout.rotation || 0}
                      onChange={(e) => updateCutoutProperty(cutout.id, 'rotation', Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            );
          })}
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
              {isLoadingData ? (
                <div style={{ color: '#fff', fontSize: 12, padding: 10 }}>Загрузка материалов...</div>
              ) : dbMaterials.map((mat) => (
                <button
                  key={mat.id}
                  className={`control-card ${selectedMaterial?.id === mat.id ? "active" : ""}`}
                  onClick={() => setSelectedMaterial(mat)}
                >
                  <div className="material-preview-box">
                    {mat.textures?.color ? (
                      <img
                        src={mat.textures.color}
                        alt={mat.name}
                        className="material-image"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="material-color"
                        style={{ backgroundColor: mat.color }}
                      />
                    )}
                  </div>
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
              {isLoadingData ? (
                <div style={{ color: '#fff', fontSize: 12, padding: 10 }}>Загрузка покрытий...</div>
              ) : dbCoatings.map((coat) => (
                <button
                  key={coat.id}
                  className={`control-card ${selectedCoating?.id === coat.id ? "active" : ""}`}
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
          disabled={!selectedMaterial || !selectedCoating}
          style={{ opacity: (!selectedMaterial || !selectedCoating) ? 0.5 : 1 }}
        >
          <span className="action-text">ОФОРМИТЬ ЗАЯВКУ</span>
          <span className="action-icon arrow-right">→</span>
        </button>

        <button
          className="action-btn btn-secondary"
          onClick={exportToPDF}
          disabled={!selectedMaterial || !selectedCoating}
          style={{ opacity: (!selectedMaterial || !selectedCoating) ? 0.5 : 1 }}
        >
          <span className="action-text">СКАЧАТЬ PDF</span>
          <span className="action-icon arrow-down">↓</span>
        </button>
      </div>

      {selectedMaterial && selectedCoating && (
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
      )}
    </section >
  );
}
