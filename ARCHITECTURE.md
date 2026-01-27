# Инфраструктура и Архитектура Проекта

## Схема взаимодействия компонентов

```mermaid
graph TD
    User((Пользователь))
    Manager((Менеджер))
    
    subgraph "Клиентская часть (Frontend)"
        Landing[Основной сайт (Tilda)]
        Configurator[Next.js Конфигуратор]
        Cabinet[Личный Кабинет (Статус)]
        Review[Просмотр PDF и цен]
    end

    subgraph "Бэкенд и Данные (Supabase)"
        DB[(База Данных PostgreSQL)]
        Storage[Хранилище Файлов (PDF, Assets)]
        Auth[Аутентификация (Phone/SMS)]
        Edge[Edge Functions (Логика)]
    end

    subgraph "Внешние сервисы"
        Payment[Платежная система (Bank)]
        Telegram[Telegram Bot API]
        SMS[SMS Провайдер]
    end

    %% Взаимодействия
    User -->|Заход на сайт| Landing
    Landing -->|Переход в конструктор| Configurator
    
    Configurator -->|3D Рендер| User
    Configurator -->|Расчет цены| User
    
    %% Оформление заказа
    Configurator -->|Создание заказа| DB
    Configurator -->|Генерация чертежа| Storage
    
    %% Оплата
    Configurator -->|Инициация оплаты| Payment
    Payment -->|Webhook: Успех| Edge
    Edge -->|Обновление статуса| DB
    
    %% Уведомления
    DB -->|Триггер: Новый заказ| Edge
    Edge -->|Уведомление| Telegram
    Telegram -->|Сообщение| Manager
    
    %% Личный кабинет
    User -->|Вход по телефону| Cabinet
    Cabinet -->|Запрос статуса| DB
    
    %% Админка
    Manager -->|Управление заказами| Configurator
    Configurator -->|Данные заказов| DB
    
```

## Описание потоков данных

1.  **Создание Конфигурации:**
    *   Клиент выбирает параметры в браузере.
    *   Все расчеты (цена, геометрия) происходят на клиенте ( Client-Side) для мгновенного отклика.
    *   При отправке JSON конфигурации сохраняется в таблицу `orders`.

2.  **Личный кабинет:**
    *   **Авторизация:** Беспарольная (Magic Link или SMS OTP через Supabase Auth).
    *   При входе ищется пользователь по `phone` в таблице `orders` (или отдельной `profiles`).
    *   Клиент видит статус заказа (`status` field): "Принят", "В производстве", "Готов", "Отправлен".

3.  **Уведомления:**
    *   Используются **Supabase Database Webhooks** или **Edge Functions**.
    *   При `INSERT` в таблицу `orders` -> срабатывает функция -> Отправляет сообщение в Telegram чат менеджеров.
    *   При `UPDATE` статуса -> срабатывает функция -> Отправляет SMS/Email клиенту.

4.  **Генерация PDF:**
    *   Генерируется на клиенте (jsPDF) для предпросмотра.
    *   Может сохраняться как `BLOB` в Supabase Storage для архива.

## Технический стек
*   **Frontend Framework:** Next.js 14+ (App Router).
*   **3D Engine:** React Three Fiber (Three.js).
*   **Database:** Supabase (PostgreSQL).
*   **Styling:** CSS Modules / Tailwind (по выбору), GSAP для анимаций.
*   **Deploy:** Vercel (Frontend).
