/* ============================================================================
   PAGE 13 — COMMUNITY, LEARNING & BENCHMARKING  (/app/community)

   Blueprint sections covered by this dataset:
   13.1 discussion forums · 13.2 extension library · 13.3 agronomist connect ·
   13.4 farmer groups · 13.5 success stories · plus 13.6 peer benchmarking
   (the page title's third leg), a learning leaderboard and group finance.

   Kenyan demo data: real counties, crops and varieties, KES pricing, 07XX
   phone numbers, KALRO / KEPHIS / MoA sources and Kiswahili microcopy.
   ========================================================================== */

export const COMMUNITY_CONTEXT = {
  farmer: "Mary Wanjiku",
  handle: "@maryWanjiku",
  county: "Kiambu",
  subCounty: "Githunguri",
  phone: "0712 345 678",
  memberSince: "March 2024",
  points: 1840,
  badge: "Verified Farmer",
  rank: 6,
  questionsAsked: 24,
  answersGiven: 61,
  helpfulVotes: 187,
  groupsJoined: 3,
  expertCredits: 2,
  photoCredits: 1,
  savingsThisSeason: 18400,
  language: "English (Kiswahili threads shown too)",
};

/* ------------------------------------------------------- 13.1 discussions */

export type ThreadRole = "Farmer" | "Verified Agronomist" | "Extension Officer" | "Buyer";

export interface ThreadReply {
  id: string;
  author: string;
  handle: string;
  role: ThreadRole;
  county: string;
  posted: string;
  body: string;
  likes: number;
  verified: boolean;
  photo?: string;
}

export interface ForumThread {
  id: string;
  title: string;
  category: string;
  subForum: string;
  author: string;
  handle: string;
  role: ThreadRole;
  county: string;
  posted: string;
  body: string;
  replies: ThreadReply[];
  views: number;
  likes: number;
  solved: boolean;
  pinned: boolean;
  tags: string[];
  language: "SW" | "EN" | "Mixed";
}

