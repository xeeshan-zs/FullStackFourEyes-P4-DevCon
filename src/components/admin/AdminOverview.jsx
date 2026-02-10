import {
    TrendingUp,
    DollarSign,
    AlertCircle,
    LayoutGrid,
    PieChart as PieIcon,
    FileText
} from 'lucide-react';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useState } from 'react';
import { getRecentTickets } from '../../services/ticketingService';

const AdminOverview = ({ analytics, occupancyData, revenueData, violationData, COLORS }) => {
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async (format) => {
        setDownloading(true);
        try {
            // Fetch latest data for report
            const tickets = await getRecentTickets(50);

            if (format === 'pdf') {
                const doc = new jsPDF();

                // Header
                doc.setFontSize(20);
                doc.text("ParkIt - Executive Summary", 14, 22);
                doc.setFontSize(11);
                doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

                // Dashboard Metrics
                doc.setFontSize(14);
                doc.text("Key Performance Indicators", 14, 45);

                const kpiData = [
                    ['Occupancy Rate', `${analytics?.occupancyRate || 0}%`],
                    ['Total Revenue', `PKR ${analytics?.totalRevenue || 0}`],
                    ['Total Violations', analytics?.totalTickets || 0],
                    ['Active Facilities', analytics?.facilities || 0]
                ];

                autoTable(doc, {
                    startY: 50,
                    head: [['Metric', 'Value']],
                    body: kpiData,
                    theme: 'striped',
                    headStyles: { fillColor: [41, 128, 185] }
                });

                // Detailed Violations Table
                doc.text("Recent Violations", 14, doc.lastAutoTable.finalY + 15);

                const tableData = tickets.map(t => [
                    new Date(t.issuedAt?.toDate ? t.issuedAt.toDate() : new Date()).toLocaleDateString(),
                    t.licensePlate,
                    t.violationLabel || t.violationType,
                    `PKR ${t.amount}`,
                    t.status.toUpperCase(),
                    t.location
                ]);

                autoTable(doc, {
                    startY: doc.lastAutoTable.finalY + 20,
                    head: [['Date', 'Plate', 'Violation', 'Fine', 'Status', 'Location']],
                    body: tableData,
                    theme: 'grid',
                    headStyles: { fillColor: [231, 76, 60] },
                    styles: { fontSize: 8 }
                });

                doc.save('parkit_executive_report.pdf');
            } else if (format === 'csv') {
                if (!tickets.length) {
                    alert('No data available for export');
                    return;
                }

                const headers = ['Date', 'Time', 'License Plate', 'Violation Type', 'Fine Amount', 'Status', 'Location', 'Officer'];
                const rows = tickets.map(t => {
                    const date = t.issuedAt?.toDate ? t.issuedAt.toDate() : new Date();
                    return [
                        date.toLocaleDateString(),
                        date.toLocaleTimeString(),
                        t.licensePlate,
                        t.violationLabel || t.violationType,
                        t.amount,
                        t.status,
                        (t.location || '').replace(/,/g, ' '),
                        t.officerName || 'Unknown'
                    ];
                });

                const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', 'parkit_violation_data.csv');
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to generate report. Please try again.');
        } finally {
            setDownloading(false);
        }
    };
    return (
        <div className="max-w-7xl mx-auto space-y-4">

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#1E293B] rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all duration-300 shadow-lg group">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl bg-blue-500 bg-opacity-20 group-hover:scale-110 transition-transform`}>
                            <TrendingUp size={24} className="text-blue-500" />
                        </div>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Occupancy Rate</p>
                        <h3 className="text-3xl font-bold text-white mb-2">{analytics?.occupancyRate || 0}%</h3>
                        <p className="text-sm text-gray-400 flex items-center gap-1.5">
                            {analytics?.occupiedSpots} / {analytics?.totalSpots} spots occupied
                        </p>
                    </div>
                </div>

                <div className="bg-[#1E293B] rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all duration-300 shadow-lg group">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl bg-emerald-500 bg-opacity-20 group-hover:scale-110 transition-transform`}>
                            <DollarSign size={24} className="text-emerald-500" />
                        </div>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Total Revenue</p>
                        <h3 className="text-3xl font-bold text-white mb-2">PKR {analytics?.totalRevenue || 0}</h3>
                        <p className="text-sm text-gray-400 flex items-center gap-1.5">
                            {analytics?.facilities} active facilities
                        </p>
                    </div>
                </div>

                <div className="bg-[#1E293B] rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all duration-300 shadow-lg group">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl bg-rose-500 bg-opacity-20 group-hover:scale-110 transition-transform`}>
                            <AlertCircle size={24} className="text-rose-500" />
                        </div>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Violations</p>
                        <h3 className="text-3xl font-bold text-white mb-2">{analytics?.totalTickets || 0}</h3>
                        <p className="text-sm text-gray-400 flex items-center gap-1.5">
                            {analytics?.pendingTickets} pending review
                        </p>
                    </div>
                </div>

                <div className="bg-[#1E293B] rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all duration-300 shadow-lg group">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl bg-purple-500 bg-opacity-20 group-hover:scale-110 transition-transform`}>
                            <LayoutGrid size={24} className="text-purple-500" />
                        </div>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">AI Predictions</p>
                        <h3 className="text-3xl font-bold text-white mb-2">Active</h3>
                        <p className="text-sm text-gray-400 flex items-center gap-1.5">
                            Demand forecasting enabled
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Charts */}
                <div className="lg:col-span-2 space-y-8">

                    {/* AI Prediction Chart */}
                    <div className="bg-[#1E293B] rounded-2xl p-6 border border-white/5 shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <TrendingUp className="text-purple-400" size={20} />
                                    AI Demand Prediction
                                </h3>
                                <p className="text-sm text-gray-400">Projected occupancy for next 24 hours</p>
                            </div>
                            <span className="bg-purple-500/10 text-purple-400 text-xs px-2 py-1 rounded-lg border border-purple-500/20">
                                Based on Linear Regression
                            </span>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analytics?.predictions || []}>
                                    <defs>
                                        <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                                        itemStyle={{ color: '#8b5cf6' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="predictedOccupancy"
                                        name="Predicted Occupancy"
                                        stroke="#8b5cf6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorPred)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Revenue Bar Chart */}
                    <div className="bg-[#1E293B] rounded-2xl p-6 border border-white/5 shadow-lg">
                        <h3 className="text-lg font-bold text-white mb-2">Revenue by Facility</h3>
                        <p className="text-sm text-gray-400 mb-6">Top performing parking zones</p>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#334155', opacity: 0.2 }}
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                                    />
                                    <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>

                {/* Right Column: Pie Chart */}
                <div className="space-y-4">
                    {/* SystemStatus removed per user request */}

                    {/* Violation Donut Chart */}
                    <div className="bg-[#1E293B] rounded-2xl p-6 border border-white/5 shadow-lg">
                        <h3 className="text-lg font-bold text-white mb-2">Violations</h3>
                        <p className="text-sm text-gray-400 mb-4">Breakdown by type</p>
                        <div className="h-[250px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={violationData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="count"
                                    >
                                        {violationData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">{analytics?.totalTickets || 0}</p>
                                    <p className="text-xs text-gray-400">Total</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                            {violationData.map((entry, index) => (
                                <div key={index} className="flex items-center gap-2 text-gray-400">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span>{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Export Actions */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
                        <FileText className="mb-4 text-white/80" size={32} />
                        <h3 className="text-xl font-bold mb-2">Generate Reports</h3>
                        <p className="text-blue-100 text-sm mb-6">
                            Download comprehensive analytics for stakeholders.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleDownload('pdf')}
                                disabled={downloading}
                                className="flex-1 bg-white text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {downloading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    'Download PDF'
                                )}
                            </button>
                            <button
                                onClick={() => handleDownload('csv')}
                                disabled={downloading}
                                className="flex-1 bg-blue-800/50 text-white py-3 rounded-xl font-bold hover:bg-blue-800/70 transition-colors border border-white/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {downloading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    'CSV'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AdminOverview;
