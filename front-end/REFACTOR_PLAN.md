# Refactoring Plan: Dynamic Factsheet with Supabase

This document outlines the plan to refactor the `SodefiFundComponent` from using static data to fetching dynamic data from a Supabase database. This will allow for displaying factsheets for different months by querying the database.

## 1. Overview

The goal is to replace all hard-coded data in the factsheet—including performance metrics, charts, and commentary—with data fetched from a Supabase backend. The data will be versioned by month and year, and the user will be able to navigate through different historical factsheets.

## 2. Database Schema

We'll use a relational schema to store the data for each monthly factsheet. A central `factsheet_versions` table will hold the core information for a given month, and other tables will store related data, linked by a foreign key.

Here is the proposed table structure:

-   **`factsheet_versions`**: Stores the unique entry for each month's factsheet, including the commentary.
-   **`factsheet_performance_stats`**: Stores the data for the two main statistics tables (Performance and Statistics).
-   **`monthly_returns`**: Stores the monthly returns for the Sodefi Fund and the Reference Index.
-   **`factsheet_contribution`**: Stores the data for the three relative return contribution bar charts.

### Table Definitions

**`factsheet_versions`**

| Column      | Type      | Constraints                     | Description                               |
| :---------- | :-------- | :------------------------------ | :---------------------------------------- |
| `id`        | `uuid`    | Primary Key, default `gen_random_uuid()` | Unique identifier for the factsheet version |
| `year`      | `integer` | Not Null                        | The year of the factsheet (e.g., 2025)    |
| `month`     | `integer` | Not Null, CHECK (1-12)          | The month of the factsheet (e.g., 3 for March) |
| `commentary`| `text`    |                                 | The monthly commentary text               |
| `created_at`| `timestamptz`| Not Null, default `now()`      | Timestamp of creation                     |
|             |           | UNIQUE (`year`, `month`)        | Ensures only one factsheet per month/year |

**`factsheet_performance_stats`**

| Column                 | Type    | Constraints                             | Description                                 |
| :--------------------- | :------ | :-------------------------------------- | :------------------------------------------ |
| `id`                   | `uuid`  | Primary Key, default `gen_random_uuid()`| Unique identifier for the stat entry        |
| `factsheet_id`         | `uuid`  | Not Null, FK to `factsheet_versions.id` | Links to a specific factsheet version       |
| `series_name`          | `text`  | Not Null                                | e.g., "Sodefi Fund Lead Series*", "Reference Index 70/30" |
| `one_month_return`     | `real`  |                                         | 1M performance %                          |
| `three_month_return`   | `real`  |                                         | 3M performance %                          |
| `six_month_return`     | `real`  |                                         | 6M performance %                          |
| `twelve_month_return`  | `real`  |                                         | 12M performance %                         |
| `ytd_return`           | `real`  |                                         | YTD performance %                         |
| `cagr_since_inception` | `real`  |                                         | CAGR since inception %                    |
| `sharpe_ratio`         | `real`  |                                         | Sharpe Ratio                              |
| `ann_volatility`       | `real`  |                                         | Annualized volatility %                   |
| `worst_monthly_return` | `real`  |                                         | Worst Monthly Return %                    |
| `max_drawdown`         | `real`  |                                         | Max Drawdown %                            |

**`monthly_returns`**

| Column      | Type      | Constraints                     | Description                               |
| :---------- | :-------- | :------------------------------ | :---------------------------------------- |
| `id`        | `uuid`    | Primary Key, default `gen_random_uuid()` | Unique identifier for the monthly return |
| `date`      | `date`    | Not Null, UNIQUE                | The last day of the month for the return (e.g., '2024-01-31') |
| `sodefi_return`| `real`  | Not Null                        | The monthly return for Sodefi Fund        |
| `reference_return` | `real`  | Not Null                        | The monthly return for the Reference Index |

**`factsheet_contribution`**

| Column          | Type    | Constraints                             | Description                                 |
| :-------------- | :------ | :-------------------------------------- | :------------------------------------------ |
| `id`            | `uuid`  | Primary Key, default `gen_random_uuid()`| Unique identifier for the contribution entry|
| `factsheet_id`  | `uuid`  | Not Null, FK to `factsheet_versions.id` | Links to a specific factsheet version       |
| `portfolio_type`| `text`  | Not Null                                | "US Portfolio", "EU Portfolio", "Managed Futures" |
| `name`          | `text`  | Not Null                                | Name of the contribution item (e.g., "Industrial") |
| `value`         | `real`  |                                         | The contribution value                      |

---

## 3. SQL Table Creation Script

You can run the following SQL script in your Supabase SQL Editor to create the tables.

