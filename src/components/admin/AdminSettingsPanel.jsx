import React,{useEffect,useState} from 'react'
import {supabase} from '../../lib/supabase'
export default function AdminSettingsPanel({kind}){
 const availability=kind==='availability',table=availability?'appointment_settings':'business_settings';const [value,setValue]=useState({}),[message,setMessage]=useState('');
 useEffect(()=>{const query=availability?supabase.from(table).select('*').eq('id',1).maybeSingle():supabase.from(table).select('*').limit(1).maybeSingle();query.then(({data,error})=>{if(error){console.error('[Admin settings] load error',error);setMessage(error.message)}else if(data)setValue(data);else setMessage('No hay ajustes guardados.')})},[availability,table]);
 const set=(k,v)=>setValue(x=>({...x,[k]:v}));const save=async e=>{e.preventDefault();if(!value.id)return setMessage('DetallesGuardar.');const {error}=await supabase.from(table).update(value).eq('id',value.id);if(error){console.error('[Admin settings] save error',error);setMessage(error.message)}else setMessage('DetallesGuardar Detalles')};
 return <section className="admin-panel"><form className="settings-form" onSubmit={save}>{availability?<><label>Hora de apertura<input type="time" value={value.opening_time||''} onChange={e=>set('opening_time',e.target.value)}/></label><label>Hora de cierre<input type="time" value={value.closing_time||''} onChange={e=>set('closing_time',e.target.value)}/></label><label>Inicio del descanso<input type="time" value={value.break_start||''} onChange={e=>set('break_start',e.target.value)}/></label><label>Fin del descanso<input type="time" value={value.break_end||''} onChange={e=>set('break_end',e.target.value)}/></label><label>Detalles<input type="number" value={value.appointment_interval||30} onChange={e=>set('appointment_interval',Number(e.target.value))}/></label><label>Días laborables<input value={(value.working_days||[]).join(',')} onChange={e=>set('working_days',e.target.value.split(',').map(Number).filter(Boolean))}/></label><label className="full">Días libres<input value={(value.days_off||[]).join(',')} onChange={e=>set('days_off',e.target.value.split(',').map(x=>x.trim()).filter(Boolean))}/></label></>:<><label>Nombre del local<input value={value.business_name||''} onChange={e=>set('business_name',e.target.value)}/></label><label>WhatsApp<input value={value.whatsapp_number||''} onChange={e=>set('whatsapp_number',e.target.value)}/></label><label>Google Maps URL<input value={value.google_maps_url||''} onChange={e=>set('google_maps_url',e.target.value)}/></label><label>Dirección<input value={value.address||''} onChange={e=>set('address',e.target.value)}/></label><label className="full">Descripción<textarea value={value.description||''} onChange={e=>set('description',e.target.value)}/></label></>}<button className="primary full">Guardar</button>{message&&<div className="admin-banner full">{message}</div>}</form></section>
}










