# CityWide Jigjiga Item Rental System

CityWide Jigjiga is a demo item-rental marketplace for education and project evaluation. It lets users browse rental items, list items, manage bookings, review completed rentals, and view role-based dashboards for users, owners/renters, admins, and super admins.

## How It Works

- Public pages show the marketplace homepage, listings, item details, about, contact, login, and registration.
- User dashboards support renter, owner, and both-role workflows with a sidebar on desktop and a hamburger drawer on mobile.
- Admin dashboards manage marketplace operations such as users, listings, reports, messages, transactions, and rental requests.
- Super Admin dashboards manage platform-level analytics, admins, categories, audit logs, reports, and settings.
- Demo reviews and rental requests use `localStorage`, so they work without a backend during presentations.
- Language switching supports English and Somali for the main visible UI text.
- Dark mode is stored locally and can be toggled from the navbar/dashboard controls.

## Technologies Used

- HTML5 for pages and dashboard structure
- CSS3 for layout, responsive design, dark mode, glass navbar, cards, tables, and mobile drawers
- JavaScript for navigation, dashboards, language switching, charts, reviews, profile behavior, and demo local storage
- Bootstrap and Bootstrap Icons for base components and icons
- Chart.js for dashboard analytics charts
- JSON files in `data/` for demo content
- `localStorage` and `sessionStorage` for demo-only user/session/review/request behavior

## Project Structure

- `index.html` redirects into the organized pages folder.
- `pages/` contains public, user, admin, super admin, and profile pages.
- `assets/` contains images, logos, icons, and font assets.
- `css/` contains shared, responsive, dashboard-specific, and role-specific styles.
- `js/` contains shared behavior, sidebar logic, dashboard enhancements, charts, reviews, profiles, chatbot, language, and theme scripts.
- `data/` contains demo JSON data for users, listings, bookings, messages, categories, analytics, and transactions.

## Education Note

This project is intended for learning, UI/UX demonstration, and academic evaluation. It does not include a real backend, production authentication, payment processing, or database integration. Features such as reviews, rental requests, profile updates, and dashboard data are demo implementations.

## Running The Project

Open `index.html` in a browser, or serve the project folder with any static server. For example:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/pages/home.html
```

## Demo Languages

- English
- Somali

The language switcher updates public pages, dashboards, and chatbot demo text where translations are available.
