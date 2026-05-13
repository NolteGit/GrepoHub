export type ReferenceQuickLink = {
  id: string;
  title: string;
  iconPath: string;
  url?: string;
  urlDe?: string;
  urlEn?: string;
};

export const referenceQuickLinks: ReferenceQuickLink[] = [
  {
    id: 'grepolis',
    title: 'Grepolis',
    iconPath: '/assets/images/link_buttons/button_grepoGame_256.webp',
    urlDe: 'https://de0.grepolis.com/start/index',
    urlEn: 'https://en-play.grepolis.com',
  },
  {
    id: 'grepodata',
    title: 'GrepoData',
    iconPath: '/assets/images/link_buttons/button_grepoData_256.webp',
    url: 'https://grepodata.com',
  },
  {
    id: 'grepolife',
    title: 'GrepoLife',
    iconPath: '/assets/images/link_buttons/button_grepolife_256.webp',
    url: 'https://grepolife.com',
  },
  {
    id: 'wiki',
    title: 'GrepoWiki',
    iconPath: '/assets/images/link_buttons/button_grepoWiki_256.webp',
    urlDe: 'https://wiki.de.grepolis.com/wiki/Hauptseite',
    urlEn: 'https://wiki.en.grepolis.com/wiki/Main_Page',
  },
  {
    id: 'forum',
    title: 'GrepoForum',
    iconPath: '/assets/images/link_buttons/button_grepoForum_256.webp',
    urlDe: 'https://de.forum.grepolis.com/index.php',
    urlEn: 'https://en.forum.grepolis.com/index.php',
  },
  {
    id: 'support',
    title: 'GrepoSupport',
    iconPath: '/assets/images/link_buttons/button_grepoSupp_256.webp',
    urlDe: 'https://support.innogames.com/kb/Grepolis/de_DE',
    urlEn: 'https://support.innogames.com/kb/Grepolis/en_dk',
  },
];
