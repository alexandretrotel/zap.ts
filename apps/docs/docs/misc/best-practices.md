# Best Practices

Zap.ts is built to help you create apps _quickly_ with a _**clear**_ and _**organized**_ structure.

This page explains the recommended way to set up your project and why it works well for building modern apps.

## Project Structure

The `src` folder in Zap.ts is organized to keep your code _clean_, _easy to find_, and _ready to grow_. Here’s what each folder does:

- **actions**: Holds server actions for handling backend tasks.
- **app**: Contains Next.js app router files, such as pages and layouts.
- **components**: Stores reusable UI components.
  - **common**: General components used across the app.
  - **ui**: Components styled with [shadcn/ui](https://ui.shadcn.com/), focusing on design consistency.
- **data**: Keeps static data, like JSON files, and feature flags to turn features on or off at build time without a database.
- **db**: Includes database-related code, such as schemas.
- **hooks**: Holds custom React hooks that can be shared across features.
- **lib**: Stores shared utilities, like helper functions or API clients.
- **providers**: Contains React context providers for app-wide state.
- **rpc**: Manages code for type-safe API communication.
- **schemas**: Defines schemas and API validation schemas for type safety.
- **stores**: Holds stores for lightweight state management.
- **styles**: Includes global styles.

## Pages vs. Routes

Inside the `app` folder, you'll find some special folders that help you organize your code. These **do not affect your route structure** — they just make things easier to manage:

- **public** – For public-facing pages and APIs (no auth required)
  > Example: `/(public)/index.tsx`

- **protected** – For protected routes (auth required)
  > Example: `/api/(protected)/user/update-account/route.ts`

These folders let you group your logic by access level without affecting the final URL structure.

:::tip Understanding Routes

In Next.js, routes come in _two main types_:

* **API**: A backend endpoint for handling HTTP requests. Used for data fetching, mutations, etc.
* **Page**: A UI screen rendered by a React component. These can be public or protected, static or dynamic.

Learn more in the [Next.js documentation](https://nextjs.org/docs/app/getting-started/project-structure#routing-files).

:::

## Server Actions vs. API Routes

**Server Actions** and **API Routes** both handle _backend_ logic, but they work differently:

- **Server Actions**: Server-side functions for tasks like form submissions. They run on the server and are good for one-off operations. They don’t need a separate endpoint.
- **API Routes**: Next.js endpoints (e.g., `/api/users`) for reusable APIs. They’re better for parallel requests and external access. With oRPC, they become type-safe.

It's important to note that **API Routes** handle concurrent requests, making them ideal for data fetching and external APIs, while **Server Actions** run sequentially and are better suited for isolated _mutation_ tasks.

:::warning
In general, we advise against using **Server Actions**. They are essentially another way to define **API Routes**, but with less control and flexibility.
:::

## Providers vs. Zustand Stores

The `providers` folder is for React context providers, but we recommend using Zustand stores for state management whenever possible.

**React Context** is great for static or infrequently changing values (like themes or locales), but it can lead to unnecessary re-renders when used for dynamic state.

**Zustand**, on the other hand, is a lightweight state manager that avoids this problem by isolating updates and keeping your components more performant.

We recommend you to check [Zustand documentation](https://zustand.docs.pmnd.rs/getting-started/introduction) to learn more.

::: tip
Use `providers` only when you have no other choice (e.g., for third-party libraries requiring context). For app state, use Zustand stores in the `stores` folder—they’re lighter and easier to manage.
:::

## URL State Management

For state that should be **shareable via URL** (like filters, search terms, or pagination), use [nuqs](https://nuqs.vercel.app/) — a powerful library that makes URL state management as simple as `useState`.

**nuqs** provides hooks that automatically sync your component state with URL search parameters, enabling:

- **Shareable URLs** — Users can bookmark or share filtered views
- **Browser navigation** — Back/forward buttons work naturally with your app state
- **Deep linking** — Direct links to specific app states
- **SEO-friendly URLs** — Search engines can index different states of your app

## Type-Safe APIs

The `schemas` folder uses **Zod** to define validation schemas for your database and API requests.

These schemas ensure your data always matches the expected shape, reducing bugs and runtime errors.

With **oRPC**, you leverage these schemas to enforce **end-to-end type safety**—from frontend to backend—so your types are automatically inferred and consistent across your entire app.

Moreover, we consider **TypeScript mandatory** because it catches errors early, improves developer productivity, and makes your codebase more maintainable and scalable as it grows.

Contrary to common belief, focusing on type safety and strong typing actually helps you build _**faster**_ and with _**more confidence**_—by preventing subtle bugs and costly refactors down the line, not to mention enabling **powerful IntelliSense** that speeds up development.

## Arrow Functions

Understanding when to use arrow functions versus named functions is crucial for writing clean, maintainable code.

Each has specific use cases where they excel:

### Use Arrow Functions For:

- **Event handlers and callbacks** — They automatically bind `this` and are more concise
  ```tsx
  const handleClick = () => {
    setCount(prev => prev + 1)
  }
  ```

- **Simple utility functions** — When the function is short and focused
  ```tsx
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`
  ```

- **Array methods** — For map, filter, reduce operations
  ```tsx
  const doubled = numbers.map(n => n * 2)
  ```

### Use Named Functions For:

- **Complex logic** — When the function has multiple responsibilities or is longer
  ```tsx
  function validateUserInput(input: UserInput): ValidationResult {
    const errors = []
    
    if (!input.email) {
      errors.push('Email is required')
    }
    
    if (input.password.length < 8) {
      errors.push('Password must be at least 8 characters')
    }
    
    return { isValid: errors.length === 0, errors }
  }
  ```

- **Recursive functions** — Named functions can reference themselves
  ```tsx
  function factorial(n: number): number {
    return n <= 1 ? 1 : n * factorial(n - 1)
  }
  ```

- **Functions that need hoisting** — When you need to call the function before it's defined
  ```tsx
  function processData() {
    return transformData(validateData())
  }
  
  function validateData() { /* ... */ }
  function transformData() { /* ... */ }
  ```

- **Class methods** — For object-oriented patterns
  ```tsx
  class UserService {
    async getUser(id: string) {
      return await this.api.get(`/users/${id}`)
    }
  }
  ```

### Explanations

**Hoisting** is a JavaScript mechanism where function and variable declarations are moved to the top of their scope during the compilation phase.

**Named function** declarations are _fully hoisted_, meaning you can call them before they're defined in your code.

However, arrow functions are not hoisted because they're assigned to variables using `const` or `let`, which follow the temporal dead zone rule.

Additionally, **React DevTools** displays component names more clearly when using named functions.

Indeed, arrow functions assigned to variables often show up as "Anonymous" or with less descriptive names in the component tree, making debugging more difficult.

Thus, named functions offer superior debugging capabilities and component identification in React DevTools compared to anonymous arrow functions.

## Error Handling

Managing errors gracefully is crucial for robust apps. Zap.ts encourages using [Effect](https://effect.website) — a modern, composable effect system for TypeScript and JavaScript.

Effect helps you write **type-safe**, **declarative** error handling and async workflows that are:

* Predictable and composable
* Easy to test and maintain
* Seamlessly integrated with TypeScript’s type system

By modeling failures explicitly, you avoid unexpected crashes and make your app’s behavior more reliable.

Learn more about [Effect](https://effect.website/docs) and how it can elevate your error handling strategy here.

## Performance & Optimization

Performance directly impacts user experience and SEO. Here are the key Next.js _optimization strategies_ to understand:

- **Bundle Analysis**  
  Regularly analyze your bundles with tools like [`@next/bundle-analyzer`](https://www.npmjs.com/package/@next/bundle-analyzer) to find and reduce large dependencies or unnecessary code.

- **Lazy Loading (Dynamic Import)**  
  Use [dynamic imports](https://nextjs.org/docs/app/guides/lazy-loading) (`dynamic()`) to load heavy or rarely used components on demand, reducing the initial bundle size and speeding up page loads. 

- **Route Prefetching**  
  Take advantage of Next.js’s automatic [link prefetching](https://nextjs.org/docs/app/api-reference/components/link#prefetch) (`<Link prefetch>`) to preload pages users are likely to visit next, enabling faster navigation.

- **SSR vs SSG vs ISR**  
  - *SSR ([Server-Side Rendering](https://nextjs.org/docs/app/guides/migrating/app-router-migration#server-side-rendering-getserversideprops))*: Best for dynamic pages that need fresh data on every request such as user dashboards.  
  - *SSG ([Static Site Generation](https://nextjs.org/docs/app/guides/migrating/app-router-migration#static-site-generation-getstaticprops))*: Ideal for mostly static pages that rarely change like marketing pages.  
  - *ISR ([_Incremental Static Generation_](https://nextjs.org/docs/app/guides/incremental-static-regeneration))*: A hybrid approach for mostly static pages with occasional updates, like blogs with frequent content changes. 

## Middleware

Next.js **Middleware** lets you intercept HTTP requests before they reach your pages or APIs, use it to:

- Handle authentication and conditional redirects  
- Modify HTTP headers for security (CSP, CORS)  
- Implement dynamic routing or localization

It leverages the **Edge Runtime** that runs your code at the network edge, _closest to users_, providing _ultra-low latency_ and _instant scalability_.

## Naming Files

Follow these naming rules for clarity:

- **Components:** Use `component-name.tsx`  
  > Example: `user-card.tsx`

- **Constants (in the `data` folder):** Use uppercase naming  
  > Examples: `FLAGS`, `BASE_URL`

- **Database Schema:** Use `your-schema.sql.ts`  
  > Example: `auth.sql.ts`

- **Hooks:** Use `use-hook.ts`  
  > Example: `use-user-profile.ts`

- **Mails:** Use `your-mail.mail.ts`
  > Example: `template.mail.tsx`

- **Queries:** Use `your-query.query.ts`  
  > Example: `get-users.query.ts`

- **RPC Procedures:** Use `your-procedure.rpc.ts`  
  > Example: `user.rpc.ts`

- **Server Actions:** Use `your-action.action.ts`  
  > Example: `update-user.action.ts`

- **Stores:** Use `your-store.store.ts`  
  > Example: `user.store.ts`

- **Zod Schemas:** Use `your-schema.schema.ts` and prefer PascalCase for schema names  
  > Example file: `user.schema.ts`  
  > Example schema name: `UserSchema` (not `userSchema`)

- **Other files:** Follow React naming conventions, like PascalCase for components.

## Maximize Your IDE Efficiency

It may sound _cliché_, but using your IDE’s search and navigation features can save you a lot of time when jumping between files.

::: tip VSCode Navigation
In VSCode, hold `CMD` (or `Ctrl` on Windows) and left-click a file name (e.g., `use-user-profile.ts`) to open it quickly.
:::

## Rationale

These best practices are designed with *scalability*, *maintainability*, and *developer experience* in mind:

* **Clear separation of concerns** keeps your code modular, making it easier to navigate and update without breaking unrelated parts.
* Using **type-safe APIs** drastically reduces runtime errors and boosts confidence by catching bugs early during development.
* Favoring **Zustand over React context** for app state prevents unnecessary re-renders and improves performance.
* Emphasizing **TypeScript as mandatory** ensures consistent code quality, better refactoring, and superior tooling support (like IntelliSense).
* Leveraging **Next.js’s file-system routing** alongside logical folder grouping makes your app structure intuitive without complicating URLs.
* Encouraging **IDE efficiency** habits minimizes friction in your workflow, allowing you to focus more on building features than on hunting down files.

In short, this approach balances *speed*, *robustness*, and *clarity* to help you build modern apps that last.