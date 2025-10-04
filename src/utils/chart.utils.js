/**
 * Chart drawing utilities using Canvas API
 */
import { APP_CONFIG } from '../config/app.config.js';
/**
 * Draw a donut chart
 */
export function drawDonutChart(canvas, scores) {
    const ctx = canvas.getContext('2d');
    if (!ctx)
        return;
    const domains = APP_CONFIG.CORE_DOMAINS;
    const values = domains.map((d) => scores[d] ?? 0);
    const total = values.reduce((a, b) => a + b, 0);
    if (total === 0)
        return;
    const colors = APP_CONFIG.CHARTS.COLORS;
    const radius = Math.min(canvas.width, canvas.height) / 2 - 10;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    let startAngle = -Math.PI / 2;
    // Draw slices
    values.forEach((val, index) => {
        const sliceAngle = (val / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();
        startAngle += sliceAngle;
    });
    // Hollow centre
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * APP_CONFIG.CHARTS.DONUT_RADIUS_RATIO, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    // Labels
    ctx.fillStyle = '#1f2937';
    ctx.font = '16px sans-serif';
    let angle = -Math.PI / 2;
    values.forEach((val, index) => {
        const sliceAngle = (val / total) * Math.PI * 2;
        const midAngle = angle + sliceAngle / 2;
        const labelX = centerX + Math.cos(midAngle) * (radius + 20);
        const labelY = centerY + Math.sin(midAngle) * (radius + 20);
        ctx.textAlign = labelX > centerX ? 'left' : 'right';
        const label = `${domains[index]} (${val}%)`;
        ctx.fillText(label, labelX, labelY);
        angle += sliceAngle;
    });
}
/**
 * Draw a radar chart
 */
export function drawRadarChart(canvas, scores) {
    const ctx = canvas.getContext('2d');
    if (!ctx)
        return;
    const domains = APP_CONFIG.CORE_DOMAINS;
    const values = domains.map((d) => (scores[d] ?? 0) / 100);
    const numAxes = domains.length;
    const radius = Math.min(canvas.width, canvas.height) / 2 - 20;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    // Draw grid
    const rings = APP_CONFIG.CHARTS.RADAR_RINGS;
    ctx.strokeStyle = '#e5e7eb';
    for (let r = 1; r <= rings; r++) {
        const rRadius = (radius * r) / rings;
        ctx.beginPath();
        for (let i = 0; i <= numAxes; i++) {
            const angle = (Math.PI * 2 * i) / numAxes;
            const x = centerX + Math.cos(angle) * rRadius;
            const y = centerY + Math.sin(angle) * rRadius;
            if (i === 0)
                ctx.moveTo(x, y);
            else
                ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    // Draw axes and labels
    ctx.strokeStyle = '#d1d5db';
    ctx.fillStyle = '#4b5563';
    ctx.font = '12px sans-serif';
    for (let i = 0; i < numAxes; i++) {
        const angle = (Math.PI * 2 * i) / numAxes;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
        // Label slightly outside
        const lx = centerX + Math.cos(angle) * (radius + 10);
        const ly = centerY + Math.sin(angle) * (radius + 10);
        ctx.textAlign = lx > centerX ? 'left' : lx < centerX ? 'right' : 'center';
        ctx.textBaseline = ly > centerY ? 'top' : ly < centerY ? 'bottom' : 'middle';
        ctx.fillText(domains[i], lx, ly);
    }
    // Draw polygon
    ctx.beginPath();
    values.forEach((val, i) => {
        const angle = (Math.PI * 2 * i) / numAxes;
        const x = centerX + Math.cos(angle) * radius * val;
        const y = centerY + Math.sin(angle) * radius * val;
        if (i === 0)
            ctx.moveTo(x, y);
        else
            ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(124, 58, 237, 0.3)';
    ctx.fill();
    ctx.strokeStyle = '#7c3aed';
    ctx.stroke();
}
