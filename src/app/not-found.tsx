import Link from 'next/link';
import { Landmark, ArrowLeft, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex-grow flex items-center justify-center bg-slate-950 text-slate-100 px-4 py-16">
      <div className="bg-slate-900/40 p-8 rounded-2xl border border-slate-800 backdrop-blur-sm max-w-md text-center space-y-5 shadow-xl">
        <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-455">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">404 - Not Found</h2>
          <p className="text-slate-400 text-sm">
            The page you are looking for does not exist or has been relocated to another secure directory.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-2.5 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Event Home</span>
        </Link>
      </div>
    </div>
  );
}
