import os
import sys
import csv
import urllib.request
import re
import cv2
import numpy as np
import fitz  # PyMuPDF

# We'll use OpenCV's built-in Haar Cascade for face detection as it's lightweight and usually pre-installed with opencv-python
def download_image(url, output_path):
    try:
        # Extract ID from google drive link
        match = re.search(r'id=([a-zA-Z0-9_-]+)', url)
        if match:
            file_id = match.group(1)
            # Use the direct content link
            direct_url = f"https://lh3.googleusercontent.com/d/{file_id}"
            req = urllib.request.Request(direct_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response, open(output_path, 'wb') as out_file:
                out_file.write(response.read())
            return True
    except Exception as e:
        print(f"Failed to download {url}: {e}")
    return False

def smart_crop_face(image_path, output_path, target_size=(400, 400)):
    # Check if this is a PDF
    try:
        if image_path.lower().endswith('.pdf'):
            doc = fitz.open(image_path)
            for page in doc:
                pix = page.get_pixmap()
                img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.h, pix.w, pix.n)
                if pix.n == 4:
                    img = cv2.cvtColor(img, cv2.COLOR_RGBA2BGR)
                elif pix.n == 1:
                    img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
                else:
                    img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
                break # Just get first page image
        else:
            img = cv2.imread(image_path)
    except Exception as e:
        print(f"Error loading image or PDF {image_path}: {e}")
        return False
        
    if img is None:
        print(f"Could not read image {image_path}")
        return False
        
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Load face cascade
    cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    face_cascade = cv2.CascadeClassifier(cascade_path)
    
    # Detect faces
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    
    h_img, w_img = img.shape[:2]
    
    if len(faces) > 0:
        # Find the largest face (assuming it's the main subject)
        faces = sorted(faces, key=lambda x: x[2]*x[3], reverse=True)
        x, y, w, h = faces[0]
        
        # Calculate center of face
        cx = x + w // 2
        cy = y + h // 2
        
        # We want to include hair and shoulders, so we make the crop box larger than the face.
        # A good rule of thumb for headshots is the face is about 1/3 to 1/2 the height of the frame.
        # We will set the crop box size to be 2.5 times the face width/height.
        crop_size = int(max(w, h) * 2.5)
        
        # Ensure the crop size doesn't exceed the shortest dimension of the original image
        crop_size = min(crop_size, min(w_img, h_img))
        
        # Calculate new top-left corner
        # Shift the center slightly up so there's more body and less empty space above the head
        cy_adjusted = cy + int(h * 0.2)
        
        x1 = cx - crop_size // 2
        y1 = cy_adjusted - crop_size // 2
        x2 = x1 + crop_size
        y2 = y1 + crop_size
        
        # Clamp to image boundaries
        if x1 < 0:
            x2 -= x1 # shift right
            x1 = 0
        if y1 < 0:
            y2 -= y1 # shift down
            y1 = 0
        if x2 > w_img:
            x1 -= (x2 - w_img) # shift left
            x2 = w_img
        if y2 > h_img:
            y1 -= (y2 - h_img) # shift up
            y2 = h_img
            
        # Ensure it's square after clamping
        x1 = max(0, x1)
        y1 = max(0, y1)
        
        # If the adjustments made it non-square, force square based on the shortest clamped dimension
        final_size = min(x2 - x1, y2 - y1)
        if final_size <= 0:
            print("Math error in bounding box clamping.")
            cropped = img
        else:
            # Re-center the square
            cx_final = (x1 + x2) // 2
            cy_final = (y1 + y2) // 2
            
            x1_f = max(0, cx_final - final_size // 2)
            y1_f = max(0, cy_final - final_size // 2)
            
            cropped = img[y1_f:y1_f+final_size, x1_f:x1_f+final_size]
    else:
        # No face detected, fallback to center crop square
        print(f"No face detected in {image_path}, using center crop.")
        size = min(w_img, h_img)
        x1 = (w_img - size) // 2
        y1 = (h_img - size) // 2
        cropped = img[y1:y1+size, x1:x1+size]
        
    # Resize to target
    resized = cv2.resize(cropped, target_size, interpolation=cv2.INTER_AREA)
    cv2.imwrite(output_path, resized)
    return True

def main():
    target_dir = os.path.join("Frontend", "public", "team")
    os.makedirs(target_dir, exist_ok=True)
    
    csv_path = "Team Profile for Landing Page - Form Responses 1 (1).csv"
    
    if not os.path.exists(csv_path):
        print(f"CSV file not found: {csv_path}")
        return
        
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader)
        # Find relevant column indices
        name_idx = next(i for i, h in enumerate(header) if 'Full Name' in h)
        img_idx = next(i for i, h in enumerate(header) if 'Upload Professional Headshot' in h)
        
        for row in reader:
            if not row or len(row) < max(name_idx, img_idx) + 1:
                continue
            name = row[name_idx].strip()
            img_url = row[img_idx].strip()
            
            if not name or not img_url:
                continue
                
            # Sanitize filename
            filename = name.lower().replace(' ', '_')
            # Remove any special chars
            filename = re.sub(r'[^a-z0-9_]', '', filename)
            filename = filename + ".jpg"
            
            output_file = os.path.join(target_dir, filename)
            
            # Since download might be a PDF, check the headers or just try downloading and inspecting
            temp_file = os.path.join(target_dir, f"temp_{filename}")
            
            print(f"Processing {name}...")
            
            if download_image(img_url, temp_file):
                # Try to detect if it's a PDF by reading the first few bytes
                is_pdf = False
                with open(temp_file, 'rb') as tf:
                    header = tf.read(4)
                    if header == b'%PDF':
                        is_pdf = True
                
                # Rename temp file if it's a PDF so PyMuPDF knows how to parse it
                proc_file = temp_file
                if is_pdf:
                    proc_file = temp_file + ".pdf"
                    os.rename(temp_file, proc_file)

                if smart_crop_face(proc_file, output_file):
                    print(f"  -> Saved smart cropped image to {output_file}")
                else:
                    print(f"  -> Failed to process image")
                
                # Cleanup temp file
                if os.path.exists(proc_file):
                    os.remove(proc_file)
                if os.path.exists(temp_file):
                    os.remove(temp_file)
            else:
                print(f"  -> Failed to download")

if __name__ == "__main__":
    main()
