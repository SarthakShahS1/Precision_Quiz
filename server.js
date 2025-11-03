import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import geminiRoutes from './routes/gemini.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:8000').split(',')}));
app.use('/api/', rateLimit({windowMs: 15*60*1000, max: 100}));
app.use(express.json({limit:'10mb'}));
app.use('/api', geminiRoutes);

app.get('/health', (req,res)=>{res.json({status:'ok', geminiConfigured:!!process.env.GEMINI_API_KEY, version:'3.0.0'})});

app.listen(PORT, ()=>{
  console.log(`🚀 Precision Quiz Server v3.0.0`);
  console.log(`📡 http://localhost:${PORT}`);
  console.log(`🔑 Gemini: ${process.env.GEMINI_API_KEY?'✅':'❌'}`);
});
