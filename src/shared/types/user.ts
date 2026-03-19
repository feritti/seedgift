export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  stripeAccountId: string | null;
  stripeOnboarded: boolean;
  createdAt: string;
}
