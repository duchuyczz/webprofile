require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();

app.use(cors());                    // Cho phép frontend gọi API
app.use(express.json());            // Đọc body dạng JSON

app.use('/api/auth', authRoutes);   // Gắn route

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server đang chạy tại http://localhost:${process.env.PORT || 3000}`);
});