export interface FeedbackNote {
  id: string;
  text: string;
  route: string;
  section: string;
  xPx: number;
  yPx: number;
  timestamp: string;
  webhookSent: boolean;
}
