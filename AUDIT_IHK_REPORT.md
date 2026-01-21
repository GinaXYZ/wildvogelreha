**IHK Submission — Code Audit Report**

This document summarizes a focused code audit of the project UI components requested for the IHK submission. It captures findings, recommended fixes, and a short action list so we can decide which changes to apply.

**Scope**: Reviewed [src/components/Appointments.vue](src/components/Appointments.vue) and [src/components/Project.vue](src/components/Project.vue) in depth and scanned the repository for duplicated helpers and common issues. See component list in the repo for additional review order.

- **Files reviewed:** [src/components/Appointments.vue](src/components/Appointments.vue), [src/components/Project.vue](src/components/Project.vue)

**Summary — Appointments.vue**

- **Undefined / unused variables:**
  - **bubbleSaveTimer**: referenced in `onBeforeUnmount` but not declared — either declare it where needed or remove the clearTimeout call.
  - **exportRange**: defined but unused — safe to remove.

- **Blocking browser dialogs:**
  - `alert()` and `confirm()` are used in multiple user flows (import, create/update/delete). These block test automation and CI. Recommendation: replace with a small injectable dialog utility so tests can stub user responses.

- **CSV parsing robustness:**
  - Component includes an in-house CSV parser. Edge cases (quoted CRLFs, large files) and potential DoS should be handled. Options:
    - Add defensive limits (max rows, max file size) and validate headers before import, OR
    - Replace client parser with a battle-tested library (e.g., papaparse) for production imports.

- **Dev-mode mock data:**
  - `mockAppointments` referenced but not declared in-file. Move mock data to a dedicated `src/data/mockAppointments.js` and import it explicitly.

- **Duplication of date helpers:**
  - `formatDate`, `formatTime`, `normalizeToDate`, `getStartOfWeek` appear in this component and other components (Home.vue, Staff.vue, Profile.vue). Suggest extracting shared utilities into `src/utils/date.js` and importing them.

- **Direct DOM/window usage:**
  - The component uses `document`/`window` events and `getBoundingClientRect`. For testability, keep the existing code but isolate DOM-dependent logic behind small helpers so tests can stub or mock behavior reliably.

- **API error handling and timeouts:**
  - Fetch calls check `res.ok` but have no timeouts. Consider adding request timeouts and clearer fallback messages for production.

- **Suggested concrete edits (non-breaking, low-risk)**
  1. Remove `exportRange` and declare/guard `bubbleSaveTimer` (or remove clearTimeout).  
  2. Replace `alert`/`confirm` with an injectable dialog helper `src/utils/dialogs.js`.  
  3. Extract shared date helpers to `src/utils/date.js` and update imports across components.  
  4. Add CSV row/file size limits; or switch to `papaparse` for production parsing.  
  5. Move mock data into `src/data/mockAppointments.js` and import in dev-mode only.

**Summary — Project.vue**

- **Purpose:** A small wrapper that shows `Appointments` without site chrome and applies layout overrides for the IHK project view.

- **Issues & recommendations:**
  - Avoid placing `:root` rules inside a component. Move `:root { --app-padding-top: 0px }` to a global stylesheet such as `src/assets/global.css` or `src/style.css`.
  - Many `!important` CSS rules are used to force layout (`width: 100% !important`, etc.). Prefer adding a scoped wrapper class (for example `.project--wrapper`) and a targeted selector instead of `!important` to keep styles maintainable.
  - Consider documenting why the component changes root CSS for the IHK submission (add a short comment).

- **Suggested concrete edits (decision postponed):**
  1. Move `:root` rule to a global CSS file (e.g., `src/assets/global.css`) and remove it from `src/components/Project.vue`.
  2. Replace `!important` rules with a single `.project--wrapper` scoped selector and remove `!important` usages.

These two Project.vue edits are explicitly included here as items to decide later.

**Action plan & next steps**

- Short term (non-breaking, recommended):
  - Implement dialog helper and replace `alert`/`confirm` calls in `Appointments.vue`. This improves testability immediately.
  - Extract date helpers into `src/utils/date.js` and update references in all components.

- Medium term (requires testing):
  - Add CSV file size/row limits and/or adopt `papaparse` for production parsing. Add server-side validation as a second layer.
  - Move mock data into `src/data/mockAppointments.js`.

- Optional / defer until review decision (listed above):
  - Move `:root` rule to global CSS and replace `!important` in `Project.vue` (these are the two items we flagged for later decision).

**Testing guidance**

