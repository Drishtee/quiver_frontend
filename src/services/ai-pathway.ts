// AI Growth Pathway generation service
// Calls backend endpoint which proxies to OpenAI

import { makeAuthenticatedRequest } from './api';

// ============================================
// TYPES
// ============================================

export interface GrowthOverviewRow {
  year: string;
  mainGoal: string;
  revenueTarget: string;
  whatYouBuild: string;
  whereYouSell: string;
  teamSize: string;
}

export interface GrowthDetailRow {
  timeline: string;
  monthlyRevenue: string;
  monthlyProfit: string;
  customersPerMonth: string;
  workers: string;
  keyActions: string;
  salesArea: string;
}

export interface CapitalBreakdown {
  item: string;
  amount: string;
  timeline: string;
}

export interface QuiverSupport {
  mentorship: string[];
  growthCapital: {
    totalAmount: string;
    breakdown: CapitalBreakdown[];
  };
  marketAccess: string[];
}

export interface KeyChangesYear {
  year: string;
  priorities: string[];
}

export interface AIGrowthPathwayData {
  businessSummary: string;
  overview: GrowthOverviewRow[];
  detailed: GrowthDetailRow[];
  quiverSupport: QuiverSupport;
  keyChanges: KeyChangesYear[];
  closingNote: string;
}

// Business data collected from onboarding forms
export interface BusinessDataPayload {
  // Profile (Section B)
  state?: string;
  district?: string;
  // Enterprise (Section C)
  businessName?: string;
  sector?: string;
  yearStarted?: string;
  // Product/Market (Section D)
  productDescription?: string;
  primaryCustomers?: string;
  salesGeography?: string;
  avgCustomers?: string;
  salesChannel?: string;
  salesConcentration?: string;
  businessIndependence?: string;
  // Financial (Section E)
  monthlyRevenue?: string;
  monthlyExpenses?: string;
  currentStatus?: string;
  salesTrend?: string;
  paidWorkers?: string;
  familyWorkers?: string;
  paymentFrequency?: string;
  digitalTransactions?: string;
  recordsType?: string;
  // Assets (Section F)
  keyAssets?: string;
  workspaceType?: string;
  registrations?: string;
  // Growth Intent (Section G)
  hoursPerDay?: string;
  openToChange?: string;
  priority?: string;
  quiverSupport?: string | string[];
  investmentAmount?: string;
  fundingUse?: string;
}

// ============================================
// API CALL
// ============================================

export const generateGrowthPathway = async (
  businessData: BusinessDataPayload
): Promise<AIGrowthPathwayData> => {
  try {
    const response = await makeAuthenticatedRequest<{
      success: boolean;
      pathway: AIGrowthPathwayData;
    }>('/onboarding/ai-growth-pathway/', {
      method: 'POST',
      body: JSON.stringify({ businessData })
    });

    if (response.success && response.pathway) {
      return response.pathway;
    }
    throw new Error('Invalid response from server');
  } catch (error) {
    console.error('Backend AI pathway failed, using fallback:', error);
    return generateFallbackPathway(businessData);
  }
};

// ============================================
// FALLBACK (when backend is unavailable)
// ============================================

