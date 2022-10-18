module.exports = {
    whitelist: {
        processed: {
            query: '',
            regex: ['/gp/buy/thankyou'],
        },
        checkout: {
            query: '.grand-total-price, .payment-due__price, .a-price-whole, .css-1tpw2mp, .eanm77i0, .eeazboz0, .css-1p2xd9r, .exmus2i5, .amount, .acl-align--right',
            description: '#productTitle, #title',
            regex: [
                'amazon.+/gp/buy/',
                '/rgxo',
                '/checkouts',
                '/checkout',
                '/gp/buy',
                '/buy/',
            ],
        },
        cart: {
            query: '#sns-base-price, .cart__subtotal-price, .cart__total-money, .sc-price, .a-price-whole, .price, .gl-body-l, .a-size-medium, .a-color-base, .sc-white-space-nowrap, .Heading-module--general__1ZZ-e, .TableFoot-module--td__2NdrQ, .TableFoot-module--total__3H1ZL, .Heading-module--small__3Jicy, .gl-body-l, .css-1tpw2mp, .eanm77i0, .eeazboz0, .css-1p2xd9r, .exmus2i5, .total-row, .hdca-cart__summary-table-value-total, .h-text-lg, .h-text-bold, .cart-summary-line-item, .money-amount__main',
            regex: ['/cart', '/basket', '/bag', '/orderitemdisplayview'],
        },
    },
    blacklist: ['amazon.+/dp/', 'amazon.+/gp/product/'],
    totalRegex: '^(Estimated *)?(Order *)?(Sub *)?Total',
};