- Unit tests: Keep and extend Vitest tests for `Appointments.vue` (parsing, date / filter helpers, computed behaviors). Use the dialog helper to stub user confirmations.
- Integration / E2E: Add Playwright/puppeteer tests to cover create/edit/delete/import/export flows in a real browser environment.

**Files added/mentioned**

- [src/components/Appointments.vue](src/components/Appointments.vue)
- [src/components/Project.vue](src/components/Project.vue)

---

If you want, I can now (A) implement the non-breaking edits (dialog helper, date utils, mock data move) and run tests, or (B) proceed to the next component review (AppLayout.vue). Which do you prefer?

---

## AboutUs.vue — Findings

- **File:** src/components/AboutUs.vue
- **Type:** Static content page component (mission, story, facilities, team, stats, CTA)

- **What I looked for:** duplicate code, unused selectors, accessibility, responsive rules, image paths, maintainability.

- **Findings & Recommendations:**
  - Duplicate / conflicting CSS:
    - There are repeated or overlapping rules for `h2` and `team-section` later in the file; consolidate into a single definition to avoid maintenance issues and style conflicts.
    - Media queries repeat some selectors already defined earlier — compress and keep one source of truth per selector.
  - Unused selectors:
    - `.hero-section` is referenced in media queries but no `.hero-section` exists in the template — remove or add the intended block.
  - Image paths:
    - Template references `/image16.jpg`, `/image17.jpg`, `/image18.jpg`, `/image19.jpg` and local avatars (`/sarah.jfif`, `/max.jfif`, `/lisa.jpg`). Verify these files exist in `public/` (or switch to imports from `src/assets/`) and consider adding `loading="lazy"` for large images.
  - Accessibility:
    - `alt` attributes are set — good. Consider adding landmark roles (e.g., `role="main"`) and aria-labels for CTA buttons if needed.
  - Responsiveness:
    - Component includes responsive media queries for 768px and 480px — looks covered. Consolidate duplicated responsive rules where possible.
  - Script section empty:
    - There's an empty `<script setup>` block. Remove if not used.

- **Suggested concrete edits (non-breaking):**
  1. Remove the empty `<script setup>` block.
  2. Consolidate duplicate `h2` and `.team-section` CSS rules; remove unused `.hero-section` references in media queries.
  3. Verify image files in `public/` and add `loading="lazy"` to large images.

---

Next I'll review `AppLayout.vue`. I will append findings to this file when complete.

---

## AppLayout.vue — Findings

- **File:** src/components/AppLayout.vue
- **Type:** Application layout wrapper (router view + optional shop embed)

- **Findings & Recommendations:**
  - Empty `header` element: The template contains `<header class="header"></header>` with no content. Confirm if a `Header` component should be rendered here (e.g., `<Header/>`) or remove the empty element to avoid accessibility issues (empty landmark).
  - Unused / mismatched CSS selectors:
    - Styles for `.nav ul`, `.nav ul li`, and `.nav a` exist, but no `.nav` element appears in the template. Remove unused CSS or add the corresponding markup if navigation belongs here.
    - `.center-content` class is defined but not used anywhere in the template; consider removal or using it intentionally.
  - Duplicate layout constraints: both `.main-content` and `.content-wrapper` set `max-width: 1200px` and center the content. Consolidate to a single container rule to avoid duplication.
  - Use of `$route?.name` in class binding: Optional chaining is allowed in templates, but ensure tests and SSR (if any) handle `$route` being undefined at init. Alternatively compute class in script and guard there.
  - `ShopEmbed` is rendered alongside `router-view`. If `ShopEmbed` is heavy, consider lazy-loading it (`defineAsyncComponent`) or conditionally render only on routes that need it to reduce initial bundle size.
  - Accessibility: `header` should include site title, skip links, or navigation for better keyboard/AT support. If header content is intentionally elsewhere, add `aria-hidden="true"` or comment for clarity.
  - Scoped styles are fine but could be scoped more narrowly (e.g., use `.app-layout .main-content` selectors) to avoid conflicts if styles are moved.

- **Suggested concrete edits (non-breaking):**
  1. Replace the empty `<header>` with the actual `Header` component or remove it.  
  2. Remove unused `.nav` and `.center-content` CSS rules, or add markup if intended.  
  3. Consolidate `max-width`/centering into one top-level container to reduce duplication.  
  4. Consider lazy-loading `ShopEmbed` with `defineAsyncComponent` if bundle size matters.  
  5. Add a short comment or ARIA attribute for the header to clarify intent.

---

Next: I'll continue with `AboutUs.vue` (already done) and then `Blog.vue` alphabetically.


## Blog.vue — Findings

