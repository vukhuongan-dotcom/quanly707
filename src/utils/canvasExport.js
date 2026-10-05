import { formatVietnamDate, getRoomLabel, getPreOpSummary, getPatientAge } from './bedLayout';
import { isBSHuu } from './doctors';

export function exportBedsToPng(beds) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    alert('Không thể khởi tạo Canvas trên thiết bị này.');
    return;
  }

  const width = 1800;
  const padding = 48;
  const colWidth = (width - padding * 2 - 40) / 2;

  // Measure and wrap text helper
  ctx.font = '20px sans-serif';
  const wrapText = (text, maxWidth) => {
    if (!text) return [];
    const lines = [];
    const paragraphs = String(text).split('\n');
    for (const p of paragraphs) {
      let currentLine = '';
      const words = p.split(/\s+/);
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (ctx.measureText(testLine).width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);
    }
    return lines;
  };

  // Group beds by room
  const leftRooms = ['1', '2', '4', '6', '8'];
  const rightRooms = ['3', '5', '7', '9'];

  const getBedsForRoom = (roomLabel) => {
    const list = beds.filter(
      (b) => b.id <= 18 && (b.label === roomLabel || getRoomLabel(b.slot ?? b.id) === roomLabel)
    );
    const occupied = list.filter((b) => b.name && b.name.trim());
    return occupied.length > 0 ? occupied : [list[0] || { label: roomLabel, name: '' }];
  };

  // Calculate dynamic heights
  const computeBedHeight = (bed) => {
    if (!bed.name) return 90; // Empty bed card height
    let h = 80; // Header, name, age, tag
    if (bed.diagnosis) h += wrapText(`CĐ: ${bed.diagnosis}`, colWidth - 40).length * 28 + 8;
    if (bed.treatment) h += wrapText(`PP: ${bed.treatment}`, colWidth - 40).length * 28 + 8;
    if (bed.surgeon) h += 32;
    if (bed.date) h += 32;
    h += 60; // 6 Pre-Op chips
    if (bed.history) h += wrapText(`Tiền căn: ${bed.history}`, colWidth - 40).length * 26 + 12;
    if (bed.notes) h += wrapText(`Chú ý: ${bed.notes}`, colWidth - 40).length * 26 + 12;
    return h + 30; // Padding
  };

  const leftHeights = leftRooms.map((r) => {
    const rBeds = getBedsForRoom(r);
    return rBeds.reduce((sum, b) => sum + computeBedHeight(b) + 16, 0);
  });

  const rightHeights = rightRooms.map((r) => {
    const rBeds = getBedsForRoom(r);
    return rBeds.reduce((sum, b) => sum + computeBedHeight(b) + 16, 0);
  });

  const rowHeights = leftRooms.map((_, i) => {
    const lh = leftHeights[i] || 0;
    const rh = rightHeights[i] || 0;
    return Math.max(lh, rh);
  });

  const headerHeight = 160;
  const stretchers = beds.filter((b) => b.id > 18);
  const stretcherHeight = stretchers.reduce((sum, b) => sum + computeBedHeight(b) + 16, 0);

  const totalHeight = headerHeight + rowHeights.reduce((a, b) => a + b + 24, 0) + stretcherHeight + 100;
  canvas.width = width;
  canvas.height = totalHeight;

  // Background
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, width, totalHeight);

  // App Bar / Header
  ctx.fillStyle = '#065f46';
  ctx.fillRect(0, 0, width, 120);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText('QUẢN LÝ P707 · KHOA PHẪU THUẬT ĐẠI TRỰC TRÀNG', padding, 55);

  const todayStr = formatVietnamDate();
  const occCount = beds.filter((b) => b.name && b.name.trim()).length;
  ctx.font = '20px sans-serif';
  ctx.fillStyle = '#a7f3d0';
  ctx.fillText(`Ngày xuất: ${todayStr} · Bệnh nhân hiện diện: ${occCount}/18 giường`, padding, 95);

  // Render Room Grid
  let currentY = headerHeight;

  const renderBedCard = (bed, x, y, w, cardH) => {
    // Card background & border
    ctx.fillStyle = bed.name ? '#ffffff' : '#f1f5f9';
    ctx.strokeStyle = bed.name ? '#cbd5e1' : '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, w, cardH, 16);
    ctx.fill();
    ctx.stroke();

    if (!bed.name) {
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(`GIƯỜNG G${bed.label} · ĐANG TRỐNG`, x + 24, y + 55);
      return;
    }

    let innerY = y + 36;
    // Bed Badge & Name
    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.roundRect(x + 20, innerY - 24, 60, 36, 8);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`G${bed.label}`, x + 30, innerY);

    // Patient Name & Age
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 24px sans-serif';
    const age = getPatientAge(bed.birth);
    const nameStr = `${bed.name} ${bed.birth ? `· ${bed.birth} (${age ? `${age}t` : ''})` : ''}`;
    ctx.fillText(nameStr, x + 96, innerY);

    // BS Huu Tag
    if (isBSHuu(bed.surgeon)) {
      const tagX = x + w - 140;
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.roundRect(tagX, innerY - 24, 110, 32, 6);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('✓ BS HỮU', tagX + 14, innerY - 2);
    }

    innerY += 36;

    // Diagnosis
    if (bed.diagnosis) {
      ctx.fillStyle = '#334155';
      ctx.font = 'bold 19px sans-serif';
      const diagLines = wrapText(`CĐ: ${bed.diagnosis}`, w - 48);
      for (const line of diagLines) {
        ctx.fillText(line, x + 24, innerY);
        innerY += 28;
      }
    }

    // Treatment & Surgeon
    ctx.font = '18px sans-serif';
    ctx.fillStyle = '#475569';
    if (bed.treatment) {
      const treatLines = wrapText(`PP: ${bed.treatment}`, w - 48);
      for (const line of treatLines) {
        ctx.fillText(line, x + 24, innerY);
        innerY += 26;
      }
    }

    if (bed.surgeon || bed.date) {
      const meta = `BS: ${bed.surgeon || 'Chưa chọn'} · Ngày mổ: ${bed.date || 'Chưa lên lịch'}`;
      ctx.fillText(meta, x + 24, innerY);
      innerY += 30;
    }

    // Pre-Op Chips (6 items)
    const preOp = getPreOpSummary(bed);
    ctx.font = 'bold 15px sans-serif';
    const chipW = (w - 48 - 25) / 6;
    preOp.items.forEach((item, idx) => {
      const chipX = x + 24 + idx * (chipW + 5);
      ctx.fillStyle = item.done ? '#dcfce7' : '#f1f5f9';
      ctx.strokeStyle = item.done ? '#86efac' : '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(chipX, innerY, chipW, 30, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = item.done ? '#166534' : '#64748b';
      const label = item.done ? `✓ ${item.label}` : item.label;
      ctx.fillText(label, chipX + 6, innerY + 21);
    });

    innerY += 46;

    // History
    if (bed.history) {
      ctx.fillStyle = '#1e293b';
      ctx.font = '16px sans-serif';
      const histLines = wrapText(`Tiền căn: ${bed.history}`, w - 48);
      for (const line of histLines) {
        ctx.fillText(line, x + 24, innerY);
        innerY += 24;
      }
    }

    // Notes
    if (bed.notes) {
      ctx.fillStyle = '#0f172a';
      ctx.font = '16px sans-serif';
      const noteLines = wrapText(`Chú ý: ${bed.notes}`, w - 48);
      for (const line of noteLines) {
        ctx.fillText(line, x + 24, innerY);
        innerY += 24;
      }
    }
  };

  // Draw Grid Rows
  leftRooms.forEach((leftLabel, idx) => {
    const rowH = rowHeights[idx];
    const leftBeds = getBedsForRoom(leftLabel);
    const rightLabel = rightRooms[idx];
    const rightBeds = rightLabel ? getBedsForRoom(rightLabel) : [];

    // Left Column Card
    if (leftBeds.length > 0) {
      renderBedCard(leftBeds[0], padding, currentY, colWidth, rowH);
    }

    // Right Column Card
    if (rightBeds.length > 0) {
      renderBedCard(rightBeds[0], padding + colWidth + 40, currentY, colWidth, rowH);
    }

    currentY += rowH + 24;
  });

  // Export & Download
  const link = document.createElement('a');
  link.download = `quanly707_${todayStr}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
