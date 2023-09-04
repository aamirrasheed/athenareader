x = """ {
    "blogpost": "yes",
    "title": "The Roots of Lisp",
    "date": "-5-2001"
} 
 
 """

import json

print(x.strip())
json.loads(x)