import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { getMedicines, getInventoryBatches, addInventoryBatch } from '../services/inventory';
import { Plus, Search, Filter, Trash2, Edit2, AlertCircle } from 'lucide-react';

interface Medicine {
  id: string;
  name: string;
  strength: string;
  manufacturer: string;
  unit_price: number;
  minimum_stock_level: number;
}

interface Batch {
  id: string;
  batch_number: string;
  quantity: number;
  expiry_date: string;
  medicines: { name: string };
}

export function Inventory() {
  const { user } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    medicineId: '',
    batchNumber: '',
    quantity: '',
    unitPrice: '',
    expiryDate: '',
    manufacturingDate: '',
    location: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      try {
        const medicinesData = await getMedicines();
        setMedicines(medicinesData);

        const batchesData = await getInventoryBatches(user.id);
        setBatches(batchesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      const batch = await addInventoryBatch(
        formData.medicineId,
        formData.batchNumber,
        parseInt(formData.quantity),
        parseFloat(formData.unitPrice),
        formData.expiryDate,
        formData.manufacturingDate,
        formData.location,
        user.id
      );

      setBatches([...batches, batch]);
      setShowAddForm(false);
      setFormData({
        medicineId: '',
        batchNumber: '',
        quantity: '',
        unitPrice: '',
        expiryDate: '',
        manufacturingDate: '',
        location: '',
      });
    } catch (error) {
      console.error('Error adding batch:', error);
    }
  };

  const filteredBatches = batches.filter((batch) =>
    batch.medicines.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isExpiringsoon = (expiryDate: string) => {
    const daysUntilExpiry = Math.ceil(
      (new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-gray-600">Manage medicine stock and batches</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2 transition"
          >
            <Plus size={20} />
            <span>Add New Batch</span>
          </button>
        </div>

        {/* Add Batch Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Batch</h2>
            <form onSubmit={handleAddBatch} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medicine</label>
                <select
                  value={formData.medicineId}
                  onChange={(e) => setFormData({ ...formData, medicineId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Medicine</option>
                  {medicines.map((med) => (
                    <option key={med.id} value={med.id}>
                      {med.name} ({med.strength})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                <input
                  type="text"
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., BATCH-2024-001"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturing Date</label>
                <input
                  type="date"
                  value={formData.manufacturingDate}
                  onChange={(e) => setFormData({ ...formData, manufacturingDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Shelf A1"
                  required
                />
              </div>

              <div className="md:col-span-2 flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  Add Batch
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-4 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by medicine name..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 font-semibold py-2 px-4 rounded-lg flex items-center space-x-2 transition">
            <Filter size={20} />
            <span>Filter</span>
          </button>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Medicine</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Batch Number</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Quantity</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Expiry Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Location</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBatches.map((batch) => (
                <tr key={batch.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{batch.medicines.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{batch.batch_number}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{batch.quantity}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(batch.expiry_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{batch.location || '-'}</td>
                  <td className="px-6 py-4">
                    {isExpired(batch.expiry_date) ? (
                      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                        <AlertCircle size={14} />
                        <span>Expired</span>
                      </span>
                    ) : isExpiringsoon(batch.expiry_date) ? (
                      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
                        <AlertCircle size={14} />
                        <span>Expiring Soon</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                        <span>Active</span>
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2 flex">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                      <Edit2 size={18} />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredBatches.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No batches found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