export const FORUM_THREADS: ForumThread[] = [
  {
    id: "t-012",
    title: "Black rot kwa cabbage Kiambu — nifanye nini?",
    category: "Pests & diseases",
    subForum: "Identification",
    author: "Mary Wanjiku",
    handle: "@maryWanjiku",
    role: "Farmer",
    county: "Kiambu",
    posted: "12 Sep 2026",
    body:
      "Wameanza kuonekana makala ya V yarangi kwa cabbage zangu wiki hii, na mvua imekuwa ikinyesha sana. Mimea karibu na mfereji ndiyo imeathirika zaidi. Nimeondoa nne na kuzichoma, lakini naogopa itaenea kwa plot yote ya nusu ekari. Nifanye nini kingine?",
    replies: [
      {
        id: "r-1",
        author: "John Kimani",
        handle: "@johnFarmer",
        role: "Farmer",
        county: "Kiambu",
        posted: "12 Sep 2026",
        body:
          "Same hapa Limuru. Nimerukia Mancozeb wiki iliyopita, inasaidia lakini haishiki kabisa. Jaribu kuongeza spacing kidogo na uondoe majani ya chini yaliyoathirika.",
        likes: 18,
        verified: false,
      },
      {
        id: "r-2",
        author: "Peter Otieno",
        handle: "@agronomistPeter",
        role: "Verified Agronomist",
        county: "Nairobi",
        posted: "12 Sep 2026",
        body:
          "Hiyo ni black rot ya kweli (Xanthomonas campestris). Fanya hivi: 1) Ondoa mimea yote iliyoathirika na uichome mbali na shamba. 2) Rukia Mancozeb 80WP 50 g/20 L kila siku 14, mzunguko wa mara tatu. 3) Hakikisha hakuna maji yanayosimama — fungua mfereji wa kando. 4) Epuka kunyunyuzia juu ya majani wakati wa jua kali; rukia asubuhi. 5) Osha mikono na vifaa kati ya mistari. PHI ni siku 14, kwa hivyo usivune kabla ya 22 Sep.",
        likes: 96,
        verified: true,
        photo: "black-rot-lesion-guide.jpg",
      },
      {
        id: "r-3",
        author: "Mary Wanjiku",
        handle: "@maryWanjiku",
        role: "Farmer",
        county: "Kiambu",
        posted: "13 Sep 2026",
        body:
          "Asante sana Peter. Nimefanya zote tano, na mimea mingine inaonekana vizuri. Nimeweka record kwenye diary na spray record SR-004.",
        likes: 24,
        verified: false,
      },
    ],
    views: 1284,
    likes: 142,
    solved: true,
    pinned: true,
    tags: ["black rot", "cabbage", "Kiambu", "PHI"],
    language: "SW",
  },
  {
    id: "t-011",
    title: "Fall armyworm in maize — is Bt spray enough at 3 weeks?",
    category: "Pests & diseases",
    subForum: "Treatment",
    author: "Joseph Kipchoge",
    handle: "@kipchogeMaize",
    role: "Farmer",
    county: "Uasin Gishu",
    posted: "10 Sep 2026",
    body:
      "Scouted 40 plants and found 9 with window-pane damage and frass in the whorl. Plants are about three weeks old. Is Bacillus thuringiensis enough at this stage, or should I add something stronger?",
    replies: [
      {
        id: "r-1",
        author: "Grace Wambui",
        handle: "@graceMoA",
        role: "Extension Officer",
        county: "Nakuru",
        posted: "10 Sep 2026",
        body:
          "At 3 weeks Bt works well if the larvae are still small. Spray into the whorl in the late evening, 40 g/20 L, and repeat after 7 days. Scout again after 5 days — if more than 20% of plants are damaged, add a second mode of action and rotate the group next season.",
        likes: 64,
        verified: true,
      },
      {
        id: "r-2",
        author: "Joseph Kipchoge",
        handle: "@kipchogeMaize",
        role: "Farmer",
        county: "Uasin Gishu",
        posted: "14 Sep 2026",
        body:
          "Sprayed two rounds, damage stopped at 12%. The whorl application made the difference, asante.",
        likes: 21,
        verified: false,
      },
    ],
    views: 932,
    likes: 88,
    solved: true,
    pinned: false,
    tags: ["fall armyworm", "maize", "Bt"],
    language: "EN",
  },
  {
    id: "t-010",
    title: "Cabbage prices at Marikiti this week — KES 22 to 30 per head",
    category: "Business",
    subForum: "Pricing",
    author: "Kamau Brokers",
    handle: "@kamauBrokers",
    role: "Buyer",
    county: "Nairobi",
    posted: "09 Sep 2026",
    body:
      "Grade A heads are moving at KES 28–30 at Marikiti today, Grade B at KES 22. Twiga collection point is paying KES 27 flat for 14,500 heads if graded and crated. If you can hold another two weeks the price usually firms up before the school term.",
    replies: [
      {
        id: "r-1",
        author: "Mary Wanjiku",
        handle: "@maryWanjiku",
        role: "Farmer",
        county: "Kiambu",
        posted: "09 Sep 2026",
        body:
          "Asante Kamau. Nitashikilia hadi 28 Sep, PHI inaisha 22 Sep hivyo ni salama. Nitaongeza grading vizuri ili Grade A iwe nyingi.",
        likes: 33,
        verified: false,
      },
    ],
    views: 1560,
    likes: 74,
    solved: false,
    pinned: false,
    tags: ["market", "prices", "Marikiti"],
    language: "Mixed",
  },
  {
    id: "t-009",
    title: "Drip kit for 0.5 acre — what did you pay, and does it pay back?",
    category: "Techniques",
    subForum: "Irrigation",
    author: "Fatuma Hassan",
    handle: "@fatumaExports",
    role: "Farmer",
    county: "Mombasa",
    posted: "07 Sep 2026",
    body:
      "Quoted KES 42,000 for a drip kit covering half an acre with a 1,000 L tank. For those already using drip: what did your kit cost, and how much water and labour did it actually save per season?",
    replies: [
      {
        id: "r-1",
        author: "Samuel Njoroge",
        handle: "@njorogeDrip",
        role: "Farmer",
        county: "Machakos",
        posted: "07 Sep 2026",
        body:
          "Nililipia KES 38,500 mwaka jana kwa robo ekari, tank ya 1,000 L pamoja na pump ya solari. Nilipunguza maji kwa 45% na kupunguza mtu mmoja wa kumwagilia kila siku — akiba ya KES 12,000 kwa mwezi. Inalipa ndani ya msimu mmoja na nusu.",
        likes: 51,
        verified: false,
      },
      {
        id: "r-2",
        author: "Peter Otieno",
        handle: "@agronomistPeter",
        role: "Verified Agronomist",
        county: "Nairobi",
        posted: "08 Sep 2026",
        body:
          "Add a filter and flush the lines weekly or the emitters block with our water. Also check the kit is sized for 0.5 acre at 2 L/hr per emitter — many kits are sold undersized and then the last rows starve.",
        likes: 47,
        verified: true,
      },
    ],
    views: 1120,
    likes: 69,
    solved: false,
    pinned: false,
    tags: ["irrigation", "drip", "cost"],
    language: "Mixed",
  },
  {
    id: "t-008",
    title: "KS1758 audit: what did the county officer actually ask for?",
    category: "Ask the Expert",
    subForum: "Certification",
    author: "Mary Wanjiku",
    handle: "@maryWanjiku",
    role: "Farmer",
    county: "Kiambu",
    posted: "05 Sep 2026",
    body:
      "I have the spray records, purchase invoices and batch QR codes ready. For those who have gone through the KS1758 audit, what surprised you? What did the officer spend the most time on?",
    replies: [
      {
        id: "r-1",
        author: "Grace Wambui",
        handle: "@graceMoA",
        role: "Extension Officer",
        county: "Nakuru",
        posted: "05 Sep 2026",
        body:
          "Three things: worker health and safety training records, a water quality test for your irrigation source, and whether the records are written as they happen or filled in the night before. Bring the actual receipt photos, not just totals.",
        likes: 112,
        verified: true,
      },
    ],
    views: 2014,
    likes: 156,
    solved: true,
    pinned: true,
    tags: ["KS1758", "audit", "certification"],
    language: "EN",
  },
  {
    id: "t-007",
    title: "Wapi pa kupata mbegu za Shangi za kweli? (counterfeit seed)",
    category: "Crops",
    subForum: "Potatoes",
    author: "Peter Mwangi",
    handle: "@peterNyandarua",
    role: "Farmer",
    county: "Nyandarua",
    posted: "03 Sep 2026",
    body:
      "Nilinunua mbegu za Shangi mwaka huu na mavuno yalikuwa chini kwa nusu. Nadhani zilikuwa fake. Mtu anajua duka la kuaminika la mbegu za viazi karibu na Ol Kalou?",
    replies: [
      {
        id: "r-1",
        author: "Nyandarua Potato Association",
        handle: "@nyandaruaPotato",
        role: "Farmer",
        county: "Nyandarua",
        posted: "03 Sep 2026",
        body:
          "Karibu kwenye association yetu — tunaagiza mbegu kutoka KEPHIS-registered growers na tunapima kila batch. Duka la Kiambaa Stores Ol Kalou pia ni la kuaminika. Kila bag inatakiwa iwe na KEPHIS tag.",
        likes: 58,
        verified: false,
      },
    ],
    views: 876,
    likes: 62,
    solved: true,
    pinned: false,
    tags: ["seed", "potato", "KEPHIS"],
    language: "SW",
  },
  {
    id: "t-006",
    title: "Uasin Gishu maize growers — bulk CAN order for the top-dress window",
    category: "County groups",
    subForum: "Uasin Gishu",
    author: "Uasin Gishu Maize Growers",
    handle: "@ugMaize",
    role: "Farmer",
    county: "Uasin Gishu",
    posted: "01 Sep 2026",
    body:
      "We are aggregating CAN orders before the top-dress window. Retail is KES 4,200 per 50 kg bag; through the group we are at KES 3,780 for 20 bags or more. Delivery to Eldoret collection point. Confirm by 12 Sep.",
    replies: [
      {
        id: "r-1",
        author: "Joseph Kipchoge",
        handle: "@kipchogeMaize",
        role: "Farmer",
        county: "Uasin Gishu",
        posted: "01 Sep 2026",
        body: "Nimeweka order ya bags 12. Savings ni KES 420 kwa bag, asante sana.",
        likes: 22,
        verified: false,
      },
    ],
    views: 640,
    likes: 44,
    solved: false,
    pinned: false,
    tags: ["bulk buying", "CAN", "Uasin Gishu"],
    language: "Mixed",
  },
  {
    id: "t-005",
    title: "Organic conversion on a kale block — how do I stop aphids without synthetics?",
    category: "Techniques",
    subForum: "Organic farming",
    author: "Susan Achieng",
    handle: "@susanKisumu",
    role: "Farmer",
    county: "Kisumu",
    posted: "29 Aug 2026",
    body:
      "Year one of organic conversion on 0.3 acre of kale. Aphids are building and I cannot use Imidacloprid any more. Neem oil seems slow. What actually works?",
    replies: [
      {
        id: "r-1",
        author: "Peter Otieno",
        handle: "@agronomistPeter",
        role: "Verified Agronomist",
        county: "Nairobi",
        posted: "29 Aug 2026",
        body:
          "Neem at 30 ml/20 L every 5 days works if you spray the undersides in the evening. Add soap as a sticker, introduce ladybirds, and plant a border of coriander to bring in beneficials. Expect a slower knockdown — organic control is a programme, not a single spray.",
        likes: 71,
        verified: true,
      },
    ],
    views: 704,
    likes: 55,
    solved: false,
    pinned: false,
    tags: ["organic", "aphids", "kale"],
    language: "EN",
  },
  {
    id: "t-004",
    title: "Greenhouse tomato in Machakos — which film lasts more than one season?",
    category: "Techniques",
    subForum: "Greenhouse",
    author: "Fatuma Hassan",
    handle: "@fatumaExports",
    role: "Farmer",
    county: "Mombasa",
    posted: "26 Aug 2026",
    body:
      "My first 150-micron film went brittle after 11 months of Machakos sun. Anyone getting two seasons out of their film, and which supplier?",
    replies: [
      {
        id: "r-1",
        author: "Samuel Njoroge",
        handle: "@njorogeDrip",
        role: "Farmer",
        county: "Machakos",
        posted: "26 Aug 2026",
        body:
          "Ask for UV-stabilised 200-micron film and check the warranty tag. I now get 2 years. Also run shade net at 30% for the first two months after transplanting.",
        likes: 39,
        verified: false,
      },
    ],
    views: 512,
    likes: 38,
    solved: false,
    pinned: false,
    tags: ["greenhouse", "tomato", "Machakos"],
    language: "EN",
  },
  {
    id: "t-003",
    title: "Nimepanda sukuma wiki lakini majani yanageuka njano — nini tatizo?",
    category: "Crops",
    subForum: "Vegetables",
    author: "Susan Achieng",
    handle: "@susanKisumu",
    role: "Farmer",
    county: "Kisumu",
    posted: "23 Aug 2026",
    body:
      "Sukuma wiki yangu ina majani ya njano kuanzia chini. Nimeweka CAN lakini haisaidii. Udongo ni mweusi na maji yanasimama baada ya mvua.",
    replies: [
      {
        id: "r-1",
        author: "Grace Wambui",
        handle: "@graceMoA",
        role: "Extension Officer",
        county: "Nakuru",
        posted: "23 Aug 2026",
        body:
          "Majani ya njano kuanzia chini kwa udongo mweusi na maji yanayosimama kawaida ni upungufu wa nitrogen pamoja na mizizi iliyozama kwa maji. Fungua mifereji, pandisha mstari (raised beds), kisha weka urea kidogo au CAN mara mbili. Pima pH pia — kama ni chini ya 5.5, fukia chokaa.",
        likes: 83,
        verified: true,
      },
    ],
    views: 918,
    likes: 66,
    solved: true,
    pinned: false,
    tags: ["nutrients", "waterlogging", "kale"],
    language: "SW",
  },
  {
    id: "t-002",
    title: "Warehouse receipt system at Nyandarua — how does payment work?",
    category: "Business",
    subForum: "Markets",
    author: "Peter Mwangi",
    handle: "@peterNyandarua",
    role: "Farmer",
    county: "Nyandarua",
    posted: "20 Aug 2026",
    body:
      "The association is pushing warehouse receipts so we stop selling at harvest when prices are low. When does the payout actually land, and what are the storage charges?",
    replies: [
      {
        id: "r-1",
        author: "Nyandarua Potato Association",
        handle: "@nyandaruaPotato",
        role: "Farmer",
        county: "Nyandarua",
        posted: "20 Aug 2026",
        body:
          "Storage is KES 60 per bag per month, and you can take a 60% advance from the co-op against the receipt. Final payout lands within 7 days of sale. Last season members averaged KES 640 more per bag by holding three months.",
        likes: 46,
        verified: false,
      },
    ],
    views: 588,
    likes: 41,
    solved: false,
    pinned: false,
    tags: ["warehouse receipt", "potato", "finance"],
    language: "EN",
  },
  {
    id: "t-001",
    title: "Group lending: what interest are groups charging members in 2026?",
    category: "Business",
    subForum: "Contracts",
    author: "Samuel Njoroge",
    handle: "@njorogeDrip",
    role: "Farmer",
    county: "Machakos",
    posted: "18 Aug 2026",
    body:
      "Our group is reviewing its loan policy. We charge 1% per month on input loans repaid after harvest. Is that in line with what other Kenyan farmer groups are doing this year?",
    replies: [
      {
        id: "r-1",
        author: "Kiambu Vegetable Farmers",
        handle: "@kiambuVeg",
        role: "Farmer",
        county: "Kiambu",
        posted: "18 Aug 2026",
        body:
          "Sisi tunatoza 1% kwa mwezi tu, na hakuna interest kama mkulima analipa ndani ya siku 30. Tunaweka 2% ya mavuno kwenye group fund badala ya interest kubwa.",
        likes: 37,
        verified: false,
      },
    ],
    views: 460,
    likes: 34,
    solved: false,
    pinned: false,
    tags: ["group finance", "interest", "loans"],
    language: "Mixed",
  },
  {
    id: "t-000",
    title: "Soil testing: KALRO Kabete or a private lab — is the price difference worth it?",
    category: "Ask the Expert",
    subForum: "Soil",
    author: "Joseph Kipchoge",
    handle: "@kipchogeMaize",
    role: "Farmer",
    county: "Uasin Gishu",
    posted: "15 Aug 2026",
    body:
      "KALRO quoted KES 3,200 for a full analysis and a private lab KES 4,500. Does the private report give me anything extra for the money?",
    replies: [
      {
        id: "r-1",
        author: "Peter Otieno",
        handle: "@agronomistPeter",
        role: "Verified Agronomist",
        county: "Nairobi",
        posted: "15 Aug 2026",
        body:
          "Both run the same standard methods. What matters is that the report includes organic matter and a recommendation, and that you use the same lab every season so the trend is comparable. Save the difference and put it into lime.",
        likes: 91,
        verified: true,
      },
    ],
    views: 1032,
    likes: 78,
    solved: true,
    pinned: false,
    tags: ["soil test", "KALRO", "cost"],
    language: "EN",
  },
];

export interface ForumCategory {
  id: string;
  name: string;
  icon: string;
  subForums: string[];
  members: number;
  threads: number;
  accent: "leaf" | "gold" | "clay" | "mint";
}

