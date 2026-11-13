"use client";
import {useState} from "react";
export default function AuthPanel({onLogin,onSignup,busy,notice,error}){
 const [mode,setMode]=useState("login"),[name,setName]=useState(""),[phone,setPhone]=useState(""),[email,setEmail]=useState(""),[password,setPassword]=useState("");
 const submit=e=>{e.preventDefault();mode==="signup"?onSignup({name:name.trim(),phone:phone.trim(),email:email.trim(),password}):onLogin({email:email.trim(),password});};
 return <main className="dk-auth-screen">
  <section className="dk-auth-hero"><div className="dk-brand-icon">▤</div><div className="dk-brand-name">DokanKhata</div>
   <h1>আপনার দোকানের<br/>ডিজিটাল হিসাবখাতা</h1><p>বিক্রি, খরচ, পণ্য, কর্মচারী ও রিপোর্ট—সব হিসাব এক জায়গায় রাখুন।</p>
   <div className="dk-benefit-row"><span>⚡ সহজ হিসাব</span><span>▥ স্মার্ট রিপোর্ট</span><span>☁ নিরাপদ ডেটা</span></div>
   <div className="dk-hero-orbit dk-orbit-one"/><div className="dk-hero-orbit dk-orbit-two"/>
  </section>
  <section className="dk-auth-card"><span className="dk-eyebrow">DOKANKHATA ACCOUNT</span>
   <h2>{mode==="signup"?"আপনার অ্যাকাউন্ট তৈরি করুন":"আপনার অ্যাকাউন্টে প্রবেশ করুন"}</h2>
   <p>{mode==="signup"?"অ্যাকাউন্ট খুলে আপনার দোকানের ডিজিটাল হিসাব শুরু করুন।":"আপনার হিসাব দেখতে ইমেইল ও পাসওয়ার্ড দিন।"}</p>
   <form className="dk-form" onSubmit={submit}>
    {mode==="signup"?<>
     <label className="dk-field"><span>আপনার নাম</span><input value={name} onChange={e=>setName(e.target.value)} placeholder="আপনার পুরো নাম" autoComplete="name" required minLength={2}/></label>
     <label className="dk-field"><span>মোবাইল নম্বর</span><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="01XXXXXXXXX" inputMode="tel" required/></label>
    </>:null}
    <label className="dk-field"><span>ইমেইল ঠিকানা</span><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="আপনার ইমেইল" autoComplete="email" required/></label>
    <label className="dk-field"><span>পাসওয়ার্ড</span><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder={mode==="signup"?"কমপক্ষে ৮ অক্ষর":"পাসওয়ার্ড"} minLength={mode==="signup"?8:undefined} required autoComplete={mode==="signup"?"new-password":"current-password"}/></label>
    <button className="dk-primary-button" disabled={busy}>{busy?"অপেক্ষা করুন…":mode==="signup"?"অ্যাকাউন্ট তৈরি করুন":"লগইন করুন"} <span>→</span></button>
   </form>
   {notice?<div className="dk-notice">{notice}</div>:null}{error?<div className="dk-error">{error}</div>:null}
   <div className="dk-auth-switch">{mode==="signup"?"ইতিমধ্যে অ্যাকাউন্ট আছে?":"নতুন দোকান শুরু করতে চান?"}
    <button type="button" onClick={()=>setMode(mode==="signup"?"login":"signup")}>{mode==="signup"?"লগইন করুন":"নতুন অ্যাকাউন্ট খুলুন"}</button>
   </div><div className="dk-auth-footnote">৭ দিনের ফ্রি ট্রায়াল · এরপর প্রতি দোকানে ৳২০০ / মাস</div>
  </section>
 </main>;
}
