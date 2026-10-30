export const FLOOR_PLAN_ASSET_PATHS = {
  residency2Bhk: 'assets/images/floor-2bhk.png',
  residency3Bhk: 'assets/images/floor-3bhk.png',
  heights2Bhk: 'assets/images/heights-2bhk.png',
  heights3Bhk: 'assets/images/heights-3bhk.png',
} as const;

export type FloorPlanAssetPath = (typeof FLOOR_PLAN_ASSET_PATHS)[keyof typeof FLOOR_PLAN_ASSET_PATHS];

// Add static require(...) sources here when the floor-plan files are available.
export const FLOOR_PLAN_IMAGE_SOURCES: Record<FloorPlanAssetPath, number | undefined> = {
  [FLOOR_PLAN_ASSET_PATHS.residency2Bhk]: undefined,
  [FLOOR_PLAN_ASSET_PATHS.residency3Bhk]: undefined,
  [FLOOR_PLAN_ASSET_PATHS.heights2Bhk]: undefined,
  [FLOOR_PLAN_ASSET_PATHS.heights3Bhk]: undefined,
};

export interface BuilderProject {
  id: string;
  name: string;
  location: string;
  progress: number;
  progressStage: string;
  totalUnits: number;
  availableUnits: number;
  priceRange: string;
  paymentPlan: string;
  cashDiscount?: string;
  startingEmi?: string;
  features: string[];
  floorPlans: {unitType: string; assetPath: FloorPlanAssetPath}[];
}

export const BUILDER_PROJECTS: BuilderProject[] = [
  {
    id: 'upright-residency-gulshan',
    name: 'Upright Residency',
    location: 'Gulshan-e-Iqbal Block 13-D, Near Maskan Chowrangi, Karachi',
    progress: 65,
    progressStage: 'Finishing stage',
    totalUnits: 24,
    availableUnits: 10,
    priceRange: 'Rs. 1.2 Crore - 1.85 Crore (2BHK & 3BHK)',
    paymentPlan: '30% down payment, remaining 70% in 24 monthly installments.',
    cashDiscount: '10% discount on full cash.',
    features: ['Lift', 'Standby Generator', 'Parking', 'CCTV'],
    floorPlans: [
      {unitType: '2BHK', assetPath: FLOOR_PLAN_ASSET_PATHS.residency2Bhk},
      {unitType: '3BHK', assetPath: FLOOR_PLAN_ASSET_PATHS.residency3Bhk},
    ],
  },
  {
    id: 'upright-heights-scheme-33',
    name: 'Upright Heights',
    location: 'Scheme 33, Near Safoora Chowrangi, Karachi',
    progress: 35,
    progressStage: 'Grey Structure Complete',
    totalUnits: 32,
    availableUnits: 20,
    priceRange: 'Rs. 95 Lac - 1.5 Crore',
    paymentPlan: '25% down payment, remaining 75% in 36 monthly installments.',
    startingEmi: 'Rs. 85,000/month',
    features: ['Mosque', 'Park Facing', '24/7 Security', 'Rooftop'],
    floorPlans: [
      {unitType: '2BHK', assetPath: FLOOR_PLAN_ASSET_PATHS.heights2Bhk},
      {unitType: '3BHK', assetPath: FLOOR_PLAN_ASSET_PATHS.heights3Bhk},
    ],
  },
];

export function getBuilderProjectById(id: string): BuilderProject | undefined {
  return BUILDER_PROJECTS.find(project => project.id === id);
}
