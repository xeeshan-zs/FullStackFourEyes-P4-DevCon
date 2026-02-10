import { DollarSign, TrendingUp, Download } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const AdminRevenue = ({ revenueData }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <DollarSign className="text-emerald-500" />
                Revenue Analytics
            </h2>

            {/* Revenue Chart */}
            <div className="bg-[#1E293B] rounded-2xl p-6 border border-white/5 shadow-lg">
                <h3 className="text-lg font-bold text-white mb-4">Revenue by Facility</h3>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                cursor={{ fill: '#334155', opacity: 0.2 }}
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                            />
                            <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} barSize={50} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-[#1E293B] rounded-2xl border border-white/5 shadow-lg overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">Revenue Details</h3>
                    <button className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                        <Download size={16} /> Export CSV
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-[#0B1120] text-gray-200 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Facility Name</th>
                                <th className="px-6 py-4 text-right">Total Revenue</th>
                                <th className="px-6 py-4 text-right">Transactions</th>
                                <th className="px-6 py-4 text-right">Avg. Ticket</th>
                                <th className="px-6 py-4 text-center">Trend</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {revenueData.map((item, index) => (
                                <tr key={index} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium text-white">{item.name}</td>
                                    <td className="px-6 py-4 text-right text-emerald-400 font-bold">PKR {item.revenue.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right">{Math.floor(item.revenue / 150)}</td>
                                    <td className="px-6 py-4 text-right">PKR 150</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center gap-1 text-green-400 bg-green-500/10 px-2 py-1 rounded text-xs">
                                            <TrendingUp size={12} /> +{Math.floor(Math.random() * 20)}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminRevenue;
