"use client";
import {useState} from "react";

function BrandMark(){
 return <svg className="dk-brand-mark-svg" viewBox="0 0 88 88" role="img" aria-label="DokanKhata">
  <path d="M25 23h38l5 53H20l5-53Z" fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round"/>
  <path d="M32 24v-5a12 12 0 0 1 24 0v5" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/>
  <path d="m31 43 5 5 10-11M31 59l5 5 10-11M53 44h8M53 60h8" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
 </svg>;
}
const BENEFITS=[
 {icon:"⚡",title:"সহজ হিসাব",sub:"বিক্রি ও খরচ এক জায়গায়"},
 {icon:"▥",title:"স্মার্ট রিপোর্ট",sub:"দৈনিক হিসাবের সারাংশ"},
 {icon:"☁",title:"নিরাপদ ডেটা",sub:"দোকানের তথ্য সুরক্ষিত"}
];
export default function AuthPanel({onLogin,onSignup,busy,notice,error}){
 const [mode,setMode]=useState("welcome"),[name,setName]=useState(""),[phone,setPhone]=useState(""),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[showPassword,setShowPassword]=useState(false);
 const submit=e=>{e.preventDefault();mode==="signup"?onSignup({name:name.trim(),phone:phone.trim(),email:email.trim(),password}):onLogin({email:email.trim(),password});};
 if(mode==="welcome")return <main className="dk-welcome-screen">
  <section className="dk-welcome-art">
   <div className="dk-welcome-glow dk-glow-a"/><div className="dk-welcome-glow dk-glow-b"/>
   <div className="dk-welcome-logo"><BrandMark/></div>
   <div className="dk-welcome-brand">DokanKhata</div>
   <h1>আপনার দোকানের<br/>ডিজিটাল হিসাবখাতা</h1>
   <p>দোকানের প্রতিদিনের হিসাব থাকুক গুছানো, সহজ ও আপনার হাতের মুঠোয়।</p>
   <div className="dk-welcome-benefits">{BENEFITS.map(item=><div key={item.title}><span>{item.icon}</span><b>{item.title}</b><small>{item.sub}</small></div>)}</div>
   <div className="dk-welcome-wave"/>
  </section>
  <section className="dk-welcome-bottom">
   <div className="dk-welcome-dots"><i className="active"/><i/><i/></div>
   <div><small>বাংলাদেশের ছোট ব্যবসার ডিজিটাল সহকারী</small><h2>হিসাব রাখুন নিশ্চিন্তে</h2></div>
   <button className="dk-welcome-start" onClick={()=>setMode("login")}>শুরু করুন <span>→</span></button>
   <button className="dk-welcome-signup" onClick={()=>setMode("signup")}>নতুন দোকান খুলুন</button>
  </section>
 </main>;
 return <main className="dk-auth-flow">
  <section className="dk-auth-visual">
   <button className="dk-auth-back" type="button" onClick={()=>setMode("welcome")} aria-label="পেছনে যান">←</button>
   <div className="dk-auth-visual-content">
    <div className="dk-auth-mini-logo"><BrandMark/></div>
    <b>DokanKhata</b>
    <h1>{mode==="signup"?"আপনার ব্যবসার নতুন শুরু":"আপনার হিসাব, আপনার হাতেই"}</h1>
    <p>বিক্রি, খরচ, পণ্য, কর্মচারী ও রিপোর্ট—সবকিছু এক জায়গায় গুছিয়ে রাখুন।</p>
    <div className="dk-auth-visual-pills"><span>⚡ সহজ হিসাব</span><span>▥ স্মার্ট রিপোর্ট</span><span>☁ নিরাপদ ডেটা</span></div>
   </div>
   <div className="dk-auth-visual-orbit"/>
  </section>
  <section className="dk-auth-card">
   <div className="dk-auth-card-top"><span className="dk-eyebrow">DOKANKHATA ACCOUNT</span><span className="dk-auth-step">{mode==="signup"?"01 / 02":"WELCOME BACK"}</span></div>
   <div className="dk-auth-heading-icon">{mode==="signup"?"🏪":"👋"}</div>
   <h2>{mode==="signup"?"অ্যাকাউন্ট তৈরি করুন":"আপনার অ্যাকাউন্টে প্রবেশ করুন"}</h2>
   <p>{mode==="signup"?"আপনার নাম ও যোগাযোগের তথ্য দিয়ে শুরু করুন।":"আপনার দোকানের হিসাব দেখতে লগইন করুন।"}</p>
   <form className="dk-form dk-auth-form" onSubmit={submit}>
    {mode==="signup"?<>
     <label className="dk-field"><span>আপনার নাম</span><div className="dk-input-with-icon"><i>♙</i><input value={name} onChange={e=>setName(e.target.value)} placeholder="আপনার পুরো নাম" autoComplete="name" required minLength={2}/></div></label>
     <label className="dk-field"><span>মোবাইল নম্বর</span><div className="dk-input-with-icon"><i>⌕</i><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="01XXXXXXXXX" inputMode="tel" autoComplete="tel" required/></div></label>
    </>:null}
    <label className="dk-field"><span>ইমেইল ঠিকানা</span><div className="dk-input-with-icon"><i>✉</i><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="আপনার ইমেইল" autoComplete="email" required/></div></label>
    <label className="dk-field"><span>পাসওয়ার্ড</span><div className="dk-input-with-icon"><i>▣</i><input type={showPassword?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder={mode==="signup"?"কমপক্ষে ৮ অক্ষর":"আপনার পাসওয়ার্ড"} minLength={mode==="signup"?8:undefined} required autoComplete={mode==="signup"?"new-password":"current-password"}/><button type="button" onClick={()=>setShowPassword(value=>!value)} aria-label={showPassword?"পাসওয়ার্ড লুকান":"পাসওয়ার্ড দেখান"}>{showPassword?"◉":"◎"}</button></div></label>
    <button className="dk-primary-button dk-auth-submit" disabled={busy}>{busy?"অপেক্ষা করুন…":mode==="signup"?"রেজিস্ট্রেশন করুন":"লগইন করুন"} <span>→</span></button>
   </form>
   {notice?<div className="dk-notice">{notice}</div>:null}{error?<div className="dk-error" role="alert">{error}</div>:null}
   <div className="dk-auth-divider"><span>অথবা</span></div>
   <div className="dk-auth-switch">{mode==="signup"?"ইতিমধ্যে অ্যাকাউন্ট আছে?":"এখনো অ্যাকাউন্ট নেই?"}
    <button type="button" onClick={()=>setMode(mode==="signup"?"login":"signup")}>{mode==="signup"?"লগইন করুন":"নতুন অ্যাকাউন্ট তৈরি করুন"}</button>
   </div>
   <div className="dk-auth-footnote"><span>✓</span> ৭ দিনের ফ্রি ট্রায়াল · এরপর প্রতি দোকানে ৳২০০ / মাস</div>
  </section>
 </main>;
}
