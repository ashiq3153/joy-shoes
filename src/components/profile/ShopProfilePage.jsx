"use client";
import {useEffect,useState} from "react";
import {SHOP_CATEGORIES} from "../../lib/dokankhata/constants";
export default function ShopProfilePage({shop,profile,onSaveShop,onSaveProfile,busy,onBack}){
 const [name,setName]=useState(shop.name||""),[category,setCategory]=useState(shop.category||"other"),[phone,setPhone]=useState(shop.phone||""),[address,setAddress]=useState(shop.address||""),[cover,setCover]=useState(null),[logo,setLogo]=useState(null),[coverPreview,setCoverPreview]=useState(""),[logoPreview,setLogoPreview]=useState(""),[displayName,setDisplayName]=useState(profile?.display_name||""),[ownerPhone,setOwnerPhone]=useState(profile?.phone||"");
 useEffect(()=>{setName(shop.name||"");setCategory(shop.category||"other");setPhone(shop.phone||"");setAddress(shop.address||"");},[shop.id,shop.name,shop.category,shop.phone,shop.address]);
 useEffect(()=>{setDisplayName(profile?.display_name||"");setOwnerPhone(profile?.phone||"");},[profile?.display_name,profile?.phone]);
 useEffect(()=>()=>{if(coverPreview)URL.revokeObjectURL(coverPreview);if(logoPreview)URL.revokeObjectURL(logoPreview);},[coverPreview,logoPreview]);
 const choose=(file,kind)=>{if(kind==="cover"){if(coverPreview)URL.revokeObjectURL(coverPreview);setCover(file);setCoverPreview(file?URL.createObjectURL(file):"");}else{if(logoPreview)URL.revokeObjectURL(logoPreview);setLogo(file);setLogoPreview(file?URL.createObjectURL(file):"");}};
 const categoryName=SHOP_CATEGORIES.find(x=>x.id===category)?.title||"দোকান";
 return <section className="dk-module-page dk-profile-page">
  <div className="dk-page-title"><button onClick={onBack}>←</button><div><small>SHOP SETTINGS</small><h1>দোকানের প্রোফাইল</h1><p>আপনার দোকানের পরিচিতি ও যোগাযোগের তথ্য</p></div></div>
  <div className="dk-profile-hero">
   <div className="dk-profile-cover" style={(coverPreview||shop.cover_url)?{backgroundImage:"linear-gradient(90deg,rgba(0,43,28,.23),rgba(0,43,28,.12)),url("+(coverPreview||shop.cover_url)+")"}:undefined}>
    <div className="dk-profile-cover-caption"><span>দোকানের ব্যানার</span><small>আপনার দোকানকে সুন্দরভাবে তুলে ধরুন</small></div>
    <label className="dk-camera-upload dk-profile-cover-upload"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>choose(e.target.files?.[0]||null,"cover")}/><span>📷</span><b>{cover?"ছবি পরিবর্তন":"ব্যানার ছবি"}</b></label>
   </div>
   <div className="dk-profile-identity">
    <div className="dk-profile-logo">{logoPreview?<img src={logoPreview} alt="নতুন লোগো"/>:shop.logo_url?<img src={shop.logo_url} alt="দোকানের লোগো"/>:<span>{name.trim().slice(0,1)||"দ"}</span>}
     <label><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>choose(e.target.files?.[0]||null,"logo")}/>📷</label>
    </div>
    <div className="dk-profile-identity-copy"><b>{name||shop.name}</b><small>{categoryName}</small><span>দোকানের প্রোফাইল</span></div>
   </div>
  </div>
  <div className="dk-panel dk-profile-panel"><div className="dk-panel-heading"><span>🏪</span><div><h2>দোকানের তথ্য</h2><small>দোকানের নাম ও অবস্থান</small></div></div>
   <form className="dk-form" onSubmit={e=>{e.preventDefault();onSaveShop({name:name.trim(),category,phone:phone.trim(),address:address.trim(),logo,cover});}}>
    <label className="dk-field"><span>দোকানের নাম</span><input value={name} onChange={e=>setName(e.target.value)} required minLength={2}/></label>
    <label className="dk-field"><span>দোকানের ধরন</span><select value={category} onChange={e=>setCategory(e.target.value)}>{SHOP_CATEGORIES.map(x=><option key={x.id} value={x.id}>{x.title}</option>)}</select></label>
    <label className="dk-field"><span>দোকানের মোবাইল</span><input value={phone} onChange={e=>setPhone(e.target.value)} inputMode="tel" placeholder="01XXXXXXXXX"/></label>
    <label className="dk-field"><span>দোকানের ঠিকানা</span><textarea rows={2} value={address} onChange={e=>setAddress(e.target.value)} placeholder="দোকানের সম্পূর্ণ ঠিকানা"/></label>
    <button className="dk-primary-button" disabled={busy}>দোকানের তথ্য সংরক্ষণ করুন ✓</button>
   </form>
  </div>
  <div className="dk-panel dk-profile-panel"><div className="dk-panel-heading"><span>♙</span><div><h2>মালিকের তথ্য</h2><small>আপনার ব্যক্তিগত যোগাযোগের তথ্য</small></div></div>
   <form className="dk-form" onSubmit={e=>{e.preventDefault();onSaveProfile({display_name:displayName.trim(),phone:ownerPhone.trim()});}}>
    <label className="dk-field"><span>মালিকের নাম</span><input value={displayName} onChange={e=>setDisplayName(e.target.value)} required/></label>
    <label className="dk-field"><span>মালিকের মোবাইল</span><input value={ownerPhone} onChange={e=>setOwnerPhone(e.target.value)} inputMode="tel" placeholder="01XXXXXXXXX"/></label>
    <button className="dk-secondary-button" disabled={busy}>মালিকের তথ্য আপডেট করুন</button>
   </form>
  </div>
 </section>;
}
