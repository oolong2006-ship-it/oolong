/* eslint-disable */
const RESTAURANTS_DATA = [
  {
    id: 'r1',
    name: 'مطعم الحمراء',
    cuisine: 'سعودي · مشاوي',
    rating: 4.7,
    reviewCount: 342,
    priceRange: 2,
    deliveryTime: '30-45',
    minOrder: 40,
    deliveryFee: 10,
    neighborhood: 'حي العليا · الرياض',
    isOpen: true,
    tags: ['شعبي', 'مشاوي', 'عائلي'],
    emoji: '🍖',
    color: '#c2410c',
    categories: [
      {
        id: 'c1', name: 'المشويات',
        items: [
          { id: 'i1',  name: 'مشاوي مشكلة للشخص',  description: 'دجاج + لحم + كوفتة مع الأرز والخبز والسلطة',  price: 65, available: true },
          { id: 'i2',  name: 'دجاج مشوي كامل',       description: 'دجاج مشوي على الفحم بالبهارات الخاصة',          price: 45, available: true },
          { id: 'i3',  name: 'كوفتة لحم (4 قطع)',    description: 'كوفتة لحم ضأن طازج مع الأرز والسلطة',          price: 35, available: true },
          { id: 'i4',  name: 'لحم مفروم مشوي',       description: 'لحم ضأن مفروم مشوي على الفحم',                 price: 55, available: true },
        ]
      },
      {
        id: 'c2', name: 'المقبلات والجانبية',
        items: [
          { id: 'i5',  name: 'حمص بالطحينة',   description: 'حمص كريمي مع زيت الزيتون والكمون',      price: 15, available: true },
          { id: 'i6',  name: 'سلطة فتوش',       description: 'خضار طازجة وخبز محمص مع دبس الرمان',   price: 18, available: true },
          { id: 'i7',  name: 'خبز تنور (4 أرغفة)', description: 'خبز تنور طازج من التنور مباشرةً',   price: 10, available: true },
          { id: 'i8',  name: 'أرز بخاري',        description: 'أرز بسمتي مع التوابل السعودية الأصيلة', price: 20, available: true },
        ]
      },
      {
        id: 'c3', name: 'المشروبات',
        items: [
          { id: 'i9',  name: 'عصير طازج',   description: 'برتقال أو مانجو أو ليمون بالنعناع', price: 15, available: true },
          { id: 'i10', name: 'شاي أحمر',    description: 'شاي بالنعناع أو الهيل أو السادة',   price:  8, available: true },
          { id: 'i11', name: 'لبن رائب بارد', description: 'لبن طازج بارد زجاجة كبيرة',       price: 10, available: true },
        ]
      },
    ]
  },
  {
    id: 'r2',
    name: 'برجر بيت',
    cuisine: 'برجر · أمريكي',
    rating: 4.5,
    reviewCount: 218,
    priceRange: 2,
    deliveryTime: '20-35',
    minOrder: 35,
    deliveryFee: 8,
    neighborhood: 'حي الملقا · الرياض',
    isOpen: true,
    tags: ['برجر', 'وجبات سريعة', 'اقتصادي'],
    emoji: '🍔',
    color: '#b45309',
    categories: [
      {
        id: 'c4', name: 'البرجر الكلاسيكي',
        items: [
          { id: 'i12', name: 'برجر الكلاسيك',           description: '180غ لحم بقري مع الجبن والخضار الطازجة',         price: 32, available: true },
          { id: 'i13', name: 'برجر الدبل تشيز',          description: 'شريحتا لحم مع جبن مزدوج وصلصة البيت',             price: 45, available: true },
          { id: 'i14', name: 'برجر الدجاج المقرمش',      description: 'صدر دجاج مقرمش مع كول سلو والصوص الخاص',         price: 35, available: true },
          { id: 'i15', name: 'برجر الفطر والجبن البري',  description: 'لحم بقري مع فطر مقلي وجبن ذائب',                 price: 40, available: true },
        ]
      },
      {
        id: 'c5', name: 'الوجبات المشتركة',
        items: [
          { id: 'i16', name: 'وجبة برجر فردية',           description: 'برجر + بطاطس وسط + مشروب',                       price: 42, available: true },
          { id: 'i17', name: 'وجبة عائلية (4 أشخاص)',     description: '4 برجر + 4 بطاطس كبير + 4 مشروبات + صلصات',      price: 149, available: true },
        ]
      },
      {
        id: 'c6', name: 'الجانبية والمشروبات',
        items: [
          { id: 'i18', name: 'بطاطس مقلية كبير',   description: 'بطاطس مقلية طازجة بالملح البحري',    price: 15, available: true },
          { id: 'i19', name: 'حلقات البصل',         description: 'حلقات بصل مقرمشة مع صلصة الرانش',   price: 18, available: true },
          { id: 'i20', name: 'مشروب غازي',          description: 'بيبسي أو سفن أب أو ميرندا',          price:  8, available: true },
          { id: 'i21', name: 'ميلك شيك',            description: 'شوكولاتة أو فراولة أو فانيليا',       price: 22, available: true },
        ]
      },
    ]
  },
  {
    id: 'r3',
    name: 'بيتزا فيستا',
    cuisine: 'بيتزا · إيطالي',
    rating: 4.3,
    reviewCount: 165,
    priceRange: 2,
    deliveryTime: '35-50',
    minOrder: 50,
    deliveryFee: 12,
    neighborhood: 'حي الياسمين · الرياض',
    isOpen: true,
    tags: ['بيتزا', 'إيطالي', 'معكرونة'],
    emoji: '🍕',
    color: '#dc2626',
    categories: [
      {
        id: 'c7', name: 'البيتزا',
        items: [
          { id: 'i22', name: 'مارغريتا',             description: 'صلصة طماطم + موزاريلا + ريحان طازج',        price: 42, available: true },
          { id: 'i23', name: 'بيتزا اللحم المشكل',   description: 'لحم + فلفل ألوان + بصل + فطر + زيتون',    price: 58, available: true },
          { id: 'i24', name: 'بيتزا الدجاج BBQ',     description: 'دجاج مشوي + فلفل + بصل + صلصة BBQ',        price: 52, available: true },
          { id: 'i25', name: 'بيتزا خضار',           description: 'فطر + فلفل ألوان + بصل + طماطم + زيتون',  price: 45, available: true },
        ]
      },
      {
        id: 'c8', name: 'المعكرونة',
        items: [
          { id: 'i26', name: 'باستا البولونيز',      description: 'إسباغتي مع صلصة اللحم المطبوخة ببطء',      price: 38, available: true },
          { id: 'i27', name: 'فيتوتشيني ألفريدو',   description: 'فيتوتشيني بصلصة الكريمة والدجاج والجبن',   price: 42, available: true },
          { id: 'i28', name: 'باستا الأرابياتا',     description: 'بيني بصلصة طماطم حارة بالثوم والفلفل',     price: 35, available: true },
        ]
      },
      {
        id: 'c9', name: 'المشروبات',
        items: [
          { id: 'i29', name: 'عصير برتقال طازج',  description: 'برتقال طازج معصور',     price: 15, available: true },
          { id: 'i30', name: 'مشروب غازي',        description: 'كولا أو فانتا أو سبرايت', price:  8, available: true },
        ]
      },
    ]
  },
  {
    id: 'r4',
    name: 'شاورما الشام',
    cuisine: 'شاورما · شامي',
    rating: 4.6,
    reviewCount: 521,
    priceRange: 1,
    deliveryTime: '15-25',
    minOrder: 25,
    deliveryFee: 7,
    neighborhood: 'حي الورود · الرياض',
    isOpen: true,
    tags: ['شاورما', 'سريع', 'اقتصادي', 'شعبي'],
    emoji: '🌯',
    color: '#7c3aed',
    categories: [
      {
        id: 'c10', name: 'الشاورما',
        items: [
          { id: 'i31', name: 'شاورما دجاج صغير',   description: 'دجاج مع طحينة وثوم وخضار',              price: 15, available: true },
          { id: 'i32', name: 'شاورما دجاج كبير',   description: 'دجاج مع طحينة وثوم وخضار وبطاطس',      price: 22, available: true },
          { id: 'i33', name: 'شاورما لحم صغير',    description: 'لحم ضأن مع الصوص الخاص والطماطم',      price: 18, available: true },
          { id: 'i34', name: 'شاورما لحم كبير',    description: 'لحم ضأن مع كل الإضافات والطحينة',      price: 28, available: true },
          { id: 'i35', name: 'شاورما مشكلة كبير',  description: 'دجاج + لحم في خبز واحد كامل الإضافات', price: 32, available: true },
        ]
      },
      {
        id: 'c11', name: 'الأطباق',
        items: [
          { id: 'i36', name: 'طبق شاورما دجاج',    description: 'شاورما مع أرز وسلطة وحمص',          price: 35, available: true },
          { id: 'i37', name: 'طبق شاورما مشكل',    description: 'دجاج ولحم مع أرز وحمص وسلطة وخبز', price: 45, available: true },
        ]
      },
      {
        id: 'c12', name: 'المشروبات والإضافات',
        items: [
          { id: 'i38', name: 'عصير ليمون بالنعناع', description: 'ليمون طازج بالنعناع مثلج', price: 10, available: true },
          { id: 'i39', name: 'بيبسي علبة',          description: 'علبة بيبسي 330 مل',        price:  5, available: true },
          { id: 'i40', name: 'طحينة زيادة',         description: 'طاسة طحينة إضافية',        price:  3, available: true },
        ]
      },
    ]
  },
  {
    id: 'r5',
    name: 'مطعم البحر الأزرق',
    cuisine: 'مأكولات بحرية',
    rating: 4.4,
    reviewCount: 98,
    priceRange: 3,
    deliveryTime: '40-60',
    minOrder: 80,
    deliveryFee: 15,
    neighborhood: 'حي السلامة · الرياض',
    isOpen: false,
    tags: ['بحري', 'فاخر', 'أسماك', 'روبيان'],
    emoji: '🦞',
    color: '#0284c7',
    categories: [
      {
        id: 'c13', name: 'الأسماك والمأكولات البحرية',
        items: [
          { id: 'i41', name: 'سمك مشوي (كيلو)',       description: 'سمك طازج مشوي مع التوابل والليمون',           price: 85, available: true },
          { id: 'i42', name: 'روبيان مشوي (500غ)',    description: 'روبيان طازج مشوي بالثوم والزبدة والليمون',    price: 95, available: true },
          { id: 'i43', name: 'طبق سمك مقلي',         description: 'سمك مقلي مقرمش مع أرز وسلطة وصلصة طرطار',   price: 65, available: true },
        ]
      },
      {
        id: 'c14', name: 'المقبلات',
        items: [
          { id: 'i44', name: 'كاليماري مقلي',         description: 'حبار مقلي مقرمش مع صلصة الطرطار',         price: 45, available: true },
          { id: 'i45', name: 'سلطة المأكولات البحرية', description: 'روبيان وحبار وخضار طازجة بتتبيلة الليمون', price: 55, available: true },
        ]
      },
      {
        id: 'c15', name: 'المشروبات',
        items: [
          { id: 'i46', name: 'ليموناضة طازجة', description: 'عصير ليمون طازج بالنعناع والثلج', price: 18, available: true },
          { id: 'i47', name: 'ماء معدني',       description: 'زجاجة 500 مل',                    price:  5, available: true },
        ]
      },
    ]
  },
  {
    id: 'r6',
    name: 'سوشي يوكي',
    cuisine: 'سوشي · ياباني',
    rating: 4.8,
    reviewCount: 287,
    priceRange: 3,
    deliveryTime: '35-50',
    minOrder: 70,
    deliveryFee: 10,
    neighborhood: 'حي الملقا · الرياض',
    isOpen: true,
    tags: ['سوشي', 'ياباني', 'فاخر', 'تجربة مميزة'],
    emoji: '🍣',
    color: '#db2777',
    categories: [
      {
        id: 'c16', name: 'رولات السوشي',
        items: [
          { id: 'i48', name: 'كاليفورنيا رول (8 قطع)',         description: 'سلطعون + أفوكادو + خيار + بيضة السمك',     price: 38, available: true },
          { id: 'i49', name: 'دراجون رول (8 قطع)',             description: 'جمبري + أفوكادو + صلصة سبيسي + بيضة السمك', price: 48, available: true },
          { id: 'i50', name: 'سبيسي تونا رول (8 قطع)',        description: 'تونا طازجة بصلصة حارة وسمسم',              price: 52, available: true },
          { id: 'i51', name: 'رول الجمبري المقرمش (8 قطع)',   description: 'جمبري مقرمش مع كريم تشيز وأفوكادو',        price: 55, available: true },
        ]
      },
      {
        id: 'c17', name: 'ساشيمي ونيغيري',
        items: [
          { id: 'i52', name: 'ساشيمي السلمون (10 قطع)',  description: 'شرائح سلمون نرويجي طازج',              price: 65, available: true },
          { id: 'i53', name: 'نيغيري السلمون (2 قطع)',   description: 'أرز سوشي مع شريحة سلمون وواساب',      price: 28, available: true },
          { id: 'i54', name: 'نيغيري التونا (2 قطع)',    description: 'أرز سوشي مع شريحة تونا حمراء',        price: 30, available: true },
        ]
      },
      {
        id: 'c18', name: 'المشروبات',
        items: [
          { id: 'i55', name: 'شاي أخضر ياباني',  description: 'شاي ماتشا ساخن أو مثلج',     price: 15, available: true },
          { id: 'i56', name: 'ليمونادة مثلجة',   description: 'عصير ليمون بالزنجبيل والنعناع', price: 18, available: true },
        ]
      },
    ]
  },
];

const CUISINES = [
  { id: 'all',   label: 'الكل',    emoji: '🍽️' },
  { id: 'سعودي', label: 'سعودي',   emoji: '🍖' },
  { id: 'برجر',  label: 'برجر',    emoji: '🍔' },
  { id: 'بيتزا', label: 'بيتزا',   emoji: '🍕' },
  { id: 'شاورما',label: 'شاورما',  emoji: '🌯' },
  { id: 'بحري',  label: 'بحري',    emoji: '🦞' },
  { id: 'سوشي',  label: 'سوشي',    emoji: '🍣' },
];
