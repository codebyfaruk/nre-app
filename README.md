
## Backend
```
electronics_shop/
│
├── Dockerfile
├── docker-compose.yml
├── pyproject.toml
├── .env.example
├── README.md
├── alembic.ini
│
├── src/
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── logging.py
│   │   ├── route.py
│   │   └── celery_app.py
│   ├── accounts/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── schemas.py
│   ├── suppliers/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── schemas.py
│   ├── products/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── schemas.py
│   ├── sales/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── schemas.py
│   ├── payments/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── schemas.py
│   ├── discounts/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── schemas.py
│   └── activities/
│       ├── controllers/
│       ├── routes/
│       └── schemas.py
│
└── tests/
    ├── unit/
    ├── integration/
    └── conftest.py

```


## Fontend
```
electronics-shop-frontend/
├── index.html (Login Page)
├── dashboard.html
├── css/
│   └── custom.css
├── js/
│   ├── config.js
│   ├── auth.js
│   ├── api.js
│   ├── dashboard.js
│   ├── shops.js
│   ├── products.js
│   ├── inventory.js
│   ├── sales.js
│   ├── returns.js
│   └── users.js
├── pages/
│   ├── shops.html
│   ├── products.html
│   ├── categories.html
│   ├── inventory.html
│   ├── sales.html
│   ├── pos.html (Point of Sale)
│   ├── returns.html
│   └── users.html
└── components/
    ├── sidebar.html
    └── navbar.html

```