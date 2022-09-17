module.exports = {
    whitelist: {
        processed: {
            query: '',
            regex: ['/gp/buy/thankyou'],
        },
        checkout: {
            query: '.grand-total-price, .payment-due__price, .a-price-whole',
            description: '#productTitle, #title',
            regex: [
                'amazon.+/gp/buy/',
                '/checkouts',
                '/checkout',
                '/gp',
                '/dp',
                '/buy/',
            ],
        },
        cart: {
            query: '#sns-base-price, .cart__subtotal-price, .cart__total-money, .sc-price, .a-price-whole, .price, .gl-body-l',
            regex: ['amazon.+/gp/cart', 'amazon.+/cart', '/cart', '/dp'],
        },
    },
    blacklist: ['amazon.+/dp/', 'amazon.+/gp/product/'],
};
