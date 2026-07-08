export interface StatDetails {
  views: number;
  quotes: number;
  whatsappClicks: number;
}

export interface QuoteRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  description: string;
  files: string[]; // Base64 or standard asset URLs
  date: string;
  status: 'Pending' | 'Reviewing' | 'Quoted' | 'Completed';
  internalNotes?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: 'auto' | 'immobili' | 'ritratti' | 'paesaggi' | 'prodotti';
  beforeImage: string;
  afterImage: string;
  description: string;
  featured?: boolean;
  // Dynamic filter simulations if any
  beforeFilter?: string; // CSS Filter e.g. saturate-50 brightness-75 contrast-90 sepia-[0.1]
  afterFilter?: string;  // CSS Filter e.g. saturate-110 brightness-105 contrast-105
}

export interface ServiceItem {
  id: string;
  key: string; // 'auto' | 'immobili' | 'ritratti' | 'paesaggi' | 'prodotti'
  icon: string;
  title: string;
  subtitle: string;
  shortDesc: string;
  longDesc: string;
  pricing: string;
  slug: string;
}

export interface ReviewItem {
  id: string;
  author: string;
  rating: number; // 1-5
  text: string;
  date: string;
  avatar?: string;
  reply?: string;
  source: 'google' | 'direct';
}

export interface CustomPage {
  id: string;
  title: string;
  slug: string;
  content: string; // Markdown or HTML
  createdAt: string;
  metaDescription?: string;
  isPublished: boolean;
}

export interface AppSettings {
  heroTitle: string;
  heroSubtitle: string;
  whatsappNumber: string;
  contactEmail: string;
  showSpecialOffer: boolean;
  specialOfferText: string;
  showBeforeAfterSandbox: boolean;
}

export interface DatabaseState {
  stats: StatDetails;
  quotes: QuoteRequest[];
  portfolio: PortfolioItem[];
  services: ServiceItem[];
  reviews: ReviewItem[];
  customPages: CustomPage[];
  settings: AppSettings;
}
