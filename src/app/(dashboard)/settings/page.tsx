import { getSession } from "@/lib/auth";
import { SettingsContent } from "./settings-content";

export default async function SettingsPage() {
  const session = await getSession();

  return (
    <SettingsContent
      user={session?.user ?? null}
    />
  );
}
