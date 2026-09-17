# Student Statistics --- Project Brief

## 1. Project Overview

**Student Statistics** is a lightweight, single-page educational
analytics experience designed primarily for an event/demo.

The application will be opened and used directly on **mobile phones and
tablets**. The goal is to provide a polished, professional interface
where a user can view a student's academic performance across multiple
academic years, understand the progression visually, and add or edit
academic-year data.

The application is intentionally simple and focused. It is not a full
student-management system.

------------------------------------------------------------------------

## 2. Main User Experience

The application is a **single-page experience**.

The main page should contain:

1.  Student information.
2.  Overall academic statistics.
3.  Academic years.
4.  GPA/performance progression chart.
5.  Subject comparison chart.
6.  Details of the selected academic year.
7.  Ability to add a new academic year.
8.  Ability to edit an existing academic year.
9.  Responsive layout optimized for mobile and tablet.

The UI should feel like a premium event/demo product rather than a
normal administration dashboard.

------------------------------------------------------------------------

## 3. Design Direction

A reference design image has been placed in the project's `public`
folder.

**Important:** Use the image in `public` as the main visual reference
when implementing the UI.

The implementation should follow the same general visual language:

-   Premium modern dashboard.
-   Dark teal / deep green background.
-   Glassmorphism-inspired cards.
-   Rounded corners.
-   Soft borders.
-   Subtle gradients and glow effects.
-   Clear typography.
-   Strong visual hierarchy.
-   Spacious layout.
-   Smooth responsive behavior.
-   Arabic-first content where appropriate.
-   Charts integrated naturally into the cards.
-   Mobile-first design.
-   Touch-friendly controls.

Do not copy the reference image literally. Use it as a visual direction
for layout, spacing, hierarchy, colors, cards, charts, and overall
polish.

------------------------------------------------------------------------

## 4. Brand Colors

The main brand colors are:

### Primary

``` text
#3B928C
```

### Secondary

``` text
#267372
```

These colors should be used consistently throughout the application.

Suggested usage:

-   `#3B928C` --- primary actions, chart accents, highlights, active
    states.
-   `#267372` --- secondary surfaces, gradients, borders, supporting
    elements.
-   Dark teal/near-black tones --- page background and deep surfaces.
-   White / off-white --- primary text.
-   Muted teal/gray --- secondary text.

The exact supporting colors can be derived from the two primary brand
colors while keeping the overall interface cohesive.

------------------------------------------------------------------------

## 5. Logo / Branding

The project uses the **BIG EDUCATION** branding.

A transparent logo is available and should be used in the interface
where appropriate.

The logo should be displayed cleanly without adding unnecessary
containers or backgrounds that conflict with the transparent version.

------------------------------------------------------------------------

## 6. Backend API

The application gets the student's performance data from the backend.

### API Endpoint

``` text
https://grindable-unplumb-jacoby.ngrok-free.dev/api/students/1/performance
```

The endpoint currently returns the performance data for student `1`.

The frontend should consume this endpoint through **RTK Query**.

Do not hardcode the returned student data inside the UI components.

------------------------------------------------------------------------

## 7. Current API Response

The current response structure is:

``` json
{
  "id": 1,
  "student_name": "أحمد محمود",
  "academic_years": [
    {
      "year_id": 1,
      "year_label": "2020-2021",
      "gpa": 87.99,
      "overall_rating": "Excellent",
      "subjects": [
        {
          "name": "اللغة العربية",
          "score": "90.00",
          "rating": "Excellent"
        },
        {
          "name": "اللغة الإنجليزية",
          "score": "85.00",
          "rating": "Excellent"
        },
        {
          "name": "الرياضيات",
          "score": "88.00",
          "rating": "Excellent"
        },
        {
          "name": "العلوم",
          "score": "92.00",
          "rating": "Excellent"
        },
        {
          "name": "الدراسات الاجتماعية",
          "score": "84.97",
          "rating": "Very Good"
        }
      ]
    }
  ]
}
```

The actual API contains multiple academic years following the same
structure.

------------------------------------------------------------------------

## 8. Data Model

### Student

``` ts
interface Student {
  id: number;
  student_name: string;
  academic_years: AcademicYear[];
}
```

### Academic Year

``` ts
interface AcademicYear {
  year_id: number;
  year_label: string;
  gpa: number;
  overall_rating: string;
  subjects: Subject[];
}
```

### Subject

``` ts
interface Subject {
  name: string;
  score: string;
  rating: string;
}
```

Scores currently arrive from the API as strings, while GPA is returned
as a number.

The frontend should handle this consistently when preparing data for
charts and calculations.

------------------------------------------------------------------------

## 9. Academic Years

The current example contains five academic years:

``` text
2020-2021
2021-2022
2022-2023
2023-2024
2024-2025
```

The UI must not assume that there will always be exactly five years.

