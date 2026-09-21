import {supabase} from '../lib/supabase'

export function validateImage(file){
  if(!file) return 'No se ha seleccionado ninguna imagen.'
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)) return 'Formatos permitidos: JPG, PNG y WEBP.'
  if(file.size>5*1024*1024) return 'La imagen debe pesar menos de 5 MB.'
  return null
}
export async function uploadImage(file,bucket,folder='uploads'){
  const validation=validateImage(file); if(validation) throw new Error(validation)
  if(!supabase) throw new Error('Supabase no está conectado.')
  const safe=file.name.toLowerCase().replace(/[^a-z0-9.]+/g,'-')
  const path=`${folder}/${crypto.randomUUID()}-${safe}`
  const {error}=await supabase.storage.from(bucket).upload(path,file,{upsert:false,contentType:file.type})
  if(error) throw error
  const {data}=supabase.storage.from(bucket).getPublicUrl(path)
  return {path,url:data.publicUrl}
}
export async function removeImage(bucket,path){
  if(!path||!supabase) return
  const clean=path.includes('/storage/v1/object/public/')?path.split(`/storage/v1/object/public/${bucket}/`)[1]:path
  if(clean) await supabase.storage.from(bucket).remove([clean])
}








