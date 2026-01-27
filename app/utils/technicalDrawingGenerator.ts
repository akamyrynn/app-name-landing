/**
 * Technical Drawing Generator
 * Generates professional CAD-style 2D technical drawings from 3D table configuration
 * Creates orthographic projections (top, front, side views) with proper dimensions
 */

import jsPDF from 'jspdf';
import { TableMaterial, TableCutout, TableCoating } from './pageData';

// Helper to load font file
async function loadFontBase64(url: string): Promise<string> {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

interface TechnicalDrawingConfig {
    material: TableMaterial;
    coating: TableCoating;
    shape: string;
    width: number;      // in cm
    length: number;     // in cm
    thickness: number;  // in cm (3D units, multiply by 50 for actual cm)
    cutouts: TableCutout[];
    price?: number;
}


// Drawing constants
const PAPER_WIDTH = 297;  // A4 landscape width in mm
const PAPER_HEIGHT = 210; // A4 landscape height in mm
const MARGIN = 10; // Reduced margin to give more space
const TITLE_BLOCK_HEIGHT = 50; // Increased height
const TITLE_BLOCK_WIDTH = 150; // Increased width

// Colors
const LINE_COLOR = { r: 0, g: 0, b: 0 };
const DIM_COLOR = { r: 80, g: 80, b: 80 };
const CUTOUT_COLOR = { r: 255, g: 100, b: 100 };
const FILL_COLOR = { r: 245, g: 245, b: 245 };
const GRID_COLOR = { r: 230, g: 230, b: 230 };

/**
 * Draw dimension line with arrows and text
 */
function drawDimensionLine(
    doc: jsPDF,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    text: string,
    offset: number = 8,
    isVertical: boolean = false
) {
    doc.setDrawColor(DIM_COLOR.r, DIM_COLOR.g, DIM_COLOR.b);
    doc.setLineWidth(0.2);
    doc.setFontSize(7);
    doc.setTextColor(DIM_COLOR.r, DIM_COLOR.g, DIM_COLOR.b);

    const arrowSize = 2;

    if (isVertical) {
        // Vertical dimension line
        const x = x1 + offset;

        // Extension lines
        doc.line(x1, y1, x + 3, y1);
        doc.line(x1, y2, x + 3, y2);

        // Main dimension line
        doc.line(x, y1, x, y2);

        // Arrows
        doc.line(x, y1, x - arrowSize / 2, y1 + arrowSize);
        doc.line(x, y1, x + arrowSize / 2, y1 + arrowSize);
        doc.line(x, y2, x - arrowSize / 2, y2 - arrowSize);
        doc.line(x, y2, x + arrowSize / 2, y2 - arrowSize);

        // Text (rotated)
        const midY = (y1 + y2) / 2;
        doc.text(text, x + 3, midY, { angle: 90 });
    } else {
        // Horizontal dimension line
        const y = y1 + offset;

        // Extension lines
        doc.line(x1, y1, x1, y + 3);
        doc.line(x2, y1, x2, y + 3);

        // Main dimension line
        doc.line(x1, y, x2, y);

        // Arrows
        doc.line(x1, y, x1 + arrowSize, y - arrowSize / 2);
        doc.line(x1, y, x1 + arrowSize, y + arrowSize / 2);
        doc.line(x2, y, x2 - arrowSize, y - arrowSize / 2);
        doc.line(x2, y, x2 - arrowSize, y + arrowSize / 2);

        // Text
        const midX = (x1 + x2) / 2;
        doc.text(text, midX, y - 2, { align: 'center' });
    }
}

/**
 * Draw a cutout rectangle with dashed lines (supports rotation)
 */
function drawCutout(
    doc: jsPDF,
    centerX: number,
    centerY: number,
    w: number,
    h: number,
    label: string,
    rotation: number = 0 // rotation in degrees
) {
    doc.setDrawColor(CUTOUT_COLOR.r, CUTOUT_COLOR.g, CUTOUT_COLOR.b);
    doc.setLineWidth(0.3);
    doc.setLineDashPattern([2, 1], 0);

    // Convert rotation to radians
    const rad = rotation * (Math.PI / 180);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    // Calculate the 4 corners of the rotated rectangle
    const halfW = w / 2;
    const halfH = h / 2;

    // Corners relative to center (before rotation)
    const corners = [
        { x: -halfW, y: -halfH },
        { x: halfW, y: -halfH },
        { x: halfW, y: halfH },
        { x: -halfW, y: halfH },
    ];

    // Rotate and translate corners
    const rotatedCorners = corners.map(c => ({
        x: centerX + c.x * cos - c.y * sin,
        y: centerY + c.x * sin + c.y * cos,
    }));

    // Draw lines between corners
    for (let i = 0; i < 4; i++) {
        const from = rotatedCorners[i];
        const to = rotatedCorners[(i + 1) % 4];
        doc.line(from.x, from.y, to.x, to.y);
    }

    doc.setLineDashPattern([], 0);

    // Label at center
    doc.setFontSize(6);
    doc.setTextColor(CUTOUT_COLOR.r, CUTOUT_COLOR.g, CUTOUT_COLOR.b);
    doc.text(label, centerX, centerY, { align: 'center', baseline: 'middle' });
}

/**
 * Draw center marks (crosshairs)
 */
function drawCenterMark(doc: jsPDF, cx: number, cy: number, size: number = 3) {
    doc.setDrawColor(DIM_COLOR.r, DIM_COLOR.g, DIM_COLOR.b);
    doc.setLineWidth(0.15);
    doc.setLineDashPattern([1, 1], 0);
    doc.line(cx - size, cy, cx + size, cy);
    doc.line(cx, cy - size, cy, cy + size);
    doc.setLineDashPattern([], 0);
}

/**
 * Draw title block (stamp) in the bottom right corner
 */
function drawTitleBlock(
    doc: jsPDF,
    config: TechnicalDrawingConfig,
    orderId?: number | string
) {
    const blockWidth = TITLE_BLOCK_WIDTH;
    const blockHeight = TITLE_BLOCK_HEIGHT;
    const x = PAPER_WIDTH - MARGIN - blockWidth;
    const y = PAPER_HEIGHT - MARGIN - blockHeight;

    doc.setDrawColor(LINE_COLOR.r, LINE_COLOR.g, LINE_COLOR.b);
    doc.setLineWidth(0.5);
    doc.rect(x, y, blockWidth, blockHeight);

    // Horizontal dividers
    doc.setLineWidth(0.2);
    doc.line(x, y + 10, x + blockWidth, y + 10);
    doc.line(x, y + 20, x + blockWidth, y + 20);

    // Vertical divider
    doc.line(x + 60, y + 10, x + 60, y + blockHeight);

    // Title
    doc.setFontSize(10);
    // doc.setFont('helvetica', 'bold');
    doc.setFont('CustomFont', 'normal'); // Custom font might not have bold
    doc.setTextColor(LINE_COLOR.r, LINE_COLOR.g, LINE_COLOR.b);
    doc.text('ЧЕРТЁЖ СТОЛЕШНИЦЫ', x + blockWidth / 2, y + 7, { align: 'center' });

    // doc.setFont('helvetica', 'normal');
    doc.setFont('CustomFont', 'normal');
    doc.setFontSize(7);

    // Left column
    const leftColX = x + 3;
    const rightColX = x + blockWidth / 2 + 3;
    const rowStart = y + 15;
    const rowStep = 6; // increased spacing

    doc.text(`Материал: ${config.material.name}`, leftColX, rowStart);
    doc.text(`Покрытие: ${config.coating.name}`, leftColX, rowStart + rowStep);
    doc.text(`Форма: ${config.shape}`, leftColX, rowStart + rowStep * 2);

    // Calculate Area
    const areaM2 = ((config.width * config.length) / 10000).toFixed(2);
    doc.text(`Площадь: ${areaM2} м²`, leftColX, rowStart + rowStep * 3);

    // Right column
    doc.text(`Размеры: ${config.width}×${config.length}×${Math.round(config.thickness * 50)} см`, rightColX, rowStart);
    doc.text(`Вырезов: ${config.cutouts.length}`, rightColX, rowStart + rowStep);
    doc.text(`Дата: ${new Date().toLocaleDateString('ru-RU')}`, rightColX, rowStart + rowStep * 2);

    if (config.price) {
        doc.text(`Цена: ${config.price.toLocaleString('ru-RU')} ₽`, rightColX, rowStart + rowStep * 3);
    }

    // Order ID (if present)
    if (orderId) {
        doc.text(`Заказ ID: #${orderId}`, rightColX, rowStart + rowStep * 4);
    }
}

/**
 * Draw grid background
 */
function drawGrid(doc: jsPDF, x: number, y: number, w: number, h: number, step: number = 5) {
    doc.setDrawColor(GRID_COLOR.r, GRID_COLOR.g, GRID_COLOR.b);
    doc.setLineWidth(0.1);

    for (let i = x; i <= x + w; i += step) {
        doc.line(i, y, i, y + h);
    }
    for (let j = y; j <= y + h; j += step) {
        doc.line(x, j, x + w, j);
    }
}

/**
 * Draw TOP VIEW (plan view)
 */
function drawTopView(
    doc: jsPDF,
    config: TechnicalDrawingConfig,
    viewX: number,
    viewY: number,
    scale: number
) {
    const w = config.width * scale;
    const h = config.length * scale;

    // View label
    doc.setFontSize(8);
    // doc.setFont('helvetica', 'bold');
    doc.setFont('CustomFont', 'normal');
    doc.setTextColor(LINE_COLOR.r, LINE_COLOR.g, LINE_COLOR.b);
    doc.text('ВИД СВЕРХУ', viewX + w / 2, viewY - 8, { align: 'center' });
    doc.setFontSize(6);
    // doc.setFont('helvetica', 'normal');
    doc.setFont('CustomFont', 'normal');
    doc.text(`М 1:${Math.round(1 / scale)}`, viewX + w / 2, viewY - 4, { align: 'center' });

    // Table outline
    doc.setDrawColor(LINE_COLOR.r, LINE_COLOR.g, LINE_COLOR.b);
    doc.setFillColor(FILL_COLOR.r, FILL_COLOR.g, FILL_COLOR.b);
    doc.setLineWidth(0.5);

    if (config.shape === 'round') {
        doc.ellipse(viewX + w / 2, viewY + h / 2, w / 2, h / 2, 'FD');
        // Center mark
        drawCenterMark(doc, viewX + w / 2, viewY + h / 2);
    } else if (config.shape === 'trapezoid') {
        // Trapezoid shape
        const topOffset = w * 0.15;
        doc.setFillColor(FILL_COLOR.r, FILL_COLOR.g, FILL_COLOR.b);

        // Using lines for trapezoid
        doc.line(viewX, viewY + h, viewX + w, viewY + h);
        doc.line(viewX + w, viewY + h, viewX + w - topOffset, viewY);
        doc.line(viewX + w - topOffset, viewY, viewX + topOffset, viewY);
        doc.line(viewX + topOffset, viewY, viewX, viewY + h);
    } else {
        doc.rect(viewX, viewY, w, h, 'FD');
    }

    // Draw cutouts with rotation
    config.cutouts.forEach((cutout, index) => {
        // Convert 3D coordinates to 2D (center position)
        const cutoutW = cutout.width * 50 * scale;
        const cutoutH = cutout.height * 50 * scale;
        const cutoutCenterX = viewX + (w / 2) + (cutout.x * 50 * scale);
        const cutoutCenterY = viewY + (h / 2) + (cutout.y * 50 * scale);

        drawCutout(doc, cutoutCenterX, cutoutCenterY, cutoutW, cutoutH, `${index + 1}`, cutout.rotation || 0);
    });

    // Dimension lines
    drawDimensionLine(doc, viewX, viewY, viewX + w, viewY, `${config.width} см`, -12, false);
    drawDimensionLine(doc, viewX, viewY, viewX, viewY + h, `${config.length} см`, -12, true);
}

/**
 * Draw FRONT VIEW (elevation)
 */
function drawFrontView(
    doc: jsPDF,
    config: TechnicalDrawingConfig,
    viewX: number,
    viewY: number,
    scale: number
) {
    const w = config.width * scale;
    const thicknessCm = config.thickness * 50;
    const h = thicknessCm * scale;

    // View label
    doc.setFontSize(8);
    // doc.setFont('helvetica', 'bold');
    doc.setFont('CustomFont', 'normal');
    doc.setTextColor(LINE_COLOR.r, LINE_COLOR.g, LINE_COLOR.b);
    doc.text('ВИД СПЕРЕДИ', viewX + w / 2, viewY - 8, { align: 'center' });
    doc.setFontSize(6);
    // doc.setFont('helvetica', 'normal');
    doc.setFont('CustomFont', 'normal');
    doc.text(`М 1:${Math.round(1 / scale)}`, viewX + w / 2, viewY - 4, { align: 'center' });

    // Table outline (front profile)
    doc.setDrawColor(LINE_COLOR.r, LINE_COLOR.g, LINE_COLOR.b);
    doc.setFillColor(FILL_COLOR.r, FILL_COLOR.g, FILL_COLOR.b);
    doc.setLineWidth(0.5);

    if (config.shape === 'round') {
        doc.rect(viewX, viewY, w, h, 'FD');
        // Edge radius indication
        doc.setLineWidth(0.2);
        doc.setLineDashPattern([1, 1], 0);
        doc.line(viewX + 2, viewY, viewX + 2, viewY + h);
        doc.line(viewX + w - 2, viewY, viewX + w - 2, viewY + h);
        doc.setLineDashPattern([], 0);
    } else {
        doc.rect(viewX, viewY, w, h, 'FD');
    }

    // Draw cutout profiles (as dashed lines on front view)
    config.cutouts.forEach((cutout, index) => {
        const cutoutW = cutout.width * 50 * scale;
        const cutoutX = viewX + (w / 2) + (cutout.x * 50 * scale) - (cutoutW / 2);

        doc.setDrawColor(CUTOUT_COLOR.r, CUTOUT_COLOR.g, CUTOUT_COLOR.b);
        doc.setLineWidth(0.3);
        doc.setLineDashPattern([2, 1], 0);
        doc.line(cutoutX, viewY, cutoutX, viewY + h);
        doc.line(cutoutX + cutoutW, viewY, cutoutX + cutoutW, viewY + h);
        doc.setLineDashPattern([], 0);
    });

    // Dimension - height (thickness)
    drawDimensionLine(doc, viewX + w, viewY, viewX + w, viewY + h, `${Math.round(thicknessCm)} см`, 8, true);
}

/**
 * Draw SIDE VIEW (profile)
 */
function drawSideView(
    doc: jsPDF,
    config: TechnicalDrawingConfig,
    viewX: number,
    viewY: number,
    scale: number
) {
    const w = config.length * scale;
    const thicknessCm = config.thickness * 50;
    const h = thicknessCm * scale;

    // View label
    doc.setFontSize(8);
    // doc.setFont('helvetica', 'bold');
    doc.setFont('CustomFont', 'normal');
    doc.setTextColor(LINE_COLOR.r, LINE_COLOR.g, LINE_COLOR.b);
    doc.text('ВИД СБОКУ', viewX + w / 2, viewY - 8, { align: 'center' });
    doc.setFontSize(6);
    // doc.setFont('helvetica', 'normal');
    doc.setFont('CustomFont', 'normal');
    doc.text(`М 1:${Math.round(1 / scale)}`, viewX + w / 2, viewY - 4, { align: 'center' });

    // Table outline (side profile)
    doc.setDrawColor(LINE_COLOR.r, LINE_COLOR.g, LINE_COLOR.b);
    doc.setFillColor(FILL_COLOR.r, FILL_COLOR.g, FILL_COLOR.b);
    doc.setLineWidth(0.5);
    doc.rect(viewX, viewY, w, h, 'FD');

    // Draw cutout profiles on side view
    config.cutouts.forEach((cutout) => {
        const cutoutH = cutout.height * 50 * scale;
        const cutoutY = viewX + (w / 2) + (cutout.y * 50 * scale) - (cutoutH / 2);

        doc.setDrawColor(CUTOUT_COLOR.r, CUTOUT_COLOR.g, CUTOUT_COLOR.b);
        doc.setLineWidth(0.3);
        doc.setLineDashPattern([2, 1], 0);
        doc.line(cutoutY, viewY, cutoutY, viewY + h);
        doc.line(cutoutY + cutoutH, viewY, cutoutY + cutoutH, viewY + h);
        doc.setLineDashPattern([], 0);
    });
}

/**
 * Draw cutouts legend/table
 */
function drawCutoutsLegend(
    doc: jsPDF,
    config: TechnicalDrawingConfig,
    x: number,
    y: number
) {
    if (config.cutouts.length === 0) return;

    doc.setFontSize(8);
    // doc.setFont('helvetica', 'bold');
    doc.setFont('CustomFont', 'normal');
    doc.setTextColor(LINE_COLOR.r, LINE_COLOR.g, LINE_COLOR.b);
    doc.text('ЭКСПЛИКАЦИЯ ВЫРЕЗОВ', x, y);

    // Table header - added rotation column
    const colWidths = [8, 25, 22, 22, 15];
    const rowHeight = 6;
    let currentY = y + 4;

    // doc.setFont('helvetica', 'normal');
    doc.setFont('CustomFont', 'normal');
    doc.setFontSize(6);
    doc.setLineWidth(0.2);

    // Header row
    doc.rect(x, currentY, colWidths.reduce((a, b) => a + b, 0), rowHeight);
    doc.text('№', x + 2, currentY + 4);
    doc.text('Тип', x + colWidths[0] + 2, currentY + 4);
    doc.text('Размер', x + colWidths[0] + colWidths[1] + 2, currentY + 4);
    doc.text('Позиция', x + colWidths[0] + colWidths[1] + colWidths[2] + 2, currentY + 4);
    doc.text('Угол', x + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 2, currentY + 4);
    currentY += rowHeight;

    // Data rows
    config.cutouts.forEach((cutout, index) => {
        doc.rect(x, currentY, colWidths.reduce((a, b) => a + b, 0), rowHeight);

        const cutoutType = cutout.type === 'sink' ? 'Мойка' :
            cutout.type === 'cooktop' ? 'Варочная' :
                cutout.type === 'grill' ? 'Решётка' : 'Тех. отв.';

        const sizeW = Math.round(cutout.width * 50);
        const sizeH = Math.round(cutout.height * 50);
        const posX = Math.round(cutout.x * 50);
        const posY = Math.round(cutout.y * 50);
        const rot = cutout.rotation || 0;

        doc.text(`${index + 1}`, x + 2, currentY + 4);
        doc.text(cutoutType, x + colWidths[0] + 2, currentY + 4);
        doc.text(`${sizeW}×${sizeH}`, x + colWidths[0] + colWidths[1] + 2, currentY + 4);
        doc.text(`${posX};${posY}`, x + colWidths[0] + colWidths[1] + colWidths[2] + 2, currentY + 4);
        doc.text(`${rot}°`, x + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 2, currentY + 4);

        currentY += rowHeight;
    });
}

/**
 * Main function: Generate technical drawing PDF
 */
export async function generateTechnicalDrawingPDF(
    config: TechnicalDrawingConfig,
    orderId?: number | string
): Promise<void> {
    // Create A4 landscape PDF
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    // Load and add custom font
    try {
        const fontBase64 = await loadFontBase64('/fonts/ofont.ru_SouthGhetto.ttf');
        doc.addFileToVFS('CustomFont.ttf', fontBase64);
        doc.addFont('CustomFont.ttf', 'CustomFont', 'normal');
        doc.setFont('CustomFont', 'normal');
        console.log('Custom font loaded successfully');
    } catch (e) {
        console.error('Failed to load custom font, falling back to default', e);
        // Fallback to helvetica (Cyrillic will be garbled)
    }

    // Drawing border
    doc.setDrawColor(LINE_COLOR.r, LINE_COLOR.g, LINE_COLOR.b);
    doc.setLineWidth(0.8);
    doc.rect(MARGIN, MARGIN, PAPER_WIDTH - 2 * MARGIN, PAPER_HEIGHT - 2 * MARGIN);

    // Inner frame
    doc.setLineWidth(0.3);
    doc.rect(MARGIN + 2, MARGIN + 2, PAPER_WIDTH - 2 * MARGIN - 4, PAPER_HEIGHT - 2 * MARGIN - 4);

    // Calculate scale to fit all views
    // Available drawing area (excluding title block)
    const drawingAreaHeight = PAPER_HEIGHT - 2 * MARGIN - TITLE_BLOCK_HEIGHT - 20;
    const drawingAreaWidth = PAPER_WIDTH - 2 * MARGIN - 10;

    // Scale based on largest dimension
    const maxTableDim = Math.max(config.width, config.length);
    const topViewScale = Math.min(
        (drawingAreaWidth * 0.45) / config.width,
        (drawingAreaHeight * 0.7) / config.length
    );

    // Ensure scale is reasonable
    const scale = Math.min(topViewScale, 0.8);

    // Calculate view positions
    const topViewX = MARGIN + 25;
    const topViewY = MARGIN + 25;

    const topViewWidth = config.width * scale;
    const topViewHeight = config.length * scale;

    // Front view below top view
    const frontViewX = topViewX;
    const frontViewY = topViewY + topViewHeight + 30;

    // Side view to the right of top view
    const sideViewX = topViewX + topViewWidth + 40;
    const sideViewY = topViewY;

    // Draw views
    drawTopView(doc, config, topViewX, topViewY, scale);
    drawFrontView(doc, config, frontViewX, frontViewY, scale);
    drawSideView(doc, config, sideViewX, sideViewY, scale);

    // Cutouts legend
    drawCutoutsLegend(doc, config, sideViewX, sideViewY + config.length * scale + 25);

    // Title block
    drawTitleBlock(doc, config, orderId);

    // Footer
    doc.setFontSize(5);
    doc.setTextColor(150, 150, 150);
    doc.text(
        'Технический чертёж сформирован автоматически | Orbit Configuration System',
        PAPER_WIDTH / 2,
        PAPER_HEIGHT - MARGIN + 3,
        { align: 'center' }
    );

    // Save PDF
    const fileName = orderId
        ? `technical_drawing_${orderId}.pdf`
        : `technical_drawing_${Date.now()}.pdf`;

    doc.save(fileName);
}

/**
 * Helper: Get shape name in Russian
 */
function getShapeName(shape: string): string {
    switch (shape) {
        case 'rectangle': return 'Прямоугольник';
        case 'round': return 'Круг/Овал';
        case 'trapezoid': return 'Трапеция';
        case 'custom': return 'Нестандартная';
        default: return shape;
    }
}
