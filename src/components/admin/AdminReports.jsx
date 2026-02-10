import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Filter, Loader2, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getRecentTickets, getViolationStats } from '../../services/ticketingService';

const AdminReports = () => {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);
    const [tickets, setTickets] = useState([]);

    useEffect(() => {
        fetchReportData();
    }, []);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            const [statsData, ticketsData] = await Promise.all([
                getViolationStats(),
                getRecentTickets(50) // Fetch last 50 for the report
            ]);
            setStats(statsData);
            setTickets(ticketsData);
        } catch (error) {
            console.error("Error fetching report data:", error);
        } finally {
            setLoading(false);
        }
    };

    const generatePDF = () => {
        const doc = new jsPDF();

        // Title
        doc.setFontSize(20);
        doc.text("Violation Report", 14, 22);
        doc.setFontSize(11);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

        // Summary Stats
        if (stats) {
            doc.setFontSize(14);
            doc.text("Summary", 14, 45);

            const summaryData = [
                ['Total Tickets', stats.totalTickets],
                ['Total Fines', `PKR ${stats.totalFines.toLocaleString()}`],
                ['Pending', stats.pendingCount],
                ['Resolved/Paid', stats.paidCount]
            ];

            autoTable(doc, {
                startY: 50,
                head: [['Metric', 'Value']],
                body: summaryData,
                theme: 'striped',
                headStyles: { fillColor: [41, 128, 185] }
            });
        }

        // Violations Table
        doc.setFontSize(14);
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

        doc.save('violation_report.pdf');
    };

    const generateCSV = () => {
        if (!tickets.length) return;

        // Headers
        const headers = ['Date', 'Time', 'License Plate', 'Violation Type', 'Fine Amount', 'Status', 'Location', 'Officer'];

        // Rows
        const rows = tickets.map(t => {
            const date = t.issuedAt?.toDate ? t.issuedAt.toDate() : new Date();
            return [
                date.toLocaleDateString(),
                date.toLocaleTimeString(),
                t.licensePlate,
                t.violationLabel || t.violationType,
                t.amount,
                t.status,
                (t.location || '').replace(/,/g, ' '), // Remove commas for CSV safety
                t.officerName || 'Unknown'
            ];
        });

        // Combine
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'violation_data.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const reports = [
        {
            id: 'violations',
            title: 'Violation Audit Report',
            date: 'Live Data',
            type: 'Compliance',
            size: 'Dynamic',
            isLive: true
        },
        { title: 'Daily Revenue Report', date: 'Today, 10:00 AM', type: 'Financial', size: '1.2 MB' },
        { title: 'Weekly Occupancy Summary', date: 'Yesterday, 06:00 PM', type: 'Operational', size: '2.4 MB' },
        { title: 'User Activity Log', date: 'Sep 30, 2023', type: 'Security', size: '8.1 MB' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <FileText className="text-orange-500" />
                    Reports & Logs
                </h2>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#1E293B] text-white border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
                        <Filter size={16} /> Filter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                        <Calendar size={16} /> Schedule Report
                    </button>
                </div>
            </div>

            <div className="bg-[#1E293B] rounded-2xl border border-white/5 shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-[#0B1120] text-gray-200 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Report Name</th>
                                <th className="px-6 py-4">Date Generated</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Size</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {reports.map((report, index) => (
                                <tr key={index} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                                <FileText size={18} />
                                            </div>
                                            <div>
                                                <span className="font-medium text-white block">{report.title}</span>
                                                {report.isLive && <span className="text-xs text-orange-400">Live Database Generation</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{report.date}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs border ${report.type === 'Compliance' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                'bg-white/5 border-white/10'
                                            }`}>
                                            {report.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono">{report.size}</td>
                                    <td className="px-6 py-4 text-right">
                                        {report.isLive ? (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={generateCSV}
                                                    disabled={loading}
                                                    className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Download CSV"
                                                >
                                                    <FileSpreadsheet size={18} />
                                                </button>
                                                <button
                                                    onClick={generatePDF}
                                                    disabled={loading}
                                                    className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Download PDF"
                                                >
                                                    <Download size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button className="text-gray-500 hover:text-gray-300 transition-colors">
                                                <Download size={18} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {loading && (
                <div className="text-center text-gray-500 py-4">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading report data...
                </div>
            )}
        </div>
    );
};

export default AdminReports;
