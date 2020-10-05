from .base import BASE_DIR, INSTALLED_APPS, MIDDLEWARE

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'pdj+qx02r0=g3vdephgg*-dkwvqfg0crd9)8mu_0g7kam-u0)y'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']

# Database
# https://docs.djangoproject.com/en/3.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

INSTALLED_APPS.append('corsheaders')

MIDDLEWARE.insert(0, 'corsheaders.middleware.CorsMiddleware')

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]
