# Practical Examples

## Example 1: Create a Shared Utils Package

### Step 1: Create Package Structure
```bash
mkdir -p packages/utils/src
```

### Step 2: Package Configuration
```json
// packages/utils/package.json
{
  "name": "@cc/utils",
  "version": "0.0.1",
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  }
}
```

### Step 3: Add Utility Functions
```typescript
// packages/utils/src/index.ts
export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "-");
}

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): T {
  let timeout: Timer;
  return ((...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  }) as T;
}
```

### Step 4: Install & Use
```bash
bun install
```

```typescript
// apps/web/src/app.tsx
import { formatDate, slugify } from "@cc/utils";

const date = formatDate(new Date());
const slug = slugify("Hello World");
```

---

## Example 2: Shared Types Package

### Package Structure
```
packages/types/
├── package.json
└── src/
    ├── index.ts
    ├── user.ts
    ├── api.ts
    └── config.ts
```

### Type Definitions
```typescript
// packages/types/src/user.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  createdAt: Date;
}

export interface UserCreateInput {
  email: string;
  name: string;
  password: string;
}

// packages/types/src/api.ts
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// packages/types/src/index.ts
export * from "./user";
export * from "./api";
export * from "./config";
```

### Usage Across Apps
```typescript
// apps/api/src/handlers/user.ts
import type { User, ApiResponse } from "@cc/types";

export function getUser(id: string): ApiResponse<User> {
  // Implementation
}

// apps/web/src/services/api.ts
import type { User, ApiResponse } from "@cc/types";

async function fetchUser(id: string): Promise<ApiResponse<User>> {
  // Same types on frontend!
}
```

---

## Example 3: Shared UI Components

### Package Structure
```
packages/ui/
├── package.json
└── src/
    ├── index.ts
    ├── button.tsx
    ├── input.tsx
    └── card.tsx
```

### Package Configuration
```json
// packages/ui/package.json
{
  "name": "@cc/ui",
  "version": "0.0.1",
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./button": "./src/button.tsx",
    "./input": "./src/input.tsx"
  },
  "peerDependencies": {
    "react": "^18.0.0"
  }
}
```

### Component Implementation
```typescript
// packages/ui/src/button.tsx
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles = "rounded font-medium transition-colors";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Usage in App
```typescript
// apps/web/src/components/LoginForm.tsx
import { Button } from "@cc/ui";
import { Input } from "@cc/ui/input";

export function LoginForm() {
  return (
    <form>
      <Input type="email" placeholder="Email" />
      <Input type="password" placeholder="Password" />
      <Button variant="primary" size="lg">
        Sign In
      </Button>
    </form>
  );
}
```

---

## Example 4: Shared Configuration

### Package Structure
```
packages/config/
├── package.json
├── eslint.config.js
├── tsconfig.base.json
└── tsconfig.react.json
```

### Base TypeScript Config
```json
// packages/config/tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}

// packages/config/tsconfig.react.json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "jsx": "react-jsx"
  }
}
```

### Usage
```json
// apps/web/tsconfig.json
{
  "extends": "@cc/config/tsconfig.react.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"]
}

// apps/api/tsconfig.json
{
  "extends": "@cc/config/tsconfig.base.json",
  "compilerOptions": {
    "types": ["bun-types"]
  },
  "include": ["src/**/*"]
}
```

---

## Example 5: Feature Flag Package

### Implementation
```typescript
// packages/feature-flags/src/index.ts
type FeatureFlags = {
  newDashboard: boolean;
  darkMode: boolean;
  betaFeatures: boolean;
};

const defaultFlags: FeatureFlags = {
  newDashboard: false,
  darkMode: true,
  betaFeatures: false,
};

let flags: FeatureFlags = { ...defaultFlags };

export function initFlags(overrides: Partial<FeatureFlags>) {
  flags = { ...defaultFlags, ...overrides };
}

export function isEnabled(flag: keyof FeatureFlags): boolean {
  return flags[flag];
}

export function getFlags(): FeatureFlags {
  return { ...flags };
}
```

### Usage
```typescript
// apps/web/src/app.tsx
import { initFlags, isEnabled } from "@cc/feature-flags";

initFlags({
  newDashboard: process.env.ENABLE_NEW_DASHBOARD === "true",
});

function App() {
  return isEnabled("newDashboard") ? <NewDashboard /> : <OldDashboard />;
}
```

---

## Quick Reference: Adding New Package

```bash
# 1. Create structure
mkdir -p packages/my-package/src

# 2. Create package.json
cat > packages/my-package/package.json << 'EOF'
{
  "name": "@cc/my-package",
  "version": "0.0.1",
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  }
}
EOF

# 3. Create entry point
echo 'export const hello = "world";' > packages/my-package/src/index.ts

# 4. Install to link
bun install

# 5. Add to consuming package
bun add @cc/my-package --cwd apps/web
```
