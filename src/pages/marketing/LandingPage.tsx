import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { ArrowRight, Recycle, ScanLine, Network, Gauge } from 'lucide-react';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

export default function LandingPage() {
  return (
    <div className="bg-background text-bone">
      <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-sm lg:px-10">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-full border border-amber/60 text-amber font-display text-sm">V</span>
          <span className="text-xs font-semibold tracking-[0.18em]">VALUE CASCADE</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="rounded-full border border-line-strong px-4 py-2 text-xs">Login</Link>
          <Link to="/login" className="rounded-full bg-amber px-4 py-2 text-xs font-semibold text-[#161311]">Enter Platform</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-svh flex-col items-start justify-center overflow-hidden px-6 lg:px-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(229,164,55,0.10),transparent_55%)]" />
        <motion.div initial="hidden" animate="show" variants={fadeUp} className="relative max-w-2xl">
          <div className="mb-4 text-[11px] uppercase tracking-[0.3em] text-amber">Circular Resource Intelligence</div>
          <h1 className="text-[clamp(2.6rem,6vw,5rem)] leading-[0.98]">Every Thread<br />Has Value</h1>
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-stone">
            Value Cascade is the AI-powered operating system for the circular textile economy — connecting
            manufacturers, cooperatives, recyclers, buyers, brands and logistics partners around every gram of
            recoverable material.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/login" className="inline-flex items-center gap-2 rounded-lg bg-amber px-6 py-3.5 text-sm font-semibold text-[#161311] hover:bg-amber-soft">
              Enter Platform <ArrowRight size={15} />
            </Link>
            <a href="#story" className="inline-flex items-center gap-2 rounded-lg border border-line-strong px-6 py-3.5 text-sm hover:border-amber/60 hover:text-amber">
              Explore Story
            </a>
            <Link to="/register" className="inline-flex items-center gap-2 rounded-lg border border-line-strong px-6 py-3.5 text-sm hover:border-amber/60 hover:text-amber">
              Register Organization
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Problem */}
      <StorySection id="story" eyebrow="The Problem" heading="Millions of tonnes of textile value are lost to landfill every year.">
        <Card k="Waste Generated" text="Cutting-room scraps, rejected lots and end-of-line fabric pile up faster than mills can process them." />
        <Card k="Lost Value" text="Recoverable fiber is discarded simply because no one can classify or price it fast enough." />
        <Card k="Landfill Impact" text="Every tonne landfilled is a tonne of water, carbon and labor that can never be recovered." />
      </StorySection>

      {/* AI Analysis */}
      <StorySection eyebrow="AI Analysis" heading="Scan a batch. Know its fiber, its grade, its buyer — in seconds." icon={<ScanLine size={20} className="text-amber" />}>
        <Card k="Fiber ID" text="Composition, contamination and moisture detected directly from a photo." />
        <Card k="Recoverability" text="A confidence-scored recommendation: respin, reuse, recycle, sell, store or discard." />
        <Card k="Estimated Value" text="Live pricing benchmarked against current marketplace demand." />
      </StorySection>

      {/* Ecosystem */}
      <StorySection eyebrow="Ecosystem" heading="One cascade, every stakeholder in the circular loop." icon={<Network size={20} className="text-amber" />}>
        <Card k="Manufacturers & Cooperatives" text="Turn waste into classified, sellable inventory." />
        <Card k="Recyclers & Buyers" text="Source verified, traceable material at the right grade." />
        <Card k="Brands, Logistics & Government" text="Track provenance, move material, and measure impact." />
      </StorySection>

      {/* Product preview */}
      <StorySection eyebrow="Product Preview" heading="One workspace for the entire recovery workflow." icon={<Gauge size={20} className="text-amber" />}>
        <div className="col-span-full">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-line-strong bg-carbon shadow-2xl"
          >
            <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-danger/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-sage/60" />
              <span className="ml-3 text-[11px] text-stone">app.valuecascade.demo/dashboard</span>
            </div>
            <div className="grid grid-cols-3 gap-3 p-6">
              {['Batches Scanned', 'Recoverable', 'Est. Value'].map((l, i) => (
                <div key={l} className="rounded-lg border border-line bg-white/[0.03] p-4">
                  <div className="text-xl text-amber font-display">{['6', '2.4t', '₹4,120'][i]}</div>
                  <div className="mt-1 text-[10px] uppercase text-stone">{l}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </StorySection>

      {/* Impact */}
      <section className="border-t border-line px-6 py-24 lg:px-10">
        <div className="mb-8 text-[11px] uppercase tracking-[0.2em] text-amber">Impact</div>
        <h2 className="mb-10 max-w-xl text-[clamp(1.8rem,3.4vw,2.6rem)]">Measured recovery, not marketing claims.</h2>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {[['42K t', 'Waste Recovered'], ['118K t', 'CO₂ Saved'], ['3.6M m³', 'Water Saved'], ['$28M', 'Revenue Generated']].map(([v, l]) => (
            <div key={l}>
              <div className="text-3xl text-amber font-display">{v}</div>
              <div className="mt-1 text-[11px] uppercase tracking-wide text-stone">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-line px-6 py-28 text-center">
        <h2 className="text-[clamp(2rem,4vw,3rem)]">Ready to put your waste to work?</h2>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/login" className="rounded-lg bg-amber px-6 py-3.5 text-sm font-semibold text-[#161311]">Enter Platform</Link>
          <Link to="/register" className="rounded-lg border border-line-strong px-6 py-3.5 text-sm">Request Demo</Link>
        </div>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-6 py-6 text-[11px] text-stone lg:px-10">
        <span>© 2026 Value Cascade</span>
        <span className="flex items-center gap-1.5"><Recycle size={13} /> Circular Resource Intelligence Platform</span>
      </footer>
    </div>
  );
}

function StorySection({ id, eyebrow, heading, icon, children }: { id?: string; eyebrow: string; heading: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} className="border-t border-line px-6 py-24 lg:px-10">
      <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
        <div className="mb-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-amber">{icon}{eyebrow}</div>
        <h2 className="mb-9 max-w-xl text-[clamp(1.8rem,3.4vw,2.6rem)]">{heading}</h2>
        <div className="grid gap-4 md:grid-cols-3">{children}</div>
      </motion.div>
    </section>
  );
}

function Card({ k, text }: { k: string; text: string }) {
  return (
    <div className="rounded-[14px] border border-line bg-white/[0.03] p-5">
      <span className="mb-2.5 block text-[11px] uppercase tracking-wide text-amber">{k}</span>
      <p className="text-sm leading-relaxed text-stone">{text}</p>
    </div>
  );
}
