# Architecture Decisions for Pinnacle Shield Insurance Quote App

---

## Component / Page Organization

The app is organized by clear separation of concerns:
- **Pages**: Each major function (Home, About, FAQ, Quote) is a separate HTML file for clarity and maintainability.
- **Components**: While not using a frontend framework, reusable UI elements (like the quote summary card, breakdown table, and navigation) are implemented as modular HTML/CSS/JS blocks. This makes it easier to update or extend features without affecting unrelated parts of the app.
- **Assets**: CSS and JS files are organized by feature (e.g., quote logic in js/quote.js, general styles in css/style.css), supporting modularity and easier debugging.

---

## Data Flow Explanation

The app uses a simple, client-side data flow:
- **Form Input**: User input is collected via HTML forms and validated in the browser using JavaScript.
- **State Management**: Data is held in memory for the current session (e.g., for quote comparison) and persisted in localStorage for saved quotes.
- **UI Updates**: All updates to the UI (quote results, saved quotes, comparison) are handled by manipulating the DOM directly in JavaScript, ensuring immediate feedback without page reloads.
- **No Backend**: All logic and data storage are client-side, which simplifies deployment and privacy but limits advanced features like user accounts or server-side validation.

---

## Deployment Approach

The app is deployed as a static site using GitHub Pages, with automated validation and deployment via GitHub Actions:
- **Static Hosting**: No server-side code is required, making deployment fast, secure, and cost-free.
- **CI/CD**: The validate-and-deploy.yml workflow checks for required files and HTML structure before deploying, reducing the risk of broken builds.
- **Branching**: Feature branches are used for development, with deployment triggered on merges to main, supporting safe and collaborative development.

---

## Key Decisions and Trade-Offs

- **Static Site vs. Dynamic Backend**: Chose a static site for simplicity, speed, and privacy, at the cost of advanced features like authentication or server-side data storage.
- **No Framework**: Opted for vanilla JS and Bootstrap to minimize dependencies and learning curve, but this can make scaling and state management harder as the app grows.
- **localStorage for Persistence**: Enables saving quotes without a backend, but data is device-specific and not secure for sensitive information.
- **Accessibility and Responsiveness**: Prioritized by using Bootstrap and semantic HTML, but deeper accessibility testing could further improve the experience.
- **Manual DOM Manipulation**: Simple for a small app, but would become unwieldy for larger, more interactive projects—hence the suggestion to use a frontend framework in the future.

## Overview
This document explains the key architectural and design decisions made during the development of the Pinnacle Shield Insurance Quote App. The goal is to provide transparency and rationale for choices that impact maintainability, scalability, user experience, and security.

---

## 1. Technology Stack
- **HTML5, CSS3, JavaScript (ES6+)**: Chosen for maximum browser compatibility and ease of deployment on static hosting (GitHub Pages).
- **Bootstrap 5**: Used for responsive layout, accessibility, and rapid UI development. It ensures a consistent look and feel across devices.
- **Bootstrap Icons**: Provides scalable, modern icons without extra dependencies.

---

## 2. Project Structure
- **Separation of Concerns**: 
  - `index.html`, `about.html`, `faq.html`, `quote.html`: Each page serves a distinct purpose, improving navigation and maintainability.
  - `css/quote.css`, `css/style.css`: CSS is modularized for easier updates and to avoid style conflicts.
  - `js/quote.js`, `js/main.js`: JavaScript is split by feature, keeping quote logic isolated from general site scripts.

---

## 3. Dynamic Form Logic
- **Single Page for Multiple Insurance Types**: The quote form dynamically switches between Auto, Home, and Life insurance using sibling fieldsets and JavaScript. This avoids code duplication and provides a seamless user experience.
- **Validation**: Robust client-side validation is implemented for all fields, with clear error messages and accessibility considerations.

---

## 4. State Management
- **localStorage**: Used for saving and loading quotes, enabling persistence across sessions without a backend. This keeps the app fast and privacy-friendly.
- **In-Memory State**: Quote comparison and form state are managed in JavaScript, allowing for dynamic UI updates without page reloads.

---

## 5. Security
- **XSS Protection**: All user-generated content is escaped before being injected into the DOM.
- **No Sensitive Data**: The app does not collect or store sensitive personal information beyond what is needed for a quote.

---

## 6. CI/CD and Deployment
- **GitHub Actions**: Automated validation and deployment workflows ensure code quality and reduce manual errors.
- **GitHub Pages**: Chosen for free, reliable static hosting with easy integration into the development workflow.

---

## 7. Accessibility & Responsiveness
- **Bootstrap Grid & Custom CSS**: Ensures the app is usable on all devices and screen sizes.
- **ARIA Roles & Semantic HTML**: Improves accessibility for users with assistive technologies.

---

## 8. Extensibility
- **Modular Code**: The structure allows for easy addition of new insurance types, features, or pages in the future.

---

## Conclusion
These decisions were made to balance user experience, maintainability, and security, while keeping the app simple to deploy and extend. Feedback and contributions are welcome to further improve the architecture.

---

## What Would You Do Differently?

Reflecting on the project, here are some things that could be improved or approached differently in a future iteration:

- **Automated Testing:** Implementing unit and integration tests (e.g., with Jest or Cypress) would ensure reliability as features are added or changed.
- **Accessibility Audits:** While accessibility was considered, using automated tools and manual audits would further improve usability for all users.
- **Design System:** Creating a custom design system or using an established one would ensure even greater UI consistency and scalability.
- **Continuous Deployment Enhancements:** Adding preview environments or branch-based deployments would improve the development workflow.
- **Prompt Engineering Changes:** A struggle I came across was some of my prompts were conflicting with one another. Part way through I watched some prompt engineering best practices and allowed myself to correct alot of mistakes and get better results.

These changes would help the app scale, improve maintainability, and provide a better experience for both users and developers.
