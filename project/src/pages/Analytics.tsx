import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { generateAIInsights, getActiveInsights, ForecastData, generateDemandForecast } from '../services/aiForecasting';
import { getMedicines } from '../services/inventory';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Brain, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

interface AIInsight {
  id: string;
  title: string;
  description: string;
  recommendation: string;
  priority: string;
  insight_type: string;
}

interface Medicine {
  id: string;
  name: string;
}

export function Analytics() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState('');
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?.id) return;

      try {
        const medicinesData = await getMedicines();
        setMedicines(medicinesData);

        const insightsData = await getActiveInsights(user.id);
        setInsights(insightsData);

        // Generate new insights
        await generateAIInsights(user.id);

        if (medicinesData.length > 0) {
          setSelectedMedicine(medicinesData[0].id);
          const forecast = await generateDemandForecast(medicinesData[0].id, user.id);
          const chartData = forecast.map(f => ({
            date: new Date(f.forecastDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            predicted: f.predictedQuantity,
            confidence: f.confidenceScore * 100,
          }));
          setForecastData(chartData);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  const handleMedicineChange = async (medicineId: string) => {
    setSelectedMedicine(medicineId);
    if (!user?.id) return;

    try {
      const forecast = await generateDemandForecast(medicineId, user.id);
      const chartData = forecast.map(f => ({
        date: new Date(f.forecastDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        predicted: f.predictedQuantity,
        confidence: f.confidenceScore * 100,
      }));
      setForecastData(chartData);
    } catch (error) {
      console.error('Error generating forecast:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-red-500 bg-red-50';
      case 'medium':
        return 'border-l-4 border-yellow-500 bg-yellow-50';
      default:
        return 'border-l-4 border-blue-500 bg-blue-50';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="text-red-600" size={20} />;
      case 'medium':
        return <TrendingUp className="text-yellow-600" size={20} />;
      default:
        return <CheckCircle className="text-blue-600" size={20} />;
    }
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
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Brain className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">AI Analytics & Insights</h1>
          </div>
          <p className="text-gray-600">AI-powered demand forecasting and recommendations</p>
        </div>

        {/* Demand Forecast */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Demand Forecast</h2>
            <div className="flex items-center space-x-4">
              <label className="font-medium text-gray-700">Select Medicine:</label>
              <select
                value={selectedMedicine}
                onChange={(e) => handleMedicineChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {medicines.map((med) => (
                  <option key={med.id} value={med.id}>
                    {med.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {forecastData.length > 0 && (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="predicted"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorPredicted)"
                  name="Predicted Demand"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="confidence"
                  stroke="#10b981"
                  name="Confidence %"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* AI Insights */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Zap size={24} className="text-yellow-500" />
            <span>AI-Generated Insights</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insights.map((insight) => (
              <div key={insight.id} className={`rounded-lg p-6 ${getPriorityColor(insight.priority)}`}>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">{getPriorityIcon(insight.priority)}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{insight.title}</h3>
                    <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
                    <div className="bg-white bg-opacity-60 rounded p-3">
                      <p className="text-sm font-medium text-gray-900">Recommendation:</p>
                      <p className="text-sm text-gray-700 mt-1">{insight.recommendation}</p>
                    </div>
                    <div className="mt-4 flex justify-end space-x-2">
                      <button className="px-3 py-1 text-sm bg-white bg-opacity-40 hover:bg-opacity-60 rounded transition font-medium">
                        Dismiss
                      </button>
                      <button className="px-3 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded transition font-medium">
                        Act on This
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {insights.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg">
              <CheckCircle size={48} className="mx-auto text-green-600 mb-4" />
              <p className="text-gray-600 text-lg">No alerts or recommendations at the moment</p>
              <p className="text-gray-500">Your inventory is running smoothly</p>
            </div>
          )}
        </div>

        {/* Insights Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Restocking Alerts</h3>
            <p className="text-3xl font-bold text-orange-600">
              {insights.filter((i) => i.insight_type === 'restocking').length}
            </p>
            <p className="text-gray-600 text-sm mt-2">Medicines below minimum stock</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Expiry Risks</h3>
            <p className="text-3xl font-bold text-red-600">
              {insights.filter((i) => i.insight_type === 'expiry_risk').length}
            </p>
            <p className="text-gray-600 text-sm mt-2">Medicines expiring soon</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Optimization</h3>
            <p className="text-3xl font-bold text-green-600">₹2,450</p>
            <p className="text-gray-600 text-sm mt-2">Potential savings this month</p>
          </div>
        </div>
      </div>
    </div>
  );
}
