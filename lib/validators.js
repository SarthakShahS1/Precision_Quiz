export function validateFile(file){
  if(!file) return {success:false, error:'No file'};
  if(file.size > 50*1024*1024) return {success:false, error:'Too large'};
  const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if(!allowed.includes(file.mimetype) && !/\.(pdf|docx)$/i.test(file.originalname))
    return {success:false, error:'Only PDF/DOCX'};
  return {success:true};
}

export function validateMcqRequest(body){
  if(!body.fileUri && !body.fileBuffer) return {success:false, error:'fileUri required'};
  if(!body.mimeType) return {success:false, error:'mimeType required'};
  const count = parseInt(body.questionCount);
  if(isNaN(count) || count<1 || count>20) return {success:false, error:'Invalid count'};
  if(!['easy','medium','hard'].includes(body.difficulty)) return {success:false, error:'Invalid difficulty'};
  return {success:true};
}
