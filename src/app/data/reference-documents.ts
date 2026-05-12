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
