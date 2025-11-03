import {GoogleGenerativeAI} from '@google/generative-ai';

export class GeminiService{
  constructor(){
    if(!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set');
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  async generateMCQs({fileUri, mimeType, questionCount, difficulty}){
    try{
      const model = this.genAI.getGenerativeModel({model:'gemini-2.0-flash-exp'});
      const prompt = `Generate ${questionCount} ${difficulty} MCQs. Return JSON: [{"question":"Q?","options":["A","B","C","D"],"correct":0,"explanation":"E"}]`;
      const response = await model.generateContent([prompt, {inlineData:{mimeType, data:fileUri}}]);
      const text = response.response.text();
      const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if(!jsonMatch) throw new Error('Invalid response');
      return JSON.parse(jsonMatch[0]);
    }catch(e){
      throw new Error(`Generation failed: ${e.message}`);
    }
  }
}
