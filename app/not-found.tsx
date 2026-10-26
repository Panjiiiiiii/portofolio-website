import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="main"
      className="flex min-h-dvh flex-col justify-between px-6 py-10 md:px-12"
    >
      <Link
        href="/"
        aria-label="NJOEL, back to home"
        className="font-display text-xl font-extrabold tracking-tight"
      >
        NJOEL
      </Link>

      <div>
        <h1 className="font-display text-[clamp(7rem,32vw,26rem)] leading-[0.8] font-extrabold tracking-[-0.05em] text-accent">
          404
        </h1>
        <p className="mt-8 max-w-md text-xl">This page does not exist.</p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-12 items-center justify-center rounded-pill bg-accent px-7 text-[15px] font-medium text-bg transition-colors duration-200 hover:bg-accent-hover"
        >
          Back to home
        </Link>
      </div>

      <p className="font-mono text-[13px] text-muted">NJOEL</p>
    </main>
  );
}
