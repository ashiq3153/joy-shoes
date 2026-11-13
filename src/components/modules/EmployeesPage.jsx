"use client";

import {useMemo,useState} from "react";

export default function EmployeesPage({shop,rows,onSave,busy,onBack}){
 const [search,setSearch]=useState("");
 const [showForm,setShowForm]=useState(false);
 const [name,setName]=useState("");
 const [phone,setPhone]=useState("");
 const [notes,setNotes]=useState("");
 const filtered=useMemo(()=>rows.filter(row=>{
  const query=search.trim().toLocaleLowerCase();
  return !query||[row.full_name,row.phone].some(value=>String(value||"").toLocaleLowerCase().includes(query));
 }),[rows,search]);
 const submit=event=>{
  event.preventDefault();
  onSave({full_name:name.trim(),phone:phone.trim()||null,notes:notes.trim()||null},()=>{
   setName("");setPhone("");setNotes("");setShowForm(false);
  });
 };
 return <section className="dk-module-page">
  <div className="dk-page-title">
   <button onClick={onBack}>←</button>
   <div><small>EMPLOYEE DIRECTORY</small><h1>কর্মচারী</h1><p>{shop.name} · এই দোকানের কর্মী তালিকা</p></div>
   <button className="dk-add-round" onClick={()=>setShowForm(value=>!value)}>＋</button>
  </div>
  <div className="dk-stats-grid">
   <div className="dk-stat-card green"><span>মোট কর্মচারী</span><b>{rows.length.toLocaleString("bn-BD")} জন</b><small>এই দোকানের তালিকা</small></div>
   <div className="dk-stat-card lilac"><span>কর্মরত</span><b>{rows.filter(row=>row.is_active).length.toLocaleString("bn-BD")} জন</b><small>সক্রিয় কর্মী</small></div>
   <div className="dk-stat-card rose"><span>যোগাযোগ তথ্য</span><b>{rows.filter(row=>row.phone).length.toLocaleString("bn-BD")} জন</b><small>মোবাইল নম্বর যোগ করা</small></div>
  </div>
  {showForm?<div className="dk-panel">
   <div className="dk-section-heading"><h2>＋ নতুন কর্মচারী যোগ করুন</h2><button className="dk-link-button" onClick={()=>setShowForm(false)}>বন্ধ করুন ×</button></div>
   <form className="dk-form" onSubmit={submit}>
    <label className="dk-field"><span>কর্মচারীর নাম *</span><input value={name} onChange={e=>setName(e.target.value)} required minLength={2} placeholder="যেমন: মো. হাসান"/></label>
    <label className="dk-field"><span>মোবাইল নম্বর</span><input value={phone} onChange={e=>setPhone(e.target.value)} inputMode="tel" placeholder="01XXXXXXXXX"/></label>
    <label className="dk-field"><span>নোট (ঐচ্ছিক)</span><textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="পদবি, দায়িত্ব বা অন্যান্য তথ্য"/></label>
    <button className="dk-primary-button" disabled={busy}>{busy?"সংরক্ষণ হচ্ছে…":"কর্মচারী সংরক্ষণ করুন ✓"}</button>
   </form>
  </div>:null}
  <div className="dk-search-box"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="নাম বা মোবাইল দিয়ে খুঁজুন…"/></div>
  <div className="dk-panel">
   <div className="dk-section-heading"><div><small>THIS SHOP ONLY</small><h2>কর্মচারী তালিকা</h2></div><b>{filtered.length} জন</b></div>
   {filtered.length?<div className="dk-record-list">{filtered.map(row=><article className="dk-employee-row" key={row.id}>
    <div className="dk-employee-avatar">{(row.full_name||"ক").trim().slice(0,1)}</div>
    <div className="dk-employee-main"><b>{row.full_name}</b><small>{row.phone||"মোবাইল নম্বর দেওয়া হয়নি"}</small>{row.notes?<small>{row.notes}</small>:null}</div>
    <span className={"dk-employee-status "+(row.is_active?"active":"inactive")}>{row.is_active?"কর্মরত":"নিষ্ক্রিয়"}</span>
   </article>)}</div>:<div className="dk-empty">এই দোকানে এখনো কর্মচারী যোগ করা হয়নি। উপরের ＋ চাপ দিয়ে যোগ করুন।</div>}
   <p className="dk-muted">কর্মচারীর বিক্রির আলাদা attribution এবং বেতন/পেমেন্টের হিসাব পরবর্তী ধাপে যুক্ত হবে।</p>
  </div>
 </section>;
}
