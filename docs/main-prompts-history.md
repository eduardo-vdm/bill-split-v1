# Goals of this document, plus notes:
- diary of prompts for myself and others learning how to better instruct AI agents to create solutions directly in the code;
- most of the prompts were trhrough `claude-3.5/7-sonnet` agent in Cursor;
- some prompts inbetween the most relevant ones weren't added in here, trying to make it as objective as possible - it is still huge; (I think though the "small fixes" ones should be in here too - maybe I'll add them in the future with some automated script);

---
---


Create a bill splitting web application called "Bill Split" with the following structure and technologies:

# Core Technology Stack:
- React.js with Vite scaffolding using vanilla JavaScript (not TypeScript)
- Mobile-first UI with responsive design for desktop
- Client-side only (no backend required)
- LocalStorage for data persistence
- Offline-capable functionality

# Project Structure:
1. Set up a Vite project with React
2. Implement React Router for these views:
   - SplashScreen
   - AccountSetupScreen
   - MainScreen (bill list)
   - SettingsScreen
   - NewBillScreen
   - BillDetailsScreen
   - BillOverviewScreen
   - AddPersonScreen
   - AddItemScreen
   - AddSpecialItemScreen (for tax/tip)
   - BillSummaryScreen

# Data Models:
- User (name, language, currency, icon)
- Bill (name, type, place, date, total amount, persons, items)
- Person (name, icon, items assigned)
- Item (name, price, split method, assigned persons)
- SpecialItem (type: tax/tip, percentage/fixed amount)

# Mock Data Requirements:
- Create a comprehensive `mockData.json` file that mirrors the exact structure that will be stored in localStorage
- Include at least 5-10 different bills with varied scenarios:
  * Dinner bills with multiple people and items
  * Shopping trips with uneven splits
  * Bills with tips and taxes applied
  * Bills with different currencies
  * A mix of settled and unsettled bills
- For each bill, include:
  * 3-8 people with unique names and auto-generated icons
  * 5-15 items with different prices and split configurations
  * Various special items (percentage-based tips, fixed taxes)
- Create realistic timestamps, bill names, and locations
- Include user preferences and settings data
- Add historical data showing previously used people names for autocomplete suggestions
- Implement a data initialization service that populates localStorage with this data if it's empty
- Create a "demo mode" toggle that resets the app to this initial state

# State Management:
- Implement React Context API with useReducer
- Create contexts for:
  * UserContext: Managing user settings
  * BillsContext: Managing the collection of bills
  * CurrentBillContext: Managing the active bill being edited
- Set up action creators for all state operations
- Implement localStorage persistence with custom hooks
- Create utility functions for bill calculations

# UI/UX Requirements:
- Set up Tailwind CSS with custom configuration
- Implement a cheerful, colorful UI with playful design elements
- Create smooth transition animations between states/screens
- Add a dark mode toggle with system preference detection
- Implement fun micro-interactions and visual feedback
- Design a friendly, social-oriented interface (not corporate)
- Add visual indicators for split items and person assignments
- Create loading states and error handling UI components

# Enhanced Features:
- Implement autocomplete suggestions for people and items based on previously entered data
- Create functionality to generate and save/share an image "receipt" of the bill breakdown
- Add drag-and-drop functionality for assigning items to people
- Include intuitive split options (equal, percentage, custom amounts)
- Implement search and filter capabilities for bills list
- Add export options (image, text, CSV)

# Animation Requirements:
- Install and configure animation libraries compatible with React
- Create transition effects between screens
- Implement micro-animations for user interactions
- Add loading and success animations
- Ensure animations work well in both light and dark modes

# Accessibility:
- Ensure proper semantic HTML
- Add appropriate ARIA attributes
- Test with keyboard navigation
- Ensure color contrast meets WCAG standards
- Make all interactive elements accessible