```sql
-- Table for factsheet versions, indexed by year and month
CREATE TABLE public.factsheet_versions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    year integer NOT NULL,
    month integer NOT NULL,
    commentary text NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT factsheet_versions_pkey PRIMARY KEY (id),
    CONSTRAINT factsheet_versions_year_month_key UNIQUE (year, month),
    CONSTRAINT factsheet_versions_month_check CHECK (((month >= 1) AND (month <= 12)))
);

-- Table for performance and statistics metrics
CREATE TABLE public.factsheet_performance_stats (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    factsheet_id uuid NOT NULL,
    series_name text NOT NULL,
    one_month_return real NULL,
    three_month_return real NULL,
    six_month_return real NULL,
    twelve_month_return real NULL,
    ytd_return real NULL,
    cagr_since_inception real NULL,
    sharpe_ratio real NULL,
    ann_volatility real NULL,
    worst_monthly_return real NULL,
    max_drawdown real NULL,
    CONSTRAINT factsheet_performance_stats_pkey PRIMARY KEY (id),
    CONSTRAINT factsheet_performance_stats_factsheet_id_fkey FOREIGN KEY (factsheet_id) REFERENCES public.factsheet_versions(id) ON DELETE CASCADE
);

-- Table for the historical performance data for the line chart
CREATE TABLE public.monthly_returns (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    date date NOT NULL,
    sodefi_return real NOT NULL,
    reference_return real NOT NULL,
    CONSTRAINT monthly_returns_pkey PRIMARY KEY (id),
    CONSTRAINT monthly_returns_date_key UNIQUE (date)
);

-- Table for the contribution-to-return bar charts
CREATE TABLE public.factsheet_contribution (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    factsheet_id uuid NOT NULL,
    portfolio_type text NOT NULL,
    name text NOT NULL,
    value real NULL,
    CONSTRAINT factsheet_contribution_pkey PRIMARY KEY (id),
    CONSTRAINT factsheet_contribution_factsheet_id_fkey FOREIGN KEY (factsheet_id) REFERENCES public.factsheet_versions(id) ON DELETE CASCADE
);

-- Enable Row-Level Security (RLS) for all tables
ALTER TABLE public.factsheet_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.factsheet_performance_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.factsheet_contribution ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access
CREATE POLICY "Allow public read access" ON public.factsheet_versions FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.factsheet_performance_stats FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.monthly_returns FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.factsheet_contribution FOR SELECT USING (true);

-- Create policies to allow authenticated users to perform all actions (for admin panel)
-- Make sure your Supabase client is authenticated (e.g., using the service_role key in a secure server environment, or a logged-in user)
CREATE POLICY "Allow full access for authenticated users" ON public.factsheet_versions FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow full access for authenticated users" ON public.factsheet_performance_stats FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow full access for authenticated users" ON public.monthly_returns FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow full access for authenticated users" ON public.factsheet_contribution FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
```

---

## 4. Sample Data Insertion (for March 2025)

Here is a sample SQL script to populate the database with the data from the current static component. This will allow you to test the frontend integration immediately.