const generateFallbackPathway = (data: BusinessDataPayload): AIGrowthPathwayData => {
  const revenue = data.monthlyRevenue || '60,000';
  const product = data.productDescription || 'products';
  const sector = data.sector || 'General Business';
  const state = data.state || 'India';
  const investment = data.investmentAmount || '5,00,000';

  return {
    businessSummary: `A ${sector} business based in ${state}, currently earning ₹${revenue}/month from ${product}. The business shows potential for growth with proper systems and market expansion.`,
    overview: [
      {
        year: 'Year 1',
        mainGoal: 'Formalize & Grow Production',
        revenueTarget: '₹1.5L/month',
        whatYouBuild: 'Legal business, better equipment, small team',
        whereYouSell: 'Block to District level',
        teamSize: '4-5 people'
      },
      {
        year: 'Year 2',
        mainGoal: 'Expand Market & Products',
        revenueTarget: '₹4L/month',
        whatYouBuild: 'Own workspace, multiple products, bigger area',
        whereYouSell: '3-4 districts + online',
        teamSize: '10-12 people'
      },
      {
        year: 'Year 3',
        mainGoal: 'Professional Business at Scale',
        revenueTarget: '₹8L+/month',
        whatYouBuild: 'Factory setup, strong brand, can run without you',
        whereYouSell: '8+ districts + retail chains',
        teamSize: '15-20 people'
      }
    ],
    detailed: [
      {
        timeline: 'Current State',
        monthlyRevenue: `₹${revenue}`,
        monthlyProfit: '₹20,000',
        customersPerMonth: data.avgCustomers || '100',
        workers: 'Family only',
        keyActions: 'Home-based, no registration, manual operations',
        salesArea: data.salesGeography || 'Block level'
      },
      {
        timeline: 'Year 1 (Months 1-3)',
        monthlyRevenue: '₹75,000',
        monthlyProfit: '₹30,000',
        customersPerMonth: '120',
        workers: 'Family only',
        keyActions: 'Get FSSAI & Udyam registration, start UPI, maintain basic records',
        salesArea: 'Block level'
      },
      {
        timeline: 'Year 1 (Months 4-6)',
        monthlyRevenue: '₹1,00,000',
        monthlyProfit: '₹40,000',
        customersPerMonth: '200',
        workers: 'Family + 2 hired',
        keyActions: `Buy better equipment with ₹${investment} funding, hire 2 workers, improve quality`,
        salesArea: 'Block level'
      },
      {
        timeline: 'Year 1 (Months 7-12)',
        monthlyRevenue: '₹1,50,000',
        monthlyProfit: '₹60,000',
        customersPerMonth: '300',
        workers: '4-5 people',
        keyActions: 'Get branded packaging, sell to more retailers in district, add new products',
        salesArea: 'District level'
      },
      {
        timeline: 'Year 2 (Months 13-18)',
        monthlyRevenue: '₹2,50,000',
        monthlyProfit: '₹1,00,000',
        customersPerMonth: '500',
        workers: '6-8 people',
        keyActions: 'Get separate workspace, add 3-4 new products, reach more districts',
        salesArea: '2-3 districts'
      },
      {
        timeline: 'Year 2 (Months 19-24)',
        monthlyRevenue: '₹4,00,000',
        monthlyProfit: '₹1,60,000',
        customersPerMonth: '800',
        workers: '10-12 people',
        keyActions: 'Start online delivery, supply to bigger buyers, get working capital loan',
        salesArea: '3-4 districts'
      },
      {
        timeline: 'Year 3 (Months 25-30)',
        monthlyRevenue: '₹6,00,000',
        monthlyProfit: '₹2,40,000',
        customersPerMonth: '1,200',
        workers: '12-15 people',
        keyActions: 'Open semi-automatic setup, hire manager so business runs without you',
        salesArea: '5-6 districts'
      },
      {
        timeline: 'Year 3 (Months 31-36)',
        monthlyRevenue: '₹8,00,000+',
        monthlyProfit: '₹3,20,000+',
        customersPerMonth: '1,600+',
        workers: '15-20 people',
        keyActions: 'Sell in retail chains, cover 5-8 districts, explore franchising',
        salesArea: '8+ districts'
      }
    ],
    quiverSupport: {
      mentorship: [
        'Getting registrations done quickly (FSSAI, Udyam)',
        'Finding right equipment suppliers and negotiating prices',
        'Building retail network and getting bigger orders',
        'Managing workers and money properly'
      ],
      growthCapital: {
        totalAmount: `₹${investment}`,
        breakdown: [
          { item: 'New equipment (machines, packaging)', amount: '₹3,00,000', timeline: 'Months 1-6' },
          { item: 'Registration, branding, working capital', amount: '₹2,00,000', timeline: 'Months 1-6' }
        ]
      },
      marketAccess: [
        'Connections to district-level retailers and wholesalers',
        'Introduction to institutional buyers (canteens, offices)',
        'Support to list products in retail chains by Year 3'
      ]
    },
    keyChanges: [
      {
        year: 'Year 1',
        priorities: [
          'Start maintaining daily sales records (simple notebook or phone app)',
          'Accept UPI payments to track money better and attract more customers',
          'Train family members so business can run for 7 days without you',
          'Get required licenses - mandatory to sell legally'
        ]
      },
      {
        year: 'Year 2',
        priorities: [
          'Move production out of home to separate workspace',
          'Add 3-4 new products to sell more to same retailers',
          'Hire supervisor to manage daily operations',
          'Build relationships with bigger buyers'
        ]
      },
      {
        year: 'Year 3',
        priorities: [
          'Set up proper production unit with better machines',
          'Hire professional manager - business must run without you',
          'Create strong brand that people recognize',
          'Expand to metro cities or online platforms'
        ]
      }
    ],
    closingNote: `This pathway takes your business from informal home operation to a professional ${sector.toLowerCase()} company creating 15-20 jobs while growing profits significantly over 3 years.`
  };
};

export default {
  generateGrowthPathway
};
