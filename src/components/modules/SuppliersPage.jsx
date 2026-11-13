"use client";

import {useMemo,useState} from "react";
import {money} from "../../lib/dokankhata/format";

export default function SuppliersPage({shop,rows,ledger,onSave,busy,onBack}){
 const [search,setSearch]=useState("");
 const [showForm,setShowForm]=useState(false);
 const [person,setPerson]=useState("");
 const [business,setBusiness]=useState("");
 const [phone,setPhone]=useState("");
 const [address,setAddress]=useState("");
 const [location,setLocation]=useState("");
 const [opening,setOpening]=useState("0");
 const [notes,setNotes]=useState("");
 const balances=new Map(ledger.map(item=>[item.supplier_id,item]));
 const filtered=useMemo(()=>rows.filter(row=>{
  const query=search.trim().toLocaleLowerCase();
  return !query||[row.owner_name,row.shop_name,row.phone,row.address]
   .some(value=>String(value||"").toLocaleLowerCase().includes(query));
 }),[rows,search]);
 const submit=event=>{
  event.preventDefault();
  onSave({
   owner_name:person.trim(),
   shop_name:business.trim()||null,
   phone:phone.trim()||null,
   address:address.trim()||null,
   location_text:location.trim()||null,
   opening_balance:Number(opening||0),
   notes:notes.trim()||null
  },()=>{
   setPerson("");setBusiness("");setPhone("");setAddress("");setLocation("");
   setOpening("0");setNotes("");setShowForm(false);
  });
 };
 const totalDue=ledger.reduce((sum,item)=>sum+Number(item.outstanding_balance||0),0);
 return <section className="dk-module-page">
  <div className="dk-page-title">
   <button onClick={onBack}>←</button>
   <div><small>SUPPLIER DIRECTORY</small><h1>মহাজন ও সরবরাহকারী</h1><p>{shop.name} · শুধু এই দোকানের তালিকা</p></div>
   <button className="dk-add-round" onClick={()=>setShowForm(value=>!value)}>＋</button>
  </div>
  <div className="dk-stats-grid">
   <div className="dk-stat-card green"><span>মহাজন</span><b>{rows.length.toLocaleString("bn-BD")} জন</b><small>এই দোকানের তালিকা</small></div>
   <div className="dk-stat-card rose"><span>মোট বাকি</span><b>{money(totalDue)}</b><small>ক্রয়, পেমেন্ট ও সমন্বয় অনুযায়ী</small></div>
   <div className="dk-stat-card lilac"><span>বাকি আছে</span><b>{ledger.filter(item=>Number(item.outstanding_balance||0)>0).length.toLocaleString("bn-BD")} জন</b><small>হিসাবের ভিউ থেকে</small></div>
  </div>
  {showForm?<div className="dk-panel">
   <div className="dk-section-heading"><h2>＋ নতুন মহাজন যোগ করুন</h2><button className="dk-link-button" onClick={()=>setShowForm(false)}>বন্ধ করুন ×</button></div>
   <form className="dk-form" onSubmit={submit}>
    <label className="dk-field"><span>মহাজনের / যোগাযোগ ব্যক্তির নাম *</span><input value={person} onChange={e=>setPerson(e.target.value)} required placeholder="যেমন: মো. রহিম"/></label>
    <label className="dk-field"><span>প্রতিষ্ঠান / দোকানের নাম</span><input value={business} onChange={e=>setBusiness(e.target.value)} placeholder="যেমন: রহিম ট্রেডার্স"/></label>
    <label className="dk-field"><span>মোবাইল নম্বর</span><input value={phone} onChange={e=>setPhone(e.target.value)} inputMode="tel" placeholder="01XXXXXXXXX"/></label>
    <label className="dk-field"><span>ঠিকানা</span><textarea value={address} onChange={e=>setAddress(e.target.value)} rows={2} placeholder="মহাজনের ঠিকানা"/></label>
    <label className="dk-field"><span>এলাকা / অবস্থান</span><input value={location} onChange={e=>setLocation(e.target.value)} placeholder="যেমন: গুলিস্তান"/></label>
    <label className="dk-field"><span>শুরুর বাকি (টাকা)</span><input type="number" min="0" step=".01" value={opening} onChange={e=>setOpening(e.target.value)} required/></label>
    <label className="dk-field"><span>নোট (ঐচ্ছিক)</span><textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2}/></label>
    <button className="dk-primary-button" disabled={busy}>{busy?"সংরক্ষণ হচ্ছে…":"মহাজনের তথ্য সংরক্ষণ করুন ✓"}</button>
   </form>
  </div>:null}
  <div className="dk-search-box"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="নাম, দোকান বা মোবাইল দিয়ে খুঁজুন…"/></div>
  <div className="dk-panel">
   <div className="dk-section-heading"><div><small>THIS SHOP ONLY</small><h2>মহাজনের তালিকা</h2></div><b>{filtered.length} জন</b></div>
   {filtered.length?<div className="dk-record-list">{filtered.map(row=>{
    const item=balances.get(row.id);
    const due=Number(item?.outstanding_balance??row.opening_balance??0);
    return <article className="dk-supplier-card" key={row.id}>
     <div className="dk-supplier-mark">৳</div>
     <div className="dk-supplier-main"><b>{row.shop_name||row.owner_name}</b><small>{row.shop_name?row.owner_name+" · ":""}{row.phone||"মোবাইল নম্বর নেই"}</small><small>{row.address||row.location_text||"ঠিকানা দেওয়া হয়নি"}</small></div>
     <div className="dk-supplier-due"><small>বর্তমান বাকি</small><strong className={due>0?"outcome-text":"income-text"}>{money(due)}</strong></div>
    </article>;
   })}</div>:<div className="dk-empty">এই দোকানে এখনো কোনো মহাজন নেই। উপরের ＋ চাপ দিয়ে প্রথম মহাজন যোগ করুন।</div>}
   <p className="dk-muted">এখানে মহাজনের তালিকা ও বর্তমান বাকি দেখানো হচ্ছে। মাল কেনা ও পেমেন্টের পূর্ণ হিসাব আলাদা মডিউলে যুক্ত হবে।</p>
  </div>
 </section>;
}
