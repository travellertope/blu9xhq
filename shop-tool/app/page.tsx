import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession, getMyShop } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await getSession();
  if (session) {
    const shop = await getMyShop();
    redirect(shop ? "/dashboard" : "/create");
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-line">
        <div className="max-w-site mx-auto px-7 flex items-center justify-between h-16">
          <span className="flex items-center gap-1 font-extrabold text-lg">
            Bluu<span className="text-blue">Shop</span>
          </span>
          <Link href="/login" className="text-sm font-semibold text-ink-soft hover:text-ink transition-colors">
            Log in
          </Link>
        </div>
      </header>

      <section className="max-w-2xl mx-auto px-7 py-24 text-center">
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">
          A free online shop, run entirely from your phone.
        </h1>
        <p className="mt-5 text-lg text-ink-soft leading-relaxed">
          Add products with your camera, share one link, and let customers build
          a cart — checkout happens straight in WhatsApp, no payment
          processor required.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/create">Create your free shop</Link>
          </Button>
        </div>
        <p className="mt-4 text-sm text-ink-soft">Free forever for your first 20 products.</p>
      </section>
    </div>
  );
}
