import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 sm:gap-8 px-4">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center">hellodaddy</h1>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-xs sm:max-w-none">
        <Link href="/kid" className="w-full sm:w-auto">
          <Button size="lg" className="w-full">kid</Button>
        </Link>
        <Link href="/dad" className="w-full sm:w-auto">
          <Button size="lg" className="w-full">dad</Button>
        </Link>
      </div>
    </div>
  );
}
