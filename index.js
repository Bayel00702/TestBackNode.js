import express from 'express'
import mongoose from "mongoose";
import {delUser, getAllUsers, getOneUser, login, register, resPassword, resUser} from "./controller/user.js";
import handleValidators, {loginUserValidation, resetPasswordValidation} from "./validation/validation.js"
import {registerUserValidation} from "./validation/validation.js";
import checkAuth from './validation/checkAuth.js'
import cloudinary from "cloudinary"
import multer from "multer"
import fs from "node:fs"


const api = express()
api.use(express.json())

const PORT = process.env.PORT || 6666;

mongoose.connect(`mongodb+srv://konurbaevbajel90:qwerty1234@test.ntb1u87.mongodb.net/?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Mongo DB успешно запущен'))
    .catch((err) => console.log('Ошибка при запуске Mongo DB', err));


// user

api.post('/register', register, registerUserValidation, handleValidators )
api.post('/login', login, loginUserValidation, handleValidators)

api.put('/resUser/:id', resUser)
api.post('/resPass', resetPasswordValidation, resPassword, handleValidators, checkAuth)

api.get('/users', getAllUsers)
api.get('/user/:id', getOneUser)

api.delete('/userDel/:id', delUser,checkAuth)




const upload = multer({destination: 'uploads/'});

cloudinary.config({
    cloud_name: 'dvpyhgy2n',
    api_key: '135558996454785',
    api_secret: 'Y2SU-5oikevnMOF3Z5vnCHoa9s0'
});

api.post('/upload/:id', upload.single('file'),(req,res) => {

    const file = req.file;

    if(!file){
        return res.status(400).send('Файл не найден');
    }

    const filename = `${Date.now()}_${file.originalname}`;
    const tempFilePath = `uploads/${filename}`;
    fs.writeFileSync(tempFilePath, file.buffer);


    cloudinary.v2.uploader.upload(tempFilePath, (err,result) => {
        if (err) {
            console.log('Ошибка загрузики файла', err);
            return res.status(500).send('Ошибка загрузки файла')
        }
        fs.unlinkSync(tempFilePath);

        const publicUrl = result.secure_url;
        res.json({
            url: publicUrl
        });
    })
});

api.use('/uploads', express.static('uploads'));

api.post('/reset/upload/:id', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;

        if(!file){
            return res.status(400).send('Файл не найден');
        }

        const filename = `${Date.now()}_${file.originalname}`;
        const tempFilePath = `uploads/${filename}`;
        fs.writeFileSync(tempFilePath, file.buffer);

        cloudinary.v2.uploader.upload(tempFilePath, async (err,result) => {
            if (err) {
                console.log('Ошибка загрузики файла', err);
                return res.status(500).send('Ошибка загрузки файла')
            }
            fs.unlinkSync(tempFilePath);

            const publicUrl = result.secure_url;
            const userId = req.params.id;
            const updatedUser = await UsersModel.findByIdAndUpdate(
                userId,
                { image: publicUrl } ,
                { new: true }
            );

            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json({
                message: 'Image successfully changed',
                user: updatedUser,
            });
        })



    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Failed to update image',
        });
    }
});


api.listen(PORT,()=>{
    console.log(`Сервер запущен на порту http://localhost:${PORT}`)
});