- **File:** [src/components/Blog.vue](src/components/Blog.vue)
- **Type:** Admin + Public blog list + editor

- **Key issues & recommendations:**
  - **Missing Auth header on update:** `updatePost()` sends the PUT without an `Authorization` header while `createBlogPost()` and `deletePost()` do include a bearer token. Add the same token handling to `updatePost()` to avoid 401s and keep behavior consistent.
  - **Unsafe response parsing:** `updatePost()` reads `response.text()` then `JSON.parse(responseText)` unguarded. Use `await response.json()` when `response.ok` or guard empty responses before parsing to avoid runtime JSON errors.
  - **Blocking dialogs:** `deletePost()` uses `confirm()` — replace with the dialog helper (see Appointments.vue notes) for testability and a better UX.
  - **Direct localStorage access for token:** the component falls back to `localStorage.getItem('token')`. Prefer centralizing auth and header injection in a small `src/services/blog.js` (or re-use `auth.js`) so all API calls add the token consistently and timeouts/retries are handled in one place.
  - **Client-side validation & length limits:** title/content are validated for emptiness but no length limits or sanitization are applied. Add max lengths and validate before sending. Also consider server-side sanitization or escaping to prevent content injection.
  - **Error handling & UX:** `message` is used for all errors but is never auto-cleared; consider a toast system (already present) or auto-clear messages after a timeout to avoid stale UI state.
  - **Image URLs & performance:** `img` uses `post.imageUrl` directly. Add `loading="lazy"` and consider validating/whitelisting external domains to avoid mixed-content or tracking issues.
  - **Toast reuse:** the component implements a small toast. Extract a reusable toast component/util for consistency across app.

- **Suggested concrete edits (non-breaking):**
  1. Add `Authorization` header to `updatePost()` using the same token retrieval used elsewhere.
  2. Replace `response.text()` + `JSON.parse` with `await response.json()` after checking `response.ok`, or guard empty responses.
  3. Move API calls into `src/services/blog.js` that exports `fetchPosts`, `createPost`, `updatePost`, `deletePost` and handles headers, timeouts, and common error normalization.
  4. Replace `confirm()` with the dialog helper and use the shared toast for all messages.
  5. Add input length limits (e.g., title 200 chars, content 10000 chars) and validate before sending.
  6. Add `loading="lazy"` to blog images and validate/normalize `imageUrl` before rendering.

- **Testing suggestions:**
  - Unit test `createBlogPost`, `updatePost`, and `deletePost` flows using Vitest and stubbed `fetch` to assert headers and payloads.
  - Add an integration test that covers the editor create → list refresh flow and another that checks edit/cancel behavior.

---

I'll continue with the next component after you confirm you'd like these edits applied or prefer only the audit notes.


## cart.vue & cartState.js — Findings

- **Files:** [src/components/cart.vue](src/components/cart.vue), [src/components/cartState.js](src/components/cartState.js)
- **Type:** Shopping cart UI and client-side cart state management

- **High-level summary:**
  - The UI (`cart.vue`) renders `cart` (a `ref` from `cartState.js`), shows items, and offers quantity controls. The state file (`cartState.js`) exposes `addToCart`, `removeFromCart`, `loadCartFromDB`, and `mergeCarts` and persists to `/api/cart` for logged-in users.

- **Issues & recommendations:**
  - **Inconsistent persistence for guests vs logged-in users:** `addToCart()` and `removeFromCart()` call `saveCartToDB()` which returns early when there's no token. That means guest carts are not saved to `localStorage`. Fix: write a local-storage fallback inside the exported functions (or inside `saveCartToDB`) so guest carts persist locally immediately.
  - **UI mutates cart items directly without persisting:** `increaseQuantity()` and `decreaseQuantity()` in `cart.vue` directly mutate `item.quantity` but do not call `saveCartToDB()` or `addToCart()`/`removeFromCart()` after the update. This causes mismatches between UI and persisted cart. Fix: use `addToCart(item)` and a new `decrementCartItem(item)` exported helper, or call the save function after mutation.
  - **Missing token/header centralization:** `cartState.js` repeatedly reads `useAuthStore()` and `localStorage.getItem('token')`. Centralize header handling into a small API helper (e.g., `src/services/cart.js`) to make unit testing easier and avoid duplication.
  - **Data normalization assumptions:** `loadCartFromDB()` maps server fields (`idproducts`, `title`, `price`, `image`, `quantity`). If the API contract changes, this mapping will break silently. Recommendation: add a small `normalizeCartItem()` helper and log/warn when required fields are missing.
  - **User feedback & errors:** network failures are logged to console only. Consider returning a status or emitting events so UI can show toasts/errors when save/load fails.
  - **Testability concerns:** these functions call `useAuthStore()` (Pinia) and `fetch` directly. For unit tests, allow dependency injection or export a thin wrapper so tests can stub the network and auth state.
  - **CSS minor issue:** `.bezahlen-link` contains `position: center;` which is invalid CSS — remove it.
  - **Accessibility / UX:** Product images use a generic alt (`Produktbild`). Use `alt="{{ item.title }}"` or include more descriptive text. Add `loading="lazy"` to images to improve performance.

