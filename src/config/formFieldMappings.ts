/**
 * Form field mappings for voice agent
 * Contains field definitions with multilingual aliases for voice recognition
 */

export type FieldType = 'text' | 'number' | 'select' | 'multiselect' | 'radio' | 'textarea';

export type ScreenType =
  | 'profile'
  | 'industry'
  | 'questionnaire'
  | 'equity'
  | 'consent'
  | 'schedule';

export interface FieldMapping {
  fieldKey: string;
  aliases: {
    en: string[];
    hi: string[];
    as: string[];
    mr: string[];
  };
  type: FieldType;
  screen: ScreenType;
  options?: {
    value: string;
    aliases: {
      en: string[];
      hi: string[];
      as: string[];
      mr: string[];
    };
  }[];
}

export const formFieldMappings: FieldMapping[] = [
  // Profile Screen Fields
  {
    fieldKey: 'fullName',
    aliases: {
      en: ['name', 'full name', 'my name', 'i am'],
      hi: ['नाम', 'मेरा नाम', 'पूरा नाम'],
      as: ['নাম', 'মোৰ নাম', 'সম্পূৰ্ণ নাম'],
      mr: ['नाव', 'माझे नाव', 'पूर्ण नाव']
    },
    type: 'text',
    screen: 'profile'
  },
  {
    fieldKey: 'email',
    aliases: {
      en: ['email', 'email address', 'mail', 'email id'],
      hi: ['ईमेल', 'ईमेल आईडी', 'मेल'],
      as: ['ইমেইল', 'ইমেইল ঠিকনা'],
      mr: ['ईमेल', 'ईमेल आयडी', 'मेल']
    },
    type: 'text',
    screen: 'profile'
  },
  {
    fieldKey: 'gender',
    aliases: {
      en: ['gender', 'i am a', 'sex'],
      hi: ['लिंग', 'जेंडर', 'मैं'],
      as: ['লিংগ', 'মই'],
      mr: ['लिंग', 'जेंडर']
    },
    type: 'radio',
    screen: 'profile',
    options: [
      { value: 'female', aliases: { en: ['female', 'woman', 'lady'], hi: ['महिला', 'स्त्री', 'औरत'], as: ['মহিলা', 'নাৰী'], mr: ['स्त्री', 'महिला', 'बाई'] } },
      { value: 'male', aliases: { en: ['male', 'man'], hi: ['पुरुष', 'आदमी'], as: ['পুৰুষ', 'মানুহ'], mr: ['पुरुष', 'माणूस'] } },
      { value: 'other', aliases: { en: ['other', 'others'], hi: ['अन्य'], as: ['অন্য'], mr: ['इतर'] } }
    ]
  },
  {
    fieldKey: 'age',
    aliases: {
      en: ['age', 'years old', 'my age'],
      hi: ['आयु', 'उम्र', 'मेरी उम्र', 'साल'],
      as: ['বয়স', 'মোৰ বয়স'],
      mr: ['वय', 'माझे वय', 'वर्षे']
    },
    type: 'number',
    screen: 'profile'
  },
  {
    fieldKey: 'education',
    aliases: {
      en: ['education', 'qualification', 'studied', 'study', 'educated'],
      hi: ['शिक्षा', 'पढ़ाई', 'शिक्षा स्तर', 'क्वालिफिकेशन'],
      as: ['শিক্ষা', 'পঢ়া-শুনা', 'যোগ্যতা'],
      mr: ['शिक्षण', 'शिकलेले', 'पात्रता']
    },
    type: 'radio',
    screen: 'profile',
    options: [
      { value: 'no-formal', aliases: { en: ['no formal', 'no schooling', 'not studied'], hi: ['औपचारिक शिक्षा नहीं', 'पढ़ाई नहीं'], as: ['আনুষ্ঠানিক শিক্ষা নাই'], mr: ['औपचारिक शिक्षण नाही', 'शिकलेलो नाही'] } },
      { value: 'primary', aliases: { en: ['primary', 'elementary'], hi: ['प्राथमिक'], as: ['প্ৰাথমিক'], mr: ['प्राथमिक'] } },
      { value: 'secondary', aliases: { en: ['secondary', 'high school', '10th', '12th'], hi: ['माध्यमिक', 'हाई स्कूल', 'दसवीं', 'बारहवीं'], as: ['মাধ্যমিক', 'হাই স্কুল'], mr: ['माध्यमिक', 'हायस्कूल', 'दहावी', 'बारावी'] } },
      { value: 'graduate', aliases: { en: ['graduate', 'college', 'degree', 'bachelor', 'masters', 'phd'], hi: ['स्नातक', 'ग्रेजुएट', 'कॉलेज', 'डिग्री'], as: ['স্নাতক', 'কলেজ', 'ডিগ্ৰী'], mr: ['पदवीधर', 'ग्रॅज्युएट', 'कॉलेज', 'पदवी'] } }
    ]
  },
  {
    fieldKey: 'state',
    aliases: {
      en: ['state', 'from state', 'live in state'],
      hi: ['राज्य', 'प्रदेश', 'स्टेट'],
      as: ['ৰাজ্য', 'প্ৰদেশ'],
      mr: ['राज्य', 'प्रदेश', 'स्टेट']
    },
    type: 'select',
    screen: 'profile'
  },
  {
    fieldKey: 'district',
    aliases: {
      en: ['district', 'from district', 'city', 'town'],
      hi: ['जिला', 'शहर', 'डिस्ट्रिक्ट'],
      as: ['জিলা', 'চহৰ'],
      mr: ['जिल्हा', 'शहर', 'गाव']
    },
    type: 'text',
    screen: 'profile'
  },

  // Industry/Enterprise Screen Fields
  {
    fieldKey: 'businessName',
    aliases: {
      en: ['business name', 'company name', 'enterprise name', 'shop name', 'store name'],
      hi: ['व्यवसाय का नाम', 'बिजनेस का नाम', 'दुकान का नाम', 'कंपनी का नाम'],
      as: ['ব্যৱসায়ৰ নাম', 'কোম্পানীৰ নাম', 'দোকানৰ নাম'],
      mr: ['व्यवसायाचे नाव', 'दुकानाचे नाव', 'कंपनीचे नाव']
    },
    type: 'text',
    screen: 'industry'
  },
  {
    fieldKey: 'sector',
    aliases: {
      en: ['sector', 'industry', 'business type', 'type of business', 'field'],
      hi: ['क्षेत्र', 'सेक्टर', 'व्यवसाय का प्रकार', 'इंडस्ट्री'],
      as: ['ক্ষেত্ৰ', 'উদ্যোগ', 'ব্যৱসায়ৰ প্ৰকাৰ'],
      mr: ['क्षेत्र', 'सेक्टर', 'व्यवसायाचा प्रकार', 'उद्योग']
    },
    type: 'select',
    screen: 'industry',
    options: [
      { value: 'food-processing', aliases: { en: ['food', 'food processing', 'cooking', 'restaurant'], hi: ['फूड', 'फूड प्रोसेसिंग', 'खाना', 'खाद्य'], as: ['খাদ্য', 'ফুড প্ৰচেছিং'], mr: ['खाद्य', 'फूड प्रोसेसिंग', 'जेवण', 'हॉटेल'] } },
      { value: 'agriculture', aliases: { en: ['agriculture', 'farming', 'farm', 'crops'], hi: ['कृषि', 'खेती', 'किसानी', 'फसल'], as: ['কৃষি', 'খেতি'], mr: ['शेती', 'कृषी', 'पीक'] } },
      { value: 'livestock', aliases: { en: ['livestock', 'dairy', 'poultry', 'cattle', 'animals'], hi: ['पशुपालन', 'डेयरी', 'पोल्ट्री', 'गाय', 'भैंस', 'मुर्गी'], as: ['পশুপালন', 'ডেইৰী', 'গৰু'], mr: ['पशुपालन', 'डेअरी', 'पोल्ट्री', 'गाय', 'म्हैस'] } },
      { value: 'textile', aliases: { en: ['textile', 'handicraft', 'cloth', 'clothing', 'fabric', 'handmade'], hi: ['टेक्सटाइल', 'हस्तशिल्प', 'कपड़ा', 'कढ़ाई'], as: ['কাপোৰ', 'হস্তশিল্প', 'টেক্সটাইল'], mr: ['कापड', 'हस्तकला', 'टेक्सटाइल', 'विणकाम'] } },
      { value: 'services', aliases: { en: ['services', 'service'], hi: ['सेवाएं', 'सर्विस'], as: ['সেৱা'], mr: ['सेवा', 'सर्व्हिस'] } },
      { value: 'other', aliases: { en: ['other', 'others', 'different'], hi: ['अन्य', 'और'], as: ['অন্য'], mr: ['इतर', 'वेगळे'] } }
    ]
  },
  {
    fieldKey: 'yearStarted',
    aliases: {
      en: ['year started', 'started in', 'since', 'established', 'founded'],
      hi: ['शुरू किया', 'कब शुरू', 'स्थापित', 'वर्ष'],
      as: ['আৰম্ভ কৰিছিলো', 'কেতিয়া আৰম্ভ', 'স্থাপিত'],
      mr: ['सुरू केले', 'कधी सुरू', 'स्थापित', 'वर्ष']
    },
    type: 'number',
    screen: 'industry'
  },
  {
    fieldKey: 'ownershipType',
    aliases: {
      en: ['ownership', 'ownership type', 'who owns', 'run by'],
      hi: ['स्वामित्व', 'मालिकाना', 'किसका है'],
      as: ['মালিকানা', 'কাৰ'],
      mr: ['मालकी', 'मालकी हक्क', 'कोणाचे']
    },
    type: 'radio',
    screen: 'industry',
    options: [
      { value: 'individual', aliases: { en: ['individual', 'myself', 'alone', 'solo'], hi: ['व्यक्तिगत', 'अकेला', 'मैं खुद'], as: ['ব্যক্তিগত', 'অকলে'], mr: ['वैयक्तिक', 'एकटा', 'मी स्वतः'] } },
      { value: 'family', aliases: { en: ['family', 'family business'], hi: ['परिवार', 'पारिवारिक'], as: ['পৰিয়াল', 'পাৰিবাৰিক'], mr: ['कुटुंब', 'कौटुंबिक'] } },
      { value: 'shg', aliases: { en: ['shg', 'self help group', 'collective', 'group'], hi: ['समूह', 'स्वयं सहायता समूह', 'एसएचजी'], as: ['সমূহ', 'স্ব-সহায়ক গোট'], mr: ['गट', 'बचत गट', 'स्वयंसहायता गट'] } },
      { value: 'partnership', aliases: { en: ['partnership', 'partner', 'partners'], hi: ['साझेदारी', 'पार्टनरशिप'], as: ['অংশীদাৰিত্ব'], mr: ['भागीदारी', 'पार्टनरशिप'] } }
    ]
  },
  {
    fieldKey: 'role',
    aliases: {
      en: ['role', 'my role', 'position', 'designation'],
      hi: ['भूमिका', 'पद', 'रोल'],
      as: ['ভূমিকা', 'পদ'],
      mr: ['भूमिका', 'पद', 'रोल']
    },
    type: 'radio',
    screen: 'industry',
    options: [
      { value: 'owner', aliases: { en: ['owner', 'proprietor'], hi: ['मालिक', 'स्वामी'], as: ['মালিক'], mr: ['मालक', 'स्वामी'] } },
      { value: 'cofounder', aliases: { en: ['co-founder', 'cofounder', 'co founder'], hi: ['सह-संस्थापक', 'को-फाउंडर'], as: ['সহ-প্ৰতিষ্ঠাপক'], mr: ['सह-संस्थापक', 'को-फाउंडर'] } },
      { value: 'manager', aliases: { en: ['manager', 'managing'], hi: ['प्रबंधक', 'मैनेजर'], as: ['প্ৰবন্ধক', 'মেনেজাৰ'], mr: ['व्यवस्थापक', 'मॅनेजर'] } }
    ]
  },

  // Questionnaire Fields - Section D
  {
    fieldKey: 'productDescription',
    aliases: {
      en: ['product', 'service', 'what do you sell', 'what do you make', 'business description'],
      hi: ['उत्पाद', 'सेवा', 'क्या बेचते हैं', 'क्या बनाते हैं', 'व्यवसाय'],
      as: ['উৎপাদন', 'সেৱা', 'কি বিক্ৰী কৰে'],
      mr: ['उत्पादन', 'सेवा', 'काय विकता', 'काय बनवता', 'व्यवसाय']
    },
    type: 'textarea',
    screen: 'questionnaire'
  },
  {
    fieldKey: 'primaryCustomers',
    aliases: {
      en: ['customers', 'who buys', 'clients', 'buyers'],
      hi: ['ग्राहक', 'कौन खरीदता है', 'कस्टमर'],
      as: ['গ্ৰাহক', 'কোনে কিনে'],
      mr: ['ग्राहक', 'कोण विकत घेतो', 'कस्टमर']
    },
    type: 'multiselect',
    screen: 'questionnaire',
    options: [
      { value: 'households', aliases: { en: ['households', 'families', 'homes'], hi: ['परिवार', 'घर'], as: ['পৰিয়াল', 'ঘৰ'], mr: ['कुटुंबे', 'घरे'] } },
      { value: 'retailers', aliases: { en: ['retailers', 'shops', 'stores'], hi: ['दुकानदार', 'रिटेलर'], as: ['দোকানদাৰ'], mr: ['दुकानदार', 'रिटेलर'] } },
      { value: 'wholesalers', aliases: { en: ['wholesalers', 'wholesale'], hi: ['थोक', 'होलसेलर'], as: ['পাইকাৰী'], mr: ['घाऊक', 'होलसेलर'] } },
      { value: 'institutions', aliases: { en: ['institutions', 'companies', 'organizations'], hi: ['संस्थान', 'कंपनी'], as: ['সংস্থা', 'কোম্পানী'], mr: ['संस्था', 'कंपनी'] } },
      { value: 'online', aliases: { en: ['online', 'internet', 'e-commerce'], hi: ['ऑनलाइन', 'इंटरनेट'], as: ['অনলাইন'], mr: ['ऑनलाइन', 'इंटरनेट'] } }
    ]
  },
  {
    fieldKey: 'salesGeography',
    aliases: {
      en: ['geography', 'where do you sell', 'sales area', 'market area'],
      hi: ['बिक्री क्षेत्र', 'कहाँ बेचते हैं', 'मार्केट'],
      as: ['বিক্ৰী ক্ষেত্ৰ', 'ক\'ত বিক্ৰী কৰে'],
      mr: ['विक्री क्षेत्र', 'कुठे विकता', 'मार्केट']
    },
    type: 'multiselect',
    screen: 'questionnaire',
    options: [
      { value: 'village', aliases: { en: ['village', 'local'], hi: ['गाँव', 'ग्राम'], as: ['গাওঁ'], mr: ['गाव', 'स्थानिक'] } },
      { value: 'block', aliases: { en: ['block'], hi: ['ब्लॉक'], as: ['ব্লক'], mr: ['ब्लॉक', 'तालुका'] } },
      { value: 'district', aliases: { en: ['district'], hi: ['ज़िला', 'जिला'], as: ['জিলা'], mr: ['जिल्हा'] } },
      { value: 'state', aliases: { en: ['state', 'statewide'], hi: ['राज्य', 'प्रदेश'], as: ['ৰাজ্য'], mr: ['राज्य', 'प्रदेश'] } }
    ]
  },
  {
    fieldKey: 'avgCustomers',
    aliases: {
      en: ['average customers', 'customers per month', 'monthly customers'],
      hi: ['औसत ग्राहक', 'महीने में ग्राहक', 'कितने ग्राहक'],
      as: ['গড় গ্ৰাহক', 'মাহত গ্ৰাহক'],
      mr: ['सरासरी ग्राहक', 'महिन्याला ग्राहक', 'किती ग्राहक']
    },
    type: 'number',
    screen: 'questionnaire'
  },
  {
    fieldKey: 'salesChannel',
    aliases: {
      en: ['sales channel', 'how do you sell', 'selling method'],
      hi: ['बिक्री का तरीका', 'कैसे बेचते हैं'],
      as: ['বিক্ৰীৰ পদ্ধতি', 'কেনেকৈ বিক্ৰী কৰে'],
      mr: ['विक्रीचा मार्ग', 'कसे विकता']
    },
    type: 'multiselect',
    screen: 'questionnaire',
    options: [
      { value: 'direct', aliases: { en: ['direct', 'directly'], hi: ['सीधे', 'डायरेक्ट'], as: ['পোনে'], mr: ['थेट', 'डायरेक्ट'] } },
      { value: 'retail', aliases: { en: ['retail'], hi: ['खुदरा', 'रिटेल'], as: ['খুচুৰা'], mr: ['किरकोळ', 'रिटेल'] } },
      { value: 'middlemen', aliases: { en: ['middlemen', 'agents'], hi: ['बिचौलिए', 'एजेंट'], as: ['মধ্যস্থ'], mr: ['मध्यस्थ', 'एजंट'] } },
      { value: 'online', aliases: { en: ['online', 'e-commerce'], hi: ['ऑनलाइन'], as: ['অনলাইন'], mr: ['ऑनलाइन'] } }
    ]
  },

  // Questionnaire Fields - Section E (Financial)
  {
    fieldKey: 'monthlyRevenue',
    aliases: {
      en: ['revenue', 'monthly revenue', 'sales', 'monthly sales', 'income', 'turnover'],
      hi: ['राजस्व', 'मासिक बिक्री', 'आय', 'कमाई', 'टर्नओवर'],
      as: ['ৰাজহ', 'মাহিলী বিক্ৰী', 'আয়'],
      mr: ['महसूल', 'मासिक विक्री', 'उत्पन्न', 'कमाई', 'टर्नओव्हर']
    },
    type: 'number',
    screen: 'questionnaire'
  },
  {
    fieldKey: 'monthlyExpenses',
    aliases: {
      en: ['expenses', 'monthly expenses', 'costs', 'spending'],
      hi: ['खर्च', 'मासिक खर्च', 'लागत'],
      as: ['খৰচ', 'মাহিলী খৰচ'],
      mr: ['खर्च', 'मासिक खर्च', 'लागत']
    },
    type: 'number',
    screen: 'questionnaire'
  },
  {
    fieldKey: 'currentStatus',
    aliases: {
      en: ['profit status', 'making profit', 'financial status', 'profit or loss'],
      hi: ['लाभ', 'मुनाफ़ा', 'नुकसान', 'वर्तमान स्थिति'],
      as: ['লাভ', 'লোকচান', 'বৰ্তমান অৱস্থা'],
      mr: ['नफा', 'तोटा', 'सध्याची स्थिती']
    },
    type: 'radio',
    screen: 'questionnaire',
    options: [
      { value: 'profit', aliases: { en: ['profit', 'profitable', 'making money'], hi: ['मुनाफ़ा', 'लाभ', 'फायदा'], as: ['লাভ', 'মুনাফা'], mr: ['नफा', 'फायदा'] } },
      { value: 'breakeven', aliases: { en: ['breakeven', 'break even', 'same'], hi: ['बराबर', 'न फायदा न नुकसान'], as: ['সমান', 'বৰাবৰ'], mr: ['सम', 'ना नफा ना तोटा'] } },
      { value: 'loss', aliases: { en: ['loss', 'losing money'], hi: ['नुकसान', 'घाटा'], as: ['লোকচান', 'ক্ষতি'], mr: ['तोटा', 'नुकसान'] } }
    ]
  },
  {
    fieldKey: 'salesTrend',
    aliases: {
      en: ['sales trend', 'growth', 'sales growth', 'business trend'],
      hi: ['बिक्री रुझान', 'ट्रेंड', 'बढ़ोतरी'],
      as: ['বিক্ৰী ধাৰা', 'বৃদ্ধি'],
      mr: ['विक्री ट्रेंड', 'वाढ', 'विक्री वाढ']
    },
    type: 'radio',
    screen: 'questionnaire',
    options: [
      { value: 'increased', aliases: { en: ['increased', 'growing', 'up'], hi: ['बढ़ी', 'बढ़ोतरी'], as: ['বাঢ়িছে'], mr: ['वाढली', 'वाढ'] } },
      { value: 'same', aliases: { en: ['same', 'stable', 'steady'], hi: ['समान रही', 'स्थिर'], as: ['একে আছে'], mr: ['तशीच', 'स्थिर'] } },
      { value: 'decreased', aliases: { en: ['decreased', 'declining', 'down', 'falling'], hi: ['घटी', 'कम हुई'], as: ['কমিছে'], mr: ['कमी झाली', 'घटली'] } }
    ]
  },
  {
    fieldKey: 'paidWorkers',
    aliases: {
      en: ['paid workers', 'employees', 'staff', 'hired workers'],
      hi: ['वेतनभोगी', 'कर्मचारी', 'स्टाफ'],
      as: ['বেতনভোগী', 'কৰ্মচাৰী'],
      mr: ['पगारी कामगार', 'कर्मचारी', 'स्टाफ']
    },
    type: 'number',
    screen: 'questionnaire'
  },
  {
    fieldKey: 'familyWorkers',
    aliases: {
      en: ['family workers', 'family members working', 'family help'],
      hi: ['परिवार के सदस्य', 'फैमिली वर्कर'],
      as: ['পৰিয়ালৰ সদস্য'],
      mr: ['कुटुंबातील सदस्य', 'फॅमिली वर्कर']
    },
    type: 'number',
    screen: 'questionnaire'
  },

  // Questionnaire Fields - Section F (Assets)
  {
    fieldKey: 'workspaceType',
    aliases: {
      en: ['workspace', 'work from', 'place of work', 'office', 'shop'],
      hi: ['कार्यस्थल', 'कहाँ काम करते हैं', 'जगह'],
      as: ['কাৰ্যস্থল', 'ক\'ত কাম কৰে'],
      mr: ['कार्यस्थळ', 'कुठे काम करता', 'जागा']
    },
    type: 'radio',
    screen: 'questionnaire',
    options: [
      { value: 'home', aliases: { en: ['home', 'house', 'from home'], hi: ['घर', 'घर से'], as: ['ঘৰ', 'ঘৰৰ পৰা'], mr: ['घर', 'घरून'] } },
      { value: 'rented', aliases: { en: ['rented', 'rent'], hi: ['किराए पर', 'किराया'], as: ['ভাড়াত', 'ভাড়া'], mr: ['भाड्याचे', 'भाडे'] } },
      { value: 'owned', aliases: { en: ['owned', 'own'], hi: ['खुद का', 'अपना'], as: ['নিজৰ'], mr: ['स्वतःचे', 'आपले'] } }
    ]
  },
  {
    fieldKey: 'keyAssets',
    aliases: {
      en: ['assets', 'machines', 'equipment', 'tools'],
      hi: ['संपत्ति', 'मशीनें', 'उपकरण'],
      as: ['সম্পত্তি', 'যন্ত্ৰ', 'সঁজুলি'],
      mr: ['मालमत्ता', 'यंत्रे', 'उपकरणे', 'साधने']
    },
    type: 'textarea',
    screen: 'questionnaire'
  },

  // Questionnaire Fields - Section G (Growth Intent)
  {
    fieldKey: 'hoursPerDay',
    aliases: {
      en: ['hours', 'working hours', 'hours per day', 'daily hours'],
      hi: ['घंटे', 'काम के घंटे', 'रोज़ाना घंटे'],
      as: ['ঘণ্টা', 'কামৰ ঘণ্টা'],
      mr: ['तास', 'कामाचे तास', 'दररोज तास']
    },
    type: 'radio',
    screen: 'questionnaire',
    options: [
      { value: '1-3', aliases: { en: ['1-3', 'one to three', 'few hours'], hi: ['1-3', 'एक से तीन'], as: ['১-৩'], mr: ['१-३', 'एक ते तीन'] } },
      { value: '3-6', aliases: { en: ['3-6', 'three to six'], hi: ['3-6', 'तीन से छह'], as: ['৩-৬'], mr: ['३-६', 'तीन ते सहा'] } },
      { value: '6+', aliases: { en: ['6+', 'more than six', 'full time', 'many hours'], hi: ['6+', 'छह से ज़्यादा', 'पूर्ण समय'], as: ['৬+', 'ছয়তকৈ বেছি'], mr: ['६+', 'सहा पेक्षा जास्त', 'पूर्णवेळ'] } }
    ]
  },
  {
    fieldKey: 'openToChange',
    aliases: {
      en: ['open to change', 'willing to try', 'new methods', 'try new things'],
      hi: ['बदलाव के लिए तैयार', 'नए तरीके', 'नई चीज़ें'],
      as: ['পৰিৱৰ্তনৰ বাবে প্ৰস্তুত', 'নতুন পদ্ধতি'],
      mr: ['बदलासाठी तयार', 'नवीन पद्धती', 'नवीन गोष्टी']
    },
    type: 'radio',
    screen: 'questionnaire',
    options: [
      { value: 'yes', aliases: { en: ['yes', 'definitely', 'sure'], hi: ['हाँ', 'जी हाँ', 'बिल्कुल'], as: ['হয়', 'অৱশ্যেই'], mr: ['हो', 'नक्की', 'अवश्य'] } },
      { value: 'sometimes', aliases: { en: ['sometimes', 'maybe', 'depends'], hi: ['कभी-कभी', 'शायद'], as: ['কেতিয়াবা', 'হয়তো'], mr: ['कधी कधी', 'कदाचित'] } },
      { value: 'no', aliases: { en: ['no', 'not really'], hi: ['नहीं', 'नहीं जी'], as: ['নহয়'], mr: ['नाही'] } }
    ]
  },
  {
    fieldKey: 'priority',
    aliases: {
      en: ['priority', 'focus', 'main goal', 'next year goal'],
      hi: ['प्राथमिकता', 'लक्ष्य', 'फोकस'],
      as: ['অগ্ৰাধিকাৰ', 'লক্ষ্য'],
      mr: ['प्राधान्य', 'ध्येय', 'लक्ष्य']
    },
    type: 'multiselect',
    screen: 'questionnaire',
    options: [
      { value: 'sales', aliases: { en: ['sales', 'more sales'], hi: ['बिक्री'], as: ['বিক্ৰী'], mr: ['विक्री', 'जास्त विक्री'] } },
      { value: 'profit', aliases: { en: ['profit', 'more profit'], hi: ['मुनाफ़ा', 'लाभ'], as: ['লাভ'], mr: ['नफा', 'जास्त नफा'] } },
      { value: 'capacity', aliases: { en: ['capacity', 'scale', 'expand'], hi: ['क्षमता', 'विस्तार'], as: ['ক্ষমতা', 'সম্প্ৰসাৰণ'], mr: ['क्षमता', 'विस्तार'] } },
      { value: 'new-market', aliases: { en: ['new market', 'new customers'], hi: ['नया बाज़ार', 'नए ग्राहक'], as: ['নতুন বজাৰ'], mr: ['नवीन बाजार', 'नवीन ग्राहक'] } },
      { value: 'working-capital', aliases: { en: ['working capital', 'capital', 'money', 'funds'], hi: ['कार्यशील पूंजी', 'पूंजी', 'पैसा'], as: ['কাৰ্যকৰী মূলধন', 'মূলধন'], mr: ['खेळते भांडवल', 'भांडवल', 'पैसा'] } }
    ]
  },
  {
    fieldKey: 'quiverSupport',
    aliases: {
      en: ['support needed', 'help needed', 'what support', 'quiver help'],
      hi: ['सहायता', 'मदद', 'क्या चाहिए'],
      as: ['সহায়', 'সহায়তা'],
      mr: ['मदत', 'सहाय्य', 'काय हवे']
    },
    type: 'multiselect',
    screen: 'questionnaire',
    options: [
      { value: 'mentorship', aliases: { en: ['mentorship', 'guidance', 'advice'], hi: ['मार्गदर्शन', 'सलाह'], as: ['পৰামৰ্শ'], mr: ['मार्गदर्शन', 'सल्ला'] } },
      { value: 'market-access', aliases: { en: ['market access', 'market', 'customers'], hi: ['बाज़ार पहुंच', 'मार्केट'], as: ['বজাৰ প্ৰৱেশ'], mr: ['बाजारपेठ', 'मार्केट'] } },
      { value: 'systems', aliases: { en: ['systems', 'process', 'technology'], hi: ['सिस्टम', 'प्रक्रिया'], as: ['ব্যৱস্থা', 'প্ৰক্ৰিয়া'], mr: ['प्रणाली', 'प्रक्रिया', 'तंत्रज्ञान'] } },
      { value: 'growth-capital', aliases: { en: ['growth capital', 'investment', 'funding'], hi: ['ग्रोथ कैपिटल', 'निवेश', 'फंडिंग'], as: ['বৃদ্ধি মূলধন', 'বিনিয়োগ'], mr: ['वाढ भांडवल', 'गुंतवणूक', 'फंडिंग'] } }
    ]
  },
  {
    fieldKey: 'investmentAmount',
    aliases: {
      en: ['investment amount', 'how much investment', 'funding amount'],
      hi: ['निवेश राशि', 'कितना निवेश', 'पैसा चाहिए'],
      as: ['বিনিয়োগৰ পৰিমাণ', 'কিমান বিনিয়োগ'],
      mr: ['गुंतवणूक रक्कम', 'किती गुंतवणूक', 'पैसे हवेत']
    },
    type: 'number',
    screen: 'questionnaire'
  },
  {
    fieldKey: 'fundingUse',
    aliases: {
      en: ['funding use', 'use of funding', 'how will you use', 'money use'],
      hi: ['फंडिंग का उपयोग', 'पैसे का उपयोग', 'कैसे इस्तेमाल करेंगे'],
      as: ['ধনৰ ব্যৱহাৰ', 'কেনেকৈ ব্যৱহাৰ কৰিব'],
      mr: ['फंडिंगचा वापर', 'पैशाचा वापर', 'कसे वापरणार']
    },
    type: 'textarea',
    screen: 'questionnaire'
  },

  // Equity Screen
  {
    fieldKey: 'openToEquity',
    aliases: {
      en: ['equity', 'open to equity', 'partnership', 'investment', 'revenue share'],
      hi: ['इक्विटी', 'साझेदारी', 'निवेश', 'रेवेन्यू शेयर'],
      as: ['ইকুইটি', 'অংশীদাৰিত্ব', 'বিনিয়োগ'],
      mr: ['इक्विटी', 'भागीदारी', 'गुंतवणूक', 'रेव्हेन्यू शेअर']
    },
    type: 'radio',
    screen: 'equity',
    options: [
      { value: 'yes', aliases: { en: ['yes', 'open', 'interested'], hi: ['हाँ', 'खुला हूँ', 'इच्छुक'], as: ['হয়', 'আগ্ৰহী'], mr: ['हो', 'तयार', 'इच्छुक'] } },
      { value: 'maybe', aliases: { en: ['maybe', 'perhaps', 'not sure'], hi: ['शायद', 'पता नहीं'], as: ['হয়তো', 'নিশ্চিত নহয়'], mr: ['कदाचित', 'माहीत नाही'] } },
      { value: 'no', aliases: { en: ['no', 'not interested'], hi: ['नहीं', 'इच्छुक नहीं'], as: ['নহয়', 'আগ্ৰহী নহয়'], mr: ['नाही', 'इच्छुक नाही'] } }
    ]
  }
];

