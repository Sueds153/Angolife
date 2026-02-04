
import { ExchangeRate, JobListing, Promotion } from './types';

export const INITIAL_EXCHANGE_RATES: ExchangeRate[] = [
  { currency: 'USD', formal: 828.50, informal: 1250.00, trend: 'up', change: '+1.5%' },
  { currency: 'EUR', formal: 915.20, informal: 1340.00, trend: 'up', change: '+1.2%' }
];

export const MOCK_JOBS: JobListing[] = [
  {
    id: '1',
    title: 'Director de Investimentos',
    company: 'Standard Bank Angola',
    location: 'Luanda',
    type: 'Full-time',
    postedAt: '2 horas atrás',
    isElite: true,
    salary: '2.500.000 - 4.000.000 AOA',
    image: 'https://picsum.photos/seed/bank/800/400',
    email: 'recrutamento@standardbank.co.ao',
    phone: '+244 923 000 000'
  },
  {
    id: '2',
    title: 'Geólogo de Reservatórios',
    company: 'Sonangol',
    location: 'Offshore',
    type: 'Contract',
    postedAt: 'Há 1 dia',
    salary: 'Consultar',
    image: 'https://picsum.photos/seed/oil/800/400',
    email: 'carreiras@sonangol.co.ao',
    phone: '+244 222 000 000'
  },
  {
    id: '3',
    title: 'CISO - Chief Security Officer',
    company: 'AngoTelecom',
    location: 'Luanda',
    type: 'Full-time',
    postedAt: 'Há 3 dias',
    isElite: true,
    salary: '1.800.000 AOA',
    image: 'https://picsum.photos/seed/it/800/400',
    email: 'talentos@angotelecom.ao',
    phone: '+244 912 000 000'
  }
];

export const MOCK_PROMOTIONS: Promotion[] = [
  {
    id: 'p1',
    productName: 'iPhone 15 Pro Max Titanium',
    price: '950.000 AOA',
    store: 'Unitel Store',
    location: 'Shopping Fortaleza, Luanda',
    image: 'https://picsum.photos/seed/iphone/400/400',
    isVerified: true,
    category: 'Tech'
  },
  {
    id: 'p2',
    productName: 'Relógio Suíço Automático',
    price: '1.450.000 AOA',
    store: ' Boutique D\'Ouro',
    location: 'Talatona, Luanda',
    image: 'https://picsum.photos/seed/watch/400/400',
    isVerified: true,
    category: 'Fashion'
  }
];