- **Concrete non-breaking fixes to implement:**
  1. Persist guest cart to `localStorage` on `addToCart`/`removeFromCart` and when `saveCartToDB` returns early (no token). Use a single `LOCAL_CART_KEY = 'cart'` constant.
  2. Replace direct mutations in `cart.vue` with calls to `addToCart(item)` and a new `decrementFromCart(item)` exported from `cartState.js` that handles quantity and persistence.
  3. Centralize API calls into `src/services/cart.js` for header injection and clearer error handling; export test hooks to stub fetch.
  4. Update `cart.vue` images to `:alt="item.title || 'Produktbild'"` and add `loading="lazy"`.
  5. Remove invalid CSS (`position: center;`) and consider showing a cart total and item count in the UI.

- **Testing suggestions:**
  - Unit tests for `cartState.js`: add tests for add/remove/merge behavior and localStorage fallback. Mock `fetch` responses for `saveCartToDB` and `loadCartFromDB`.
  - Component tests for `cart.vue`: assert that quantity buttons call the correct exported helpers and that the Checkout link renders only for allowed roles and non-empty carts.

---

I'll mark `cart.vue` review as completed and `cartState.js` as next to finalize in the todo list when you want me to apply fixes. 


## Checkout.vue — Findings

- **File:** [src/components/Checkout.vue](src/components/Checkout.vue)
- **Type:** Checkout form and order submission

- **Key issues & recommendations:**
  - **No auth header for orders:** `submitCheckout()` posts to `/api/order` without an `Authorization` header. If orders for logged-in users should be tied to user accounts, include the bearer token (use `useAuthStore()` token consistently).
  - **Unvalidated cart payload:** the entire `cart.value` is sent directly. Normalize and validate items (id, quantity, price) before sending; avoid trusting client-side price values for order totals — compute totals server-side.
  - **Blocking alerts for success/error:** uses `alert()` for success and errors. Replace with the app's toast/dialog mechanism for consistent UX and testability.
  - **No client-side form validation beyond `required`:** add checks for reasonable lengths and formats (email regex) and sanitize inputs.
  - **No timeout/response guard:** calls `await response.json()` unguarded which may throw if server returns empty body. Check `response.ok` first and handle non-JSON responses gracefully.
  - **Security: external countries API:** fetches `https://restcountries.com/v3.1/all` on mount; consider caching or a local fallback and handle slow/failed network better (currently falls back, which is good).
  - **UX: success flow resets cart with `cart.value = []` but does not persist to server/localStorage.** Ensure server-side order creation also clears server-side cart or call save endpoint after clearing.

- **Concrete non-breaking fixes:**
  1. Add token header when available. 2. Validate/normalize cart items before sending and rely on server for pricing. 3. Replace `alert()` calls with toast dialogs. 4. Guard `response.json()` with `if (response.ok)` and provide clearer error reporting.

---

## Contact.vue — Findings

- **File:** [src/components/Contact.vue](src/components/Contact.vue)
- **Type:** Contact form

- **Key issues & recommendations:**
  - **Typo / wrong variable used:** In `submitContact()` the code reads `const data = await response.json();` but then checks `if (res.ok)` — `res` is undefined. This will throw at runtime. Change `res` to `response` and guard accordingly.
  - **Missing Content-Security and input sanitization:** while sending plain form fields is fine, sanitize or validate inputs (e.g., length limits, strip dangerous HTML) before sending to backend.
  - **Error feedback inconsistency:** both `error` and `message` refs are used; ensure naming is consistent (`message` vs `successMessage`) and auto-clear after a timeout for better UX.
  - **No `Authorization` header but uses `authStore`:** `authStore` is imported but not used. If contact submissions should include user identity, add the token; otherwise remove the unused `authStore` import.
  - **Accessibility:** inputs have placeholders but could include associated `label` elements for screen readers; currently placeholders are used in inputs in template — add explicit `<label for=...>` or ensure aria-labels are present.

