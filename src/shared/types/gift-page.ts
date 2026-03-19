export interface GiftPage {
  id: string;
  userId: string;
  slug: string;
  childName: string;
  childPhotoUrl: string | null;
  childDob: string | null; // ISO date string
  eventName: string;
  fundTicker: string;
  fundName: string;
  status: "active" | "paused" | "archived";
  createdAt: string;
  updatedAt: string;
}
