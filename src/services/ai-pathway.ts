// AI Growth Pathway generation service

import { makeAuthenticatedRequest } from './api';

export interface PathwayResource {
  id: string;
  title: string;
  titleHi: string;
  type: 'video' | 'article' | 'tool' | 'template';
  url?: string;
}

export interface PathwayStep {
  id: string;
  order: number;
  title: string;
  titleHi: string;
  titleAs: string;
  description: string;
  descriptionHi: string;
  descriptionAs: string;
  duration: string;
  resources: PathwayResource[];
  milestones: string[];
  milestonesHi: string[];
}

export interface GrowthPathway {
  id: string;
  industry: string;
  generatedAt: Date;
  steps: PathwayStep[];
  recommendations: string[];
  recommendationsHi: string[];
  estimatedGrowth: string;
  estimatedGrowthHi: string;
  personalizedInsights: string[];
  personalizedInsightsHi: string[];
}

export interface GeneratePathwayRequest {
  sessionId: string;
  industry: string;
  businessData: {
    businessName?: string;
    yearStarted?: string;
    monthlyRevenue?: string;
    employeeCount?: string;
    currentChallenges?: string[];
    goals?: string[];
  };
}

/**
 * Generate AI-powered growth pathway
 */
export const generateGrowthPathway = async (
  request: GeneratePathwayRequest
): Promise<GrowthPathway> => {
  try {
    const response = await makeAuthenticatedRequest('/ai/growth-pathway/', {
      method: 'POST',
      body: JSON.stringify(request)
    });
    return {
      ...response,
      generatedAt: new Date(response.generatedAt)
    };
  } catch (error) {
    console.error('Error generating growth pathway:', error);
    // Return mock data for development
    return generateMockPathway(request.industry);
  }
};

/**
 * Get saved growth pathway for user
 */
