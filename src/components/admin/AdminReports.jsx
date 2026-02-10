import { FileText, Download, Calendar, Filter } from 'lucide-react';

const AdminReports = () => {
    const reports = [
        { title: 'Daily Revenue Report', date: 'Today, 10:00 AM', type: 'Financial', size: '1.2 MB' },
        { title: 'Weekly Occupancy Summary', date: 'Yesterday, 06:00 PM', type: 'Operational', size: '2.4 MB' },
        { title: 'Monthly Violation Audit', date: 'Oct 01, 2023', type: 'Compliance', size: '5.8 MB' },
        { title: 'User Activity Log', date: 'Sep 30, 2023', type: 'Security', size: '8.1 MB' },
        { title: 'System Performance Review', date: 'Sep 28, 2023', type: 'Technical', size: '3.5 MB' },
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
                                <th className="px-6 py-4 text-right">Action</th>
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
                                            <span className="font-medium text-white">{report.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{report.date}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-white/5 rounded text-xs border border-white/10">
                                            {report.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono">{report.size}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-blue-400 hover:text-blue-300 transition-colors">
                                            <Download size={18} />
                                        </button>
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

export default AdminReports;
