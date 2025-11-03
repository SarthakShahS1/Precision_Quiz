import express from 'express';
import multer from 'multer';
import { GeminiService } from '../lib/gemini.js';
import { validateFile, validateMcqRequest } from '../lib/validators.js';

const router = express.Router();
const upload = multer({storage: multer.memoryStorage(), limits:{fileSize:50*1024*1024}});
const geminiService = new GeminiService();

router.post('/files', upload.single('document'), async(req,res)=>{
  try{
    if(!req.file) return res.status(400).json({success:false, error:'No file'});
    const validation = validateFile(req.file);
    if(!validation.success) return res.status(400).json({success:false, error:validation.error});
    console.log(`📤 Uploading: ${req.file.originalname}`);
    const result = await geminiService.uploadFile(req.file);
    res.json({success:true, file:{name:result.name, uri:result.uri, mimeType:result.mimeType, displayName:req.file.originalname}});
  }catch(e){
    console.error('❌ Error:', e.message);
    res.status(500).json({success:false, error:e.message});
  }
});

router.post('/generate-mcqs', async(req,res)=>{
  try{
    const validation = validateMcqRequest(req.body);
    if(!validation.success) return res.status(400).json({success:false, error:validation.error});
    console.log(`🎯 Generating ${req.body.questionCount} MCQs...`);
    const mcqs = await geminiService.generateMCQs(req.body);
    res.json({success:true, mcqs});
  }catch(e){
    console.error('❌ Error:', e.message);
    res.status(500).json({success:false, error:e.message});
  }
});

export default router;
