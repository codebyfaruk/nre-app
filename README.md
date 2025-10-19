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