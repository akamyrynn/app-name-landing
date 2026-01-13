# Requirements Document

## Introduction

Миграция главной страницы (index.html) проекта Orbit Matter с ванильного HTML/CSS/JS на Next.js App Router. Включает перенос всех стилей, анимаций (GSAP, Lenis), интерактивных элементов и компонентов.

## Glossary

- **Home_Page**: Главная страница приложения Orbit Matter (текущий index.html)
- **GSAP_Animation_System**: Система анимаций на базе GSAP с плагинами ScrollTrigger и SplitText
- **Lenis_Scroll**: Библиотека плавного скролла
- **Interactive_Grid**: Интерактивная сетка, реагирующая на движение мыши
- **Preloader**: Анимированный прелоадер с сеткой блоков и кольцами
- **Page_Transition**: Система переходов между страницами с анимацией сетки
- **Hero_Section**: Главный блок с изображением, заголовком и таймером зоны
- **Intro_Section**: Секция со статистикой и анимированным текстом
- **Featured_Missions_Section**: Секция с закреплённым заголовком и списком миссий
- **CTA_Section**: Секция призыва к действию с параллакс-карточками
- **Footer_Component**: Футер с формой и социальными ссылками
- **Navigation_Component**: Навигация с мобильным меню

## Requirements

### Requirement 1: Структура проекта Next.js

**User Story:** As a developer, I want the orbit-matter homepage migrated to Next.js App Router structure, so that I can maintain and extend it using modern React patterns.

#### Acceptance Criteria

1. THE Home_Page SHALL be implemented as a Next.js page component at `/app/orbit-matter-next/page.tsx`
2. THE GSAP_Animation_System SHALL be initialized only on the client side using `"use client"` directive
3. WHEN the page loads, THE Home_Page SHALL render all sections in the same order as the original HTML
4. THE Home_Page SHALL use TypeScript for type safety

### Requirement 2: Глобальные стили и CSS переменные

**User Story:** As a developer, I want all CSS styles migrated to the Next.js project, so that the visual appearance matches the original design.

#### Acceptance Criteria

1. THE Home_Page SHALL include all CSS variables from globals.css (--base-100 through --base-500)
2. THE Home_Page SHALL import Google Fonts (Geist Mono, Host Grotesk, WDXL Lubrifont SC, Schabo)
3. THE Home_Page SHALL apply global typography styles for h1, h2, h3, a, p elements
4. THE Home_Page SHALL include the `.btn` component styles with hover animations
5. THE Home_Page SHALL include the `.container` utility class
6. WHEN rendered, THE Home_Page SHALL visually match the original design

### Requirement 3: Навигация

**User Story:** As a user, I want to navigate between pages using the navigation menu, so that I can access different sections of the site.

#### Acceptance Criteria

1. THE Navigation_Component SHALL be implemented as a React component
2. THE Navigation_Component SHALL display navigation links (Index, Observatory, Expedition, Traces, Contact)
3. WHEN on mobile (viewport <= 1000px), THE Navigation_Component SHALL show a toggle menu
4. WHEN the menu toggle is clicked on mobile, THE Navigation_Component SHALL expand/collapse the menu
5. WHEN the viewport is resized above 1000px, THE Navigation_Component SHALL close the mobile menu
6. THE Navigation_Component SHALL apply the SVG goo filter effect

### Requirement 4: Прелоадер

**User Story:** As a user, I want to see a loading animation on first visit, so that I know the page is loading.

#### Acceptance Criteria

1. THE Preloader SHALL be implemented as a React component
2. WHEN the page loads for the first time in a session, THE Preloader SHALL display the loading animation
3. THE Preloader SHALL create a grid of blocks that fade out randomly
4. THE Preloader SHALL display animated rings and discs
5. THE Preloader SHALL display "Stabilizing Feed" text with blinking animation
6. WHEN the preloader completes, THE Preloader SHALL store state in sessionStorage
7. WHEN sessionStorage indicates preloader was seen, THE Preloader SHALL not display
8. WHEN the preloader completes, THE Lenis_Scroll SHALL be enabled

### Requirement 5: Интерактивная сетка

**User Story:** As a user, I want to see an interactive background grid that responds to my mouse movement, so that the page feels dynamic.

#### Acceptance Criteria

1. THE Interactive_Grid SHALL be implemented as a React component
2. THE Interactive_Grid SHALL create a grid of 60px blocks covering the viewport
3. WHEN the mouse moves over the page, THE Interactive_Grid SHALL highlight nearby blocks
4. THE Interactive_Grid SHALL highlight clusters of 1-2 adjacent blocks
5. WHEN a block is highlighted, THE Interactive_Grid SHALL remove the highlight after 300ms
6. WHEN the window is resized, THE Interactive_Grid SHALL recreate the grid

### Requirement 6: Hero секция

**User Story:** As a user, I want to see an impressive hero section with animated content, so that I understand what the site is about.

#### Acceptance Criteria

1. THE Hero_Section SHALL display a full-viewport hero image with clip-path shape
2. THE Hero_Section SHALL display a timezone timer that updates every minute
3. THE Hero_Section SHALL display the main heading "Interplanetary Observatory" with slide animation
4. THE Hero_Section SHALL display body copy with slide animation
5. THE Hero_Section SHALL display callout text with flicker animation
6. THE Hero_Section SHALL apply the scanline overlay animation on the image
7. WHEN the preloader is showing, THE Hero_Section animations SHALL be delayed by 2 seconds

