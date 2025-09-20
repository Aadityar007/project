
import type { ComponentType } from 'react';

export enum ViewType {
  DASHBOARD = 'dashboard',
  CROP_ADVISORY = 'crop_advisory',
  MARKET_WEATHER = 'market_weather',
  GOV_CONNECT = 'gov_connect',
}

export interface Language {
  code: string;
  name: string;
}

export interface Source {
  uri: string;
  title: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string; sources?: Source[] }[];
  image?: string;
  isLoading?: boolean;
}

export interface NavItem {
  id: ViewType;
  label: string;
  // FIX: Use imported ComponentType and remove React namespace to fix type error.
  icon: ComponentType<{ className?: string }>;
}