# Testing Requirements:
- Set up Jest and React Testing Library
- Create unit tests for calculation utilities
- Implement component tests for UI elements
- Add integration tests for state management and data flow
- Create mock tests for localStorage interactions
- Add snapshot tests for UI components
- Test both light and dark mode themes
- Set up automated test workflows

# Development Workflow:
- Configure ESLint and Prettier
- Set up Husky for pre-commit hooks
- Create a comprehensive README with setup instructions
- Add sample data for development and testing
- Include documentation for component usage

# Performance Optimizations:
- Implement React.memo for expensive components
- Use lazy loading for routes
- Add debouncing for search inputs
- Optimize localStorage access patterns

`3 images attached: wireframes-flow-diagram.png, flowchart-diagram.png, state-context-diagram.png`

---

some code seems to be missing, like the first error the server outputs:

[plugin:vite:import-analysis] Failed to resolve import "./pages/SettingsScreen" from "src\App.jsx". Does the file exist?

can you check if everything was properly created?

---

...

---

Great it is back indeed, nice work. In the same bills list, there's still an issue, even though the bill has already items and prices, the value in the list is always showing 0 value. When you see the bills details you also notice that, although you have add items to the bill, in the bill screen details its value shows as NaN, but if you go to the Bill Summary view, the item price is properly loaded and displayed. Can you try to identify and fix those issues?

---

The value display of the bill in the bills list is fixed;
The values in the @BillDetailsScreen.jsx view isn't though, not only the bill total, which is showing always 0, but also in each item value which is showing a `NaN`

---

It is fixed, nice work. Please add a way to navigate back to the bills list main page at the bill details page, try to follow the same UI you used in the other pages

---

In every page, can you add a "home button", with a proper icon, just by the right of the back button, that'll always send the user to the main page (bills list)?

---

It worked very well, please modify the header at the bill details screen to show the bill's name , not the place name 

---

there must be a way to remove people, items and special items at the bill details view - preferably a trash bin icon to execute the action, feel free to decide what's the best location of each row/element to be deleted. Rhw delete/remove action should update the bill across all views and data.

---

very good, I understand the UX intention only showing the delete action only on hover, but I'll need to change this if the user is on mobile/touch screen. How you would approach this?

---

good change. We also  need a way to edit items, since if I add new people to the bill after items were added, the new people can't be included on any items. Please add an edit action to the items at the bill details, try to use the same UI guidelines from the delete button, using a pencil/edit icon, and updating the data all across the app after saving the changes. The edit view can be the same as the creation one, but already filled with the selected item ready to be modified.

---

...

---

Do you think it is a better UX to go to any edit view by clicking in the name of the person/item/special item or keep it like it is now, with the pencil icon?

---

We're having some kind of endless loop in the bill details view, the error from the browser console:
```
Warning: Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render. Error Component Stack
    at BillDetailsScreen (BillDetailsScreen.jsx:11:20)
    at RenderedRoute (hooks.tsx:665:26)
    at Routes (components.tsx:512:3)
    at div (<anonymous>)
    at App (App.jsx:22:3)
    at CurrentBillProvider (CurrentBillContext.jsx:9:39)
    at BillsProvider (BillsContext.jsx:9:33)
    at UserProvider (UserContext.jsx:9:32)
```

---

for some reason the Dark mode, in the settings, isn't working. The setting is saved, but the visuals never change, it keeps Light mode visuals regardless. Can you try to identify the issue?

---

It is fixed, thank you.

But there are some elements throughout the app that are forcing light background colors even on Dark theme, like in@BillDetailsScreen.jsx line 100: `<div className="bg-white rounded-lg p-4 shadow">`

is this supposed to be like that? If not, won't it mess up the visuals if removed or it needs to have a different applied bg class that will properly respond the current theme?

---

There are still some left behind cases, like in @MainScreen.jsx line 57

please review if there are any other views in the whole app with the same case and change them

---

