import { PieChart as PieIcon, TrendingUp, Download } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const AdminOccupancy = ({ occupancyData }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <PieIcon className="text-blue-500" />
                Occupancy Analysis
            </h2>

            {/* Occupancy Trend Chart */}
            <div className="bg-[#1E293B] rounded-2xl p-6 border border-white/5 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white">Daily Occupancy Trend</h3>
                    <select className="bg-[#0B1120] border border-white/10 rounded-lg text-sm text-white px-3 py-1">
                        <option>Last 24 Hours</option>
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                    </select>
                </div>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={occupancyData}>
                            <defs>
                                <linearGradient id="colorOcc" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="occupancy"
                                name="Occupied Spots"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorOcc)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Peak Hours Table */}
            <div className="bg-[#1E293B] rounded-2xl border border-white/5 shadow-lg overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">Peak Hours Data</h3>
                    <button className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                        <Download size={16} /> Export CSV
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-[#0B1120] text-gray-200 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Time Block</th>
                                <th className="px-6 py-4 text-center">Avg. Occupancy</th>
                                <th className="px-6 py-4 text-center">Effective Revenue</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {occupancyData.length > 0 ? occupancyData.slice(0, 8).map((item, index) => (
                                <tr key={index} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium text-white">{item.hour}</td>
                                    <td className="px-6 py-4 text-center text-blue-400 font-bold">{item.occupancy || 0} spots</td>
                                    <td className="px-6 py-4 text-center">PKR {(item.revenue || 0).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 rounded text-xs ${(item.occupancy || 0) > 20
                                                ? 'bg-red-500/10 text-red-400'
                                                : 'bg-green-500/10 text-green-400'
                                            }`}>
                                            {(item.occupancy || 0) > 20 ? 'High Demand' : 'Normal'}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No occupancy data available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminOccupancy;
