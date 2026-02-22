export const TAX_CONSTANTS = {
  WHT_RESIDENT: 0.10,
  WHT_NON_RESIDENT: 0.20,
  NHI_RATE: 0.0211,
  PRACTICE_THRESHOLD: 20000 // 1.0 實務口徑：單筆未達20,000不扣繳、不扣二代健保
};

export const SCHEMES = [
  {
    code: 'general',
    name: '一般出租',
    shortCondition: '一般住宅出租（未套用公益/社宅/租賃條例17優惠）',
    rent_exempt_per_month: 0,
    expense_mode: 'standard',
    expense_rate: 0.43,
    bands: null,
    sources: [
      { label: '住宅法第15條', url: '' },
      { label: '住宅法第23條', url: '' },
      { label: '租賃住宅市場發展及管理條例第17條', url: '' }
    ]
  },
  {
    code: 'public_landlord',
    name: '公益出租人',
    shortCondition: '需符合公益出租人資格（依主管機關認定）',
    rent_exempt_per_month: 15000,
    expense_mode: 'standard',
    expense_rate: 0.43,
    bands: null,
    sources: [
      { label: '住宅法第15條', url: '' },
      { label: '住宅法第23條', url: '' },
      { label: '租賃住宅市場發展及管理條例第17條', url: '' }
    ]
  },
  {
    code: 'rental_act_17',
    name: '租賃條例§17（代管/包租轉租）',
    shortCondition: '住宅委託代管業或出租予包租業轉租，契約供居住使用1年以上',
    rent_exempt_per_month: 6000,
    expense_mode: 'banded17',
    expense_rate: null,
    bands: [
      { portion: '6000~20000', expense_rate: 0.53 },
      { portion: '>20000', expense_rate: 0.43 }
    ],
    sources: [
      { label: '住宅法第15條', url: '' },
      { label: '住宅法第23條', url: '' },
      { label: '租賃住宅市場發展及管理條例第17條', url: '' }
    ]
  },
  {
    code: 'social_housing',
    name: '社會住宅（社宅）',
    shortCondition: '依社會住宅方案認定（住宅法第23條）；所得稅試算採每月15,000免稅＋費用率60%',
    rent_exempt_per_month: 15000,
    expense_mode: 'standard',
    expense_rate: 0.60,
    bands: null,
    sources: [
      { label: '住宅法第15條', url: '' },
      { label: '住宅法第23條', url: '' },
      { label: '租賃住宅市場發展及管理條例第17條', url: '' }
    ]
  }
];
