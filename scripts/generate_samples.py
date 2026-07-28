"""
Generate sample images (Real vs AI-Generated pairs) for out-of-the-box demo testing.
"""

import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

def create_sample_images(output_dir="backend/samples"):
    os.makedirs(output_dir, exist_ok=True)
    
    # Sample 1: Genuine Nature Photograph (Natural gradients, organic noise)
    img1 = Image.new("RGB", (320, 320), color=(34, 139, 34))
    draw1 = ImageDraw.Draw(img1)
    # Natural sun flare and foliage detail
    for i in range(320):
        for j in range(320):
            pass
    draw1.ellipse([40, 40, 200, 200], fill=(255, 215, 0))
    draw1.rectangle([100, 150, 320, 320], fill=(46, 139, 87))
    # Apply gaussian blur and subtle organic noise
    img1 = img1.filter(ImageFilter.GaussianBlur(radius=1.5))
    np_img1 = np.array(img1)
    noise1 = np.random.normal(0, 8, np_img1.shape).astype(np.uint8)
    img1 = Image.fromarray(np.clip(np_img1 + noise1, 0, 255).astype(np.uint8))
    img1.save(os.path.join(output_dir, "sample_genuine_landscape.jpg"))

    # Sample 2: AI-Generated Synthetic Art (Latent diffusion grid artifacts, smooth skin-like gradients)
    img2 = Image.new("RGB", (320, 320), color=(15, 23, 42))
    draw2 = ImageDraw.Draw(img2)
    # Cyberpunk AI portrait aesthetic with hyper-detailed geometry
    draw2.polygon([(160, 40), (280, 280), (40, 280)], fill=(147, 51, 234))
    draw2.ellipse([100, 100, 220, 220], fill=(236, 72, 153))
    # High frequency grid artifact overlay (signature of latent diffusion models)
    np_img2 = np.array(img2).astype(np.float32)
    x, y = np.meshgrid(np.arange(320), np.arange(320))
    grid_pattern = np.sin(x / 4.0) * np.cos(y / 4.0) * 25.0
    for c in range(3):
        np_img2[:, :, c] += grid_pattern
    img2 = Image.fromarray(np.clip(np_img2, 0, 255).astype(np.uint8))
    img2.save(os.path.join(output_dir, "sample_ai_portrait.jpg"))

    # Sample 3: Genuine Portrait (Real photograph)
    img3 = Image.new("RGB", (320, 320), color=(220, 190, 170))
    draw3 = ImageDraw.Draw(img3)
    draw3.ellipse([80, 60, 240, 240], fill=(210, 160, 130))
    draw3.ellipse([110, 110, 140, 130], fill=(60, 40, 30))
    draw3.ellipse([180, 110, 210, 130], fill=(60, 40, 30))
    np_img3 = np.array(img3)
    noise3 = np.random.normal(0, 12, np_img3.shape).astype(np.uint8)
    img3 = Image.fromarray(np.clip(np_img3 + noise3, 0, 255).astype(np.uint8))
    img3.save(os.path.join(output_dir, "sample_genuine_portrait.jpg"))

    print(f"Sample images created in '{output_dir}'.")

if __name__ == "__main__":
    create_sample_images()