The number of years should come from the API.

------------------------------------------------------------------------

## 10. Main Statistics

The interface should visually expose important statistics such as:

-   Current/latest GPA.
-   Overall rating.
-   Number of academic years.
-   Performance change/progression where useful.
-   Selected academic year's GPA.
-   Selected academic year's subject performance.

Statistics should be calculated from the actual API data rather than
hardcoded.

------------------------------------------------------------------------

## 11. Charts

The dashboard should contain at least two major charts.

### A. GPA / Performance Line Chart

Purpose:

Show the student's academic performance progression across all academic
years.

Example data:

``` text
2020-2021 → 87.99
2021-2022 → 85.00
2022-2023 → 89.20
2023-2024 → 92.40
2024-2025 → 95.00
```

The chart should:

-   Use the academic year as the X axis.
-   Use GPA/score as the Y axis.
-   Show clear points.
-   Show tooltips.
-   Be responsive.
-   Match the brand colors.
-   Look good on mobile.
-   Update automatically when a new academic year is added.

------------------------------------------------------------------------

### B. Subjects Bar Chart

Purpose:

Compare the scores of subjects in the selected academic year.

Example for `2024-2025`:

``` text
اللغة العربية       97.00
اللغة الإنجليزية    93.00
الرياضيات           96.00
العلوم              97.98
الدراسات الاجتماعية 91.00
```

The chart should:

-   Display each subject clearly.
-   Show the score.
-   Support Arabic labels.
-   Be responsive.
-   Update when the selected academic year changes.
-   Update when subject data changes.

------------------------------------------------------------------------

### Optional Third Chart

A Radar Chart can be used if it improves the final UI.

Possible purpose:

Compare the student's subject strengths visually.

It should only be included if it adds value to the experience and does
not make the mobile page crowded.

------------------------------------------------------------------------

## 12. Academic Year Selection

The user should be able to select an academic year.

Example:

``` text
2020-2021
2021-2022
2022-2023
2023-2024
2024-2025
```

The selected year controls the detailed subject information and subject
chart.

The latest year can be selected by default.

The interaction should be optimized for touch/mobile use.

------------------------------------------------------------------------

## 13. Add New Academic Year

The user can add a new academic year.

The form should allow:

-   Academic year label.
-   Subjects.
-   Subject name.
-   Subject score.
-   Rating where needed.

Example:

``` text
Academic Year:
2025-2026

Subjects:

اللغة العربية       95
اللغة الإنجليزية    91
الرياضيات           98
العلوم              94
الدراسات الاجتماعية 90
```

After adding a year:

-   It should appear in the academic-years list.
-   The charts should update.
-   Statistics should update.
-   The new year should be selectable.
-   Calculated values should reflect the new data.

If the backend does not yet provide a mutation endpoint, the new year
can initially be handled as local client state for the demo.

------------------------------------------------------------------------

## 14. Edit Academic Year

The user can edit an existing academic year.

The edit flow should allow changing:

-   Year label if required.
-   Subject names.
-   Subject scores.
-   Subject ratings.

After editing:

-   The selected year data updates.
-   Charts update.
-   Statistics update.
-   The UI remains synchronized.

Again, if backend mutation endpoints are unavailable, local state can
temporarily handle the demo behavior.

------------------------------------------------------------------------

## 15. Form Validation

Use **Zod** for validation.

Use **React Hook Form** for form management.

Validation should cover:

-   Required year label.
-   Valid subject names.
-   Numeric scores.
-   Reasonable score range.
-   Required subject data.
-   Prevent invalid/empty submissions.

The validation should provide clear feedback without making the mobile
UI complicated.

------------------------------------------------------------------------

## 16. Frontend Stack

### Framework

``` text
Next.js
```

Using:

-   App Router.
-   TypeScript.
-   `src` directory.

### Styling

``` text
Tailwind CSS
```

No heavy UI framework is required.

### State Management

``` text
Redux Toolkit
```

### API / Server State

``` text
RTK Query
```

### Charts

``` text
Recharts
```

### Icons

``` text
Lucide React
```

### Forms

``` text
React Hook Form
```

### Validation

``` text
Zod
```

### Utility Classes

``` text
clsx
tailwind-merge
```

------------------------------------------------------------------------

## 17. Package Installation

The required additional packages are:

``` bash
npm install @reduxjs/toolkit react-redux recharts lucide-react zod react-hook-form clsx tailwind-merge
```

Tailwind CSS is already configured through the Next.js project setup.

------------------------------------------------------------------------

## 18. Architecture

The project follows a feature-based architecture.

``` text
src/
├── app/
├── config/
├── features/
│   └── student/
├── shared/
└── store/
```

The student feature owns student-specific logic.

Shared components and utilities should only contain genuinely reusable
functionality.

------------------------------------------------------------------------

