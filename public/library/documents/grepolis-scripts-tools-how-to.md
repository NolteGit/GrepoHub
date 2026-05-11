# Grepolis Scripts & Tools - How To

This guide explains what scripts and tools are, how to install Tampermonkey, and how to add or edit Grepolis scripts safely. It is meant for players who have never used browser scripts before.

## What scripts and tools are

A Grepolis tool is any helper that gives you extra overview, planning support, conversion features, or layout improvements outside the normal game UI.

A userscript is a small JavaScript file that runs in your browser while Grepolis is open. It can change the layout, add buttons, improve overviews, or connect Grepolis with another helper page.

Tampermonkey is a browser extension that manages these userscripts. It decides on which pages a script may run, keeps scripts enabled or disabled, and can update scripts when the author provides an update URL.

Scripts are powerful, so only use scripts you trust. A bad script can break the Grepolis layout, slow down the game, or expose information you did not intend to share.

## Are scripts allowed?

Grepolis allows only approved userscripts. The official support article says that scripts not listed there are automatically forbidden.

Before installing a script, check the official list:

- Grepolis Approved User Scripts: https://support.innogames.com/kb/Grepolis/en_DK/5977

If a script is not listed, do not use it unless Support confirms that it is allowed. Also keep approved scripts updated, because old versions can contain forbidden or outdated behavior.

## Install Tampermonkey

Open the official Tampermonkey website and choose your browser:

- Tampermonkey: https://www.tampermonkey.net/

Install the extension from the browser store. After installation, pin the Tampermonkey icon in your browser toolbar if possible. This makes it easier to see when a script is active and to open the dashboard.

After installation, open Grepolis once and click the Tampermonkey icon. If scripts are installed later, Tampermonkey should show them in the menu while Grepolis is open.

## Install a script with an install link

This is the easiest way to install a script.

1. Open the script's official install link. These often end with `.user.js` or are hosted on sites such as Greasy Fork, OpenUserJS, GitHub, or the script author's own page.
2. Tampermonkey should open an installation page automatically.
3. Read the script name, description, author, and permissions.
4. Check that the script matches Grepolis URLs, for example `https://*.grepolis.com/game/*`.
5. Click Install.
6. Refresh Grepolis.
7. Check whether the script appears in the Tampermonkey menu while Grepolis is open.

If the browser only downloads the file instead of opening Tampermonkey, the extension may be disabled, missing permissions, or not installed correctly.

## Add a script manually

Use manual installation only when you trust the source and know that the script is allowed.

1. Click the Tampermonkey icon.
2. Open Dashboard.
3. Click Add a new script.
4. Delete the placeholder text.
5. Paste the full userscript, including the metadata block at the top.
6. Save the script.
7. Refresh Grepolis.

A userscript must include a metadata block. The most important fields are the name and the match rules.

```js
// ==UserScript==
// @name         Example Grepolis Script
// @description  Short description of what the script does
// @match        https://*.grepolis.com/game/*
// @match        http://*.grepolis.com/game/*
// ==/UserScript==
```

If the `@match` lines do not include Grepolis, the script will not run on Grepolis.

## Edit an existing script

Editing scripts is useful for small fixes, personal settings, or snippets that an author asks you to add.

1. Open the Tampermonkey Dashboard.
2. Find the script in the list.
3. Click the edit button.
4. Make the change.
5. Save the script.
6. Refresh Grepolis.

If a script breaks the page, disable it from the Tampermonkey menu and refresh Grepolis. If the game works again, the problem is likely caused by that script or by a conflict with another script.

## Enable, disable, update, or remove a script

To quickly disable a script, open Grepolis, click the Tampermonkey icon, and toggle the script off. Refresh the page afterward.

To update a script, open the Tampermonkey Dashboard and use the update option. Some scripts update automatically when they define update URLs.

To remove a script, open the Dashboard, find the script, and delete it. Refresh Grepolis afterward.

When troubleshooting, disable scripts one by one instead of deleting everything immediately. This helps you find the script that causes the issue.

## Useful checks before using a script

Use this short checklist before installing or editing anything.

- Is the script listed on the official approved scripts page?
- Is the source link the official link from the author or support page?
- Does the script run only on Grepolis pages?
- Does it ask for unusually broad permissions?
- Is the script still maintained?
- Can you disable it quickly if something breaks?

If you are unsure, ask before installing. It is better to lose five minutes than to risk using a forbidden or unsafe script.

## Important scripts and screenshot space

Use this section as a curated collection. Add only scripts that are approved and useful enough for repeated use.

### Grepolis Map Enhancer

Purpose: Map and planning support.

Official / install link: add the approved link here.

Screenshot: add an image of the map tags, command overview, or the exact feature that users should recognize.

### DIO Tools / Flasktools

Purpose: General helper tools and interface improvements.

Official / install link: add the approved link here.

Screenshot: add an image of the visible in-game button or panel.

### Report Converter

Purpose: Report formatting and sharing.

Official / install link: add the approved link here.

Screenshot: add an image of the report conversion flow.

### Alliance-specific snippets

Purpose: Small approved snippets used by your own group, for example layout fixes or command-window helpers.

Official / install link: add the approved link here.

Screenshot: add before and after images so users understand what the snippet changes.

## Recommended workflow

Install Tampermonkey first, then install only one script at a time. Refresh Grepolis after each installation and check whether the game still behaves normally.

Keep the official approved scripts page open while collecting links. If a script is not listed, treat it as forbidden until clarified.

For new players, start with one important script and learn how to disable it before adding more. A small, understood setup is better than a large setup nobody can troubleshoot.
