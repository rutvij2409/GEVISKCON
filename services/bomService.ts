import { BomComponent } from '../types';
import { preloadedRawMaterials } from '../data/preloadedData';

export interface BomRecipe {
  components: BomComponent[];
}

// Helper to find the canonical name for a raw material, accounting for common abbreviations.
const getCanonicalRawMaterialName = (name: string): string => {
  const nameMap: { [key: string]: string } = {
    "lakadi powder": "Lakdi Powder (Saw Dust Powder) for black agarbathi",
    "jose powder": "Joss Powder",
    "kno3": "KNO3 (Potassium Nitrate)",
    "kanda p": "Kanda powder",
    "lakadi p": "Lakdi Powder (Saw Dust Powder) for black agarbathi",
    "jose p": "Joss Powder",
    "bamboo": "Round Bamboo Sticks",
    "loban": "Raw Loban",
    "guggal": "Raw Guggal",
    "devdar wood powder": "Devdar",
    "black salt": "Kala Namak",
    "sainda salt": "Sendha Namak",
    "amla p": "Amla Powder",
    "navsager": "Navsagar",
    "black pepper": "Kali Mirchi",
    "nimbu satva": "Nimbu Satva (citric acid)",
    "jeera": "Whole Jira",
    "saunt": "Sounth",
    "choti harada": "choti harda (balharda)",
    "souf": "Sauf (Variyali)",
    "sikakai": "Shikakai Powder",
    "besan": "Chana Besan Powder",
    "kapoor kachari": "Kapoor Kachri",
    "kapoor kacheri": "Kapoor Kachri",
    "rita": "Ritha",
    "ajwain sattva": "Ajwain Satva",
    "brahmi": "Bramhi",
    "brungaraj": "Bhangara (Bhringraj)",
    "amla": "Amla Powder",
    "jasvandi": "Jasvandi Patta",
    "mehandi": "Mehandi Patta",
    "multani": "Multani Mitti",
    "multani mitti": "Multani Mitti",
    "masoor dal": "Masur Dal",
    "chandan": "Chandan Powder (c-dhoop)",
    "harada p": "Harda",
    "gudbaccha": "Gudbach",
    "satavari": "Shatavari",
    "pila saraso": "Pili Sarso",
    "neem powder": "Neem Chhal Powder",
    "goumutra ark": "Go-Ark 500 ML",
    "petroleum jelly": "Vasline",
    "mom": "Yellow Wax (Bees wax) peela mom",
    "ghee": "Cow Ghee",
    "pudina satva": "Pudina Satva (paper mint)",
    "pudina": "Pudina Satva (paper mint)",
    "ajwain": "Ajwain",
    "lemon grass oil": "Fragrance Lemon Grass",
    "behada p": "Beharda",
    "rose": "Gulab Phool (Rose Flower)",
    "harada": "Harda",
    "behada": "Beharda",
    "dharu haldi": "Daru Haldi",
    "neem ful": "Neem Phool",
    "alovera": "Raw Aloevera from garden",
    "ark": "Go-Ark 500 ML",
    "manjista": "Manjishtha",
    "haldi powder": "Haldi",
    "karela bij": "Karela Beej",
    "jamun bij": "Jamun Beej",
    "giloy": "Giloy Powder",
    "pahadi imili": "Pahadi Imli (Gar Beej)",
    "chiraita": "Chirayta",
    "neem bij": "Neem Beej",
    "goumutra": "Gomutra",
    "neem": "Neem Patta",
    "til oil": "Til Oil",
    "methyl salicylate": "Methyl Salicylate",
  };

  const lowerName = name.toLowerCase();
  const mappedName = nameMap[lowerName] || name;

  const canonicalItem = preloadedRawMaterials.find(
    rm => rm.name.toLowerCase() === mappedName.toLowerCase()
  );

  if (canonicalItem) {
    return canonicalItem.name;
  } else {
    console.warn(
      `Could not find canonical name for raw material: "${name}" (mapped to "${mappedName}")`
    );
    return name;
  }
};

// ===================================================================================
//  BILL OF MATERIALS (RECIPES)
// ===================================================================================
export const BOM_RECIPES_DATA: Record<
  string,
  { components: { rawMaterialName: string; quantity: number }[] }
