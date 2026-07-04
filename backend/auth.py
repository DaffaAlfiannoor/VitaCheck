from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
import bcrypt
from pydantic import BaseModel

from database import get_db

SECRET_KEY = "vitacheck-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

security = HTTPBearer()
router = APIRouter(prefix="/auth", tags=["Auth"])


class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str


class LoginRequest(BaseModel):
    username: str
    password: str


from typing import Optional

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    health_target: Optional[str] = None
    created_at: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(
            credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM]
        )
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    with get_db() as conn:
        user = conn.execute(
            "SELECT id, username, email, health_target, created_at FROM users WHERE id = ?",
            (user_id,),
        ).fetchone()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return dict(user)


@router.post("/register", response_model=TokenResponse)
def register(body: RegisterRequest):
    if len(body.username) < 3:
        raise HTTPException(status_code=400, detail="Username minimal 3 karakter")
    if len(body.password) < 6:
        raise HTTPException(status_code=400, detail="Password minimal 6 karakter")
    if "@" not in body.email:
        raise HTTPException(status_code=400, detail="Email tidak valid")

    salt = bcrypt.gensalt()
    password_hash = bcrypt.hashpw(body.password.encode("utf-8"), salt).decode("utf-8")

    with get_db() as conn:
        try:
            cur = conn.execute(
                "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
                (body.username, body.email, password_hash),
            )
            user_id = cur.lastrowid
        except Exception:
            raise HTTPException(
                status_code=409, detail="Username atau email sudah terdaftar"
            )

        user = conn.execute(
            "SELECT id, username, email, health_target, created_at FROM users WHERE id = ?",
            (user_id,),
        ).fetchone()

    token = create_access_token({"sub": str(user["id"])})
    return TokenResponse(access_token=token, user=UserResponse(**dict(user)))


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest):
    with get_db() as conn:
        user = conn.execute(
            "SELECT * FROM users WHERE username = ?", (body.username,)
        ).fetchone()

    if user is None or not bcrypt.checkpw(body.password.encode("utf-8"), user["password_hash"].encode("utf-8")):
        raise HTTPException(status_code=401, detail="Username atau password salah")

    token = create_access_token({"sub": str(user["id"])})
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user["id"],
            username=user["username"],
            email=user["email"],
            health_target=user["health_target"],
            created_at=user["created_at"],
        ),
    )


@router.get("/me", response_model=UserResponse)
def me(user: dict = Depends(get_current_user)):
    return UserResponse(**user)


class ResetPasswordRequest(BaseModel):
    username: str
    email: str
    new_password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class TargetRequest(BaseModel):
    health_target: str


@router.post("/target")
def update_target(body: TargetRequest, user: dict = Depends(get_current_user)):
    """Update user's health target."""
    with get_db() as conn:
        conn.execute(
            "UPDATE users SET health_target = ? WHERE id = ?",
            (body.health_target, user["id"]),
        )
    return {"message": "Target berhasil disimpan"}


@router.post("/reset-password")
def reset_password(body: ResetPasswordRequest):
    """Reset password by verifying username + email combination."""
    if len(body.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password baru minimal 6 karakter")

    with get_db() as conn:
        user = conn.execute(
            "SELECT id, password_hash FROM users WHERE username = ? AND email = ?",
            (body.username, body.email),
        ).fetchone()

        if user is None:
            raise HTTPException(
                status_code=404,
                detail="Kombinasi username dan email tidak ditemukan",
            )

        salt = bcrypt.gensalt()
        new_hash = bcrypt.hashpw(body.new_password.encode("utf-8"), salt).decode("utf-8")
        conn.execute(
            "UPDATE users SET password_hash = ? WHERE id = ?",
            (new_hash, user["id"]),
        )

    return {"message": "Password berhasil direset. Silakan login dengan password baru."}


@router.post("/change-password")
def change_password(body: ChangePasswordRequest, user: dict = Depends(get_current_user)):
    """Change password for logged-in user (requires current password)."""
    if len(body.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password baru minimal 6 karakter")

    with get_db() as conn:
        row = conn.execute(
            "SELECT password_hash FROM users WHERE id = ?", (user["id"],)
        ).fetchone()

        if not bcrypt.checkpw(
            body.current_password.encode("utf-8"),
            row["password_hash"].encode("utf-8"),
        ):
            raise HTTPException(status_code=401, detail="Password lama salah")

        salt = bcrypt.gensalt()
        new_hash = bcrypt.hashpw(body.new_password.encode("utf-8"), salt).decode("utf-8")
        conn.execute(
            "UPDATE users SET password_hash = ? WHERE id = ?",
            (new_hash, user["id"]),
        )

    return {"message": "Password berhasil diubah"}
