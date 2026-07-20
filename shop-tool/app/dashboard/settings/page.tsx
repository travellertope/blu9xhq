import { getMyShop } from "@/lib/auth";
import SettingsForm from "@/components/dashboard/settings-form";

export default async function SettingsPage() {
  const shop = await getMyShop();
  if (!shop) return null;

  return <SettingsForm shop={shop} />;
}
