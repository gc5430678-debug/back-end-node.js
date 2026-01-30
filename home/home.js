const express = require('express')
const route = express.Router();
const joi = require('joi')
const homeimage = require('../modul/homeimage')
const uploadhome = require("../home/uplodhome");
const path = require('path')
const fs = require("fs");




//get
route.get('/', async (req, res) => {
    try {
        const prodecat = await homeimage.find();
         
 res.status(200).json(prodecat)

    } catch (error) {
        res.status(404).json({masseg:' is not found '})
    }
})





//post
route.post('/',uploadhome.single("image"), async (req, res) => {

    const { error } = Valdition(req.body)
    if (error) {
        return res.status(200).json({
            message: error.details[0].message
        })
    }
    const prod = new homeimage({
       
      image: `/uplodhome/${req.file.filename}`, // نخزن الرابط فقط
        
    })
    await prod.save();
    res.status(200).json(prod)
    
})

//get:id

route.get("/:id", async (req, res) => {
  // فالديشن
 

  try {
    const product = await homeimage.findByIdAndUpdate(
      req.params.id,
    
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//delete

route.delete("/:id", async (req, res) => {
  try {
    const product = await homeimage.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.image) {
      const imagePath = path.join(
        __dirname,
        "../uplodhome",
        path.basename(product.image)
      );

      // تحقق قبل الحذف
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await product.deleteOne();

    res.status(200).json({
      message: "تم حذف المنتج والصورة بنجاح ✅"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});









//put 


// تحديث المنتج + الصورة
route.put("/:id", uploadhome.single("image"), async (req, res) => {
  try {
    const product = await homeimage.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // حذف الصورة القديمة إذا تم رفع صورة جديدة
    if (req.file && product.image) {
      const oldImagePath = path.join(__dirname, "../", product.image);
      fs.unlink(oldImagePath, (err) => {
        if (err) console.log("Error deleting old image:", err);
      });
    }

    // تحديث البيانات
    product.title = req.body.title || product.title;
    product.price = req.body.price || product.price;
    if (req.file) {
      product.image = `/uplodhome/${req.file.filename}`;
    }

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});





//valdit to put

function valdit(opj) {
    const schema = joi.object({
         
        image: joi.string(),
    
    })
    return schema.validate(opj)
}




//Valdition to post
function Valdition(opj) {

    const schema = joi.object({
      
        image: joi.string()
    
    })
    
    return schema.validate(opj);
}

module.exports = route