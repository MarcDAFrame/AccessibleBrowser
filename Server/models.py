from flask import Flask
from sqlalchemy.orm import relationship
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import (TimedJSONWebSignatureSerializer as Serializer, BadSignature, SignatureExpired)
from flask_login import UserMixin
import time
import random, string
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import with_polymorphic

from template import TemplateHandler

# secret_key = 
import os

from init import db, app
from fnmatch import fnmatch
from tld import get_tld
from sqlalchemy import and_
import re


def generate_token(cls, attr):
    def generate():
        return ''.join(random.choice(string.ascii_lowercase+string.ascii_uppercase+string.digits) for x in range(30))

    token = generate()
    #, GeneralUser, ModeratorUser, AdminUser
    while db.session.query(cls).filter(getattr(cls, attr)==token).limit(1).first() is not None:
        token = generate()
    
    return token



class User(db.Model, UserMixin):
    __tablename__ = "user"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), unique=False, nullable=False)
    timestamp = db.Column(db.Integer, nullable=False, default=int(time.time()))
    permissions = relationship("Permission")

    user_token = db.Column(db.String(30), default=lambda: generate_token(User, 'user_token'), unique=True)

    polymorphic_type = db.Column(db.String(3))

    posts = relationship('Post')
    comments = relationship('PostComment')
    votes = relationship('Vote')

    __mapper_args__ = {
        'polymorphic_identity':'use',
        'polymorphic_on':polymorphic_type
    }

    @classmethod 
    def authenticate_token(cls, token):
        return db.session.query(db.exists().where(User.user_token==token)).scalar()

    @classmethod
    def get_user_from_token(cls, token):
        return db.session.query(User).filter_by(user_token=token).limit(1).first()
    
    @classmethod
    def get_user_from_username(cls, username):
        return db.session.query(User).filter_by(username=username).limit(1).first()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        permissions = user_permissions

    def verify_token(self, token):
        return self.user_token == token
    
    # @classmethod 
    # def generate_hash(cls, s):
    #     return generate_password_hash(s)
    
    def has_permission(self, permission_name):
        for p in self.permissions:
            if fnmatch(permission_name, str(p)):
                return True
        return False
        # return permission_name in self.permissions
    
    def is_allowed(self, permission_name):
        return self.has_permission(permission_name)
            
    @classmethod
    def get_user_from_id(cls, user_id):
        return db.session.query(User).filter_by(id=user_id).limit(1).first()
    @classmethod
    def get_user_from_username(cls, username):
        return db.session.query(User).filter_by(username=username).limit(1).first()

    @classmethod
    def verify_password(self, password, password_hash):
        return check_password_hash(password_hash, password)

    @classmethod
    def username_taken(self, username):
        return db.session.query(db.exists().where(User.username==username)).scalar()

    def __repr__(self):
        return "User(%s)"%self.username
    def get_posts(self):
        return [x.jsonify() for x in self.posts]

    def get_votes(self):
        return [x.jsonify() for x in self.votes]

    def get_comments(self):
        return [x.jsonify() for x in self.comments]
    def jsonify(self):
        return {
            "username" : self.username,
            "timestamp" : self.timestamp
        }
class GeneralUser(User):
    __tablename__ = "general_user"

    id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    account_type = db.Column(db.String(10), default="regular")
    views = relationship("ConfigFileView")

    __mapper_args__ = {
        'polymorphic_identity':'gus',
    }
    def add_post(self, cls, *args, **kwargs):
        new_post = cls(*args, **kwargs)
        self.posts.append(
            new_post
        )
        db.session.add(new_post)
        db.session.commit()
        return new_post


    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        print("CREATING NEW GENERAL USER", general_user_permissions)
        self.permissions.extend(general_user_permissions)

    def jsonify(self):
        out = super().jsonify()
        out['account_type'] = self.account_type 
        return out

#     def __repr__(self):
#         return "GeneralUser(%s)"%self.username