in the Bill Summary view, I need some changes:
- add the bill name and the place (if any provided) somewhere in the view, and  also copy them when doing the share/copy to clipboard action.
- right below the Subtotal row there are the rows describing the values from the added special items, but no name, add the names;
- it would be better if, at each person's card, the special items share row actually listed each individual special item with its type and value, and not their sum;

---

great, most changes worked as expected, but both the bill's name and place still aren't being displayed in the @BillSummaryScreen.jsx 

---

Please add a trash bin icon in the bottom right of each of the bill cards in the bills list view. Do not implent it right now, but we'll use it to be able to delete a saved bill, so try to make it  to look like the same we did in the bill details view.

---

implement the action of deleting the saved bill when the user click in the icon we just added in the bill card

---

Is the confirmation dialog using the default builtin browser dialog?

---

I encoutered an error when creating a bill: when we save the new bill through the CREATE BILL button in the @NewBillScreen.jsx view, the app doesn't redirect you to the bills list view, and this error show up in the console:
```
Uncaught TypeError: Cannot read properties of undefined (reading 'id')
    at handleSubmit (NewBillScreen.jsx:53:35)
```
The bill is actually created and saved, since if I manually go back to the bills list view it's there.

---

Whenever I create a new bill and am redirected to the new bill's details view, it seems it's persisting the last bill I viewed/edited persons, and only that.

Example:
1. Opened Bill 1, which already has 5 people added, add another person, now with 6;
2. Created a new bill right after that, Bill 2, when saved/created bill, and redirected to the bill details, everything besides the bill's details is properly emply except the people which now has the same people (6) from Bill 1.

Can you try to identify the issue?

---

it is broken now - when I create a new Bill not only it doesn't seem to be saved, but the @BillOverviewScreen.jsx is blank, breaking with:
```
BillOverviewScreen.jsx:94 
 Uncaught TypeError: Cannot read properties of undefined (reading 'length')
    at BillOverviewScreen (BillOverviewScreen.jsx:94:24)
```

---

Why are we using the @BillOverviewScreen.jsx after creating a new bill instead of simply using the @BillDetailsScreen.jsx like we use it when any bill is clicked in the bills list view?

---

add an edit/pencil icon right to the left of the bill card delete action that will allow the user to edit the initial details of that bill, using the new bill view, just like we did  with the bill's persons and items edit actions.

---

(a lot of previous prompts before the next ones, ngl it was just forgetting to update this)

---

Don't do it yet, but describe what steps should be done, with best UX practices, for the following feature:
1. At the Bill Summary screen, the share button would open a dialog, a brief description that the content would be copied to be pasted anywhere - since not everyone directly understands that -, in the most user-friendly possible.
2. The dialog would have 3 options:
- As text (the already existent functionality, copying to the clipboard as text);
- As image (we would need to implement this: using the most used library to screenshot the whole summary view, scrolling and stitching the image if needed, and again being copied to the clipboard);
- Cancel;

---

Great work with that overview. Please proceed implementing all the steps. Don't need to stop for me to review each step, let's do all in one go so I can test and review it in the end. Additional details to take into account:
- We already have a Share button at the bill summary screen, try to reuse it instead of reimplementing it;
- Dont' forget about implementing the already present localization system where needed, for English, Spanish and Portuguese - try to not modify what is already structured, only add what's needed.
- Try to make it as simple as possible, mainly the UI, and do not install any additional UI libraries, use what we already have;
- Try to not overcomplicate Vite's current configuration, last try we ended up entangling it with additional dependencies on babel plugins.

---

