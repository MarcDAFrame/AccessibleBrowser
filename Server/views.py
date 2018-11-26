from flask import Flask, render_template, make_response, redirect, Response, request, url_for
from flask.views import MethodView
from flask_login import LoginManager, UserMixin, login_required, login_user, logout_user, current_user
from werkzeug.security import generate_password_hash
from werkzeug import secure_filename
import time

import os
import json

from init import db

import config

from models import (
    User, 
    GeneralUser, 
    DeveloperUser, 
    ModeratorUser, 
    AdminUser, 
    SuperUser,
    Permission,
    Post,
    ConfigFilePost,
    PostVote, 
    PostComment,
    ConfigFile,
    UrlConfigFile
) 

from config import BASE_DIR
#LOADING TEMPLATES


from utils import user_allowed, do_allowed_denied
    

class MainBoard(MethodView):
    @login_required
    def get(self):
        print("HELLO")
        @user_allowed("/board/all_posts")
        def allowed():
            return make_response(render_template("board/main_board.html"))
        def denied():
            return make_response("Not Allowed", 401)
        
        return do_allowed_denied(allowed, denied)


class UserProfile(MethodView):
    def get(self):
        @user_allowed("/user/profile")
        def allowed(request):
            username = request.args['username']
            return make_response(render_template('user/profile.html'), 200)
        
        return do_allowed_denied(allowed, a_args=[request])

class ViewPost(MethodView):
    @login_required
    def get(self):
        @user_allowed("/board/post")
        def allowed(request):
            post_token = request.args['post_token']
            return make_response(render_template("board/single_post.html", post_token=post_token))
        def denied():
            return make_response("Not Allowed", 401)

        return do_allowed_denied(allowed, denied, a_args=[request])            

class Test(MethodView):
    @login_required
    def get(self):
        @user_allowed("/test")
        def allowed(request):
            print(request)
            return "func allowed"
        print(allowed)
        def denied():
            return "func denied"
        print("ALLOWED", allowed)

        return do_allowed_denied(allowed, denied, a_args=request)            
    
        # denied        

class UploadTemplate(MethodView):
    @login_required
    def get(self, *args):
        @user_allowed("/dev/upload")
        def allowed():
            print("allowed 2")
            return make_response(render_template("developer/uploadconfig.html"))
        
        def denied():
            print("denied 2")
            return redirect("/")

        return do_allowed_denied(allowed, denied)

    @login_required  
    def post(self):
        @user_allowed("/dev/upload")
        def allowed(request):
            print(request.files)
            print(dir(request.files['config_file']))
            f = request.files['config_file']
            json_str = f.stream.read()
            name = f.filename

            args = request.form
            print(args)
            title = args.get('title')
            user = current_user
            user.add_config_file(title, json_str)
            return redirect('/')
            # return make_response(render_template("developer/uploadconfig.html"))
        
        def denied():
            print("denied 1")
            return redirect("/")

        return do_allowed_denied(allowed, denied, a_args = [request])
        
        # user = request.auth[0]
        # print(user)




#USER STUFF
class Login(MethodView):

    def get_template_name(self):
        raise NotImplementedError()

    def post(self):
        username = request.form['username']
        password = request.form['password']
        user = None

        headers = {'Content-Type': 'text/html'}
        errors = []
        print(username, password)
        try:
            user = db.session.query(User).filter_by(username=username).first()
            print("User", user)
        except Exception as e:
            print(e)
            # return Response("user name not recognized")
            errors.append('no user named %s' %username)

        if not username or not password:
            errors.append('insure that username and password are not blank')

        # if not user:
            # return Response('no user named %s'%username)
            # errors.append('no user named %s'%username)
        try:
            if  user.verify_password(password, user.password) and username and password:
                login_user(user)
                if request.args.get("next"):
                    return redirect(request.args.get("next"))            
                else:
                    return redirect("/")
                # return Response('logged in')
            else:
                errors.append('password or username is incorrect')
        except:
            errors.append('password or username is incorrect')

        headers = {'Content-Type': 'text/html'}
        return make_response(render_template('login.html', errors=errors), 200, headers)

    def get(self):
        headers = {'Content-Type': 'text/html'}
        return make_response(render_template('login.html', errors=[]), 200, headers)


class Logout(MethodView):
    @login_required
    def get(self):
        logout_user()
        return Response('<p>Logged out</p>')

