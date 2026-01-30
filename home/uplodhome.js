const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
    destination: (req, file, cp) => {
        cp(null , "uplodhome/")
    },
    filename: (req, file, cp) => {
        cp(null , Date.now() + path.extname(file.originalname))
    }

    
})

const uplodhome = multer({ storage })

module.exports = uplodhome;