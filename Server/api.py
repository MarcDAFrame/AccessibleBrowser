from flask import Flask, render_template, make_response, redirect, Response, request, url_for, jsonify
from flask_login import login_required, current_user
from flask.views import MethodView
# from flask_login import LoginManager, UserMixin, login_required, login_user, logout_user, current_user
import time

import os
import json

from config import (
    BASE_DIR,
    templates_directory
)
from init import db

from template import TemplateHandler

from utils import user_allowed, do_allowed_denied

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
def format_post_json(post_json):
    out = {
        "configfile" : {},
        'user' : None,
    }
    out['title'] = post_json['title']
    if post_json['user']:
        out['user'] = post_json['user']['username']
    out['timestamp'] = post_json['timestamp']
    out['votes'] = len(post_json['votes'])
    out['score'] = post_json['score']
    # out['views'] = len(post_json['views'])
    out['configfile']['title'] = post_json['configfile']['title']
    out['configfile']['json'] = TemplateHandler(post_json['configfile']['json_str']).get_template_json()
    out['configfile']['views'] = len(post_json['configfile']['views'])
    out['post_token'] = post_json['post_token']
    return out

def format_user_json(user_json):
    out = {

    }
    print("USER JSoN", user_json)
    out['username'] = user_json['username']
    out['timestamp'] = user_json['timestamp']
    # out['posts'] = user_json['posts']
    return out 

def format_comment_json(comment_json):
    out = {

    }
    print(comment_json)
    return out

def format_vote_json(vote_json):
    out = {

    } 
    print(vote_json)
    return out


class ApiGetUserInfo(MethodView):
    @login_required
    def get(self):
        @user_allowed("/api/v1/get_user_info")
        def allowed(request):
            username = request.args['username']
            user_model = User.get_user_from_username(username)
            user_json = user_model.jsonify()
            print(user_json)
            out = format_user_json(user_json)
            out['posts'] = [format_post_json(x) for x in user_model.get_posts()]
            out['comments'] = [format_comment_json(x) for x in user_model.get_comments()]
            out['votes'] = [format_vote_json(x) for x in user_model.get_votes()]

            return jsonify(out)
    
        return do_allowed_denied(allowed, a_args=[request])

class ApiUpvote(MethodView):
    @login_required
    def post(self):
        @user_allowed("/api/v1/upvote")
        def allowed(request):
            post_token = request.form['post_token']
            post = Post.get_post_by_post_token(post_token)
            if not post:
                return make_response("post token not valid", 400)
            try:
                print("USER1", current_user)
                post.upvote(current_user)
                return make_response("successfully upvoted", 200)
            except Exception as e:
                print("EXCEPTION ", e)
                return ""
                # return make_response(500, "error when upvoting")
        def denied():
            return make_response("not allowed", 401)
        
        return do_allowed_denied(allowed, a_args=[request])

class ApiDownvote(MethodView):
    @login_required
    def post(self):
        @user_allowed("/api/v1/downvote")
        def allowed(request):
            print(request.form)
            post_token = request.form['post_token']
            post = Post.get_post_by_post_token(post_token)
            if not post:
                return make_response("post token not valid", 40)
            try:
                post.downvote(current_user)
                return make_response("successfully upvoted", 200)
            except:
                return make_response("error when upvoting", 500)
        def denied():
            return make_response("not allowed", 401)
        
        return do_allowed_denied(allowed, denied, a_args=[request])

class ApiGetPost(MethodView):
    def get(self):
        post_token = request.args['post_token']

        post = Post.get_post_by_post_token(post_token)

        out = format_post_json(post.jsonify())
        return jsonify(out)

class ApiAllPosts(MethodView):
    def get(self):
        limit = int(request.args['limit'])
        limit = min([limit, 100])
        sort = request.args['sort']
        if sort not in Post.get_sort_types():
            return ""
        posts = db.session.query(Post).with_polymorphic([ConfigFilePost]).all()
        out = []
        for post in posts:
            out.append(format_post_json(post.jsonify()))
        return jsonify(out)


class ApiGetTemplate(MethodView):    
    def get(self):
        url = request.args.get('url')
        user_token=request.args.get('user_token')
        user = User.get_user_from_token(user_token)
        if not user:
            return jsonify({"matched" : False, "error":"user not authenticated"})
        print("[URL]", url)
        url_model = UrlConfigFile.regex_match(url)
        
        if not url_model:
            return jsonify({'matched' : False})

        config = url_model.configfile
        
        # matches = [x for x in self.url_templates.keys() if match(x, url)]
        # # print(matches)
        # # print(url)
        print(config.json_str)

        th = TemplateHandler(config.json_str)
        config.add_view(user)
        #     #TODO
        #     #matches return as a list
        #     config_data = self.url_templates[matches[0]]
        return jsonify({'matched' : True, 'config' : th.get_template_json()})


    def post(self):
        return None
