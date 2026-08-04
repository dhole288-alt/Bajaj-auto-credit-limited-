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

export interface MasterDatabase {
  dealers: Dealer[];
  vehicles: VehicleMaster[];
  dmaManagers: DmaManager[];
}
