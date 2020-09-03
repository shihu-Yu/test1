var USE_MOCK = true

if(USE_MOCK){
    Mock.mock('/carts/count','get',{
        "code":0,
        "data|1-100": 100
    })
    Mock.mock('/carts', 'get', {
        "code": 0,
        "data": {
            "allChecked": "@boolean",
            "totalCartPrice|1-9999": 1,
            "_id": "@string('lower',24)",
            "cartList|0-10": [
                {
                    "count|1-10": 1,
                    "totalPrice|1-9999": 1,
                    "checked": "@boolean",
                    "_id": "@string('lower',24)",
                    "product": {
                        "_id": "@string('lower',24)",
                        "name": "@cword(3, 120)",
                        "mainImage": "@dataImage('200x200')",
                        "price|1-9999": 1,
                        "stock|1-9999": 1
                    },
                    "attr": "颜色:白色;"
                }
            ]
        }
    })
}