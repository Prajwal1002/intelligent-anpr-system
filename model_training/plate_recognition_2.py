import json
import cv2
import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
from tensorflow.keras.models import model_from_json
from local_utils import detect_lp  # Ensure you have detect_lp from WPOD-NET
import os
from IPython.display import display
import keras
from keras.models import Sequential, load_model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.optimizers import Adam
from sklearn.metrics import classification_report
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
from tensorflow.keras.models import Sequential
from tensorflow.keras import optimizers  # Importing optimizers

# ✅ Load WPOD-NET Model
def load_wpod_net(json_path, weights_path):
    try:
        with open(json_path, "r") as json_file:
            model_dict = json.load(json_file)

        model = tf.keras.Model.from_config(model_dict["config"])
        model.load_weights(weights_path)

        print("✅ WPOD-NET Model loaded successfully!")
        return model

    except Exception as e:
        print(f"❌ Error loading WPOD-NET: {e}")
        return None  # Ensure we return None if loading fails

# ✅ Preprocess Image
def preprocess_image(image_path, resize=False):
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"❌ Error: Unable to load image from {image_path}")
    
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)  
    img = img / 255.0  

    if resize:
        img = cv2.resize(img, (224, 224))

    return img

# ✅ Get License Plate and Save It
def get_plate(image_path, wpod_net, Dmax=608, Dmin=608):
    if wpod_net is None:
        raise ValueError("❌ Error: WPOD-NET model is not loaded.")

    vehicle = preprocess_image(image_path)
    
    ratio = float(max(vehicle.shape[:2])) / min(vehicle.shape[:2])
    side = int(ratio * Dmin)
    bound_dim = min(side, Dmax)

    # Detect License Plate
    _, LpImg, _, cor = detect_lp(wpod_net, vehicle, bound_dim, lp_threshold=0.5)

    if LpImg is None or len(LpImg) == 0:
        print("❌ No license plate detected.")
        return vehicle, None, None

    # Convert the plate to 8-bit format and save it
    plate_image = (LpImg[0] * 255).astype(np.uint8)  # Convert from float32 to uint8
    plate_image = cv2.cvtColor(plate_image, cv2.COLOR_RGB2BGR)  # Convert back to BGR
    cv2.imwrite("detected_plate.jpg", plate_image)
    print("✅ License plate saved as detected_plate.jpg")

    return vehicle, LpImg, cor

# ✅ Load WPOD-NET Model
wpod_net = load_wpod_net("wpod-net.json", "wpod-net.h5")

# ✅ Run License Plate Detection
test_image_path = "uploads/dem4.jpg"
vehicle, LpImg, cor = get_plate(test_image_path, wpod_net)

# ✅ Display Results
fig = plt.figure(figsize=(12, 6))
grid = gridspec.GridSpec(ncols=2, nrows=1, figure=fig)

# Show original vehicle
fig.add_subplot(grid[0])
plt.axis(False)
plt.imshow(vehicle)

# Show detected license plate if found
fig.add_subplot(grid[1])
plt.axis(False)
if LpImg is not None:
    plt.imshow(LpImg[0])
else:
    plt.text(0.5, 0.5, "No Plate Detected", fontsize=12, ha='center')
plt.show()

