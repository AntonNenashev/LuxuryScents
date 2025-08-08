import {
    checkout
} from './payment.js';

document.addEventListener('DOMContentLoaded', function () {
    // Данные о товарах
    const products = [{
            id: 1,
            name: "Chanel №5",
            brand: "Chanel",
            price: "12 990 ₽",
            image: "img/products/Chanel+No5.jpg",
            description: "Классический женский аромат с нотами иланг-иланга, нероли и ванили. Символ элегантности и изысканности."
        },
        {
            id: 2,
            name: "Sauvage",
            brand: "Dior",
            price: "10 490 ₽",
            image: "img/products/Dior+Sauvage.webp",
            description: "Мужской аромат с свежими нотами бергамота и пряными аккордами. Для уверенных и харизматичных."
        },
        {
            id: 3,
            name: "Bloom",
            brand: "Gucci",
            price: "9 990 ₽",
            image: "img/products/Gucci+Bloom.webp",
            description: "Цветочный женский парфюм с нотами жасмина и туберозы. Нежный и романтичный аромат."
        },
        {
            id: 4,
            name: "Black Orchid",
            brand: "Tom Ford",
            price: "15 990 ₽",
            image: "img/products/Tom+Ford+Black+Orchid.jpg",
            description: "Роскошный унисекс аромат с нотами черной трюфели, ванили и пачули. Загадочный и чувственный."
        },
        {
            id: 5,
            name: "Eros",
            brand: "Versace",
            price: "8 990 ₽",
            image: "img/products/Versace+Eros.jpg",
            description: "Соблазнительный мужской аромат с нотами мяты, ванили и древесными аккордами. Для страстных натур."
        },
        {
            id: 6,
            name: "J'adore",
            brand: "Dior",
            price: "11 490 ₽",
            image: "img/products/Dior+J'adore.webp",
            description: "Изысканный женский парфюм с нотами жасмина, розы и ванили. Воплощение женственности."
        },
        {
            id: 7,
            name: "Light Blue",
            brand: "Dolce&Gabbana",
            price: "9 790 ₽",
            image: "img/products/Dolce+Gabbana+Light+Blue.webp",
            description: "Свежий цветочно-фруктовый аромат с нотами яблока, лимона, жасмина и бамбука. Идеален для лета."
        },
        {
            id: 8,
            name: "La Vie Est Belle",
            brand: "Lancôme",
            price: "13 290 ₽",
            image: "img/products/Lancome+La+Vie+Est+Belle.jpg",
            description: "Сладкий женский парфюм с нотами ириса, пачули и карамели. Аромат счастья и радости жизни."
        }
    ];

    // Корзина (с возможностью сохранения в localStorage)
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Элементы DOM
    const productsGrid = document.getElementById('products-grid');
    const cartCounter = document.querySelector('.cart-counter');
    const productModal = document.getElementById('product-modal');
    const closeModal = document.querySelector('.modal-close');
    const modalElements = {
        name: document.getElementById('modal-product-name'),
        brand: document.getElementById('modal-product-brand'),
        price: document.getElementById('modal-product-price'),
        description: document.getElementById('modal-product-description'),
        image: document.getElementById('modal-product-image'),
        addToCart: document.getElementById('modal-add-to-cart')
    };

    // Элементы корзины
    const cartModal = document.getElementById('cart-modal');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const checkoutBtn = document.getElementById('checkout-btn');
    const cartClose = document.querySelector('.cart-close');

    // ========== ОСНОВНЫЕ ФУНКЦИИ ========== //

    // Отображение товаров
    function displayProducts() {
        productsGrid.innerHTML = '';
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-brand">${product.brand}</p>
                    <p class="product-price">${product.price}</p>
                    <button class="product-button" data-id="${product.id}">Подробнее</button>
                </div>
            `;
            productsGrid.appendChild(productCard);
        });

        // Назначение обработчиков
        document.querySelectorAll('.product-button').forEach(btn => {
            btn.addEventListener('click', function () {
                const productId = parseInt(this.getAttribute('data-id'));
                showProductDetails(productId);
            });
        });
    }

    // Показать детали товара
    function showProductDetails(productId) {
        const product = products.find(p => p.id === productId);
        if (product) {
            modalElements.name.textContent = product.name;
            modalElements.brand.textContent = product.brand;
            modalElements.price.textContent = product.price;
            modalElements.description.textContent = product.description;
            modalElements.image.src = product.image;
            modalElements.image.alt = product.name;
            modalElements.addToCart.setAttribute('data-id', product.id);

            productModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    // ========== ФУНКЦИИ КОРЗИНЫ ========== //

    // Добавить в корзину
    function addToCart(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                ...product,
                quantity: 1
            });
        }

        updateCartCount();
        saveCartToStorage();
    }

    // Обновить счетчик корзины
    function updateCartCount() {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCounter.textContent = totalItems;
    }

    // Обновить модальное окно корзины
    function updateCartModal() {
        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart">Ваша корзина пуста</p>';
            cartTotalPrice.textContent = '0 ₽';
            return;
        }

        let total = 0;

        cart.forEach((item, index) => {
            const price = parseInt(item.price.replace(/\D/g, ''));
            total += price * item.quantity;

            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-info">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image" loading="lazy">
                    <div>
                        <p class="cart-item-name">${item.name}</p>
                        <p class="cart-item-brand">${item.brand}</p>
                        <p class="cart-item-price">${item.price}</p>
                    </div>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn minus" data-index="${index}">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn plus" data-index="${index}">+</button>
                    <span class="remove-item" data-index="${index}">×</span>
                </div>
            `;
            cartItemsContainer.appendChild(cartItem);
        });

        cartTotalPrice.textContent = `${total.toLocaleString()} ₽`;
        setupCartItemHandlers();
    }

    // Настройка обработчиков для элементов корзины
    function setupCartItemHandlers() {
        document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
            btn.addEventListener('click', function () {
                const index = parseInt(this.getAttribute('data-index'));
                updateQuantity(index, -1);
            });
        });

        document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
            btn.addEventListener('click', function () {
                const index = parseInt(this.getAttribute('data-index'));
                updateQuantity(index, 1);
            });
        });

        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', function () {
                const index = parseInt(this.getAttribute('data-index'));
                removeFromCart(index);
            });
        });
    }

    // Изменить количество товара
    function updateQuantity(index, change) {
        if (cart[index]) {
            cart[index].quantity += change;

            if (cart[index].quantity < 1) {
                cart.splice(index, 1);
            }

            saveCartToStorage();
            updateCartCount();
            updateCartModal();
        }
    }

    // Удалить товар из корзины
    function removeFromCart(index) {
        if (cart[index]) {
            cart.splice(index, 1);
            saveCartToStorage();
            updateCartCount();
            updateCartModal();
        }
    }

    // Сохранить корзину в localStorage
    function saveCartToStorage() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // ========== ИНИЦИАЛИЗАЦИЯ ========== //

    // Первоначальная загрузка
    displayProducts();
    updateCartCount();

    // Обработчики событий
    closeModal.addEventListener('click', () => {
        productModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    modalElements.addToCart.addEventListener('click', function () {
        const productId = parseInt(this.getAttribute('data-id'));
        addToCart(productId);
        productModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    document.querySelector('.header-cart').addEventListener('click', () => {
        updateCartModal();
        cartModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });

    cartClose.addEventListener('click', () => {
        cartModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    checkoutBtn.addEventListener('click', async () => {
        try {
            // Показываем индикатор загрузки
            checkoutBtn.disabled = true;
            checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Обработка...';

            const paymentUrl = await checkout(cart);

            // Сохраняем сумму заказа перед редиректом
            localStorage.setItem('lastOrderAmount', cartTotalPrice.textContent);

            window.location.href = paymentUrl;

        } catch (error) {
            console.error("Ошибка оплаты:", error);
            alert("Ошибка: " + error.message);

            // Восстанавливаем кнопку
            checkoutBtn.disabled = false;
            checkoutBtn.textContent = 'Оформить заказ';
        }
    });

    window.addEventListener('click', (event) => {
        if (event.target === productModal) {
            productModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Закрытие по ESC
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            productModal.style.display = 'none';
            cartModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
});

// Бургер-меню
const burgerBtn = document.querySelector('.burger-btn');
const headerNav = document.getElementById('header-nav');
const navLinks = document.querySelectorAll('.nav-link');

burgerBtn.addEventListener('click', function() {
    // Переключаем класс active для бургер-кнопки
    this.classList.toggle('active');
    // Переключаем класс active для навигации
    headerNav.classList.toggle('active');
    // Блокируем/разблокируем прокрутку страницы
    document.body.classList.toggle('no-scroll');
});

// Закрываем меню при клике на ссылку
navLinks.forEach(link => {
    link.addEventListener('click', function() {
        burgerBtn.classList.remove('active');
        headerNav.classList.remove('active');
        document.body.classList.remove('no-scroll');
    });
});

// Закрываем меню при клике вне его области
document.addEventListener('click', function(e) {
    const isClickInsideMenu = headerNav.contains(e.target) || burgerBtn.contains(e.target);
    
    if (!isClickInsideMenu && headerNav.classList.contains('active')) {
        burgerBtn.classList.remove('active');
        headerNav.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }
});