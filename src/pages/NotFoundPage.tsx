import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="grid min-h-svh place-items-center bg-background px-4 text-center text-bone">
      <div>
        <div className="font-display text-5xl text-amber">404</div>
        <p className="mt-3 text-sm text-stone">This route doesn't exist in Value Cascade.</p>
        <Link to="/" className="mt-6 inline-block rounded-lg bg-amber px-5 py-2.5 text-[13px] font-semibold text-[#161311]">Back to Home</Link>
      </div>
    </div>
  );
}
