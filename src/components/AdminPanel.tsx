import React, { useState } from 'react';
import { Scheme } from '../types/finance';
import { MasterDatabase, Dealer, VehicleMaster, DmaManager, Branch, UpfrontChargeMasterItem, RsaPremiumMasterItem } from '../types/masterData';
import { parseSchemeExcelFile, exportSchemesToExcel } from '../utils/excelParser';
import { parseVehicleExcel, exportVehiclesToExcel, exportDmaToExcel, exportFullDatabaseBackup } from '../utils/masterExcelParser';
import {
  Settings,
  Upload,
  Download,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  FileSpreadsheet,
  ShieldCheck,
  Percent,
  Search,
  Store,
  Car,
  BadgeCheck,
  Building2,
  MapPin,
  Database,
  Check,
  X,
  Phone,
  Hash,
  Tag,
  Layers,
  Sparkles,
  Coins,
  Calculator,
  Receipt,
  Wrench,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react';
import { BajajLogo } from './BajajLogo';

interface AdminPanelProps {
  schemes: Scheme[];
  setSchemes: React.Dispatch<React.SetStateAction<Scheme[]>>;
  masterDb: MasterDatabase;
  setMasterDb: React.Dispatch<React.SetStateAction<MasterDatabase>>;
  quotationRecords: any[];
  onResetDefaultSchemes: () => void;
  onResetDefaultMasterDb: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  schemes,
  setSchemes,
  masterDb,
  setMasterDb,
  onResetDefaultSchemes,
  onResetDefaultMasterDb,
}) => {
  const [adminSubTab, setAdminSubTab] = useState<'schemes' | 'dealers' | 'vehicles' | 'dma' | 'upfront' | 'rsa' | 'backup'>('vehicles');

  // Search queries
  const [branchSearch, setBranchSearch] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [dmaSearch, setDmaSearch] = useState('');
  const [upfrontSearch, setUpfrontSearch] = useState('');
  const [rsaSearch, setRsaSearch] = useState('');

  // Modals state
  const [editingScheme, setEditingScheme] = useState<Scheme | null>(null);
  const [isSchemeModalOpen, setIsSchemeModalOpen] = useState(false);

  const [editingVehicle, setEditingVehicle] = useState<VehicleMaster | null>(null);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);

  const [editingDma, setEditingDma] = useState<DmaManager | null>(null);
  const [isDmaModalOpen, setIsDmaModalOpen] = useState(false);

  const [editingDealer, setEditingDealer] = useState<Dealer | null>(null);
  const [isDealerModalOpen, setIsDealerModalOpen] = useState(false);

  const [editingUpfront, setEditingUpfront] = useState<UpfrontChargeMasterItem | null>(null);
  const [isUpfrontModalOpen, setIsUpfrontModalOpen] = useState(false);
  const [inlineUpfrontId, setInlineUpfrontId] = useState<string | null>(null);
  const [inlineUpfrontDraft, setInlineUpfrontDraft] = useState<UpfrontChargeMasterItem | null>(null);

  const [editingRsa, setEditingRsa] = useState<RsaPremiumMasterItem | null>(null);
  const [isRsaModalOpen, setIsRsaModalOpen] = useState(false);

  const [newBranchName, setNewBranchName] = useState('');

  // Excel Upload status
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Scheme Excel Upload Handler
  const handleSchemeFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('Parsing Schemes Excel file...');

    try {
      const parsedSchemes = await parseSchemeExcelFile(file);
      if (parsedSchemes.length === 0) {
        setUploadStatus('Error: No valid schemes found in uploaded Excel file.');
        setIsUploading(false);
        return;
      }

      setSchemes((prev) => {
        const existingCodes = new Set(prev.map((s) => s.schemeCode));
        const updated = [...prev];

        parsedSchemes.forEach((newScheme) => {
          if (existingCodes.has(newScheme.schemeCode)) {
            const idx = updated.findIndex((s) => s.schemeCode === newScheme.schemeCode);
            if (idx >= 0) updated[idx] = newScheme;
          } else {
            updated.unshift(newScheme);
          }
        });

        return updated;
      });

      setUploadStatus(`Success! Imported/updated ${parsedSchemes.length} schemes from Excel.`);
    } catch (err: any) {
      setUploadStatus(`Upload Error: ${err.message || 'Failed to parse file'}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Vehicle Excel Upload Handler
  const handleVehicleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('Parsing Vehicle Master Excel file...');

    try {
      const parsedVehicles = await parseVehicleExcel(file);
      if (parsedVehicles.length === 0) {
        setUploadStatus('Error: No valid vehicles found in uploaded Excel file.');
        setIsUploading(false);
        return;
      }

      setMasterDb((prev) => {
        const existingSkus = new Set(prev.vehicles.map((v) => v.skuCode));
        const updatedVehicles = [...prev.vehicles];

        parsedVehicles.forEach((newVeh) => {
          if (existingSkus.has(newVeh.skuCode)) {
            const idx = updatedVehicles.findIndex((v) => v.skuCode === newVeh.skuCode);
            if (idx >= 0) updatedVehicles[idx] = newVeh;
          } else {
            updatedVehicles.unshift(newVeh);
          }
        });

        return { ...prev, vehicles: updatedVehicles };
      });

      setUploadStatus(`Success! Imported ${parsedVehicles.length} vehicle models into Vehicle Master Database.`);
    } catch (err: any) {
      setUploadStatus(`Vehicle Excel Error: ${err.message || 'Failed to parse'}`);
    } finally {
      setIsUploading(false);
    }
  };

  // JSON Restore Handler
  const handleRestoreBackupJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (parsed.masterDatabase) {
        setMasterDb(parsed.masterDatabase);
      }
      if (parsed.schemes && Array.isArray(parsed.schemes)) {
        setSchemes(parsed.schemes);
      }
      alert('Full Database & Master Records restored successfully!');
    } catch (err: any) {
      alert(`Restore Error: Invalid Backup File (${err.message})`);
    }
  };

  // Scheme actions
  const handleToggleActiveScheme = (id: string) => {
    setSchemes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const handleDeleteScheme = (id: string) => {
    if (confirm('Are you sure you want to delete this scheme?')) {
      setSchemes((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleSaveSchemeModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScheme) return;

    const syncedScheme: Scheme = {
      ...editingScheme,
      tenureRoiMap: {
        12: editingScheme.roi12M ?? editingScheme.baseRoi,
        18: editingScheme.roi18M ?? editingScheme.baseRoi,
        24: editingScheme.roi24M ?? editingScheme.baseRoi,
        30: editingScheme.roi30M ?? editingScheme.baseRoi,
        36: editingScheme.roi36M ?? editingScheme.baseRoi,
        42: editingScheme.roi42M ?? editingScheme.baseRoi,
      },
    };

    setSchemes((prev) => {
      const idx = prev.findIndex((s) => s.id === syncedScheme.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = syncedScheme;
        return updated;
      }
      return [syncedScheme, ...prev];
    });

    setIsSchemeModalOpen(false);
    setEditingScheme(null);
  };

  const createNewScheme = () => {
    const newSch: Scheme = {
      id: `bac-sch-${Date.now()}`,
      schemeCode: `BAC-NEW-${Math.floor(Math.random() * 900) + 100}`,
      schemeName: 'Bajaj Auto Credit Custom Scheme',
      category: 'Standard',
      financeCompany: 'BAJAJ AUTO CREDIT LIMITED',
      minLtvPercent: 50,
      maxLtvPercent: 90,
      baseRoi: 9.5,
      roi12M: 7.99,
      roi18M: 8.49,
      roi24M: 8.99,
      roi30M: 9.25,
      roi36M: 9.50,
      roi42M: 9.99,
      tenureRoiMap: { 12: 7.99, 18: 8.49, 24: 8.99, 30: 9.25, 36: 9.50, 42: 9.99 },
      rateType: 'reducing',
      serviceChargeType: 'percentage',
      serviceChargeValue: 1.5,
      minServiceCharge: 1200,
      maxServiceCharge: 3500,
      stampDutyType: 'percentage',
      stampDutyValue: 0.25,
      additionalUpfrontCharges: 400,
      advanceEmiCount: 0,
      upfrontInterestPercent: 0,
      paCharge: 350,
      rsaCharge: 500,
      supportedTenures: [12, 18, 24, 30, 36, 42],
      isActive: true,
    };
    setEditingScheme(newSch);
    setIsSchemeModalOpen(true);
  };

  // Dealer & Branch actions
  const handleToggleDealerActive = (dealerId: string) => {
    setMasterDb((prev) => ({
      ...prev,
      dealers: prev.dealers.map((d) => (d.id === dealerId ? { ...d, isActive: !d.isActive } : d)),
    }));
  };

  const handleToggleBranchActive = (dealerId: string, branchId: string) => {
    setMasterDb((prev) => ({
      ...prev,
      dealers: prev.dealers.map((d) => {
        if (d.id !== dealerId) return d;
        return {
          ...d,
          branches: d.branches.map((b) => (b.id === branchId ? { ...b, isActive: !b.isActive } : b)),
        };
      }),
    }));
  };

  const handleAddBranchToDealer = (dealerId: string, branchName: string) => {
    if (!branchName.trim()) return;
    setMasterDb((prev) => ({
      ...prev,
      dealers: prev.dealers.map((d) => {
        if (d.id !== dealerId) return d;
        const newBranch: Branch = {
          id: `br-${Date.now()}`,
          name: branchName.trim(),
          isActive: true,
        };
        return {
          ...d,
          branches: [...d.branches, newBranch],
        };
      }),
    }));
    setNewBranchName('');
  };

  const handleDeleteBranch = (dealerId: string, branchId: string) => {
    if (confirm('Delete this branch from master list?')) {
      setMasterDb((prev) => ({
        ...prev,
        dealers: prev.dealers.map((d) => {
          if (d.id !== dealerId) return d;
          return {
            ...d,
            branches: d.branches.filter((b) => b.id !== branchId),
          };
        }),
      }));
    }
  };

  // Vehicle Master actions
  const handleSaveVehicleModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;

    setMasterDb((prev) => {
      const idx = prev.vehicles.findIndex((v) => v.id === editingVehicle.id);
      if (idx >= 0) {
        const updated = [...prev.vehicles];
        updated[idx] = editingVehicle;
        return { ...prev, vehicles: updated };
      }
      return { ...prev, vehicles: [editingVehicle, ...prev.vehicles] };
    });

    setIsVehicleModalOpen(false);
    setEditingVehicle(null);
  };

  const handleToggleVehicleActive = (id: string) => {
    setMasterDb((prev) => ({
      ...prev,
      vehicles: prev.vehicles.map((v) => (v.id === id ? { ...v, isActive: !v.isActive } : v)),
    }));
  };

  const handleDeleteVehicle = (id: string) => {
    if (confirm('Are you sure you want to delete this vehicle from Master DB?')) {
      setMasterDb((prev) => ({
        ...prev,
        vehicles: prev.vehicles.filter((v) => v.id !== id),
      }));
    }
  };

  const createNewVehicle = () => {
    const nextSkuNum = masterDb.vehicles.length + 1;
    const formattedSku = `SKU${nextSkuNum < 10 ? '00' : nextSkuNum < 100 ? '0' : ''}${nextSkuNum}`;
    const newVeh: VehicleMaster = {
      id: `veh-${Date.now()}`,
      skuCode: formattedSku,
      vehicleModel: 'New Pulsar Variant',
      variant: 'Standard ABS',
      color: 'Ebony Black',
      exShowroomPrice: 130000,
      onRoadPrice: 160000,
      category: 'Naked Sports',
      isActive: true,
    };
    setEditingVehicle(newVeh);
    setIsVehicleModalOpen(true);
  };

  // DMA Manager actions
  const handleSaveDmaModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDma) return;

    setMasterDb((prev) => {
      const idx = prev.dmaManagers.findIndex((d) => d.id === editingDma.id);
      if (idx >= 0) {
        const updated = [...prev.dmaManagers];
        updated[idx] = editingDma;
        return { ...prev, dmaManagers: updated };
      }
      return { ...prev, dmaManagers: [editingDma, ...prev.dmaManagers] };
    });

    setIsDmaModalOpen(false);
    setEditingDma(null);
  };

  const handleToggleDmaActive = (id: string) => {
    setMasterDb((prev) => ({
      ...prev,
      dmaManagers: prev.dmaManagers.map((d) => (d.id === id ? { ...d, isActive: !d.isActive } : d)),
    }));
  };

  const handleDeleteDma = (id: string) => {
    if (confirm('Delete this DMA Manager from Master Database?')) {
      setMasterDb((prev) => ({
        ...prev,
        dmaManagers: prev.dmaManagers.filter((d) => d.id !== id),
      }));
    }
  };

  const createNewDma = () => {
    const count = masterDb.dmaManagers.length + 1;
    const code = `DMA${count < 10 ? '00' : count < 100 ? '0' : ''}${count}`;
    const newDma: DmaManager = {
      id: `dma-${Date.now()}`,
      name: 'New DMA Manager',
      code,
      contactNumber: '9876543210',
      isActive: true,
    };
    setEditingDma(newDma);
    setIsDmaModalOpen(true);
  };

  // Upfront Charges Master actions
  const handleSaveUpfrontModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUpfront) return;

    setMasterDb((prev) => {
      const currentUpfronts = prev.upfrontCharges || [];
      const idx = currentUpfronts.findIndex((u) => u.id === editingUpfront.id);
      if (idx >= 0) {
        const updated = [...currentUpfronts];
        updated[idx] = editingUpfront;
        return { ...prev, upfrontCharges: updated };
      }
      return { ...prev, upfrontCharges: [editingUpfront, ...currentUpfronts] };
    });

    setIsUpfrontModalOpen(false);
    setEditingUpfront(null);
  };

  const handleToggleUpfrontActive = (id: string) => {
    setMasterDb((prev) => ({
      ...prev,
      upfrontCharges: (prev.upfrontCharges || []).map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u)),
    }));
  };

  const handleDeleteUpfrontCharge = (id: string) => {
    if (confirm('Delete this Upfront Charge component from Master Database?')) {
      setMasterDb((prev) => ({
        ...prev,
        upfrontCharges: (prev.upfrontCharges || []).filter((u) => u.id !== id),
      }));
    }
  };

  const createNewUpfrontCharge = () => {
    const newUpfront: UpfrontChargeMasterItem = {
      id: `uf-${Date.now()}`,
      code: `CHARGE_${(masterDb.upfrontCharges || []).length + 1}`,
      name: 'Custom Upfront Fee Component',
      chargeType: 'fixed',
      defaultValue: 500,
      isOptional: true,
      description: 'Custom upfront charge added by Admin',
      isActive: true,
    };
    setEditingUpfront(newUpfront);
    setIsUpfrontModalOpen(true);
  };

  // Filtered lists
  const filteredVehicles = masterDb.vehicles.filter(
    (v) =>
      v.skuCode.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
      v.vehicleModel.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
      v.category.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
      v.color.toLowerCase().includes(vehicleSearch.toLowerCase())
  );

  const filteredDmas = masterDb.dmaManagers.filter(
    (d) =>
      d.name.toLowerCase().includes(dmaSearch.toLowerCase()) ||
      d.code.toLowerCase().includes(dmaSearch.toLowerCase()) ||
      d.contactNumber.includes(dmaSearch)
  );

  const filteredUpfronts = (masterDb.upfrontCharges || []).filter(
    (u) =>
      u.name.toLowerCase().includes(upfrontSearch.toLowerCase()) ||
      u.code.toLowerCase().includes(upfrontSearch.toLowerCase()) ||
      u.description.toLowerCase().includes(upfrontSearch.toLowerCase())
  );

  const handleToggleRsaActive = (id: string) => {
    setMasterDb((prev) => ({
      ...prev,
      rsaMaster: (prev.rsaMaster || []).map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r)),
    }));
  };

  const handleDeleteRsaItem = (id: string) => {
    if (confirm('Delete this RSA rate slab from Master?')) {
      setMasterDb((prev) => ({
        ...prev,
        rsaMaster: (prev.rsaMaster || []).filter((r) => r.id !== id),
      }));
    }
  };

  const handleSaveRsaModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRsa) return;

    setMasterDb((prev) => {
      const list = prev.rsaMaster || [];
      const idx = list.findIndex((r) => r.id === editingRsa.id);
      let updated = [...list];
      if (idx >= 0) {
        updated[idx] = editingRsa;
      } else {
        updated = [editingRsa, ...updated];
      }
      return { ...prev, rsaMaster: updated };
    });

    setIsRsaModalOpen(false);
    setEditingRsa(null);
  };

  const createNewRsaRate = () => {
    setEditingRsa({
      id: `rsa-${Date.now()}`,
      categoryCode: 'sports',
      categoryName: 'Sports / Executive (150-250cc)',
      tenureMinMonths: 25,
      tenureMaxMonths: 36,
      tenureLabel: '25 to 36 Months (3 Yrs)',
      premiumAmount: 1100,
      isActive: true,
    });
    setIsRsaModalOpen(true);
  };

  const filteredRsa = (masterDb.rsaMaster || []).filter(
    (r) =>
      r.categoryName.toLowerCase().includes(rsaSearch.toLowerCase()) ||
      r.categoryCode.toLowerCase().includes(rsaSearch.toLowerCase()) ||
      r.tenureLabel.toLowerCase().includes(rsaSearch.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      {/* Header Banner - Official Bajaj Auto Credit Portal Theme */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center space-x-3.5">
          <BajajLogo size="lg" />
          <div>
            <span className="text-xs font-black text-[#024b9c] dark:text-blue-400 uppercase tracking-widest flex items-center space-x-1">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>BAJAJ AUTO CREDIT LIMITED • ADMIN MASTER CONTROL</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center space-x-2 mt-0.5">
              <span>Admin Managed Master Database Engine</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Configure Dealerships, Branches, Vehicle SKUs, DMA Managers, and Interest Rate Schemes
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onResetDefaultMasterDb}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center space-x-1 border border-slate-200 dark:border-slate-700"
            title="Reset Master DB"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Master DB</span>
          </button>

          <button
            type="button"
            onClick={() => exportFullDatabaseBackup(masterDb, schemes)}
            className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 text-[#024b9c] dark:text-blue-300 font-extrabold text-xs flex items-center space-x-1.5 border border-blue-200 dark:border-slate-700 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Full DB Backup</span>
          </button>
        </div>
      </div>

      {/* Admin Sub-Tabs Navigation */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setAdminSubTab('vehicles')}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center space-x-2 whitespace-nowrap ${
            adminSubTab === 'vehicles'
              ? 'bg-[#024b9c] text-white shadow-md glow-blue'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Vehicle Master ({masterDb.vehicles.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminSubTab('dealers')}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center space-x-2 whitespace-nowrap ${
            adminSubTab === 'dealers'
              ? 'bg-[#024b9c] text-white shadow-md glow-blue'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Dealers & Branches</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminSubTab('dma')}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center space-x-2 whitespace-nowrap ${
            adminSubTab === 'dma'
              ? 'bg-[#024b9c] text-white shadow-md glow-blue'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <BadgeCheck className="w-4 h-4" />
          <span>DMA Managers ({masterDb.dmaManagers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminSubTab('upfront')}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center space-x-2 whitespace-nowrap ${
            adminSubTab === 'upfront'
              ? 'bg-[#024b9c] text-white shadow-md glow-blue'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>Upfront Charges Master ({(masterDb.upfrontCharges || []).length})</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminSubTab('rsa')}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center space-x-2 whitespace-nowrap ${
            adminSubTab === 'rsa'
              ? 'bg-[#024b9c] text-white shadow-md glow-blue'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Wrench className="w-4 h-4 text-amber-500" />
          <span>RSA Premium Matrix ({(masterDb.rsaMaster || []).length})</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminSubTab('schemes')}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center space-x-2 whitespace-nowrap ${
            adminSubTab === 'schemes'
              ? 'bg-[#024b9c] text-white shadow-md glow-blue'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>Scheme & ROI Master ({schemes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminSubTab('backup')}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center space-x-2 whitespace-nowrap ${
            adminSubTab === 'backup'
              ? 'bg-[#024b9c] text-white shadow-md glow-blue'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Backup & Restore</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* SUB-TAB 1: VEHICLE MASTER DATABASE */}
      {/* ======================================================== */}
      {adminSubTab === 'vehicles' && (
        <div className="space-y-4 animate-fade-in">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-blue-50/70 dark:bg-slate-800/60 p-4 rounded-2xl border border-blue-100 dark:border-slate-800">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 py-0 my-auto top-0 bottom-0" />
              <input
                type="text"
                placeholder="Search by SKU Code or Model..."
                value={vehicleSearch}
                onChange={(e) => setVehicleSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={createNewVehicle}
                className="px-4 py-2 rounded-xl bg-[#024b9c] hover:bg-blue-800 text-white font-extrabold text-xs shadow-md flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Vehicle SKU</span>
              </button>

              <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md flex items-center space-x-1.5">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Upload Excel</span>
                <input type="file" accept=".xlsx, .xls" onChange={handleVehicleFileUpload} className="hidden" />
              </label>

              <button
                type="button"
                onClick={() => exportVehiclesToExcel(masterDb.vehicles)}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>

          {/* Vehicles Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#024b9c] text-white font-extrabold">
                  <tr>
                    <th className="p-3">SKU Code</th>
                    <th className="p-3">Vehicle Model</th>
                    <th className="p-3">Variant</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Color</th>
                    <th className="p-3">Ex-Showroom Price</th>
                    <th className="p-3">Showroom On-Road Price</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredVehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3 font-mono font-black text-[#024b9c] dark:text-blue-400">{v.skuCode}</td>
                      <td className="p-3 font-extrabold text-slate-900 dark:text-white">{v.vehicleModel}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300 font-medium">{v.variant}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-[#024b9c] dark:text-blue-300 font-bold text-[10px]">
                          {v.category}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{v.color}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        ₹{v.exShowroomPrice.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 font-black text-[#024b9c] dark:text-blue-400">
                        ₹{v.onRoadPrice.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleVehicleActive(v.id)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            v.isActive ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {v.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingVehicle(v);
                              setIsVehicleModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-[#024b9c] hover:bg-blue-200"
                            title="Edit Vehicle"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteVehicle(v.id)}
                            className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950 text-red-600 hover:bg-red-100"
                            title="Delete Vehicle"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredVehicles.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400 font-bold">
                        No vehicle models found matching "{vehicleSearch}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 2: DEALERS & BRANCHES MASTER */}
      {/* ======================================================== */}
      {adminSubTab === 'dealers' && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-[#024b9c] dark:text-blue-300 flex items-center space-x-2">
                <Store className="w-4 h-4" />
                <span>Manage Dealerships & Branch Locations</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Add, edit, or search branches. Default: Wasan & Sons with 7 active branches.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {masterDb.dealers.map((dealer) => (
              <div
                key={dealer.id}
                className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 space-y-4 shadow-sm"
              >
                {/* Dealer Title Bar */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="p-2 rounded-xl bg-[#024b9c] text-white font-bold">
                      <Building2 className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-base font-black text-slate-900 dark:text-white">{dealer.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">{dealer.branches.length} Registered Branches</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleDealerActive(dealer.id)}
                    className={`px-3 py-1 rounded-full text-xs font-black ${
                      dealer.isActive ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {dealer.isActive ? 'Dealer Active' : 'Dealer Disabled'}
                  </button>
                </div>

                {/* Add Branch Input */}
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Add new branch location..."
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddBranchToDealer(dealer.id, newBranchName)}
                    className="px-3 py-2 rounded-xl bg-[#024b9c] text-white font-extrabold text-xs shadow-xs"
                  >
                    + Add Branch
                  </button>
                </div>

                {/* Branches List */}
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {dealer.branches.map((br) => (
                    <div
                      key={br.id}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-2xs"
                    >
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3.5 h-3.5 text-[#024b9c]" />
                        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{br.name}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleToggleBranchActive(dealer.id, br.id)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            br.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {br.isActive ? 'Active' : 'Inactive'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBranch(dealer.id, br.id)}
                          className="p-1 rounded-lg text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 3: DMA MANAGERS DATABASE */}
      {/* ======================================================== */}
      {adminSubTab === 'dma' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-blue-50/70 dark:bg-slate-800/60 p-4 rounded-2xl border border-blue-100 dark:border-slate-800">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 py-0 my-auto top-0 bottom-0" />
              <input
                type="text"
                placeholder="Search DMA Name or Code..."
                value={dmaSearch}
                onChange={(e) => setDmaSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={createNewDma}
                className="px-4 py-2 rounded-xl bg-[#024b9c] text-white font-extrabold text-xs shadow-md flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add DMA Manager</span>
              </button>

              <button
                type="button"
                onClick={() => exportDmaToExcel(masterDb.dmaManagers)}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#024b9c] text-white font-extrabold">
                <tr>
                  <th className="p-3">DMA Code</th>
                  <th className="p-3">DMA Manager Name</th>
                  <th className="p-3">Contact Number</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredDmas.map((d) => (
                  <tr key={d.id} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-mono font-black text-[#024b9c] dark:text-blue-400">{d.code}</td>
                    <td className="p-3 font-extrabold text-slate-900 dark:text-white">{d.name}</td>
                    <td className="p-3 font-extrabold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                      <Phone className="w-3 h-3 text-[#024b9c]" />
                      <span>{d.contactNumber}</span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleDmaActive(d.id)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          d.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {d.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingDma(d);
                            setIsDmaModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-blue-100 text-[#024b9c]"
                          title="Edit DMA"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDma(d.id)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600"
                          title="Delete DMA"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB: UPFRONT CHARGES MASTER */}
      {/* ======================================================== */}
      {adminSubTab === 'upfront' && (
        <div className="space-y-6 animate-fade-in">
          {/* Formula Reference Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-900 via-[#024b9c] to-blue-900 text-white shadow-lg space-y-3">
            <div className="flex items-center space-x-2 text-amber-400 font-black text-xs uppercase tracking-widest">
              <Calculator className="w-4 h-4" />
              <span>Standard Upfront Charges Master Formula</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                <span className="text-amber-300 font-extrabold block mb-0.5">Processing Fee (PF)</span>
                <code className="text-white font-mono font-bold">Processing Fee = Loan Amount × PF%</code>
              </div>

              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                <span className="text-amber-300 font-extrabold block mb-0.5">Stamp Duty & Legal</span>
                <code className="text-white font-mono font-bold">Stamp Duty = Loan Amount × Stamp Duty %</code>
              </div>

              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                <span className="text-amber-300 font-extrabold block mb-0.5">Documentation Charges</span>
                <code className="text-white font-mono font-bold">Documentation = Fixed Amount</code>
              </div>

              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                <span className="text-amber-300 font-extrabold block mb-0.5">PA Insurance</span>
                <code className="text-white font-mono font-bold">PA Insurance = Fixed Amount</code>
              </div>

              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                <span className="text-amber-300 font-extrabold block mb-0.5">Road Side Assistance (RSA)</span>
                <code className="text-white font-mono font-bold">RSA = Fixed Amount</code>
              </div>

              <div className="p-3 rounded-2xl bg-amber-400/20 backdrop-blur-md border border-amber-400/40 col-span-1 md:col-span-2 lg:col-span-1">
                <span className="text-amber-300 font-black block mb-0.5">Total Upfront Charges Sum</span>
                <code className="text-amber-200 font-mono font-extrabold text-[11px]">
                  PF + Stamp Duty + Doc + PA + RSA + Advance EMI
                </code>
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-blue-50/70 dark:bg-slate-800/60 p-4 rounded-2xl border border-blue-100 dark:border-slate-800">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 py-0 my-auto top-0 bottom-0" />
              <input
                type="text"
                placeholder="Search charge name or code..."
                value={upfrontSearch}
                onChange={(e) => setUpfrontSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="button"
              onClick={createNewUpfrontCharge}
              className="px-4 py-2 rounded-xl bg-[#024b9c] text-white font-extrabold text-xs shadow-md flex items-center space-x-1.5 w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              <span>Add Upfront Charge Component</span>
            </button>
          </div>

          {/* Upfront Charges Master Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#024b9c] text-white font-extrabold">
                  <tr>
                    <th className="p-3">Charge Code</th>
                    <th className="p-3">Component Name</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Default Rate / Amount</th>
                    <th className="p-3">Calculation Formula</th>
                    <th className="p-3 text-center">Optional</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredUpfronts.map((u) => (
                    <tr key={u.id} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3 font-mono font-black text-[#024b9c] dark:text-blue-400">{u.code}</td>
                      <td className="p-3 font-extrabold text-slate-900 dark:text-white">
                        <div>{u.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{u.description}</div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.chargeType === 'percentage'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {u.chargeType === 'percentage' ? 'Percentage (%)' : 'Fixed Rupee (₹)'}
                        </span>
                      </td>
                      <td className="p-3 font-black text-slate-900 dark:text-white">
                        {u.chargeType === 'percentage' ? `${u.defaultValue}%` : `₹${u.defaultValue.toLocaleString('en-IN')}`}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300 font-medium italic">
                        {u.chargeType === 'percentage' ? `Loan Amount × ${u.defaultValue}%` : `Fixed ₹${u.defaultValue}`}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.isOptional ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {u.isOptional ? 'Optional' : 'Mandatory'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleUpfrontActive(u.id)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            u.isActive ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {u.isActive ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingUpfront(u);
                              setIsUpfrontModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-[#024b9c]"
                            title="Edit Upfront Component"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUpfrontCharge(u.id)}
                            className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950 text-red-600"
                            title="Delete Component"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUpfronts.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 font-bold">
                        No upfront charge items found matching "{upfrontSearch}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB: RSA PREMIUM MATRIX MASTER */}
      {/* ======================================================== */}
      {adminSubTab === 'rsa' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-slate-800/60 border border-amber-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-amber-900 dark:text-amber-300 flex items-center space-x-1.5">
                <Wrench className="w-4 h-4 text-amber-500" />
                <span>Roadside Assistance (RSA) Premium Matrix Master</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Configure RSA Premium rates slab matrix per Vehicle Category and Tenure Duration
              </p>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Category / Tenure..."
                  value={rsaSearch}
                  onChange={(e) => setRsaSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                />
              </div>

              <button
                type="button"
                onClick={createNewRsaRate}
                className="px-3.5 py-1.5 rounded-xl bg-[#024b9c] text-white font-extrabold text-xs shadow-md shrink-0 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add RSA Rate Slab</span>
              </button>
            </div>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#024b9c] text-white font-extrabold">
                  <tr>
                    <th className="p-3">Vehicle Category Code</th>
                    <th className="p-3">Category Name</th>
                    <th className="p-3">Tenure Slab (Months)</th>
                    <th className="p-3 text-right">RSA Premium (₹)</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredRsa.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-mono font-bold text-[#024b9c] dark:text-blue-400">
                        {r.categoryCode.toUpperCase()}
                      </td>
                      <td className="p-3 font-extrabold text-slate-900 dark:text-white">
                        {r.categoryName}
                      </td>
                      <td className="p-3 font-bold text-slate-700 dark:text-slate-300">
                        {r.tenureLabel} ({r.tenureMinMonths} - {r.tenureMaxMonths}M)
                      </td>
                      <td className="p-3 text-right font-black text-amber-600 dark:text-amber-400 text-sm">
                        ₹{r.premiumAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleRsaActive(r.id)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            r.isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                          }`}
                        >
                          {r.isActive ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingRsa(r);
                              setIsRsaModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-[#024b9c]"
                            title="Edit RSA Slab"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRsaItem(r.id)}
                            className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950 text-red-600"
                            title="Delete Slab"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredRsa.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">
                        No RSA slabs found matching "{rsaSearch}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 4: SCHEME & ROI MASTER */}
      {/* ======================================================== */}
      {adminSubTab === 'schemes' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-[#024b9c] dark:text-blue-300">
                Scheme Master & Year-Wise ROI Manager
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Configure 12M, 18M, 24M, 30M, 36M, 42M rates, LTV caps, processing charges.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={createNewScheme}
                className="px-4 py-2 rounded-xl bg-[#024b9c] text-white font-extrabold text-xs shadow-md"
              >
                + Add New Scheme
              </button>

              <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-emerald-700 text-white font-extrabold text-xs shadow-md">
                Upload Scheme Excel
                <input type="file" accept=".xlsx, .xls" onChange={handleSchemeFileUpload} className="hidden" />
              </label>

              <button
                type="button"
                onClick={() => exportSchemesToExcel(schemes)}
                className="px-3.5 py-2 rounded-xl bg-white text-slate-700 font-bold text-xs border"
              >
                Export Excel
              </button>
            </div>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#024b9c] text-white font-extrabold">
                  <tr>
                    <th className="p-3">Scheme Code</th>
                    <th className="p-3">Scheme Name</th>
                    <th className="p-3">Max LTV %</th>
                    <th className="p-3 text-center">12M</th>
                    <th className="p-3 text-center">18M</th>
                    <th className="p-3 text-center">24M</th>
                    <th className="p-3 text-center">30M</th>
                    <th className="p-3 text-center">36M</th>
                    <th className="p-3 text-center">42M</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {schemes.map((s) => (
                    <tr key={s.id} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-mono font-black text-[#024b9c] dark:text-blue-400">{s.schemeCode}</td>
                      <td className="p-3 font-extrabold text-slate-900 dark:text-white">{s.schemeName}</td>
                      <td className="p-3 font-black text-slate-900 dark:text-white">{s.maxLtvPercent}%</td>
                      <td className="p-3 text-center font-bold text-blue-900 dark:text-blue-300">{s.roi12M ?? s.baseRoi}%</td>
                      <td className="p-3 text-center font-bold text-blue-900 dark:text-blue-300">{s.roi18M ?? s.baseRoi}%</td>
                      <td className="p-3 text-center font-bold text-blue-900 dark:text-blue-300">{s.roi24M ?? s.baseRoi}%</td>
                      <td className="p-3 text-center font-bold text-blue-900 dark:text-blue-300">{s.roi30M ?? s.baseRoi}%</td>
                      <td className="p-3 text-center font-bold text-blue-900 dark:text-blue-300">{s.roi36M ?? s.baseRoi}%</td>
                      <td className="p-3 text-center font-bold text-blue-900 dark:text-blue-300">{s.roi42M ?? s.baseRoi}%</td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActiveScheme(s.id)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            s.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {s.isActive ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingScheme(s);
                              setIsSchemeModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-blue-100 text-[#024b9c]"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteScheme(s.id)}
                            className="p-1.5 rounded-lg bg-red-50 text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 5: BACKUP & RESTORE */}
      {/* ======================================================== */}
      {adminSubTab === 'backup' && (
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-6">
          <div className="flex items-center space-x-3">
            <span className="p-3 rounded-2xl bg-[#024b9c] text-white">
              <Database className="w-6 h-6" />
            </span>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Master Backup & Restore Engine</h3>
              <p className="text-xs text-slate-500 font-medium">Export or restore full application database JSON backups</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-black text-[#024b9c]">Export Full Database</h4>
              <p className="text-xs text-slate-500 font-medium">
                Downloads all Vehicles, DMAs, Dealers, Branches, and Scheme interest rates as a backup JSON file.
              </p>
              <button
                type="button"
                onClick={() => exportFullDatabaseBackup(masterDb, schemes)}
                className="w-full py-2.5 rounded-xl bg-[#024b9c] text-white font-extrabold text-xs shadow-md"
              >
                Download Master Backup (.json)
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-black text-emerald-700">Restore From Backup File</h4>
              <p className="text-xs text-slate-500 font-medium">
                Upload a previously saved .json backup file to restore complete database state instantly.
              </p>
              <label className="cursor-pointer block text-center py-2.5 rounded-xl bg-emerald-700 text-white font-extrabold text-xs shadow-md">
                Choose Backup JSON File
                <input type="file" accept=".json" onChange={handleRestoreBackupJson} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* EDIT VEHICLE MODAL */}
      {/* ======================================================== */}
      {isVehicleModalOpen && editingVehicle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveVehicleModal}
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 border-2 border-[#024b9c] shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Edit Vehicle Master: {editingVehicle.skuCode}
              </h3>
              <button type="button" onClick={() => setIsVehicleModalOpen(false)} className="text-slate-400 font-bold">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">SKU Code</label>
                <input
                  type="text"
                  required
                  value={editingVehicle.skuCode}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, skuCode: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Vehicle Model Name</label>
                <input
                  type="text"
                  required
                  value={editingVehicle.vehicleModel}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, vehicleModel: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Variant Name</label>
                <input
                  type="text"
                  value={editingVehicle.variant}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, variant: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                <input
                  type="text"
                  value={editingVehicle.category}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Color Name</label>
                <input
                  type="text"
                  value={editingVehicle.color}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, color: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Ex-Showroom Price (₹)</label>
                <input
                  type="number"
                  required
                  value={editingVehicle.exShowroomPrice}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, exShowroomPrice: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Showroom On-Road Price (₹) (Auto-Populates Calculator)
                </label>
                <input
                  type="number"
                  required
                  value={editingVehicle.onRoadPrice}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, onRoadPrice: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-blue-50 text-blue-900 border-2 border-blue-300 font-black text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsVehicleModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-xs"
              >
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 rounded-xl bg-[#024b9c] text-white font-extrabold text-xs shadow-md">
                Save Vehicle Master
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* EDIT DMA MODAL */}
      {/* ======================================================== */}
      {isDmaModalOpen && editingDma && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveDmaModal}
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border-2 border-[#024b9c] shadow-2xl space-y-4 text-xs"
          >
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Edit DMA Manager Details</h3>
              <button type="button" onClick={() => setIsDmaModalOpen(false)} className="text-slate-400 font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">DMA Code</label>
                <input
                  type="text"
                  required
                  value={editingDma.code}
                  onChange={(e) => setEditingDma({ ...editingDma, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">DMA Manager Full Name</label>
                <input
                  type="text"
                  required
                  value={editingDma.name}
                  onChange={(e) => setEditingDma({ ...editingDma, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">DMA Contact Number</label>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  value={editingDma.contactNumber}
                  onChange={(e) => setEditingDma({ ...editingDma, contactNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsDmaModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-xs"
              >
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 rounded-xl bg-[#024b9c] text-white font-extrabold text-xs shadow-md">
                Save DMA Manager
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT SCHEME MODAL (Intact) */}
      {isSchemeModalOpen && editingScheme && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveSchemeModal}
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 border-2 border-[#024b9c] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-extrabold">Edit Scheme & Year-Wise Rates: {editingScheme.schemeCode}</h3>
              <button type="button" onClick={() => setIsSchemeModalOpen(false)} className="text-slate-400 font-bold">
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 space-y-2">
              <h4 className="text-xs font-black uppercase text-[#024b9c]">Year-Wise Interest Rates (ROI % p.a.)</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
                <div>
                  <label className="font-bold block mb-1">12M (1 YR)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingScheme.roi12M ?? editingScheme.baseRoi}
                    onChange={(e) => setEditingScheme({ ...editingScheme, roi12M: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg font-black text-center"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">18M (1.5 YR)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingScheme.roi18M ?? editingScheme.baseRoi}
                    onChange={(e) => setEditingScheme({ ...editingScheme, roi18M: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg font-black text-center"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">24M (2 YR)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingScheme.roi24M ?? editingScheme.baseRoi}
                    onChange={(e) => setEditingScheme({ ...editingScheme, roi24M: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg font-black text-center"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">30M (2.5 YR)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingScheme.roi30M ?? editingScheme.baseRoi}
                    onChange={(e) => setEditingScheme({ ...editingScheme, roi30M: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg font-black text-center"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">36M (3 YR)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingScheme.roi36M ?? editingScheme.baseRoi}
                    onChange={(e) => setEditingScheme({ ...editingScheme, roi36M: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg font-black text-center"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">42M (3.5 YR)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingScheme.roi42M ?? editingScheme.baseRoi}
                    onChange={(e) => setEditingScheme({ ...editingScheme, roi42M: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg font-black text-center"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Scheme Code</label>
                <input
                  type="text"
                  required
                  value={editingScheme.schemeCode}
                  onChange={(e) => setEditingScheme({ ...editingScheme, schemeCode: e.target.value.toUpperCase() })}
                  className="w-full p-2 border rounded-lg font-mono font-bold"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Scheme Name</label>
                <input
                  type="text"
                  required
                  value={editingScheme.schemeName}
                  onChange={(e) => setEditingScheme({ ...editingScheme, schemeName: e.target.value })}
                  className="w-full p-2 border rounded-lg font-bold"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Max LTV %</label>
                <input
                  type="number"
                  required
                  value={editingScheme.maxLtvPercent}
                  onChange={(e) => setEditingScheme({ ...editingScheme, maxLtvPercent: Number(e.target.value) })}
                  className="w-full p-2 border rounded-lg font-bold"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Base ROI %</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editingScheme.baseRoi}
                  onChange={(e) => setEditingScheme({ ...editingScheme, baseRoi: Number(e.target.value) })}
                  className="w-full p-2 border rounded-lg font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t">
              <button type="button" onClick={() => setIsSchemeModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-[#024b9c] text-white rounded-xl font-extrabold shadow-md">
                Save Scheme
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Upfront Charge Edit Modal */}
      {isUpfrontModalOpen && editingUpfront && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-[#024b9c] dark:text-blue-400 flex items-center space-x-2">
                <Coins className="w-5 h-5 text-amber-500" />
                <span>Manage Upfront Charge Master Component</span>
              </h3>
              <button type="button" onClick={() => setIsUpfrontModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUpfrontModal} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Charge Code</label>
                  <input
                    type="text"
                    required
                    value={editingUpfront.code}
                    onChange={(e) => setEditingUpfront({ ...editingUpfront, code: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-extrabold"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Calculation Type</label>
                  <select
                    value={editingUpfront.chargeType}
                    onChange={(e) =>
                      setEditingUpfront({ ...editingUpfront, chargeType: e.target.value as 'percentage' | 'fixed' })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  >
                    <option value="percentage">Percentage (%) of Loan Amount</option>
                    <option value="fixed">Fixed Rupee Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Component Name</label>
                <input
                  type="text"
                  required
                  value={editingUpfront.name}
                  onChange={(e) => setEditingUpfront({ ...editingUpfront, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-extrabold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">
                    {editingUpfront.chargeType === 'percentage' ? 'Default Percentage (%)' : 'Default Fixed Rupee Amount (₹)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingUpfront.defaultValue}
                    onChange={(e) => setEditingUpfront({ ...editingUpfront, defaultValue: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-black text-blue-900 dark:text-blue-300"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Charge Inclusion</label>
                  <select
                    value={editingUpfront.isOptional ? 'optional' : 'mandatory'}
                    onChange={(e) => setEditingUpfront({ ...editingUpfront, isOptional: e.target.value === 'optional' })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  >
                    <option value="mandatory">Mandatory (Required for all loans)</option>
                    <option value="optional">Optional (Customer can toggle on/off)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Formula & Description</label>
                <input
                  type="text"
                  value={editingUpfront.description}
                  onChange={(e) => setEditingUpfront({ ...editingUpfront, description: e.target.value })}
                  placeholder="e.g. Processing Fee = Loan Amount × PF%"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUpfrontModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-[#024b9c] text-white rounded-xl font-extrabold shadow-md">
                  Save Upfront Charge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit / Add RSA Premium Master Slab */}
      {isRsaModalOpen && editingRsa && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="text-sm font-black text-[#024b9c] dark:text-blue-300 flex items-center space-x-2">
                <Wrench className="w-4 h-4 text-amber-500" />
                <span>Configure RSA Premium Rate Slab</span>
              </h3>
              <button type="button" onClick={() => setIsRsaModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRsaModal} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Vehicle Category Code</label>
                  <select
                    value={editingRsa.categoryCode}
                    onChange={(e) => {
                      const code = e.target.value as any;
                      let name = 'Sports / Executive (150-250cc)';
                      if (code === 'commuter') name = 'Commuter / Scooter (<125cc)';
                      if (code === 'premium') name = 'Premium / Superbike (300cc+)';
                      if (code === 'ev') name = 'Electric Vehicle (EV / Chetak)';
                      if (code === 'commercial') name = 'Commercial / 3-Wheeler (RE/Maxima)';
                      setEditingRsa({ ...editingRsa, categoryCode: code, categoryName: name });
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  >
                    <option value="commuter">Commuter / Scooter (&lt;125cc)</option>
                    <option value="sports">Sports / Executive (150-250cc)</option>
                    <option value="premium">Premium / Superbike (300cc+)</option>
                    <option value="ev">Electric / EV (Chetak)</option>
                    <option value="commercial">Commercial / 3-Wheeler (RE/Maxima)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Category Display Name</label>
                  <input
                    type="text"
                    required
                    value={editingRsa.categoryName}
                    onChange={(e) => setEditingRsa({ ...editingRsa, categoryName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Tenure Min Months</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingRsa.tenureMinMonths}
                    onChange={(e) => setEditingRsa({ ...editingRsa, tenureMinMonths: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Tenure Max Months</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingRsa.tenureMaxMonths}
                    onChange={(e) => setEditingRsa({ ...editingRsa, tenureMaxMonths: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Tenure Display Label</label>
                <input
                  type="text"
                  required
                  value={editingRsa.tenureLabel}
                  onChange={(e) => setEditingRsa({ ...editingRsa, tenureLabel: e.target.value })}
                  placeholder="e.g. 25 to 36 Months (3 Yrs)"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">RSA Premium Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingRsa.premiumAmount}
                    onChange={(e) => setEditingRsa({ ...editingRsa, premiumAmount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-black text-amber-600 dark:text-amber-400 text-sm"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Slab Status</label>
                  <select
                    value={editingRsa.isActive ? 'active' : 'disabled'}
                    onChange={(e) => setEditingRsa({ ...editingRsa, isActive: e.target.value === 'active' })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  >
                    <option value="active">Active (Include in Calculator)</option>
                    <option value="disabled">Disabled (Do Not Apply)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRsaModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-[#024b9c] text-white rounded-xl font-extrabold shadow-md">
                  Save RSA Rate Slab
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
