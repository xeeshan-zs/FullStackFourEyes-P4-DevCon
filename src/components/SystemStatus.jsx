import { useState, useEffect } from 'react';
import { Activity, Server, Database, Wifi } from 'lucide-react';

function SystemStatus() {
    const [stats, setStats] = useState({
        cpu: 0,
        memory: 0,
        requests: 0,
        latency: 0
    });

    useEffect(() => {
        // Simulate real-time updates
        const interval = setInterval(() => {
            setStats({
                cpu: Math.floor(Math.random() * 30) + 10,
                memory: Math.floor(Math.random() * 40) + 20,
                requests: Math.floor(Math.random() * 100) + 50,
                latency: Math.floor(Math.random() * 50) + 10
            });
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (val, threshold) => val > threshold ? 'text-red-500' : 'text-green-500';

    return (
        <div className="bg-[#1E293B] rounded-2xl shadow-lg border border-white/5 p-6 h-full">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Activity size={20} className="text-blue-400" />
                </div>
                System Health
            </h3>

            <div className="grid grid-cols-2 gap-4">
                {[
                    { label: 'CPU Usage', value: `${stats.cpu}%`, icon: Server, color: stats.cpu > 80 ? 'text-red-400' : 'text-green-400' },
                    { label: 'Memory', value: `${stats.memory}%`, icon: Database, color: stats.memory > 80 ? 'text-red-400' : 'text-green-400' },
                    { label: 'Requests/s', value: stats.requests, icon: Activity, color: 'text-blue-400' },
                    { label: 'Latency', value: `${stats.latency}ms`, icon: Wifi, color: stats.latency > 100 ? 'text-red-400' : 'text-green-400' }
                ].map((item, i) => (
                    <div key={i} className="p-4 bg-[#0B1120] rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-2 text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">
                            <item.icon size={14} />
                            {item.label}
                        </div>
                        <div className={`text-2xl font-bold ${item.color}`}>
                            {item.value}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 flex items-center gap-3 text-xs font-medium text-green-400 bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </div>
                All systems operational
            </div>
        </div>
    );
}

export default SystemStatus;
