export interface Quote {
  id: number;
  quote_text: string;
  author: string;
  source: string;
  language: string;
  ai_context: string;
  tags: string[];
  related_quote_ids: number[];
  color?: string;
  likes?: number;
}
