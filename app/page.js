"use client";
import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";

const modules = [
 ["🛍️","আজকের বিক্রি","বিক্রির হিসাব লিখুন","green","sales"],
 ["👥","মহাজন","মহাজন ও বাকি হিসাব","blue","coming"],
 ["📦","নতুন মাল কেনা","ক্রয় ও ক্যাশ মেমো","purple","coming"],
 ["💸","খরচ","দোকান ও অন্যান্য খরচ","yellow","coming"],
 ["🧑‍💼","কর্মচারী","কর্মচারীর বিক্রির হিসাব","orange","coming"],
 ["🧮","ক্যাশ মিল","দিনের টাকা মিলিয়ে নিন","pink","coming"]
];

export default function Home() {
 const supabase = createClient();
 const [session,setSession] = useState(null);
 const [email,setEmail] = useState("");
 const [password,setPassword] = useState("");
 const [amount,setAmount] = useState("");
 const [cost,setCost] = useState("");
 const [mode,setMode] = useState("total_only");
 const [busy,setBusy] = useState(false);
 const [message,setMessage] = useState("");
 const [isSignup,setIsSignup] = useState(false);

 useEffect(() => {
   supabase.auth.getSession().then(({data}) => setSession(data.session));
   const {data:{subscription}} = supabase.auth.onAuthStateChange((_event,next) => setSession(next));
   return () => subscription.unsubscribe();
 }, []);

 async function ensureOwner(user) {
   const {error} = await supabase.from("owners").upsert({id:user.id},{onConflict:"id"});
   if(error) throw error;
 }
 async function authenticate(e) {
   e.preventDefault(); setBusy(true); setMessage("");
   try {
     const result = isSignup
       ? await supabase.auth.signUp({email,password})
       : await supabase.auth.signInWithPassword({email,password});
     if(result.error) throw result.error;
     if(result.data.session && result.data.user) {
       await ensureOwner(result.data.user);
       setMessage("লগইন সফল হয়েছে।");
     } else if(isSignup) {
       setMessage("ইমেইলে confirmation link পাঠানো হয়েছে। সেটি নিশ্চিত করে লগইন করুন।");
     }
   } catch(error) { setMessage(error.message || "লগইন করা যায়নি।"); }
   finally { setBusy(false); }
 }
 async function saveSales(e) {
   e.preventDefault(); if(!session?.user) return;
   const sales = Number(amount);
   const goodsCost = Number(cost);
   if(!Number.isFinite(sales) || sales < 0 || amount === "") { setMessage("বিক্রির সঠিক টাকা লিখুন।"); return; }
   if(mode === "cost_and_sale" && (!Number.isFinite(goodsCost) || goodsCost < 0 || cost === "")) { setMessage("মালের আসল খরচ লিখুন।"); return; }
   setBusy(true); setMessage("");
   try {
     await ensureOwner(session.user);
     const saleDate = new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Dhaka",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
     const {error} = await supabase.from("daily_sales").upsert({
       owner_id:session.user.id, sale_date:saleDate, entry_mode:mode,
       total_sales:sales, cost_of_goods_sold:mode==="cost_and_sale"?goodsCost:null
     },{onConflict:"owner_id,sale_date"});
     if(error) throw error;
     setMessage("আজকের বিক্রির হিসাব সংরক্ষণ হয়েছে।");
   } catch(error) { setMessage(error.message || "হিসাব সংরক্ষণ হয়নি।"); }
   finally { setBusy(false); }
 }
 if(!session) return <main className="shell"><header className="top"><div className="logo">JS</div><div><small>ব্যবসার হিসাব এক জায়গায়</small><h1>JOY SHOES</h1></div></header><section className="panel auth"><div className="panelhead"><span>🔐</span><div><small>OWNER ACCESS</small><h2>{isSignup?"মালিকের অ্যাকাউন্ট তৈরি":"মালিক লগইন"}</h2></div></div><form onSubmit={authenticate}><label>ইমেইল</label><input className="field" type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="আপনার ইমেইল"/><label>পাসওয়ার্ড</label><input className="field" type="password" minLength={6} value={password} onChange={e=>setPassword(e.target.value)} required placeholder="কমপক্ষে ৬ অক্ষর"/><button className="primary" disabled={busy}>{busy?"অপেক্ষা করুন":isSignup?"অ্যাকাউন্ট তৈরি করুন":"লগইন করুন"}</button></form><button className="linkbtn" onClick={()=>{setIsSignup(!isSignup);setMessage("");}}>{isSignup?"আগে অ্যাকাউন্ট আছে? লগইন":"নতুন মালিক? অ্যাকাউন্ট তৈরি করুন"}</button>{message&&<p className="note">{message}</p>}</section><footer>JOY SHOES · শুধু মালিকের ব্যবহারের জন্য</footer></main>;

 return <main className="shell">
  <header className="top"><div className="logo">JS</div><div><small>ব্যবসার হিসাব এক জায়গায়</small><h1>JOY SHOES</h1></div><button className="owner" onClick={()=>supabase.auth.signOut()}>↪ বের হন</button></header>
  <section className="hero"><div><small>আজকের সারাংশ</small><h2>আপনার দোকান,<br/>আপনার হিসাব।</h2><p>সহজে লিখুন, সহজে বুঝুন।</p></div><div className="shoe">👟</div></section>
  <div className="heading"><div><small>QUICK ACTIONS</small><h2>কী করতে চান?</h2></div><span>আজকের হিসাব</span></div>
  <section className="grid">{modules.map(([icon,title,desc,color,target])=><button className={`tile ${color}`} key={title} onClick={()=>document.getElementById(target).scrollIntoView({behavior:"smooth"})}><i>{icon}</i><b>{title}</b><small>{desc}</small></button>)}</section>
  <section className="panel" id="sales"><div className="panelhead"><span>৳</span><div><small>DAILY SALES</small><h2>আজকের মোট বিক্রি</h2></div></div>
   <form onSubmit={saveSales}><label>হিসাবের ধরন</label><div className="mode"><button type="button" className={mode==="total_only"?"selected":""} onClick={()=>setMode("total_only")}>শুধু মোট বিক্রি</button><button type="button" className={mode==="cost_and_sale"?"selected":""} onClick={()=>setMode("cost_and_sale")}>বিক্রি + মালের আসল</button></div>
   <label>বিক্রির মোট টাকা লিখুন</label><div className="amount"><b>৳</b><input inputMode="decimal" placeholder="যেমন: ৫০০০" value={amount} onChange={e=>setAmount(e.target.value)}/></div>
   {mode==="cost_and_sale"&&<><label className="spaced">বিক্রি হওয়া মালের আসল খরচ</label><div className="amount"><b>৳</b><input inputMode="decimal" placeholder="যেমন: ৩৫০০" value={cost} onChange={e=>setCost(e.target.value)}/></div></>}
   <button className="primary" disabled={busy}>{busy?"সংরক্ষণ হচ্ছে...":"হিসাব সংরক্ষণ করুন"}</button></form>
   {message&&<p className="note">{message}</p>}
  </section>
  <section className="panel" id="coming"><h2>অন্যান্য মডিউল</h2><p>মহাজন, ক্রয়, পেমেন্ট, রিটার্ন, কর্মচারী, খরচ ও ক্যাশ ক্লোজিং পরবর্তী ধাপে চালু হবে।</p></section>
  <footer>JOY SHOES · সহজ ব্যবসা ব্যবস্থাপনা</footer>
 </main>;
}