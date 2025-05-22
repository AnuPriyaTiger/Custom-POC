import logging
import os
from contextlib import asynccontextmanager
from typing import AsyncIterator
from pathlib import Path
from aad_token_verify import get_verified_payload
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend
from starlette.middleware.sessions import SessionMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from utility.db_connection import SessionLocal,Base, engine, get_db

from dotenv import load_dotenv
from apps.views import (user_access_views, widget_views, dashboard_views)

logger = logging.getLogger(__name__)
load_dotenv()


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    """
    Cache lifespan initialization
    """
    FastAPICache.init(InMemoryBackend())
    yield

    if SessionLocal._engine is None:
        await SessionLocal.close()


def setup_app():
    """
    Function to setup fastapi application
    """
    fastapi_app = FastAPI(lifespan=lifespan)
    fastapi_app.add_middleware(GZipMiddleware, minimum_size=1000, compresslevel=5)
    fastapi_app.add_middleware(SessionMiddleware, secret_key="fastapi")
    fastapi_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    return fastapi_app


app = setup_app()
Base.metadata.create_all(bind=engine)


BASE_DIR = Path("/app")


# @app.middleware("http")
# async def authentication_middleware(request: Request, call_next):
#     """
#     Function to add authentication middleware
#     """
#     if request.url.path == app.docs_url or request.url.path == app.openapi_url:
#         response = await call_next(request)
#         return response
#     authorization_header = request.headers.get("authorization", "")
#     if authorization_header.startswith("Bearer "):
#         token = authorization_header.split(" ")[1]
#         try:
#             token_verifier = get_verified_payload(
#                 token,
#                 tenant_id=os.environ.get("AZURE_TENANT_ID", None),
#                 audience_uris=[os.environ.get("spclientid", None)],
#             )
#             try:
#                 username = token_verifier.get("upn") or token_verifier.get(
#                     "unique_name"
#                 )
#                 user = User.objects.get(email=username)
#                 if user:
#                     response = await call_next(request)
#                     return response
#             except User.DoesNotExist as exc:
#                 raise HTTPException(
#                     status_code=404,
#                     detail="Authentication \
#                                     Error",
#                 ) from exc

#         except Exception as exc:
#             raise HTTPException(
#                 status_code=404,
#                 detail="Authentication \
#                                 Error",
#             ) from exc
#     else:
#         raise HTTPException(status_code=404, detail="No Bearer Token")


# Including the router
app.include_router(user_access_views.router, prefix="/api")
app.include_router(widget_views.router, prefix="/api")
app.include_router(dashboard_views.router, prefix="/api")
