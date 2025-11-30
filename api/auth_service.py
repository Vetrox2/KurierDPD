from datetime import datetime, timedelta
import hashlib
import secrets
from dataclasses import dataclass

@dataclass
class User:
    username: str
    password_hash: str

@dataclass
class AuthToken:
    token: str
    expires_at: datetime
    username: str

class AuthService:
    def __init__(self):
        self.__users = [
            User(
                username="kurier",
                password_hash=self.__hash_password("kurier")
            ),
            User(
                username="admin",
                password_hash=self.__hash_password("admin")
            ),
        ]
        self.__tokens: dict[str, AuthToken] = {}
    
    def login(self, username: str, password: str) -> str | None:
        user = next((u for u in self.__users if u.username == username), None)
        if not user:
            return None
        
        password_hash = self.__hash_password(password)
        if password_hash != user.password_hash:
            return None
        
        token = secrets.token_urlsafe(32)
        expires_at = datetime.now() + timedelta(hours=8)
        
        self.__tokens[token] = AuthToken(
            token=token,
            expires_at=expires_at,
            username=username
        )
        
        return token
    
    def validate_token(self, token: str) -> bool:
        auth_token = self.__tokens.get(token)
        if not auth_token:
            return False
        
        if datetime.now() > auth_token.expires_at:
            del self.__tokens[token]
            return False
        
        return True
    
    def __hash_password(self, password: str) -> str:
        return hashlib.sha256(password.encode()).hexdigest()
