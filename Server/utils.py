from flask_login import current_user
from flask import make_response, url_for, redirect, request

class AuthValidationError(Exception):
    pass
class AuthLoginError(Exception):
    pass
def user_allowed(permission):
    def decorator(func, *args, **kwargs):
        if current_user.is_allowed(permission):
            # print(func, args, kwargs)
            print("ACCESS GRANTED")
            def wrapper(*args, **kwargs):
                return func(*args, **kwargs)
            return wrapper
        else:
            print("ACCESS DENIED")
            raise AuthValidationError("User does not have permission")
    def error(*args, **kwargs):
        def wrapper(*args, **kwargs):
            raise AuthLoginError("User is not logged in")
        return wrapper

    if current_user.is_authenticated:
        return decorator
    else:
        return error

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
        print("RUNNING ALLOWED")
        out = allowed(*a_args, **a_kwargs)
    except AuthValidationError as e:
        print("a_d: ", e)
        if denied != None:
            out = denied(*d_args, **d_kwargs)
        else:
            out = default_denied()
    except AuthLoginError as e:
        # print("Not Logged In")
        out = redirect(url_for("login", next=request.url))
    return out