/**
 * Conversion d'un nombre en lettres françaises
 * Adapté pour les Dinars Tunisiens (1 DT = 1000 millimes)
 */

const UNITS = [
  '', 'un', 'deux', 'trois', 'quatre', 'cinq',
  'six', 'sept', 'huit', 'neuf', 'dix',
  'onze', 'douze', 'treize', 'quatorze', 'quinze',
  'seize', 'dix-sept', 'dix-huit', 'dix-neuf'
];

const TENS = [
  '', '', 'vingt', 'trente', 'quarante',
  'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'
];

function convertBelow100(n: number): string {
  if (n < 20) return UNITS[n];
  if (n === 20) return 'vingt';
  if (n === 80) return 'quatre-vingts';

  const ten = Math.floor(n / 10);
  const unit = n % 10;

  if (ten === 7 || ten === 9) {
    const base = ten === 7 ? 60 : 80;
    const remainder = n - base;
    const baseWord = ten === 7 ? 'soixante' : 'quatre-vingt';
    if (n === 71) return 'soixante-et-onze';
    return baseWord + '-' + UNITS[remainder];
  }

  let result = TENS[ten];
  if (unit === 0) return result;
  if (unit === 1 && ten !== 8) return result + '-et-un';
  return result + '-' + UNITS[unit];
}

function convertBelow1000(n: number): string {
  if (n === 0) return '';
  if (n < 100) return convertBelow100(n);

  const hundreds = Math.floor(n / 100);
  const remainder = n % 100;
  let result = '';

  if (hundreds === 1) {
    result = 'cent';
  } else {
    result = UNITS[hundreds] + ' cent';
  }

  if (remainder === 0) {
    if (hundreds > 1) result += 's';
    return result;
  }

  return result + ' ' + convertBelow100(remainder);
}

function convertInteger(n: number): string {
  if (n === 0) return 'zéro';

  const scales = [
    { value: 1_000_000_000, name: 'milliard', plural: 'milliards' },
    { value: 1_000_000, name: 'million', plural: 'millions' },
    { value: 1_000, name: 'mille', plural: 'mille' },
    { value: 1, name: '', plural: '' }
  ];

  let result = '';
  let remaining = Math.abs(n);

  for (const scale of scales) {
    if (remaining >= scale.value) {
      const quotient = Math.floor(remaining / scale.value);
      const rem = remaining % scale.value;

      if (scale.value === 1_000) {
        if (quotient > 1) result += convertBelow1000(quotient) + ' ';
        result += 'mille';
      } else if (scale.value > 1_000) {
        result += convertBelow1000(quotient) + ' ';
        result += quotient > 1 ? scale.plural : scale.name;
      } else {
        result += convertBelow1000(quotient);
      }

      if (rem > 0) result += ' ';
      remaining = rem;
    }
  }

  return result.trim();
}

export function montantEnLettres(montant: number): string {
  if (montant === 0) return 'zéro dinar tunisien';

  const isNegative = montant < 0;
  const absMontant = Math.abs(montant);

  const dinars = Math.floor(absMontant);
  const millimesRaw = Math.round((absMontant - dinars) * 1000);
  const millimes = millimesRaw >= 1000 ? 999 : millimesRaw;

  let result = '';
  if (isNegative) result += 'moins ';

  if (dinars > 0) {
    result += convertInteger(dinars);
    result += dinars === 1 ? ' dinar tunisien' : ' dinars tunisiens';
  }

  if (millimes > 0) {
    if (dinars > 0) result += ' et ';
    result += convertInteger(millimes);
    result += millimes === 1 ? ' millime' : ' millimes';
  }

  return result;
}