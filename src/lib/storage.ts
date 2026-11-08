import {
  AppSettings,
  ApplicationStatus,
  BillingCycle,
  DashboardMetrics,
  LandlordProfile,
  Lease,
  LeaseContract,
  Property,
  TenantApplication,
  Transaction,
} from '@/types/database';
import { isSupabaseConfigured, supabase } from './supabase/client';
import { getCachedProfile, PROFILE_SESSION_KEY } from './auth';
import {
  DEMO_APPLICATIONS,
  DEMO_LEASES,
  DEMO_PROPERTIES,
  DEMO_SETTINGS,
  DEMO_TRANSACTIONS,
  INITIAL_APPLICATIONS,
  INITIAL_LEASES,
  INITIAL_PROPERTIES,
  INITIAL_SETTINGS,
  INITIAL_TRANSACTIONS,
} from './supabase/mock-data';
import { calculateNextDueDate, evaluateLeaseStatus } from './billing';

const STORAGE_KEYS = {
  PROPERTIES: 'kontrakinaja_properties_v1',
  LEASES: 'kontrakinaja_leases_v1',
  APPLICATIONS: 'kontrakinaja_applications_v1',
  TRANSACTIONS: 'kontrakinaja_transactions_v1',
  SETTINGS: 'kontrakinaja_settings_v1',
  CONTRACTS: 'kontrakinaja_contracts_v1',
};