For some reason, the `Dialog` component is being initialized when rendering the bill summary screen, when you created a new custom dialog component, why? It's causing a breaking error, since it's initialized without all its parameters defined, like àctions`and others.

Can you identify from where that `Dialog` component is being init, why, and try to fix that if not needed at the bill summary view?

If it is needed, it's not being properly init, since the console throws this error:
Uncaught TypeError: Cannot read properties of undefined (reading 'map')
    at Dialog (Dialog.jsx:54:28)

---

when sharing as image, is it possible to force the view to render the screenshot to:
- have 400 px width;
- hide the share button;

if possible this should be done behind the scenes, the user doesn't need to see those changes, and if it in fact changed the actual view, the previous state should be back exactly as it was before sharing (copying) as image.

---

please make sure the background of the clone to create the screenshot/image is the same as the original view, because when in Dark mode the background is coming white

---

If I were to build a production build for this application, what would be the commands to run, and which variations I would have? Also, I'm guessing the final build would be completely static, since there's no remote database needs at the moment - can you recommend any free or low-cost hosting service where I could deploy it only for mvp display reasons?

---

Don't need to modify nothing for now, but describe to me:
- If I wanted you to restyle almost all of the app visuals, an overhaul, what kind of information would be best to help you to do it?
- And, if said information is provided, can you briefly describe what steps you would execute?

---

Can you explain to me why in @helpers.js we have 7 items in currencies, when throughout the app we are only using 3? Are we using the currencies from @helpers.js ? (do not modify anything for now, I just want to understand the reason, and if we are having two sources of truth, and one obsolete, or it was just a incomplete implementation)

---

Yes, please refactor throughout the whole application to use the single source of truth from @helpers.js for currencies, but consider:
- The 'name' property in the currencies array at @helpers.js should use the same language as their countries, just like the languages array in the same file does it;
- All the select UI elements options should have the label with the pattern "{name property} {code property} {symbol property}";
- We also use currencies selection in the splash screen, when first setting up the user;
- Do a research to know the 10 more popular currencies in the world and add them to that currencies array in @helpers.js , if they are not added already;
- Do another research and also add the 5 more popular currencies in Latin America to that array, only add the ones that aren't added already;
- Do another research and also add the 2 more popular currencies in Africa to that array, only add the ones that aren't added already;
- Sort the array and so the select elements options by the name property;

---

Strings both on @SplashScreen.jsx and @AccountSetupScreen.jsx aren't properly localized

---

Since we don't have the language option manually selected by the user yet, and since they are hardcoded only as 'en', 'es' and 'pt' to use later by our currently implemented localization system and selector, we need to use the language information the browser give us. And usually it is using standards like "en-US" and not just "en". We need to create a fallback language resolver for whenever we still don't have the language set by the user - which will always happen at least in @SplashScreen.jsx and @AccountSetupScreen.jsx , at least.

My suggestion is, in the case to not having an explicit manually selected language, we:
1. fetch the browser language information;
2. try to split that language string with '-'
3. try to see if the first part matches either 'en', 'es' or 'pt' and then use it for our current translations through i18n already implemented;
4. If nothing matches, fallback to 'en' until the user manually selects after account setup.

What do you think? Any better suggestions? 

---

If the navigator or htmlTag informs a 'pt-BR' or a 'es-ES', it would fallback to 'en' since they are not exactly 'pt' or 'es' respecively? Or will each fallout to their prefixed first part before the hiphen? We need to make so they fallback to their prefix instead of always falling back to 'en' if not the same exact language code.

---

As we did it for currencies, seems like languages are also hardcoded, with the `languages` array in @helpers.js not being used. Change that throughout the whole app so we use the single source of truth from the @helpers.js languages array.

Note:
- remove all other still not supported languages from the @helpers.js array, leaving only 'en', 'es' and 'pt';
- refactor the language selector to use the @helpers.js array;
- check if there's any other place using hardcoded languages array;

---

in the @AccountSetupScreen.jsx I've put a placeholder with the content 'icon-selector-here', I need a new component that will allow the user to select an icon for itself, with the following specs and requisites:
- it'll define the property 'icon' in the 'user' stored object, which can be empty at any time.
- layout-wise the control element will look like a button where it'll be a localized label "Icon" and will fill its div container as full as possible; visually put somewhere a dropdowm-like icon so the user knows it's a select-like control.
- the goal is to allow the user select an icon for itself, as soon as the 'name' input is valid - if it isn't, always set the default initial state: value emply, disabled to interact, visually dimmed;
- when the 'name' input is valid, this control becomes enabled, fully visible, and wehn interacted, it'll show a popover grid with all available icons so the user can select one;
- the value can be either a name of the icons already available at @AddPersonScreen.jsx `PERSON_ICONS` (right now we can hardcode it as in the add person screen) but it'll also support a svg image markup, we will implement this svg icon generation later;

 Let's try to implement this initial step and see how it goes to adjust and enhance it .

 ---

 the icon selector popover container is still not properly expanding based on its content, in this case the grid with all the icons, even though it seems to be using the proper grid classes from tailwindcss. Can you see why this is happening, explain the issue, try to fix it and also explain the fix.

 ---

 In the @AddPersonScreen.jsx , add in the most UX-friendly way a control to add the user itself as a person to the bill, make sure it only shows up if the user - by name - isn't added already.

Also, something we should be done before, add validation to the same screen where person names should be unique in that bill.

---

is it possible to add to the account setup main div, in the top-right corner, a button to toggle between the light and dark mode for the user, and please as the user continues on persist the setting in the storage user object, as if the user would have set that in the setthings screen.

The button should use the usual toggle light/dark modes icons - and do not change anything else in the screen, position this button simply as absolute positioned.

---

for both @IconSelector.jsx, @AddPersonScreen.jsx and any other files using the icons as the hardcoded `PERSON_ICONS`, move it to the @helpers.js component, renaming as you see fit to be coherent with the app code stytle and conventions, so we will import them and forcing the single source of trurh for it, like we did it for currencies and languages.

---

please add in the @AccountSetupScreen.jsx , just by the left side of that theme toggle button we added earlier, a language selector, try to reuse the `LanguageSelector` just as it's used in @Layout.jsx , and try to stylize it just like the theme toggle button. Remember that this selector also must be absolutely positioned by the left side  of the toggle theme button, `1rem` spaced from it.

---

There are some input elements not following the general style guidelines we are using, for example, in the input elements in the @AccountSetupScreen.jsx and@SettingsScreen.jsx  screens.

Listing the screens where the input elements need to follow the styles from the above mentioned screens:
- @AddPersonScreen.jsx 
- @AddItemScreen.jsx 
- @AddSpecialItemScreen.jsx 

Please try to reuse everything you can and  do not change anything else wherever possible.

---

Almost there, both text/numeric inputs and select elements in the screens you modified still look way thinner and almost no padding. Styles between those and the ones at Accout Setup and Settings screens are definetely different

---

text and number inputs all looking like the other screen, nice work, but select elements not yet. Take into account that I manually edited those files so reload them for yourself to avoid overwriting my edits.

---

great, all good now. 

One thing I didn't notice when we added the feature to add the user self as Add Person to the bill: maintain it there, but disable the icon/option to "edit person" if that person is the user - we don't want this in that situation, else if edited it will conflict with the user data itself. The user person still can be removed, though.

If you think it's a better UI/UX solution, as you implemented in other solutions before, leave it enabled, but as entering the edit screen warn the user they cannot edit themselves, with a single option to back to the bill.

Also, while we are on it, we need to add another constraint when adding a person to the bill: since it must have a unique name, do not allow the person name to be the same as the user., never.

---

the date picker feature in the date input at the @NewBillScreen.jsx is not properly localized based on the user defined language. How can we fix it since it's a builtin browser feature, and our own supported language codes won't match the correct code-with-variations to make the localization work as defined by our user defined language ?

---

your imlementation is correct, and the rendered markup is correct, sadly seems some browsers still overwrite that depending on the browser and operating system - let's leave it like that for now.

Still about dates, and let's ignore the ones in inputs, whenver they are rendered they are always in a en-US format, regardless of the current user-defined language.

Places where that is happening:
- bill date at the bill card in the bills list at @MainScreen.jsx 
- bill date at the bill details part at @BillDetailsScreen.jsx 
- bill date at the bill details part at @BillSummaryScreen.jsx 

Can you try to identify why since it seems to properly use the localized date string functions? Please try to fix them and explain why this is happening.

---

The @BillSummaryScreen.jsx is not using the user-defined currency, all the other screens seem to use it properly. Please fix it and make sure the 'share as text' generated content is also using the proper currency.

---

in the @tailwind.config.js , change the primary color base from `#0ea5e9` to `#8941d7`, the secondary base from `#d946ef` to `#fb8f27`, and regenerate all the color levels for each.