export const FORUM_CATEGORIES: ForumCategory[] = [
  {
    id: "cat-crops",
    name: "Crops",
    icon: "sprout",
    subForums: ["Maize", "Vegetables", "Potatoes", "Fruits", "Sugarcane", "Beans"],
    members: 12000,
    threads: 340,
    accent: "leaf",
  },
  {
    id: "cat-county",
    name: "County groups",
    icon: "map",
    subForums: ["Kiambu", "Uasin Gishu", "Kakamega", "Nakuru", "Machakos", "Kisumu"],
    members: 8500,
    threads: 210,
    accent: "mint",
  },
  {
    id: "cat-business",
    name: "Business",
    icon: "coins",
    subForums: ["Markets", "Pricing", "Buyers", "Contracts"],
    members: 5200,
    threads: 150,
    accent: "gold",
  },
  {
    id: "cat-pests",
    name: "Pests & diseases",
    icon: "bug",
    subForums: ["Identification", "Treatment", "Prevention"],
    members: 6800,
    threads: 280,
    accent: "clay",
  },
  {
    id: "cat-techniques",
    name: "Techniques",
    icon: "gauge",
    subForums: ["Irrigation", "Organic farming", "Greenhouse", "Conservation ag"],
    members: 4100,
    threads: 95,
    accent: "leaf",
  },
  {
    id: "cat-expert",
    name: "Ask the Expert",
    icon: "badge",
    subForums: ["Agronomist Q&A", "Soil", "Certification", "Livestock"],
    members: 9000,
    threads: 420,
    accent: "mint",
  },
  {
    id: "cat-livestock",
    name: "Livestock",
    icon: "warehouse",
    subForums: ["Dairy", "Poultry", "Goats", "Pigs", "Bees"],
    members: 7400,
    threads: 310,
    accent: "gold",
  },
  {
    id: "cat-postharvest",
    name: "Post-harvest",
    icon: "package",
    subForums: ["Storage", "Grading", "Transport", "Processing"],
    members: 3900,
    threads: 140,
    accent: "mint",
  },
  {
    id: "cat-climate",
    name: "Climate & weather",
    icon: "cloud",
    subForums: ["Rainfall", "Drought", "Irrigation planning", "Agroforestry"],
    members: 4600,
    threads: 128,
    accent: "leaf",
  },
  {
    id: "cat-women",
    name: "Women & youth in agri",
    icon: "users",
    subForums: ["Women in horticulture", "Youth agripreneurs", "Grants", "Training"],
    members: 5600,
    threads: 205,
    accent: "clay",
  },
];

/* --------------------------------------------------- 13.2 extension library */

export interface LibraryResource {
  id: string;
  title: string;
  swahiliTitle: string;
  category: string;
  format: "PDF" | "Video" | "Image + text" | "PDF + video" | "Audio";
  language: "EN" | "SW" | "EN/SW";
  source: string;
  county: string;
  length: string;
  size: string;
  downloads: number;
  rating: number;
  year: number;
  summary: string;
  chapters: string[];
  smsCode: string;
}

export const LIBRARY_RESOURCES: LibraryResource[] = [
  {
    id: "lib-1",
    title: "Cabbage Production Guide — Kiambu County",
    swahiliTitle: "Mwongozo wa Kupanda Kabichi",
    category: "Crop production guides",
    format: "PDF",
    language: "EN/SW",
    source: "KALRO + GrowMO",
    county: "Kiambu",
    length: "12 pages",
    size: "2.4 MB",
    downloads: 18420,
    rating: 4.8,
    year: 2026,
    summary:
      "Variety choice (Gloria F1, Copenhagen Market), nursery management, spacing, fertilizer programme, black rot control and a harvest calendar for Kiambu.",
    chapters: [
      "Variety selection for Kiambu",
      "Nursery and transplanting",
      "Fertilizer programme (DAP, CAN, manure)",
      "Pest and disease calendar",
      "Harvest, grading and crating",
    ],
    smsCode: "CABBAGE KIA",
  },
  {
    id: "lib-2",
    title: "Jinsi ya Kudhibiti Fall Armyworm kwa Mahindi",
    swahiliTitle: "Fall armyworm control in maize",
    category: "Video tutorials",
    format: "Video",
    language: "SW",
    source: "KALRO",
    county: "National",
    length: "8 min",
    size: "64 MB",
    downloads: 27310,
    rating: 4.9,
    year: 2026,
    summary:
      "Scouting, damage thresholds, whorl application technique, safe use of Bt and rotation of active ingredients, filmed in Uasin Gishu.",
    chapters: [
      "Scouting and thresholds",
      "Preparing the knapsack sprayer",
      "Whorl application technique",
      "Safety and PPE",
      "Follow-up scouting",
    ],
    smsCode: "FAW VIDEO",
  },
  {
    id: "lib-3",
    title: "Pest & Disease ID Cards (200 cards)",
    swahiliTitle: "Kadi za Kutambua Wadudu",
    category: "Pest & disease ID cards",
    format: "Image + text",
    language: "EN/SW",
    source: "KALRO, CABI, PCPB",
    county: "National",
    length: "200 cards",
    size: "18 MB",
    downloads: 41260,
    rating: 4.9,
    year: 2025,
    summary:
      "Photo cards with the pest or disease, the crop, the damage signature and the registered products that are legal in Kenya.",
    chapters: ["Identify", "Damage signature", "Registered products", "PHI reminder"],
    smsCode: "ID CARDS",
  },
  {
    id: "lib-4",
    title: "Fertilizer Application Guide for Kenyan Soils",
    swahiliTitle: "Mwongozo wa Kuweka Mbolea",
    category: "Fertilizer application guides",
    format: "PDF",
    language: "EN/SW",
    source: "KEL, Yara, KALRO",
    county: "National",
    length: "24 pages",
    size: "3.8 MB",
    downloads: 22104,
    rating: 4.7,
    year: 2026,
    summary:
      "Blending DAP, CAN, urea and manure by crop and by soil test result, with rates for one acre and a cost table at 2026 prices.",
    chapters: [
      "Reading a soil test",
      "Planting fertilizer",
      "Top dressing splits",
      "Manure and compost",
      "Cost per acre",
    ],
    smsCode: "FERT KEN",
  },
  {
    id: "lib-5",
    title: "Weather & Climate Guide for the Long Rains",
    swahiliTitle: "Mwongozo wa Hali ya Hewa",
    category: "Weather & climate guides",
    format: "PDF",
    language: "EN/SW",
    source: "Kenya Meteorological Department",
    county: "National",
    length: "18 pages",
    size: "2.9 MB",
    downloads: 9864,
    rating: 4.6,
    year: 2026,
    summary:
      "Seasonal forecasts explained in plain language, dekadal rainfall outlook, and how to shift your planting window by county.",
    chapters: ["Reading the seasonal forecast", "Dekadal outlook", "Planting windows", "Flood and drought prep"],
    smsCode: "WEATHER KEN",
  },
  {
    id: "lib-6",
    title: "Market Information Bulletin — September 2026",
    swahiliTitle: "Taarifa ya Bei za Masoko",
    category: "Market information",
    format: "PDF + video",
    language: "EN/SW",
    source: "MoA, KAM",
    county: "National",
    length: "9 pages + 5 min",
    size: "6.1 MB",
    downloads: 14380,
    rating: 4.5,
    year: 2026,
    summary:
      "Wholesale prices at Marikiti, Wakulima and Eldoret, plus buyer demand notes for cabbage, tomato, potato and French beans.",
    chapters: ["Wholesale prices", "Buyer demand", "Export notes", "Price outlook"],
    smsCode: "BEI SEPT",
  },
  {
    id: "lib-7",
    title: "Soil Management for Smallholder Farms",
    swahiliTitle: "Usimamizi wa Udongo",
    category: "Soil management",
    format: "PDF",
    language: "EN/SW",
    source: "KALRO, FAO",
    county: "National",
    length: "32 pages",
    size: "5.2 MB",
    downloads: 12740,
    rating: 4.8,
    year: 2025,
    summary:
      "Sampling correctly, liming acid soils, composting, cover crops and reading the trends between seasons.",
    chapters: ["Sampling", "Lime and pH", "Compost", "Cover crops", "Trend reading"],
    smsCode: "SOIL KEN",
  },
  {
    id: "lib-8",
    title: "Post-Harvest Handling: Crating, Cooling and Transport",
    swahiliTitle: "Usimamizi wa Mavuno Baada ya Kuvuna",
    category: "Post-harvest handling",
    format: "PDF + video",
    language: "EN/SW",
    source: "KALRO, University of Nairobi",
    county: "National",
    length: "22 pages + 12 min",
    size: "9.4 MB",
    downloads: 8420,
    rating: 4.7,
    year: 2026,
    summary:
      "Reducing losses from field to market: crate hygiene, shading, stacking, cooling pads and transport timing.",
    chapters: ["Harvest hygiene", "Crate stacking", "Shade and cooling", "Transport", "Loss measurement"],
    smsCode: "POST HARV",
  },
  {
    id: "lib-9",
    title: "Financial Literacy for Farmer Groups (Kiswahili)",
    swahiliTitle: "Elimu ya Fedha kwa Vikundi vya Wakulima",
    category: "Financial literacy",
    format: "Video",
    language: "SW",
    source: "GrowMO, Equity Bank",
    county: "National",
    length: "6 × 10 min",
    size: "320 MB",
    downloads: 15230,
    rating: 4.8,
    year: 2026,
    summary:
      "Six-part series: budgeting a season, record keeping, group loans, savings, M-Pesa discipline and planning for school fees.",
    chapters: ["Budget", "Records", "Group loans", "Savings", "M-Pesa discipline", "Planning"],
    smsCode: "FEDHA",
  },
  {
    id: "lib-10",
    title: "Certification Guides: KS1758 and GlobalG.A.P.",
    swahiliTitle: "Mwongozo wa Vyeti",
    category: "Certification guides",
    format: "PDF",
    language: "EN",
    source: "KEPHIS, GlobalG.A.P.",
    county: "National",
    length: "28 pages",
    size: "4.6 MB",
    downloads: 6240,
    rating: 4.6,
    year: 2026,
    summary:
      "Every requirement explained in farm language, with the evidence an auditor will ask for and a self-assessment checklist.",
    chapters: ["KS1758 requirements", "GlobalG.A.P. base module", "Evidence files", "Internal audit"],
    smsCode: "CERT KEN",
  },
  {
    id: "lib-11",
    title: "Tomato Greenhouse Starter Pack",
    swahiliTitle: "Kitalu cha Nyanya kwa Greenhouse",
    category: "Crop production guides",
    format: "PDF + video",
    language: "EN/SW",
    source: "KALRO, GrowMO",
    county: "Machakos",
    length: "16 pages + 9 min",
    size: "7.8 MB",
    downloads: 19320,
    rating: 4.7,
    year: 2026,
    summary:
      "Establishing a 8 m × 15 m greenhouse: film choice, drip, variety, trellising, and a disease programme that respects PHIs.",
    chapters: ["Structure and film", "Drip and fertigation", "Varieties (Roma VF, Kilele)", "Trellising", "Disease programme"],
    smsCode: "GH TOMATO",
  },
  {
    id: "lib-12",
    title: "Dairy Cow Feeding on Smallholder Farms",
    swahiliTitle: "Malisho ya Ng'ombe wa Maziwa",
    category: "Crop production guides",
    format: "Video",
    language: "SW",
    source: "KALRO Naivasha",
    county: "Nakuru",
    length: "14 min",
    size: "112 MB",
    downloads: 11260,
    rating: 4.5,
    year: 2025,
    summary:
      "Making silage from maize stover, balancing napier with concentrates and keeping milk yields steady through the dry season.",
    chapters: ["Silage making", "Napier management", "Concentrates", "Dry season plan"],
    smsCode: "DAIRY KEN",
  },
];

