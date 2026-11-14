import type { Metadata } from "next";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

// Replaces the layout's `index` robots and home canonical, which would otherwise be inherited.
export const metadata: Metadata = {
  title: "پیدا نشد",
  robots: { index: false, follow: true },
  alternates: { canonical: null },
};

export default function NotFound() {
  return (
    <section className="grid min-h-svh place-items-center">
      <div className="flex flex-col items-start gap-10 border p-8 md:p-12">
        <h1 className="flex flex-col gap-5">
          <span className="block text-xl text-muted-foreground md:text-2xl">۴۰۴</span>
          <span className="block text-4xl font-black md:text-6xl">این در رو هنوز نساختیم</span>
          <span className="block text-xl text-muted-foreground md:text-2xl">ولی کلی در دیگه داریم که بذاری</span>
        </h1>
        <Link href="/" className={buttonVariants({ variant: "outline", size: "lg" })}>
          برگرد به کلکسیون
        </Link>
      </div>
    </section>
  );
}
