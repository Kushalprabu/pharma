import { supabase } from '../lib/supabase';

export async function initializeSampleData(userId: string) {
  try {
    // Check if data already initialized
    const { count } = await supabase
      .from('inventory_batches')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', userId);

    if (count && count > 0) {
      return; // Data already initialized
    }

    // Get first 5 medicines
    const { data: medicines } = await supabase
      .from('medicines')
      .select('id')
      .limit(5);

    if (!medicines || medicines.length === 0) {
      return;
    }

    // Add sample batches
    const now = new Date();
    const batchesData = medicines.map((med, idx) => ({
      medicine_id: med.id,
      batch_number: `BATCH-2024-${String(idx + 1).padStart(3, '0')}`,
      quantity: Math.floor(Math.random() * 500) + 100,
      unit_price: Math.floor(Math.random() * 500) + 50,
      manufacturing_date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      expiry_date: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      location: `Shelf-${String.fromCharCode(65 + idx)}${idx + 1}`,
      organization_id: userId,
      received_date: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    }));

    await supabase.from('inventory_batches').insert(batchesData);

    // Add sample demand history
    const demandHistoryData: any[] = [];
    for (const med of medicines.slice(0, 3)) {
      for (let i = 0; i < 30; i++) {
        demandHistoryData.push({
          medicine_id: med.id,
          organization_id: userId,
          quantity_consumed: Math.floor(Math.random() * 50) + 10,
          transaction_date: new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          day_of_week: new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000).getDay(),
          month: new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000).getMonth() + 1,
        });
      }
    }

    await supabase.from('demand_history').insert(demandHistoryData);
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
}
