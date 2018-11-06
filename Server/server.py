from flask import Flask, g, render_template, make_response, redirect
from flask_restful import reqparse, Api, Resource
from re import match

import os
import json

import config

from userstuff import Login, Register, Logout

app = Flask(__name__)
api = Api(app)


basedir = os.path.dirname(os.path.abspath(__file__))

from models import db, User


app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///main.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True #This adds signifcant overhead

with app.app_context():
    db.init_app(app)

def init_db():
    print("init db")
    with app.app_context():
        db.create_all()
init_db()


#LOADING TEMPLATES
abs_templates_dir = os.path.join(basedir, config.templates_directory)
templates = os.listdir(abs_templates_dir)

templates = [os.path.join(abs_templates_dir, x) for x in templates]

class LoginRegister(Resource):
    def get(self):
        return make_response(render_template("loginregister.html"), 200)

class GetTemplate(Resource):
    rp = reqparse.RequestParser()
    rp.add_argument('url', type=str, required=True)


    url_templates = {}

    for i in templates:
        # print(i)
        with open(i, "r") as f:
            json_data = json.loads(f.read())
        print(json_data['urls_regex'])
        urls = json_data['urls_regex']

        for url in urls:
            url_templates[url] = json_data
    
    def get(self):
        
        args = self.rp.parse_args()
        url = args['url']
        matches = [x for x in self.url_templates.keys() if match(x, url)]
        # print(matches)
        # print(url)

        if matches:
            #TODO
            #matches return as a list
            config_data = self.url_templates[matches[0]]
            return {'matched' : True, 'config' : config_data}
        else:
            return {'matched' : False}

    def post(self):
        return None

class Viewtab(Resource):
    def get(self):
        return None

class Worktab(Resource):
    def get(self):
        return None

class Index(Resource):
    def get(self):
        return make_response(render_template("index.html"), 200)

# api.add_resource(HelloWorld, '/')
api.add_resource(Index, '/')
api.add_resource(GetTemplate, '/api/v1/get_template')
api.add_resource(Viewtab, '/viewtab')
api.add_resource(Worktab, '/worktab')
api.add_resource(Login, '/user/login')
api.add_resource(Logout, '/user/logout')
api.add_resource(Register, '/user/register')
api.add_resource(LoginRegister, '/login')


if __name__ == '__main__':
    app.run(debug=True, extra_files=templates)