export const getSavedPathway = async (sessionId: string): Promise<GrowthPathway | null> => {
  try {
    const response = await makeAuthenticatedRequest(`/ai/growth-pathway/${sessionId}/`);
    if (response) {
      return {
        ...response,
        generatedAt: new Date(response.generatedAt)
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching saved pathway:', error);
    return null;
  }
};

/**
 * Generate mock pathway for development/fallback
 */
const generateMockPathway = (industry: string): GrowthPathway => {
  const industrySteps: Record<string, PathwayStep[]> = {
    'Food Processing': [
      {
        id: '1',
        order: 1,
        title: 'Business Foundation Setup',
        titleHi: 'व्यवसाय की नींव स्थापित करें',
        titleAs: 'ব্যৱসায়ৰ ভেটি স্থাপন কৰক',
        description: 'Register your business, get FSSAI license, and set up basic accounting',
        descriptionHi: 'अपना व्यवसाय पंजीकृत करें, FSSAI लाइसेंस प्राप्त करें, और बुनियादी लेखांकन स्थापित करें',
        descriptionAs: 'আপোনাৰ ব্যৱসায় পঞ্জীয়ন কৰক, FSSAI অনুজ্ঞাপত্ৰ লওক, আৰু মৌলিক হিচাপ স্থাপন কৰক',
        duration: '2-4 weeks',
        resources: [
          { id: 'r1', title: 'FSSAI Registration Guide', titleHi: 'FSSAI पंजीकरण गाइड', type: 'article' },
          { id: 'r2', title: 'Basic Bookkeeping Template', titleHi: 'बुनियादी बहीखाता टेम्पलेट', type: 'template' }
        ],
        milestones: ['Business registered', 'FSSAI license obtained', 'Accounting system set up'],
        milestonesHi: ['व्यवसाय पंजीकृत', 'FSSAI लाइसेंस प्राप्त', 'लेखांकन प्रणाली स्थापित']
      },
      {
        id: '2',
        order: 2,
        title: 'Product Standardization',
        titleHi: 'उत्पाद मानकीकरण',
        titleAs: 'সামগ্ৰীৰ মানককৰণ',
        description: 'Standardize recipes, packaging, and quality control processes',
        descriptionHi: 'रेसिपी, पैकेजिंग और गुणवत्ता नियंत्रण प्रक्रियाओं को मानकीकृत करें',
        descriptionAs: 'ৰেচিপি, পেকেজিং আৰু গুণগত নিয়ন্ত্ৰণ প্ৰক্ৰিয়াসমূহ মানককৃত কৰক',
        duration: '3-6 weeks',
        resources: [
          { id: 'r3', title: 'Recipe Standardization Video', titleHi: 'रेसिपी मानकीकरण वीडियो', type: 'video' },
          { id: 'r4', title: 'Quality Control Checklist', titleHi: 'गुणवत्ता नियंत्रण चेकलिस्ट', type: 'template' }
        ],
        milestones: ['Standard recipes documented', 'Packaging designed', 'QC process established'],
        milestonesHi: ['मानक रेसिपी प्रलेखित', 'पैकेजिंग डिज़ाइन', 'QC प्रक्रिया स्थापित']
      },
      {
        id: '3',
        order: 3,
        title: 'Market Expansion',
        titleHi: 'बाज़ार विस्तार',
        titleAs: 'বজাৰ সম্প্ৰসাৰণ',
        description: 'Expand to nearby markets, connect with retailers, and explore online channels',
        descriptionHi: 'पास के बाज़ारों में विस्तार करें, खुदरा विक्रेताओं से जुड़ें, और ऑनलाइन चैनल एक्सप्लोर करें',
        descriptionAs: 'ওচৰৰ বজাৰলৈ সম্প্ৰসাৰণ কৰক, খুচুৰা বিক্ৰেতাসকলৰ সৈতে সংযোগ কৰক, আৰু অনলাইন চেনেল অন্বেষণ কৰক',
        duration: '4-8 weeks',
        resources: [
          { id: 'r5', title: 'Retailer Pitch Deck', titleHi: 'रिटेलर पिच डेक', type: 'template' },
          { id: 'r6', title: 'Online Selling Guide', titleHi: 'ऑनलाइन बिक्री गाइड', type: 'article' }
        ],
        milestones: ['5+ new retail partnerships', 'Online presence established', 'Sales increased by 30%'],
        milestonesHi: ['5+ नई खुदरा साझेदारी', 'ऑनलाइन उपस्थिति स्थापित', 'बिक्री में 30% वृद्धि']
      }
    ]
  };

  // Default steps for other industries
  const defaultSteps: PathwayStep[] = [
    {
      id: '1',
      order: 1,
      title: 'Business Assessment & Planning',
      titleHi: 'व्यवसाय मूल्यांकन और योजना',
      titleAs: 'ব্যৱসায় মূল্যায়ন আৰু পৰিকল্পনা',
      description: 'Comprehensive assessment of current business state and strategic planning',
      descriptionHi: 'वर्तमान व्यवसाय स्थिति का व्यापक मूल्यांकन और रणनीतिक योजना',
      descriptionAs: 'বৰ্তমান ব্যৱসায়ৰ অৱস্থাৰ বিস্তৃত মূল্যায়ন আৰু কৌশলগত পৰিকল্পনা',
      duration: '2-3 weeks',
      resources: [],
      milestones: ['Business assessment completed', 'Growth plan created'],
      milestonesHi: ['व्यवसाय मूल्यांकन पूर्ण', 'विकास योजना बनाई गई']
    },
    {
      id: '2',
      order: 2,
      title: 'Operational Improvements',
      titleHi: 'परिचालन सुधार',
      titleAs: 'পৰিচালনাগত উন্নতি',
      description: 'Implement systems and processes to improve operational efficiency',
      descriptionHi: 'परिचालन दक्षता में सुधार के लिए सिस्टम और प्रक्रियाओं को लागू करें',
      descriptionAs: 'পৰিচালনাগত দক্ষতা উন্নত কৰিবলৈ ব্যৱস্থা আৰু প্ৰক্ৰিয়া প্ৰয়োগ কৰক',
      duration: '4-6 weeks',
      resources: [],
      milestones: ['Systems implemented', 'Efficiency improved'],
      milestonesHi: ['सिस्टम लागू', 'दक्षता में सुधार']
    },
    {
      id: '3',
      order: 3,
      title: 'Growth & Scaling',
      titleHi: 'विकास और विस्तार',
      titleAs: 'বিকাশ আৰু স্কেলিং',
      description: 'Scale the business through market expansion and revenue optimization',
      descriptionHi: 'बाज़ार विस्तार और राजस्व अनुकूलन के माध्यम से व्यवसाय को बड़ा करें',
      descriptionAs: 'বজাৰ সম্প্ৰসাৰণ আৰু ৰাজহ অপ্টিমাইজেশ্বনৰ জৰিয়তে ব্যৱসায় স্কেল কৰক',
      duration: '6-12 weeks',
      resources: [],
      milestones: ['Revenue increased', 'Market expanded'],
      milestonesHi: ['राजस्व में वृद्धि', 'बाज़ार विस्तारित']
    }
  ];

  const steps = industrySteps[industry] || defaultSteps;

  return {
    id: `pathway-${Date.now()}`,
    industry,
    generatedAt: new Date(),
    steps,
    recommendations: [
      'Focus on quality consistency before scaling',
      'Build strong customer relationships',
      'Maintain proper financial records'
    ],
    recommendationsHi: [
      'विस्तार से पहले गुणवत्ता स्थिरता पर ध्यान दें',
      'मज़बूत ग्राहक संबंध बनाएं',
      'उचित वित्तीय रिकॉर्ड बनाए रखें'
    ],
    estimatedGrowth: '40-60% revenue growth in 12 months',
    estimatedGrowthHi: '12 महीनों में 40-60% राजस्व वृद्धि',
    personalizedInsights: [
      'Your business shows strong potential for regional expansion',
      'Consider partnering with local retailers for faster growth'
    ],
    personalizedInsightsHi: [
      'आपके व्यवसाय में क्षेत्रीय विस्तार की मज़बूत संभावना है',
      'तेज़ विकास के लिए स्थानीय खुदरा विक्रेताओं के साथ साझेदारी पर विचार करें'
    ]
  };
};

export default {
  generateGrowthPathway,
  getSavedPathway
};