---

extend the colors with a `tertiary` one, like the primary and secondary ones, make its base the `400` shade level with the color `#1ad1b2`, and generate all the other levels like you did for the others.

later change all the elements in all components using the `blue-{shade-level}` to the `tertiary-{shade-level}` class instead.

---

I've manually added a new palette called `navyblue` at @tailwind.config.js , generate all shade levels based on its 500 level color

---

can you try to add to the background throughout all the screens in the app, except the bill summary screen, two big half circles through css:
- both half circles would be filled solid, each by one color, but translucid just enough to tone the overall aspect, but not that noticeable;
- the right half of the circle would have the primary-500 color from @tailwind.config.js and will be positionally fixed at the left side of the screen, center vertically;
- the left half of the circle would have the secondary-500 color from @tailwind.config.js and will be positionally fixed at the right side of the screen, center vertically;
- let's try first to make both height sizes (mantaining a half-circle aspect ratio) of the half circles so the final width of each half-circle makes up 1/3 of the view width;
- the sizes should be responsive and resize as the viewport is resized, preferably all through css;

---

we need to make some changes about the responsiveness of some screens, first some general rules:
1. I've seen you created some screens well with that, and others not;
2. I believe we can have here 2 min/max widths for the content containers, for each situation:
    A. one for simpler screens, usually containing a form for specific inputs; one good example in current implementation is the @NewBillScreen.jsx .
    B. other for more unique layouts and information, like the main screen listing the bills; one good example in current implementation is the @BillDetailsScreen.jsx  .