> = {
  "Dhoop": {
    components: [
      { rawMaterialName: "Kanda powder", quantity: 2 },
      { rawMaterialName: "Lakadi powder", quantity: 7 },
      { rawMaterialName: "Jose powder", quantity: 2 },
      { rawMaterialName: "KNO3", quantity: 1.5 },
      { rawMaterialName: "Dep", quantity: 4.28 },
      { rawMaterialName: "Perfume", quantity: 0.714 }
    ]
  },
  "Agarbatti": {
    components: [
      { rawMaterialName: "Kanda p", quantity: 2 },
      { rawMaterialName: "Lakadi p", quantity: 7 },
      { rawMaterialName: "Jose p", quantity: 1.5 },
      { rawMaterialName: "KNO3", quantity: 0.75 },
      { rawMaterialName: "Gaur Gum", quantity: 0 },
      { rawMaterialName: "Bamboo", quantity: 4 },
      { rawMaterialName: "Dep", quantity: 6.25 },
      { rawMaterialName: "Perfume", quantity: 1.25 }
    ]
  },
  "Havan Masala": {
    components: [
      { rawMaterialName: "Loban", quantity: 30 },
      { rawMaterialName: "Guggal", quantity: 1.2 },
      { rawMaterialName: "Ral", quantity: 6 },
      { rawMaterialName: "Havan Samagri", quantity: 15 },
      { rawMaterialName: "Devdar Wood Powder", quantity: 9 },
      { rawMaterialName: "Perfume", quantity: 1.53 }
    ]
  },
  "Havan Cup": {
    components: [
      { rawMaterialName: "Kanda powder", quantity: 1 },
      { rawMaterialName: "Lakadi powder", quantity: 5 },
      { rawMaterialName: "Jose powder", quantity: 0.825 },
      { rawMaterialName: "KNO3", quantity: 0.8 },
      { rawMaterialName: "Perfume", quantity: 0.5 }
    ]
  },
  "Hingvatti": {
    components: [
      { rawMaterialName: "Black salt", quantity: 1 },
      { rawMaterialName: "Sainda salt", quantity: 0.4 },
      { rawMaterialName: "Amla p", quantity: 1.4 },
      { rawMaterialName: "Navsager", quantity: 0.2 },
      { rawMaterialName: "Ajwain", quantity: 0.2 },
      { rawMaterialName: "Black pepper", quantity: 0.48 },
      { rawMaterialName: "Nimbu satva", quantity: 0.2 },
      { rawMaterialName: "Jeera", quantity: 0.12 },
      { rawMaterialName: "Hing", quantity: 0.16 },
      { rawMaterialName: "Saunt", quantity: 0.24 },
      { rawMaterialName: "Choti harada", quantity: 0.32 },
      { rawMaterialName: "Souf", quantity: 0.24 }
    ]
  },
  "Govardhan Soap": {
    components: [
      { rawMaterialName: "Multani mitti", quantity: 3 },
      { rawMaterialName: "Sikakai", quantity: 0.1 },
      { rawMaterialName: "Besan", quantity: 0.1 },
      { rawMaterialName: "Kapoor kachari", quantity: 0.2 },
      { rawMaterialName: "Jose powder", quantity: 0.1 },
      { rawMaterialName: "Rita", quantity: 0.1 },
      { rawMaterialName: "Kamdhenu Oil", quantity: 0.07 },
      { rawMaterialName: "Neem juice", quantity: 4 },
      { rawMaterialName: "Kapoor", quantity: 0.1 },
      { rawMaterialName: "Ajwain sattva", quantity: 0.03 }
    ]
  },
  "Kesh Sringar": {
    components: [
      { rawMaterialName: "Brahmi", quantity: 0.9 },
      { rawMaterialName: "Brungaraj", quantity: 0.9 },
      { rawMaterialName: "Amla", quantity: 1.5 },
      { rawMaterialName: "Sikakai", quantity: 2.4 },
      { rawMaterialName: "Gomutra", quantity: 60 },
      { rawMaterialName: "Jasvandi", quantity: 1.5 },
      { rawMaterialName: "Mehandi", quantity: 0.5 },
      { rawMaterialName: "Kapoor", quantity: 0.3 },
      { rawMaterialName: "Ajwain", quantity: 0.15 }
    ]
  },
  "Face Glow": {
    components: [
      { rawMaterialName: "Multani", quantity: 40 },
      { rawMaterialName: "Masoor dal", quantity: 6 },
      { rawMaterialName: "Chandan", quantity: 4 },
      { rawMaterialName: "Harada p", quantity: 4 },
      { rawMaterialName: "Gudbaccha", quantity: 2 },
      { rawMaterialName: "Satavari", quantity: 2 },
      { rawMaterialName: "Kapoor kachari", quantity: 4 },
      { rawMaterialName: "Haldi", quantity: 6 },
      { rawMaterialName: "Pila Saraso", quantity: 9 },
      { rawMaterialName: "Neem Powder", quantity: 5 }
    ]
  },
  "Balm": {
    components: [
      { rawMaterialName: "Goumutra ark", quantity: 1 },
      { rawMaterialName: "Petroleum jelly", quantity: 1.25 },
      { rawMaterialName: "Mom", quantity: 1 },
      { rawMaterialName: "Ghee", quantity: 1 },
      { rawMaterialName: "Pudina satva", quantity: 0.35 },
      { rawMaterialName: "Kapoor", quantity: 0.35 },
      { rawMaterialName: "Lemon grass oil", quantity: 0.1 }
    ]
  },
  "Ubtan": {
    components: [
      { rawMaterialName: "Besan", quantity: 4 },
      { rawMaterialName: "Haldi", quantity: 4 },
      { rawMaterialName: "Kapoor kacheri", quantity: 2 },
      { rawMaterialName: "Multani", quantity: 20 },
      { rawMaterialName: "Souf", quantity: 0.4 }
    ]
  },
  "Amrithdhar": {
    components: [
      { rawMaterialName: "Pudina", quantity: 0.6 },
      { rawMaterialName: "Ajwain", quantity: 0.54 },
      { rawMaterialName: "Kapoor", quantity: 0.6 }
    ]
  },
  "Triphala": {
    components: [
      { rawMaterialName: "Behada p", quantity: 6 },
      { rawMaterialName: "Harada p", quantity: 6 },
      { rawMaterialName: "Amla p", quantity: 6 }
    ]
  },
  "Netra Prabha": {
    components: [
      { rawMaterialName: "Rose", quantity: 1 },
      { rawMaterialName: "Amla", quantity: 0.15 },
      { rawMaterialName: "Harada", quantity: 0.5 },
      { rawMaterialName: "Behada", quantity: 0.5 },
      { rawMaterialName: "Dharu haldi", quantity: 0.15 },
      { rawMaterialName: "Neem ful", quantity: 0.3 }
    ]
  }
};

