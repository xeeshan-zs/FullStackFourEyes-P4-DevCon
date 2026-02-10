import { Users, MoreVertical, Edit, Trash2, Shield, UserCheck } from 'lucide-react';

const AdminUsers = () => {
    // Mock user data
    const users = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Driver', status: 'Active', lastActive: '2 mins ago' },
        { id: 2, name: 'Alice Smith', email: 'alice@admin.com', role: 'Admin', status: 'Active', lastActive: 'Now' },
        { id: 3, name: 'Bob Wilson', email: 'bob@operator.com', role: 'Operator', status: 'Active', lastActive: '1 hr ago' },
        { id: 4, name: 'Officer Jenny', email: 'jenny@police.com', role: 'Officer', status: 'On Duty', lastActive: '5 mins ago' },
        { id: 5, name: 'Mike Brown', email: 'mike@driver.com', role: 'Driver', status: 'Suspended', lastActive: '2 days ago' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Users className="text-purple-500" />
                    User Management
                </h2>
                <button className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                    + Add New User
                </button>
            </div>

            <div className="bg-[#1E293B] rounded-2xl border border-white/5 shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-[#0B1120] text-gray-200 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Last Active</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-0.5">
                                                <div className="w-full h-full rounded-full bg-[#1E293B] flex items-center justify-center text-xs font-bold text-white">
                                                    {user.name.charAt(0)}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">{user.name}</div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5">
                                            {user.role === 'Admin' && <Shield size={14} className="text-purple-400" />}
                                            {user.role === 'Operator' && <UserCheck size={14} className="text-blue-400" />}
                                            <span className={
                                                user.role === 'Admin' ? 'text-purple-400' :
                                                    user.role === 'Operator' ? 'text-blue-400' :
                                                        user.role === 'Officer' ? 'text-orange-400' :
                                                            'text-gray-300'
                                            }>
                                                {user.role}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs border ${user.status === 'Active' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                user.status === 'On Duty' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                    'bg-red-500/10 text-red-400 border-red-500/20'
                                            }`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{user.lastActive}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                                <Edit size={16} />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
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

export default AdminUsers;
