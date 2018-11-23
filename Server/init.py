from flask import Flask
# from models import db, User
from flask_sqlalchemy import SQLAlchemy

import random, string, time


#CONFIG AND INIT
app = Flask(__name__)
app.config['DEBUG'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///main.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True #This adds signifcant overhead
app.secret_key = ''.join(random.choice(string.ascii_uppercase+string.digits) for x in range(32))
app.config['SESSION_TYPE'] = 'filesystem'

db = SQLAlchemy()

with app.app_context():
    db.init_app(app)

# from auth import load_login_manager
# load_login_manager()



#FORCE HTTPS
# from flask_sslify import SSLify
# sslify = SSLify(app)



