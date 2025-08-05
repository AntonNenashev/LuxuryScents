export async function checkout(cart) {
    if (!cart || cart.length === 0) {
        throw new Error("Корзина пуста");
    }

    // 1. Подготовка данных заказа
    const orderData = {
        amount: {
            value: calculateTotal(cart),
            currency: "RUB"
        },
        payment_method_data: {
            type: "bank_card"
        },
        confirmation: {
            type: "redirect",
            return_url: `${window.location.origin}/success.html`
        },
        description: `Заказ парфюмерии (${cart.length} товаров)`,
        metadata: {
            order_id: `LS-${Date.now()}`,
            products: cart.map(item => `${item.name} (${item.quantity} шт.)`).join(', ')
        }
    };

    // 2. Отправка запроса в ЮKassa
    try {
        const response = await fetch("https://api.yookassa.ru/v3/payments", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Basic " + btoa("Ваш_ShopID:Ваш_Секретный_ключ"),
                "Idempotence-Key": generateIdempotenceKey()
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.description || "Ошибка при создании платежа");
        }

        const paymentData = await response.json();

        if (!paymentData.confirmation || !paymentData.confirmation.confirmation_url) {
            throw new Error("Не удалось получить ссылку для оплаты");
        }

        return paymentData.confirmation.confirmation_url;

    } catch (error) {
        console.error("Ошибка платежа:", error);
        throw new Error("Не удалось подключиться к платежной системе. Попробуйте позже.");
    }
}

// Расчет общей суммы
function calculateTotal(cart) {
    const total = cart.reduce((total, item) => {
        const price = parseInt(item.price.replace(/\D/g, '')) || 0;
        return total + (price * item.quantity);
    }, 0);

    if (isNaN(total) || total <= 0) {
        throw new Error("Некорректная сумма заказа");
    }

    return (total / 100).toFixed(2);
}

// Генерация уникального ключа
function generateIdempotenceKey() {
    return 'idemp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}