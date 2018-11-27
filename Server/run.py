from flask import Flask, g, render_template, make_response, redirect
from werkzeug.security import generate_password_hash, check_password_hash
from flask.views import View

from views import (
    Index, 
    Login, 
    Logout, 
    Register, 
    Admin, 
    Test, 
    UploadTemplate, 
    Viewtab, 
    Worktab,
    MainBoard,
    ViewPost,
    UserProfile
)
from init import app

from models import User, load_permissions


with app.app_context():
    load_permissions()

from flask_login import LoginManager
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

"""
Admin Stuff
"""
from views import add_admin_dashboard
add_admin_dashboard()


"""
Login Manager
"""
@login_manager.user_loader
def get_user(ident):
    return User.query.get(int(ident))

app.add_url_rule('/login', view_func=Login.as_view('login'))
app.add_url_rule('/logout', view_func=Logout.as_view('logout'))

app.add_url_rule('/register', view_func=Register.as_view('register'))
app.add_url_rule('/admin', view_func=Admin.as_view('admin'))
app.add_url_rule('/test', view_func=Test.as_view('test'))



app.add_url_rule('/', view_func=Index.as_view('index'))
app.add_url_rule('/viewtab', view_func=Viewtab.as_view('viewtab'))
app.add_url_rule('/worktab', view_func=Worktab.as_view('worktab'))

app.add_url_rule('/dev/upload', view_func=UploadTemplate.as_view('upload_template'))

app.add_url_rule('/board/all_posts', view_func=MainBoard.as_view('main_board'))
app.add_url_rule('/board/post', view_func=ViewPost.as_view('view_post'))

app.add_url_rule('/user/profile/<username>', view_func=UserProfile.as_view('user_profile'))

from api import (
    ApiGetTemplate, 
    ApiAllPosts,
    ApiGetPost,
    ApiUpvote,
    ApiDownvote,
    ApiGetUserInfo,
)

app.add_url_rule('/api/v1/get_template', view_func=ApiGetTemplate.as_view('get_template'))
app.add_url_rule('/api/v1/all_posts', view_func=ApiAllPosts.as_view('all_posts'))
app.add_url_rule('/api/v1/get_post', view_func=ApiGetPost.as_view('get_post'))
app.add_url_rule('/api/v1/upvote', view_func=ApiUpvote.as_view('upvote'))
app.add_url_rule('/api/v1/downvote', view_func=ApiDownvote.as_view('downvote'))

app.add_url_rule('/api/v1/get_user_info', view_func=ApiGetUserInfo.as_view('get_user_info'))


if __name__ == '__main__':
    app.run(debug=True)

