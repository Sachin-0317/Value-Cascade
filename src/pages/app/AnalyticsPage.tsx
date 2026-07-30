import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PageHeader, Panel, StatTile } from '@/components/ui';
import { mockImpactSeries } from '@/data/mockWorkflow';

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeader eyebrow="Analytics" title="Business & Sustainability Performance" />

      <div className="mb-4 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <StatTile value="42.3t" label="Waste Recovered" />
        <StatTile value="102t" label="CO₂ Saved" />
        <StatTile value="3.6M L" label="Water Saved" />
        <StatTile value="₹31.6L" label="Revenue" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <h3 className="mb-4 text-[15px]">Waste Recovered (tonnes)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={mockImpactSeries}>
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
            <BarChart data={mockImpactSeries}>
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
