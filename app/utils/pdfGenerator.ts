
import jsPDF from 'jspdf';
import { TableMaterial, TableCutout } from './pageData';

interface PDFConfig {
    material: TableMaterial;
    shape: string;
    width: number;
    length: number;
    thickness: number;
    cutouts: TableCutout[];
}

export const generateTablePDF = (config: PDFConfig, orderId?: number | string) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(22);
    doc.text("Чертеж изделия", 20, 20);

    if (orderId) {
        doc.setFontSize(12);
        doc.text(`ID заказа: #${orderId}`, 20, 30);
    }
    doc.text(`Дата: ${new Date().toLocaleDateString()}`, pageWidth - 60, 30);

    // Info Table
    doc.setFontSize(12);
    doc.text("Параметры спецификации:", 20, 45);

    let y = 55;
    const line = 8;

    doc.setFontSize(10);
    doc.text(`Материал: ${config.material.name}`, 20, y); y += line;
    doc.text(`Форма: ${config.shape}`, 20, y); y += line;
    doc.text(`Габариты: ${config.width} x ${config.length} см`, 20, y); y += line;
    doc.text(`Толщина: ${config.thickness} см`, 20, y); y += line;
    doc.text(`Количество вырезов: ${config.cutouts.length}`, 20, y); y += line;

    // Drawing Rectangle Area
    const drawAreaY = y + 10;
    const drawAreaHeight = 150;
    const centerX = pageWidth / 2;
    const centerY = drawAreaY + (drawAreaHeight / 2);

    // Scale logic
    // Max width in drawing is about 160mm. 
    // Config width e.g., 200cm. Scale = 160 / 200 = 0.8
    const maxDrawWidth = 160;
    const maxDrawHeight = 120;

    const scale = Math.min(maxDrawWidth / config.width, maxDrawHeight / config.length);

    const drawW = config.width * scale;
    const drawH = config.length * scale;

    const startX = centerX - (drawW / 2);
    const startY = centerY - (drawH / 2);

    // Draw Outline
    doc.setLineWidth(0.5);
    doc.setDrawColor(0);
    doc.setFillColor(240, 240, 240);

    if (config.shape === 'round') {
        doc.ellipse(centerX, centerY, drawW / 2, drawH / 2, 'FD');
    } else {
        // Rect
        doc.rect(startX, startY, drawW, drawH, 'FD');
    }

    // Dimensions Lines (Simplified)
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`${config.width} см`, centerX, startY - 5, { align: 'center' });
    doc.text(`${config.length} см`, startX - 5, centerY, { align: 'right', angle: 90 });

    // Draw Cutouts
    config.cutouts.forEach((cutout, i) => {
        const cx = (cutout.x * 50) * scale;
        const cy = (cutout.y * 50) * scale;
        const cw = (cutout.width * 50) * scale;
        const ch = (cutout.height * 50) * scale;

        // Position relative to center
        const boxX = centerX + cx - (cw / 2);
        const boxY = centerY + cy - (ch / 2);

        doc.setDrawColor(100);
        doc.setLineDashPattern([2, 1], 0);
        doc.rect(boxX, boxY, cw, ch);
        doc.setLineDashPattern([], 0);

        doc.text(`${i + 1}`, boxX + cw / 2, boxY + ch / 2, { align: 'center', baseline: 'middle' });
    });

    // Cutout Legend
    if (config.cutouts.length > 0) {
        y = drawAreaY + drawAreaHeight + 10;
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text("Экспликация вырезов:", 20, y);
        y += 6;

        config.cutouts.forEach((c, i) => {
            doc.text(`${i + 1}. ${c.type} (${Math.round(c.width * 50)}x${Math.round(c.height * 50)} см)`, 20, y);
            y += 5;
        });
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Сгенерировано автоматически системой Orbit Configuration", 20, pageWidth - 10);

    doc.save(`drawing_${orderId || 'preview'}.pdf`);
};
