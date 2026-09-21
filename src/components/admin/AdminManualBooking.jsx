import React,{useEffect,useState} from 'react'
import {supabase} from '../../lib/supabase'
export default function AdminManualBooking({services,onCreated}){const [ids,setIds]=useState([]),[date,setDate]=useState(''),[slots,setSlots]=useState([]),[time,setTime]=useState(''),[form,setForm]=useState({name:'',phone:'',note:''}),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);const chosen=services.filter(s=>ids.includes(s.id));useEffect(()=>{if(!date||!ids.length)return setSlots([]);supabase.rpc('get_multi_service_available_slots',{p_date:date,p_service_ids:ids}).then(({data,error})=>{if(error)setMessage(error.message);else setSlots((data||[]).map(x=>x.slot||x))})},[date,ids.join(',')]);const submit=async e=>{e.preventDefault();setBusy(true);setMessage('');const {error}=await supabase.rpc('create_multi_service_appointment',{p_customer_name:form.name,p_customer_phone:form.phone,p_service_ids:ids,p_appointment_date:date,p_appointment_time:time,p_note:form.note||null});if(error)setMessage(error.message);else{setMessage('DetallesReservas Detalles');setIds([]);setDate('');setTime('');setForm({name:'',phone:'',note:''});onCreated()}setBusy(false)};return <details className="admin-manual"><summary>Añadir reserva manual</summary><form className="admin-product-form" onSubmit={submit}><input required placeholder="Nombre del cliente" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><input required placeholder="Teléfono" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/><div className="full service-select-grid">{services.map(s=><button type="button" className={ids.includes(s.id)?'service-choice chosen':'service-choice'} onClick={()=>setIds(x=>x.includes(s.id)?x.filter(i=>i!==s.id):x.length<5?[...x,s.id]:x)} key={s.id}>{ids.includes(s.id)?'✓':'+'} {s.name}</button>)}</div><input required type="date" value={date} min={new Date().toISOString().slice(0,10)} onChange={e=>{setDate(e.target.value);setTime('')}}/><select required value={time} onChange={e=>setTime(e.target.value)}><option value="">DetallesHora</option>{slots.map(s=><option key={s}>{s}</option>)}</select><textarea className="full" placeholder="Nota" value={form.note} onChange={e=>setForm({...form,note:e.target.value})}/>{message&&<div className="admin-banner full">{message}</div>}<button className="primary full" disabled={busy||!ids.length}>{busy?'Cargando DetallesGuardar...':'Guardar Reservas'}</button></form></details>}










