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

/** Convertit un nombre de 0 à 99 en lettres */
function convertBelow100(n: number): string {
  if (n < 20) return UNITS[n];
  if (n === 20) return 'vingt';
  if (n === 80) return 'quatre-vingts';

  const ten = Math.floor(n / 10);
  const unit = n % 10;
  let result = TENS[ten];

  // Cas spécifiques 70-79 : soixante-dix, soixante-et-onze, soixante-douze...
  if (ten === 7 || ten === 9) {
    const remainder = n - (ten === 7 ? 60 : 80);
    if (remainder < 20) {
      result = ten === 7 ? 'soixante' : 'quatre-vingt';
      if (remainder === 11 && ten === 7) {
        return result + '-et-onze';
      }
      if (remainder === 1 && ten === 7) {
        return result + '-et-onze';
      }
      return result + '-' + UNITS[remainder];
    }
  }

  if (unit === 0) return result;
  if (unit === 1 && ten !== 8) {
    return result + '-et-un';
  }
  return result + '-' + UNITS[unit];
}

/** Convertit un nombre de 0 à 999 en lettres */
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

/** Convertit un nombre entier en lettres françaises */
function convertInteger(n: number): string {
  if (n === 0) return 'zéro';

  const scales: { value: number; name: string; plural: string }[] = [
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
      const remainder = remaining % scale.value;

      if (scale.value === 1_000) {
        // "mille" ne prend jamais de "un" devant
        if (quotient > 1) {
          result += convertBelow1000(quotient) + ' ';
        }
        result += 'mille';
      } else if (scale.value > 1_000) {
        result += convertBelow1000(quotient) + ' ';
        result += quotient > 1 ? scale.plural : scale.name;
      } else {
        result += convertBelow1000(quotient);
      }

      if (remainder > 0) {
        result += ' ';
      }
      remaining = remainder;
    }
  }

  return result.trim();
}

/**
 * Convertit un montant en DT en texte complet
 * Ex: 12345.678 → "douze mille trois cent quarante-cinq dinars tunisiens et six cent soixante-dix-huit millimes"
 */
export function montantEnLettres(montant: number): string {
  if (montant === 0) return 'zéro dinar tunisien';

  const isNegative = montant < 0;
  const absMontant = Math.abs(montant);

  const dinars = Math.floor(absMontant);
  const millimesRaw = Math.round((absMontant - dinars) * 1000);
  const millimes = millimesRaw >= 1000 ? 999 : millimesRaw;

  let result = '';

  if (isNegative) result += 'moins ';

  // Partie dinars
  if (dinars > 0) {
    result += convertInteger(dinars);
    result += dinars === 1 ? ' dinar tunisien' : ' dinars tunisiens';
  }

  // Partie millimes
  if (millimes > 0) {
    if (dinars > 0) result += ' et ';
    result += convertInteger(millimes);
    result += millimes === 1 ? ' millime' : ' millimes';
  }

  return result;
}