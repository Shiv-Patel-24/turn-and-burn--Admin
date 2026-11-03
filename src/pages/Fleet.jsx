import React from 'react';
import { Link } from 'react-router-dom';

export default function Fleet() {
  const vehicles = [
    { id: 'NYC-4821', name: '2025 Nissan Pathfinder', status: 'Available', fuel: 'Gasoline', rate: '$95/day' },
    { id: 'NYC-3312', name: '2022 Honda CR-V', status: 'Rented', fuel: 'Gasoline', rate: '$105/day' }
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          {['All', 'Available', 'Rented', 'Maintenance'].map(f => (
            <button key={f} className={`px-4 py-1.5 rounded-full text-sm font-medium ${f === 'All' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {f}
            </button>
          ))}
        </div>
        <Link to="/fleet/new" className="btn-primary">
          + Add Vehicle
        </Link>
      </div>
      
      <table className="w-full text-left">
        <thead>
          <tr className="text-xs text-gray-500 uppercase border-b border-gray-100">
            <th className="pb-3 font-medium">Vehicle</th>
            <th className="pb-3 font-medium">Reg. No.</th>
            <th className="pb-3 font-medium">Status</th>
            <th className="pb-3 font-medium">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {vehicles.map(v => (
            <tr key={v.id} className="hover:bg-gray-50 transition-colors">
              <td className="py-4">
                <Link to={`/fleet/${v.id}`} className="font-medium text-gray-900 hover:text-blue-600">{v.name}</Link>
              </td>
              <td className="py-4 text-gray-500">{v.id}</td>
              <td className="py-4">
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${v.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {v.status}
                </span>
              </td>
              <td className="py-4">
                <Link to={`/fleet/${v.id}`} className="text-blue-600 hover:underline text-sm font-medium">Manage</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