// --- Local Storage Helpers ---
export function getCurrentOwnerId(): string | null {
  const p = getCachedProfile();
  return p?.id || null;
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    let raw = localStorage.getItem(key);
    if (!raw && key.startsWith('kontrakinaja_')) {
      // Check legacy kontrakin_ and sewapribadi_ keys and auto-migrate forward
      const legacyKey1 = key.replace('kontrakinaja_', 'kontrakin_');
      const legacyKey2 = key.replace('kontrakinaja_', 'sewapribadi_');
      const legacyRaw = localStorage.getItem(legacyKey1) || localStorage.getItem(legacyKey2);
      if (legacyRaw) {
        raw = legacyRaw;
        localStorage.setItem(key, legacyRaw);
      }
    }
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save to localStorage for key ${key}:`, err);
  }
}

/**
 * Sweeps and removes all cached business data from the browser's localStorage.
 * Used during logout or when Supabase is active to prevent local plain-text residue.
 */
export function cleanLocalStorageBusinessData(): void {
  if (typeof window === 'undefined') return;
  const keysToRemove = [
    STORAGE_KEYS.PROPERTIES,
    STORAGE_KEYS.LEASES,
    STORAGE_KEYS.APPLICATIONS,
    STORAGE_KEYS.TRANSACTIONS,
    STORAGE_KEYS.SETTINGS,
    STORAGE_KEYS.CONTRACTS,
    'kontrakin_properties_v1',
    'kontrakin_leases_v1',
    'kontrakin_applications_v1',
    'kontrakin_transactions_v1',
    'kontrakin_settings_v1',
    'kontrakin_contracts_v1',
    'kontrakin_registered_users_v1',
    'sewapribadi_properties_v1',
    'sewapribadi_leases_v1',
    'sewapribadi_applications_v1',
    'sewapribadi_transactions_v1',
    'sewapribadi_settings_v1',
    'sewapribadi_contracts_v1',
    'sewapribadi_registered_users_v1',
  ];
  for (const k of keysToRemove) {
    try {
      localStorage.removeItem(k);
    } catch {}
  }
}

// Helpers for graceful backwards-compatibility with older Supabase schema versions
function isMissingOwnerIdError(error: any): boolean {
  if (!error) return false;
  const msg = String(error.message || '').toLowerCase();
  const details = String(error.details || '').toLowerCase();
  const code = String(error.code || '');
  return (
    code === '42703' ||
    msg.includes('owner_id') ||
    details.includes('owner_id')
  );
}

function extractMissingColumn(error: any): string | null {
  if (!error) return null;
  const msg = String(error.message || '');
  const match1 = msg.match(/Could not find the ['"]([^'"]+)['"] column/i);
  if (match1 && match1[1]) return match1[1];
  const match2 = msg.match(/column ['"]([^'"]+)['"] .* does not exist/i);
  if (match2 && match2[1]) return match2[1];
  return null;
}

// --- App Settings Service ---
export async function getSettings(): Promise<AppSettings> {
  const profile = getCachedProfile();
  if (profile) {
    return {
      id: profile.id,
      bank_name: profile.bank_name || 'BCA',
      account_number: profile.account_number || '',
      account_holder: profile.account_holder || profile.owner_name || '',
      contact_phone: profile.phone || '',
      reminder_days_before: profile.reminder_days_before || 7,
      default_cycle: profile.default_cycle || 'semi_annual',
      custom_wa_template: profile.custom_wa_template || null,
      updated_at: profile.updated_at || new Date().toISOString(),
    };
  }

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('id', 'default')
      .single();
    if (!error && data) return data as AppSettings;
  }
  return loadFromStorage(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
}

export async function saveSettings(settings: AppSettings): Promise<AppSettings> {
  const updated = { ...settings, updated_at: new Date().toISOString() };
  const profile = getCachedProfile();
  if (profile) {
    const updatedProfile: LandlordProfile = {
      ...profile,
      bank_name: settings.bank_name,
      account_number: settings.account_number,
      account_holder: settings.account_holder,
      phone: settings.contact_phone || profile.phone,
      reminder_days_before: settings.reminder_days_before,
      default_cycle: settings.default_cycle,
      custom_wa_template: settings.custom_wa_template,
      updated_at: updated.updated_at,
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(PROFILE_SESSION_KEY, JSON.stringify(updatedProfile));
    }
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('profiles').upsert(updatedProfile);
      } catch (profErr) {
        console.warn('Non-fatal: could not update profiles in saveSettings:', profErr);
      }
    }
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('app_settings').upsert(updated);
      // Also mirror to default record for anonymous public lookup resilience
      await supabase.from('app_settings').upsert({ ...updated, id: 'default' });
    } catch (setErr) {
      console.warn('Non-fatal: could not upsert app_settings:', setErr);
    }
    saveToStorage(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  }
  saveToStorage(STORAGE_KEYS.SETTINGS, updated);
  return updated;
}

// --- Properties Service ---
export async function getProperties(ownerId?: string): Promise<Property[]> {
  const targetOwnerId = ownerId !== undefined ? ownerId : getCurrentOwnerId();

  if (isSupabaseConfigured() && supabase) {
    let query = supabase.from('properties').select('*');
    if (targetOwnerId) {
      query = query.eq('owner_id', targetOwnerId);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (!error && data) return data as Property[];

    // Fallback if owner_id column does not exist yet on Supabase schema
    if (error && isMissingOwnerIdError(error)) {
      const fallbackQuery = await supabase.from('properties').select('*').order('created_at', { ascending: false });
      if (!fallbackQuery.error && fallbackQuery.data) {
        return fallbackQuery.data as Property[];
      }
    }
    console.error('Error fetching properties from Supabase:', error);
    return [];
  }

  const list = loadFromStorage<Property[]>(STORAGE_KEYS.PROPERTIES, []);
  if (targetOwnerId) {
    if (targetOwnerId === 'demo-landlord-01') {
      return list.filter((p) => !p.owner_id || p.owner_id === 'demo-landlord-01');
    }
    return list.filter((p) => p.owner_id === targetOwnerId);
  }
  return list;
}

export async function getPropertyById(id: string): Promise<Property | null> {
  const properties = await getProperties();
  return properties.find((p) => p.id === id) || null;
}

export async function saveProperty(
  property: Omit<Property, 'created_at' | 'id'> & { id?: string }
): Promise<Property> {
  const isNew = !property.id;
  const currentOwner = getCurrentOwnerId();
  const propRecord: Property = {
    ...property,
    id: property.id || `prop-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    owner_id: property.owner_id || currentOwner || null,
    is_public_listed: property.is_public_listed ?? true,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured() && supabase) {
    let payload: Record<string, any> = { ...propRecord };
    let res = await supabase.from('properties').upsert(payload);

    // If a column is missing from Supabase schema cache, strip it and retry up to 3 times
    let attempts = 0;
    while (res.error && attempts < 3) {
      attempts++;
      const missingCol = extractMissingColumn(res.error) || (isMissingOwnerIdError(res.error) ? 'owner_id' : null);
      if (missingCol && missingCol in payload) {
        console.warn(`Supabase schema missing '${missingCol}' on 'properties'. Retrying without this column...`);
        delete payload[missingCol];
        res = await supabase.from('properties').upsert(payload);
      } else {
        break;
      }
    }

    if (res.error) {
      console.error('Failed to upsert property to Supabase:', res.error);
      throw res.error;
    }
    return propRecord;
  }

  const list = loadFromStorage<Property[]>(STORAGE_KEYS.PROPERTIES, []);
  const updatedList = isNew
    ? [propRecord, ...list]
    : list.map((p) => (p.id === propRecord.id ? propRecord : p));
  saveToStorage(STORAGE_KEYS.PROPERTIES, updatedList);

  return propRecord;
}

export async function deleteProperty(propertyId: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    await supabase.from('properties').delete().eq('id', propertyId);
    return;
  }
  const list = loadFromStorage<Property[]>(STORAGE_KEYS.PROPERTIES, []);
  saveToStorage(
    STORAGE_KEYS.PROPERTIES,
    list.filter((p) => p.id !== propertyId)
  );

  const leases = loadFromStorage<Lease[]>(STORAGE_KEYS.LEASES, []);
  saveToStorage(
    STORAGE_KEYS.LEASES,
    leases.filter((l) => l.property_id !== propertyId)
  );
}