- **Concrete non-breaking fixes:**
  1. Fix variable name `res` → `response` and guard `response.ok` before reading JSON. 2. Remove `useAuthStore()` import if unused. 3. Add basic validation and length limits. 4. Auto-clear `message`/`error` after a short timeout or use shared toast.

---

I'll continue auditing the next components (Checkout done, Contact done). Next up alphabetically: `Home.vue`.


## Home.vue — Findings

- **File:** [src/components/Home.vue](src/components/Home.vue)
- **Type:** Landing page: slideshow, latest posts, donations, new arrivals

- **Key issues & recommendations:**
  - **Hard-coded image paths:** numerous entries use `/image*.jpg` and similar. Prefer importing images from `src/assets` or confirm they exist in `public/`. Using imports enables bundlers to optimize and fingerprint assets.
  - **Client-side API calls without timeouts:** `fetchTopDonations()` and `fetchLatestPosts()` call APIs and `await res.json()` after checking `res.ok` — good, but add request timeouts or abort controllers for slow networks.
  - **Duplicate date helpers:** `formatDate()` duplicates helpers seen elsewhere; extract to `src/utils/date.js` as earlier suggested.
  - **Potential XSS in `news`/`descr`:** content from CMS/blog/donations is rendered as plain text currently — safe. If any HTML is allowed later, sanitize before inserting HTML.
  - **Accessibility:** `router-link` for posts links to `/blog/` without post id — check routing; likely should include post slug or id (`/blog/${post.id}`) so each post is addressable.
  - **Slideshow dependency:** `Slideshow.vue` is used; ensure it handles `slides` prop length zero and is keyboard accessible.
  - **Performance:** `newBirds` array is large and static; move static mock data to `src/data/` and import to keep template clean and to allow tree-shaking.

- **Concrete non-breaking fixes:**
  1. Replace hard-coded image paths with imports or verify presence in `public/`. 2. Add AbortController timeouts for fetches. 3. Route blog links to the post detail URL. 4. Move static `newBirds` to `src/data/newBirds.js`.

---

## Header.vue — Findings

- **File:** [src/components/Header.vue](src/components/Header.vue)
- **Type:** Site header with navigation, mobile menu, auth controls

- **Key issues & recommendations:**
  - **Direct DOM mutation for `document.body.style.overflow`:** used to prevent scroll when mobile menu opens. It's acceptable, but encapsulate in a helper and ensure restoration in all code paths (already handled on unmount and close). Consider toggling a class on `<html>`/`body` instead for CSS control.
  - **Cart count uses `cart.length`:** `cart` is a ref array of items; counting items might be misleading if quantities >1. Use `getCartCount()` from `cartState.js` or compute sum of quantities for accurate badge.
  - **Missing ARIA attributes on mobile menu:** hamburger should have `aria-expanded` and `aria-controls` referencing the menu; menu overlay should trap focus when open for accessibility.
  - **Large image imports in script:** `HeaderBg` is used inline in `headerStyle` which may bloat initial CSS; consider a smaller hero or separate CSS background via class that can be lazy-loaded.
  - **Scroll handler debounce/cleanup:** `handleScroll` uses a timeout but does not set a delay; add a small delay (e.g., 50ms) to reduce frequent toggles and set `scrollTimeout = null` after clearing to avoid memory leaks.
  - **Logout redirect:** `handleAuthClick()` calls `authStore.logout()` then `router.push('/login')`. If logout already redirects, pushing `/login` may be redundant; ensure idempotence.

- **Concrete non-breaking fixes:**
  1. Use `getCartCount()` for badge count. 2. Add `aria-expanded` to hamburger and focus trap for mobile nav. 3. Add a short debounce delay (50ms) in `handleScroll` and clear `scrollTimeout` properly. 4. Consider toggling a CSS class on `body` instead of direct style writes.

---

Next: I'll proceed to audit `Home.vue` and `Header.vue` changes have been appended. Continuing alphabetically: `Login.vue` and `Login` related files next.


## Login.vue — Findings

- **File:** [src/components/Login.vue](src/components/Login.vue)
- **Type:** Simple login form + client-side cart merge after login

