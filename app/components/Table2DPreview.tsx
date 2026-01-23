import React from 'react';
import { TableCutout } from '../utils/pageData';

interface Table2DPreviewProps {
    width: number;
    length: number;
    shape: string;
    cutouts: TableCutout[];
    materialColor: string;
}

export default function Table2DPreview({ width, length, shape, cutouts, materialColor }: Table2DPreviewProps) {
    // Padding for the viewbox
    const padding = 20;
    const viewBoxWidth = width + padding * 2;
    const viewBoxHeight = length + padding * 2;

    // Center the table
    const startX = padding;
    const startY = padding;

    // Render Cutout
    const renderCutout = (cutout: TableCutout) => {
        // In 3D, x=0 y=0 is center. In SVG, usually 0,0 is top-left.
        // We need to convert center-based coordinates to top-left based relative to the table.
        // Table center is at (width/2, length/2).
        // Cutout x is offset from center.
        // 3D units: 1 unit = 50cm. The x/y in cutouts are in 3D units.
        // We need to convert them back to cm.

        const cutoutXCm = cutout.x * 50;
        const cutoutYCm = cutout.y * 50;

        // Cutout width/height are also in 3D units (approx).
        // In addCutout: width: 30/50, height: 40/50. So multiplying by 50 gives original CM.
        const w = cutout.width * 50;
        const h = cutout.height * 50;

        // Calculate top-left corner relative to table origin (0,0 of the table rectangle)
        const left = (width / 2) + cutoutXCm - (w / 2);
        const top = (length / 2) + cutoutYCm - (h / 2);

        return (
            <g key={cutout.id}>
                <rect
                    x={startX + left}
                    y={startY + top}
                    width={w}
                    height={h}
                    fill="#ccc"
                    stroke="#000"
                    strokeWidth="1"
                    rx="2"
                />
                <text
                    x={startX + left + w / 2}
                    y={startY + top + h / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="8"
                    fill="#333"
                >
                    {cutout.type === 'sink' ? 'Мойка' : 'Вырез'}
                </text>
            </g>
        );
    };

    return (
        <div className="w-full flex flex-col items-center">
            <svg
                width="100%"
                height="200"
                viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
                className="border border-gray-200 rounded bg-white shadow-sm"
            >
                {/* Dimensions Labels */}
                <text x={viewBoxWidth / 2} y={15} textAnchor="middle" fontSize="12" fill="#666">{width} см</text>
                <text x={10} y={viewBoxHeight / 2} textAnchor="middle" writingMode="tb" fontSize="12" fill="#666">{length} см</text>

                {/* Table Shape */}
                <rect
                    x={startX}
                    y={startY}
                    width={width}
                    height={length}
                    fill={materialColor}
                    stroke="#333"
                    strokeWidth="2"
                    opacity="0.8"
                    rx={shape === 'round' ? width / 2 : (shape === 'trapezoid' ? 0 : 4)} // Simple approx for shape
                />

                {/* Cutouts */}
                {cutouts.map(renderCutout)}
            </svg>
            <p className="text-xs text-gray-500 mt-2">Схематичный вид сверху</p>
        </div>
    );
}
