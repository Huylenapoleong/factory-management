/**
 * Factory Shift definition and dynamic calculation based on standard industrial 3-shift model:
 * - Shift A (Morning / 早班): 08:00 - 16:30
 * - Shift B (Evening / 中班): 16:30 - 00:30
 * - Shift C (Night / 夜班):   00:30 - 08:00
 */
export interface FactoryShift {
  code: 'A' | 'B' | 'C';
  nameEn: string;
  nameZh: string;
  timeRange: string;
  badgeEn: string;
  badgeZh: string;
  nextShiftCode: 'A' | 'B' | 'C';
  nextShiftNameEn: string;
  nextShiftNameZh: string;
  nextShiftRange: string;
}

export const getFactoryShift = (date: Date = new Date()): FactoryShift => {
  const currentMinutes = date.getHours() * 60 + date.getMinutes();

  // Shift A: 08:00 (480m) to 16:30 (990m)
  if (currentMinutes >= 480 && currentMinutes < 990) {
    return {
      code: 'A',
      nameEn: 'Shift A (Morning)',
      nameZh: '早班 (A班)',
      timeRange: '08:00 - 16:30',
      badgeEn: 'Shift A (08:00 - 16:30)',
      badgeZh: '早班 (08:00 - 16:30)',
      nextShiftCode: 'B',
      nextShiftNameEn: 'Shift B (Evening)',
      nextShiftNameZh: '中班 (16:30 - 00:30)',
      nextShiftRange: '16:30 - 00:30',
    };
  }

  // Shift B: 16:30 (990m) to 24:00 (1440m) OR 00:00 to 00:30 (30m)
  if (currentMinutes >= 990 || currentMinutes < 30) {
    return {
      code: 'B',
      nameEn: 'Shift B (Evening)',
      nameZh: '中班 (B班)',
      timeRange: '16:30 - 00:30',
      badgeEn: 'Shift B (16:30 - 00:30)',
      badgeZh: '中班 (16:30 - 00:30)',
      nextShiftCode: 'C',
      nextShiftNameEn: 'Shift C (Night)',
      nextShiftNameZh: '夜班 (00:30 - 08:00)',
      nextShiftRange: '00:30 - 08:00',
    };
  }

  // Shift C: 00:30 (30m) to 08:00 (480m)
  return {
    code: 'C',
    nameEn: 'Shift C (Night)',
    nameZh: '夜班 (C班)',
    timeRange: '00:30 - 08:00',
    badgeEn: 'Shift C (00:30 - 08:00)',
    badgeZh: '夜班 (00:30 - 08:00)',
    nextShiftCode: 'A',
    nextShiftNameEn: 'Shift A (Morning)',
    nextShiftNameZh: '早班 (08:00 - 16:30)',
    nextShiftRange: '08:00 - 16:30',
  };
};
