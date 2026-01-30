const express = require('express')
const route = express.Router()
const joi = require('joi')
const homeimage = require('../modul/homeimage')
const uploadhome = require("../home/uplodhome")
const FormData = require("form-data")
const axios = require("axios")




// ImageBB API
const IMGBB_KEY = "db8f21522ae2d9f129a78346da6429da"
const IMGBB_URL = "https://api.imgbb.com/1/upload"

// ===================== GET ALL =====================
route.get('/', async (req, res) => {
  try {
    const prodecat = await homeimage.find()
    res.status(200).json(prodecat)
  } catch (error) {
    res.status(404).json({ masseg: ' is not found ' })
  }
})

// ===================== POST =====================
route.post("/", uploadhome.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "image required" })
    }

    const formData = new FormData()
    formData.append("key", IMGBB_KEY)
    formData.append("image", req.file.buffer.toString("base64"))

    const response = await axios.post(IMGBB_URL, formData, {
      headers: formData.getHeaders(),
    })

    const imageUrl = response.data.data.url

    const prod = new homeimage({
      image: imageUrl
    })

    await prod.save()
    res.status(200).json(prod)

  } catch (err) {
    console.error(err.response?.data || err.message)
    res.status(500).json({ error: err.message })
  }
})

// ===================== GET BY ID =====================
route.get("/:id", async (req, res) => {
  try {
    const product = await homeimage.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json(product)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ===================== DELETE =====================
route.delete("/:id", async (req, res) => {
  try {
    const product = await homeimage.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    await product.deleteOne()

    res.status(200).json({
      message: "تم حذف المنتج (الصورة محفوظة في ImageBB)"
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ===================== PUT =====================
route.put("/:id", uploadhome.single("image"), async (req, res) => {
  try {
    const product = await homeimage.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    if (req.file) {
      const base64Image = req.file.buffer.toString("base64")

      const response = await axios.post(IMGBB_URL, null, {
        params: {
          key: IMGBB_KEY,
          image: base64Image
        }
      })

      product.image = response.data.data.url
    }

    await product.save()
    res.json(product)

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ===================== VALIDATION =====================
function Valdition(opj) {
  const schema = joi.object({
    image: joi.string()
  })
  return schema.validate(opj)
}

module.exports = route
