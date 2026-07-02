export interface HeroProps {
  cover: string;
  logo: string;

  companyName: string;
  category: string;

  description: string;

  rating: number;
  reviews: number;

  welcomeMessage?: string;
}