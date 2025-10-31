import { supabase } from '../lib/supabase';
import { subDays } from 'date-fns';

export interface ForecastData {
  medicineId: string;
  forecastDate: string;
  predictedQuantity: number;
  confidenceScore: number;
}

export interface AIInsight {
  id: string;
  insightType: string;
  title: string;
  description: string;
  recommendation: string;
  priority: string;
  relatedMedicineId?: string;
}

async function getDemandHistory(medicineId: string, organizationId: string, days: number = 90) {
  const { data, error } = await supabase
    .from('demand_history')
    .select('quantity_consumed, transaction_date')
    .eq('medicine_id', medicineId)
    .eq('organization_id', organizationId)
    .gte('transaction_date', subDays(new Date(), days).toISOString().split('T')[0])
    .order('transaction_date', { ascending: true });

  if (error) throw error;
  return data || [];
}

function calculateSimpleMovingAverage(data: any[], windowSize: number = 7): number {
  if (data.length < windowSize) {
    return data.reduce((sum, d) => sum + d.quantity_consumed, 0) / data.length;
  }

  const recentData = data.slice(-windowSize);
  return recentData.reduce((sum, d) => sum + d.quantity_consumed, 0) / windowSize;
}

function calculateSeasonalityFactor(data: any[]): number {
  if (data.length < 14) return 1; // Not enough data for seasonality

  const lastWeek = data.slice(-7);
  const previousWeek = data.slice(-14, -7);

  const lastWeekAvg = lastWeek.reduce((sum, d) => sum + d.quantity_consumed, 0) / lastWeek.length;
  const previousWeekAvg =
    previousWeek.reduce((sum, d) => sum + d.quantity_consumed, 0) / previousWeek.length;

  return previousWeekAvg !== 0 ? lastWeekAvg / previousWeekAvg : 1;
}

function calculateTrendFactor(data: any[]): number {
  if (data.length < 7) return 1; // Not enough data for trend

  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));

  const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.quantity_consumed, 0) / firstHalf.length;
  const secondHalfAvg =
    secondHalf.reduce((sum, d) => sum + d.quantity_consumed, 0) / secondHalf.length;

  return firstHalfAvg !== 0 ? secondHalfAvg / firstHalfAvg : 1;
}

export async function generateDemandForecast(
  medicineId: string,
  organizationId: string,
  forecastDays: number = 7
): Promise<ForecastData[]> {
  const history = await getDemandHistory(medicineId, organizationId, 90);

  if (history.length === 0) {
    return Array.from({ length: forecastDays }, (_, i) => ({
      medicineId,
      forecastDate: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      predictedQuantity: 100,
      confidenceScore: 0.3,
    }));
  }

  const sma = calculateSimpleMovingAverage(history);
  const seasonality = calculateSeasonalityFactor(history);
  const trend = calculateTrendFactor(history);

  const baselineForcast = sma * seasonality * trend;
  const variance = Math.sqrt(
    history.reduce(
      (sum, d) => sum + Math.pow(d.quantity_consumed - sma, 2),
      0
    ) / history.length
  );

  return Array.from({ length: forecastDays }, (_, i) => {
    const predictionDate = new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000);
    const dayOfWeek = predictionDate.getDay();

    // Adjust forecast based on day of week (higher consumption on weekdays)
    const dayFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.8 : 1.1;
    const predictedQuantity = Math.max(10, Math.round(baselineForcast * dayFactor));

    // Confidence decreases for farther dates
    const confidenceScore = Math.max(0.4, 0.9 - (i * 0.1) / forecastDays);

    return {
      medicineId,
      forecastDate: predictionDate.toISOString().split('T')[0],
      predictedQuantity,
      confidenceScore,
    };
  });
}

export async function generateRestockingInsight(
  organizationId: string
): Promise<AIInsight[]> {
  const { data: lowStockBatches } = await supabase
    .from('inventory_batches')
    .select('id, medicine_id, quantity, medicines(name, reorder_quantity, minimum_stock_level)')
    .eq('organization_id', organizationId)
    .eq('is_available', true)
    .lt('quantity', supabase.sql`medicines.minimum_stock_level`);

  const insights: AIInsight[] = [];

  for (const batch of lowStockBatches || []) {
    const medicine = batch.medicines as any;
    insights.push({
      id: `restock-${batch.medicine_id}`,
      insightType: 'restocking',
      title: `Reorder ${medicine.name}`,
      description: `Current stock: ${batch.quantity} units. Recommended reorder quantity: ${medicine.reorder_quantity}`,
      recommendation: `Place purchase order for at least ${medicine.reorder_quantity} units of ${medicine.name}`,
      priority: 'high',
      relatedMedicineId: batch.medicine_id,
    });
  }

  return insights;
}

export async function generateExpiryInsight(
  organizationId: string
): Promise<AIInsight[]> {
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

  const { data: expiringBatches } = await supabase
    .from('inventory_batches')
    .select('id, medicine_id, quantity, expiry_date, medicines(name)')
    .eq('organization_id', organizationId)
    .eq('is_available', true)
    .lte('expiry_date', thirtyDaysLater.toISOString().split('T')[0])
    .gt('expiry_date', new Date().toISOString().split('T')[0])
    .order('expiry_date', { ascending: true });

  const insights: AIInsight[] = [];

  for (const batch of expiringBatches || []) {
    const medicine = batch.medicines as any;
    const daysUntilExpiry = Math.ceil(
      (new Date(batch.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    insights.push({
      id: `expiry-${batch.id}`,
      insightType: 'expiry_risk',
      title: `${medicine.name} expiring soon`,
      description: `Batch expires in ${daysUntilExpiry} days with ${batch.quantity} units in stock`,
      recommendation:
        daysUntilExpiry <= 7
          ? `Prioritize using this batch immediately to prevent wastage`
          : `Plan increased distribution to avoid expiry`,
      priority: daysUntilExpiry <= 7 ? 'high' : 'medium',
      relatedMedicineId: batch.medicine_id,
    });
  }

  return insights;
}

export async function generateAIInsights(organizationId: string): Promise<AIInsight[]> {
  const restockingInsights = await generateRestockingInsight(organizationId);
  const expiryInsights = await generateExpiryInsight(organizationId);

  const allInsights = [...restockingInsights, ...expiryInsights];

  // Save insights to database
  for (const insight of allInsights) {
    const { data: existing } = await supabase
      .from('ai_insights')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('insight_type', insight.insightType)
      .eq('related_medicine_id', insight.relatedMedicineId)
      .eq('is_actioned', false)
      .maybeSingle();

    if (!existing) {
      await supabase.from('ai_insights').insert({
        organization_id: organizationId,
        insight_type: insight.insightType,
        title: insight.title,
        description: insight.description,
        recommendation: insight.recommendation,
        priority: insight.priority,
        related_medicine_id: insight.relatedMedicineId,
      });
    }
  }

  return allInsights;
}

export async function getActiveInsights(organizationId: string): Promise<AIInsight[]> {
  const { data } = await supabase
    .from('ai_insights')
    .select('id, insight_type, title, description, recommendation, priority, related_medicine_id')
    .eq('organization_id', organizationId)
    .eq('is_actioned', false)
    .order('priority', { ascending: false })
    .limit(10);

  return (data || []) as AIInsight[];
}
