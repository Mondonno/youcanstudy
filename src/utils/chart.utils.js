/**
 * Chart drawing utilities using Canvas API
 */
import { APP_CONFIG } from '../config/app.config.js';
/**
 * Draw a donut chart
 */
export function drawDonutChart(canvas, scores, overallScore) {
    const ctx = canvas.getContext('2d');
    if (!ctx)
        return;
    const domains = APP_CONFIG.CORE_DOMAINS;
    const values = domains.map((d) => scores[d] ?? 0);
    const total = values.reduce((a, b) => a + b, 0);
    if (total === 0)
        return;
    const colors = APP_CONFIG.CHARTS.COLORS;
    const radius = Math.min(canvas.width, canvas.height) / 2 - 40;
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
    // Draw overall score in the center if provided
    if (overallScore !== undefined) {
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 48px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${overallScore}%`, centerX, centerY);
        ctx.fillStyle = '#6b7280';
        ctx.font = '16px sans-serif';
        ctx.fillText('Your Overall Score', centerX, centerY + 35);
    }
    // Labels with better positioning
    ctx.fillStyle = '#1f2937';
    ctx.font = '14px sans-serif';
    let angle = -Math.PI / 2;
    values.forEach((val, index) => {
        const sliceAngle = (val / total) * Math.PI * 2;
        const midAngle = angle + sliceAngle / 2;
        const labelX = centerX + Math.cos(midAngle) * (radius + 30);
        const labelY = centerY + Math.sin(midAngle) * (radius + 30);
        ctx.textAlign = labelX > centerX + 5 ? 'left' : labelX < centerX - 5 ? 'right' : 'center';
        ctx.textBaseline = labelY > centerY + 5 ? 'top' : labelY < centerY - 5 ? 'bottom' : 'middle';
        const label = `${domains[index].charAt(0).toUpperCase() + domains[index].slice(1)}`;
        ctx.fillText(label, labelX, labelY);
        // Add percentage below label
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#6b7280';
        const percentY = labelY > centerY ? labelY + 15 : labelY < centerY ? labelY - 15 : labelY + 15;
        ctx.fillText(`${val}%`, labelX, percentY);
        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#1f2937';
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
    const radius = Math.min(canvas.width, canvas.height) / 2 - 60;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    // Draw grid
    const rings = APP_CONFIG.CHARTS.RADAR_RINGS;
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let r = 1; r <= rings; r++) {
        const rRadius = (radius * r) / rings;
        ctx.beginPath();
        for (let i = 0; i <= numAxes; i++) {
            const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
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
    ctx.font = '13px sans-serif';
    ctx.lineWidth = 1;
    for (let i = 0; i < numAxes; i++) {
        const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
        // Label slightly outside with better positioning
        const lx = centerX + Math.cos(angle) * (radius + 35);
        const ly = centerY + Math.sin(angle) * (radius + 35);
        ctx.textAlign = lx > centerX + 5 ? 'left' : lx < centerX - 5 ? 'right' : 'center';
        ctx.textBaseline = ly > centerY + 5 ? 'top' : ly < centerY - 5 ? 'bottom' : 'middle';
        ctx.fillText(domains[i].charAt(0).toUpperCase() + domains[i].slice(1), lx, ly);
    }
    // Draw polygon
    ctx.beginPath();
    values.forEach((val, i) => {
        const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
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
    ctx.lineWidth = 2;
    ctx.stroke();
}