## 19. Current Source Structure

``` text
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   ├── not-found.tsx
│   ├── providers.tsx
│   ├── robots.ts
│   └── sitemap.ts
│
├── config/
│   └── site.ts
│
├── features/
│   └── student/
│       ├── api/
│       │   └── studentApi.ts
│       │
│       ├── components/
│       │   ├── StudentOverview.tsx
│       │   ├── StudentInfo.tsx
│       │   ├── StatisticsSummary.tsx
│       │   │
│       │   ├── charts/
│       │   │   ├── GradesLineChart.tsx
│       │   │   ├── GradesRadarChart.tsx
│       │   │   └── SubjectsBarChart.tsx
│       │   │
│       │   └── add-year/
│       │       ├── AddYearForm.tsx
│       │       ├── AddYearModal.tsx
│       │       └── SubjectInput.tsx
│       │
│       ├── hooks/
│       │   └── useStudent.ts
│       │
│       ├── mappers/
│       │   └── studentChart.mapper.ts
│       │
│       ├── schema/
│       │   └── student.schema.ts
│       │
│       ├── selectors/
│       │   └── studentSelectors.ts
│       │
│       ├── types/
│       │   └── student.types.ts
│       │
│       └── utils/
│           └── student.utils.ts
│
├── shared/
│   ├── api/
│   │   └── fetcher.ts
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorMessage.tsx
│   │   │   └── Loader.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   │
│   │   ├── providers/
│   │   │   └── StoreProvider.tsx
│   │   │
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       └── select.tsx
│   │
│   ├── constants/
│   │   ├── api-endpoints.ts
│   │   ├── cache-times.ts
│   │   ├── routes.ts
│   │   └── seo.ts
│   │
│   ├── hooks/
│   │   └── useIsClient.ts
│   │
│   ├── lib/
│   │   ├── seo/
│   │   │   ├── jsonld.ts
│   │   │   ├── metadata.ts
│   │   │   └── site-url.ts
│   │   │
│   │   └── utils/
│   │       └── cn.ts
│   │
│   └── types/
│       ├── api.types.ts
│       └── common.types.ts
│
└── store/
    ├── baseApi.ts
    ├── hooks.ts
    └── index.ts
```

------------------------------------------------------------------------

## 20. RTK Query Architecture

API communication should follow:

``` text
components
    ↓
useStudent()
    ↓
studentApi
    ↓
baseApi
    ↓
Backend API
```

The application should use RTK Query for:

-   Fetching student performance.
-   Caching.
-   Loading state.
-   Error state.
-   Future mutation endpoints if the backend supports them.

Do not duplicate API data unnecessarily inside Redux slices.

------------------------------------------------------------------------

## 21. Data Transformation

The API response should remain the source of truth.

Charts should receive transformed data appropriate for the chart.

For example:

### API

``` ts
{
  year_label: "2024-2025",
  gpa: 95
}
```

### Chart data

``` ts
{
  year: "2024-2025",
  gpa: 95
}
```

Subject data can similarly be mapped into the structure expected by
Recharts.

Keep this transformation outside the visual chart components whenever
practical.

------------------------------------------------------------------------

## 22. Responsive Requirements

The application must be designed **mobile-first**.

Primary targets:

``` text
Mobile
Tablet
```

Desktop support can exist, but desktop should not dictate the layout.

Important considerations:

-   No horizontal overflow.
-   Charts must fit narrow screens.
-   Buttons should be touch-friendly.
-   Academic-year tabs/selector should remain usable with many years.
-   Tables/details should remain readable on small screens.
-   Modal/form interactions should work comfortably with touch.
-   Avoid tiny text and controls.

------------------------------------------------------------------------

## 23. Arabic / RTL

The student data contains Arabic subject names and Arabic student names.

The application should support RTL properly.

The document/page direction should be:

``` html
dir="rtl"
```

where appropriate.

Charts must also be checked carefully because chart libraries can
require special handling for RTL labels and alignment.

English values such as:

``` text
Excellent
Very Good
```

may be displayed as provided by the API or mapped to Arabic presentation
labels if the final product design requires it.

Do not modify the backend data contract just for presentation.

------------------------------------------------------------------------

## 24. Loading and Error States

The application should provide polished states for:

### Loading

Use:

``` text
shared/components/common/Loader.tsx
```

The loading experience should match the visual design rather than
displaying a generic browser spinner.

### Error

Use:

``` text
shared/components/common/ErrorMessage.tsx
```

The error state should be understandable and visually consistent.

### Empty

Use:

``` text
shared/components/common/EmptyState.tsx
```

for cases such as no academic years or no subjects.

------------------------------------------------------------------------

## 25. Performance

Since this is a small demo application:

