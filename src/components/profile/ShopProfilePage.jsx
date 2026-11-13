"use client";
import {useEffect,useState} from "react";
import {SHOP_CATEGORIES} from "../../lib/dokankhata/constants";
export default function ShopProfilePage({shop,profile,onSaveShop,onSaveProfile,busy,onBack}){
 const [name,setName]=useState(shop.name||""),[category,setCategory]=useState(shop.category||"other"),[phone,setPhone]=useState(shop.phone||""),[address,setAddress]=useState(shop.address||""),[cover,setCover]=useState(null),[logo,setLogo]=useState(null),[displayName,setDisplayName]=useState(profile?.display_name||""),[ownerPhone,setOwnerPhone]=useState(profile?.phone||"");
 useEffect(()=>{setName(shop.name||"");setCategory(shop.category||"other");setPhone(shop.phone||"");setAddress(shop.address||"");},[shop.id,shop.name,shop.category,shop.phone,shop.address]);
 useEffect(()=>{setDisplayName(profile?.display_name||"");setOwnerPhone(profile?.phone||"");},[profile?.display_name,profile?.phone]);
 return <section className="dk-module-page"><div className="dk-page-title"><button onClick={onBack}>←</button><div><small>SHOP SETTINGS</small><h1>দোকানের প্রোফাইল</h1><p>দোকান ও মালিকের তথ্য আপডেট করুন</p></div></div>
  <div className="dk-shop-profile-preview" style={shop.cover_url?{backgroundImage:"linear-gradient(90deg,rgba(0,42,27,.7),rgba(0,42,27,.12)),url("+shop.cover_url+")"}:undefined}><div>{shop.logo_url?<img src={shop.logo_url} alt=""/>:shop.name.slice(0,1)}</div><b>{shop.name}</b><small>{SHOP_CATEGORIES.find(x=>x.id===shop.category)?.title}</small></div>
  <div className="dk-panel"><h2>দোকানের তথ্য</h2><form className="dk-form" onSubmit={e=>{e.preventDefault();onSaveShop({name:name.trim(),category,phone:phone.trim(),address:address.trim(),logo,cover});}}>
   <label className="dk-field"><span>দোকানের নাম</span><input value={name} onChange={e=>setName(e.target.value)} required minLength={2}/></label>
   <label className="dk-field"><span>দোকানের ধরন</span><select value={category} onChange={e=>setCategory(e.target.value)}>{SHOP_CATEGORIES.map(x=><option key={x.id} value={x.id}>{x.title}</option>)}</select></label>
   <label className="dk-field"><span>দোকানের মোবাইল</span><input value={phone} onChange={e=>setPhone(e.target.value)} inputMode="tel"/></label>
   <label className="dk-field"><span>দোকানের ঠিকানা</span><textarea rows={2} value={address} onChange={e=>setAddress(e.target.value)}/></label>
   <div className="dk-two-fields"><label className="dk-field"><span>ব্যানার ছবি</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setCover(e.target.files?.[0]||null)}/></label><label className="dk-field"><span>লোগো ছবি</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setLogo(e.target.files?.[0]||null)}/></label></div>
   <button className="dk-primary-button" disabled={busy}>দোকানের তথ্য সংরক্ষণ করুন</button>
  </form></div>
  <div className="dk-panel"><h2>মালিকের তথ্য</h2><form className="dk-form" onSubmit={e=>{e.preventDefault();onSaveProfile({display_name:displayName.trim(),phone:ownerPhone.trim()});}}>
   <label className="dk-field"><span>মালিকের নাম</span><input value={displayName} onChange={e=>setDisplayName(e.target.value)} required/></label>
   <label className="dk-field"><span>মালিকের মোবাইল</span><input value={ownerPhone} onChange={e=>setOwnerPhone(e.target.value)} inputMode="tel"/></label>
   <button className="dk-secondary-button" disabled={busy}>মালিকের তথ্য আপডেট করুন</button>
  </form></div>
 </section>;
}
