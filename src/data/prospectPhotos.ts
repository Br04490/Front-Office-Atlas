interface ProspectPhoto {
  url: string;
  author: string;
  sourceUrl: string;
  license: string;
  licenseUrl: string;
  changes: string;
}

const photos: Record<string, ProspectPhoto> = {
  prosp_2027_cameron_boozer: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Boozer_%E2%80%93_Clemson_%E2%80%93_February_14_2026_%28cropped%29.png',
    author: 'CIarke',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Boozer_%E2%80%93_Clemson_%E2%80%93_February_14_2026_(cropped).png',
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    changes: '2026 photo, cropped from the original; further cropped to fit.',
  },
  prosp_2027_aj_dybantsa: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/da/AJ_Dybantsa_2024.jpg',
    author: 'imanisvision',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:AJ_Dybantsa_2024.jpg',
    license: 'CC BY 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
    changes: '2024 video frame; cropped to fit.',
  },
};

export function getProspectPhoto(id: string): ProspectPhoto | undefined {
  return Object.prototype.hasOwnProperty.call(photos, id) ? photos[id] : undefined;
}
