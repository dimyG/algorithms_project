import os
from .base import BASE_DIR, REACT_APP_DIR, MIDDLEWARE, TEMPLATES

DEBUG = False

# don't forget to create an ALGORITHMS_PROJECT_MODE environment variable to 'prod' so that init loads the prod settings
# a DATABASE_URL environment variable must also exist to read the database settings from
secret_key_env = os.environ.get('DJANGO_SECRET_KEY', "")
static_host_env = os.environ.get('DJANGO_STATIC_HOST', '')

SECRET_KEY = secret_key_env

ALLOWED_HOSTS = [
    'algozoom.com',
    'www.algozoom.com',
    'algorithms-project.herokuapp.com',
    '127.0.0.1',
    '.onrender.com',  # allow subdomains of onrender.com for the Render
]

STATIC_HOST = static_host_env

STATIC_URL = STATIC_HOST + '/static/'  # add a CDN to whitenoise just by defining the STATIC_HOST env variable

STATICFILES_DIRS = [
    os.path.join(REACT_APP_DIR, 'build', 'static')
]

STATIC_ROOT = os.path.join(BASE_DIR.parent, 'staticfiles')

MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')  # after SecurityMiddleware

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

TEMPLATES[0]['DIRS'].append(
    os.path.join(REACT_APP_DIR, 'build')
)

# Use sqlite for production to stay in Render's free tier
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Redirect all requests to HTTPS (using the django.middleware.security.SecurityMiddleware)
# Under the hood, Heroku router (over)writes the X-Forwarded-Proto and the X-Forwarded-Port request headers.
# The app must check X-Forwarded-Proto and respond with a redirect response when it is not https but http.
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = True
