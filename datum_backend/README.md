# Datum Backend

Backend-часть веб-платформы для внутреннего банка знаний компании.

## Стек
- Django
- Django REST Framework
- PostgreSQL
- Simple JWT

## Требования
- Python 3.11+
- PostgreSQL
- pip

## Установка и запуск

### 1. Клонировать репозиторий
```bash
git clone <repo_url>
cd datum_backend
```
### 2. Создать и активировать виртуальное окружение
```bash
python -m venv venv
venv\Scripts\activate
```
### 3. Установить зависимости
```bash
pip install -r requirements.txt
```
### 4. Создать файл `env` на основе `env.example`

### 5. Создать локальную БД PostgreSQL
Например:
```bash
CREATE DATABASE datum_db
```
### 6. Применить миграции, создать админа, запустить сервер
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

После запуска проект будет доступен по адресу:
http://127.0.0.1:8000/

Админ-панель:
http://127.0.0.1:8000/admin/

Swagger UI:
http://127.0.0.1:8000/api/docs/swagger/

Redoc:
http://127.0.0.1:8000/api/docs/redoc/

