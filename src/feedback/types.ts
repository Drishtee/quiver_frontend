export interface FeedbackNote {
  id: string;
  text: string;
  page: string;
  section: string;
  xPercent: number;
  yPercent: number;
  timestamp: string;
  webhookSent: boolean;
}
