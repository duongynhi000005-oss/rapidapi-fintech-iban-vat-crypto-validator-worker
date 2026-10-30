const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-RapidAPI-Key, X-RapidAPI-Host, X-RapidAPI-Proxy-Secret',
  'Access-Control-Max-Age': '86400',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...CORS_HEADERS,
    },
  });
}

const IBAN_COUNTRIES = {
  AD: { name: 'Andorra', length: 24, sepa: true },
  AE: { name: 'United Arab Emirates', length: 23, sepa: false },
  AL: { name: 'Albania', length: 28, sepa: false },
  AT: { name: 'Austria', length: 20, sepa: true },
  AZ: { name: 'Azerbaijan', length: 28, sepa: false },
  BA: { name: 'Bosnia and Herzegovina', length: 20, sepa: false },
  BE: { name: 'Belgium', length: 16, sepa: true },
  BG: { name: 'Bulgaria', length: 22, sepa: true },
  BH: { name: 'Bahrain', length: 22, sepa: false },
  BR: { name: 'Brazil', length: 29, sepa: false },
  BY: { name: 'Belarus', length: 28, sepa: false },
  CH: { name: 'Switzerland', length: 21, sepa: true },
  CR: { name: 'Costa Rica', length: 22, sepa: false },
  CY: { name: 'Cyprus', length: 28, sepa: true },
  CZ: { name: 'Czech Republic', length: 24, sepa: true },
  DE: { name: 'Germany', length: 22, sepa: true },
  DK: { name: 'Denmark', length: 18, sepa: true },
  DO: { name: 'Dominican Republic', length: 28, sepa: false },
  EE: { name: 'Estonia', length: 20, sepa: true },
  EG: { name: 'Egypt', length: 29, sepa: false },
  ES: { name: 'Spain', length: 24, sepa: true },
  FI: { name: 'Finland', length: 18, sepa: true },
  FR: { name: 'France', length: 27, sepa: true },
  GB: { name: 'United Kingdom', length: 22, sepa: true },
  GE: { name: 'Georgia', length: 22, sepa: false },
  GI: { name: 'Gibraltar', length: 23, sepa: true },
  GR: { name: 'Greece', length: 27, sepa: true },
  HR: { name: 'Croatia', length: 21, sepa: true },
  HU: { name: 'Hungary', length: 28, sepa: true },
  IE: { name: 'Ireland', length: 22, sepa: true },
  IL: { name: 'Israel', length: 23, sepa: false },
  IS: { name: 'Iceland', length: 26, sepa: true },
  IT: { name: 'Italy', length: 27, sepa: true },
  JO: { name: 'Jordan', length: 30, sepa: false },
  KW: { name: 'Kuwait', length: 30, sepa: false },
  KZ: { name: 'Kazakhstan', length: 20, sepa: false },
  LB: { name: 'Lebanon', length: 28, sepa: false },
  LI: { name: 'Liechtenstein', length: 21, sepa: true },
  LT: { name: 'Lithuania', length: 20, sepa: true },
  LU: { name: 'Luxembourg', length: 20, sepa: true },
  LV: { name: 'Latvia', length: 21, sepa: true },
  MC: { name: 'Monaco', length: 27, sepa: true },
  MD: { name: 'Moldova', length: 24, sepa: false },
  ME: { name: 'Montenegro', length: 22, sepa: false },
  MK: { name: 'North Macedonia', length: 19, sepa: false },
  MT: { name: 'Malta', length: 31, sepa: true },
  NL: { name: 'Netherlands', length: 18, sepa: true },
  NO: { name: 'Norway', length: 15, sepa: true },
  PK: { name: 'Pakistan', length: 24, sepa: false },
  PL: { name: 'Poland', length: 28, sepa: true },
  PT: { name: 'Portugal', length: 25, sepa: true },
  QA: { name: 'Qatar', length: 29, sepa: false },
  RO: { name: 'Romania', length: 24, sepa: true },
  RS: { name: 'Serbia', length: 22, sepa: false },
  SA: { name: 'Saudi Arabia', length: 24, sepa: false },
  SE: { name: 'Sweden', length: 24, sepa: true },
  SI: { name: 'Slovenia', length: 19, sepa: true },
  SK: { name: 'Slovakia', length: 24, sepa: true },
  SM: { name: 'San Marino', length: 27, sepa: true },
  TR: { name: 'Turkey', length: 26, sepa: false },
  UA: { name: 'Ukraine', length: 29, sepa: false },
  VA: { name: 'Vatican City', length: 22, sepa: true },
  VG: { name: 'British Virgin Islands', length: 24, sepa: false },
};

function validateIban(raw) {
  const clean = String(raw || '').replace(/[\s-]/g, '').toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(clean)) {
    return { valid: false, iban: raw, error: 'Invalid IBAN structure' };
  }
  const countryCode = clean.slice(0, 2);
  const checkDigits = clean.slice(2, 4);
  const bban = clean.slice(4);
  const spec = IBAN_COUNTRIES[countryCode] || { name: 'Unknown', length: clean.length, sepa: false };
  const lengthValid = clean.length === spec.length;
  const rearranged = bban + countryCode + checkDigits;
  const numeric = rearranged
    .split('')
    .map((ch) => (ch >= 'A' && ch <= 'Z' ? String(ch.charCodeAt(0) - 55) : ch))
    .join('');
  const checksumValid = BigInt(numeric) % 97n === 1n;
  return {
    valid: lengthValid && checksumValid,
    iban_electronic: clean,
    iban_formatted: clean.match(/.{1,4}/g)?.join(' ') || clean,
    country_code: countryCode,
    country_name: spec.name,
    sepa_member: spec.sepa,
    check_digits: checkDigits,
    bban,
    validation: { length_valid: lengthValid, expected_length: spec.length, checksum_mod97_valid: checksumValid },
  };
}

