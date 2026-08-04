import * as XLSX from 'xlsx';
import { VehicleMaster, DmaManager, Dealer, MasterDatabase } from '../types/masterData';

export async function parseVehicleExcel(file: File): Promise<VehicleMaster[]> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const json: any[] = XLSX.utils.sheet_to_json(worksheet);

  const vehicles: VehicleMaster[] = [];

  json.forEach((row, index) => {
    const skuCode = String(row['SKU Code'] || row['SKU'] || row['skuCode'] || `SKU${index + 1}`).trim().toUpperCase();
    const vehicleModel = String(row['Vehicle Model'] || row['Model'] || row['vehicleModel'] || 'Bajaj Motorcycle').trim();
    const variant = String(row['Variant'] || row['variant'] || 'Standard').trim();
    const color = String(row['Color'] || row['color'] || 'Black').trim();
    const exShowroomPrice = Number(row['Ex Showroom Price'] || row['ExShowroom'] || row['exShowroomPrice'] || 0);
    const onRoadPrice = Number(row['On Road Price'] || row['OnRoadPrice'] || row['Showroom ORP'] || row['onRoadPrice'] || 0);
    const category = String(row['Category'] || row['category'] || 'Two Wheeler').trim();

    if (vehicleModel) {
      vehicles.push({
        id: `veh-upload-${Date.now()}-${index}`,
        skuCode,
        vehicleModel,
        variant,
        color,
        exShowroomPrice,
        onRoadPrice,
        category,
        isActive: true,
      });
    }
  });

  return vehicles;
}

export function exportVehiclesToExcel(vehicles: VehicleMaster[]) {
  const exportData = vehicles.map((v) => ({
    'SKU Code': v.skuCode,
    'Vehicle Model': v.vehicleModel,
    'Variant': v.variant,
    'Color': v.color,
    'Ex Showroom Price': v.exShowroomPrice,
    'On Road Price': v.onRoadPrice,
    'Category': v.category,
    'Status': v.isActive ? 'Active' : 'Inactive',
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Vehicle Master');
  XLSX.writeFile(workbook, `Bajaj_Vehicle_Master_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportDmaToExcel(dmas: DmaManager[]) {
  const exportData = dmas.map((d) => ({
    'DMA Code': d.code,
    'DMA Manager Name': d.name,
    'Contact Number': d.contactNumber,
    'Status': d.isActive ? 'Active' : 'Inactive',
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'DMA Master');
  XLSX.writeFile(workbook, `Bajaj_DMA_Master_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportFullDatabaseBackup(masterDb: MasterDatabase, schemes: any[]) {
  const backupObj = {
    exportDate: new Date().toISOString(),
    version: '2.0-BAC',
    masterDatabase: masterDb,
    schemes: schemes,
  };

  const jsonStr = JSON.stringify(backupObj, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Bajaj_Auto_Credit_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