class DeveloperUser(GeneralUser):
    __tablename__ = "developer_user"
    id = db.Column(db.Integer, db.ForeignKey('general_user.id'), primary_key=True)
    configfiles = relationship("ConfigFile")
    __mapper_args__ = {
        'polymorphic_identity':'dus',
    }

    def add_config_file(self, title, json_str, active=False):
        th = TemplateHandler(json_str)
        if th.verify_template():
            urls = th.get_urls()
            new_configfile = ConfigFile(self.id, title, json_str, active=active)
            self.configfiles.append(
                new_configfile
            )
            print("NEW CONFIG FILE", new_configfile)
            db.session.add(new_configfile)

            for url in urls:
                new_url = UrlConfigFile(url, new_configfile)
                db.session.add(new_url)

            db.session.commit()
            return new_configfile


    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.permissions.extend(developer_user_permissions)

    def __repr__(self):
        return "DeveloperUser(%s)"%self.username
    
    def jsonify(self):
        out = super().jsonify()
        out['account_type'] = self.account_type 
        out['configfiles'] = self.configfiles
        return out
        
class ModeratorUser(DeveloperUser):
    __tablename__ = "moderator_user"
    id = db.Column(db.Integer, db.ForeignKey('developer_user.id'), primary_key=True)
    __mapper_args__ = {
        'polymorphic_identity':'mus',
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.permissions.extend(moderator_user_permissions)


    def __repr__(self):
        return "ModeratorUser(%s)"%self.username

    def jsonify(self):
        out = super().jsonify()
        out['account_type'] = self.account_type 
        return out

class AdminUser(ModeratorUser):
    __tablename__ = "admin_user"
    id = db.Column(db.Integer, db.ForeignKey('moderator_user.id'), primary_key=True) 
    __mapper_args__ = {
        'polymorphic_identity':'aus',
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.permissions.extend(admin_user_permissions)

    def __repr__(self):
        return "AdminUser(%s)"%self.username

    def jsonify(self):
        out = super().jsonify()
        out['account_type'] = self.account_type 
        return out

class SuperUser(AdminUser):
    __tablename__ = "super_user"
    id = db.Column(db.Integer, db.ForeignKey('admin_user.id'), primary_key=True)
    __mapper_args__ = {
        'polymorphic_identity':'sus',
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        user_token = kwargs.pop('user_token')
        if user_token:
            self.user_token = user_token

        # print(general_user_permissions)
        self.permissions.extend(super_user_permissions)

    def __repr__(self):
        return "SuperUser(%s)"%self.username

    def jsonify(self):
        out = super().jsonify()
        out['account_type'] = self.account_type 
        return out

class Permission(db.Model):
    __tablename__ = "permission"
    id = db.Column(db.Integer, primary_key=True)
    permission_name = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

    def __repr__(self):
        return "%s"%self.permission_name

    @classmethod
    def get_permission(cls, permission):
        try:
            return db.session.query(Permission).filter_by(permission_name=permission).limit(1).one()
        except Exception as e:
            print("error getting Permission(%s)"%permission, e)
            return None

class UrlConfigFile(db.Model):
    __tablename__ = "url_configfile"
    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.Text, nullable=False)
    configfile_id = db.Column(db.Integer, db.ForeignKey('configfile.id'))
    configfile = relationship("ConfigFile")

    @classmethod
    def regex_match(cls, url):
        domain = get_tld(url, as_object=True, fail_silently=True, fix_protocol=True).domain
        # domain = get_tld(url, as_object=True).domain
        print("[URL, DOMAIN]", url, domain)
        url_models = db.session.query(UrlConfigFile).filter(and_(UrlConfigFile.configfile.has(active=True), UrlConfigFile.url.like("%{0}%".format(domain)))).limit(100).all()

        for url_model in url_models:
            m = re.match(url_model.url, url)
            if m:
                return url_model

    def __init__(self, url, configfile):
        self.url = url
        self.configfile_id = configfile.id
        self.configfile = configfile

class ConfigFile(db.Model):
    __tablename__ = "configfile"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('developer_user.id'))
    title = db.Column(db.String(150), nullable=False)
    json_str = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.Integer, default=int(time.time()))
    updated = db.Column(db.Integer, default=-1)
    views = relationship("ConfigFileView")
    active = db.Column(db.Boolean, default=False)

    
    def score(self):
        return self.views

    def __init__(self, user_id, title, json_str, active=False):
        self.user_id = user_id
        self.title = title
        self.json_str = json_str 
        self.active=active

    @classmethod
    def validate_config(cls, config):
        pass
    
    def add_view(self, user):
        new_view = ConfigFileView(user.id, self.id) 
        self.views.append(
            new_view
        )
        db.session.add(new_view)
        db.session.commit()

    def __repr__(self):
        return "ConfigFile(%s)"%(self.title)

    def jsonify(self):
        return {
                "title" : self.title, 
                "timestamp" : self.timestamp, 
                "json_str" : self.json_str, 
                "views" : [x.jsonify for x in self.views]
        }