// --- Leases Service ---
export async function getLeases(ownerId?: string): Promise<Lease[]> {
  const targetOwnerId = ownerId !== undefined ? ownerId : getCurrentOwnerId();
  const settings = await getSettings();

  if (isSupabaseConfigured() && supabase) {
    let query = supabase.from('leases').select('*, property:properties(*)');
    if (targetOwnerId) {
      query = query.eq('owner_id', targetOwnerId);
    }
    const { data, error } = await query.order('next_due_date', { ascending: true });
    if (!error && data) {
      return (data as Lease[]).map((l) => ({
        ...l,
        status: evaluateLeaseStatus(l.next_due_date, settings.reminder_days_before),
      }));
    }

    if (error && isMissingOwnerIdError(error)) {
      const fallback = await supabase
        .from('leases')
        .select('*, property:properties(*)')
        .order('next_due_date', { ascending: true });
      if (!fallback.error && fallback.data) {
        return (fallback.data as Lease[]).map((l) => ({
          ...l,
          status: evaluateLeaseStatus(l.next_due_date, settings.reminder_days_before),
        }));
      }
    }
    console.error('Error fetching leases from Supabase:', error);
    return [];
  }

  let list = loadFromStorage<Lease[]>(STORAGE_KEYS.LEASES, []);
  if (targetOwnerId) {
    if (targetOwnerId === 'demo-landlord-01') {
      list = list.filter((l) => !l.owner_id || l.owner_id === 'demo-landlord-01');
    } else {
      list = list.filter((l) => l.owner_id === targetOwnerId);
    }
  }
  const properties = await getProperties(targetOwnerId || undefined);
  list = list.map((l) => ({
    ...l,
    property: properties.find((p) => p.id === l.property_id),
  }));

  return list.map((l) => ({
    ...l,
    status: evaluateLeaseStatus(l.next_due_date, settings.reminder_days_before),
  }));
}

