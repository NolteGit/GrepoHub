import { quickLinkIconPaths } from './asset-paths';

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
    iconPath: quickLinkIconPaths.grepolis,
    urlDe: 'https://de0.grepolis.com/start/index',
    urlEn: 'https://en-play.grepolis.com',
  },
  {
    id: 'grepodata',
    title: 'GrepoData',
    iconPath: quickLinkIconPaths.grepodata,
    url: 'https://grepodata.com',
  },
  {
    id: 'grepolife',
    title: 'GrepoLife',
    iconPath: quickLinkIconPaths.grepolife,
    url: 'https://grepolife.com',
  },
  {
    id: 'wiki',
    title: 'GrepoWiki',
    iconPath: quickLinkIconPaths.wiki,
    urlDe: 'https://wiki.de.grepolis.com/wiki/Hauptseite',
    urlEn: 'https://wiki.en.grepolis.com/wiki/Main_Page',
  },
  {
    id: 'forum',
    title: 'GrepoForum',
    iconPath: quickLinkIconPaths.forum,
    urlDe: 'https://de.forum.grepolis.com/index.php',
    urlEn: 'https://en.forum.grepolis.com/index.php',
  },
  {
    id: 'support',
    title: 'GrepoSupport',
    iconPath: quickLinkIconPaths.support,
    urlDe: 'https://support.innogames.com/kb/Grepolis/de_DE',
    urlEn: 'https://support.innogames.com/kb/Grepolis/en_dk',
  },
];