class ConfigFileView(db.Model):
    __tablename__ = "configfile_view"
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.Integer, default=int(time.time()))
    configfile_id = db.Column(db.Integer, db.ForeignKey('configfile.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('general_user.id'))

    def __init__(self, user_id, configfile_id):
        self.configfile_id = configfile_id
        self.user_id = user_id

    def jsonify(self):
        return {"timestamp" : self.timestamp}


class Post(db.Model):
    __tablename__ = "post"
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.Integer, default=int(time.time()))
    votes = relationship("PostVote")#db.Column(db.Integer, default=0)
    score = db.Column(db.Integer, default=0)
    weight_updated = db.Column(db.Integer, default=-1)
    weight = db.Column(db.Integer, default=0)
    comments = relationship("PostComment")
    post_token = db.Column(db.String(30), default=lambda: generate_token(Post, "post_token"), unique=True)

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    
    polymorphic_type = db.Column(db.String(3))
    __mapper_args__ = {
        'polymorphic_identity':'use',
        'polymorphic_on':polymorphic_type
    }
    @classmethod
    def get_polymorphic(cls):
        return with_polymorphic(Post, [ConfigFilePost], Post.__table__.outerjoin(ConfigFilePost.__table__))

    @classmethod
    def get_sort_types(cls):
        return ["weight"]

    @classmethod
    def get_posts_by_weight(cls, limit=100):
        posts = db.session.query(Post.get_polymorphic()).limit(limit).all()
        return posts

    @classmethod
    def get_post_by_post_token(cls, post_token):
        return db.session.query(Post).filter_by(post_token=post_token).limit(1).first()
        
    @hybrid_property
    def get_weight(self):
        # this getter is used when accessing the property of an instance
        self.weight = self.score
        return self.weight

    @get_weight.expression
    def get_weight(cls):
        # this expression is used when querying the model
        return cls.weight

    def upvote(self, user):
        print("USER", user)
        user_vote = PostVote.find_post_vote(self.id, user.id)

        if user_vote:
            if user_vote.magnitude < 0:
                self.votes.remove(user_vote)
                db.session.delete(user_vote)
                self.score += 1
            else:
                print("already upvoted")
                return
        
        new_vote = PostVote(self.id, user.id, 1)
        print(user_vote, new_vote)
        self.votes.append(
            new_vote
        )
        self.score += 1
        db.session.add(new_vote)
        db.session.commit()

    def downvote(self, user):
        print("USER", user)
        user_vote = PostVote.find_post_vote(self.id, user.id)

        if user_vote:
            if user_vote.magnitude > 0:
                self.votes.remove(user_vote)
                db.session.delete(user_vote)
                self.score -= 1
            else:
                print("already upvoted")
                return
        
        new_vote = PostVote(self.id, user.id, -1)

        self.votes.append(
            new_vote
        )
        self.score -= 1
        db.session.add(new_vote)
        db.session.commit()

    def __repr__(self):
        return "Post(%s)"%self.weight

    def __init__(self, user_id):
        self.user_id = user_id

    def jsonify(self):
        print("get user by id", User.get_user_from_id(self.user_id), self.user_id)
        return {
            "votes" : [x.jsonify() for x in self.votes],
            "user" : User.get_user_from_id(self.user_id).jsonify(),
            "timestamp" : self.timestamp,
            "post_token" : self.post_token,
            "score" : self.score,
        }

class ConfigFilePost(Post):
    __tablename__ = "configfile_post"

    id = db.Column(db.Integer, db.ForeignKey('post.id'), primary_key=True) 
    title = db.Column(db.String(150), nullable=False)
    configfile_id = db.Column(db.Integer, db.ForeignKey('configfile.id'))
    configfile = relationship("ConfigFile")
    __mapper_args__ = {
        'polymorphic_identity':'cfp',
    }
    def __repr__(self):
        return "ConfigFilePost(%s)"%(self.title)

    def __init__(self, title, configfile, *args, **kwargs):
        """
        title : str
        configfile : Class
        user_id : int
        """
        super().__init__(*args, **kwargs)
        self.title = title
        self.configfile = configfile
        self.configfile_id = configfile.id

    def jsonify(self):
        out = super().jsonify()
        out.update(
            {"title" : self.title, "configfile" : self.configfile.jsonify()}
        ) 
        return out

class TextPost(Post):
    __tablename__ = "text_post"
    id = db.Column(db.Integer, db.ForeignKey('post.id'), primary_key=True) 
    title = db.Column(db.String(150), nullable=False)
    body = db.Column(db.String(2000))

    __mapper_args__ = {
        'polymorphic_identity':'txp',
    }

    def jsonify(self):
        return {"title" : self.title, "body" : self.body}

class PostComment(db.Model):
    __tablename__ = "post_comment"
    id = db.Column(db.Integer, primary_key=True)
    body = db.Column(db.String(500))
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    

class Vote(db.Model):  
    __tablename__ = "vote"

    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.Integer, default=int(time.time()))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    magnitude = db.Column(db.Integer, default=1)

    polymorphic_type = db.Column(db.String(3))
    __mapper_args__ = {
        'polymorphic_identity':'use',
        'polymorphic_on':polymorphic_type
    }

    def __init__(self, user_id, magnitude):
        self.user_id = user_id
        self.magnitude = magnitude
    
    def jsonify(self):
        return {
            "timestamp" : self.timestamp,
            "magnitude" : self.magnitude
        }

