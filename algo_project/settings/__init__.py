import os
from .base import *


# you need to set myproject = 'prod' as an environment variable
# in your OS (on which your website is hosted)
if os.environ.get('algorithms') == 'prod':
   print('production')
   from .prod import *
else:
   print('development')
   from .dev import *
