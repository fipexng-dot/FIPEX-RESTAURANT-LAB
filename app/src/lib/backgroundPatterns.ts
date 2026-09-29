export const BACKGROUND_PATTERNS = {
    terracotta: {
        label: 'Terracotta Sunset',
        sidebar: 'linear-gradient(180deg, #2b1b12 0%, #1a1108 100%)',
        accent: '#ea580c',
        accentLight: '#fed7aa',
        pageBg: '#faf6f2',
        swatch: 'linear-gradient(135deg, #ea580c, #7c2d12)',
    },
    olive: {
        label: 'Olive Harvest',
        sidebar: 'linear-gradient(180deg, #1f2917 0%, #141d0f 100%)',
        accent: '#65a30d',
        accentLight: '#d9f99d',
        pageBg: '#f6f7f0',
        swatch: 'linear-gradient(135deg, #65a30d, #365314)',
    },
    amber: {
        label: 'Amber Spice',
        sidebar: 'linear-gradient(180deg, #2b2008 0%, #1a1403 100%)',
        accent: '#d97706',
        accentLight: '#fde68a',
        pageBg: '#fefbf0',
        swatch: 'linear-gradient(135deg, #d97706, #78350f)',
    },
} as const

export type BackgroundKey = keyof typeof BACKGROUND_PATTERNS