-   Keep dependencies minimal.
-   Avoid unnecessary state.
-   Use RTK Query caching.
-   Avoid unnecessary re-renders.
-   Transform chart data efficiently.
-   Lazy-load heavy chart components if needed.
-   Ensure charts do not block the initial UI unnecessarily.

------------------------------------------------------------------------

## 26. Visual Quality Requirements

The most important implementation requirement is **visual quality**.

The final UI should feel:

-   Premium.
-   Modern.
-   Professional.
-   Clean.
-   Consistent.
-   Brand-focused.
-   Mobile-friendly.
-   Suitable for an event/demo.

Avoid:

-   Generic dashboard templates.
-   Default browser controls.
-   Excessive borders.
-   Flat/basic cards.
-   Unstyled tables.
-   Oversized desktop layouts on mobile.
-   Random colors unrelated to the brand.
-   Excessive animations.

Use subtle animations only where they improve the experience.

------------------------------------------------------------------------

## 27. Reference Layout Direction

The expected page flow is approximately:

``` text
┌───────────────────────────┐
│        BIG EDUCATION      │
│                           │
│       Student Info        │
│                           │
├───────────────────────────┤
│ GPA │ Rating │ Years      │
├───────────────────────────┤
│     Academic Years        │
│  20-21 ... 24-25          │
├───────────────────────────┤
│                           │
│    GPA Trend Line Chart   │
│                           │
├───────────────────────────┤
│                           │
│   Subjects Bar Chart      │
│                           │
├───────────────────────────┤
│                           │
│ Selected Year Details     │
│                           │
│ Subject     Score Rating  │
│ Subject     Score Rating  │
│ Subject     Score Rating  │
│                           │
├───────────────────────────┤
│       + Add New Year      │
└───────────────────────────┘
```

The exact layout can evolve during implementation while preserving the
overall visual direction.

------------------------------------------------------------------------

## 28. Important Implementation Rule

Do not hardcode the current five-year dataset into components.

The UI should be driven by:

``` text
API response
+
local demo additions/edits when backend mutations are unavailable
```

This ensures that the project can easily switch to the real backend
implementation later.

------------------------------------------------------------------------

## 29. Development Order

Recommended implementation sequence:

### Phase 1 --- Foundation

1.  Next.js setup.
2.  Tailwind configuration.
3.  Global styles.
4.  Theme/design tokens.
5.  Redux store.
6.  RTK Query base API.

### Phase 2 --- Data

1.  Student types.
2.  API endpoint constants.
3.  Student API service.
4.  Student hook.
5.  Data mappers/selectors.

### Phase 3 --- Main UI

1.  Page shell.
2.  Branding/header.
3.  Student information.
4.  Statistics cards.
5.  Academic-year selector.

### Phase 4 --- Charts

1.  GPA line chart.
2.  Subjects bar chart.
3.  Optional radar chart.
4.  Responsive chart behavior.
5.  Tooltips and visual polish.

### Phase 5 --- Editing

1.  Add-year modal.
2.  Add-year form.
3.  Subject input.
4.  Validation.
5.  Local state integration.
6.  Edit-year flow.

### Phase 6 --- Polish

1.  Mobile responsiveness.
2.  Tablet responsiveness.
3.  RTL review.
4.  Loading states.
5.  Error states.
6.  Animations.
7.  Accessibility.
8.  Final visual polish.

------------------------------------------------------------------------

## 30. Definition of Done

The project is considered ready for the event when:

-   The page works smoothly on mobile.
-   The page works smoothly on tablet.
-   Student data loads from the provided API.
-   All academic years are displayed dynamically.
-   GPA progression is shown visually.
-   Subject scores are shown visually.
-   The user can select an academic year.
-   The user can add an academic year.
-   The user can edit an academic year.
-   Calculations update after changes.
-   Arabic/RTL rendering is correct.
-   The BIG EDUCATION branding is visible.
-   The brand colors are used consistently.
-   The UI follows the reference design direction.
-   Loading and error states are polished.
-   There is no unnecessary desktop-first behavior.
-   The application feels like a finished event/demo experience.

------------------------------------------------------------------------

## 31. Quick Project Summary

``` text
Project:
Student Statistics — BIG EDUCATION Event Demo

Platform:
Mobile + Tablet

Experience:
Single-page interactive student performance dashboard

Framework:
Next.js + TypeScript

Styling:
Tailwind CSS

State:
Redux Toolkit

API:
RTK Query

Charts:
Recharts

Icons:
Lucide React

Forms:
React Hook Form

Validation:
Zod

Brand Colors:
#3B928C
#267372

Backend:
https://grindable-unplumb-jacoby.ngrok-free.dev/api/students/1/performance

Main Features:
- Student overview
- Academic years
- GPA progression
- Subject comparison
- Add academic year
- Edit academic year
- Dynamic calculations
- Responsive mobile/tablet UI
- Arabic / RTL support
```
