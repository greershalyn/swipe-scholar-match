export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  subscription_tier: 'free' | 'premium';
}
