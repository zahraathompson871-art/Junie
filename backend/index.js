const express = require('express');
const cors = require('cors');
require ('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/",(req,res)=>{
    res.status(200).json({
        message:"API running",
    })
});

app.use((req,res)=>{
    res.status(404).json({
        error:"Route not found",
    })
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in port $P{PORT}`);
})