export const LIBRARY_CATEGORIES = [
  { category: "Crop production guides", format: "PDF", language: "EN/SW", count: 120, source: "KALRO, MoA" },
  { category: "Video tutorials", format: "Video (2–10 min)", language: "EN/SW", count: 85, source: "KALRO, Farmshine, GrowMO" },
  { category: "Pest & disease ID cards", format: "Image + text", language: "EN/SW", count: 200, source: "KALRO, CABI, PCPB" },
  { category: "Fertilizer application guides", format: "PDF", language: "EN/SW", count: 45, source: "KEL, Yara, KALRO" },
  { category: "Weather & climate guides", format: "PDF", language: "EN/SW", count: 20, source: "Kenya Met" },
  { category: "Market information", format: "PDF + video", language: "EN/SW", count: 30, source: "MoA, KAM" },
  { category: "Soil management", format: "PDF", language: "EN/SW", count: 25, source: "KALRO, FAO" },
  { category: "Post-harvest handling", format: "Video + PDF", language: "EN/SW", count: 35, source: "KALRO, University of Nairobi" },
  { category: "Financial literacy", format: "Video", language: "SW", count: 15, source: "GrowMO, Equity Bank" },
  { category: "Certification guides", format: "PDF", language: "EN", count: 10, source: "KEPHIS, GlobalG.A.P." },
];

/* ------------------------------------------------------ 13.3 agronomist */

export interface Agronomist {
  id: string;
  name: string;
  title: string;
  counties: string;
  speciality: string;
  languages: string;
  rating: number;
  sessions: number;
  responseTime: string;
  fee: number;
  verified: boolean;
  phone: string;
  bio: string;
  years: number;
}

export const AGRONOMISTS: Agronomist[] = [
  {
    id: "ag-1",
    name: "Peter Otieno",
    title: "Senior Agronomist, horticulture",
    counties: "Kiambu, Nairobi, Murang'a",
    speciality: "Cabbage, tomato, black rot and bacterial disease",
    languages: "English, Kiswahili, Dholuo",
    rating: 4.9,
    sessions: 1284,
    responseTime: "Under 30 min",
    fee: 50,
    verified: true,
    phone: "0722 118 447",
    bio:
      "Twelve years with smallholder horticulture, formerly with a county extension team. Specialises in bacterial disease management and residue-safe spray programmes.",
    years: 12,
  },
  {
    id: "ag-2",
    name: "Grace Wambui",
    title: "Extension Officer, Nakuru",
    counties: "Nakuru, Nyandarua, Baringo",
    speciality: "Maize, potato, fertilizer programmes",
    languages: "English, Kiswahili, Kikuyu",
    rating: 4.8,
    sessions: 962,
    responseTime: "Under 1 hr",
    fee: 0,
    verified: true,
    phone: "0710 662 318",
    bio:
      "County extension officer running farmer field schools. Strong on soil fertility, lime programmes and seed quality checks.",
    years: 9,
  },
  {
    id: "ag-3",
    name: "Dr. Aisha Mohamed",
    title: "Plant pathologist",
    counties: "Kilifi, Mombasa, Kwale",
    speciality: "Coastal pests, cashew and mango disease",
    languages: "English, Kiswahili",
    rating: 4.9,
    sessions: 640,
    responseTime: "Under 2 hrs",
    fee: 120,
    verified: true,
    phone: "0733 449 210",
    bio:
      "Plant pathologist working with coastal fruit growers on anthracnose, powdery mildew and post-harvest rot control.",
    years: 14,
  },
  {
    id: "ag-4",
    name: "Samuel Njoroge",
    title: "Irrigation & greenhouse specialist",
    counties: "Machakos, Kitui, Makueni",
    speciality: "Drip, solar pumping, greenhouse tomato",
    languages: "English, Kiswahili, Kikuyu",
    rating: 4.7,
    sessions: 884,
    responseTime: "Under 45 min",
    fee: 100,
    verified: true,
    phone: "0720 334 118",
    bio:
      "Designs drip and solar pumping systems for smallholder blocks and trains on emitter maintenance and fertigation.",
    years: 10,
  },
  {
    id: "ag-5",
    name: "Joseph Kiptoo",
    title: "Livestock & dairy advisor",
    counties: "Uasin Gishu, Trans Nzoia, Nandi",
    speciality: "Dairy nutrition, silage, herd health",
    languages: "English, Kiswahili, Kalenjin",
    rating: 4.8,
    sessions: 742,
    responseTime: "Under 1 hr",
    fee: 80,
    verified: true,
    phone: "0711 908 226",
    bio:
      "Dairy advisor focused on silage quality, feed cost per litre and dry-season planning for smallholder herds.",
    years: 11,
  },
  {
    id: "ag-6",
    name: "Mary Achieng",
    title: "Organic certification advisor",
    counties: "Kisumu, Siaya, Homa Bay",
    speciality: "Organic conversion, KOAN audits, compost",
    languages: "English, Kiswahili, Dholuo",
    rating: 4.7,
    sessions: 415,
    responseTime: "Under 3 hrs",
    fee: 60,
    verified: true,
    phone: "0724 660 913",
    bio:
      "Guides farms through three-year organic conversion, input documentation and premium market access.",
    years: 8,
  },
  {
    id: "ag-7",
    name: "Daniel Mutua",
    title: "Soil scientist",
    counties: "Kitui, Machakos, Embu",
    speciality: "Soil testing, liming, arid-zone fertility",
    languages: "English, Kiswahili, Kamba",
    rating: 4.6,
    sessions: 528,
    responseTime: "Under 2 hrs",
    fee: 90,
    verified: true,
    phone: "0745 220 887",
    bio:
      "Soil scientist helping dryland farms read lab reports, plan lime and choose drought-tolerant varieties.",
    years: 7,
  },
  {
    id: "ag-8",
    name: "Nancy Kilonzo",
    title: "Post-harvest & market access",
    counties: "Nairobi, Kiambu, Kajiado",
    speciality: "Grading, crating, buyer negotiation",
    languages: "English, Kiswahili, Kamba",
    rating: 4.8,
    sessions: 613,
    responseTime: "Under 90 min",
    fee: 110,
    verified: true,
    phone: "0729 447 118",
    bio:
      "Works with farms selling to supermarkets and export packhouses on grading standards, crate hygiene and buyer contracts.",
    years: 9,
  },
  {
    id: "ag-9",
    name: "Fredrick Barasa",
    title: "Poultry & feeds specialist",
    counties: "Kakamega, Bungoma, Vihiga",
    speciality: "Layer and broiler management, feed formulation",
    languages: "English, Kiswahili, Luhya",
    rating: 4.6,
    sessions: 388,
    responseTime: "Under 2 hrs",
    fee: 70,
    verified: true,
    phone: "0715 330 662",
    bio:
      "Advises on poultry housing, vaccination schedules and mixing feed with locally available ingredients.",
    years: 6,
  },
  {
    id: "ag-10",
    name: "Beatrice Njeri",
    title: "Farmer group facilitator",
    counties: "Kiambu, Murang'a, Nyeri",
    speciality: "Group governance, bulk buying, collective marketing",
    languages: "English, Kiswahili, Kikuyu",
    rating: 4.8,
    sessions: 754,
    responseTime: "Under 1 hr",
    fee: 0,
    verified: true,
    phone: "0712 887 004",
    bio:
      "Facilitates farmer groups on governance, group finance and negotiating collective marketing contracts.",
    years: 13,
  },
];

export const AGRONOMIST_SERVICES = [
  { id: "svc-1", label: "Chat with an agronomist", detail: "Text or chat, response within 2 hours", free: "2 sessions / month", cost: 50, unit: "per session after", days: "1 – 2 hours" },
  { id: "svc-2", label: "Photo diagnosis", detail: "Send a photo, get pest or disease ID + treatment", free: "3 photos / month", cost: 30, unit: "per photo after", days: "Same day" },
  { id: "svc-3", label: "Voice call consultation", detail: "15-minute phone consultation", free: "—", cost: 100, unit: "per 15 minutes", days: "Book a slot" },
  { id: "svc-4", label: "Field visit", detail: "Agronomist visits your farm", free: "—", cost: 500, unit: "from, by distance (KES 500 – 2,000)", days: "Within 5 days" },
  { id: "svc-5", label: "Season-long consultation", detail: "Dedicated agronomist for the full season", free: "—", cost: 5000, unit: "from, per season (KES 5,000 – 15,000)", days: "Whole season" },
];