export async function saveLease(
  lease: Omit<Lease, 'created_at' | 'status' | 'id'> & { id?: string }
): Promise<Lease> {
  const settings = await getSettings();
  const status = evaluateLeaseStatus(lease.next_due_date, settings.reminder_days_before);
  const isNew = !lease.id;
  const currentOwner = getCurrentOwnerId();

  const leaseRecord: Lease = {
    ...lease,
    id: lease.id || `lease-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    owner_id: lease.owner_id || currentOwner || null,
    status,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured() && supabase) {
    const { property, ...cleanRecord } = leaseRecord;
    let payload: Record<string, any> = { ...cleanRecord };
    let res = await supabase.from('leases').upsert(payload);

    let attempts = 0;
    while (res.error && attempts < 3) {
      attempts++;
      const missingCol = extractMissingColumn(res.error) || (isMissingOwnerIdError(res.error) ? 'owner_id' : null);
      if (missingCol && missingCol in payload) {
        console.warn(`Supabase schema missing '${missingCol}' on 'leases'. Retrying without this column...`);
        delete payload[missingCol];
        res = await supabase.from('leases').upsert(payload);
      } else {
        break;
      }
    }

    if (res.error) {
      console.error('Failed to upsert lease to Supabase:', res.error);
      throw res.error;
    }
    return leaseRecord;
  }

  const list = loadFromStorage<Lease[]>(STORAGE_KEYS.LEASES, []);
  const updatedList = isNew
    ? [leaseRecord, ...list]
    : list.map((l) => (l.id === leaseRecord.id ? leaseRecord : l));
  saveToStorage(STORAGE_KEYS.LEASES, updatedList);

  return leaseRecord;
}

export async function deleteLease(leaseId: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    await supabase.from('leases').delete().eq('id', leaseId);
    return;
  }

  const list = loadFromStorage<Lease[]>(STORAGE_KEYS.LEASES, []);
  saveToStorage(
    STORAGE_KEYS.LEASES,
    list.filter((l) => l.id !== leaseId)
  );
}

export async function renewLease(
  leaseId: string,
  paymentAmount: number,
  notes?: string
): Promise<{ lease: Lease; transaction: Transaction }> {
  const leases = await getLeases();
  const existing = leases.find((l) => l.id === leaseId);
  if (!existing) throw new Error('Lease not found');

  const newDueDate = calculateNextDueDate(existing.next_due_date, existing.billing_cycle);
  const updatedLease = await saveLease({
    ...existing,
    next_due_date: newDueDate,
    notes: notes ? `${existing.notes ? existing.notes + '\n' : ''}${notes}` : existing.notes,
  });

  const transaction = await saveTransaction({
    property_id: existing.property_id,
    lease_id: existing.id,
    category: 'income_rent',
    amount: paymentAmount,
    transaction_date: new Date().toISOString().split('T')[0],
    description: `Perpanjangan Sewa (${existing.billing_cycle}) - ${existing.tenant_name}`,
  });

  return { lease: updatedLease, transaction };
}

// --- Tenant Applications Service (Self-Service Onboarding) ---
export async function getTenantApplications(ownerId?: string): Promise<TenantApplication[]> {
  const targetOwnerId = ownerId !== undefined ? ownerId : getCurrentOwnerId();

  if (isSupabaseConfigured() && supabase) {
    let query = supabase.from('tenant_applications').select('*, property:properties(*)');
    if (targetOwnerId) {
      query = query.eq('owner_id', targetOwnerId);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (!error && data) return data as TenantApplication[];

    if (error && isMissingOwnerIdError(error)) {
      const fallback = await supabase
        .from('tenant_applications')
        .select('*, property:properties(*)')
        .order('created_at', { ascending: false });
      if (!fallback.error && fallback.data) return fallback.data as TenantApplication[];
    }
    console.error('Error fetching applications from Supabase:', error);
    return [];
  }

  let list: TenantApplication[] = loadFromStorage<TenantApplication[]>(STORAGE_KEYS.APPLICATIONS, []);
  if (targetOwnerId) {
    if (targetOwnerId === 'demo-landlord-01') {
      list = list.filter((a) => !a.owner_id || a.owner_id === 'demo-landlord-01');
    } else {
      list = list.filter((a) => a.owner_id === targetOwnerId);
    }
  }
  const properties = await getProperties(targetOwnerId || undefined);
  return list.map((app) => ({
    ...app,
    property: properties.find((p) => p.id === app.property_id),
  }));
}

export async function saveTenantApplication(
  app: Omit<TenantApplication, 'created_at' | 'status' | 'id'> & { id?: string }
): Promise<TenantApplication> {
  const isNew = !app.id;
  const currentOwner = getCurrentOwnerId();

  const appRecord: TenantApplication = {
    ...app,
    id: app.id || `app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    owner_id: app.owner_id || currentOwner || null,
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured() && supabase) {
    const { property, ...cleanRecord } = appRecord;
    let payload: Record<string, any> = { ...cleanRecord };
    let res = await supabase.from('tenant_applications').upsert(payload);

    let attempts = 0;
    while (res.error && attempts < 3) {
      attempts++;
      const missingCol = extractMissingColumn(res.error) || (isMissingOwnerIdError(res.error) ? 'owner_id' : null);
      if (missingCol && missingCol in payload) {
        console.warn(`Supabase schema missing '${missingCol}' on 'tenant_applications'. Retrying without this column...`);
        delete payload[missingCol];
        res = await supabase.from('tenant_applications').upsert(payload);
      } else {
        break;
      }
    }

    if (res.error) {
      console.error('Failed to upsert application to Supabase:', res.error);
      throw res.error;
    }
    return appRecord;
  }

  const list = loadFromStorage<TenantApplication[]>(STORAGE_KEYS.APPLICATIONS, []);
  const updatedList = isNew
    ? [appRecord, ...list]
    : list.map((a) => (a.id === appRecord.id ? appRecord : a));
  saveToStorage(STORAGE_KEYS.APPLICATIONS, updatedList);

  return appRecord;
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus
): Promise<TenantApplication> {
  const list = await getTenantApplications();
  const existing = list.find((a) => a.id === applicationId);
  if (!existing) throw new Error('Application not found');

  const updated: TenantApplication = {
    ...existing,
    status,
  };

  if (isSupabaseConfigured() && supabase) {
    const { property, ...cleanRecord } = updated;
    await supabase.from('tenant_applications').update({ status }).eq('id', applicationId);
    return updated;
  }

  const localList = loadFromStorage(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
  saveToStorage(
    STORAGE_KEYS.APPLICATIONS,
    localList.map((a) => (a.id === applicationId ? updated : a))
  );

  return updated;
}

export async function approveTenantApplication(
  applicationId: string,
  rateAmount?: number
): Promise<{ application: TenantApplication; lease: Lease }> {
  const applications = await getTenantApplications();
  const app = applications.find((a) => a.id === applicationId);
  if (!app) throw new Error('Application not found');
  if (!app.property_id) throw new Error('No property assigned to this application');

  const properties = await getProperties();
  const property = properties.find((p) => p.id === app.property_id);

  // Determine rate
  const cycleMonthsMap: Record<BillingCycle, number> = {
    monthly: 1,
    quarterly: 3,
    semi_annual: 6,
    annual: 12,
  };
  const months = cycleMonthsMap[app.preferred_cycle] || property?.min_rental_months || 6;
  const baseMonthly = property?.monthly_rate || 1500000;
  const finalRate = rateAmount || (baseMonthly * months);
  const calculatedDueDate = calculateNextDueDate(app.move_in_date, app.preferred_cycle);

  // 1. Create Lease
  const lease = await saveLease({
    property_id: app.property_id,
    tenant_name: app.full_name,
    tenant_phone: app.phone,
    tenant_nik: app.nik || null,
    billing_cycle: app.preferred_cycle,
    rate_amount: finalRate,
    deposit_amount: null,
    start_date: app.move_in_date,
    next_due_date: calculatedDueDate,
    notes: `Pekerjaan: ${app.occupation || '-'}\nPenghuni: ${app.family_members || 1} orang\nKendaraan: ${app.vehicles || '-'}\nCatatan: ${app.notes || '-'}`,
  });

  // 2. Mark application approved
  const updatedApp = await updateApplicationStatus(applicationId, 'approved');

  return { application: updatedApp, lease };
}

// --- Transactions Service ---
export async function getTransactions(ownerId?: string): Promise<Transaction[]> {
  const targetOwnerId = ownerId !== undefined ? ownerId : getCurrentOwnerId();

  if (isSupabaseConfigured() && supabase) {
    let query = supabase.from('transactions').select('*, property:properties(*), lease:leases(*)');
    if (targetOwnerId) {
      query = query.eq('owner_id', targetOwnerId);
    }
    const { data, error } = await query.order('transaction_date', { ascending: false });
    if (!error && data) return data as Transaction[];

    if (error && isMissingOwnerIdError(error)) {
      const fallback = await supabase
        .from('transactions')
        .select('*, property:properties(*), lease:leases(*)')
        .order('transaction_date', { ascending: false });
      if (!fallback.error && fallback.data) return fallback.data as Transaction[];
    }
    console.error('Error fetching transactions from Supabase:', error);
    return [];
  }

  let list: Transaction[] = loadFromStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
  if (targetOwnerId) {
    if (targetOwnerId === 'demo-landlord-01') {
      list = list.filter((t) => !t.owner_id || t.owner_id === 'demo-landlord-01');
    } else {
      list = list.filter((t) => t.owner_id === targetOwnerId);
    }
  }
  const properties = await getProperties(targetOwnerId || undefined);
  const leases = await getLeases(targetOwnerId || undefined);
  return list.map((t) => ({
    ...t,
    property: properties.find((p) => p.id === t.property_id),
    lease: leases.find((l) => l.id === t.lease_id),
  }));
}

export async function saveTransaction(
  transaction: Omit<Transaction, 'created_at' | 'id'> & { id?: string }
): Promise<Transaction> {
  const isNew = !transaction.id;
  const currentOwner = getCurrentOwnerId();

  const txRecord: Transaction = {
    ...transaction,
    id: transaction.id || `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    owner_id: transaction.owner_id || currentOwner || null,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured() && supabase) {
    const { property, lease, ...cleanRecord } = txRecord;
    let payload: Record<string, any> = { ...cleanRecord };
    let res = await supabase.from('transactions').upsert(payload);

    let attempts = 0;
    while (res.error && attempts < 3) {
      attempts++;
      const missingCol = extractMissingColumn(res.error) || (isMissingOwnerIdError(res.error) ? 'owner_id' : null);
      if (missingCol && missingCol in payload) {
        console.warn(`Supabase schema missing '${missingCol}' on 'transactions'. Retrying without this column...`);
        delete payload[missingCol];
        res = await supabase.from('transactions').upsert(payload);
      } else {
        break;
      }
    }

    if (res.error) {
      console.error('Failed to upsert transaction to Supabase:', res.error);
      throw res.error;
    }
    return txRecord;
  }

  const list = loadFromStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
  const updatedList = isNew
    ? [txRecord, ...list]
    : list.map((t) => (t.id === txRecord.id ? txRecord : t));
  saveToStorage(STORAGE_KEYS.TRANSACTIONS, updatedList);

  return txRecord;
}

export async function deleteTransaction(transactionId: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    await supabase.from('transactions').delete().eq('id', transactionId);
    return;
  }
  const list = loadFromStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
  saveToStorage(
    STORAGE_KEYS.TRANSACTIONS,
    list.filter((t) => t.id !== transactionId)
  );
}

// --- Contracts Service ---
export async function getContracts(ownerId?: string): Promise<LeaseContract[]> {
  const targetOwnerId = ownerId !== undefined ? ownerId : getCurrentOwnerId();

  if (isSupabaseConfigured() && supabase) {
    let query = supabase.from('contracts').select('*, lease:leases(*), property:properties(*)');
    if (targetOwnerId) {
      query = query.eq('owner_id', targetOwnerId);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (!error && data) return data as LeaseContract[];

    if (error && isMissingOwnerIdError(error)) {
      const fallback = await supabase
        .from('contracts')
        .select('*, lease:leases(*), property:properties(*)')
        .order('created_at', { ascending: false });
      if (!fallback.error && fallback.data) return fallback.data as LeaseContract[];
    }
    console.error('Error fetching contracts from Supabase:', error);
    return [];
  }

  let contracts = loadFromStorage<LeaseContract[]>(STORAGE_KEYS.CONTRACTS, []);
  if (targetOwnerId) {
    if (targetOwnerId === 'demo-landlord-01') {
      contracts = contracts.filter((c) => !c.owner_id || c.owner_id === 'demo-landlord-01');
    } else {
      contracts = contracts.filter((c) => c.owner_id === targetOwnerId);
    }
  }
  const properties = await getProperties(targetOwnerId || undefined);
  const leases = await getLeases(targetOwnerId || undefined);

  return contracts.map((c) => ({
    ...c,
    property: properties.find((p) => p.id === c.property_id),
    lease: leases.find((l) => l.id === c.lease_id),
  }));
}

export async function getContractById(id: string): Promise<LeaseContract | null> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('contracts')
      .select('*, lease:leases(*), property:properties(*)')
      .eq('id', id)
      .maybeSingle();
    if (!error && data) return data as LeaseContract;
    return null;
  }
  const contracts = loadFromStorage<LeaseContract[]>(STORAGE_KEYS.CONTRACTS, []);
  return contracts.find((c) => c.id === id) || null;
}

export async function getContractByLeaseId(leaseId: string): Promise<LeaseContract | null> {
  const contracts = await getContracts();
  return contracts.find((c) => c.lease_id === leaseId) || null;
}

export async function saveContract(
  contract: Omit<LeaseContract, 'created_at' | 'updated_at'> & {
    id?: string;
    created_at?: string;
    updated_at?: string;
  }
): Promise<LeaseContract> {
  const isNew = !contract.id;
  const now = new Date().toISOString();
  const currentOwner = getCurrentOwnerId();

  const record: LeaseContract = {
    ...contract,
    id: contract.id || `ctr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    owner_id: contract.owner_id || currentOwner || null,
    created_at: contract.created_at || now,
    updated_at: now,
  };

  if (isSupabaseConfigured() && supabase) {
    const { property, lease, ...cleanRecord } = record;
    let payload: Record<string, any> = { ...cleanRecord };
    let res = await supabase.from('contracts').upsert(payload);

    let attempts = 0;
    while (res.error && attempts < 3) {
      attempts++;
      const missingCol = extractMissingColumn(res.error) || (isMissingOwnerIdError(res.error) ? 'owner_id' : null);
      if (missingCol && missingCol in payload) {
        console.warn(`Supabase schema missing '${missingCol}' on 'contracts'. Retrying without this column...`);
        delete payload[missingCol];
        res = await supabase.from('contracts').upsert(payload);
      } else {
        break;
      }
    }

    if (res.error) {
      console.error('Failed to upsert contract to Supabase:', res.error);
      throw res.error;
    }
    return record;
  }

  const list = loadFromStorage<LeaseContract[]>(STORAGE_KEYS.CONTRACTS, []);
  const updatedList = isNew
    ? [record, ...list]
    : list.map((c) => (c.id === record.id ? record : c));
  saveToStorage(STORAGE_KEYS.CONTRACTS, updatedList);

  return record;
}

export async function signContract(
  contractId: string,
  role: 'owner' | 'tenant',
  signatureDataUrl: string
): Promise<LeaseContract> {
  const existing = await getContractById(contractId);
  if (!existing) throw new Error('Contract not found');

  const now = new Date().toISOString();
  let updatedOwnerSig = existing.owner_signature;
  let updatedOwnerSignedAt = existing.owner_signed_at;
  let updatedTenantSig = existing.tenant_signature;
  let updatedTenantSignedAt = existing.tenant_signed_at;

  if (role === 'owner') {
    updatedOwnerSig = signatureDataUrl;
    updatedOwnerSignedAt = now;
  } else {
    updatedTenantSig = signatureDataUrl;
    updatedTenantSignedAt = now;
  }

  let newStatus: LeaseContract['status'] = 'draft';
  if (updatedOwnerSig && updatedTenantSig) {
    newStatus = 'completed';
  } else if (updatedOwnerSig && !updatedTenantSig) {
    newStatus = 'pending_tenant';
  } else if (!updatedOwnerSig && updatedTenantSig) {
    newStatus = 'pending_owner';
  }

  return saveContract({
    ...existing,
    owner_signature: updatedOwnerSig,
    owner_signed_at: updatedOwnerSignedAt,
    tenant_signature: updatedTenantSig,
    tenant_signed_at: updatedTenantSignedAt,
    status: newStatus,
  });
}

export async function resetContract(
  contractId: string,
  options?: {
    reSyncWithLease?: boolean;
    lease?: Lease;
    property?: Property;
  }
): Promise<LeaseContract> {
  const existing = await getContractById(contractId);
  if (!existing) throw new Error('Contract not found');

  const now = new Date().toISOString();
  let updatedRecord: LeaseContract = {
    ...existing,
    owner_signature: null,
    owner_signed_at: null,
    tenant_signature: null,
    tenant_signed_at: null,
    status: 'draft',
    updated_at: now,
  };

  if (options?.reSyncWithLease && options.lease) {
    const l = options.lease;
    const p = options.property;
    updatedRecord = {
      ...updatedRecord,
      start_date: l.start_date,
      end_date: l.next_due_date,
      billing_cycle: l.billing_cycle,
      rent_amount: l.rate_amount,
      deposit_amount: l.deposit_amount || 0,
      tenant_name: l.tenant_name,
      tenant_phone: l.tenant_phone,
      tenant_nik: l.tenant_nik || null,
      property_name: p ? p.name : updatedRecord.property_name,
      property_address: p?.address || updatedRecord.property_address,
      facilities: p?.facilities || updatedRecord.facilities,
      electricity_id: p?.electricity_id || updatedRecord.electricity_id,
      water_id: p?.water_id || updatedRecord.water_id,
    };
  }

  return saveContract(updatedRecord);
}

export async function deleteContract(contractId: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    await supabase.from('contracts').delete().eq('id', contractId);
    return;
  }
  const list = loadFromStorage<LeaseContract[]>(STORAGE_KEYS.CONTRACTS, []);
  saveToStorage(
    STORAGE_KEYS.CONTRACTS,
    list.filter((c) => c.id !== contractId)
  );
}