- **Key issues & recommendations:**
  - **Error handling:** `catch (error)` logs `error.message`; ensure `error` exists and has a message property — use `error?.message || String(error)` to be safe.
  - **Silent dynamic import:** On successful login the component does `import('./cartState.js').then(module => module.mergeCarts())`. Prefer importing the service at module scope or using a centralized post-login hook in `auth.js` so merging is deterministic and testable.
  - **No loading state / double submit protection:** Add a `loading` ref to disable the form while `authStore.login()` is in progress to prevent duplicate requests.
  - **No auth header handling needed here:** Login delegates to `authStore.login()` — ensure `authStore.login()` rejects with clear user-friendly messages (it appears to do so), and avoid exposing raw error messages to UI for security.
  - **Redirect after login:** `router.push('/profile')` is unconditional; consider redirecting to originally requested page (store return URL before login) to improve UX.

- **Concrete non-breaking fixes:**
  1. Add `loading` state and disable form during login. 2. Move cart merge to `auth.js` post-login flow. 3. Use safe error message extraction (`error?.message || String(error)`).

---

## PasswordGate.vue — Findings

- **File:** [src/components/PasswordGate.vue](src/components/PasswordGate.vue)
- **Type:** Full-screen site unlock gate using `authStore` login

- **Key issues & recommendations:**
  - **Session vs auth duplication:** This component stores `site_unlocked` in `sessionStorage` after `authStore.login()`. If `authStore` already handles session/token state, this duplication may be unnecessary. Prefer centralizing unlock logic in `auth.js` and emit events from there.
  - **Direct window event dispatch:** `window.dispatchEvent(new CustomEvent('site-unlocked'))` is used; prefer using an app-level event bus or Pinia state flag for reactiveness and testability.
  - **No rate-limiting or captcha:** If this gate protects sensitive admin sections, consider back-end rate-limiting or a captcha to mitigate brute-force attempts.
  - **No loading state / double submit protection:** Add `loading` while `authStore.login()` is in progress and disable inputs/buttons.
  - **Accessibility:** Ensure focus is trapped within the modal and returned after unlock; add `aria-modal="true"` and role attributes to dialog container.

- **Concrete non-breaking fixes:**
  1. Move `site_unlocked` logic to `auth.js` and set a Pinia state flag. 2. Replace `window.dispatchEvent` with Pinia reactive flag or an event exported from `auth.js`. 3. Add `loading` state and focus-trap/ARIA attributes.

---

I appended these notes to the audit report. Next I'll continue with `Profile.vue` and other profile-related components.


## Profile.vue — Findings

- **File:** [src/components/Profile.vue](src/components/Profile.vue)
- **Type:** User profile, orders view, and staff admin panel

- **Key issues & recommendations:**
  - **Token handling scattered:** `fetchProfile()` and `fetchOrders()` read `localStorage.getItem('token')` directly. Use `authStore.token` or a centralized API helper to keep headers consistent and testable.
  - **Order total computed client-side:** The UI computes order totals with `order.items.reduce(...)` trusting client-side `price`. Server should compute and return final totals; show server-provided `total` when available.
  - **Mutable `order.status` bound to select:** The template binds `v-model` directly to `order.status` and immediately sends update on change. Consider staging status changes and handle failures by rolling back to previous value if API call fails.
  - **Image alt attributes empty:** Order item images use `alt=""`. Provide descriptive `alt` (e.g., `item.title`) for accessibility and SEO.
  - **Missing confirmation for status changes:** Admin staff changing status invoke `updateOrderStatus()` without confirmation; consider a confirm/dialog and logging for audit trails.
  - **Error handling UX:** `updateOrderStatus()` shows `alert()` on failure — prefer toast and revert status change on failure.
  - **Potential XSS in order fields:** Ensure `order` data is sanitized if any field can contain user-provided HTML.

- **Concrete non-breaking fixes:**
  1. Use `authStore.token` or centralized service for headers. 2. Prefer server-provided order totals; otherwise validate/calculations on server. 3. Stage status changes and revert on API error. 4. Add `alt` to order item images and replace `alert()` with a toast.

---

## Register.vue — Findings

- **File:** [src/components/Register.vue](src/components/Register.vue)
- **Type:** User registration form

- **Key issues & recommendations:**
  - **Client-side password validation is good:** `passwordErrors` and `passwordValid` offer helpful guidance. Ensure backend enforces same rules and hashes passwords securely (server-side).
  - **No rate-limiting / bot protection:** Consider adding server-side rate limits or recaptcha to prevent automated registrations.
  - **No email normalization/validation beyond input type:** Consider trimming and lowercasing email before sending; enforce server-side uniqueness and normalization.
  - **Error leakage:** When API returns error, `err.message` is displayed; avoid exposing raw server errors that might leak implementation details. Map to user-friendly messages.
  - **Success redirect timing:** `setTimeout` used to redirect after success — acceptable but consider immediate redirect with a server-provided message or use a toast then redirect when dismissed.

