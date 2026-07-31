import { useMemo } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PageHeader, Panel, StatTile } from '@/components/ui';
import { mockImpactSeries } from '@/data/mockWorkflow';
import { useBatches } from '@/store/BatchContext';
import { useListings } from '@/store/ListingContext';

export default function AnalyticsPage() {
  const { batches } = useBatches();
  const { listings } = useListings();

  const stats = useMemo(() => {
    const wasteT = batches.reduce((s, b) => s + b.weightKg, 0) / 1000;
    const co2 = batches.reduce((s, b) => s + b.analysis.co2SavedKg, 0);
    const water = batches.reduce((s, b) => s + b.analysis.waterSavedL, 0);
    const revenue = listings.filter((l) => l.status === 'Published').reduce((s, l) => s + l.pricePerKgInr * l.quantityKg, 0);
    return {
      waste: `${(42.3 + wasteT).toFixed(1)}t`,
      co2: `${Math.round(102000 + co2).toLocaleString('en-IN')}kg`,
      water: `${((3.6e6 + water) / 1e6).toFixed(2)}M L`,
      revenue: `₹${Math.round(3160000 + revenue).toLocaleString('en-IN')}`,
    };
  }, [batches, listings]);

  const liveSeries = useMemo(() => {
    if (batches.length === 0) return mockImpactSeries;
    const sessionT = batches.reduce((s, b) => s + b.weightKg, 0) / 1000;
    const sessionRevenue = listings.filter((l) => l.status === 'Published').reduce((s, l) => s + l.pricePerKgInr * l.quantityKg, 0);
    return [...mockImpactSeries, { period: 'Live', wasteRecoveredT: Math.round((mockImpactSeries.at(-1)?.wasteRecoveredT ?? 0) + sessionT), revenueInr: Math.round((mockImpactSeries.at(-1)?.revenueInr ?? 0) + sessionRevenue) }];
  }, [batches, listings]);

  return (
    <div>
      <PageHeader eyebrow="Analytics" title="Business & Sustainability Performance" />

      <div className="mb-4 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <StatTile value={stats.waste} label="Waste Recovered" />
        <StatTile value={stats.co2} label="CO₂ Saved" />
        <StatTile value={stats.water} label="Water Saved" />
        <StatTile value={stats.revenue} label="Revenue" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <h3 className="mb-4 text-[15px]">Waste Recovered (tonnes)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={liveSeries}>
              <defs>
                <linearGradient id="rec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e5a437" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#e5a437" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(238,232,209,0.08)" vertical={false} />
              <XAxis dataKey="period" stroke="#9c948a" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9c948a" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#171a17', border: '1px solid rgba(238,232,209,0.12)', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="wasteRecoveredT" stroke="#e5a437" fill="url(#rec)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel>
          <h3 className="mb-4 text-[15px]">Revenue by Quarter</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={liveSeries}>
              <CartesianGrid stroke="rgba(238,232,209,0.08)" vertical={false} />
              <XAxis dataKey="period" stroke="#9c948a" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9c948a" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#171a17', border: '1px solid rgba(238,232,209,0.12)', borderRadius: 8, fontSize: 12 }} formatter={((v: number) => `₹${v.toLocaleString('en-IN')}`) as never} />
              <Bar dataKey="revenueInr" fill="#75866a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  );
}