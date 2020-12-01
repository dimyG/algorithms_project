import os
import dj_database_url
from .base import BASE_DIR, REACT_APP_DIR, MIDDLEWARE, TEMPLATES

DEBUG = False

# don't forget to create an ALGORITHMS_PROJECT_MODE environment variable to 'prod' so that init loads the prod settings
# a DATABASE_URL environment variable must also exist to read the database settings from
secret_key_env = os.environ.get('DJANGO_SECRET_KEY', "")
static_host_env = os.environ.get('DJANGO_STATIC_HOST', '')

SECRET_KEY = secret_key_env

ALLOWED_HOSTS = ['127.0.0.1']

STATIC_HOST = static_host_env

STATIC_URL = STATIC_HOST + '/static/'  # add a CDN to whitenoise just by defining the STATIC_HOST env variable

STATICFILES_DIRS = [
    os.path.join(REACT_APP_DIR, 'build', 'static')
]

STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')  # after SecurityMiddleware

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

TEMPLATES[0]['DIRS'].append(
    os.path.join(REACT_APP_DIR, 'build')
)

DATABASES = {}

# Reads db from DATABASE_URL env variable. if variable doesn't exist doesn't affect the Databases dictionary
# DATABASE_URL format: postgres://USER:PASSWORD@HOST:PORT/NAME
db_from_env = dj_database_url.config()
DATABASES['default'].update(db_from_env)
