export type Recipient = '부모님' | '배우자' | '친구' | '연인' | '선생님' | '기타';

export type Mood = '따뜻한' | '진지한' | '밝은';

export interface OrderData {
  recipient: Recipient;
  date: string;
  mood: Mood;
  core_sentence: string;
  name?: string;
  keywords?: string;
}

export type PricePlan = 'basic' | 'plus' | 'premium';

export const PRICE_PLANS: Record<PricePlan, { name: string; price: number; priceId?: string }> = {
  basic: { name: 'Basic', price: 9900 },
  plus: { name: 'Plus', price: 14900 },
  premium: { name: 'Premium', price: 24900 },
};