// Helper function to get field mapping by key
export function getFieldMapping(fieldKey: string): FieldMapping | undefined {
  return formFieldMappings.find(f => f.fieldKey === fieldKey);
}

// Helper function to get all fields for a specific screen
export function getFieldsForScreen(screen: ScreenType): FieldMapping[] {
  return formFieldMappings.filter(f => f.screen === screen);
}

// Helper function to find field by alias (in any language)
export function findFieldByAlias(alias: string): FieldMapping | undefined {
  const lowerAlias = alias.toLowerCase();
  return formFieldMappings.find(field => {
    const allAliases = [
      ...field.aliases.en.map(a => a.toLowerCase()),
      ...field.aliases.hi,
      ...field.aliases.as,
      ...field.aliases.mr
    ];
    return allAliases.some(a => lowerAlias.includes(a) || a.includes(lowerAlias));
  });
}

// Helper function to find option value by alias
export function findOptionByAlias(field: FieldMapping, alias: string): string | undefined {
  if (!field.options) return undefined;

  const lowerAlias = alias.toLowerCase();
  const matchedOption = field.options.find(option => {
    const allAliases = [
      ...option.aliases.en.map(a => a.toLowerCase()),
      ...option.aliases.hi,
      ...option.aliases.as,
      ...option.aliases.mr
    ];
    return allAliases.some(a => lowerAlias.includes(a) || a.includes(lowerAlias));
  });

  return matchedOption?.value;
}