class PostVote(Vote):
    __tablename__ = "post_vote"
    id = db.Column(db.Integer, db.ForeignKey('vote.id'), primary_key=True) 
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'))
    __mapper_args__ = {
        'polymorphic_identity':'pov',
    }
    @classmethod
    def find_post_vote(cls, post_id, user_id):
        return db.session.query(PostVote).filter(and_(PostVote.post_id == post_id, PostVote.user_id == user_id)).limit(1).first()

    def __init__(self, post_id, user_id, magnitude):
        super().__init__(user_id, magnitude)
        self.post_id = post_id
    
    


"""
INIT MODELS
"""

def init_users():
    print("init users")
    new_super_user = SuperUser(user_token="marcssecrettoken______________", username='marc', password=generate_password_hash('1'), email='supre@gmail.com')#gcacadmin, gcacadminpassword123
    new_dev_user = DeveloperUser(username='dev', password=generate_password_hash('1'), email='dev@gmail.com')#gcacadmin, gcacadminpassword123
    
    db.session.add(new_super_user)
    db.session.commit()
    db.session.add(new_dev_user)
    db.session.commit()

def init_test_models():
    print("init test models")
    user = User.get_user_from_username("marc")
    # new_configfile = ConfigFile()
    li = os.listdir('./configfiles')
    for i in li:
        #"./configfiles/wikipedia.json"
        json_str = open("./configfiles/" + i, "r").read()
        name = i.split('.')[0]
        new_configfile = user.add_config_file(
            name, json_str, active=True
        )
        # db.session.add(new_configfile)

        user.add_post(
            ConfigFilePost, "%s post"%name, new_configfile, user.id
        )
        # new_post = ConfigFilePost()

        # db.session.add(new_post)
        # db.session.commit()