class Register(MethodView):
    def get(self):
        return make_response(render_template('register.html', errors=[]), 200, {'Content-Type': 'text/html'})

    def post(self):
        print('register post')
        try:
            username = request.form['username']
            password = request.form['password']
            email = request.form['email']
            user_type = request.form['user_type']
        except Exception as e:
            print(e)
            pass

        print("register", username, password, email)

        headers = {'Content-Type': 'text/html'}
        errors = []
        success = True
        if len(password) < 8:
            errors.append('password is too short (8 or more characters)')
            success = False

        if not username:
            errors.append('no username provided')
            success = False

        if not password:
            errors.append('no password provided')
            success = False

        if not email:
            errors.append('no email provided')
            success = False

        if User.username_taken(username):
            return ('username is not unique', 412)

            errors.append('username is not unique')
            success = False

        try:
            if user_type == "gus":
                new_user = GeneralUser(username=username, password=generate_password_hash(password), email=email)
            elif user_type == "dus":
                new_user = DeveloperUser(username=username, password=generate_password_hash(password), email=email)
            else:
                success = False
                errors.append("not a valid user type")
        except Exception as e:
            errors.append('server error')
            success = False

        if success:
            try:
                db.session.add(new_user)
            except:
                print('couldnt session cant add')
                return make_response(render_template('error.html', e=500), 200, headers)
            try:
                db.session.commit()
                return ('successfully registered', 200)
            except:
                print('couldnt commit')
                return make_response(render_template('error.html', e=500), 200, headers)
        else:
            return make_response(render_template('register.html', errors=errors), 200, headers)



class Index(MethodView):
    # @login_requiredFailed to load resource: the server responded with a status of 405 (METHOD NOT ALLOWED)
    # @login_required
    def get(self):
        return make_response(render_template('index.html'), 200, {'Content-Type': 'text/html'})


class Admin(MethodView):
    @login_required
    def get(self):
        headers = {'Content-Type': 'text/html'}
        return make_response(render_template('admin.html'), 200, headers)

class Viewtab(MethodView):
    def get(self):
        return None

class Worktab(MethodView):
    def get(self):
        return None


"""
Admin Stuff
"""
from flask_admin import Admin as FlaskAdmin, BaseView, expose, AdminIndexView
from flask_admin.contrib.sqla import ModelView
from init import app

class AuthMixin():
    def is_accessible(self):
        if current_user and current_user.is_authenticated:
            self.can_delete = current_user.is_allowed('/admin/ : delete')
            self.can_edit = current_user.is_allowed('/admin/ : edit')
            self.can_create = current_user.is_allowed('/admin/ : create')
            
        # print(self.endpoint)
        # print(current_user.is_authenticated() and current_user.is_allowed("/admin/"))
        return current_user.is_authenticated and current_user.is_allowed("/admin/%s"%self.endpoint)

    def inaccessible_callback(self, name, **kwargs):
        # redirect to login page if user doesn't have access
        # print("not accessible")
        return redirect(url_for('login', next=request.url))

class HomeView(AuthMixin, AdminIndexView):
    @expose("/")
    def index(self):
        return self.render('admin/home.html')

class AuthModelView(AuthMixin, ModelView):
    can_delete = False
    can_edit = False
    can_create = False

class AuthUserModelView(AuthModelView):
    column_searchable_list = ['username']


class AuthBaseView(AuthMixin, BaseView):
    @expose('/')
    def index(self):
        return 'Hello World!'

def add_admin_dashboard():
    admin = FlaskAdmin(app, name='Dashboard', index_view=HomeView(name='Home')) #
    # admin.add_view(ModelView(User, db.session))
    # admin.add_view()
    # admin.add_view(AuthBaseView())
    admin.add_view(AuthUserModelView(GeneralUser, db.session))
    admin.add_view(AuthUserModelView(DeveloperUser, db.session))
    admin.add_view(AuthUserModelView(ModeratorUser, db.session))
    admin.add_view(AuthUserModelView(AdminUser, db.session))
    admin.add_view(AuthUserModelView(SuperUser, db.session))

    admin.add_view(AuthModelView(ConfigFile, db.session))
    admin.add_view(AuthModelView(Post, db.session))
    admin.add_view(AuthModelView(ConfigFilePost, db.session))
    admin.add_view(AuthModelView(PostComment, db.session))
    admin.add_view(AuthModelView(PostVote, db.session))
    admin.add_view(AuthModelView(Permission, db.session))
    admin.add_view(AuthModelView(UrlConfigFile, db.session))
