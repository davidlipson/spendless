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
                '/gp/buy',
                //'/dp',
                '/buy/',
            ],
        },
        cart: {
            query: '#sns-base-price, .cart__subtotal-price, .cart__total-money, .sc-price, .a-price-whole, .price, .gl-body-l, .a-size-medium, .a-color-base, .sc-white-space-nowrap',
            regex: ['amazon.+/gp/cart', 'amazon.+/cart', '/cart'],
        },
    },
    blacklist: ['amazon.+/dp/', 'amazon.+/gp/product/'],
};