import React,{useEffect,useMemo,useState} from 'react'
import {ArrowLeft,Clock3} from 'lucide-react'
import {supabase} from '../lib/supabase'

export default function BookingMulti({services,serviceError,setBooking,booking}){
 const [ids,setIds]=useState([]),[date,setDate]=useState(''),[time,setTime]=useState(''),[slots,setSlots]=useState([]),[slotsLoading,setSlotsLoading]=useState(false),[form,setForm]=useState({name:'',phone:'',note:''}),[error,setError]=useState(''),[loading,setLoading]=useState(false)
 const chosen=useMemo(()=>services.filter(s=>ids.includes(s.id)),[services,ids])
 const selectedDate=date
 const selectedTime=time
 console.log("3 SLOTS STATE:",slots)
 console.log("4 SLOTS COUNT:",slots?.length)
 console.log('BOOKING SELECTED DATE:',selectedDate)
 console.log('BOOKING SELECTED TIME:',selectedTime)
 useEffect(()=>{console.log('=== FINAL SLOTS STATE ===',slots)},[slots])
 const total=chosen.reduce((n,s)=>n+Number(s.price||0),0),duration=chosen.reduce((n,s)=>n+Number(s.duration_minutes||0),0)
 const isSupabaseUuid=id=>typeof id==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
 const toggle=id=>{if(!isSupabaseUuid(id)){setError('Este servicio aún no está disponible desde Supabase.');return}setIds(x=>x.includes(id)?x.filter(v=>v!==id):x.length<5?[...x,id]:x)}
 useEffect(()=>{if(!date||!ids.length||!supabase){setSlots([]);setSlotsLoading(false);return}if(ids.some(id=>!isSupabaseUuid(id))){setSlots([]);setSlotsLoading(false);setError('Selecciona un servicio válido.');return}if(!/^\d{4}-\d{2}-\d{2}$/.test(date)){setSlots([]);setError('Selecciona una fecha válida.');return}let cancelled=false;setSlots([]);setSlotsLoading(true);setError('');const rpcParams={p_date:date,p_service_ids:ids};console.log("=== AVAILABILITY REQUEST ===",{date,ids,selectedServices:chosen,serviceIds:ids});console.log('RPC PARAMETERS',{p_date:rpcParams.p_date,p_service_ids:rpcParams.p_service_ids});console.log('RPC PARAMETERS DETAILS:',{p_date:date,p_service_ids:ids,dateType:typeof date,serviceIdsAreArray:Array.isArray(ids),serviceIds:ids});console.log('FINAL RPC SERVICE IDS:',ids);supabase.rpc('get_multi_service_available_slots',rpcParams).then(({data,error})=>{console.log("=== AVAILABILITY RESPONSE ===",{data,error,dataLength:data?.length});if(error){console.error('BOOKING AVAILABILITY RPC ERROR',error);console.error('RPC ERROR DETAILS:',{message:error?.message,details:error?.details,hint:error?.hint,code:error?.code,name:error?.name,error});setError(error.message);setSlots([])}else {const mappedSlots=(Array.isArray(data)?data:[]).map(item=>{const raw=typeof item==='string'?item:item?.slot;return typeof raw==='string'?raw.slice(0,5):null}).filter(Boolean);console.log("=== MAPPED SLOTS ===",mappedSlots);setSlots(mappedSlots)}}).finally(()=>{if(!cancelled)setSlotsLoading(false)});return()=>{cancelled=true}},[date,ids.join(',')])
 const submit=async e=>{e.preventDefault();if(!ids.length||!date||!time||!form.name||!form.phone)return setError('Selecciona tus servicios, fecha y hora, e introduce tus datos.');setLoading(true);setError('');const {data,error}=await supabase.rpc('create_multi_service_appointment',{p_customer_name:form.name,p_customer_phone:form.phone,p_service_ids:ids,p_appointment_date:date,p_appointment_time:time,p_note:form.note||null});if(error)setError(error.message);else setBooking({name:form.name,date,time,status:'Pendiente de confirmación',services:chosen.map(s=>s.name).join(', '),total,duration,id:data?.id});setLoading(false)}
 if(booking)return <main className="page success"><div className="success-mark">✓</div><div className="eyebrow gold">Reserva enviada correctamente</div><h1>Pendiente de <i>confirmación.</i></h1><p>Gracias, {booking.name}. Te contactaremos para confirmar tu cita.</p><div className="confirmation"><span>Servicios<b>{booking.services}</b></span><span>Fecha<b>{booking.date}</b></span><span>Hora<b>{booking.time}</b></span><span>Total<b>{booking.total} €</b></span><span>Duración<b>{booking.duration} min</b></span><span>Estado<b>{booking.status}</b></span></div><button className="primary" onClick={()=>setBooking(null)}>Reservar otra cita <ArrowLeft/></button></main>
 return <main className="page booking-page"><div className="page-title"><div className="eyebrow gold">Reserva tu cita</div><h1>Tu estilo,<br/><i>nuestra pasión.</i></h1><p>Completa los pasos y nos ocuparemos del resto.</p></div><form className="booking-form" onSubmit={submit}><div className="booking-step full"><span className="booking-step-number">1</span><div><strong>Selecciona tus servicios</strong><small>Puedes elegir hasta cinco servicios.</small></div></div><div className="full service-select-grid">{!services.length?<div className="empty booking-services-empty">{serviceError||'Cargando servicios...'}</div>:services.map(s=><button type="button" className={ids.includes(s.id)?'service-choice chosen':'service-choice'} onClick={()=>toggle(s.id)} key={s.id}><span>{ids.includes(s.id)?'✓':'+'}</span><b>{s.name}</b><small>{s.price} € · {s.duration_minutes} min</small></button>)}</div>{chosen.length>0&&<div className="booking-summary full"><span>Total<b>{total} €</b></span><span><Clock3 size={14}/> Duración<b>{duration} min</b></span></div>}<div className="booking-step full"><span className="booking-step-number">2</span><div><strong>Elige la fecha</strong><small>Selecciona el día que prefieras.</small></div></div><label className="full">Fecha<input required type="date" min={new Date().toISOString().split('T')[0]} value={date} onChange={e=>{setDate(e.target.value);setTime('')}}/></label><div className="booking-step full"><span className="booking-step-number">3</span><div><strong>Elige la hora</strong><small>Consulta los horarios disponibles.</small></div></div><div className="full"><div className="times">{slots.map(t=><button type="button" className={time===t?'chosen':''} onClick={()=>setTime(t)} key={t}>{t}</button>)}</div>{slotsLoading&&<small className="field-hint">Buscando horarios disponibles...</small>}{!slotsLoading&&date&&!slots.length&&<small className="field-error">No hay horarios disponibles para esta selección.</small>}</div><div className="booking-step full"><span className="booking-step-number">4</span><div><strong>Introduce tus datos</strong><small>Los utilizaremos para confirmar tu reserva.</small></div></div><label>Nombre<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Tu nombre completo"/></label><label>Teléfono<input required value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+34 600 000 000"/></label><label className="full">Comentario <span className="optional">(opcional)</span><textarea value={form.note} onChange={e=>setForm({...form,note:e.target.value})} placeholder="¿Quieres añadir algún comentario?"/></label>{error&&<div className="admin-error full">{error}</div>}<div className="booking-step full"><span className="booking-step-number">5</span><div><strong>Confirma tu reserva</strong><small>Revisa tus datos y envía la solicitud.</small></div></div><button className="primary full" type="submit" disabled={loading}>{loading?'Enviando reserva...':'Confirmar reserva'} <ArrowLeft/></button></form></main>
}




















