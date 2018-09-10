import matplotlib.image as mpimg
import matplotlib.pyplot as plt
import numpy as np
from PIL import Image, ImageOps
from scipy.spatial import cKDTree
from skimage.feature import plot_matches
from skimage.measure import ransac
from skimage.transform import AffineTransform
from six import BytesIO
import tensorflow as tf
import tensorflow_hub as hub
from six.moves.urllib.request import urlopen


IMAGE_1_URL = 'https://upload.wikimedia.org/wikipedia/commons/2/28/Bridge_of_Sighs%2C_Oxford.jpg'
IMAGE_2_URL = 'https://upload.wikimedia.org/wikipedia/commons/c/c3/The_Bridge_of_Sighs_and_Sheldonian_Theatre%2C_Oxford.jpg'

#IMAGE_1_URL = 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Golden_gate2.jpg'
#IMAGE_2_URL = 'https://upload.wikimedia.org/wikipedia/commons/3/3e/GoldenGateBridge.jpg'

# IMAGE_1_URL = 'https://lh3.googleusercontent.com/lufPTxXeIGvtTGgZFnf_myC12tKzuHoz2Z5yW_q1C9qaJmrHJVk89vrTO1eDRGfVLahQXesTEAQjT5mJh_5fOcS0wDb1hJidpHyGbQW0-lfHycCI27jWN3hNgL-3nlsa4zrGB5w9wSQbj6zIskIYrXt8RaNWLjRS1qeTuib-bYIVYg_qia_iALFIvmr7pbXeYmJMwFGZsQDlR2Tg37fOCdFwNix96eh_hIe7ORSIZ7kTt-HyCAVHMurmnAykaLfBMM6WNeAB_GTBTGaMkQAureusxRn70dRPOzhgTIn0EMSiW0131pGTN3805H5cmRcW3RBpE06lEBwhG7XRo1qRjQUHvfABge0n05hcgfs7N-u6hX22CmksE16PiPs_WyQygfbnQ57TcdSQUP2eVm2tFOfFli7Gsb4PsqAB8HpPHv74QjF8lbECA41ZBF6BmspAXTHbssyaW_i9lOsIDCOhsgkUoEf0w7A6NfffndJtI6bxp62Q6d5_sW-KRYJurswGLT2UhBg8uSVwLAXUtKOhL7GM6wkNMPDPCioiFHoj2GbCAgnvwhAfn-qfMl2KKqiODvE-88xk8zjKuqJ6pdpWo2JYj5U9ZyafuPpyFJYG92MvH5v8hN5vtBnK86iFAZpU=w506-h674-no'
#IMAGE_2_URL = 'https://lh3.googleusercontent.com/E2z3781R4iWW8Ijs-1Cw5K_pvo1dMJdzaORwvKdZLxLg2OsKEB6JJ5hUWEPrgYHDrAHJpVD1HOcj2pn9UlDSA6O-zLzHilK8xDv0PHMiQTqBWWQEDmrzM1Lr-yTaFjYQjOGdshxcLmRltehpudOfUQYcl5L0YHmBLnP190oTsUq-eAhgczj_K9gtM3s-qg5qD9kx2mS2EoZn5XnIJR5L75s_cArYbeRJkYIOL-jEhSvk2q2HZ7yzwM1_WaIcNJuybJziMvcdPPE24ApLx09TsWo9m7-Q7qsapI-KEopEoSPbD9KEW-oTORZkH9GHJmmNuNqAQ3FYabLIEq0fF9jhNtxfqWZNmOs45CRJxTZXgLuh6WXmyC0gSmkgRpL2mnSNJzIQgOx2wQre8PoInV9oSAREW-BiAsbJtIcIBtnutmNZLO4X0XZww8nOzi_qLiYaaLPmR_vw5wsm_AhVWLfVxNZWu2YEweIh76On1I6rA-6csnqNmkynb2MuT45NAcHryg1Jpm4F-7U-U9EVOdS_TnW5sN4aFWhSUI0WBH3uS3Gk2Bxm9byxHRIwQTmMy5PZJe7cu9qS6r0ZxIMXj_Ln2c2rEmIht51r0vclBjMIJdfHkFsyph-bkDSzImLiIW4o=w506-h674-no'
#IMAGE_2_URL = 'https://lh3.googleusercontent.com/eag-O5LS2ghv-upnjiQJGVmUhYwuZ9NyglvRnHxqG1PY4E_pYsaJB7bOtVfqTQ_dk3KJfq9Zb60NCYsaoc6l4F4U0VEIBPJo-u2RP6dHvhB3w52M7x82Ry4MporCYHVFZ-eSeeWHG59Ze9YPnbWh77Lvug6l7FfvmDjNNxWTPUSEk7TBG4GTSt4droqofo1S_onukoei3CptdP9Sycev2fDHvdwXKtmr3nqZ9T4qEVOQPgr9RSU51lExAQG3IKlN6wVkDePGLwBL_dIyBAA4Q1yUZ0waDTOSW26Ow2dd6satdGfinbJe3aWj1LE8cLlVfmDDbJVijVHpt6730tPsefBsfU8nXT4AYEe2jb-s10gssyLEMcLMrIguim6iU9MmRU2G4iq_40tSPWymq9Uq8Qo_3mxi-WYCk_cjRQ_YRN0PL3eNryCOncICENIggpzWMpiVClWT2PJJ_vgJ9O7c_55umVAEDFfDAZyhcpFWkY-vLuC8MgRDpBJ91a8qJzfjfhjnJYRkZz8TTe3k7SLfjbEIviH0whjAaZ4IQ0jE45f5Jb_sokUzyVPvjoQyDvq1vVvavwtA8y_RtOBc-ogAItMZ5tNPhpYfR_8MkDj9ySFHd-t9zaJipO8bFGmnvPtm=w506-h674-no'