### Requirement 7: Intro секция

**User Story:** As a user, I want to see statistics and an animated text section, so that I learn about the observatory's achievements.

#### Acceptance Criteria

1. THE Intro_Section SHALL display 4 stat cards (Worlds Observed: 12, Recovered Fragments: 64, Signal Events: 23, Active Units: 09)
2. THE Intro_Section SHALL display a heading with slide animation triggered on scroll
3. THE Intro_Section SHALL display body text that fills with color as user scrolls
4. WHEN scrolling through the intro copy, THE Intro_Section SHALL progressively change character colors from --base-300 to --base-100

### Requirement 8: Featured Missions секция

**User Story:** As a user, I want to see highlighted missions with a sticky header effect, so that I can browse mission cards while the title stays visible.

#### Acceptance Criteria

1. THE Featured_Missions_Section SHALL display a large heading "Highlighted Missions"
2. THE Featured_Missions_Section heading SHALL be pinned while scrolling through mission cards
3. THE Featured_Missions_Section SHALL display 5 mission cards (Solar Ridge, Crystalline Basin, Luminar Signal, Valley Structures, Emerald Horizon)
4. WHEN scrolling past the missions, THE Featured_Missions_Section heading SHALL unpin

### Requirement 9: CTA секция

**User Story:** As a user, I want to see a call-to-action section with animated cards, so that I'm encouraged to contact the observatory.

#### Acceptance Criteria

1. THE CTA_Section SHALL display a logo that scales in on scroll
2. THE CTA_Section SHALL display body text with line reveal animation
3. THE CTA_Section SHALL display a "Send Transmission" button with fade animation
4. THE CTA_Section SHALL display 6 image cards in 3 rows
5. WHEN scrolling, THE CTA_Section cards SHALL animate with parallax rotation and translation effects

### Requirement 10: Footer

**User Story:** As a user, I want to see a footer with contact form and social links, so that I can connect with the observatory.

#### Acceptance Criteria

1. THE Footer_Component SHALL display a heading and email input field
2. THE Footer_Component SHALL display a "Transmit Message" button
3. THE Footer_Component SHALL display body copy about the observatory
4. THE Footer_Component SHALL display 9 social media links
5. THE Footer_Component SHALL display copyright information
6. THE Footer_Component SHALL apply the clip-path shape matching the hero

### Requirement 11: Плавный скролл (Lenis)

**User Story:** As a user, I want smooth scrolling behavior, so that the page feels polished and professional.

#### Acceptance Criteria

1. THE Lenis_Scroll SHALL be initialized on page load
2. THE Lenis_Scroll SHALL integrate with GSAP ScrollTrigger
3. WHEN on mobile (viewport <= 1000px), THE Lenis_Scroll SHALL use shorter duration (0.8s) and lower lerp (0.075)
4. WHEN on desktop, THE Lenis_Scroll SHALL use longer duration (1.2s) and higher lerp (0.1)
5. WHEN the preloader is active, THE Lenis_Scroll SHALL be stopped
6. WHEN the preloader completes, THE Lenis_Scroll SHALL be started

### Requirement 12: Переходы между страницами

**User Story:** As a user, I want animated transitions when navigating between pages, so that the experience feels seamless.

#### Acceptance Criteria

1. THE Page_Transition SHALL create a grid of blocks for the transition effect
2. WHEN clicking an internal link, THE Page_Transition SHALL animate blocks to cover the screen
3. WHEN the transition animation completes, THE Page_Transition SHALL navigate to the new page
4. WHEN arriving on a new page after transition, THE Page_Transition SHALL animate blocks away to reveal content
5. THE Page_Transition SHALL not trigger for external links, hash links, or same-page links
6. THE Page_Transition SHALL store transition state in sessionStorage

### Requirement 13: Анимации текста

**User Story:** As a user, I want to see animated text effects, so that the content feels dynamic and engaging.

#### Acceptance Criteria

1. WHEN an element has `data-animate-variant="slide"`, THE GSAP_Animation_System SHALL apply line reveal animation
2. WHEN an element has `data-animate-variant="flicker"`, THE GSAP_Animation_System SHALL apply character flicker animation
3. WHEN an element has `data-animate-on-scroll="true"`, THE GSAP_Animation_System SHALL trigger animation on scroll
4. THE GSAP_Animation_System SHALL respect `data-animate-delay` attribute for timing
5. THE GSAP_Animation_System SHALL use SplitText for text splitting

### Requirement 14: Адаптивность

**User Story:** As a user, I want the page to work well on mobile devices, so that I can browse on any screen size.

#### Acceptance Criteria

1. WHEN viewport is <= 1000px, THE Hero_Section SHALL remove clip-path and scanline overlay
2. WHEN viewport is <= 1000px, THE Hero_Section content SHALL be centered
3. WHEN viewport is <= 1000px, THE Intro_Section stats SHALL stack vertically
4. WHEN viewport is <= 1000px, THE Featured_Missions_Section list SHALL be full width
5. WHEN viewport is <= 1000px, THE CTA_Section cards SHALL be hidden
6. WHEN viewport is <= 1000px, THE Footer_Component content SHALL stack vertically
