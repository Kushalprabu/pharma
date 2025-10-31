import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  AlertCircle,
  Clock,
  Package,
  Activity,
  LogOut,
  Menu,
  Bell,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Brain } from 'lucide-react';

interface DashboardStats {
  totalMedicines: number;
  lowStockCount: number;
  expiryWarningsCount: number;
  activeAlerts: number;
}

interface DemandData {
  date: string;
  predicted: number;
  actual: number;
}

export function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState<DashboardStats>({
    totalMedicines: 0,
    lowStockCount: 0,
    expiryWarningsCount: 0,
    activeAlerts: 0,
  });
  const [demandData, setDemandData] = useState<DemandData[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!user?.id) return;

        // Fetch total medicines
        const { count: medicinesCount } = await supabase
          .from('inventory_batches')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', user.id);

        // Fetch low stock items
        const { data: lowStockData } = await supabase
          .from('inventory_batches')
          .select('medicines(minimum_stock_level)')
          .eq('organization_id', user.id);

        const lowStockCount = lowStockData?.filter(
          (item: any) => item.medicines?.minimum_stock_level
        ).length || 0;

        // Fetch expiry warnings
        const { count: expiryCount } = await supabase
          .from('stock_alerts')
          .select('*', { count: 'exact', head: true })
          .eq('alert_type', 'expiry_warning')
          .eq('is_resolved', false);

        // Fetch active alerts
        const { count: activeAlertsCount } = await supabase
          .from('stock_alerts')
          .select('*', { count: 'exact', head: true })
          .eq('is_resolved', false);

        setStats({
          totalMedicines: medicinesCount || 0,
          lowStockCount,
          expiryWarningsCount: expiryCount || 0,
          activeAlerts: activeAlertsCount || 0,
        });

        // Generate sample demand forecast data
        const sampleDemandData = Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          predicted: Math.floor(Math.random() * 200 + 100),
          actual: Math.floor(Math.random() * 200 + 80),
        }));

        setDemandData(sampleDemandData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 overflow-hidden`}
      >
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold">PharmIntel</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-gray-800 rounded">
            <Menu size={20} />
          </button>
        </div>

        <nav className="mt-8 space-y-2 px-4">
          {[
            { name: 'Dashboard', icon: Activity, path: '/dashboard' },
            { name: 'Inventory', icon: Package, path: '/inventory' },
            { name: 'Orders', icon: ShoppingCart, path: '/orders' },
            { name: 'Analytics', icon: Brain, path: '/analytics' },
          ].map(({ name, icon: Icon, path }) => (
            <button
              key={name}
              onClick={() => navigate(path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                location.pathname === path ? 'bg-blue-600' : 'hover:bg-gray-800'
              }`}
            >
              <Icon size={20} />
              {sidebarOpen && <span>{name}</span>}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 bg-gray-800 p-4">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-gray-600">Welcome, {user?.fullName}</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Bell size={24} />
              {stats.activeAlerts > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {stats.activeAlerts}
                </span>
              )}
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Medicines"
              value={stats.totalMedicines}
              icon={Package}
              color="blue"
            />
            <StatCard
              title="Low Stock Items"
              value={stats.lowStockCount}
              icon={AlertCircle}
              color="yellow"
            />
            <StatCard
              title="Expiry Warnings"
              value={stats.expiryWarningsCount}
              icon={Clock}
              color="orange"
            />
            <StatCard
              title="Active Alerts"
              value={stats.activeAlerts}
              icon={Activity}
              color="red"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Demand Forecast Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Demand Forecast (7 Days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={demandData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="predicted" stroke="#3b82f6" name="Predicted" />
                  <Line type="monotone" dataKey="actual" stroke="#10b981" name="Actual" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Category Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Antibiotics', value: 25 },
                      { name: 'Painkillers', value: 20 },
                      { name: 'Vitamins', value: 15 },
                      { name: 'Other', value: 40 },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} ${value}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#3b82f6" />
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[
                  {
                    type: 'expiry',
                    message: 'Amoxicillin batch expires in 30 days',
                    severity: 'warning',
                  },
                  {
                    type: 'stock',
                    message: 'Paracetamol stock below minimum level',
                    severity: 'critical',
                  },
                  {
                    type: 'order',
                    message: 'Purchase order #PO-2024-001 delivered',
                    severity: 'info',
                  },
                ].map((alert, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg flex items-start space-x-3 ${
                      alert.severity === 'critical'
                        ? 'bg-red-50 border border-red-200'
                        : alert.severity === 'warning'
                          ? 'bg-yellow-50 border border-yellow-200'
                          : 'bg-blue-50 border border-blue-200'
                    }`}
                  >
                    <AlertCircle
                      size={20}
                      className={
                        alert.severity === 'critical'
                          ? 'text-red-600'
                          : alert.severity === 'warning'
                            ? 'text-yellow-600'
                            : 'text-blue-600'
                      }
                    />
                    <div>
                      <p
                        className={
                          alert.severity === 'critical'
                            ? 'text-red-900'
                            : alert.severity === 'warning'
                              ? 'text-yellow-900'
                              : 'text-blue-900'
                        }
                      >
                        {alert.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: 'blue' | 'yellow' | 'orange' | 'red';
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
