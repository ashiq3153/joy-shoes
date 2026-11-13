"use client";
import { useState } from "react";

const modules = [
  ["🛍️","আজকের বিক্রি","বিক্রির হিসাব লিখুন","green"],
  ["👥","মহাজন","মহাজন ও বাকি হিসাব","blue"],
  ["📦","নতুন মাল কেনা","ক্রয় ও ক্যাশ মেমো","purple"],
  ["💸","খরচ","দোকান ও অন্যান্য খরচ","yellow"],
  ["🧑‍💼","কর্মচারী","কর্মচারীর বিক্রির হিসাব","orange"],
  ["🧮","ক্যাশ মিল","দিনের টাকা মিলিয়ে নিন","pink"]
];

export default function Home() {
 const [amount,setAmount]=useState("");
 return <main className="shell">
  <header className="top"><div className="logo">JS</div><div><small>ব্যবসার হিসাব এক জায়গায়</small><h1>JOY SHOES</h1></div><span className="owner">👤 মালিক</span></header>
  <section className="hero"><div><small>আজকের সারাংশ</small><h2>আপনার দোকান,<br/>আপনার হিসাব।</h2><p>সহজে লিখুন, সহজে বুঝুন।</p></div><div className="shoe">👟</div></section>
  <div className="heading"><div><small>QUICK ACTIONS</small><h2>কী করতে চান?</h2></div><span>আজকের হিসাব</span></div>
  <section className="grid">{modules.map(([icon,title,desc,color])=><button className={`tile ${color}`} key={title} onClick={()=>document.getElementById(title==="আজকের বিক্রি"?"sales":"coming").scrollIntoView({behavior:"smooth"})}><i>{icon}</i><b>{title}</b><small>{desc}</small></button>)}</section>
  <section className="panel" id="sales"><div className="panelhead"><span>৳</span><div><small>DAILY SALES</small><h2>আজকের মোট বিক্রি</h2></div></div><label>বিক্রির মোট টাকা লিখুন</label><div className="amount"><b>৳</b><input inputMode="decimal" placeholder="যেমন: ৫০০০" value={amount} onChange={e=>setAmount(e.target.value)}/></div><p className="note">এটি প্রাথমিক প্রোটোটাইপ। Supabase সংযোগ সম্পন্ন হলে হিসাব সংরক্ষণ হবে।</p></section>
  <section className="panel" id="coming"><h2>পরবর্তী মডিউল</h2><p>মহাজন, ক্রয়, পেমেন্ট, রিটার্ন, কর্মচারী, খরচ ও ক্যাশ ক্লোজিং ধাপে ধাপে যুক্ত হবে।</p></section>
  <footer>JOY SHOES · সহজ ব্যবসা ব্যবস্থাপনা</footer>
 </main>;
}