export interface AgroSession {
  id: string;
  agronomist: string;
  topic: string;
  date: string;
  channel: string;
  duration: string;
  cost: number;
  rating: number;
  outcome: string;
  receipt: string;
}

export const AGRO_SESSIONS: AgroSession[] = [
  {
    id: "s-10",
    agronomist: "Peter Otieno",
    topic: "Black rot identification on cabbage Plot 1",
    date: "12 Sep 2026",
    channel: "Photo diagnosis",
    duration: "12 min",
    cost: 0,
    rating: 5,
    outcome: "Confirmed black rot; multi-step treatment plan adopted (SR-004).",
    receipt: "FREE-3OF3",
  },
  {
    id: "s-09",
    agronomist: "Grace Wambui",
    topic: "CAN top-dress split for cabbage",
    date: "05 Sep 2026",
    channel: "Chat",
    duration: "18 min",
    cost: 0,
    rating: 5,
    outcome: "Split application moved to two doses; yield estimate revised upward.",
    receipt: "FREE-2OF2",
  },
  {
    id: "s-08",
    agronomist: "Nancy Kilonzo",
    topic: "Grading and crating for the Twiga order",
    date: "21 Aug 2026",
    channel: "Voice call",
    duration: "15 min",
    cost: 100,
    rating: 4,
    outcome: "Crate hygiene SOP written; Grade A share raised to 57%.",
    receipt: "QKNC21PL8",
  },
  {
    id: "s-07",
    agronomist: "Daniel Mutua",
    topic: "Reading the KALRO lime recommendation",
    date: "18 Aug 2026",
    channel: "Chat",
    duration: "22 min",
    cost: 50,
    rating: 5,
    outcome: "Lime rate split across two seasons to protect cash flow.",
    receipt: "QKDM18PL3",
  },
  {
    id: "s-06",
    agronomist: "Peter Otieno",
    topic: "Aphid pressure after the dry spell",
    date: "20 Aug 2026",
    channel: "Photo diagnosis",
    duration: "9 min",
    cost: 0,
    rating: 5,
    outcome: "Imidacloprid applied with full PPE; aphid count down 88%.",
    receipt: "FREE-1OF3",
  },
  {
    id: "s-05",
    agronomist: "Beatrice Njeri",
    topic: "Group bulk buying for CAN",
    date: "14 Aug 2026",
    channel: "Chat",
    duration: "25 min",
    cost: 0,
    rating: 4,
    outcome: "Joined the Kiambu co-op order; saved KES 480 per bag.",
    receipt: "FREE-1OF2",
  },
  {
    id: "s-04",
    agronomist: "Samuel Njoroge",
    topic: "Drip kit sizing for Plot 2 tomato",
    date: "02 Aug 2026",
    channel: "Voice call",
    duration: "15 min",
    cost: 100,
    rating: 5,
    outcome: "Emitter spacing corrected; water use reduced by 30%.",
    receipt: "QKSN02PL1",
  },
  {
    id: "s-03",
    agronomist: "Grace Wambui",
    topic: "Potato late blight watch on Plot 4",
    date: "12 Apr 2026",
    channel: "Chat",
    duration: "16 min",
    cost: 0,
    rating: 5,
    outcome: "Two preventive Mancozeb sprays scheduled ahead of the rains.",
    receipt: "FREE-2OF2",
  },
  {
    id: "s-02",
    agronomist: "Peter Otieno",
    topic: "Pre-harvest interval planning before harvest",
    date: "28 Mar 2026",
    channel: "Chat",
    duration: "14 min",
    cost: 50,
    rating: 4,
    outcome: "Harvest moved 6 days later to respect the Imidacloprid PHI.",
    receipt: "QKPO28PL6",
  },
  {
    id: "s-01",
    agronomist: "Mary Achieng",
    topic: "Starting organic conversion on the kale block",
    date: "10 Jan 2026",
    channel: "Chat",
    duration: "31 min",
    cost: 60,
    rating: 5,
    outcome: "Conversion block marked on Plot 3; synthetic inputs stopped.",
    receipt: "QKMA10PL4",
  },
];

/* ------------------------------------------------------- 13.4 farmer groups */

export interface FarmerGroup {
  id: string;
  name: string;
  county: string;
  focus: string;
  members: number;
  activities: string[];
  fee: number;
  feeUnit: string;
  meeting: string;
  joined: boolean;
  role: string;
  savings: string;
  contact: string;
  about: string;
}

export const FARMER_GROUPS: FarmerGroup[] = [
  {
    id: "g-1",
    name: "Kiambu Vegetable Farmers",
    county: "Kiambu",
    focus: "Vegetables",
    members: 245,
    activities: ["Group buying", "Collective marketing", "Training"],
    fee: 500,
    feeUnit: "per year",
    meeting: "First Saturday, Githunguri social hall",
    joined: true,
    role: "Member · compliance sub-committee",
    savings: "Shared KES 18,400 in input discounts this season",
    contact: "0720 664 218",
    about:
      "Githunguri-based vegetable group aggregating cabbage, kale and tomato for Nairobi buyers, with a compliance committee that spot-checks member records.",
  },
  {
    id: "g-2",
    name: "Uasin Gishu Maize Growers",
    county: "Uasin Gishu",
    focus: "Maize",
    members: 1200,
    activities: ["Bulk input purchase", "Transport sharing", "Warehouse receipting"],
    fee: 1000,
    feeUnit: "per year",
    meeting: "Monthly, Eldoret agricultural showground",
    joined: false,
    role: "Not a member",
    savings: "CAN at KES 3,780 per bag versus KES 4,200 retail",
    contact: "0722 118 447",
    about:
      "Large-scale maize group negotiating fertilizer prices and shared transport, with a warehouse receipt programme for members.",
  },
  {
    id: "g-3",
    name: "Nyandarua Potato Association",
    county: "Nyandarua",
    focus: "Potatoes",
    members: 890,
    activities: ["Cooperative marketing", "Warehouse receipt", "Seed quality checks"],
    fee: 800,
    feeUnit: "per year",
    meeting: "Second Thursday, Ol Kalou",
    joined: false,
    role: "Not a member",
    savings: "Members averaged KES 640 more per bag by holding stock",
    contact: "0728 445 019",
    about:
      "Potato association running a warehouse receipt system and KEPHIS-registered seed sourcing for Shangi growers.",
  },
  {
    id: "g-4",
    name: "Women in Horticulture KE",
    county: "National",
    focus: "Mixed horticulture",
    members: 3400,
    activities: ["Training", "Market access", "Grants"],
    fee: 0,
    feeUnit: "free to join",
    meeting: "Online, last Friday monthly",
    joined: true,
    role: "Member · Kiambu chapter",
    savings: "Two members won KES 150,000 county grants in 2026",
    contact: "0712 887 004",
    about:
      "National network of women in horticulture with training, grants information and market connections across 30 counties.",
  },
  {
    id: "g-5",
    name: "Organic Farmers Kenya",
    county: "National",
    focus: "Organic",
    members: 1100,
    activities: ["Certification support", "Premium markets", "Input sourcing"],
    fee: 1500,
    feeUnit: "per year",
    meeting: "Quarterly, rotating counties",
    joined: false,
    role: "Not a member",
    savings: "Organic premium of 18–25% on certified produce",
    contact: "0724 660 913",
    about:
      "Supports farms through KOAN certification and connects certified members to premium and export buyers.",
  },
  {
    id: "g-6",
    name: "Machakos Drip Irrigation Club",
    county: "Machakos",
    focus: "Irrigation",
    members: 310,
    activities: ["Equipment sharing", "Spare parts bulk order", "Training"],
    fee: 600,
    feeUnit: "per year",
    meeting: "Third Saturday, Wote",
    joined: false,
    role: "Not a member",
    savings: "Spare parts bought 22% below retail",
    contact: "0720 334 118",
    about:
      "Drip and greenhouse growers sharing maintenance knowledge, spare parts orders and emitter cleaning equipment.",
  },
  {
    id: "g-7",
    name: "Kisumu Organic Kale Producers",
    county: "Kisumu",
    focus: "Kale",
    members: 180,
    activities: ["Collective marketing", "Compost making", "Training"],
    fee: 400,
    feeUnit: "per year",
    meeting: "Fortnightly, Ahero",
    joined: false,
    role: "Not a member",
    savings: "Compost replaced KES 9,000 of purchased fertilizer last season",
    contact: "0724 660 913",
    about:
      "Kale producers around Ahero selling into schools and hospitals as a group, with a shared compost programme.",
  },
  {
    id: "g-8",
    name: "Nakuru Dairy Cooperative",
    county: "Nakuru",
    focus: "Dairy",
    members: 2100,
    activities: ["Milk collection", "Feed bulk buying", "AI services"],
    fee: 1200,
    feeUnit: "per year",
    meeting: "Monthly, Njoro",
    joined: false,
    role: "Not a member",
    savings: "Feed at 15% below retail; daily milk collection",
    contact: "0711 908 226",
    about:
      "Dairy co-op with daily milk collection, bulk feed buying and subsidised artificial insemination services.",
  },
  {
    id: "g-9",
    name: "Mombasa Export Horticulture Cluster",
    county: "Mombasa",
    focus: "Export vegetables",
    members: 95,
    activities: ["Export packing", "GlobalG.A.P. support", "Cold chain"],
    fee: 5000,
    feeUnit: "per year",
    meeting: "Monthly, Changamwe",
    joined: false,
    role: "Not a member",
    savings: "Shared cold room cuts post-harvest losses by 30%",
    contact: "0729 447 118",
    about:
      "Export-oriented cluster with a shared packhouse, cold room and GlobalG.A.P. compliance support.",
  },
  {
    id: "g-10",
    name: "Kiambu Youth Agripreneurs",
    county: "Kiambu",
    focus: "Youth agribusiness",
    members: 420,
    activities: ["Mentorship", "Access to finance", "Digital marketing"],
    fee: 300,
    feeUnit: "per year",
    meeting: "Bi-weekly, Thika",
    joined: true,
    role: "Mentor to 4 young farmers",
    savings: "Three members accessed KES 200,000 youth loans in 2026",
    contact: "0712 887 004",
    about:
      "Youth-focused network on agribusiness skills, digital marketing and access to county and bank finance.",
  },
];