def init_permissions():
    print("init permissions")
    # print("PERMISSIONS", new_user.permissions)
    for kwargs in [
            {"permission_name" : "*"},
            {"permission_name" : "/board/post/delete"},
            {"permission_name" : "/board/comment"},
            {"permission_name" : "/board/post"},
            {"permission_name" : "/board/upvote"},
            {"permission_name" : "/admin/"},
            {"permission_name" : "/board/comment"},
            {"permission_name" : "/board/post"},
            {"permission_name" : "/board/upvote"},
            {"permission_name" : "/board/downvote"},
            {"permission_name" : "/admin/*"},
            {"permission_name" : "/admin"},        
            {"permission_name" : "/admin : *"},
            {"permission_name" : "/admin : delete"},
            {"permission_name" : "/admin : create"},
            {"permission_name" : "/admin : edit"},
            {"permission_name" : "/test"},
            {"permission_name" : "/dev/upload"},
            {"permission_name" : "/dev/*"},  

            {"permission_name" : "/user/*"},  
            {"permission_name" : "/user/ban"},  
            {"permission_name" : "/user/profile"},  
            {"permission_name" : "/user/delete"},  
            {"permission_name" : "/user/edit"},  

            {"permission_name" : "/api/v1/*"},
            {"permission_name" : "/api/v1/get_template"},
            {"permission_name" : "/api/v1/downvote"},
            {"permission_name" : "/api/v1/upvote"},
            {"permission_name" : "/api/v1/all_posts"},
            {"permission_name" : "/api/v1/get_post"},

    ]:
    
        db.session.add(Permission(**kwargs))
    db.session.commit()

def init_db():
    print("INIT DB")
    if os.path.exists("main.old.db"):
        os.remove("main.old.db")
    if os.path.exists("main.db"):
        os.rename("main.db", "main.old.db")
    # with app.app_context():
    db.create_all()
        

"""
LOADING PERMISSIONS
"""
user_permission_names = [
    "/board/comment",
    "/board/post",
    "/board/upvote",
    "/board/downvote",
    "/test",
    "/user/profile"
]
user_permissions = []
general_user_permission_names = [
    "/api/v1/get_template",
]
general_user_permissions = []
developer_user_permission_names = [
    "/dev/*"
]
developer_user_permissions = []
moderator_user_permission_names = [
    "/board/post/delete",
    "/api/v1/*",
    "/user/ban",
    "/board/post",
    "/admin",
    "/admin : edit",

]
moderator_user_permissions = []
admin_user_permission_names = [
    "/api/v1/*",
    "/user/edit",
    "/user/delete",
    "/user/ban",
    "/admin/*",
    "/admin : *",

]
admin_user_permissions = []
super_user_permission_names = [
    "*"
]
super_user_permissions = []

def load_permissions():
    print("Load Permissions")
    def add_p(permission_name):
        p = Permission.get_permission(permission_name)
        if not p:
            print("Error with ", permission_name, "please makesure it is instantiated")

    for permission_name in user_permission_names:
        user_permissions.append(
            add_p(permission_name)
        )
    for permission_name in general_user_permission_names:
        general_user_permissions.append(
            add_p(permission_name)
        )
    for permission_name in developer_user_permission_names:
        developer_user_permissions.append(
            add_p(permission_name)
        )
    for permission_name in moderator_user_permission_names:
        moderator_user_permissions.append(
            add_p(permission_name)
        )
    for permission_name in admin_user_permission_names:
        admin_user_permissions.append(
            add_p(permission_name)
        )
    for permission_name in super_user_permission_names:
        super_user_permissions.append(
            add_p(permission_name)
        )
    

    #ALL SHOULD IMPORT GENERAL USER
    super_user_permissions.extend(user_permissions)
    general_user_permissions.extend(user_permissions)
    developer_user_permissions.extend(user_permissions)
    moderator_user_permissions.extend(user_permissions)
    admin_user_permissions.extend(user_permissions)

    # print(user_permissions)
    # print(general_user_permissions)
    # print(developer_user_permissions)
    # print(moderator_user_permissions)
    # print(admin_user_permissions)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description='Short sample app')
    parser.add_argument('-r', action="store_true", default=False)
    args = parser.parse_args()
    with app.app_context():
        if args.r:
            init_db() 
        init_permissions()
        load_permissions()
        init_users()
        init_test_models()


