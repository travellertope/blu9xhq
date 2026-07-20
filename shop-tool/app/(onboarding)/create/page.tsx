import { redirect } from "next/navigation";
import { getSession, getMyShop } from "@/lib/auth";
import CreateWithEmailForm from "@/components/onboarding/create-with-email-form";
import CreateShopForm from "@/components/onboarding/create-shop-form";

export default async function CreatePage() {
  const session = await getSession();

  if (session) {
    const shop = await getMyShop();
    if (shop) redirect("/dashboard");
    return <CreateShopForm />;
  }

  return <CreateWithEmailForm />;
}