export interface GroupEvent {
  id: string;
  title: string;
  group: string;
  county: string;
  date: string;
  mode: "Field day" | "Training" | "Online" | "Market visit";
  fee: number;
  seats: number;
  taken: number;
  topic: string;
  registered: boolean;
}

export const GROUP_EVENTS: GroupEvent[] = [
  {
    id: "ev-1",
    title: "Black rot field day — Githunguri",
    group: "Kiambu Vegetable Farmers",
    county: "Kiambu",
    date: "26 Sep 2026",
    mode: "Field day",
    fee: 0,
    seats: 60,
    taken: 44,
    topic: "Sanitation, PHI and record keeping on cabbage",
    registered: true,
  },
  {
    id: "ev-2",
    title: "Bulk CAN order confirmation meeting",
    group: "Uasin Gishu Maize Growers",
    county: "Uasin Gishu",
    date: "12 Sep 2026",
    mode: "Training",
    fee: 0,
    seats: 200,
    taken: 168,
    topic: "Aggregating orders and transport sharing",
    registered: false,
  },
  {
    id: "ev-3",
    title: "Warehouse receipt clinic",
    group: "Nyandarua Potato Association",
    county: "Nyandarua",
    date: "08 Oct 2026",
    mode: "Training",
    fee: 200,
    seats: 80,
    taken: 51,
    topic: "How storage advances and final payouts work",
    registered: false,
  },
  {
    id: "ev-4",
    title: "Women in horticulture market access webinar",
    group: "Women in Horticulture KE",
    county: "National",
    date: "30 Sep 2026",
    mode: "Online",
    fee: 0,
    seats: 500,
    taken: 312,
    topic: "Selling to schools, hospitals and supermarkets",
    registered: true,
  },
  {
    id: "ev-5",
    title: "Organic conversion clinic — Ahero",
    group: "Kisumu Organic Kale Producers",
    county: "Kisumu",
    date: "03 Oct 2026",
    mode: "Training",
    fee: 150,
    seats: 45,
    taken: 22,
    topic: "Year-one conversion records and buffer zones",
    registered: false,
  },
  {
    id: "ev-6",
    title: "Drip maintenance and emitter cleaning",
    group: "Machakos Drip Irrigation Club",
    county: "Machakos",
    date: "10 Oct 2026",
    mode: "Field day",
    fee: 100,
    seats: 40,
    taken: 31,
    topic: "Filters, flushing and seasonal servicing",
    registered: false,
  },
  {
    id: "ev-7",
    title: "Marikiti market visit",
    group: "Kiambu Vegetable Farmers",
    county: "Nairobi",
    date: "17 Oct 2026",
    mode: "Market visit",
    fee: 300,
    seats: 25,
    taken: 18,
    topic: "Meet brokers and see grading standards first-hand",
    registered: false,
  },
  {
    id: "ev-8",
    title: "GlobalG.A.P. self-assessment workshop",
    group: "Mombasa Export Horticulture Cluster",
    county: "Mombasa",
    date: "22 Oct 2026",
    mode: "Training",
    fee: 1000,
    seats: 30,
    taken: 12,
    topic: "Completing the v6 base module",
    registered: false,
  },
  {
    id: "ev-9",
    title: "Dairy feed cost clinic",
    group: "Nakuru Dairy Cooperative",
    county: "Nakuru",
    date: "25 Oct 2026",
    mode: "Training",
    fee: 0,
    seats: 120,
    taken: 96,
    topic: "Silage quality and cost per litre",
    registered: false,
  },
  {
    id: "ev-10",
    title: "Youth agribusiness pitch night",
    group: "Kiambu Youth Agripreneurs",
    county: "Kiambu",
    date: "31 Oct 2026",
    mode: "Field day",
    fee: 0,
    seats: 90,
    taken: 63,
    topic: "Pitching for county and bank finance",
    registered: true,
  },
];

export interface GroupOrderItem {
  id: string;
  item: string;
  supplier: string;
  retailPrice: number;
  groupPrice: number;
  unit: string;
  minimum: string;
  closes: string;
  category: string;
}

export const GROUP_ORDER_ITEMS: GroupOrderItem[] = [
  { id: "go-1", item: "CAN 26% N (50 kg)", supplier: "Githunguri Farmers Co-op", retailPrice: 4200, groupPrice: 3780, unit: "bag", minimum: "20 bags", closes: "12 Sep 2026", category: "Fertilizer" },
  { id: "go-2", item: "DAP 18-46-0 (50 kg)", supplier: "Githunguri Farmers Co-op", retailPrice: 6500, groupPrice: 5980, unit: "bag", minimum: "20 bags", closes: "18 Sep 2026", category: "Fertilizer" },
  { id: "go-3", item: "Mancozeb 80WP (1 kg)", supplier: "Githunguri Agro-vet", retailPrice: 800, groupPrice: 720, unit: "kg", minimum: "10 kg", closes: "20 Sep 2026", category: "Crop protection" },
  { id: "go-4", item: "Imidacloprid 200SL (100 ml)", supplier: "Kenya Seed Depot, Thika", retailPrice: 950, groupPrice: 855, unit: "bottle", minimum: "12 bottles", closes: "22 Sep 2026", category: "Crop protection" },
  { id: "go-5", item: "Cabbage Gloria F1 (10 g)", supplier: "Kenya Seed Depot, Thika", retailPrice: 800, groupPrice: 700, unit: "tin", minimum: "25 tins", closes: "25 Sep 2026", category: "Seed" },
  { id: "go-6", item: "Agricultural lime (50 kg)", supplier: "Nakuru Lime Works", retailPrice: 700, groupPrice: 610, unit: "bag", minimum: "40 bags", closes: "30 Sep 2026", category: "Soil amendment" },
  { id: "go-7", item: "Drip tape 16 mm (400 m roll)", supplier: "Machakos Drip Irrigation Club", retailPrice: 8600, groupPrice: 7420, unit: "roll", minimum: "6 rolls", closes: "05 Oct 2026", category: "Irrigation" },
  { id: "go-8", item: "PICS hermetic storage bags (100 kg)", supplier: "Kilimo Bora Supplies", retailPrice: 320, groupPrice: 265, unit: "bag", minimum: "50 bags", closes: "08 Oct 2026", category: "Storage" },
  { id: "go-9", item: "Knapsack sprayer 16 L", supplier: "Jogoo Agro Supplies, Nairobi", retailPrice: 5400, groupPrice: 4860, unit: "unit", minimum: "8 units", closes: "12 Oct 2026", category: "Equipment" },
  { id: "go-10", item: "Bacillus thuringiensis 16000 IU (1 kg)", supplier: "Real IPM Kenya, Thika", retailPrice: 2450, groupPrice: 2180, unit: "kg", minimum: "10 kg", closes: "15 Oct 2026", category: "Crop protection" },
];

export interface GroupContribution {
  id: string;
  member: string;
  group: string;
  purpose: string;
  amount: number;
  date: string;
  status: "Paid" | "Pending" | "Overdue";
  receipt: string;
}

export const GROUP_CONTRIBUTIONS: GroupContribution[] = [
  { id: "c-1", member: "Mary Wanjiku", group: "Kiambu Vegetable Farmers", purpose: "Annual membership", amount: 500, date: "14 Jan 2026", status: "Paid", receipt: "QKMW14PL2" },
  { id: "c-2", member: "Mary Wanjiku", group: "Women in Horticulture KE", purpose: "Chapter subscription", amount: 0, date: "01 Feb 2026", status: "Paid", receipt: "FREE" },
  { id: "c-3", member: "Mary Wanjiku", group: "Kiambu Youth Agripreneurs", purpose: "Mentor pledge", amount: 300, date: "05 Feb 2026", status: "Paid", receipt: "QKMW05PL7" },
  { id: "c-4", member: "Mary Wanjiku", group: "Kiambu Vegetable Farmers", purpose: "Collective marketing levy (2%)", amount: 6960, date: "23 May 2026", status: "Paid", receipt: "QKMW23PL4" },
  { id: "c-5", member: "Mary Wanjiku", group: "Kiambu Vegetable Farmers", purpose: "Field day contribution", amount: 400, date: "26 Sep 2026", status: "Pending", receipt: "—" },
  { id: "c-6", member: "Mary Wanjiku", group: "Kiambu Youth Agripreneurs", purpose: "Youth training fund", amount: 600, date: "31 Oct 2026", status: "Pending", receipt: "—" },
  { id: "c-7", member: "Mary Wanjiku", group: "Kiambu Vegetable Farmers", purpose: "Group input loan repayment", amount: 6000, date: "10 Nov 2026", status: "Overdue", receipt: "—" },
  { id: "c-8", member: "Mary Wanjiku", group: "Kiambu Vegetable Farmers", purpose: "Compliance audit levy", amount: 300, date: "28 Nov 2026", status: "Pending", receipt: "—" },
  { id: "c-9", member: "Mary Wanjiku", group: "Women in Horticulture KE", purpose: "Market access fund", amount: 250, date: "15 Dec 2026", status: "Pending", receipt: "—" },
  { id: "c-10", member: "Mary Wanjiku", group: "Kiambu Youth Agripreneurs", purpose: "Pitch night levy", amount: 400, date: "20 Dec 2026", status: "Pending", receipt: "—" },
];