First, let's fix the ones that aren't on either.

The ones that should use the A above and aren't:
- @SettingsScreen.jsx: it seems it is just to properly set the max width;
- the @BillSummaryScreen.jsx , it  should be at max this width since we are trying to "share as image" to create the most width-efficient with info possible.
- Although they seem to be using this A pattern, please double check if their are all implementd as simple and patternilized as possible: @AddPersonScreen.jsx @AddItemScreen.jsx @AddSpecialItemScreen.jsx .

The ones that should use the B above and aren't:
- mainly the @MainScreen.jsx , not only about the max width, but here I'd like we only have 1 card per row, or 2 cards per row, and not 3 per row as we have right now; and let's fix the max bill cards width to 312px, and it should only be smaller than that if in one row state; lets try to make the max width of the bills cards the most previewable possible so we can tweak those cards later.
- make sure both @MainScreen.jsx and @BillDetailsScreen.jsx are using the same possible implementation for better maintenace.

---

can we try to add the same gradient background from the @SplashScreen.jsx and @AccountSetupScreen.jsx to the sticky header bar background at @Layout.jsx  , trying to maintain contrast both in light and dark modes?

Also, add  a more proeminent bottom border to the same header bar, according to light/dark modes, and a more visible dropshadow for each mode.

---

let's change the language selector display in the top bar, and only there - the dropdown menu can stay like it is - to show only the 2 first letters + the icon that is already there. Make it first letter upper case, second lowercase.

---

