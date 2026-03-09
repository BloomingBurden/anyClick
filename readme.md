# AppClick

**AppClick** — это лёгкий и гибкий JavaScript-компонент для управления открытием и закрытием интерфейсных блоков по клику.  
Он помогает быстро собирать dropdown, menu, modal, sidebar и другие toggle-элементы без тяжёлых зависимостей и лишнего кода.

> Минимум настройки.  
> Максимум пользы.  
> Один понятный API для самых частых UI-сценариев.

---

## Почему AppClick

Когда в проекте появляются меню, попапы, боковые панели и выпадающие блоки, логика быстро начинает дублироваться:  
где-то нужно открыть элемент, где-то закрыть по клику вне блока, где-то — по `Escape`, а где-то — не дать открыть несколько панелей сразу.

**AppClick** берёт эту рутину на себя и предлагает один универсальный механизм, который:

- работает через простые `data-*` атрибуты
- не привязан к фреймворкам
- поддерживает доступность из коробки
- легко расширяется через callbacks
- остаётся понятным даже в небольших проектах

---

## Что умеет

**AppClick** помогает быстро реализовать:

- dropdown-меню
- popup / modal
- sidebar / offcanvas
- accordion-подобные блоки
- мобильные меню
- любые кастомные toggle-интерфейсы

И всё это — с уже готовой логикой:

- открыть / закрыть / переключить
- закрыть по клику вне блока
- закрыть по клавише `Escape`
- закрыть через отдельную кнопку внутри блока
- держать открытым только один элемент
- добавлять классы на `<body>`
- обновлять `aria-*` атрибуты автоматически

---

## Для кого это

**AppClick** подойдёт, если ты хочешь:

- быстро подключить интерактивность без UI-библиотеки
- избежать копипаста логики по проекту
- получить декларативное управление через HTML
- использовать один и тот же подход для разных компонентов
- сохранить код чистым и предсказуемым

Это особенно удобно для:

- лендингов
- корпоративных сайтов
- интернет-магазинов
- UI-kit утилит
- vanilla JS проектов
- проектов, где не хочется тянуть лишние зависимости

---

## Быстрый пример

### HTML

```html
<button class="js-menu-btn" data-click-btn=".menu-section">
    Открыть меню
</button>

<div class="menu-section" data-click-section>
    <div class="menu-dropdown" data-click-target inert>
        <button class="menu-close" data-click-close>Закрыть</button>
        <p>Содержимое меню</p>
    </div>
</div>
```
### JS
```js
import { onClick } from './AppClick.js';

onClick();
```
## Все способы использования
### 1. Стандартный
По умолчанию используется режим toggle.
```html
<button class="catalog-btn" data-click-btn=".catalog-section">
    Каталог
</button>

<div class="catalog-section" data-click-section>
    <div class="catalog-dropdown" data-click-target inert>
        <button data-click-close>Закрыть</button>
        <ul>
            <li>Телефоны</li>
            <li>Ноутбуки</li>
            <li>Аксессуары</li>
        </ul>
    </div>
</div>
```

### 2. Явный режим
```html
<button
    class="profile-btn"
    data-click-btn=".profile-section"
    data-click-option="toggle"
>
    Профиль
</button>

<div class="profile-section" data-click-section>
    <div class="profile-dropdown" data-click-target inert>
        <button data-click-close>Закрыть</button>
        <p>Настройки профиля</p>
    </div>
</div>
```

### 3. Режим add — только открыть
``` html
<button
    class="search-open"
    data-click-btn=".search-section"
    data-click-option="add"
>
    Открыть поиск
</button>

<div class="search-section" data-click-section>
    <div class="search-popup" data-click-target inert>
        <button data-click-close>Закрыть</button>
        <input type="text" placeholder="Поиск..." />
    </div>
</div>
```
### 4. Не закрыть по внешнему клику
``` html
<button
    class="auth-btn"
    data-click-btn=".auth-section"
    data-click-fixed
>
    Вход
</button>

<div class="auth-section" data-click-section>
    <div class="auth-popup" data-click-target inert>
        <button data-click-close>Закрыть</button>
        <form>
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Пароль" />
        </form>
    </div>
</div>
```

### 5. Закрытие по клику вне блока
По умолчанию включено.

```js
onClick({
    closeOnOutsideClick: true
});
```
```html
<button class="lang-btn" data-click-btn=".lang-section">
    Язык
</button>

<div class="lang-section" data-click-section>
    <div class="lang-dropdown" data-click-target inert>
        <button data-click-close>Закрыть</button>
        <ul>
            <li>RU</li>
            <li>EN</li>
            <li>DE</li>
        </ul>
    </div>
</div>
```