let processedBoms: Map<string, BomRecipe> | null = null;

const processBoms = (): Map<string, BomRecipe> => {
  if (processedBoms) return processedBoms;

  const newBoms = new Map<string, BomRecipe>();

  try {
    for (const productName in BOM_RECIPES_DATA) {
      if (Object.prototype.hasOwnProperty.call(BOM_RECIPES_DATA, productName)) {
        const recipe = BOM_RECIPES_DATA[productName];

        if (!recipe || !Array.isArray(recipe.components)) {
          console.warn(`Malformed recipe structure for "${productName}". Skipping.`);
          continue;
        }

        const validatedComponents = recipe.components
          .map(component => {
            if (
              !component ||
              typeof component.rawMaterialName !== 'string' ||
              typeof component.quantity !== 'number'
            ) {
              console.warn(`Invalid component in recipe for "${productName}":`, component);
              return null;
            }
            const canonicalName = getCanonicalRawMaterialName(component.rawMaterialName);
            return { ...component, rawMaterialName: canonicalName };
          })
          .filter((c): c is BomComponent => c !== null);

        if (validatedComponents.length > 0) {
          newBoms.set(productName, { components: validatedComponents });
        } else {
          console.warn(`Recipe for "${productName}" has no valid components after processing.`);
        }
      }
    }
  } catch (error) {
    console.error(
      "A critical error occurred while processing the Bill of Materials. Some recipes may be unavailable.",
      error
    );
    processedBoms = newBoms;
    return processedBoms;
  }

  processedBoms = newBoms;
  return processedBoms;
};

export const getAllFinishedGoodNames = (): string[] => {
  const boms = processBoms();
  return Array.from(boms.keys());
};

export const getBomForProduct = (productName: string): BomRecipe | null => {
  const boms = processBoms();
  return boms.get(productName) || null;
};