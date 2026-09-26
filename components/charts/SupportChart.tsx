import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { SupportNeed, Member } from '../../types';

interface SupportChartProps {
    members: Member[];
}

const SupportChart: React.FC<SupportChartProps> = ({ members }) => {
    const supportCounts = Object.values(SupportNeed).reduce((acc, need) => {
        acc[need] = 0;
        return acc;
    }, {} as Record<string, number>);

    members.forEach(member => {
        const need = member.support_need;
        if (need && supportCounts[need] !== undefined) supportCounts[need]++;
    });

    const data = Object.entries(supportCounts).map(([name, value]) => ({ name, value }));

    // Palette: Saffron/Kesari spectrum (Dark Saffron to Primary Saffron to Light & Soft Saffron)
    const COLORS = ['#E87500', '#FF8A00', '#FF9E24', '#FFB347', '#FFC875', '#FFDC99', '#FFE8C2', '#FFF1DC'];

    const isMobile = window.innerWidth < 768;

    return (
        <div style={{ width: '100%', height: isMobile ? 280 : 340 }}>
            <ResponsiveContainer>
                <BarChart data={data} margin={{ bottom: isMobile ? 30 : 50 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis 
                        dataKey="name" 
                        stroke="#94A3B8" 
                        angle={-45} 
                        textAnchor="end" 
                        interval={0}
                        fontSize={isMobile ? 9 : 11}
                        tick={{ fill: '#475569', fontWeight: 600 }}
                        axisLine={{ stroke: '#E2E8F0' }}
                        tickLine={false}
                    />
                    <YAxis 
                        stroke="#94A3B8" 
                        fontSize={isMobile ? 9 : 11}
                        tick={{ fill: '#64748B' }}
                        allowDecimals={false}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: '#FFFFFF', 
                            border: '1px solid #E2E8F0', 
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.1)',
                            color: '#111827',
                            fontSize: '12px',
                            fontWeight: 600
                        }}
                        itemStyle={{ color: '#111827' }}
                    />
                    <Bar dataKey="value" barSize={isMobile ? 24 : 48} radius={[6, 6, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SupportChart;