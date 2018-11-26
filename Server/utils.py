from flask_login import current_user
from flask import make_response
class AuthValidationError(Exception):
    pass

def user_allowed(permission):
    def decorator(func, *args, **kwargs):
        if current_user.is_authenticated:
            if current_user.is_allowed(permission):
                # print(func, args, kwargs)
                print("ACCESS GRANTED")
                def wrapper(*args, **kwargs):
                    return func(*args, **kwargs)
                return wrapper
        print("ACCESS DENIED")
        raise AuthValidationError
    return decorator

def default_denied():
    return make_response("Not Allowed", 401)

def do_allowed_denied(allowed, denied=None, 
    a_args=None, d_args=None, a_kwargs=None, d_kwargs=None):
    if not a_args:
        a_args = []
    if not a_kwargs:
        a_kwargs = {}
    if not d_args:
        d_args = []
    if not d_kwargs:
        d_kwargs = {}
    try:
        out = allowed(*a_args, **a_kwargs)
    except AuthValidationError:
        print("a_d: ", e)
        if denied != None:
            out = denied(*d_args, **d_kwargs)
        else:
            out = default_denied()
                
    return out