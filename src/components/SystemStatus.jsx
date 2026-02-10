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
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Activity size={20} className="text-blue-600" />
                System Health
            </h3>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                        <Server size={14} />
                        CPU Usage
                    </div>
                    <div className={`text-xl font-bold ${getStatusColor(stats.cpu, 80)}`}>
                        {stats.cpu}%
                    </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                        <Database size={14} />
                        Memory
                    </div>
                    <div className={`text-xl font-bold ${getStatusColor(stats.memory, 80)}`}>
                        {stats.memory}%
                    </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                        <Activity size={14} />
                        Requests/s
                    </div>
                    <div className="text-xl font-bold text-gray-800">
                        {stats.requests}
                    </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                        <Wifi size={14} />
                        Latency
                    </div>
                    <div className={`text-xl font-bold ${getStatusColor(stats.latency, 100)}`}>
                        {stats.latency}ms
                    </div>
                </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                All systems operational
            </div>
        </div>
    );
}

export default SystemStatus;