// --- Dashboard Metrics Calculation ---
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [properties, leases, transactions, applications] = await Promise.all([
    getProperties(),
    getLeases(),
    getTransactions(),
    getTenantApplications(),
  ]);

  const activeLeases = leases.filter(
    (l) => l.status === 'active' || l.status === 'due_soon' || l.status === 'overdue'
  );
  const occupiedPropertyIds = new Set(activeLeases.map((l) => l.property_id));

  const dueSoonCount = leases.filter((l) => l.status === 'due_soon').length;
  const overdueCount = leases.filter((l) => l.status === 'overdue').length;
  const pendingApplicationsCount = applications.filter((a) => a.status === 'pending').length;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  let totalIncomeCurrentMonth = 0;
  let totalExpenseCurrentMonth = 0;

  for (const tx of transactions) {
    const txDate = new Date(tx.transaction_date);
    if (txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth) {
      if (tx.category.startsWith('income_')) {
        totalIncomeCurrentMonth += Number(tx.amount);
      } else if (tx.category.startsWith('expense_')) {
        totalExpenseCurrentMonth += Number(tx.amount);
      }
    }
  }

  return {
    totalProperties: properties.length,
    occupiedProperties: occupiedPropertyIds.size,
    vacantProperties: Math.max(0, properties.length - occupiedPropertyIds.size),
    dueSoonCount,
    overdueCount,
    pendingApplicationsCount,
    totalIncomeCurrentMonth,
    totalExpenseCurrentMonth,
    netProfitCurrentMonth: totalIncomeCurrentMonth - totalExpenseCurrentMonth,
  };
}

