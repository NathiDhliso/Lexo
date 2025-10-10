export const SA_VAT_RATE = 0.15;

export interface VATBreakdown {
  subtotal: number;
  vat: number;
  total: number;
}

export function calculateVAT(subtotal: number): VATBreakdown {
  const vat = subtotal * SA_VAT_RATE;
  const total = subtotal + vat;
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    vat: Math.round(vat * 100) / 100,
    total: Math.round(total * 100) / 100
  };
}

export function extractVATFromTotal(total: number): VATBreakdown {
  const subtotal = total / (1 + SA_VAT_RATE);
  const vat = total - subtotal;
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    vat: Math.round(vat * 100) / 100,
    total: Math.round(total * 100) / 100
  };
}

export function formatSADate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
}

export function formatPracticeNumber(practiceNumber: string): string {
  return practiceNumber.replace(/\s/g, '').toUpperCase();
}

export function validatePracticeNumber(practiceNumber: string): boolean {
  const cleaned = practiceNumber.replace(/\s/g, '');
  return /^[A-Z0-9]{4,12}$/.test(cleaned);
}

export enum BarAssociation {
  JOHANNESBURG = 'Johannesburg',
  CAPE_TOWN = 'Cape Town',
  DURBAN = 'Durban',
  PRETORIA = 'Pretoria',
  BLOEMFONTEIN = 'Bloemfontein',
  PORT_ELIZABETH = 'Port Elizabeth',
  GRAHAMSTOWN = 'Grahamstown',
  PIETERMARITZBURG = 'Pietermaritzburg'
}

export function getBarAssociationColor(bar: string): string {
  switch (bar) {
    case BarAssociation.JOHANNESBURG:
      return 'text-mpondo-gold-600 dark:text-mpondo-gold-400';
    case BarAssociation.CAPE_TOWN:
      return 'text-judicial-blue-600 dark:text-judicial-blue-400';
    default:
      return 'text-neutral-600 dark:text-neutral-400';
  }
}

export interface TrustAccountInfo {
  isTrustAccount: boolean;
  trustAccountNumber?: string;
  trustAccountBank?: string;
}

export function isTrustAccountMatter(matterType?: string): boolean {
  const trustMatterTypes = ['conveyancing', 'estate', 'trust administration'];
  return trustMatterTypes.some(type => 
    matterType?.toLowerCase().includes(type)
  );
}

export interface ContingencyFeeInfo {
  isContingency: boolean;
  successFeePercentage?: number;
  cappedAmount?: number;
  conditions?: string;
}

export function validateContingencyFee(percentage: number): boolean {
  return percentage >= 0 && percentage <= 25;
}