### 6. Закрытие по Escape
По умолчанию включено.
```js
onClick({
    closeOnEscape: true
});
```
### 7. Добавление классов на body
```html
<button
    class="mobile-menu-btn"
    data-click-btn=".mobile-menu-section"
    data-click-body="menu-open, lock"
>
    Открыть меню
</button>

<div class="mobile-menu-section" data-click-section>
    <nav class="mobile-menu-panel" data-click-target inert>
        <button data-click-close>Закрыть</button>
        <a href="/">Главная</a>
        <a href="/catalog">Каталог</a>
        <a href="/contacts">Контакты</a>
    </nav>
</div>
```
### 8. Кнопка внутри секции без селектора
Если data-click-btn пустой, AppClick ищет ближайший родительский [data-click-section].
```html
<div class="faq-item" data-click-section>
    <button class="faq-question" data-click-btn>
        Что умеет AppClick?
    </button>

    <div class="faq-answer" data-click-target inert>
        <p>Он управляет открытием и закрытием блоков по клику.</p>
    </div>
</div>
```

### 9. Accordion-сценарий
```html
<div class="faq-item" data-click-section>
    <button class="faq-question" data-click-btn>
        Вопрос 1
    </button>
    <div class="faq-answer" data-click-target inert>
        Ответ 1
    </div>
</div>

<div class="faq-item" data-click-section>
    <button class="faq-question" data-click-btn>
        Вопрос 2
    </button>
    <div class="faq-answer" data-click-target inert>
        Ответ 2
    </div>
</div>

<div class="faq-item" data-click-section>
    <button class="faq-question" data-click-btn>
        Вопрос 3
    </button>
    <div class="faq-answer" data-click-target inert>
        Ответ 3
    </div>
</div>
```

### 10. Mobile menu
```html
<button
    class="burger"
    data-click-btn=".mobile-nav-section"
    data-click-body="menu-open, lock"
>
    Меню
</button>

<div class="mobile-nav-section" data-click-section>
    <div class="mobile-nav" data-click-target inert>
        <button class="mobile-nav__close" data-click-close>
            Закрыть
        </button>

        <ul class="mobile-nav__list">
            <li><a href="/">Главная</a></li>
            <li><a href="/about">О нас</a></li>
            <li><a href="/services">Услуги</a></li>
            <li><a href="/contacts">Контакты</a></li>
        </ul>
    </div>
</div>
```

### 11. Popup / modal
```html
<button class="promo-btn" data-click-btn=".promo-modal-section">
    Открыть popup
</button>

<div class="promo-modal-section" data-click-section>
    <div class="promo-modal" data-click-target inert>
        <button class="promo-modal__close" data-click-close>
            Закрыть
        </button>
        <h2>Специальное предложение</h2>
        <p>Скидка 20% до конца недели</p>
    </div>
</div>
```

## Все опции 
```js
{
    onClick: () => {},
    onOpen: () => {},
    onClose: () => {},
    showClass: 'show',
    showSectionClass: 'section-show',
    activeBtnClass: 'active',
    preventDefault: true,
    closeOnOutsideClick: true,
    closeOnEscape: true,
    allowOnlyOneOpen: false
}
```

### ```onClick```
Вызывается после клика по кнопке.
```js
onClick({
    onClick: (evt, instance) => {
        console.log('Клик по кнопке:', instance.el);
    }
});
```
### ```onOpen```
Вызывается при открытии блока.
```js
onClick({
    onOpen: (evt, instance) => {
        console.log('Открыт блок:', instance.refs.target);
    }
});
```
### ```onClose```
Вызывается при закрытии блока.
```js
onClick({
    onClose: (evt, instance) => {
        console.log('Закрыт блок:', instance.refs.target);
    }
});
```
### ```showClass```
CSS-класс, который добавляется на target.
```js
onClick({
    showClass: 'is-open'
});
```
### ```showSectionClass```
CSS-класс, который добавляется на секцию.
```js
onClick({
    showSectionClass: 'is-active'
});
```
### ```activeBtnClass```
CSS-класс активной кнопки.
```js
onClick({
    activeBtnClass: 'is-current'
});
```
### ```preventDefault```
Отменяет стандартное поведение кнопки или ссылки.
```js
onClick({
    preventDefault: false
});
```
### ```closeOnOutsideClick```
Управляет закрытием по внешнему клику.
```js
onClick({
    closeOnOutsideClick: false
});
```
### ```closeOnEscape```
Управляет закрытием по клавише Escape.
```js
onClick({
    closeOnEscape: false
});
```
### ```allowOnlyOneOpen```
Разрешает только один открытый блок одновременно.
```js
onClick({
    allowOnlyOneOpen: true
});
```
### ```showClass```
CSS-класс, который добавляется на target.
```js
onClick({
    showClass: 'is-open'
});
```
### ```showClass```
CSS-класс, который добавляется на target.
```js
onClick({
    showClass: 'is-open'
});
```