#IMAGE_1_URL = 'https://upload.wikimedia.org/wikipedia/commons/c/ce/2006_01_21_Ath%C3%A8nes_Parth%C3%A9non.JPG'
#IMAGE_2_URL = 'https://upload.wikimedia.org/wikipedia/commons/5/5c/ACROPOLIS_1969_-_panoramio_-_jean_melis.jpg'

# IMAGE_1_URL = 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Eiffel_Tower%2C_November_15%2C_2011.jpg'
# IMAGE_2_URL = 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Eiffel_Tower_from_immediately_beside_it%2C_Paris_May_2008.jpg'

# IMAGE_1_URL = 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Parthenon-Restoration-Nov-2005-a.jpg'
# IMAGE_2_URL = 'https://upload.wikimedia.org/wikipedia/commons/5/57/White_House_06.02.08.jpg'

IMAGE_1_JPG = 'image_1.jpg'
IMAGE_2_JPG = 'image_2.jpg'

#@title The images that will be processed by DELF
def download_and_resize_image(url, filename, new_width=256, new_height=256):
  response = urlopen(url)
  image_data = response.read()
  image_data = BytesIO(image_data)
  pil_image = Image.open(image_data)
  pil_image = ImageOps.fit(pil_image, (new_width, new_height), Image.ANTIALIAS)
  pil_image_rgb = pil_image.convert('RGB')
  pil_image_rgb.save(filename, format='JPEG', quality=90)

download_and_resize_image(IMAGE_1_URL, IMAGE_1_JPG)
download_and_resize_image(IMAGE_2_URL, IMAGE_2_JPG)

def show_images(image_path_list):
  plt.figure()
  for i, image_path in enumerate(image_path_list):
    plt.subplot(1, len(image_path_list), i+1)
    plt.imshow(np.asarray(Image.open(image_path)))
    plt.title(image_path)
    plt.grid(False)
    plt.yticks([])
    plt.xticks([])
  plt.show()

# show_images([IMAGE_1_JPG, IMAGE_2_JPG])

def image_input_fn():
  filename_queue = tf.train.string_input_producer(
      [IMAGE_1_JPG, IMAGE_2_JPG], shuffle=False)
  reader = tf.WholeFileReader()
  _, value = reader.read(filename_queue)
  image_tf = tf.image.decode_jpeg(value, channels=3)
  return tf.image.convert_image_dtype(image_tf, tf.float32)

tf.reset_default_graph()
tf.logging.set_verbosity(tf.logging.FATAL)

m = hub.Module('https://tfhub.dev/google/delf/1')

# The module operates on a single image at a time, so define a placeholder to
# feed an arbitrary image in.
image_placeholder = tf.placeholder(
    tf.float32, shape=(None, None, 3), name='input_image')

module_inputs = {
    'image': image_placeholder,
    'score_threshold': 100.0,
    'image_scales': [0.25, 0.3536, 0.5, 0.7071, 1.0, 1.4142, 2.0],
    'max_feature_num': 1000,
}

module_outputs = m(module_inputs, as_dict=True)

image_tf = image_input_fn()

with tf.train.MonitoredSession() as sess:
  results_dict = {}  # Stores the locations and their descriptors for each image
  for image_path in [IMAGE_1_JPG, IMAGE_2_JPG]:
    image = sess.run(image_tf)
    print('Extracting locations and descriptors from %s' % image_path)
    results_dict[image_path] = sess.run(
        [module_outputs['locations'], module_outputs['descriptors']],
        feed_dict={image_placeholder: image})

#@title TensorFlow is not needed for this post-processing and visualization
def match_images(results_dict, image_1_path, image_2_path):
  distance_threshold = 0.8

  # Read features.
  locations_1, descriptors_1 = results_dict[image_1_path]
  num_features_1 = locations_1.shape[0]
  print("Loaded image 1's %d features" % num_features_1)
  locations_2, descriptors_2 = results_dict[image_2_path]
  num_features_2 = locations_2.shape[0]
  print("Loaded image 2's %d features" % num_features_2)

  # Find nearest-neighbor matches using a KD tree.
  d1_tree = cKDTree(descriptors_1)
  _, indices = d1_tree.query(
      descriptors_2, distance_upper_bound=distance_threshold)

  # Select feature locations for putative matches.
  locations_2_to_use = np.array([
      locations_2[i,]
      for i in range(num_features_2)
      if indices[i] != num_features_1
  ])
  locations_1_to_use = np.array([
      locations_1[indices[i],]
      for i in range(num_features_2)
      if indices[i] != num_features_1
  ])

  # Perform geometric verification using RANSAC.
  _, inliers = ransac(
      (locations_1_to_use, locations_2_to_use),
      AffineTransform,
      min_samples=3,
      residual_threshold=20,
      max_trials=1000)

  print('Found %d inliers' % sum(inliers))

  # Visualize correspondences.
  plt.figure()
  _, ax = plt.subplots()
  img_1 = mpimg.imread(image_1_path)
  img_2 = mpimg.imread(image_2_path)
  inlier_idxs = np.nonzero(inliers)[0]
  plot_matches(
      ax,
      img_1,
      img_2,
      locations_1_to_use,
      locations_2_to_use,
      np.column_stack((inlier_idxs, inlier_idxs)),
      matches_color='b')
  ax.axis('off')
  ax.set_title('DELF correspondences')
  plt.show()

  print("hello world");

match_images(results_dict, IMAGE_1_JPG, IMAGE_2_JPG)
