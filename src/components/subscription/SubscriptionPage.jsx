"use client";
import {STARTER_PLAN} from "../../lib/dokankhata/constants";
import {daysRemaining,dateTimeBn} from "../../lib/dokankhata/format";

export default function SubscriptionPage({shop,subscription,payments,onBack}){
 const remaining=subscription?.status==="active"?null:daysRemaining(subscription?.trial_ends_at);
 return <section className="dk-module-page"><div className="dk-page-title"><button onClick={onBack}>←</button><div><small>PLAN & BILLING</small><h1>সাবস্ক্রিপশন</h1><p>{shop.name} · প্রতি দোকানের জন্য আলাদা প্যাকেজ</p></div></div>
  <div className="dk-plan-hero"><div className="dk-plan-crown">♛</div><span className="dk-eyebrow">DOKANKHATA STARTER</span><h2>আপনার দোকানের সব হিসাব<br/>এক জায়গায়</h2><div className="dk-plan-price">৳২০০ <small>/ দোকান / মাস</small></div>
   {subscription?.status==="active"?<div className="dk-plan-status active">সাবস্ক্রিপশন সক্রিয়</div>:remaining>0?<div className="dk-plan-status">ফ্রি ট্রায়াল চলছে · আর {remaining} দিন</div>:<div className="dk-plan-status expired">ট্রায়াল শেষ · নবায়ন প্রয়োজন</div>}
  </div>
  <div className="dk-panel"><div className="dk-section-heading"><div><small>INCLUDED FEATURES</small><h2>Starter প্যাকেজে যা পাবেন</h2></div></div>
   <div className="dk-feature-list">{STARTER_PLAN.features.map(x=><div key={x}><span>✓</span>{x}</div>)}</div>
   <div className="dk-trial-note">প্রথম ৭ দিন সব ফিচার বিনামূল্যে ব্যবহার করুন। এরপর ৳২০০ / মাস / দোকান। একাধিক দোকান থাকলে প্রতিটি দোকানের সাবস্ক্রিপশন আলাদা হবে।</div>
  </div>
  <div className="dk-panel"><h2>ম্যানুয়াল পেমেন্ট</h2>
   <div className="dk-payment-warning">বিকাশ / নগদে টাকা পাঠানোর অফিসিয়াল নম্বর ও QR এখনো প্ল্যাটফর্ম অ্যাডমিন প্যানেলে কনফিগার করা হয়নি। নিরাপত্তার জন্য আপাতত কোনো নম্বরে টাকা পাঠাবেন না এবং Transaction ID জমা দেবেন না। পেমেন্ট নির্দেশনা চালু হলে এখানেই দেখানো হবে।</div>
   <button type="button" className="dk-secondary-button" disabled>পেমেন্ট জমা সাময়িক বন্ধ</button>
  </div>
  <div className="dk-panel"><h2>পেমেন্টের ইতিহাস</h2>{payments.length?<div className="dk-record-list">{payments.map(r=><div className="dk-record" key={r.id}><div><b>{r.payment_method==="bkash"?"বিকাশ":"নগদ"} · {r.transaction_id}</b><small>{dateTimeBn(r.submitted_at)}</small></div><span className={"dk-payment-state "+r.status}>{r.status==="pending"?"যাচাই হচ্ছে":r.status==="approved"?"অনুমোদিত":"বাতিল"}</span></div>)}</div>:<div className="dk-empty">এখনো কোনো পেমেন্ট জমা দেওয়া হয়নি।</div>}</div>
 </section>;
}
