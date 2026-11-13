"use client";
import {useEffect,useState} from "react";
import {SHOP_CATEGORIES} from "../../lib/dokankhata/constants";
export default function ShopSetupWizard({onCreate,onCancel,busy,initialName=""}){
 const [step,setStep]=useState(1),[category,setCategory]=useState("footwear"),[name,setName]=useState(initialName),[phone,setPhone]=useState(""),[address,setAddress]=useState(""),[logo,setLogo]=useState(null),[cover,setCover]=useState(null),[logoPreview,setLogoPreview]=useState(""),[coverPreview,setCoverPreview]=useState("");
 useEffect(()=>()=>{if(logoPreview)URL.revokeObjectURL(logoPreview);if(coverPreview)URL.revokeObjectURL(coverPreview);},[logoPreview,coverPreview]);
 const chooseFile=(file,kind)=>{
  if(kind==="logo"){if(logoPreview)URL.revokeObjectURL(logoPreview);setLogo(file);setLogoPreview(file?URL.createObjectURL(file):"");}
  else{if(coverPreview)URL.revokeObjectURL(coverPreview);setCover(file);setCoverPreview(file?URL.createObjectURL(file):"");}
 };
 return <main className="dk-setup-page">
  <div className="dk-setup-top"><span className="dk-brand-mini"><span>▤</span> DokanKhata</span>{onCancel?<button className="dk-setup-back" onClick={onCancel}>← ফিরে যান</button>:null}</div>
  <div className="dk-setup-progress"><div className="dk-setup-step-dots"><i className="active"/><i className={step===2?"active":""}/></div><span>ধাপ {step} / ২</span></div>
  {step===1?<section className="dk-setup-card">
   <div className="dk-setup-hero-icon">🏪</div><span className="dk-eyebrow">SHOP SETUP · 01</span>
   <h1>আপনার দোকানের ধরন<br/>নির্বাচন করুন</h1><p>আপনার ব্যবসার ধরন অনুযায়ী DokanKhata সাজিয়ে দেওয়া হবে।</p>
   <div className="dk-category-grid">{SHOP_CATEGORIES.map(item=><button key={item.id} type="button" className={"dk-category-card "+(category===item.id?"selected":"")} onClick={()=>setCategory(item.id)}><span>{item.icon}</span><b>{item.title}</b><small>{item.description}</small>{category===item.id?<em>✓</em>:null}</button>)}</div>
   <button className="dk-primary-button dk-setup-next" onClick={()=>setStep(2)}>এগিয়ে যান <span>→</span></button>
  </section>:<section className="dk-setup-card">
   <div className="dk-setup-hero-icon">📝</div><span className="dk-eyebrow">SHOP SETUP · 02</span>
   <h1>আপনার দোকানের<br/>তথ্য দিন</h1><p>দোকানের ছবি ও তথ্য যোগ করুন। পরে প্রোফাইল থেকে পরিবর্তন করতে পারবেন।</p>
   <div className="dk-setup-media-preview">
    <div className="dk-setup-cover-preview" style={coverPreview?{backgroundImage:"linear-gradient(90deg,rgba(0,55,36,.12),rgba(0,55,36,.12)),url("+coverPreview+")"}:undefined}>
     {!coverPreview?<div><span>▧</span><b>আপনার দোকানের ব্যানার ছবি</b><small>একটি সুন্দর কভার ছবি নির্বাচন করুন</small></div>:null}
     <label className="dk-camera-upload"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>chooseFile(e.target.files?.[0]||null,"cover")}/><span>📷</span><b>{cover?"ব্যানার পরিবর্তন":"ব্যানার যোগ করুন"}</b></label>
    </div>
    <div className="dk-setup-logo-row"><div className="dk-setup-logo-preview">{logoPreview?<img src={logoPreview} alt="দোকানের লোগো প্রিভিউ"/>:<span>{name.trim().slice(0,1)||"দ"}</span>}<label><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>chooseFile(e.target.files?.[0]||null,"logo")}/>📷</label></div><div><b>দোকানের লোগো / প্রোফাইল ছবি</b><small>বর্গাকার বা গোল ছবি · সর্বোচ্চ ৫ MB</small></div></div>
   </div>
   <form className="dk-form dk-setup-form" onSubmit={e=>{e.preventDefault();onCreate({name:name.trim(),category,phone:phone.trim(),address:address.trim(),logo,cover});}}>
    <label className="dk-field"><span>দোকানের নাম *</span><input value={name} onChange={e=>setName(e.target.value)} placeholder="যেমন: JOY SHOES" required minLength={2} maxLength={100}/></label>
    <label className="dk-field"><span>মোবাইল নম্বর</span><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="01XXXXXXXXX" inputMode="tel"/></label>
    <label className="dk-field"><span>দোকানের ঠিকানা (ঐচ্ছিক)</span><textarea value={address} onChange={e=>setAddress(e.target.value)} placeholder="এলাকা, থানা, জেলা" rows={2}/></label>
    <button className="dk-primary-button" type="submit" disabled={busy}>{busy?"দোকান তৈরি হচ্ছে…":"দোকান তৈরি করুন ✓"}</button>
   </form>
   <button className="dk-text-button dk-back-step" onClick={()=>setStep(1)}>← দোকানের ধরন পরিবর্তন</button>
  </section>}
 </main>;
}
