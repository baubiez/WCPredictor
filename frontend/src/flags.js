// Mapping FIFA 3-letter codes → flag emoji
const FLAGS = {
  // Europe
  FRA: '🇫🇷', ENG: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', GER: '🇩🇪', ESP: '🇪🇸', ITA: '🇮🇹',
  POR: '🇵🇹', NED: '🇳🇱', BEL: '🇧🇪', CRO: '🇭🇷', POL: '🇵🇱',
  SUI: '🇨🇭', SRB: '🇷🇸', DEN: '🇩🇰', AUT: '🇦🇹', TUR: '🇹🇷',
  SCO: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', WAL: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', NOR: '🇳🇴', SWE: '🇸🇪', CZE: '🇨🇿',
  SVK: '🇸🇰', HUN: '🇭🇺', ROU: '🇷🇴', GRE: '🇬🇷', ALB: '🇦🇱',
  SVN: '🇸🇮', FIN: '🇫🇮', ISL: '🇮🇸', NIR: '🇬🇧', IRL: '🇮🇪',
  UKR: '🇺🇦', GEO: '🇬🇪', AZE: '🇦🇿', LUX: '🇱🇺', MKD: '🇲🇰',
  KOS: '🇽🇰', BIH: '🇧🇦', MNE: '🇲🇪', ARM: '🇦🇲', BLR: '🇧🇾',
  // Amériques
  BRA: '🇧🇷', ARG: '🇦🇷', URU: '🇺🇾', COL: '🇨🇴', ECU: '🇪🇨',
  CHI: '🇨🇱', PAR: '🇵🇾', PER: '🇵🇪', VEN: '🇻🇪', BOL: '🇧🇴',
  USA: '🇺🇸', MEX: '🇲🇽', CAN: '🇨🇦', PAN: '🇵🇦', JAM: '🇯🇲',
  CRC: '🇨🇷', HON: '🇭🇳', GTM: '🇬🇹', SLV: '🇸🇻', NCA: '🇳🇮',
  CUB: '🇨🇺', HAI: '🇭🇹', TRI: '🇹🇹', GUY: '🇬🇾', SUR: '🇸🇷',
  // Afrique
  MAR: '🇲🇦', SEN: '🇸🇳', NGA: '🇳🇬', CMR: '🇨🇲', EGY: '🇪🇬',
  CIV: '🇨🇮', GHA: '🇬🇭', TUN: '🇹🇳', ALG: '🇩🇿', MLI: '🇲🇱',
  ZAF: '🇿🇦', COD: '🇨🇩', ZAM: '🇿🇲', ZIM: '🇿🇼', ANG: '🇦🇴',
  MOZ: '🇲🇿', UGA: '🇺🇬', KEN: '🇰🇪', ETH: '🇪🇹', CPV: '🇨🇻',
  GAB: '🇬🇦', BFA: '🇧🇫', GUI: '🇬🇳', BEN: '🇧🇯', TOG: '🇹🇬',
  NAM: '🇳🇦', MTN: '🇲🇷', NIG: '🇳🇪', TAN: '🇹🇿', LBR: '🇱🇷',
  SLE: '🇸🇱', GNB: '🇬🇼', EQG: '🇬🇶', CTA: '🇨🇫',
  // Asie / Pacifique
  JPN: '🇯🇵', KOR: '🇰🇷', IRN: '🇮🇷', KSA: '🇸🇦', AUS: '🇦🇺',
  QAT: '🇶🇦', UZB: '🇺🇿', IRQ: '🇮🇶', JOR: '🇯🇴', UAE: '🇦🇪',
  CHN: '🇨🇳', THA: '🇹🇭', VIE: '🇻🇳', IDN: '🇮🇩', MYS: '🇲🇾',
  BHR: '🇧🇭', KUW: '🇰🇼', OMN: '🇴🇲', SYR: '🇸🇾', LBN: '🇱🇧',
  PAL: '🇵🇸', TJK: '🇹🇯', KGZ: '🇰🇬', TKM: '🇹🇲', KAZ: '🇰🇿',
  SGP: '🇸🇬', IND: '🇮🇳', PHI: '🇵🇭',
  // OFC
  NZL: '🇳🇿', FIJ: '🇫🇯', PNG: '🇵🇬', SOL: '🇸🇧', VAN: '🇻🇺',
};

export const teamFlag = (code) => FLAGS[code] ?? '';