```sql
-- Insert a factsheet version for March 2025
WITH new_factsheet AS (
  INSERT INTO public.factsheet_versions (year, month, commentary)
  VALUES (
    2025,
    3,
    E'The Sodefi Fund delivered a mixed performance in March 2025, with the EUR Class posting a -0.79% return for the month. While this represents a modest decline, the fund''s year-to-date performance remains positive at 3.58%, demonstrating resilience in volatile market conditions.\\n\\nOur diversified approach, combining 70% quality European and US equities with 30% trend-following futures strategies, continues to provide effective risk management while capturing upside opportunities in selective market segments.\\n\\nMarch 2025 presented a challenging environment characterized by heightened geopolitical tensions and central bank policy uncertainty. European markets faced headwinds from energy price volatility, while US markets grappled with mixed economic data and earnings revisions.\\n\\nThe managed futures component of our strategy proved particularly valuable during this period, with strong performance in bonds and energy sectors offsetting some of the weakness in equity index positions.\\n\\nOur European portfolio maintained strong exposure to financials and banks, which contributed positively to performance despite broader market weakness. The focus on quality stocks with strong fundamentals helped limit downside exposure during the month''s volatility.\\n\\nIn the US large-cap segment, we reduced exposure to consumer cyclicals early in the month, which proved beneficial as this sector underperformed. Technology and industrial positions provided stability to the overall portfolio.\\n\\nLooking ahead to April, we remain cautiously optimistic about market conditions. Our trend-following strategies are well-positioned to capitalize on emerging market movements, while our equity selections continue to focus on quality companies with strong balance sheets.\\n\\nWe expect continued volatility in the near term but believe our diversified approach and active risk management will continue to serve investors well. The fund''s low correlation to traditional benchmarks remains a key advantage in the current environment.'
  )
  RETURNING id
)

-- Insert data into related tables using the ID from the new factsheet
, perf_stats AS (
  INSERT INTO public.factsheet_performance_stats (factsheet_id, series_name, one_month_return, three_month_return, six_month_return, twelve_month_return, ytd_return, cagr_since_inception, sharpe_ratio, ann_volatility, worst_monthly_return, max_drawdown)
  SELECT id, 'Sodefi Fund Lead Series*', -0.79, 2.21, 7.54, 10.92, 3.58, 10.44, -0.79, 2.21, 7.54, 10.92 FROM new_factsheet
  UNION ALL
  SELECT id, 'Reference Index 70/30', 0.03, 1.49, 8.98, 15.76, 2.14, 9.35, 0.03, 1.49, 8.98, 15.76 FROM new_factsheet
)
, monthly_returns_data AS (
    INSERT INTO public.monthly_returns (date, sodefi_return, reference_return)
    VALUES
        ('2024-01-31', 0.012, 0.008), ('2024-02-29', 0.005, -0.002), ('2024-03-31', -0.0079, 0.0003),
        ('2024-04-30', 0.015, 0.011), ('2024-05-31', 0.008, 0.009), ('2024-06-30', -0.002, 0.001),
        ('2024-07-31', 0.021, 0.018), ('2024-08-31', 0.011, 0.015), ('2024-09-30', -0.005, -0.008),
        ('2024-10-31', 0.03, 0.025), ('2024-11-30', 0.022, 0.028), ('2024-12-31', 0.01, 0.012),
        ('2025-01-31', 0.015, 0.011), ('2025-02-28', 0.028, 0.01), ('2025-03-31', -0.0079, 0.0003)
)
INSERT INTO public.factsheet_contribution (factsheet_id, portfolio_type, name, value)
SELECT
    id,
    t.portfolio_type,
    t.name,
    t.value
FROM new_factsheet
CROSS JOIN (
    VALUES
    ('US Portfolio', 'Industrial', 30), ('US Portfolio', 'Consumer Cyclical', 40), ('US Portfolio', 'Financials', 35),
    ('US Portfolio', 'Real Estate', 25), ('US Portfolio', 'Telecoms', 15), ('US Portfolio', 'Technology', 20),
    ('US Portfolio', 'Consumer Cyclical', -30),
    ('EU Portfolio', 'Technology', 10), ('EU Portfolio', 'Basic Materials', 30), ('EU Portfolio', 'CAGE', 15),
    ('EU Portfolio', 'Utilities', 20), ('EU Portfolio', 'Healthcare', 25), ('EU Portfolio', 'Financials', 35),
    ('EU Portfolio', 'Banks', 45),
    ('Managed Futures', 'Agriculture', 30), ('Managed Futures', 'Metals', 25), ('Managed Futures', 'Grains', 15),
    ('Managed Futures', 'FX', 20), ('Managed Futures', 'Equity Index', -35), ('Managed Futures', 'Energy', 40),
    ('Managed Futures', 'Bonds', 50)
) AS t(portfolio_type, name, value);
```

---

## 5. Frontend Refactoring Steps

### 5.1. Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### 5.2. Create Supabase Client

Create a new file `src/lib/supabase.ts` to initialize and export the Supabase client. You mentioned environment variables for the keys are already set up. Supabase uses `VITE_` prefix for env variables.

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be defined in .env file');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 5.3. Component Logic (`SodefiFundComponent.tsx`)

Here's a high-level guide to refactoring the component:

1.  **Import necessary hooks and the Supabase client**: `useState`, `useEffect`, `supabase`.
2.  **Add state for date selection**: Manage the currently selected `year` and `month`.
3.  **Add state for data and loading**:
    -   `factsheetData`: To store the fetched data from Supabase.
    -   `availableFactsheets`: To store a list of available year/month combinations for the UI selector.
    -   `isLoading`: To show a loading indicator.
    -   `error`: To display any fetching errors.
4.  **Fetch data in `useEffect`**:
    -   Write a `useEffect` that runs once on mount to fetch the list of all available factsheets (`year`, `month`).
    -   Write a second `useEffect` that triggers whenever the selected `year` or `month` changes. This effect will call a function to fetch all the data for that specific factsheet.
5.  **Create data fetching functions**:
    -   `getAvailableFactsheets()`: Fetches all `(year, month)` pairs from `factsheet_versions`.
    -   `fetchFactsheetData(year, month)`: Fetches all data for a given date and organizes it into a single object. This function will perform multiple Supabase queries.
6.  **Render dynamic data**:
    -   Replace all static data arrays and text with the data from the `factsheetData` state.
    -   Use conditional rendering to show a loading message while `isLoading` is true.

### 5.4. UI for Date Selection

Add UI elements, like dropdowns, to allow the user to select the year and month. These selectors will update the `year` and `month` state variables, triggering the data fetch.

```tsx
// Example of date selection UI in SodefiFundComponent.tsx

// ... state hooks for year, month, etc.

<div className="flex gap-4 mb-4">
  <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
    {/* Populate with available years */}
  </select>
  <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
    {/* Populate with available months for the selected year */}
  </select>
</div>

```
Now that the plan is in place, we can proceed with modifying the frontend code. 