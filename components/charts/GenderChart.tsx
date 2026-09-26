import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Gender, Member } from '../../types';

interface GenderChartProps {
    members: Member[];
}

const GenderChart: React.FC<GenderChartProps> = ({ members }) => {
    const genderCounts = Object.values(Gender).reduce((acc, g) => {
        acc[g] = 0;
        return acc;
    }, {} as Record<string, number>);
    
    members.forEach(member => {
        const g = member.gender;
        if (g && genderCounts[g] !== undefined) genderCounts[g]++;
    });
    
    const data = Object.entries(genderCounts).map(([name, value]) => ({ name, value }));

    // Design System Colors: Primary Saffron (Male), Dark Saffron (Female), Light Saffron (Other)
    const COLORS = ['#FF8A00', '#E87500', '#FFB347'];

    const isMobile = window.innerWidth < 768;

    return (
        <div style={{ width: '100%', height: isMobile ? 240 : 280 }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={isMobile ? 55 : 75}
                        outerRadius={isMobile ? 85 : 110}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="#FFFFFF"
                        strokeWidth={2}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
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
                    <Legend 
                      verticalAlign="bottom" 
                      align="center" 
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => <span className="text-xs font-semibold text-slate-600 ml-1.5">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default GenderChart;