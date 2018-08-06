const express = require('express');
const multer = require('multer');
const ejs = require('ejs');
const path = require('path');
const bodyparser = require('body-parser');
const sharp = require('sharp');

// Set The Storage Engine
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb){
    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init Upload
const upload = multer({
  storage: storage,
  limits:{fileSize: 1000000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('myImage');

// Check File Type
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
}

// Init app
const app = express();

//express body parser middleware
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));
// EJS
app.set('view engine', 'ejs');

// Public Folder
app.use(express.static('./public'));

app.get('/', (req, res) => {res.render('index')
});

// test how to return json object.
app.get('/test', (req, res) => {
    res.render('test');
});


app.post('/upload', (req, res) => {
  upload(req, res, (err) => {

    var width = parseInt(req.body.width);
    var hieght = parseInt(req.body.hieght);

    if(err){
      res.render('index', {
        msg: err
      });
    } else {
      if(req.file == undefined){
        res.render('index', {
          msg: 'Error: No File Selected!'
        });
    } else {
        if(isNaN(width) || isNaN(hieght)){
            res.render('index',{
                msg:'Error : Enter width or hight'
            });
    } else {
          sharp(`./public/uploads/${req.file.filename}`)
          .resize(width,hieght)
          .toFile(`./public/uploads/${req.file.filename}` + 'R' +
          path.extname(req.file.originalname)
          , (err ,info) => {
              if(err){
                  console.log(err);
              }else {
                  res.render('index', {
                    msg: 'File Resized Successfully!',
                   file: `uploads/${req.file.filename}` + 'R'
                   +`${path.extname(req.file.originalname)}`
                  });
              }
          });
      }
    }
}
  });
});

const port = 8080;

app.listen(port, () => console.log(`Server started on port ${port}`));
