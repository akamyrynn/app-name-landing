# Implementation Plan: Orbit Matter Homepage Migration

## Overview

Миграция главной страницы Orbit Matter с ванильного HTML/CSS/JS на Next.js App Router с TypeScript. Реализация включает все компоненты, анимации GSAP, Lenis scroll и property-based тесты.

## Tasks

- [x] 1. Настройка структуры проекта и зависимостей
  - Создать директорию `app/orbit-matter-next/`
  - Установить зависимости: gsap, lenis, @gsap/react
  - Создать базовую структуру папок (components, hooks, utils)
  - Настроить globals.css с CSS переменными и шрифтами
  - _Requirements: 1.1, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 2. Реализация утилит и констант
  - [x] 2.1 Создать `utils/constants.ts` с константами (GRID_BLOCK_SIZE, LENIS_CONFIG, CSS_VARIABLES)
    - _Requirements: 5.2, 5.5, 11.3, 11.4_
  - [x] 2.2 Создать `utils/animations.ts` с функциями анимаций GSAP
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_
  - [x] 2.3 Создать `utils/pageData.ts` с данными страницы (NAV_LINKS, STATS, MISSIONS, etc.)
    - _Requirements: 3.2, 7.1, 8.3, 9.4, 10.4_

- [x] 3. Реализация базовых компонентов
  - [x] 3.1 Создать `components/GooFilter.tsx` - SVG фильтр для goo эффекта
    - _Requirements: 3.6_
  - [x] 3.2 Создать `components/Navigation/` - навигация с мобильным меню
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  - [x] 3.3 Написать property test для Navigation Mobile State
    - **Property 4: Navigation Mobile State**
    - **Validates: Requirements 3.5**

- [x] 4. Реализация Preloader и InteractiveGrid
  - [x] 4.1 Создать хук `hooks/usePreloader.ts`
    - _Requirements: 4.6, 4.7_
  - [x] 4.2 Создать `components/Preloader/` - прелоадер с анимацией
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.8_
  - [x] 4.3 Написать property test для Preloader Session State
    - **Property 1: Preloader Session State Consistency**
    - **Validates: Requirements 4.6, 4.7, 4.8**
  - [x] 4.4 Создать хук `hooks/useInteractiveGrid.ts`
    - _Requirements: 5.3, 5.4, 5.5, 5.6_
  - [x] 4.5 Создать `components/InteractiveGrid/`
    - _Requirements: 5.1, 5.2_
  - [x] 4.6 Написать property test для Grid Block Coverage
    - **Property 2: Interactive Grid Block Coverage**
    - **Validates: Requirements 5.2**
  - [x] 4.7 Написать property test для Grid Highlight Timing
    - **Property 3: Grid Highlight Timing**
    - **Validates: Requirements 5.5**

- [x] 5. Checkpoint - Базовые компоненты
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Реализация TransitionGrid и Lenis
  - [x] 6.1 Создать `components/TransitionGrid/` - сетка для переходов
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.6_
  - [x] 6.2 Создать хук `hooks/useLenis.ts` - плавный скролл
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_
  - [x] 6.3 Написать property test для Page Transition Link Filtering
    - **Property 7: Page Transition Link Filtering**
    - **Validates: Requirements 12.5**

- [x] 7. Реализация Hero секции
  - [x] 7.1 Создать `components/HeroSection/` - hero с изображением и контентом
    - _Requirements: 6.1, 6.3, 6.4, 6.5, 6.6_
  - [x] 7.2 Реализовать таймер зоны с форматированием времени Toronto
    - _Requirements: 6.2_
  - [x] 7.3 Написать property test для Hero Timer Format
    - **Property 5: Hero Timer Format**
    - **Validates: Requirements 6.2**
  - [x] 7.4 Написать property test для Animation Delay Adjustment
    - **Property 8: Animation Delay Adjustment**
    - **Validates: Requirements 6.7, 13.4**

- [x] 8. Реализация Intro секции
  - [x] 8.1 Создать `components/IntroSection/` - статистика и анимированный текст
    - _Requirements: 7.1, 7.2, 7.3_
  - [x] 8.2 Реализовать анимацию заполнения текста цветом при скролле
    - _Requirements: 7.4_
  - [x] 8.3 Написать property test для Intro Text Fill Progress
    - **Property 6: Intro Text Fill Progress**
    - **Validates: Requirements 7.4**

- [x] 9. Checkpoint - Основные секции
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Реализация Featured Missions секции
  - [x] 10.1 Создать `components/FeaturedMissionsSection/` - заголовок и карточки миссий
    - _Requirements: 8.1, 8.3_
  - [x] 10.2 Реализовать sticky заголовок с ScrollTrigger pin
    - _Requirements: 8.2, 8.4_

- [x] 11. Реализация CTA секции
  - [x] 11.1 Создать `components/CTASection/` - лого, текст, кнопка, карточки
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  - [x] 11.2 Реализовать параллакс анимацию карточек
    - _Requirements: 9.5_

- [x] 12. Реализация Footer
  - [x] 12.1 Создать `components/Footer/` - форма, соцсети, копирайт
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [x] 13. Сборка главной страницы
  - [x] 13.1 Создать `app/orbit-matter-next/layout.tsx` с метаданными
    - _Requirements: 1.1_
  - [x] 13.2 Создать `app/orbit-matter-next/page.tsx` - сборка всех компонентов
    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 13.3 Подключить все анимации и хуки
    - _Requirements: 6.7, 13.4_

- [x] 14. Адаптивность
  - [x] 14.1 Добавить медиа-запросы для всех компонентов (breakpoint 1000px)
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_

- [x] 15. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Все задачи обязательны, включая property-based тесты
- Property tests используют fast-check для генерации тестовых данных
- Все компоненты используют `"use client"` директиву для client-side анимаций
- GSAP плагины (ScrollTrigger, SplitText) требуют Club GreenSock лицензию для SplitText
- Изображения берутся из существующей папки `app/orbit-matter/public/`
