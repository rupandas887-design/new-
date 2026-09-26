import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Occupation, Member } from '../../types';

interface OccupationChartProps {
    members: Member[];
}

const OccupationChart: React.FC<OccupationChartProps> = ({ members }) => {
    const occupationCounts = Object.values(Occupation).reduce((acc, occ) => {
        acc[occ] = 0;
        return acc;
    }, {} as Record<string, number>);

    members.forEach(member => {
        const occ = member.occupation;
        if (occ && occupationCounts[occ] !== undefined) occupationCounts[occ]++;
    });

    const data = Object.entries(occupationCounts).map(([name, value]) => ({ name, value }));
    
    // Sophisticated palette rooted in Saffron, Warm Amber, Slate, and accents
    const COLORS = [
      '#FF8A00', '#E87500', '#FFB347', '#FF9E24', '#06B6D4', 
      '#10B981', '#0284C7', '#D97706', '#F59E0B', '#64748B',
      '#C65E00', '#FF7A00'
    ];

    const isMobile = window.innerWidth < 768;

    return (
        <div style={{ width: '100%', height: isMobile ? 320 : 420 }}>
            <ResponsiveContainer>
                <BarChart data={data} layout="vertical" margin={{ left: isMobile ? 0 : 10, right: 30 }}>
                    <XAxis type="number" hide />
                    <YAxis 
                        dataKey="name" 
                        type="category" 
                        stroke="#94A3B8" 
                        fontSize={isMobile ? 10 : 11} 
                        width={isMobile ? 100 : 130}
                        tick={{ fill: '#475569', fontWeight: 600 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip 
                        cursor={{ fill: 'rgba(255, 138, 0, 0.05)' }} 
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
                    <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={isMobile ? 10 : 16}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default OccupationChart;