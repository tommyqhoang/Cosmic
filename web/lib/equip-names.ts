// Seed of well-known v83 equipment names. Extend by adding itemId → name entries.
// Unknown items fall back to a category label derived from the item ID range.
const KNOWN_ITEMS: Record<number, string> = {
  // Helmets
  1002357: 'Zakum Helmet',
  1002428: 'Zakum Helmet',
  1002140: 'Dark Pirate Hat',
  1002026: 'Musketeer Hat',
  1002238: 'Brown Bandana',
  // Face accessories
  1012010: 'Broken Glasses',
  1012072: 'Maple Bandana White',
  // Eye accessories
  1022047: 'Broken Glasses',
  1022003: 'Spectrum Goggles',
  // Earrings
  1032063: 'Chaos Zakum Earrings',
  1032040: 'Maple Earring',
  1032001: 'Earring',
  // Pendants / necklaces
  1122000: 'Horntail Necklace',
  1122003: 'Horntail Necklace',
  // Belts
  1132000: 'Black Belt',
  // Rings
  1112370: 'Chaos Horntail Ring',
  1112413: 'Chaos Zakum Ring',
  // Weapons — one-handed swords
  1302063: 'Stonetooth Sword',
  1302064: 'Blue Screamer',
  1302000: 'Sword',
  // Two-handed swords
  1402037: 'Stonetooth Sword',
  // Spears / polearms
  1562003: 'Wrist Destroyer',
  // Wands
  1382061: 'Maple Staff',
  // Staves
  1392059: 'Maple Staff',
  // Bows
  1452022: 'Maple Bow',
  // Crossbows
  1462019: 'Maple Crossbow',
  // Claws
  1472063: 'Maple Karst',
  // Knuckles
  1482020: 'Maple Knuckle',
  // Guns
  1492020: 'Maple Gun',
  // Capes
  1102041: 'Pink Gaia Cape',
  1102085: 'Pink Gaia Cape',
  1102084: 'Purple Gaia Cape',
  // Gloves
  1082140: 'Maple Warrior Gloves',
  1082145: 'Work Gloves',
  1082002: 'Work Gloves',
  // Shoes
  1072001: 'Brown Shoes',
  1072107: 'Violet Snowshoes',
  1072227: 'Squishy Shoes',
  // Tops
  1040006: 'Blue One-lined T-Shirt',
  1050006: 'Red-Striped T-Shirt',
  // Bottoms
  1060006: 'Blue Jeans',
  1070006: 'Blue Jeans',
}

// Derive a generic category label from item ID range when name is unknown.
function getItemCategory(itemId: number): string {
  const cat = Math.floor(itemId / 10000)
  if (cat === 100) return 'Helmet'
  if (cat === 101) return 'Face Acc.'
  if (cat === 102) return 'Eye Acc.'
  if (cat === 103) return 'Earring'
  if (cat === 104 || cat === 105) return 'Top'
  if (cat === 106) return 'Bottom'
  if (cat === 107) return 'Shoes'
  if (cat === 108) return 'Gloves'
  if (cat === 109) return 'Shield'
  if (cat === 110) return 'Cape'
  if (cat === 111) return 'Ring'
  if (cat === 112) return 'Pendant'
  if (cat === 113) return 'Belt'
  if (cat === 114) return 'Medal'
  if (cat >= 130 && cat < 140) return 'Sword'
  if (cat >= 140 && cat < 150) return '2H Sword'
  if (cat >= 145 && cat < 146) return 'Bow'
  if (cat >= 146 && cat < 147) return 'Crossbow'
  if (cat >= 147 && cat < 148) return 'Claw'
  if (cat >= 148 && cat < 149) return 'Knuckle'
  if (cat >= 149 && cat < 150) return 'Gun'
  if (cat >= 138 && cat < 139) return 'Wand'
  if (cat >= 139 && cat < 140) return 'Staff'
  if (cat >= 150 && cat < 160) return 'Axe'
  if (cat >= 160 && cat < 170) return '2H Axe'
  if (cat >= 170 && cat < 180) return 'Blunt'
  if (cat >= 180 && cat < 190) return 'Spear'
  if (cat >= 190 && cat < 200) return 'Polearm'
  return 'Equipment'
}

export function getItemName(itemId: number): string {
  return KNOWN_ITEMS[itemId] ?? `${getItemCategory(itemId)} #${itemId}`
}
