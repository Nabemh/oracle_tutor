
import { Language } from '../types';

interface OfflineResponse {
  keywords: string[];
  response: string;
}

interface LanguagePack {
  intro: string;
  default: string;
  responses: OfflineResponse[];
}

// A highly optimized, rule-based "Mini Model" for offline use.
// Content is tailored to rural Nigerian context.
const KNOWLEDGE_BASE: Record<Language, LanguagePack> = {
  [Language.ENGLISH]: {
    intro: "I am now in Offline Mode. I have a library of knowledge about Farming, Health, and Business stored locally.",
    default: "I am currently offline. I can still help you with:\n- **Farming** (Crops, Fertilizer, Storage)\n- **Health** (Malaria, Typhoid, Hygiene)\n- **Business** (Savings, Pricing)\n\nPlease ask about one of these topics.",
    responses: [
      { 
        keywords: ['hi', 'hello', 'hey', 'greetings', 'oracle'], 
        response: "Hello! I am Oracle. Even without the internet, I am here to share wisdom. Ask me about your farm, your health, or your trade." 
      },
      { 
        keywords: ['farm', 'agriculture', 'crop', 'plant', 'maize', 'cassava', 'yam'], 
        response: "**Farming Advice:**\n1. **Soil Health**: Rotate your crops (e.g., plant beans after maize) to put nutrients back into the soil.\n2. **Natural Fertilizer**: If bags of fertilizer are too expensive, use compost (rotten leaves and animal dung).\n3. **Storage**: Dry your maize and beans thoroughly before storing to prevent weevils. Use airtight bags (PICS bags) if possible." 
      },
      { 
        keywords: ['health', 'sick', 'malaria', 'fever', 'typhoid', 'water'], 
        response: "**Health Tips:**\n1. **Malaria**: Always sleep inside a treated mosquito net. Clear stagnant water around your house where mosquitoes breed.\n2. **Clean Water**: Boil water from streams or wells before drinking to avoid Typhoid and Cholera.\n3. **Emergency**: If a fever is high or lasts more than 2 days, do not guess—go to the nearest clinic immediately." 
      },
      { 
        keywords: ['business', 'money', 'market', 'sell', 'profit', 'trade'], 
        response: "**Business Wisdom:**\n1. **Record Keeping**: Write down every kobo you spend (Capital) and every kobo you make (Sales). You cannot know your profit without records.\n2. **Savings**: Try to save a small amount every market day. Join a trusted local contribution group (Esusu/Adashi) to help save for big expenses.\n3. **Customer**: A happy customer brings two more. Be honest with your measurements." 
      },
      { 
        keywords: ['read', 'literacy', 'learn', 'school'], 
        response: "**Learning to Read:**\nStart with sounds. 'A' is for Ant, 'B' is for Bag. Practice reading the labels on products in the market. Education is the key to growth." 
      }
    ]
  },
  [Language.HAUSA]: {
    intro: "Sannu! Yanzu ina aiki ba tare da yanar gizo ba. Zan iya taimakawa da shawarwari kan noma, lafiya, da kasuwanci.",
    default: "Bani da yanar gizo a yanzu. Amma ina da ilimi akan 'Noma', 'Lafiya', ko 'Kasuwanci'. Me kake son sani?",
    responses: [
      { 
        keywords: ['sannu', 'ina kwana', 'ina wuni', 'yaya'], 
        response: "Sannu! Ina fatan kowa yana lafiya. Ko da babu network, ina nan domin in taimaka maka. Menene damuwarka?" 
      },
      { 
        keywords: ['noma', 'gona', 'shuka', 'taki', 'kwari', 'masara', 'dawa'], 
        response: "**Shawarwarin Noma:**\n1. **Taki**: Idan takin zamani ya yi tsada, yi amfani da kashin shanu ko na kaji. Yana gyara kasa sosai.\n2. **Kwari**: Ganyen darbejiya (Neem) da aka jika yana maganin kwari a gona.\n3. **Ajiye Hatsi**: Don kada kwari su ci wake, a hada shi da barkono bushashe ko a yi amfani da buhunan PICS masu kauri." 
      },
      { 
        keywords: ['lafiya', 'zazzabi', 'cizo', 'ruwa', 'sauro'], 
        response: "**Kula da Lafiya:**\n1. **Zazzabin Cizon Sauro**: Yi amfani da gidan sauro a kowane dare. Kada a bar ruwa ya kwanta a kofar gida.\n2. **Tsafta**: Wanke hannu da sabulu bayan an fito daga bayan gida kafin a ci abinci.\n3. **Asibiti**: Idan zafi ya yi yawa, kar a sha magani barkatai, a je asibiti a duba." 
      },
      { 
        keywords: ['kasuwanci', 'kudi', 'riba', 'adashi', 'ciniki'], 
        response: "**Hikimar Kasuwanci:**\n1. **Lissafi**: Rubuta duk abin da ka siya da wanda ka siyar. Riba tana samuwa ne idan ka cire kudin uwa daga abin da ka siyar.\n2. **Adashi**: Shiga kungiyar adashi mai amana domin tara kudin jari.\n3. **Gaskiya**: Gaskiya ita ce jarin dan kasuwa." 
      }
    ]
  },
  [Language.IGBO]: {
    intro: "Enweghị m ịntanetị ugbua. Enwere m ike inyere gị aka n'ihe gbasara ugbo, ahụike, na ịzụ ahịa.",
    default: "Biko, jụọ m maka 'Ugbo', 'Ahụike', ma ọ bụ 'Ahịa'. Enwere m azịza dị mkpa ebe a.",
    responses: [
      { 
        keywords: ['ndeewo', 'kedu', 'ututu oma', 'ibe'], 
        response: "Ndeewo! Adị m njikere inyere gị aka n'agbanyeghị na enweghị ịntanetị. Kedu ihe na-enye gị nsogbu?" 
      },
      { 
        keywords: ['ugbo', 'ihe', 'kuku', 'ji', 'akpu', 'nri'], 
        response: "**Maka Ndị Ọrụ Ugbo:**\n1. **Nchekwa Ji**: Hụ na ọba ji gị nwere ikuku na-abanye nke ọma ka ji ghara ire ure.\n2. **Gari**: Mgbe ị na-eghe gari, hụ na o ghere nke ọma iji gbuo nsí dị na akpụ.\n3. **Ala**: Tụba ahihia na nsị anụ n'ala ka ọ mee ka ala gị nwee ume." 
      },
      { 
        keywords: ['ahuike', 'iba', 'ogwu', 'mmiri'], 
        response: "**Maka Ahụike Gị:**\n1. **Anwụnta**: Rarụọ n'ime net ka anwụnta ghara ịta gị wee nye gị iba.\n2. **Mmiri Ọṅụṅụ**: Sie mmiri tupu ị ṅụọ ma ọ bụrụ na ọ si n'iyi, iji gbochie ọrịa afọ ọsịsa.\n3. **Ụlọ Ọgwụ**: Ọ bụrụ na ahụ na-ekpo gị ọkụ nke ukwuu, gaa hụ dọkịta ozugbo." 
      },
      { 
        keywords: ['ahia', 'ego', 'erere', 'isusu', 'zuta'], 
        response: "**Maka Ndị Azụmahịa:**\n1. **Idekọ Ihe**: Dee ihe niile ị zụtara na ihe ị rere. Were ego ị rere wepụ ego ị ji zụta ahịa ahụ iji mara uru gị.\n2. **Isusu**: Sonyere otu isusu nwere eziokwu iji nyere gị aka ịchekwa ego maka nnukwu ọrụ.\n3. **Onye Ahịa**: Sọpụrụ onye ahịa gị, ọ ga-akpọtakwara gị ndị ọzọ." 
      }
    ]
  },
  [Language.YORUBA]: {
    intro: "Mo wa ni offline bayi. Sugbon mo le ṣe iranlọwọ pẹlu iṣẹ àgbẹ, ilera, ati okòwò.",
    default: "E jowo, beere nipa 'Oko', 'Ilera', tabi 'Owo'. Mo ni imọran pataki fun yin.",
    responses: [
      { 
        keywords: ['pele', 'bawo', 'e kaaro', 'alafia'], 
        response: "Pẹlẹ o! Mo wa lati ṣe iranlọwọ paapaa laisi intanẹẹti. Kini o fẹ mọ nipa rẹ?" 
      },
      { 
        keywords: ['oko', 'gbin', 'agbado', 'koko', 'isu', 'gari'], 
        response: "**Imọran Iṣẹ Àgbẹ:**\n1. **Ilẹ**: Ma ṣe gbin iru ounjẹ kan naa si aaye kan ni gbogbo igba (Crop rotation). O ma n je ki ile lera.\n2. **Koko**: Ṣe itọju awọn igi koko rẹ nipa yiyo awon ewe ti o ti ku kuro ni asiko.\n3. **Ifipamọ**: Jẹ ki agbado gbẹ daadaa ki o to ko si inu apo, lati yago fun kokoro." 
      },
      { 
        keywords: ['ilera', 'aisan', 'iba', 'omokunrin', 'omobinrin'], 
        response: "**Imọran Ilera:**\n1. **Iba**: Sun labẹ àwọn netiwọki ẹfọn lati dènà iba. Mu omi ti o wa ni agbegbe rẹ kuro.\n2. **Omi**: Se omi ki o to mu, paapaa ti o ba wa lati inu kanga, lati yago fun aisan Typhoid.\n3. **Abojuto**: Ti ara ba gbona ju, ma ṣe ra oogun lori counter lasan, lọ si ile-iwosan." 
      },
      { 
        keywords: ['owo', 'oja', 'ere', 'aje', 'esusu'], 
        response: "**Imọran Okòwò:**\n1. **Akọsilẹ**: Kọ gbogbo ohun ti o ra ati ohun ti o ta silẹ. Ere jẹ (Iye ti o ta - Iye ti o ra).\n2. **Esusu**: Darapọ mọ ẹgbẹ esusu lati fi owo pamọ fun ọjọ iwaju.\n3. **Iwa**: Iwa rere ni oogun owo. Ṣe otitọ pẹlu awọn onibara rẹ." 
      }
    ]
  },
  [Language.PIDGIN]: {
    intro: "How far. Network no dey, but I still get sense for head concerning Farm, Health, and Hustle.",
    default: "Abeg ask me about 'Farm', 'Health', or 'Business'. I fit give you beta update.",
    responses: [
      { 
        keywords: ['how far', 'weta', 'una', 'hello', 'whats up'], 
        response: "I dey hail o! No worry, even without data, Oracle dey for you. Wetin dey sup?" 
      },
      { 
        keywords: ['farm', 'plant', 'agric', 'fertilizer', 'harvest'], 
        response: "**Farm Update:**\n1. **Fertilizer**: If money no dey for fertilizer, use animal dung and dry leaves mix am with sand. E dey work wella.\n2. **Storage**: Make sure say your maize dry well well before you bag am, so weevils no go chop am.\n3. **Rotation**: No dey plant same thing for same place every year, e dey kill soil." 
      },
      { 
        keywords: ['health', 'sick', 'malaria', 'body', 'pain'], 
        response: "**Health Matter:**\n1. **Malaria**: Abeg, use mosquito net sleep every night. E dey save money for hospital bill.\n2. **Water**: Boil your water before you drink am o. E go kill all the germs wey dey cause belle run.\n3. **Hospital**: If body too hot, no go chemist go buy mix-mix drug. Go clinic make dem test you." 
      },
      { 
        keywords: ['market', 'money', 'business', 'profit', 'hustle', 'sell'], 
        response: "**Business & Hustle:**\n1. **Book Keeping**: Write everything wey you sell. If you chop your capital, business go die.\n2. **Ajo/Esusu**: Join contribution group make you fit save money buy beta market.\n3. **Customer**: Customer na king. Treat dem well make dem fit come back tomorrow." 
      }
    ]
  }
};

const detectLanguage = (text: string, currentLanguage: Language): Language => {
  const lowerText = text.toLowerCase();
  
  // Check other languages first
  for (const lang of Object.values(Language)) {
    if (lang === currentLanguage) continue;
    
    const pack = KNOWLEDGE_BASE[lang];
    if (pack) {
        // Check if any keyword matches
        for (const resp of pack.responses) {
            if (resp.keywords.some(k => lowerText.includes(k))) {
                return lang;
            }
        }
    }
  }
  return currentLanguage;
};

export const generateOfflineResponse = (text: string, currentLanguage: Language): { text: string, detectedLanguage: Language } => {
  const detectedLanguage = detectLanguage(text, currentLanguage);
  const pack = KNOWLEDGE_BASE[detectedLanguage] || KNOWLEDGE_BASE[Language.ENGLISH];
  const lowerText = text.toLowerCase();

  // Find matching response
  const match = pack.responses.find(r => 
    r.keywords.some(k => lowerText.includes(k))
  );

  return {
      text: match ? match.response : pack.default,
      detectedLanguage
  };
};

export const getOfflineIntro = (language: Language): string => {
  return KNOWLEDGE_BASE[language]?.intro || KNOWLEDGE_BASE[Language.ENGLISH].intro;
};