def find_contours(dimensions, img) :

    cntrs, _ = cv2.findContours(img.copy(), cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

    lower_width = dimensions[0]
    upper_width = dimensions[1]
    lower_height = dimensions[2]
    upper_height = dimensions[3]

    img_ht, img_wt = np.shape(img)
    print('image dimen = ', img_wt, img_ht)

    print('dimen= ',len(cntrs), dimensions)

    # Check largest 5 or  15 contours for license plate or character respectively
    cntrs = sorted(cntrs, key=cv2.contourArea, reverse=True)[:15]

    ii = cv2.imread('contour.jpg')

    x_cntr_list = []
    target_contours = []
    img_res = []
    for cntr in cntrs :

        # grab the largest contour which corresponds to the component in the mask, then
				# grab the bounding box for the contour
        c = max(cntrs, key=cv2.contourArea)

        # detects contour in binary image and returns the coordinates of rectangle enclosing it
        intX, intY, intWidth, intHeight = cv2.boundingRect(cntr)
        print(intX, intY, intWidth, intHeight)

        # compute the aspect ratio, solidity, and height ratio for the component
        aspectRatio = intWidth / float(intHeight)
        aspectRatio = round(aspectRatio, 4)

        solidity = cv2.contourArea(c) / float(intWidth * intHeight)
        solidity = round(solidity, 4)

        heightRatio = intHeight / float(img.shape[1])
        # print('image = ', img.shape)
        heightRatio = round(heightRatio, 4)

				# determine if the aspect ratio, solidity, and height of the contour pass
				# the rules tests
        keepAspectRatio = 1.0>aspectRatio>0.25
        keepSolidity = solidity > 0.15
        keepHeight = heightRatio > 0.1 and heightRatio < 0.95

        print('ratio=', aspectRatio, 'area ratio=', solidity, 'height ratio=', heightRatio)

        # checking the dimensions of the contour to filter out the characters by contour's size
        # if keepAspectRatio and keepHeight and keepSolidity:
        # if upper_width > intWidth > lower_width or upper_height > intHeight > lower_height:
        # if intWidth > lower_width and intWidth < upper_width and intHeight > lower_height and intHeight < upper_height :
        # if intWidth >= 10 and intWidth <= 40 and intHeight >=20 and intHeight <=50:
        print('width', intWidth, 0.10*img_wt)
        print('height', intHeight, 0.30*img_ht)
        if 0.40*img_wt>intWidth>0.01*img_wt and 0.75*img_ht>intHeight>0.40*img_ht:
            x_cntr_list.append(intX) #stores the x coordinate of the character's contour, to used later for indexing the contours

            print('selected')
            char_copy = np.zeros((44,24))
            # extracting each character using the enclosing rectangle's coordinates.
            char = img[intY:intY+intHeight, intX:intX+intWidth]
            char = cv2.resize(char, (20, 40))

            cv2.rectangle(ii, (intX,intY), (intWidth+intX, intY+intHeight), (50,21,200), 2)
            plt.imshow(ii, cmap='gray')
            plt.title('Predict Segments')

            # Make result formatted for classification: invert colors
            char = cv2.subtract(255, char)

            # Resize the image to 24x44 with black border
            char_copy[2:42, 2:22] = char
            char_copy[0:2, :] = 0
            char_copy[:, 0:2] = 0
            char_copy[42:44, :] = 0
            char_copy[:, 22:24] = 0

            img_res.append(char_copy) # List that stores the character's binary image (unsorted)

    # Return characters on ascending order with respect to the x-coordinate (most-left character first)

    plt.show()
    # arbitrary function that stores sorted list of character indeces
    indices = sorted(range(len(x_cntr_list)), key=lambda k: x_cntr_list[k])
    img_res_copy = []
    for idx in indices:
        img_res_copy.append(img_res[idx])# stores character images according to their index
    img_res = np.array(img_res_copy)

    return img_res

# Find characters in the resulting images
def segment_characters(image) :

    # Preprocess cropped license plate image
    # img_lp = cv2.resize(image, (333, 75))
    img_lp = image
    img_gray_lp = cv2.cvtColor(img_lp, cv2.COLOR_BGR2GRAY)
    plt.imshow(img_gray_lp, cmap='gray')
    plt.title('gray')
    plt.show()
    BIN_THRESHOLD = 127
    _, img_binary_lp = cv2.threshold(img_gray_lp,  BIN_THRESHOLD, 255, cv2.THRESH_BINARY+cv2.THRESH_OTSU)
    plt.imshow(img_binary_lp, cmap='gray')
    plt.title('binary')
    plt.show()
    img_binary_lp = cv2.erode(img_binary_lp, (3,3))
    img_binary_lp = cv2.dilate(img_binary_lp, (3,3))

    LP_WIDTH = img_binary_lp.shape[0]
    LP_HEIGHT = img_binary_lp.shape[1]

    # Make borders white
    # img_binary_lp[0:3,:] = 255
    # img_binary_lp[:,0:3] = 255
    # img_binary_lp[72:75,:] = 255
    # img_binary_lp[:,330:333] = 255

    # Estimations of character contours sizes of cropped license plates
    dimensions = [LP_WIDTH/8,
                       LP_WIDTH/2,
                       LP_HEIGHT/10,
                       2*LP_HEIGHT/3]
    plt.imshow(img_binary_lp, cmap='gray')
    plt.title('Contour')
    plt.show()
    cv2.imwrite('contour.jpg',img_binary_lp)
    display(dimensions)
    print(dimensions)

    # Get contours within cropped license plate
    char_list = find_contours(dimensions, img_binary_lp)

    return char_list

# get cropped image from LDP
cropped = cv2.imread('detected_plate.jpg')
plt.imshow(cv2.cvtColor(cropped, cv2.COLOR_BGR2RGB))
plt.title('Cropped Image')
plt.show()
char=segment_characters(cropped)

# Ensure char_images is a list of images
if isinstance(char, np.ndarray):  
    char_images = list(char)  # Convert ndarray to a list
else:
    char_images = char  # If it's already a list, keep it

print("Segmented Characters Found:", len(char_images))  # Should print 9


for i in range(len(char)):
    plt.subplot(1, len(char), i+1)
    plt.imshow(char[i], cmap='gray')
    plt.axis('off')
plt.show()

# Load the saved model
model = tf.keras.models.load_model("improved_custom_CNN.h5")
print("Model loaded successfully!")

# Ensure image has 3 channels
def fix_dimension(img):
    """Convert grayscale image to 3-channel format."""
    new_img = np.zeros((32, 32, 3))  # Change from (32, 32, 3) → (28, 28, 3)
    for i in range(3):
        new_img[:, :, i] = img  # Fill all 3 channels
    return new_img

# Function to predict characters from segmented images
def show_results(model, char_images):  # Pass model & char_images as arguments
    dic = {i: c for i, c in enumerate('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ')}  # Label mapping
    
    output = []
    for ch in char_images:  # `char_images` should be a list of segmented character images
        img_ = cv2.resize(ch, (32, 32), interpolation=cv2.INTER_AREA)  # Resize to 28x28
        img = fix_dimension(img_) / 255.0  # Normalize pixel values
        img = img.reshape(1, 32, 32, 3)  # Ensure correct input shape for the model

        y_ = model.predict(img)  # Predict class probabilities
        idx = np.argmax(y_)  # Get predicted class index
        character = dic[idx]  # Map to corresponding character
        output.append(character)  # Store result

    plate_number = ''.join(output)
    return plate_number

# Call show_results once before the loop to avoid redundant calls
plate_number = show_results(model, char_images)  

plt.figure(figsize=(10, 6))
for i, ch in enumerate(char_images):  # Ensure `char_images` is a list of segmented characters
    img = cv2.resize(ch, (28, 28), interpolation=cv2.INTER_AREA)
    plt.subplot(3, 4, i + 1)
    plt.imshow(img, cmap='gray')
    plt.title(f'Predicted: {plate_number[i]}')  # Corrected
    plt.axis('off')

plt.show()
print("Predicted Number Plate:", plate_number)
