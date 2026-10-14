import { DoorPicker } from "@/components/door-picker";

export default function HomePage() {
  return (
    <DoorPicker>
      <header className="relative isolate flex min-h-[85svh] flex-col items-center justify-center gap-12 text-center">
        <div className="absolute top-1/2 left-1/2 -z-10 size-[min(34rem,90vw)] -translate-1/2 rounded-full bg-light/10 blur-3xl" />

        <h1 className="text-7xl font-black md:text-9xl">دَرِت</h1>

        <p className="max-w-sm text-balance text-muted-foreground md:text-lg">
          در های ویژه، نایاب و دست‌ساز مخصوص کسانی که به دنبال گذاشتن درشونن
        </p>

        <div className="flex flex-col items-center gap-4 text-sm">
          درِت رو انتخاب کن
          <span aria-hidden className="relative h-16 w-px overflow-hidden bg-border">
            <span className="absolute inset-x-0 top-0 h-6 animate-scroll-cue bg-light" />
          </span>
        </div>
      </header>
    </DoorPicker>
  );
}
