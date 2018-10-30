# Visual Object Description

[Visual Object Description](#VisualDescription) is a JSON-LD ```@context``` that you can use to publish a visual description of objects to be used as input to computer vision classification and localization pipelines.

Here is a concrete example:

```javascript
{
  "@context": "https://code.sgo.to/arpub",
  "@type": "Layer",
  "name": "Dog breeds",
  "description": "Different breeds of dogs",
  "items": [{
    "@type": "Artifact",
    "asset": "https://en.wikipedia.org/wiki/Chihuahua_(dog)",
    "target": {
      "@type": "VisualDescription",
      "name": "Chihuahua",
      "examples": [
        "http://code.sgo.to/dogs/images/n02085620-Chihuahua/n02085620_10074.jpg",
        "http://code.sgo.to/dogs/images/n02085620-Chihuahua/n02085620_10621.jpg"
      ]
    }
  }, {
    "@type": "Artifact",
    "asset": "https://en.wikipedia.org/wiki/Maltese_dog",
    "target": {
      "@type": "VisualDescription",
      "name": "Maltese",
      "examples": [
        "http://code.sgo.to/dogs/images/n02085936-Maltese_dog/n02085936_10073.jpg",
        "http://code.sgo.to/dogs/images/n02085936-Maltese_dog/n02085936_10148.jpg"
      ]
    }
  }]
}
```

Here is the schema:

# Layer

| Property      | Type                                  | Description                                                      |
| ------------- |:-------------------------------------:| :----------------------------------------------------------------|
| name          | [String](#string)                     | The name of the dataset                                          |
| description   | [String](#string)                     | A short description about the dataset                            |
| url           | [URL](#url)                           | Where this dataset is to be found                                |
| download      | [URL](#url)                           | A link to an [archive](#archive) version of this dataset.        |
| citation      | [Bib](#bib)[]                         | The citation requirements while using this dataset               |
| release       | [String](#string)                     | The release number                                               |
| createdDate   | [Date](#date)                         | The date the dataset was created                                 |
| publishedDate | [Date](#date)                         | The date the dataset was published                               |
| modifiedDate  | [Date](#date)                         | The date the dataset was last modified                           |
| items         | [Artifact](#http://code.sgo.to/arpub#artifact)[] or [URL](#url)[]    | An array of classes in this dataset                              |
      
# VisualDescription

| Property      | Type                                   | Description                                                      |
| ------------- |:--------------------------------------:| :----------------------------------------------------------------|
| name          | [String](#string)                      | The name of the class                                            |
| description   | [String](#string)                      | A short description about the class                              |
| examples      | [Image](#image)[]                      | An array of images in this class                                 |

# Image

| Property      | Type                                   | Description                                                      |
| ------------- |:--------------------------------------:| :----------------------------------------------------------------|
| name          | [String](#string)                      | The name of the class                                            |
| url           | [URL](#url)                            | The url with the bits of the image                               |
| size          | [Size](#size)                          | The size of the image                                            |
| boxes         | [Box](#box)[]                          | An array of bounding boxes where the class appears in the image  |

# Size

| Property      | Type                                   | Description                                                      |
| ------------- |:--------------------------------------:| :----------------------------------------------------------------|
| width         | [Number](#number)                      | The width (in pixels) of the image                               |
| height        | [Number](#number)                      | The height (in pixels) of the image                              |

# Box

| Property      | Type                                   | Description                                                      |
| ------------- |:--------------------------------------:| :----------------------------------------------------------------|
| left          | [Number](#number)                      | The leftmost limit of the bounding box (in pixels)               |
| right         | [Number](#number)                      | The rightmost limit of the bounding box (in pixels)              |
| top           | [Number](#number)                      | The top limit of the bounding box (in pixels)                    |
| bottom        | [Number](#number)                      | The bottom limit of the bounding box (in pixels)                 |

# Bib

A bib description.

# String

A text string.

# Date

A date value in ISO 8601 date format.

# Number

A numeric value.

# URL

A URL.

# Archive

To ease the distribuition of image binaries (which tend to be large, say (1GB)), [Layer](#layer) can be published inside archiveable formats (```.tar.gz```, ```.zip```, etc). [Layers](#layer) have a [download](#download) property which points to a [URL](#url) that you can programatically use to download everything.

By convention, an archiveable [Layer](#layer) contains an ```index.jsonld``` file inside the root directory of the archive, which serves as an entrypoint to any other linked data inside the archive (which can be referenced through relative links).
