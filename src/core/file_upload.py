# src/core/file_upload.py

import os
import uuid
from pathlib import Path
from typing import Optional
from fastapi import UploadFile, HTTPException, status
import aiofiles

# Define allowed image types
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

# Base media directory
MEDIA_DIR = Path("/app/media")
PRODUCTS_DIR = MEDIA_DIR / "products"

async def save_upload_file(upload_file: UploadFile, folder: str = "products") -> str:
    """
    Save uploaded file to media directory
    Returns: relative URL path to the file
    """
    # Validate file extension
    file_ext = Path(upload_file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Read file content
    content = await upload_file.read()
    
    # Validate file size
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE / 1024 / 1024}MB"
        )
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4().hex}{file_ext}"
    
    # Create folder path
    folder_path = MEDIA_DIR / folder
    folder_path.mkdir(parents=True, exist_ok=True)
    
    # Full file path
    file_path = folder_path / unique_filename
    
    # Save file
    async with aiofiles.open(file_path, 'wb') as f:
        await f.write(content)
    
    # Return URL path (relative to /media)
    return f"/media/{folder}/{unique_filename}"


def delete_file(file_url: Optional[str]) -> bool:
    """
    Delete file from media directory
    Returns: True if deleted, False if not found
    """
    if not file_url:
        return False
    
    try:
        # Extract file path from URL
        file_path = MEDIA_DIR / file_url.replace("/media/", "")
        
        if file_path.exists():
            file_path.unlink()
            return True
    except Exception:
        pass
    
    return False
