export const TAX_CONSTANTS = {
  WHT_RESIDENT: 0.10,
  WHT_NON_RESIDENT: 0.20,
  NHI_RATE: 0.0211,
  NHI_THRESHOLD: 20000
};

// 1.0 規則：先用「每月租金」推年度；社宅先以一般租賃所得費用率處理（若日後有特別所得優惠再補）
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
      { label: '所得稅法（租賃所得）', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=G0340003' },
      { label: '財政部稅務入口網（扣繳Q&A）', url: 'https://www.etax.nat.gov.tw/etwmain/tax-info/understanding/tax-q-and-a/national/individual-income-tax/withheld-rule/rule/zNMxNQQ' }
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
      { label: '住宅法（公益出租人）', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0070130' },
      { label: '財政部相關說明（公益出租人租稅優惠）', url: 'https://www.mof.gov.tw/house/multiplehtml/41e7424fa26e4d41905ed1800fd9fabc' }
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
      { label: '租賃住宅市場發展及管理條例 第17條', url: 'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0060125&flno=17' },
      { label: '內政部不動產資訊平台（包租代管）', url: 'https://www.land.moi.gov.tw/' }
    ]
  },
  {
    code: 'social_housing',
    name: '社會住宅（社宅）',
    shortCondition: '依社會住宅/包租代管社宅方案認定；所得稅優惠請依適用規範確認',
    rent_exempt_per_month: 0,
    expense_mode: 'standard',
    expense_rate: 0.43,
    bands: null,
    sources: [
      { label: '住宅法（社會住宅）', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0070130' },
      { label: '高雄市稅捐稽徵處（房屋/地價稅Q&A）', url: 'https://www.kctax.gov.tw/TaxNews/QAList.aspx?p=2&MenuID=192&typeid=3' }
    ]
  }
];
