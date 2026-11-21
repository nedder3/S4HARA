import { Material, StockRecord, StorageLocation } from '../types/sap';

/**
 * Builds an O(1) lookup Map for Materials keyed by Material ID.
 * Time complexity: O(M) build, O(1) lookup.
 */
export function buildMaterialIndex(materials: readonly Material[]): ReadonlyMap<string, Material> {
  const map = new Map<string, Material>();
  for (let i = 0; i < materials.length; i++) {
    map.set(materials[i].id, materials[i]);
  }
  return map;
}

/**
 * Builds an O(1) lookup Map for StockRecords keyed by natural composite key:
 * `${plantId}-${storageLocationId}-${materialId}-${batch}`.
 * Time complexity: O(S) build, O(1) lookup.
 */
export function buildStockIndex(stocks: readonly StockRecord[]): ReadonlyMap<string, StockRecord> {
  const map = new Map<string, StockRecord>();
  for (let i = 0; i < stocks.length; i++) {
    map.set(stocks[i].id, stocks[i]);
  }
  return map;
}

/**
 * Aggregates total physical and unrestricted stock per Material ID in a single O(S) pass.
 * Eliminates O(M * S) nested .filter() loops in ABC, MRP, and KPI calculations.
 */
export interface MaterialStockTotals {
  unrestricted: number;
  qualityInspection: number;
  blocked: number;
  reserved: number;
  totalPhysical: number;
}

export function buildStockTotalsByMaterial(
  stocks: readonly StockRecord[],
  plantFilter?: string
): ReadonlyMap<string, MaterialStockTotals> {
  const totals = new Map<string, MaterialStockTotals>();

  for (let i = 0; i < stocks.length; i++) {
    const s = stocks[i];
    if (plantFilter && s.plantId !== plantFilter) continue;

    const existing = totals.get(s.materialId);
    const physical = s.unrestricted + s.qualityInspection + s.blocked;
    if (existing) {
      existing.unrestricted += s.unrestricted;
      existing.qualityInspection += s.qualityInspection;
      existing.blocked += s.blocked;
      existing.reserved += s.reserved;
      existing.totalPhysical += physical;
    } else {
      totals.set(s.materialId, {
        unrestricted: s.unrestricted,
        qualityInspection: s.qualityInspection,
        blocked: s.blocked,
        reserved: s.reserved,
        totalPhysical: physical
      });
    }
  }

  return totals;
}

/**
 * Builds an O(1) lookup Map for StorageLocations keyed by `${plantId}-${id}`.
 */
export function buildStorageLocationIndex(
  locations: readonly StorageLocation[]
): ReadonlyMap<string, StorageLocation> {
  const map = new Map<string, StorageLocation>();
  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    map.set(`${loc.plantId}-${loc.id}`, loc);
  }
  return map;
}
