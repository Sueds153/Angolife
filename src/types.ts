export interface ExchangeRate {
  currency: string;
  formal: number;
  informal: number;
  trend: 'up' | 'down' | 'stable';
  change: string;
  lastUpdated?: string; // New: track updates
}

export interface ExchangeHistoryPoint {
  date: string;
  formal: number;
  informal: number;
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  postedAt: string;
  salary?: string;
  isElite?: boolean;
  logo?: string;
  image?: string;
  description?: string;
  email?: string;
  phone?: string;
  source?: string; // New: 'LinkedIn', 'Jobartis', 'Manual'
  sourceUrl?: string; // New: link to original ad
  salaryValue?: number; // New: numeric value for filtering
  status?: 'pending' | 'published'; // New: for admin moderation control
}

export type PromotionCategory = 'Tech' | 'Fashion' | 'Beauty' | 'Auto' | 'Home' | 'Other';

export interface Promotion {
  id: string;
  productName: string;
  price: string;
  store: string;
  location: string;
  image: string;
  isVerified?: boolean;
  description?: string;
  userContact?: string;
  submittedBy?: string;
  category?: PromotionCategory;
  status?: 'pending' | 'published';
  sourceUrl?: string;
}

export interface AdSpot {
  id: string;
  title: string;
  description: string;
  image?: string;
  cta: string;
}

export interface NewsItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string; // Used in NewsDetail as 'description'. In some contexts might be 'content'
  content?: string;
  image_url?: string;
  created_at?: string;
  category?: string;
}
