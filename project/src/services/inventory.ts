import { supabase } from '../lib/supabase';
import { addDays } from 'date-fns';

export interface Medicine {
  id: string;
  name: string;
  strength: string;
  manufacturer: string;
  unit_price: number;
  minimum_stock_level: number;
  reorder_quantity: number;
  category_id: string;
}

export interface InventoryBatch {
  id: string;
  medicine_id: string;
  batch_number: string;
  quantity: number;
  expiry_date: string;
  manufacturing_date: string;
  location: string;
  received_date: string;
}

export async function getMedicines() {
  const { data, error } = await supabase
    .from('medicines')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data as Medicine[];
}

export async function getInventoryBatches(organizationId: string) {
  const { data, error } = await supabase
    .from('inventory_batches')
    .select('*, medicines(name, strength, manufacturer)')
    .eq('organization_id', organizationId)
    .eq('is_available', true)
    .order('expiry_date');

  if (error) throw error;
  return data;
}

export async function addInventoryBatch(
  medicineId: string,
  batchNumber: string,
  quantity: number,
  unitPrice: number,
  expiryDate: string,
  manufacturingDate: string,
  location: string,
  organizationId: string
) {
  const { data, error } = await supabase
    .from('inventory_batches')
    .insert({
      medicine_id: medicineId,
      batch_number: batchNumber,
      quantity,
      unit_price: unitPrice,
      expiry_date: expiryDate,
      manufacturing_date: manufacturingDate,
      location,
      organization_id: organizationId,
    })
    .select();

  if (error) throw error;
  return data[0];
}

export async function updateBatchQuantity(
  batchId: string,
  newQuantity: number,
  transactionType: 'inbound' | 'outbound' | 'adjustment' | 'disposal',
  reason: string,
  performedBy: string
) {
  const { data: batch, error: fetchError } = await supabase
    .from('inventory_batches')
    .select('quantity')
    .eq('id', batchId)
    .single();

  if (fetchError) throw fetchError;

  const quantityChange = newQuantity - (batch?.quantity || 0);

  // Update batch quantity
  const { error: updateError } = await supabase
    .from('inventory_batches')
    .update({ quantity: newQuantity })
    .eq('id', batchId);

  if (updateError) throw updateError;

  // Log transaction
  const { error: logError } = await supabase
    .from('inventory_transactions')
    .insert({
      batch_id: batchId,
      transaction_type: transactionType,
      quantity_change: quantityChange,
      reason,
      performed_by: performedBy,
    });

  if (logError) throw logError;

  return true;
}

export async function checkAndCreateAlerts(organizationId: string) {
  const { data: batches, error } = await supabase
    .from('inventory_batches')
    .select('id, quantity, expiry_date, medicines(minimum_stock_level, reorder_quantity)')
    .eq('organization_id', organizationId)
    .eq('is_available', true);

  if (error) throw error;

  const now = new Date();
  const thirtyDaysLater = addDays(now, 30);
  const sixtyDaysLater = addDays(now, 60);

  for (const batch of batches || []) {
    const expiryDate = new Date(batch.expiry_date);
    const medicine = batch.medicines as any;

    if (expiryDate < now) {
      await createAlert(batch.id, 'expired', 'critical', 'Medicine has expired');
    } else if (expiryDate < thirtyDaysLater) {
      await createAlert(batch.id, 'expiry_warning', 'warning', 'Medicine expiring within 30 days');
    } else if (expiryDate < sixtyDaysLater) {
      await createAlert(batch.id, 'expiry_warning', 'info', 'Medicine expiring within 60 days');
    }

    if (batch.quantity < medicine?.minimum_stock_level) {
      await createAlert(batch.id, 'low_stock', 'critical', 'Stock below minimum level');
    }
  }
}

async function createAlert(
  batchId: string,
  alertType: string,
  alertLevel: string,
  message: string
) {
  const { data: existingAlert } = await supabase
    .from('stock_alerts')
    .select('id')
    .eq('batch_id', batchId)
    .eq('alert_type', alertType)
    .eq('is_resolved', false)
    .maybeSingle();

  if (!existingAlert) {
    await supabase.from('stock_alerts').insert({
      batch_id: batchId,
      alert_type: alertType,
      alert_level: alertLevel,
      message,
    });
  }
}

export async function getStockAlerts(organizationId: string) {
  const { data, error } = await supabase
    .from('stock_alerts')
    .select(
      'id, alert_type, alert_level, message, is_resolved, created_at, inventory_batches(batch_number, medicines(name))'
    )
    .eq('is_resolved', false)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) throw error;
  return data;
}

export async function resolveAlert(alertId: string, userId: string) {
  const { error } = await supabase
    .from('stock_alerts')
    .update({
      is_resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_by: userId,
    })
    .eq('id', alertId);

  if (error) throw error;
  return true;
}
