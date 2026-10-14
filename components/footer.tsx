import { cn } from "cn";
import { FaGithub, FaTelegram } from "react-icons/fa6";

import { buttonVariants } from "./ui/button";

export function Footer() {
  return (
    <footer className="relative mx-auto flex h-16 w-full max-w-2xl items-center justify-between px-4 text-sm text-muted-foreground">
      <div className="absolute inset-x-0 top-0 h-px w-full bg-linear-to-r from-transparent via-border to-transparent" />

      <p aria-label="ساخته شده به شوخی توسط علی هاشمی">
        ساخته شده به شوخی توسط{" "}
        <a
          href="https://haashemi.dev"
          className={cn(buttonVariants({ variant: "link" }), "p-0! text-muted-foreground")}
        >
          haashemi.dev
        </a>
      </p>

      <div className="flex gap-2">
        <a
          className="transition-colors hover:text-foreground"
          rel="noreferrer noopener"
          href="https://github.com/haashemi/daret.ir"
          target="_blank"
          aria-label="گیتهاب درت"
        >
          <FaGithub />
        </a>

        <a
          className="transition-colors hover:text-foreground"
          rel="noreferrer noopener"
          href="https://t.me/HaashemiDev"
          target="_blank"
          aria-label="کانال تلگرام هاشمی"
        >
          <FaTelegram />
        </a>
      </div>
    </footer>
  );
}
