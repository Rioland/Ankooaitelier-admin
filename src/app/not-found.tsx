import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-50 px-4 text-center">
      <p className="font-display text-[8rem] font-medium leading-none text-brand-600">404</p>
      <p className="mt-2 font-display text-2xl">This page wandered off.</p>
      <Link href="/" className="btn-primary mt-8">Back to dashboard</Link>
    </div>
  );
}
