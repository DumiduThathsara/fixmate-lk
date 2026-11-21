const CATEGORY_RULES = [
  {
    category: 'Plumbing',
    keywords: [
      'pipe',
      'leak',
      'leaking',
      'tap',
      'faucet',
      'sink',
      'drain',
      'toilet',
      'water',
      'pump',
      'tank',
      'shower',
      'plumbing',
      'clog',
      'burst',
    ],
    normalRange: 'Rs. 1,500 – Rs. 4,500',
    emergencyRange: 'Rs. 2,500 – Rs. 7,500',
    advice:
      'Shut off the main water valve near the meter if water is actively leaking before the technician arrives.',
  },
  {
    category: 'Electrical',
    keywords: [
      'wire',
      'wiring',
      'breaker',
      'trip',
      'tripping',
      'switch',
      'socket',
      'outlet',
      'power',
      'light',
      'bulb',
      'short',
      'spark',
      'sparking',
      'inverter',
      'electrical',
      'shock',
    ],
    normalRange: 'Rs. 1,800 – Rs. 5,000',
    emergencyRange: 'Rs. 3,000 – Rs. 8,500',
    advice:
      'Turn off the affected MCB/main breaker on your distribution board and avoid touching exposed wires.',
  },
  {
    category: 'AC Repair',
    keywords: [
      'ac',
      'a/c',
      'aircon',
      'air conditioner',
      'cooling',
      'cool',
      'compressor',
      'gas',
      'refrigerant',
      'split',
      'hvac',
      'thermostat',
    ],
    normalRange: 'Rs. 2,500 – Rs. 6,500',
    emergencyRange: 'Rs. 3,500 – Rs. 9,000',
    advice:
      'Switch off the AC unit from the wall isolator if it is dripping water indoors or making loud noises.',
  },
  {
    category: 'Carpentry',
    keywords: [
      'door',
      'lock',
      'wood',
      'hinge',
      'cabinet',
      'cupboard',
      'pantry',
      'furniture',
      'table',
      'chair',
      'window',
      'carpenter',
      'carpentry',
      'timber',
    ],
    normalRange: 'Rs. 1,500 – Rs. 5,500',
    emergencyRange: 'Rs. 2,500 – Rs. 7,000',
    advice:
      'Keep any loose hardware or broken hinges aside so the carpenter can assess replacement parts.',
  },
  {
    category: 'Painting',
    keywords: [
      'paint',
      'painting',
      'wall',
      'damp',
      'dampness',
      'ceiling',
      'primer',
      'waterproof',
      'waterproofing',
      'crack',
      'peeling',
      'polish',
    ],
    normalRange: 'Rs. 2,000 – Rs. 8,000',
    emergencyRange: 'Rs. 3,000 – Rs. 9,500',
    advice:
      'Move furniture away from the affected wall area and note if dampness is coming from an adjacent pipe.',
  },
  {
    category: 'Appliance Repair',
    keywords: [
      'fridge',
      'refrigerator',
      'washing',
      'washer',
      'microwave',
      'oven',
      'stove',
      'appliance',
      'purifier',
      'motor',
      'heater',
      'geyser',
    ],
    normalRange: 'Rs. 1,750 – Rs. 6,000',
    emergencyRange: 'Rs. 2,800 – Rs. 8,000',
    advice:
      'Unplug the appliance from the wall socket and note the brand/model number for faster diagnostics.',
  },
];

const EMERGENCY_KEYWORDS = [
  'spark',
  'sparking',
  'smoke',
  'fire',
  'flood',
  'flooding',
  'burst',
  'urgent',
  'emergency',
  'immediately',
  'no power',
  'short circuit',
  'gas leak',
  'overflow',
  'shock',
];

/**
 * Analyze a customer's issue description (and optional image presence)
 * to recommend the right service category, urgency, and estimated LKR cost.
 */
export async function diagnoseIssue(descriptionText = '', hasImage = false) {
  const text = String(descriptionText || '').trim().toLowerCase();

  if (!text) {
    throw new Error('Please describe your issue so we can analyze it.');
  }

  let bestRule = CATEGORY_RULES[0];
  let bestScore = 0;

  for (const rule of CATEGORY_RULES) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (text.includes(kw)) {
        score += kw.includes(' ') ? 2 : 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestRule = rule;
    }
  }

  const isEmergency = EMERGENCY_KEYWORDS.some((kw) => text.includes(kw));
  const urgency = isEmergency ? 'Emergency' : 'Normal';

  const baseConfidence = bestScore === 0 ? 68 : Math.min(94, 74 + bestScore * 6);
  const confidence = Math.min(98, baseConfidence + (hasImage ? 4 : 0));

  return {
    detectedCategory: bestRule.category,
    confidence,
    estimatedRange: isEmergency ? bestRule.emergencyRange : bestRule.normalRange,
    urgency,
    advice: bestRule.advice,
  };
}

const aiDiagnosisService = {
  diagnoseIssue,
};

export default aiDiagnosisService;
