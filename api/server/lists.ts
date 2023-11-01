export const lists = {
    whitelist: {
        processed: {
            query: '',
            regex: ['/thankyou', '/receipt', '/processed'],
        },
        checkout: {
            query: '.grand-total-price, .payment-due__price, .a-price-whole, .css-1tpw2mp, .eanm77i0, .eeazboz0, .css-1p2xd9r, .exmus2i5, .amount, .acl-align--right, #TotalLine, .estimated-price',
            description: '#productTitle, #title',
            regex: ['/rgxo', '/.*check-?out', '/.*buy', '/delivery'],
        },
        cart: {
            query: '#sns-base-price, .cart__subtotal-price, .cart__total-money, .sc-price, .a-price-whole, .price, .gl-body-l, .a-size-medium, .a-color-base, .sc-white-space-nowrap, .Heading-module--general__1ZZ-e, .TableFoot-module--td__2NdrQ, .TableFoot-module--total__3H1ZL, .Heading-module--small__3Jicy, .gl-body-l, .css-1tpw2mp, .eanm77i0, .eeazboz0, .css-1p2xd9r, .exmus2i5, .total-row, .hdca-cart__summary-table-value-total, .h-text-lg, .h-text-bold, .cart-summary-line-item, .money-amount__main, .she-fr',
            regex: ['/cart', '/basket', '/.*bag', '/orderitemdisplayview'],
        },
    },
    blacklist: ['amazon.+/dp/', 'amazon.+/gp/product/'],
    totalRegex: `^[A-Z\\(\\)]* *Total( *\\([A-z]+\\))?`,
    amountRegex: `\\$?[1-9][0-9]*,?[0-9]*(.[0-9][0-9])?`,
    processButtons: [
        'Place order',
        'Place your order',
        'Pay now',
        'Confirm and pay',
        'Complete purchase',
        'Submit order',
        'Buy now',
        'Authorize payment',
        'Confirm and pay',
    ],
    processButtonEndWords: ['Securely', 'Now'],
    //    totalRegex: `^(Estimated *)?(Item(\(s\))? *)?(Cart *)?(Merchandise *)?(Payment *)?(Order *)?(Amount *)?(Sub-? *)?Total *(Due *)?`,
};