/* ---------------------------------------------------- 13.5 success stories */

export interface SuccessStory {
  id: string;
  farmer: string;
  county: string;
  crop: string;
  achievement: string;
  income: string;
  story: string;
  quote: string;
  since: string;
  before: string;
  after: string;
  verified: boolean;
  acres: string;
}

export const SUCCESS_STORIES: SuccessStory[] = [
  {
    id: "st-1",
    farmer: "Mary Wanjiku",
    county: "Kiambu",
    crop: "Cabbage, Tomato",
    achievement: "From 0.25 acre to 2 acres in two years using GrowMO",
    income: "KES 1,200,000 / year",
    story:
      "Started with a quarter acre of cabbage sold to brokers at whatever price was offered. Now runs four plots with a season plan, records every spray, sells Grade A crates to a supermarket chain and Grade B at Marikiti.",
    quote: "I used to guess everything. Now I plan, track, and sell smart.",
    since: "March 2024",
    before: "KES 180,000 per season",
    after: "KES 610,000 per season",
    verified: true,
    acres: "2.15 acres",
  },
  {
    id: "st-2",
    farmer: "Joseph Kipchoge",
    county: "Uasin Gishu",
    crop: "Maize",
    achievement: "Increased yield from 15 to 32 bags per acre",
    income: "KES 450,000 / season",
    story:
      "Doubled maize yield over three seasons by following split top-dressing advice, tightening spacing and scouting for fall armyworm every five days instead of once a month.",
    quote: "The AI told me exactly when to top dress. Made all the difference.",
    since: "October 2023",
    before: "15 bags / acre",
    after: "32 bags / acre",
    verified: true,
    acres: "6 acres",
  },
  {
    id: "st-3",
    farmer: "Fatuma Hassan",
    county: "Mombasa",
    crop: "Vegetables",
    achievement: "First woman in her village to export",
    income: "KES 800,000 / year",
    story:
      "Joined the export cluster, completed GlobalG.A.P. with the group's shared packhouse, and shipped her first French beans and snow peas consignment in April 2026.",
    quote: "GrowMO helped me get GlobalG.A.P. certified and connect to an exporter.",
    since: "June 2024",
    before: "Local market only",
    after: "Exporting 4 tonnes per season",
    verified: true,
    acres: "1.5 acres",
  },
  {
    id: "st-4",
    farmer: "Peter Mwangi",
    county: "Nyandarua",
    crop: "Potatoes",
    achievement: "Stopped losing money on counterfeit seed",
    income: "KES 620,000 / season",
    story:
      "Switched to KEPHIS-tagged Shangi seed through the association and used the warehouse receipt programme to sell three months after harvest instead of at the price trough.",
    quote: "Bei ya mbegu ya kweli ni kidogo, lakini mavuno ni mara mbili.",
    since: "January 2025",
    before: "KES 420,000 per season",
    after: "KES 620,000 per season",
    verified: true,
    acres: "3 acres",
  },
  {
    id: "st-5",
    farmer: "Susan Achieng",
    county: "Kisumu",
    crop: "Kale",
    achievement: "Year one of organic conversion complete on 0.3 acre",
    income: "KES 240,000 / year",
    story:
      "Replaced synthetic sprays with neem and Bt, built compost that replaced KES 9,000 of fertilizer, and now sells to two schools as a group contract.",
    quote: "Compost ni mbolea ya bure — na wateja wanapenda mboga safi.",
    since: "January 2026",
    before: "KES 160,000 per year",
    after: "KES 240,000 per year",
    verified: true,
    acres: "0.3 acres (converting)",
  },
  {
    id: "st-6",
    farmer: "Samuel Njoroge",
    county: "Machakos",
    crop: "Tomato (greenhouse)",
    achievement: "Water use cut by 45% with drip and solar pumping",
    income: "KES 540,000 / year",
    story:
      "Replaced furrow irrigation with a solar-pumped drip kit, corrected emitter spacing and stopped losing the last rows to dry soil.",
    quote: "Nilipunguza mtu mmoja wa kumwagilia — akiba ya KES 12,000 kwa mwezi.",
    since: "August 2025",
    before: "Furrow irrigation, 2 workers",
    after: "Drip irrigation, 1 worker",
    verified: true,
    acres: "0.5 acres",
  },
  {
    id: "st-7",
    farmer: "Grace Muthoni",
    county: "Nakuru",
    crop: "Dairy",
    achievement: "Cost per litre cut from KES 42 to KES 31",
    income: "KES 1,020,000 / year",
    story:
      "Made silage from maize stover instead of buying concentrates through the dry season, and moved to the cooperative's bulk feed order.",
    quote: "Silage made the dry season cheap instead of desperate.",
    since: "May 2024",
    before: "KES 42 per litre cost",
    after: "KES 31 per litre cost",
    verified: true,
    acres: "8 acres (fodder)",
  },
  {
    id: "st-8",
    farmer: "Fredrick Barasa",
    county: "Kakamega",
    crop: "Poultry",
    achievement: "Layer flock from 200 to 900 birds",
    income: "KES 780,000 / year",
    story:
      "Tightened vaccination and feed formulation with local ingredients, then supplied eggs to three hotels in Kakamega town on a fixed weekly order.",
    quote: "Feed ndiyo gharama kubwa — tulipoanza kuchanganya sisi wenyewe, faida ikaonekana.",
    since: "February 2025",
    before: "200 birds",
    after: "900 birds",
    verified: true,
    acres: "0.2 acres (poultry)",
  },
  {
    id: "st-9",
    farmer: "Beatrice Njeri",
    county: "Kiambu",
    crop: "Group facilitation",
    achievement: "Kiambu group saved KES 1.4M in input discounts",
    income: "Group savings: KES 1,400,000",
    story:
      "Ran four group buying rounds a year and negotiated collective marketing with two Nairobi buyers, keeping 2% as a group fund instead of paying brokers.",
    quote: "Kikundi kikubwa kinapata bei ya jumla — mtu mmoja hapati hiyo nafasi.",
    since: "April 2023",
    before: "Individual buying at retail",
    after: "Group buying at 10–22% below retail",
    verified: true,
    acres: "245 member farms",
  },
  {
    id: "st-10",
    farmer: "Daniel Mutua",
    county: "Kitui",
    crop: "Sorghum, green grams",
    achievement: "Two harvests in a season in a dry county",
    income: "KES 310,000 / year",
    story:
      "Used soil testing to target lime and manure, then planted short-maturing green grams between sorghum rows to catch the second rains.",
    quote: "Kitui si jangwa — inatakiwa tu kupanga vizuri na kupima udongo.",
    since: "September 2024",
    before: "One harvest per season",
    after: "Two harvests per season",
    verified: true,
    acres: "4 acres",
  },
];

/* ------------------------------------------------- 13.6 peer benchmarking */

export interface BenchmarkMetric {
  id: string;
  metric: string;
  unit: string;
  mine: number;
  countyAvg: number;
  top25: number;
  peerTop: number;
  higherIsBetter: boolean;
  note: string;
}

export const BENCHMARK_METRICS: BenchmarkMetric[] = [
  { id: "bm-1", metric: "Cabbage yield", unit: "heads / acre", mine: 29000, countyAvg: 21500, top25: 34000, peerTop: 37500, higherIsBetter: true, note: "Plot 1 at 60 × 45 cm with four sprays" },
  { id: "bm-2", metric: "Spray cost per acre", unit: "KES", mine: 5180, countyAvg: 6420, top25: 4300, peerTop: 3980, higherIsBetter: false, note: "Lower is better — bio-pesticides where possible" },
  { id: "bm-3", metric: "Grade A share", unit: "%", mine: 69, countyAvg: 54, top25: 78, peerTop: 84, higherIsBetter: true, note: "Crating and shading at the shed" },
  { id: "bm-4", metric: "Post-harvest loss", unit: "%", mine: 8, countyAvg: 17, top25: 6, peerTop: 4, higherIsBetter: false, note: "Crate hygiene and same-day transport" },
  { id: "bm-5", metric: "Labour cost per acre", unit: "KES", mine: 14200, countyAvg: 16800, top25: 12400, peerTop: 11200, higherIsBetter: false, note: "Task-based hiring through the planner" },
  { id: "bm-6", metric: "Soil organic matter", unit: "%", mine: 3.2, countyAvg: 2.4, top25: 3.8, peerTop: 4.4, higherIsBetter: true, note: "Manure 2.5 tonnes per acre each season" },
  { id: "bm-7", metric: "Water use per acre", unit: "litres / week", mine: 9400, countyAvg: 13800, top25: 8200, peerTop: 7400, higherIsBetter: false, note: "Mulching and evening watering" },
  { id: "bm-8", metric: "Record completeness", unit: "%", mine: 78, countyAvg: 41, top25: 88, peerTop: 96, higherIsBetter: true, note: "Diary, spray, purchase and batch records" },
  { id: "bm-9", metric: "Price received vs market", unit: "% of top price", mine: 88, countyAvg: 71, top25: 94, peerTop: 99, higherIsBetter: true, note: "Direct buyer instead of broker at the gate" },
  { id: "bm-10", metric: "Net margin per acre", unit: "KES", mine: 96000, countyAvg: 61000, top25: 124000, peerTop: 148000, higherIsBetter: true, note: "Cabbage LR 2026 after all recorded costs" },
];

