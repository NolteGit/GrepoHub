export type ReferenceResourceType = 'tool-guide' | 'guide' | 'reference-document' | 'external-link';

export type ReferenceQuickLink = {
  id: string;
  title: string;
  iconPath: string;
  url?: string;
  urlDe?: string;
  urlEn?: string;
};

type ReferenceSection = {
  id: string;
  title: string;
  summary: string;
};

type ReferenceScript = {
  id: string;
  title: string;
  status: 'Stable' | 'Draft' | 'Review';
  version: string;
  description: string;
  installUrl?: string;
  downloadPath?: string;
};

export type ReferenceResource = {
  id: string;
  title: string;
  type: ReferenceResourceType;
  category: string;
  description: string;
  tags: string[];
  sections: ReferenceSection[];
  filePath?: string;
  externalUrl?: string;
  scripts?: ReferenceScript[];
};

export const referenceQuickLinks: ReferenceQuickLink[] = [
  {
    id: 'grepolis',
    title: 'Grepolis',
    iconPath: '/assets/images/button_grepoGame.png',
    urlDe: 'https://de0.grepolis.com/start/index',
    urlEn: 'https://en-play.grepolis.com',
  },
  {
    id: 'grepodata',
    title: 'GrepoData',
    iconPath: '/assets/images/button_grepoData.png',
    url: 'https://grepodata.com',
  },
  {
    id: 'grepolife',
    title: 'GrepoLife',
    iconPath: '/assets/images/button_grepolife.png',
    url: 'https://grepolife.com',
  },
  {
    id: 'wiki',
    title: 'GrepoWiki',
    iconPath: '/assets/images/button_grepoWiki.png',
    urlDe: 'https://wiki.de.grepolis.com/wiki/Hauptseite',
    urlEn: 'https://wiki.en.grepolis.com/wiki/Main_Page',
  },
  {
    id: 'forum',
    title: 'GrepoForum',
    iconPath: '/assets/images/button_grepoForum.png',
    urlDe: 'https://de.forum.grepolis.com/index.php',
    urlEn: 'https://en.forum.grepolis.com/index.php',
  },
  {
    id: 'support',
    title: 'GrepoSupport',
    iconPath: '/assets/images/button_grepoSupp.png',
    urlDe: 'https://support.innogames.com/kb/Grepolis/de_DE',
    urlEn: 'https://support.innogames.com/kb/Grepolis/en_dk',
  },
];

export const referenceResources: ReferenceResource[] = [
  {
    id: 'tools-scripts',
    title: 'Tools / Scripts',
    type: 'tool-guide',
    category: 'Tools',
    description:
      'Approved in-game helper scripts, installation notes, and stable script references.',
    tags: ['Tampermonkey', 'Scripts', 'Allowed tools'],
    sections: [
      {
        id: 'intro',
        title: 'Overview',
        summary: 'Use this page as the single trusted entry point for allowed helper scripts.',
      },
      {
        id: 'setup',
        title: 'Tampermonkey setup',
        summary:
          'Install the browser extension, add the script, enable it, and verify the active version.',
      },
      {
        id: 'stable-scripts',
        title: 'Latest stable scripts',
        summary: 'Keep install links and downloadable copies for scripts that are allowed in-game.',
      },
      {
        id: 'troubleshooting',
        title: 'Troubleshooting',
        summary:
          'Collect common problems such as script not loading, stale cache, or wrong world settings.',
      },
    ],
    scripts: [
      {
        id: 'grepodata-indexer',
        title: 'GrepoData Indexer',
        status: 'Stable',
        version: 'external',
        description: 'Reference entry for the GrepoData city indexer userscript.',
        installUrl: 'https://grepodata.com/userscript',
      },
      {
        id: 'grepolife-tool',
        title: 'GrepoLife Tool',
        status: 'Stable',
        version: 'external',
        description: 'Small helper script that adds quick access buttons to GrepoLife statistics.',
        installUrl: 'https://grepolife.com/tool/',
      },
    ],
  },
  {
    id: 'game-guides',
    title: 'Game Guides',
    type: 'guide',
    category: 'Guides',
    description: 'Placeholder collection for longer how-tos and gameplay explanation documents.',
    tags: ['Guides', 'How-to', 'Gameplay'],
    sections: [
      {
        id: 'document-list',
        title: 'Document list',
        summary: 'Add Word/PDF guides here when the final files are ready.',
      },
      {
        id: 'reading-flow',
        title: 'Reading flow',
        summary:
          'Long documents should keep a visible sidebar so users can skim, switch, and compare quickly.',
      },
    ],
  },
  {
    id: 'reference-documents',
    title: 'Reference Documents',
    type: 'reference-document',
    category: 'References',
    description:
      'Local PDFs, Word exports, or converted Markdown notes that users may need to open repeatedly.',
    tags: ['Documents', 'PDF', 'Word'],
    sections: [
      {
        id: 'local-files',
        title: 'Local files',
        summary:
          'Store stable local documents under public/assets/docs and link them from this registry.',
      },
      {
        id: 'metadata',
        title: 'Metadata',
        summary:
          'Show document type, topic, last update, and a short description before opening the file.',
      },
    ],
  },
  {
    id: 'external-resources',
    title: 'External Resources',
    type: 'external-link',
    category: 'References',
    description:
      'Less frequent links that are useful, but do not need to be in the top quick-link bar.',
    tags: ['Links', 'External', 'Lookup'],
    sections: [
      {
        id: 'curated-links',
        title: 'Curated links',
        summary:
          'Use this section for resources that are useful but not important enough for the top bar.',
      },
    ],
    externalUrl: 'https://www.innogames.com/games/grepolis/',
  },
];
