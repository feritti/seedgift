import { getMyGifts } from "@/lib/actions/gifts";
import { GiftsList } from "@/components/dashboard/gifts-list";

export default async function GiftsPage() {
  const gifts = await getMyGifts();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl text-text-primary mb-1">Gifts Received</h1>
        <p className="text-text-secondary">
          Track all gifts across your gift pages
        </p>
      </div>

      <GiftsList gifts={gifts} />
    </div>
  );
}