- **Concrete non-breaking fixes:**
  1. Trim/normalize email and username before sending. 2. Add server-side rate limiting/captcha. 3. Map server errors to user-friendly messages.

---

I'll mark `Profile.vue` and `Register.vue` notes added. Next I'll continue alphabetically with `Project.vue` (already done) then `Shop.vue` and `ShopEmbed.vue`.


## Shop.vue & ShopEmbed.vue — Findings

- **Files:** [src/components/Shop.vue](src/components/Shop.vue), [src/components/ShopEmbed.vue](src/components/ShopEmbed.vue)
- **Type:** Product listing, admin product CRUD, shop embed carousel

- **High-level summary:**
  - `Shop.vue` handles listing, searching, pagination, admin product creation/editing, and add-to-cart actions. `ShopEmbed.vue` is a compact horizontal scroller for a few items with add-to-cart buttons.

- **Issues & recommendations:**
  - **Client-side trust of price/amount:** `Shop.vue` displays and sends `price` and `amountLeft` directly; server must validate and compute final prices/stock. On UI, disable the add button if `amountLeft <=0` (already present) and show server-derived availability when possible.
  - **Large component size & repeated logic:** `Shop.vue` is long (~1000 lines). Split into smaller components (`ProductCard`, `ProductList`, `AdminProductForm`) for readability and testability.
  - **Repeated error parsing logic:** Multiple places parse `res.json()` with nested fallbacks. Extract a small `fetchJson(url, opts)` helper in `src/services/api.js` that normalizes errors and responses.
  - **Inconsistent auth token usage:** `authStore.token` used in some calls; ensure `authStore.token` is the source of truth and centralize header injection in `src/services/cart.js` / `src/services/products.js`.
  - **UI mutation and edit form toggling:** `showEditForm` is global and toggled for product edits; when multiple products are rendered, this may cause unexpected behavior. Track `editingProductId` and per-card state or render form in a modal to avoid layout shifts.
  - **Accessibility:** Images lack `loading="lazy"` and `alt` usage is correct for `product.title`. Add keyboard focus states for product cards and ensure pagination buttons are reachable by keyboard and have descriptive labels (e.g., `aria-label="Nächste Seite"`).
  - **Toast duplication:** Several components implement toasts similarly. Extract a shared `Toast` component and centralize timing/queueing behavior.
  - **ShopEmbed fixed toast position:** `ShopEmbed.vue` places `.toast` with `position: fixed` which may overlap other toasts; reuse shared Toast component or namespace positions.
  - **Potential layout shift with large admin form:** The inline `edit-form` in each product card may cause layout reflows. Consider a modal for editing or collapse behavior.

- **Concrete non-breaking fixes (suggested):**
  1. Extract `ProductCard`, `ProductList`, and `AdminProductForm` from `Shop.vue`. 2. Add `loading="lazy"` to images and ensure `alt` is descriptive. 3. Centralize API calls via `src/services/api.js` and `src/services/products.js`. 4. Replace local toast implementations with a shared `Toast` component. 5. Track `editingProductId` instead of shared `showEditForm` to avoid cross-card interference.

- **Testing suggestions:**
  - Unit test `fetchProducts` pagination/filter behavior by mocking `fetch` responses.  - Component test `ProductCard` for add-to-cart/button disabled states.  - Integration test for admin product create/update flows (mock server) and ensuring the product list refreshes after changes.

---

I'll mark `Shop.vue` and `ShopEmbed.vue` reviewed and continue to the next components (`Slideshow.vue`, `Spenden.vue`).


## Slideshow.vue — Findings

- **File:** [src/components/Slideshow.vue](src/components/Slideshow.vue)
- **Type:** Small slideshow component used on the home page

- **Key issues & recommendations:**
  - **No autoplay or pause control:** The component requires user clicks to advance. Consider adding optional `autoplay`, `interval`, and `pauseOnHover` props so consumer pages can opt into auto-rotation.
  - **No keyboard / screen-reader accessibility:** Add keyboard handlers (left/right arrows) and ARIA attributes (role="region", `aria-roledescription="carousel"`, `aria-live` for updates) and `aria-controls`/`aria-label` for navigation buttons.
  - **Unsafe indexing:** Template accesses `slides[currentIndex]` without guarding for empty `slides`. Guard template or render a placeholder when `slides.length === 0` to avoid runtime errors.
  - **Images not lazy-loaded:** Add `loading="lazy"` to slides to improve performance on mobile/slow networks.
  - **No prop validation for slide shape:** Add a `validator` or document expected slide shape (image, news) and defend against missing fields in runtime.

