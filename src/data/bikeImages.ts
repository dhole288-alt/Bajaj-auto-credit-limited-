export interface BikeModelInfo {
  name: string;
  category: string;
  imageUrl: string;
  tagline: string;
}

export const BIKE_MODEL_IMAGES: Record<string, BikeModelInfo> = {
  'pulsar 220f': {
    name: 'PULSAR 220F ABS',
    category: 'Sports Performance',
    imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1000&q=80',
    tagline: 'The Original Definitely Male Icon',
  },
  'pulsar n160': {
    name: 'PULSAR N160 DUAL ABS',
    category: 'Naked Streetfighter',
    imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1000&q=80',
    tagline: 'Precision Craftsmanship & Precision Braking',
  },
  'pulsar n250': {
    name: 'PULSAR N250 ABS',
    category: 'Quarter-Liter Naked',
    imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1000&q=80',
    tagline: 'Torque-On-Demand Powerhouse',
  },
  'pulsar ns400z': {
    name: 'PULSAR NS400Z',
    category: 'Hyper Streetfighter',
    imageUrl: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1000&q=80',
    tagline: 'The Ultimate Thrill Machine',
  },
  'pulsar rs200': {
    name: 'PULSAR RS200 ABS',
    category: 'Super Sports',
    imageUrl: 'https://images.unsplash.com/photo-1547549662-77849a0d6820?auto=format&fit=crop&w=1000&q=80',
    tagline: 'Race-Tuned Fuel Injected Performance',
  },
  'chetak ev': {
    name: 'CHETAK EV PREMIUM',
    category: 'Electric Scooter',
    imageUrl: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&w=1000&q=80',
    tagline: 'Fully Steel Built Electric Mobility',
  },
  'dominar 400': {
    name: 'DOMINAR 400 TOURING',
    category: 'Sports Tourer',
    imageUrl: 'https://images.unsplash.com/photo-1515777315835-281b94c9589f?auto=format&fit=crop&w=1000&q=80',
    tagline: 'Don’t Hold Back - Tour The Unexplored',
  },
};

export function getBikeImageInfo(vehicleModel: string): BikeModelInfo {
  const query = (vehicleModel || '').toLowerCase().trim();
  
  for (const key of Object.keys(BIKE_MODEL_IMAGES)) {
    if (query.includes(key) || key.includes(query)) {
      return BIKE_MODEL_IMAGES[key];
    }
  }

  // Fallback default Pulsar image
  return {
    name: vehicleModel ? vehicleModel.toUpperCase() : 'BAJAJ PULSAR 220F ABS',
    category: 'Bajaj Two Wheeler',
    imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1000&q=80',
    tagline: 'Official Dealership Sanctioned Finance Quotation',
  };
}
