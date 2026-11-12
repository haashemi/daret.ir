import type { ReactNode } from "react";

import { ArrowUpLeft, Heart } from "lucide-react";
import Link from "next/link";
import { FaGithub, FaTelegram } from "react-icons/fa6";

interface FooterLink {
  href: string;
  label: string;
  detail: string;
  lead: ReactNode;
}

const contactLinks: FooterLink[] = [
  {
    href: "https://t.me/HaashemiDev",
    label: "تلگرام",
    detail: "@HaashemiDev",
    lead: <FaTelegram className="size-4" />,
  },
  {
    href: "https://github.com/haashemi/daret.ir",
    label: "گیت‌هاب",
    detail: "haashemi/daret.ir",
    lead: <FaGithub className="size-4" />,
  },
  {
    href: "https://donofa.com/haashemi",
    label: "حمایت مالی",
    detail: "donofa/haashemi",
    lead: <Heart className="size-4" strokeWidth={1.75} />,
  },
];

const productLinks: FooterLink[] = [
  { href: "https://t.me/ClownCounterBot", label: "ربات دلقک شمار", detail: "@ClownCounterBot" },
  { href: "https://leftbede.ir/", label: "لفت بده!", detail: "leftbede.ir" },
  { href: "https://keyeh.ir/", label: "تقویمِ کِیه؟", detail: "keyeh.ir" },
].map((link, i) => ({
  ...link,
  lead: (
    <span className="text-xs text-muted-foreground tabular-nums">
      {(i + 1).toLocaleString("fa-IR", { minimumIntegerDigits: 2 })}
    </span>
  ),
}));

export function Footer() {
  return (
    <footer className="relative isolate container mx-auto max-w-7xl px-4 pt-24 pb-4 sm:px-0">
      {/* Light leaking along the footer's top edge, like the gap under a closed door. */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-24 left-1/2 -z-10 h-24 w-[min(40rem,100%)] -translate-1/2 rounded-full bg-light/6 blur-3xl"
      />
      <div aria-hidden className="h-px bg-linear-to-l from-border via-light/70 to-border" />

      <div className="grid border-s md:grid-cols-4">
        <div className="flex flex-col justify-between gap-5 border-e border-b px-6 py-7 md:col-span-2 md:gap-8 md:p-8">
          <Link href="/" className="w-fit text-6xl leading-none font-black md:text-8xl">
            دَرِت
          </Link>
          <p className="max-w-xs text-sm/loose text-muted-foreground">
            جایی برای وقتی که دیگه وقتشه درت رو بذاری. ساخته شده به شوخی توسط{" "}
            <a
              href="https://haashemi.dev"
              target="_blank"
              rel="noreferrer noopener"
              className="text-foreground underline decoration-foreground/25 underline-offset-4 transition-[text-decoration-color] hover:decoration-light"
            >
              haashemi.dev
            </a>
          </p>
        </div>

        <LinkList title="راه‌های ارتباطی" links={contactLinks} />
        <LinkList title="دیگر محصولات" links={productLinks} />
      </div>
    </footer>
  );
}

function LinkList({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <nav aria-label={title} className="flex flex-col border-e border-b">
      <p className="border-b px-6 py-4 text-xs font-medium text-muted-foreground md:py-5">{title}</p>
      <ul className="flex flex-col">
        {links.map((link) => (
          <li key={link.href} className="border-b last:border-b-0">
            <FooterLinkRow {...link} />
          </li>
        ))}
      </ul>
    </nav>
  );
}

function FooterLinkRow({ href, label, detail, lead }: FooterLink) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="group relative flex min-h-15 items-center justify-between gap-3 px-6 -outline-offset-2 outline-light transition-colors duration-200 ease-out hover:bg-light/4 focus-visible:bg-light/4 focus-visible:outline-2 md:min-h-16"
    >
      <span className="flex items-center gap-3 text-sm font-medium text-foreground/90 transition-colors duration-200 ease-out group-hover:text-foreground group-focus-visible:text-foreground">
        {lead}
        {label}
      </span>
      <span className="flex items-center gap-2 text-xs text-muted-foreground transition-colors duration-200 ease-out group-hover:text-light group-focus-visible:text-light">
        <span dir="ltr">{detail}</span>
        <ArrowUpLeft
          aria-hidden
          strokeWidth={1.75}
          className="ease-snappy size-3.5 transition-transform duration-200 motion-safe:group-hover:-translate-0.5 motion-safe:group-focus-visible:-translate-0.5"
        />
      </span>
      {/* Grows from the row's start edge; under reduced motion it fades in instead. */}
      <span
        aria-hidden
        className="ease-snappy absolute inset-x-0 -bottom-px h-px origin-right scale-x-0 bg-light transition-[scale,opacity] duration-200 group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:scale-x-100 motion-reduce:opacity-0 motion-reduce:group-hover:opacity-100"
      />
    </a>
  );
}
