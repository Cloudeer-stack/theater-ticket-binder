export type Category = '音乐剧' | '话剧' | '舞剧' | '其他';

export interface Ticket {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  venue: string;
  seat: string;
  price: string;
  category: Category;
  review: string;
  ticketImage?: string; // base64
  posterImage?: string; // base64
  cast: string;
  tags: string[];
  createdAt: number;
}
