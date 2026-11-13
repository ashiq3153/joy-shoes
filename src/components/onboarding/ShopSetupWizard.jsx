"use client";
import {useState} from "react";
import {SHOP_CATEGORIES} from "../../lib/dokankhata/constants";
export default function ShopSetupWizard({onCreate,onCancel,busy,initialName=""}){
 const [step,setStep]=useState(1),[category,setCategory]=useState("footwear"),[name,setName]=useState(initialName),[phone,setPhone]=useState(""),[address,setAddress]=useState(""),[logo,setLogo]=useState(null),[cover,setCover]=useState(null);
 return <main className="dk-setup-page"><div className="dk-setup-top"><span className="dk-brand-mini">DokanKhata</span>{onCancel?<button className="dk-text-button" onClick={onCancel}>ফিরে যান</button>:null}</div>
  <div className="dk-setup-progress"><i className="active"/><i className={step===2?"active":""}/><span>ধাপ {step} / ২</span></div>
  {step===1?<section className="dk-setup-card"><div className="dk-setup-emoji">🏪</div><span className="dk-eyebrow">SHOP SETUP · 01</span><h1>আপনার দোকানের ধরন<br/>নির্বাচন করুন</h1><p>ব্যবসার ধরন অনুযায়ী দোকানের হিসাব সাজানো হবে।</p>
   <div className="dk-category-grid">{SHOP_CATEGORIES.map(item=><button key={item.id} type="button" className={"dk-category-card "+(category===item.id?"selected":"")} onClick={()=>setCategory(item.id)}><span>{item.icon}</span><b>{item.title}</b><small>{item.description}</small>{category===item.id?<em>✓</em>:null}</button>)}</div>
   <button className="dk-primary-button" onClick={()=>setStep(2)}>এগিয়ে যান <span>→</span></button>
  </section>:<section className="dk-setup-card"><div className="dk-setup-emoji">📝</div><span className="dk-eyebrow">SHOP SETUP · 02</span><h1>আপনার দোকানের<br/>তথ্য দিন</h1><p>পরে দোকানের প্রোফাইল থেকে সব তথ্য ও ছবি পরিবর্তন করতে পারবেন।</p>
   <div className="dk-media-pickers">
    <label className="dk-media-cover"><span>দোকানের ব্যানার ছবি (ঐচ্ছিক)</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setCover(e.target.files?.[0]||null)}/><b>＋ {cover?.name||"ছবি নির্বাচন করুন"}</b></label>
    <label className="dk-media-logo"><span>লোগো / প্রোফাইল ছবি</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setLogo(e.target.files?.[0]||null)}/><b>＋ {logo?.name||"ছবি নির্বাচন"}</b></label>
   </div>
   <form className="dk-form" onSubmit={e=>{e.preventDefault();onCreate({name:name.trim(),category,phone:phone.trim(),address:address.trim(),logo,cover});}}>
    <label className="dk-field"><span>দোকানের নাম *</span><input value={name} onChange={e=>setName(e.target.value)} placeholder="যেমন: JOY SHOES" required minLength={2} maxLength={100}/></label>
    <label className="dk-field"><span>মোবাইল নম্বর</span><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="01XXXXXXXXX" inputMode="tel"/></label>
    <label className="dk-field"><span>দোকানের ঠিকানা</span><textarea value={address} onChange={e=>setAddress(e.target.value)} placeholder="এলাকা, থানা, জেলা" rows={2}/></label>
    <button className="dk-primary-button" type="submit" disabled={busy}>{busy?"দোকান তৈরি হচ্ছে…":"দোকান তৈরি করুন ✓"}</button>
   </form><button className="dk-text-button dk-back-step" onClick={()=>setStep(1)}>← দোকানের ধরন পরিবর্তন</button>
  </section>}
 </main>;
}
