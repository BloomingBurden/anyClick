class AppClick {
    // Хранилище всех созданных экземпляров:
    // ключ — DOM-элемент кнопки, значение — экземпляр AppClick.
    // Это позволяет централизованно управлять всеми кнопками.
    static instances = new Map();

    // Флаг, чтобы не навешивать глобальные обработчики несколько раз.
    static isInited = false;

    // Ссылка на обработчик клика по документу.
    static boundHandleDocumentClick = null;

    // Набор настроек по умолчанию.
    static defaults = {
        onClick: () => {},              // вызывается после клика по кнопке
        onOpen: () => {},               // вызывается при открытии
        onClose: () => {},              // вызывается при закрытии
        showClass: 'show',              // класс для показа целевого блока
        showSectionClass: 'section-show', // класс для активной секции
        activeBtnClass: 'active',       // класс активной кнопки
        preventDefault: true,           // отменять ли стандартное поведение кнопки/ссылки
        closeOnOutsideClick: true,      // закрывать ли блок при клике вне него
        closeOnEscape: true,            // закрывать ли блок по Escape
        allowOnlyOneOpen: false,        // разрешать ли только один открытый блок одновременно
    };

    constructor(element, options = {}) {
        // Поддержка двух сценариев:
        // 1) передан готовый HTMLElement
        // 2) передан CSS-селектор
        this.el = element instanceof HTMLElement
            ? element
            : document.querySelector(element);

        // Если элемент не найден — просто выходим,
        // чтобы не ломать выполнение приложения.
        if (!this.el) return;

        // Объединяем пользовательские настройки с дефолтными.
        this.options = {
            ...AppClick.defaults,
            ...options,
        };

        // Флаг уничтожения экземпляра.
        // Позволяет игнорировать действия после destroy().
        this.isDestroyed = false;

        // Текущее состояние блока: открыт / закрыт.
        this.isOpen = false;

        // Находим связанные DOM-элементы и параметры поведения.
        this.refs = this.resolveRefs(this.el);
        if (!this.refs) return;

        // Регистрируем экземпляр в общем реестре.
        AppClick.instances.set(this.el, this);

        // Инициализируем глобальные обработчики один раз на всё приложение.
        AppClick.initGlobalListeners();

        // Синхронизируем ARIA-атрибуты для доступности.
        this.syncAria();
    }

    static initGlobalListeners() {
        // Если глобальные обработчики уже были подключены — повторно не подключаем.
        if (AppClick.isInited) return;

        // Привязываем контекст к статическому обработчику кликов по документу.
        AppClick.boundHandleDocumentClick = AppClick.handleDocumentClick.bind(this);
        document.addEventListener('click', AppClick.boundHandleDocumentClick);

        // Глобальный обработчик Escape:
        // закрывает все открытые экземпляры, у которых это разрешено настройками.
        document.addEventListener('keydown', (evt) => {
            if (evt.key !== 'Escape') return;

            AppClick.instances.forEach((instance) => {
                if (!instance.isOpen) return;
                if (!instance.options.closeOnEscape) return;
                instance.close();
            });
        });

        AppClick.isInited = true;
    }

    static handleDocumentClick(evt) {
        // Ищем, был ли клик по управляющей кнопке.
        const button = evt.target.closest('[data-click-btn]');

        // Ищем, был ли клик по специальной кнопке закрытия.
        const closeBtn = evt.target.closest('[data-click-close]');

        // Если кликнули по кнопке управления:
        if (button) {
            // Получаем связанный экземпляр по DOM-элементу кнопки.
            const instance = AppClick.instances.get(button);
            if (!instance || instance.isDestroyed) return;

            instance.handleButtonClick(evt);
            return;
        }

        // Если кликнули по кнопке закрытия внутри target-блока:
        if (closeBtn) {
            const target = closeBtn.closest('[data-click-target]');
            if (!target) return;

            // Ищем открытый экземпляр, которому принадлежит этот target, и закрываем его.
            AppClick.instances.forEach((instance) => {
                if (!instance.isOpen) return;
                if (instance.refs.target === target) {
                    instance.close(evt);
                }
            });

            return;
        }

        // Во всех остальных случаях считаем, что это внешний клик,
        // и даём каждому открытому экземпляру решить, нужно ли закрываться.
        AppClick.instances.forEach((instance) => {
            if (!instance.isOpen) return;
            instance.handleOutsideClick(evt);
        });
    }

    static closeOthers(currentInstance) {
        // Закрываем все открытые экземпляры, кроме текущего.
        // Используется в режиме "может быть открыт только один блок".
        AppClick.instances.forEach((instance) => {
            if (instance === currentInstance) return;
            if (!instance.isOpen) return;
            instance.close();
        });
    }

    resolveRefs(el) {
        // Значение data-click-btn может содержать селектор секции,
        // с которой должна быть связана кнопка.
        const sectionSelector = el.getAttribute('data-click-btn');

        // Если селектор задан — ищем секцию по нему.
        // Если нет — пытаемся найти ближайшего родителя с data-click-section.
        const section = sectionSelector
            ? document.querySelector(sectionSelector)
            : el.closest('[data-click-section]');

        // Если секция не найдена, экземпляр не сможет работать корректно.
        if (!section) {
            console.warn('[AppClick] data-click-section not found for:', el);
            return null;
        }

        // Если сама секция является target — используем её.
        // Иначе ищем вложенный элемент с data-click-target.
        const target = section.hasAttribute('data-click-target')
            ? section
            : section.querySelector('[data-click-target]');

        // Без target нечего открывать / закрывать.
        if (!target) {
            console.warn('[AppClick] data-click-target not found inside section:', section);
            return null;
        }

        // Режим работы кнопки:
        // toggle — переключение,
        // add — только открыть,
        // remove — только закрыть.
        const option = el.getAttribute('data-click-option') || 'toggle';

        // Фиксированный режим:
        // если установлен, блок не будет закрываться по внешнему клику.
        const fixed = el.hasAttribute('data-click-fixed');

        // Классы, которые будут применяться к `<body>` при открытии блока.
        const body = el.getAttribute('data-click-body') ?? null;

        return {
            section,
            target,
            option,
            fixed,
            body
        };
    }

    handleButtonClick(evt) {
        // При необходимости отменяем стандартное поведение,
        // например переход по ссылке.
        if (this.options.preventDefault) {
            evt.preventDefault();
        }

        // Карта действий по значению data-click-option.
        const actionMap = {
            toggle: () => this.toggle(evt),
            add: () => this.open(evt),
            remove: () => this.close(evt),
        };

        // Если значение невалидное — используем toggle как безопасный вариант.
        const action = actionMap[this.refs.option] || actionMap.toggle;
        action();

        // Пользовательский колбэк после обработки клика.
        this.options.onClick?.(evt, this);
    }

    handleOutsideClick(evt) {
        // Если закрытие по внешнему клику отключено — ничего не делаем.
        if (!this.options.closeOnOutsideClick) return;

        // В fixed-режиме блок тоже не закрываем.
        if (this.refs.fixed) return;

        // Проверяем, был ли клик внутри кнопки.
        const isInsideButton = this.el.contains(evt.target);

        // Проверяем, был ли клик внутри открытого target-блока.
        const isInsideTarget = this.refs.target.contains(evt.target);

        // Если клик был внутри управляющих элементов — не закрываем.
        if (isInsideButton || isInsideTarget) return;

        // Иначе считаем это внешним кликом и закрываем блок.
        this.close(evt);
    }

    open(evt = null) {
        // Если уже открыт — повторно ничего не делаем.
        if (this.isOpen) return;

        // При необходимости предварительно закрываем остальные экземпляры.
        if (this.options.allowOnlyOneOpen) {
            AppClick.closeOthers(this);
        }

        if (this.refs.body) {
            const split = this.refs.body.split(',');
            split.forEach((item) => document.body.classList.add(item.trim()));
        }

        this.isOpen = true;

        // Показываем target, активируем секцию и кнопку через CSS-классы.
        this.refs.target.classList.add(this.options.showClass);
        this.refs.section.classList.add(this.options.showSectionClass);
        this.el.classList.add(this.options.activeBtnClass);

        // Снимаем inert, чтобы содержимое стало доступным для фокуса и взаимодействия.
        this.refs.target.removeAttribute('inert');

        // Обновляем aria-expanded для assistive-технологий.
        this.el.setAttribute('aria-expanded', 'true');

        // Пользовательский хук на открытие.
        this.options.onOpen?.(evt, this);
    }

    close(evt = null) {
        // Если уже закрыт — повторно ничего не делаем.
        if (!this.isOpen) return;

        if (this.refs.body) {
            const split = this.refs.body.split(',');
            split.forEach((item) => document.body.classList.remove(item.trim()));
        }

        this.isOpen = false;

        // Убираем классы показа и активности.
        this.refs.target.classList.remove(this.options.showClass);
        this.refs.section.classList.remove(this.options.showSectionClass);
        this.el.classList.remove(this.options.activeBtnClass);

        // Делаем target неинтерактивным.
        this.refs.target.setAttribute('inert', '');

        // Обновляем aria-expanded.
        this.el.setAttribute('aria-expanded', 'false');

        // Пользовательский хук на закрытие.
        this.options.onClose?.(evt, this);
    }

    toggle(evt = null) {
        // Переключаем состояние:
        // если открыт — закрываем, если закрыт — открываем.
        if (this.isOpen) {
            this.close(evt);
        } else {
            this.open(evt);
        }
    }

    syncAria() {
        // У target должен быть id, чтобы кнопка могла ссылаться на него через aria-controls.
        const targetId = this.refs.target.id || this.ensureTargetId(this.refs.target);

        // Отражаем текущее состояние элемента.
        this.el.setAttribute('aria-expanded', this.isOpen ? 'true' : 'false');
        this.el.setAttribute('aria-controls', targetId);
    }

    ensureTargetId(target) {
        // Если у target нет id — генерируем случайный.
        // Это нужно для корректной связи "кнопка управляет блоком".
        const id = `app-click-${Math.random().toString(36).slice(2, 10)}`;
        target.id = id;
        return id;
    }

    refresh() {
        // Полезно, если DOM-структура изменилась после инициализации.
        // Повторно находим связанные элементы и пересинхронизируем ARIA.
        const nextRefs = this.resolveRefs(this.el);
        if (!nextRefs) return;
        this.refs = nextRefs;
        this.syncAria();
    }

    destroy() {
        // Защита от повторного уничтожения.
        if (this.isDestroyed) return;

        // Перед удалением приводим состояние к закрытому.
        this.close();

        this.isDestroyed = true;

        // Удаляем экземпляр из общего реестра,
        // чтобы он больше не участвовал в глобальной обработке.
        AppClick.instances.delete(this.el);
    }
}

export const onClick = (options = {}) => {
    // Находим все элементы, которые объявлены как управляющие кнопки.
    const elements = document.querySelectorAll('[data-click-btn]');

    // Создаём экземпляр AppClick для каждого элемента.
    // filter(Boolean) отбрасывает невалидные результаты,
    // если какой-то элемент не удалось корректно инициализировать.
    return Array.from(elements)
        .map((element) => new AppClick(element, options))
        .filter(Boolean);
};

export default AppClick;