"use client";
import {useState} from "react";
import {STARTER_PLAN} from "../../lib/dokankhata/constants";
import {daysRemaining,dateTimeBn} from "../../lib/dokankhata/format";
export default function SubscriptionPage({shop,subscription,payments,onSubmitPayment,busy,onBack}){
 const [method,setMethod]=useState("bkash"),[sender,setSender]=useState(""),[transaction,setTransaction]=useState("");
 const remaining=subscription?.status==="active"?null:daysRemaining(subscription?.trial_ends_at);
 const submit=e=>{e.preventDefault();onSubmitPayment({payment_method:method,sender_phone:sender.trim(),transaction_id:transaction.trim()},()=>{setSender("");setTransaction("");});};
 return <section className="dk-module-page"><div className="dk-page-title"><button onClick={onBack}>←</button><div><small>PLAN & BILLING</small><h1>সাবস্ক্রিপশন</h1><p>{shop.name} · প্রতি দোকানের জন্য আলাদা প্যাকেজ</p></div></div>
  <div className="dk-plan-hero"><div className="dk-plan-crown">♛</div><span className="dk-eyebrow">DOKANKHATA STARTER</span><h2>আপনার দোকানের সব হিসাব<br/>এক জায়গায়</h2><div className="dk-plan-price">৳২০০ <small>/ দোকান / মাস</small></div>
   {subscription?.status==="active"?<div className="dk-plan-status active">সাবস্ক্রিপশন সক্রিয়</div>:remaining>0?<div className="dk-plan-status">ফ্রি ট্রায়াল চলছে · আর {remaining} দিন</div>:<div className="dk-plan-status expired">ট্রায়াল শেষ · নবায়ন প্রয়োজন</div>}
  </div>
  <div className="dk-panel"><div className="dk-section-heading"><div><small>INCLUDED FEATURES</small><h2>Starter প্যাকেজে যা পাবেন</h2></div></div>
   <div className="dk-feature-list">{STARTER_PLAN.features.map(x=><div key={x}><span>✓</span>{x}</div>)}</div>
   <div className="dk-trial-note">প্রথম ৭ দিন সব ফিচার বিনামূল্যে ব্যবহার করুন। এরপর ৳২০০ / মাস / দোকান। একাধিক দোকান থাকলে প্রতিটি দোকানের সাবস্ক্রিপশন আলাদা হবে।</div>
  </div>
  <div className="dk-panel"><h2>ম্যানুয়াল পেমেন্ট জমা দিন</h2><p className="dk-muted">বিকাশ বা নগদে পেমেন্ট করার পর যে নম্বর থেকে পাঠিয়েছেন এবং ট্রানজেকশন আইডি লিখুন। অ্যাডমিন যাচাই না করা পর্যন্ত Pending থাকবে।</p>
   <form className="dk-form" onSubmit={submit}><label className="dk-field"><span>পেমেন্ট মাধ্যম</span><select value={method} onChange={e=>setMethod(e.target.value)}><option value="bkash">বিকাশ</option><option value="nagad">নগদ</option></select></label>
    <label className="dk-field"><span>যে নম্বর থেকে পাঠিয়েছেন</span><input value={sender} onChange={e=>setSender(e.target.value)} inputMode="tel" placeholder="01XXXXXXXXX" required/></label>
    <label className="dk-field"><span>ট্রানজেকশন আইডি</span><input value={transaction} onChange={e=>setTransaction(e.target.value)} placeholder="TrxID লিখুন" required/></label>
    <button className="dk-primary-button" disabled={busy||!subscription}>{busy?"জমা হচ্ছে…":"পেমেন্ট যাচাইয়ের জন্য জমা দিন"}</button>
   </form><p className="dk-payment-warning">পেমেন্ট গ্রহণের নম্বর ও নির্দেশনা অ্যাডমিন প্যানেল থেকে নির্ধারণ করতে হবে। কোনো ব্যক্তিগত নম্বর অনুমান করে এখানে দেখানো হচ্ছে না।</p>
  </div>
  <div className="dk-panel"><h2>পেমেন্টের ইতিহাস</h2>{payments.length?<div className="dk-record-list">{payments.map(r=><div className="dk-record" key={r.id}><div><b>{r.payment_method==="bkash"?"বিকাশ":"নগদ"} · {r.transaction_id}</b><small>{dateTimeBn(r.submitted_at)}</small></div><span className={"dk-payment-state "+r.status}>{r.status==="pending"?"যাচাই হচ্ছে":r.status==="approved"?"অনুমোদিত":"বাতিল"}</span></div>)}</div>:<div className="dk-empty">এখনো কোনো পেমেন্ট জমা দেওয়া হয়নি।</div>}</div>
 </section>;
}
