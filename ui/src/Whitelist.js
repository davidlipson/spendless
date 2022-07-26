const Whitelist = {
    "processed": [
        "\/gp\/buy\/thankyou"
    ],
    "amazon_product": [
        "amazon.+\/dp"
    ],
    "amazon_cart": [
        "amazon.+\/gp\/cart",
        "amazon.+\/cart"
    ],
    "amazon_checkout": [
        "amazon.+\/gp\/buy\/"
    ],
    "checkout": [
        "\/checkouts",
        "\/gp",
        "\/dp",
    ],
    "cart": [
        "\/cart",
        "\/dp"
    ]
}

export default Whitelist;