- **Concrete non-breaking fixes:**
  1. Guard rendering for empty slides. 2. Add optional `autoplay` props with `clearInterval` on unmount. 3. Add keyboard handlers and ARIA attributes. 4. Use `loading="lazy"` on the `<img>`.

---

## Spenden.vue — Findings

- **File:** [src/components/Spenden.vue](src/components/Spenden.vue)
- **Type:** Donation information and PayPal button

- **Key issues & recommendations:**
  - **External form to PayPal:** The component uses a direct form to `https://www.paypal.com/donate`. That's acceptable, but consider server-side donation tracking (webhook or redirect) so the app records donations and issues receipts.
  - **No CSRF or validation needed for external form:** fine, but ensure `hosted_button_id` is configurable via environment or CMS to avoid hard-coded IDs.
  - **Accessibility:** The PayPal button is an input; consider using a `<button>` with `type="submit"` for clearer semantics and include `aria-label` describing the action.
  - **No analytics or confirmation flow:** consider adding a callback/landing page after PayPal donation to display a thank-you and to reconcile donations server-side.
  - **Global `*` style selector:** the component's CSS uses `* { font-family: ... }` which can unintentionally override global styles. Remove the universal selector and scope styles to the component root (e.g., `.spenden-container, .info-section`).

- **Concrete non-breaking fixes:**
  1. Replace `* { font-family... }` with scoped selectors. 2. Use a `button[type="submit"]` and add `aria-label`. 3. Add server-side donation tracking or a post-donation landing URL for reconciliation.

---


## Staff.vue — Findings

- **File**: [src/components/Staff.vue](src/components/Staff.vue)
- **Type**: Staff/admin dashboard (donations, contacts, patients, appointments, schedule)
- **High-level issues**: very large single-file component handling multiple concerns; mixes DOM-heavy drag/drop logic, data fetching, and view templates.
- **Testability & maintainability**: direct DOM APIs (document.elementsFromPoint, querySelectorAll) and global drag handlers make unit testing difficult; many behaviors should be isolated.
- **Security & API usage**: fetch calls mix `authStore.token` and `localStorage` fallbacks — centralize token/header handling in a service; destructive actions appear to run without a confirm/dialog helper.
- **Accessibility & UX**: popups and drag interactions lack ARIA roles and keyboard support; ensure focus management for search popups and speech-bubble overlays.
- **Performance**: tables render full datasets; consider pagination/virtualization for large lists and debounce expensive handlers.
- **Concrete non-breaking recommendations**:
  - Split into focused components per tab (DonationsPanel, ContactsPanel, PatientsPanel, SchedulePanel) to reduce complexity.
  - Move API calls to `src/services/staff.js` to standardize headers, timeouts, and error handling.
  - Replace immediate destructive actions with an injectable dialog helper for confirmations and test stubbing.
  - Encapsulate drag/drop DOM logic and ensure proper attach/remove of listeners and Pointer Events support for touch.
  - Add ARIA attributes, keyboard controls for schedule interactions, and focus-trap behavior for overlays.

## Voegel.vue — Findings

- **File**: [src/components/Voegel.vue](src/components/Voegel.vue)
- **Type**: Interactive bird-map with admin edit forms and tooltips
- **High-level issues**: combines map rendering, absolute-positioned items, tooltip/edit overlays and admin flows in one file, increasing maintenance burden.
- **Accessibility & keyboard support**: map items appear pointer-driven; provide keyboard navigation, proper ARIA roles for tooltips and edit forms, and focus management when overlays open.
- **Performance & images**: images should use `loading="lazy"` and descriptive `alt` attributes; if many items are present, consider DOM clustering or virtualization.
- **Security & validation**: sanitize and validate user-entered image URLs and description fields; add input length limits to prevent layout issues or injection.
- **Testability**: heavy event and positioning logic should be split into `MapItem`, `BirdTooltip`, and `BirdEditForm` components and position math moved to utilities to allow unit testing.
- **Concrete non-breaking recommendations**:
  - Break the file into `BirdMap.vue`, `MapItem.vue`, `BirdTooltip.vue`, and `BirdEditForm.vue` components.
  - Centralize API calls in `src/services/voegel.js` and reuse shared auth/header logic.
  - Add keyboard navigation and ARIA roles for map items and overlays; trap and restore focus for edit dialogs.
  - Validate/sanitize image URLs and description input; set reasonable length limits.
  - Ensure images use `loading="lazy"` and fallback `alt` text (bird name) when missing.

---
