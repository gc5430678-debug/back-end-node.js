const express = require('express')
const route = express.Router()
const joi = require('joi')
const prodet = require('../modul/prodet')
const upload = require("../route/upload")
const axios = require("axios")
const FormData = require("form-data")

// ImageBB
const IMGBB_KEY = "db8f21522ae2d9f129a78346da6429da"
const IMGBB_URL = "https://api.imgbb.com/1/upload"

// ===================== GET ALL =====================
route.get('/', async (req, res) => {
  try {
    const prodecat = await prodet.find()
    res.status(200).json(prodecat)
  } catch (error) {
    res.status(404).json({ masseg: ' is not found ' })
  }
})

// ===================== POST =====================
route.post('/', upload.single("image"), async (req, res) => {
  try {
    const { error } = Valdition(req.body)
    if (error) {
      return res.status(200).json({
        message: error.details[0].message
      })
    }

    if (!req.file) {
      return res.status(400).json({ message: "image required" })
    }

    // رفع الصورة إلى ImageBB (الصيغة الصحيحة)
    const formData = new FormData()
    formData.append("key", IMGBB_KEY)
    formData.append("image", req.file.buffer.toString("base64"))

    const response = await axios.post(IMGBB_URL, formData, {
      headers: formData.getHeaders()
    })

    const imageUrl = response.data.data.url

    const prod = new prodet({
      title: req.body.title,
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
    const product = await prodet.findById(req.params.id)

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
    const product = await prodet.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    // ImageBB لا يدعم الحذف المجاني
    await product.deleteOne()

    res.status(200).json({
      message: "Product deleted successfully (image stored on ImageBB)"
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ===================== PUT =====================
route.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const product = await prodet.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    product.title = req.body.title || product.title

    if (req.file) {
      const formData = new FormData()
      formData.append("key", IMGBB_KEY)
      formData.append("image", req.file.buffer.toString("base64"))

      const response = await axios.post(IMGBB_URL, formData, {
        headers: formData.getHeaders()
      })

      product.image = response.data.data.url
    }

    await product.save()
    res.json(product)

  } catch (err) {
    console.error(err.response?.data || err.message)
    res.status(500).json({ error: err.message })
  }
})

// ===================== VALIDATION =====================
function Valdition(opj) {
  const schema = joi.object({
    title: joi.string().min(3).max(500).required(),
    image: joi.string()
  })

  return schema.validate(opj)
}

module.exports = route
