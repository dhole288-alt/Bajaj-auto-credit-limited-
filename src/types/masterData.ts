export interface Branch {
  id: string;
  name: string;
  isActive: boolean;
}

export interface Dealer {
  id: string;
  name: string;
  branches: Branch[];
  isActive: boolean;
}

export interface VehicleMaster {
  id: string;
  skuCode: string;
  vehicleModel: string;
  variant: string;
  color: string;
  exShowroomPrice: number;
  onRoadPrice: number; // Showroom ORP
  category: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface DmaManager {
  id: string;
  name: string;
  code: string;
  contactNumber: string;
  isActive: boolean;
}

export interface UpfrontChargeMasterItem {
  id: string;
  code: string;
  name: string;
  chargeType: 'percentage' | 'fixed' | 'formula';
  defaultValue: number;
  percentage?: number;
  fixedAmount?: number;
  formula?: string;
  ruleBasis?: string;
  vehicleCategory?: string;
  tenureMonths?: string;
  displayOrder?: number;
  minCap?: number;
  maxCap?: number;
  isOptional: boolean;
  description: string;
  isActive: boolean;
}

export interface RsaPremiumMasterItem {
  id: string;
  categoryCode: 'commuter' | 'sports' | 'premium' | 'ev' | 'commercial';
  categoryName: string;
  tenureMinMonths: number;
  tenureMaxMonths: number;
  tenureLabel: string;
  premiumAmount: number;
  isActive: boolean;
}

export interface MasterDatabase {
  dealers: Dealer[];
  vehicles: VehicleMaster[];
  dmaManagers: DmaManager[];
  upfrontCharges: UpfrontChargeMasterItem[];
  rsaMaster?: RsaPremiumMasterItem[];
}
