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