we need to make some UX+UI small changes in the bill cards at the main screen:
- where we show the bill type icon, at @MainScreen.jsx line 99, we need to have the default pointer cursor on hover, and show a tooltip with the localized name of that type on hover and on touch.
- where we show the list of persons added to that bill, we pretty much will do the same as above, both about the cursor and the tooltip, this time showing the name of that person; additionaly, change the hovered icon background, round and subtle, just like we do for buttons in the top header bar (be aware of dark/light modes for it).
- when showing the persons in the bill list, if the user itself is there, give it a subtle round border only slightly diffentiate the icon from the others;

some notes about the implementation:
- do not reuse the tooltip system we already are using in the info icon for split methods at the @AddItemScreen.jsx, it was manually edited to fit specific requisites there; implement another one that allows coming from all directions, fit to its content, and always on top of everyhing. 
- for the bill type tooltip, show it to the right of it, to avoid being clipped in smaller screens and similar situations.
- for the persons tooltips, show them to the bottom, since we have spare space there.

---

we need a footer at the @MainScreen.jsx to add:

1. Search/Filter:
- a button-icon for a search feature; UI-wise, this feature needs to be as a pop-over when clicked/touched as compact as possible;
- initially we'll have only a text input where the user can filter the cards for its title, but make it expansible enough so we can implement filtering by bill type, date ranges, places later.
- when any filter is active - at the moment only by title search - that button-icon must explicitly indicate that any filter is active - feel free to suggest the best ui/ux experience in this aspect.
- when any filter  is active, like described above, we can also append to the list title "Bills" something like "(filtering X bills from total of X)"

there will be another feature, a selector for sorting the cards, but only mentioning now to stay aware we will need that later

NOTES
- try to use the most used and accepted UI nowadays for bottom bar with actions.
- be aware of localization;
- the bar must be behind the bottom-right fixed button we have to create a new bill, but on top of the bills list itself;
- try to not modify anything that is exremely essential for this implementation.

let me know if you need any additional details before implementing it.

---

nice start, but some details:
- the bottom-right fixed button we have to create a new bill needs to be on top of the footer, right now it's behind of it; to be especific, the button is at  the line 208 in @MainScreen.jsx ;
- although the search icon changes when there's an active filter, i believe it's not explicit enough, isn't it better to put something like a small red circle like most UIs do, or do you have any better suggestions?
- also, UX-wise, the only way to close the popover now is to click again in the action icon, I'm not sure what would be best but maybe having an "X" to close - i llike the compact ui but we'll have more filters in there anyways - or any other way;
- also, would it be possible to add a subtle way to indicate that popover is coming from that icon? maybe to add a small chevron-up icon above the icon when it is open, or any suggestion you think it would be better

---

add to the bottom bar in @MainScreen.jsx  where was added the search feature, a selector for sorting the bill cards by:
- bill name;
- bill place name;
- bill type name;
- bill total value;
- bill date asc;
- bill date desc;

1. properly create localized titles for each option;
2. As default selected, we'll use 'bill date desc' option;
3. UI-wise I believe we can add a label "Sort by:" then the selector, if you have a better suggestion for the better UX, feel free to do it but explain why;
4. save this option in the user object storage and reload it whenever it's set;add to the bottom bar in @MainScreen.jsx  where was added the search feature, a selector for sorting the bill cards by:
- bill name;
- bill place name;
- bill type name;
- bill total value;
- bill date asc;
- bill date desc;

1. properly create localized titles for each option;
2. As default selected, we'll use 'bill date desc' option;
3. UI-wise I believe we can add a label "Sort by:" then the selector, if you have a better suggestion for the better UX, feel free to do it but explain why;
4. save this option in the user object storage and reload it whenever it's set;

---

i had to manually make some tweaks, but overall the implementation was very good, but make some changes:
- are you using a built in component for the select or created a new one? it is not following the dark theme and is a bit ugly - would it possible to reuse one component like the ones from @AddItemScreen.jsx or even from the @LanguageSelector.jsx ?
- I forgot one option to add, that needs to modify one you already added: modify the current 'bill total value'  to 'bill total value desc' and also add a 'bill total value asc', just like you did for the dates ones - modify and add the translations as well.

---


