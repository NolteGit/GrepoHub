# GrepoHub - How To

GrepoHub is a local-first helper app for planning cities, troops, references, and small calculations around Grepolis. The home page is only an entry point, so this guide focuses on the working pages.

## Configurations

A configuration is the shared plan behind the planner pages. City Planner and Troops Planner use the same active configuration, so changes on one page belong to the same saved setup.

Use the configuration selector to switch between saved plans. Use **Save** after changing a plan, because changes are stored only in your current browser.

Use **Export** when you want to keep a backup or share a readable version of the current plan. JSON is for restoring the plan later. TXT is for reading and sharing. CSV is for spreadsheet use.

Use **Import JSON** only for files that were exported as GrepoHub JSON. TXT and CSV are not meant to be imported again.

## City Planner

City Planner is used to test building levels and see their population effect. Each building tile has a level selector, quick minimum and maximum buttons, and step controls.

The population number on each tile shows how that building level affects the city. Positive values add population capacity. Negative values consume population.

Use the modifier panel for city-wide effects such as research, special bonuses, or land expansion. The summary panel shows the resulting capacity, used population, and remaining population.

A quick example: raise the Farm level first if you need more capacity. Then increase buildings such as Barracks, Harbour, Academy, or Temple while watching the remaining population.

## Troops Planner

Troops Planner is used to plan unit amounts and estimate their population and resource costs. Units are grouped into land, sea, and mythical sections so the page stays skimmable.

Enter the amount for each unit you want to include. The summary updates the required population and resources. Use the collapse sections when you only need one unit group.

Use this page for rough planning before building or replacing units. It is not meant to replace exact in-game checking, but it helps you compare options quickly.

A quick example: plan your desired biremes, then add land units until the available population is used efficiently. Check the resource summary before deciding whether the plan is realistic.

## Library

The Library contains local documents, guides, notes, and useful links. Each document tile shows the title, metadata, and tags when available.

Use the search field to find documents by title, description, tag, or content. Use the tag filters when the library grows and you only want a specific topic such as Bela or Revo.

When reading a document, use the sidebar as a table of contents. Section headers in the document can be collapsed, which makes longer guides easier to skim.

Some documents can be access-code gated. This is only a light access gate inside the static app. Do not treat it as strong security for private content unless the content is encrypted separately or served behind real authentication.

## Toolbox

Toolbox contains smaller utilities that do not need a full planner page. The current tools are meant for quick lookups and calculations while planning.

Use the calculator for simple planning math. Use any time or lookup tools as support tools, not as the source of truth for in-game actions.

The Toolbox should stay practical and small. Tools that become complex enough can later receive their own dedicated page.

## Export and Backup Workflow

Use JSON when the goal is backup, restore, or sharing a plan with another GrepoHub user. JSON keeps the technical structure of the configuration.

Use TXT when the goal is readability. It is useful for sharing a plan in Discord, saving notes, or checking a plan outside the app.

Use CSV when the goal is spreadsheet work. It avoids repeated metadata and keeps the exported plan easier to filter in Excel.

A simple backup habit is to export JSON after larger changes and keep the file name with the plan name and date.

## Local Data

GrepoHub stores saved configurations in your browser. This keeps the app lightweight and avoids accounts, sync, and server storage.

Because the data is local, clearing browser data can remove saved plans. Export important plans as JSON before changing devices, resetting the browser, or cleaning site data.

Manual import and export are the intended sharing workflow. This keeps the app simple and makes it clear which plan version is being shared.

## Suggested Workflow

Create or select a configuration first. Plan the city buildings, then adjust troops, and finally export the result if you want to keep or share it.

Use the Library while planning if you need guide material. Use the Toolbox for small supporting calculations.

Save often during editing and export JSON when a configuration becomes important.
