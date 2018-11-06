# from server import app, api
from flask import Flask, g, render_template, make_response, redirect
from flask_restful import reqparse, Api, Resource

from flask_httpauth import HTTPBasicAuth
from models import db, User

basic_auth = HTTPBasicAuth()


class Login(Resource):
    @basic_auth.verify_password
    def get(username_or_token, password):
        print(username_or_token, password)
        if not username_or_token or not password:
            return None
        g.user = None
        
        user_id = User.verify_auth_token(username_or_token) #tries to auth with a token
        print(username_or_token)
        if user_id: #if it works then it filters database for user
            user = db.session.query(User).filter_by(id=user_id).one()
        else: #if it doesn't then it attempts to filter database using username
            user = db.session.query(User).filter_by(username = username_or_token).first()
            if not user or not user.verify_password(password, user.password):
                print('FALSE')
                return False#returns false if not user

        g.user = user
        return True
        
class Logout(Resource):
    def get(self):
        g.user = None
        return ('Logout', 401)

class Register(Resource):
    register_parser = reqparse.RequestParser()
    register_parser.add_argument('username', type=str, required=True)
    register_parser.add_argument('email', type=str, required=True)
    register_parser.add_argument('password', type=str, required=True)

    def get(self):
        return ('Error', 404)
    def post(self):
        args = self.register_parser.parse_args()
        # print(args['username'])

        username = args['username']
        email = args['email']
        password = args['password']


        if len(password) < 8:
            return ('password is too short (8 or more characters)', 412)
        

        if User.username_taken(username):
            return ('username is not unique', 412)

        try:
            new_user = User(username=username, email=email, password=generate_password_hash(password))
        except:
            return ('Error 500', 500)

        try:
            db.session.add(new_user)
        except:
            return ('Error 500', 500)
        try:
            db.session.commit()
        except:
            return ('Error 500', 500)

        return ('successfully registered', 200)