export const PEER_GROUPS = [
  { id: "pg-1", name: "Kiambu cabbage growers", members: 245, matches: 4, note: "Same crop, same sub-county, similar acreage" },
  { id: "pg-2", name: "Githunguri irrigation users", members: 88, matches: 3, note: "Rain-fed with supplementary watering" },
  { id: "pg-3", name: "Kiambu Vegetable Farmers", members: 245, matches: 5, note: "Your group — full benchmark sharing" },
  { id: "pg-4", name: "1–2 acre vegetable farms", members: 640, matches: 6, note: "Acreage bracket nationally" },
  { id: "pg-5", name: "KS1758 applicants 2026", members: 132, matches: 4, note: "Farms working on the same certification" },
  { id: "pg-6", name: "Direct-to-buyer farms", members: 410, matches: 3, note: "Selling without a broker" },
  { id: "pg-7", name: "Women in Horticulture KE", members: 3400, matches: 6, note: "National, matches by crop only" },
  { id: "pg-8", name: "Drip adopters in Kiambu", members: 76, matches: 2, note: "Water use comparison group" },
  { id: "pg-9", name: "Organic converters year 1", members: 58, matches: 2, note: "Conversion block benchmarks" },
  { id: "pg-10", name: "Top 25% cabbage yield", members: 61, matches: 2, note: "The group you are trying to join" },
];

export const LEADERBOARD = [
  { id: "lb-1", rank: 1, farmer: "@kipchogeMaize", county: "Uasin Gishu", points: 4120, badge: "Yield Champion", answers: 214 },
  { id: "lb-2", rank: 2, farmer: "@fatumaExports", county: "Mombasa", points: 3680, badge: "Export Pioneer", answers: 168 },
  { id: "lb-3", rank: 3, farmer: "@njorogeDrip", county: "Machakos", points: 3210, badge: "Water Saver", answers: 147 },
  { id: "lb-4", rank: 4, farmer: "@peterNyandarua", county: "Nyandarua", points: 2640, badge: "Seed Guardian", answers: 118 },
  { id: "lb-5", rank: 5, farmer: "@susanKisumu", county: "Kisumu", points: 2150, badge: "Organic Starter", answers: 96 },
  { id: "lb-6", rank: 6, farmer: "@maryWanjiku", county: "Kiambu", points: 1840, badge: "Verified Farmer", answers: 61 },
  { id: "lb-7", rank: 7, farmer: "@johnFarmer", county: "Kiambu", points: 1620, badge: "Helper", answers: 54 },
  { id: "lb-8", rank: 8, farmer: "@graceNakuru", county: "Nakuru", points: 1480, badge: "Dairy Keeper", answers: 41 },
  { id: "lb-9", rank: 9, farmer: "@barasaPoultry", county: "Kakamega", points: 1210, badge: "Poultry Pro", answers: 38 },
  { id: "lb-10", rank: 10, farmer: "@mutuaSoil", county: "Kitui", points: 1050, badge: "Soil Steward", answers: 29 },
];

export const COMMUNITY_BADGES = [
  { id: "bd-1", label: "Verified Farmer", detail: "ID and farm confirmed", earned: true },
  { id: "bd-2", label: "Helpful Hand", detail: "50+ helpful votes on answers", earned: true },
  { id: "bd-3", label: "Record Keeper", detail: "90 days of continuous diary entries", earned: true },
  { id: "bd-4", label: "Group Builder", detail: "Joined 3 farmer groups", earned: true },
  { id: "bd-5", label: "Certified Farm", detail: "Awarded after a certification passes", earned: false },
  { id: "bd-6", label: "Mentor", detail: "Mentored 5 farmers for a full season", earned: false },
];

export const COMMUNITY_CHAT_SEED = [
  { id: "cm-1", author: "Beatrice Njeri", mine: false, at: "08:12", body: "Habari za asubuhi wote. Kumbuka mkutano wa kikundi Jumamosi ya kwanza, Githunguri hall, saa mbili asubuhi." },
  { id: "cm-2", author: "John Kamau", mine: false, at: "08:20", body: "Asante Beatrice. Kuna mtu anaenda Marikiti wiki hii? Naomba tusafirishe pamoja kupunguza gharama." },
  { id: "cm-3", author: "Mary Wanjiku", mine: true, at: "08:26", body: "Mimi naenda Alhamisi. Cabbage zangu zinaenda 28 Sep lakini napeleka sukuma wiki kwanza." },
  { id: "cm-4", author: "Njeri Wambui", mine: false, at: "08:31", body: "Bei ya sukuma Marikiti leo ni KES 40 kwa bunch. Nimeuza zangu zote asubuhi hii." },
  { id: "cm-5", author: "Kamau Brokers", mine: false, at: "08:45", body: "Kwa wale wanaokuja Alhamidi, leta crates safi. Twiga wanakagua crate hygiene kwa gate." },
  { id: "cm-6", author: "Mary Wanjiku", mine: true, at: "08:47", body: "Sawa. Nimeosha crates zote jana na nimeweka SOP ya usafi kwenye records." },
  { id: "cm-7", author: "Beatrice Njeri", mine: false, at: "09:02", body: "Field day ya black rot ni 26 Sep. Mwalimu ni Peter Otieno. Wale hawajaandikisha, jiandikishe leo." },
  { id: "cm-8", author: "John Kamau", mine: false, at: "09:10", body: "Nimejiandikisha. Naomba pia tujadili bei ya jumla ya CAN kwenye mkutano." },
  { id: "cm-9", author: "Mary Wanjiku", mine: true, at: "09:15", body: "Nitatoa ripoti fupi ya compliance committee — tumefikia 70% kwa KS1758." },
  { id: "cm-10", author: "Njeri Wambui", mine: false, at: "09:22", body: "Hongera sana! Hiyo ni habari njema kwa kikundi." },
  { id: "cm-11", author: "Kamau Brokers", mine: false, at: "09:40", body: "Kwa wale wanaohitaji mkataba wa msimu, niko ofisini hadi saa nane jioni." },
  { id: "cm-12", author: "Beatrice Njeri", mine: false, at: "09:52", body: "Asante wote. Tutaendelea kesho. Karibuni wote." },
];

export const EXPERT_CHAT_SEED = [
  { id: "ec-1", author: "Peter Otieno", mine: false, at: "10:04", body: "Habari Mary. Nimeona picha za Plot 1 kwenye thread. Hali inaonekana imetulia baada ya SR-004." },
  { id: "ec-2", author: "Mary Wanjiku", mine: true, at: "10:06", body: "Asante Peter. Mimea mingine inaonekana vizuri lakini naona majani mawili ya njano kando ya mfereji." },
  { id: "ec-3", author: "Peter Otieno", mine: false, at: "10:08", body: "Tuma picha moja ya karibu na mfereji. Kama ni maji yanayosimama, fungua mfereji wa kando badala ya kuongeza dawa." },
  { id: "ec-4", author: "Mary Wanjiku", mine: true, at: "10:09", body: "Sawa, natuma sasa. Pia PHI ya Imidacloprid inaisha 14 Sep — harvest 28 Sep ni salama?" },
  { id: "ec-5", author: "Peter Otieno", mine: false, at: "10:11", body: "Ndiyo, salama kabisa. Siku 14 zimepita na hakuna spray mpya. Weka batch QR baada ya grading." },
  { id: "ec-6", author: "Mary Wanjiku", mine: true, at: "10:12", body: "Asante. Nitakutumia report ya grading mara baada ya harvest." },
];

export const GROUP_ACTIVITY_LOG = [
  { id: "ga-1", at: "20 Sep 2026", text: "Bulk CAN order closed at 168 bags — delivery to Githunguri on 24 Sep." },
  { id: "ga-2", at: "18 Sep 2026", text: "Compliance committee spot-check completed for 20 member farms." },
  { id: "ga-3", at: "16 Sep 2026", text: "Two members signed a collective marketing contract with Twiga Foods." },
  { id: "ga-4", at: "12 Sep 2026", text: "Group input loan fund raised to KES 480,000." },
  { id: "ga-5", at: "05 Sep 2026", text: "Five members graduated from the KS1758 record-keeping training." },
  { id: "ga-6", at: "28 Aug 2026", text: "Group transport sharing saved KES 62,000 across 14 deliveries." },
  { id: "ga-7", at: "21 Aug 2026", text: "Warehouse receipt pilot approved for the potato members." },
  { id: "ga-8", at: "14 Aug 2026", text: "Youth chapter launched with 42 new members under 35." },
  { id: "ga-9", at: "02 Aug 2026", text: "Group buying round: KES 1.4M in input discounts across the season." },
  { id: "ga-10", at: "20 Jul 2026", text: "New crate hygiene SOP adopted by all vegetable members." },
];

export const COMMUNITY_SETTINGS = {
  threadReplies: true,
  mentionAlerts: true,
  groupChat: true,
  expertPromos: false,
  weeklyDigest: true,
  showCounty: true,
  showPhone: false,
  language: "English (Kiswahili threads shown too)",
  digestDay: "Sunday",
};

export const COMMUNITY_FAQ = [
  {
    q: "How do I know an agronomist is genuine?",
    a: "Verified agronomists carry a green badge earned after GrowMO checked their practising certificate, employer or registration. Their county, languages and session history are on the profile.",
  },
  {
    q: "Are the free agronomist sessions really free?",
    a: "Yes. Every farmer gets two chat sessions, three photo diagnoses and two group-facilitator chats each month. Once they are used, paid services start at KES 30 per photo.",
  },
  {
    q: "What happens to my data when I join a group?",
    a: "Your group sees benchmark numbers and your display name, not your farm records or phone number. Record sharing stays under the records page's time-limited links.",
  },
  {
    q: "Can I sell through a farmer group?",
    a: "Yes. Collective marketing lets the group aggregate produce, agree one price with a buyer and settle each member by M-Pesa, minus the agreed group levy.",
  },
  {
    q: "Is the extension library free to download?",
    a: "All KALRO, MoA and Kenya Met material is free. Data charges apply, which is why every resource also has an SMS code for a light offline version.",
  },
  {
    q: "How is the benchmark calculated?",
    a: "GrowMO compares your season records against farms with the same crop, county and acreage bracket. Only farms with complete records are included, so the numbers stay honest.",
  },
];