export async function clearAllData(): Promise<void> {
  // 1. Kosongkan local storage browser
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.LEASES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify([]));
  }

  // 2. Kosongkan database Supabase jika terhubung
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('contracts').delete().neq('id', '');
      await supabase.from('transactions').delete().neq('id', '');
      await supabase.from('leases').delete().neq('id', '');
      await supabase.from('tenant_applications').delete().neq('id', '');
      await supabase.from('properties').delete().neq('id', '');
    } catch (err) {
      console.error('Failed to clear Supabase data', err);
    }
  }
}

export function resetToDemoData(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(DEMO_PROPERTIES));
  localStorage.setItem(STORAGE_KEYS.LEASES, JSON.stringify(DEMO_LEASES));
  localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(DEMO_APPLICATIONS));
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(DEMO_TRANSACTIONS));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEMO_SETTINGS));
}

// --- Public Multi-Tenant Catalog & Onboarding Service ---
export async function getLandlordProfileBySlug(slug: string): Promise<LandlordProfile | null> {
  if (!slug) return null;
  const cleanSlug = slug.toLowerCase().trim();

  // 1. Try querying Supabase profiles table
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('slug', cleanSlug)
        .maybeSingle();
      if (!error && data) return data as LandlordProfile;
    } catch {}
  }

  // 2. Try browser localStorage if available (same tab)
  if (typeof window !== 'undefined') {
    const cached = getCachedProfile();
    if (cached && (cached.slug === cleanSlug || (cached.business_name && cleanSlug.includes(cached.slug)))) {
      return cached;
    }

    const rawUsers =
      localStorage.getItem('kontrakinaja_registered_users_v1') ||
      localStorage.getItem('kontrakin_registered_users_v1') ||
      localStorage.getItem('sewapribadi_registered_users_v1');
    if (rawUsers) {
      try {
        const users: any[] = JSON.parse(rawUsers);
        const match = users.find(
          (u) => u.profile?.slug === cleanSlug || (u.profile?.business_name && cleanSlug.includes(u.profile?.slug))
        );
        if (match) return match.profile as LandlordProfile;
      } catch {}
    }
  }

  // 3. Fallback for incognito / different session when Supabase Cloud has properties & app_settings
  if (isSupabaseConfigured() && supabase) {
    try {
      // Check if there are properties in Supabase
      const { data: propData } = await supabase
        .from('properties')
        .select('owner_id')
        .limit(5);

      if (propData && propData.length > 0) {
        // Fetch app_settings from Supabase
        const settings = await getSettings();
        const detectedOwnerId = propData[0]?.owner_id || 'landlord-primary';

        // Convert slug to clean title (e.g. "rumah-kontrak-faqih" -> "Rumah Kontrak Faqih")
        const words = cleanSlug.split('-').filter(Boolean);
        const businessName = words.length > 0
          ? words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
          : 'Kontrakan Mandiri';

        return {
          id: detectedOwnerId,
          slug: cleanSlug,
          business_name: businessName,
          owner_name: settings?.account_holder || 'Pemilik Kontrakan',
          phone: settings?.contact_phone || '',
          bank_name: settings?.bank_name || 'BCA',
          account_number: settings?.account_number || '',
          account_holder: settings?.account_holder || '',
          reminder_days_before: settings?.reminder_days_before || 7,
          default_cycle: settings?.default_cycle || 'semi_annual',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
    } catch {}
  }

  // 4. Fallback from local storage properties if running offline / without cloud connection
  if (typeof window !== 'undefined') {
    const localProps = loadFromStorage<Property[]>(STORAGE_KEYS.PROPERTIES, []);
    if (localProps.length > 0) {
      const settings = await getSettings();
      const detectedOwnerId = localProps[0]?.owner_id || 'landlord-primary';
      const words = cleanSlug.split('-').filter(Boolean);
      const businessName = words.length > 0
        ? words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        : 'Kontrakan Mandiri';

      return {
        id: detectedOwnerId,
        slug: cleanSlug,
        business_name: businessName,
        owner_name: settings?.account_holder || 'Pemilik Kontrakan',
        phone: settings?.contact_phone || '',
        bank_name: settings?.bank_name || 'BCA',
        account_number: settings?.account_number || '',
        account_holder: settings?.account_holder || '',
        reminder_days_before: settings?.reminder_days_before || 7,
        default_cycle: settings?.default_cycle || 'semi_annual',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
  }

  // 5. Default demo slug fallback
  if (cleanSlug === 'kontrakan-berkah' || cleanSlug === 'demo') {
    return {
      id: 'demo-landlord-01',
      slug: 'kontrakan-berkah',
      business_name: 'Kontrakan Berkah Makmur',
      owner_name: 'Ahmad Fauzi',
      phone: '081234567890',
      bank_name: 'BCA',
      account_number: '8001234567',
      account_holder: 'Ahmad Fauzi',
      reminder_days_before: 7,
      default_cycle: 'semi_annual',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  return null;
}

export async function getPublicPropertiesBySlug(
  slug: string
): Promise<{ landlord: LandlordProfile; properties: Property[] } | null> {
  const landlord = await getLandlordProfileBySlug(slug);
  if (!landlord) return null;

  if (isSupabaseConfigured() && supabase) {
    // 1. Try querying properties matching landlord.id
    if (landlord.id) {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', landlord.id)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const publicProps = data.filter((p: any) => p.is_public_listed !== false);
        return { landlord, properties: (publicProps.length > 0 ? publicProps : data) as Property[] };
      }
    }

    // 2. Fallback to all listed properties in Supabase
    const fallback = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (!fallback.error && fallback.data && fallback.data.length > 0) {
      const publicProps = fallback.data.filter((p: any) => p.is_public_listed !== false);
      return { landlord, properties: (publicProps.length > 0 ? publicProps : fallback.data) as Property[] };
    }

    return { landlord, properties: [] };
  }

  const allProps = loadFromStorage<Property[]>(STORAGE_KEYS.PROPERTIES, []);
  const matching = allProps.filter(
    (p) => (!p.owner_id || p.owner_id === landlord.id) && (p.is_public_listed ?? true)
  );

  return { landlord, properties: matching.length > 0 ? matching : allProps };
}

export async function submitPublicTenantApplication(
  app: Omit<TenantApplication, 'created_at' | 'status' | 'id'>,
  landlordId: string
): Promise<TenantApplication> {
  const appRecord: TenantApplication = {
    ...app,
    id: `app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    owner_id: landlordId,
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured() && supabase) {
    const { property, ...cleanRecord } = appRecord;
    let payload: Record<string, any> = { ...cleanRecord };
    let res = await supabase.from('tenant_applications').insert(payload);

    let attempts = 0;
    while (res.error && attempts < 3) {
      attempts++;
      const missingCol = extractMissingColumn(res.error) || (isMissingOwnerIdError(res.error) ? 'owner_id' : null);
      if (missingCol && missingCol in payload) {
        delete payload[missingCol];
        res = await supabase.from('tenant_applications').insert(payload);
      } else {
        break;
      }
    }
    return appRecord;
  }

  const list = loadFromStorage<TenantApplication[]>(STORAGE_KEYS.APPLICATIONS, []);
  saveToStorage(STORAGE_KEYS.APPLICATIONS, [appRecord, ...list]);

  return appRecord;
}
