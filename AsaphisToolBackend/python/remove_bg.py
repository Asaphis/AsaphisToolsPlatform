# -*- coding: utf-8 -*-
import sys
import os
os.environ['PYTHONIOENCODING'] = 'utf-8'

import torch
import torch.nn.functional as F
from PIL import Image
from torchvision import transforms
import numpy as np

from u2net import U2NETP  # Using smaller U2NETP model

def load_model(model_path):
    print("Loading U2-Net-P model...")
    model = U2NETP(3, 1)
    model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
    model.eval()
    return model

def remove_bg(input_image, output_image, model_path):
    model = load_model(model_path)
    transform = transforms.Compose([
        transforms.Resize((320, 320)),
        transforms.ToTensor(),
    ])

    image = Image.open(input_image).convert("RGB")
    tensor = transform(image).unsqueeze(0)

    with torch.no_grad():
        pred, _, _, _, _, _, _ = model(tensor)
        pred = pred[:, 0, :, :]
        pred = F.interpolate(pred.unsqueeze(0), size=image.size[::-1], mode='bilinear')
        mask = pred.squeeze().cpu().numpy()
        mask = (mask - mask.min()) / (mask.max() - mask.min())

    img = np.array(image)
    alpha = (mask * 255).astype(np.uint8)
    rgba = np.dstack((img, alpha))
    Image.fromarray(rgba).save(output_image)
    print(f"Saved: {output_image}")

if __name__ == "__main__":
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    model_path = os.path.join(os.path.dirname(__file__), "u2net.pth")
    remove_bg(input_path, output_path, model_path)
