from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import (TimedJSONWebSignatureSerializer as Serializer, BadSignature, SignatureExpired)

db = SQLAlchemy()

import random, string

secret_key = ''.join(random.choice(string.ascii_uppercase+string.digits) for x in range(32))

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), unique=False, nullable=False)

    def __repr__(self):
        return str(self.username)
        
    @classmethod
    def hash_password(self, password):
        self.password = generate_password_hash(password)
  
    @classmethod
    def verify_password(self, password, password_hash):
        return check_password_hash(password_hash, password)

    @classmethod
    def username_taken(self, username):
        return db.session.query(db.exists().where(User.username==username)).scalar()
    
    @classmethod
    def generate_token(self, expiration=600):
        s = Serializer(secret_key, expires_in = expiration)
        return s.dumps({'id' : self.id})

    @staticmethod
    def verify_auth_token(token):
        s = Serializer(secret_key)
        try:
            data = s.loads(token)
        except SignatureExpired:
            return None
        except BadSignature:
            return None
        user_id = data['id']
        return user_id