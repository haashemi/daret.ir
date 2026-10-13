import { DoorPicker } from "@/components/door-picker";

export default function HomePage() {
  return (
    <DoorPicker>
      <header className="relative isolate flex min-h-[85svh] flex-col items-center justify-center gap-8 text-center">
        <div
          aria-hidden
          className="absolute top-1/2 left-1/2 -z-10 size-[min(34rem,90vw)] -translate-1/2 rounded-full bg-light/10 blur-3xl"
        />
        <span className="border px-3 py-1 text-xs tracking-[0.3em] text-muted-foreground">کلکسیون ۱۴۰۵</span>
        <h1 className="text-7xl font-black md:text-9xl">دَرِت</h1>
        <p className="max-w-sm text-balance text-muted-foreground md:text-lg">
          درهای دست‌ساز، برای کسانی که فرق یک درِ خوب را می‌شناسند.
        </p>
        <div className="mt-6 flex flex-col items-center gap-4 text-sm">
          درِت رو انتخاب کن
          <span aria-hidden className="relative h-16 w-px overflow-hidden bg-border">
            <span className="absolute inset-x-0 top-0 h-6 animate-scroll-cue bg-light" />
          </span>
        </div>
      </header>
    </DoorPicker>
  );
}