function validateBic(raw) {
  const clean = String(raw || '').trim().toUpperCase();
  const m = clean.match(/^([A-Z]{4})([A-Z]{2})([A-Z0-9]{2})([A-Z0-9]{3})?$/);
  if (!m) return { valid: false, bic: raw, error: 'Invalid ISO 9362 BIC/SWIFT format' };
  const branch = m[4] || 'XXX';
  return {
    valid: true,
    bic: clean,
    bank_code: m[1],
    country_code: m[2],
    location_code: m[3],
    branch_code: branch,
    is_head_office: branch === 'XXX',
  };
}

function validateVat(raw) {
  const clean = String(raw || '').toUpperCase().replace(/[\s.-]/g, '');
  const m = clean.match(/^(CHE|[A-Z]{2})([0-9A-Z]{5,14})$/);
  if (!m) return { valid: false, vat: raw, error: 'Invalid VAT format' };
  const countryCode = m[1];
  const body = m[2];
  let checksumValid = true;
  if (countryCode === 'BE' && /^\d{10}$/.test(body)) {
    checksumValid = 97 - (parseInt(body.slice(0, 8), 10) % 97) === parseInt(body.slice(8, 10), 10);
  } else if (countryCode === 'PL' && /^\d{10}$/.test(body)) {
    const w = [6, 5, 7, 2, 3, 4, 5, 6, 7];
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(body[i], 10) * w[i];
    checksumValid = sum % 11 === parseInt(body[9], 10);
  } else if (countryCode === 'LU' && /^\d{8}$/.test(body)) {
    checksumValid = parseInt(body.slice(0, 6), 10) % 89 === parseInt(body.slice(6, 8), 10);
  }
  return {
    valid: checksumValid,
    vat_number: `${countryCode}${body}`,
    country_code: countryCode,
    national_number: body,
    checksum_valid: checksumValid,
  };
}

function validateCard(raw) {
  const clean = String(raw || '').replace(/[\s-]/g, '');
  if (!/^\d{12,19}$/.test(clean)) return { valid: false, error: 'Card number must be 12-19 digits' };
  let sum = 0;
  let alt = false;
  for (let i = clean.length - 1; i >= 0; i--) {
    let d = parseInt(clean[i], 10);
    if (alt) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    alt = !alt;
  }
  const luhnValid = sum % 10 === 0;
  let brand = 'unknown';
  if (/^4\d{12,18}$/.test(clean)) brand = 'visa';
  else if (/^(5[1-5]\d{14}|2(22[1-9]\d{12}|2[3-9]\d{13}|[3-6]\d{14}|7[0-1]\d{13}|720\d{12}))$/.test(clean)) brand = 'mastercard';
  else if (/^3[47]\d{13}$/.test(clean)) brand = 'amex';
  else if (/^(6011\d{12}|65\d{14}|64[4-9]\d{13})$/.test(clean)) brand = 'discover';
  else if (/^35(2[89]|[3-8]\d)\d{12}$/.test(clean)) brand = 'jcb';
  return {
    valid: luhnValid && brand !== 'unknown',
    brand,
    bin: clean.slice(0, 6),
    last4: clean.slice(-4),
    length: clean.length,
    luhn_valid: luhnValid,
  };
}

function validateCrypto(raw) {
  const s = String(raw || '').trim();
  if (/^0x[0-9a-fA-F]{40}$/.test(s)) {
    return { valid: true, currency: 'ETH/EVM', format: 'hex_40', address: s };
  }
  if (/^(bc1|tb1)[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{25,87}$/i.test(s)) {
    return { valid: true, currency: 'BTC', format: 'bech32', address: s.toLowerCase() };
  }
  if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(s)) {
    return { valid: true, currency: 'BTC', format: 'base58check', address: s };
  }
  if (/^T[a-km-zA-HJ-NP-Z1-9]{33}$/.test(s)) {
    return { valid: true, currency: 'TRX', format: 'trc20_base58', address: s };
  }
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s)) {
    return { valid: true, currency: 'SOL', format: 'ed25519_base58', address: s };
  }
  return { valid: false, address: s, error: 'Unrecognized cryptocurrency address format' };
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });
    if (env.RAPIDAPI_PROXY_SECRET) {
      const incoming = request.headers.get('X-RapidAPI-Proxy-Secret');
      if (incoming !== env.RAPIDAPI_PROXY_SECRET) {
        return jsonResponse({ error: 'Unauthorized RapidAPI Proxy Secret' }, 403);
      }
    }
    const url = new URL(request.url);
    let body = {};
    if (request.method === 'POST') {
      try {
        body = await request.json();
      } catch {
        body = {};
      }
    }
    const getVal = (k) => url.searchParams.get(k) || body[k] || '';

    if (url.pathname === '/' || url.pathname === '/v1/health') {
      return jsonResponse({ status: 'healthy', service: 'fintech-validator-api', version: '1.0.0' });
    }
    if (url.pathname === '/v1/iban') return jsonResponse(validateIban(getVal('iban')));
    if (url.pathname === '/v1/bic') return jsonResponse(validateBic(getVal('bic')));
    if (url.pathname === '/v1/vat') return jsonResponse(validateVat(getVal('vat')));
    if (url.pathname === '/v1/card') return jsonResponse(validateCard(getVal('number')));
    if (url.pathname === '/v1/crypto') return jsonResponse(validateCrypto(getVal('address')));

    return jsonResponse({ error: 'Not Found', endpoints: ['/v1/iban', '/v1/bic', '/v1/vat', '/v1/card', '/v1/crypto', '/v1/health'] }, 404);
  },
};
