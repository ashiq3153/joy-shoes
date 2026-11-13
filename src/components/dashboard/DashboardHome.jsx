"use client";
import {money,dateTimeBn} from "../../lib/dokankhata/format";
const MODULES=[
 {id:"products",title:"পণ্য ও স্টক",sub:"পণ্যের তালিকা",icon:"📦",tone:"violet"},
 {id:"suppliers",title:"মহাজন",sub:"সরবরাহকারী ও বাকি",icon:"🧰",tone:"orange"},
 {id:"employees",title:"কর্মচারী",sub:"কর্মচারী তালিকা",icon:"👥",tone:"blue"},
 {id:"reports",title:"রিপোর্ট",sub:"দৈনিক ও মাসিক হিসাব",icon:"📊",tone:"red"},
 {id:"sales",title:"বিক্রির হিসাব",sub:"সব বিক্রির এন্ট্রি",icon:"📈",tone:"cyan"},
 {id:"expenses",title:"খরচের হিসাব",sub:"সব খরচের এন্ট্রি",icon:"🧾",tone:"pink"},
 {id:"profile",title:"দোকানের তথ্য",sub:"নাম, ছবি ও ঠিকানা",icon:"🏪",tone:"green"},
 {id:"subscription",title:"সাবস্ক্রিপশন",sub:"ট্রায়াল ও প্যাকেজ",icon:"👑",tone:"gold"}
];
export default function DashboardHome({shop,sales,expenses,products,subscription,payments,onNavigate,onSwitchShop,shops,activeShopId}){
 const today=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Dhaka",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
 const todaySales=sales.filter(r=>r.sale_date===today),todayExpenses=expenses.filter(r=>r.expense_date===today);
 const salesTotal=todaySales.reduce((n,r)=>n+Number(r.amount||0),0),expensesTotal=todayExpenses.reduce((n,r)=>n+Number(r.amount||0),0);
 const hasCost=todaySales.length>0&&todaySales.every(r=>r.cost_amount!==null&&r.cost_amount!==undefined);
 const profit=salesTotal-todaySales.reduce((n,r)=>n+Number(r.cost_amount||0),0);
 const recent=[...sales.map(r=>({...r,_type:"sale",_date:r.sold_at||r.created_at})),...expenses.map(r=>({...r,_type:"expense",_date:r.created_at}))].sort((a,b)=>new Date(b._date)-new Date(a._date)).slice(0,5);
 const days=subscription?.trial_ends_at?Math.max(0,Math.ceil((new Date(subscription.trial_ends_at)-Date.now())/86400000)):null;
 const trialCaption=subscription?.status==="active"?"আপনার সাবস্ক্রিপশন সক্রিয়":days===null?"ট্রায়ালের তথ্য পাওয়া যায়নি":days>0?"আর "+days.toLocaleString("bn-BD")+" দিন বিনামূল্যে ব্যবহার করুন":"ট্রায়াল শেষ—নবায়ন প্রয়োজন";
 return <div className="dk-dashboard-content">
  <section className="dk-shop-banner" style={shop.cover_url?{backgroundImage:"linear-gradient(90deg,rgba(0,42,28,.82),rgba(0,48,31,.23)),url("+shop.cover_url+")"}:undefined}>
   <div className="dk-shop-brand">{shop.logo_url?<img src={shop.logo_url} alt="দোকানের লোগো"/>:<span>{shop.name?.slice(0,1)||"দ"}</span>}</div>
   <div className="dk-shop-banner-copy"><small>আপনার দোকান</small><h1>{shop.name}</h1><p>{shop.address||"আপনার দোকানের সব হিসাব এক জায়গায়"}</p><span className="dk-shop-category-tag">দোকানের ডিজিটাল হিসাবখাতা</span></div>
   <button className="dk-banner-edit" onClick={()=>onNavigate("profile")} aria-label="দোকানের তথ্য সম্পাদনা">✎</button>
  </section>
  {shops.length>1?<div className="dk-shop-switcher"><span>বর্তমান দোকান</span><select value={activeShopId} onChange={e=>onSwitchShop(e.target.value)}>{shops.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>:null}
  <div className="dk-date-line"><span>▣</span><div><small>আজকের হিসাব</small><b>{new Date().toLocaleDateString("bn-BD",{timeZone:"Asia/Dhaka",weekday:"long",day:"numeric",month:"long",year:"numeric"})}</b></div></div>
  <section className="dk-stats-grid">
   <div className="dk-stat-card green"><div className="dk-stat-top"><span>আজকের বিক্রি</span><i>↗</i></div><b>{money(salesTotal)}</b><small>{todaySales.length.toLocaleString("bn-BD")} টি এন্ট্রি</small></div>
   <div className="dk-stat-card rose"><div className="dk-stat-top"><span>আজকের খরচ</span><i>↘</i></div><b>{money(expensesTotal)}</b><small>{todayExpenses.length.toLocaleString("bn-BD")} টি এন্ট্রি</small></div>
   <div className="dk-stat-card lilac"><div className="dk-stat-top"><span>আজকের লাভ*</span><i>৳</i></div><b>{hasCost?money(profit):"—"}</b><small>{hasCost?"বিক্রি থেকে মালের আসল বাদ":"পণ্যের আসল মূল্য দিলে দেখা যাবে"}</small></div>
  </section>
  <section className="dk-quick-actions">
   <button className="dk-action-sale" onClick={()=>onNavigate("sales")}><span>＋</span><b>বিক্রি যোগ করুন</b></button>
   <button className="dk-action-expense" onClick={()=>onNavigate("expenses")}><span>−</span><b>খরচ যোগ করুন</b></button>
  </section>
  <div className="dk-section-heading dk-dashboard-section-heading"><div><small>ব্যবসার কাজ</small><h2>দোকানের মডিউল</h2></div><span>{MODULES.length.toLocaleString("bn-BD")} টি বিভাগ</span></div>
  <section className="dk-module-grid">{MODULES.map(item=><button key={item.id} className="dk-module-card" onClick={()=>onNavigate(item.id)}><span className={"dk-module-icon "+item.tone}>{item.icon}</span><b>{item.title}</b><small>{item.sub}</small><i>→</i></button>)}</section>
  <section className="dk-panel dk-recent-panel"><div className="dk-section-heading"><div><small>সাম্প্রতিক কার্যক্রম</small><h2>সাম্প্রতিক লেনদেন</h2></div><button className="dk-link-button" onClick={()=>onNavigate("reports")}>সব দেখুন ›</button></div>
   {recent.length?<div className="dk-activity-list">{recent.map(row=><div className="dk-activity-row" key={row.id}><span className={row._type==="sale"?"income":"outcome"}>{row._type==="sale"?"↑":"↓"}</span><div><b>{row._type==="sale"?"বিক্রি":row.description||"খরচ"}</b><small>{dateTimeBn(row._date)} · {row._type==="sale"?(row.seller_name||"মালিক"):"দোকানের খরচ"}</small></div><strong className={row._type==="sale"?"income-text":"outcome-text"}>{row._type==="sale"?"+":"−"} {money(row.amount)}</strong></div>)}</div>:<div className="dk-empty dk-empty-illustrated"><span>🧾</span><b>এখনো কোনো লেনদেন নেই</b><small>প্রথম বিক্রি বা খরচ যোগ করে শুরু করুন।</small></div>}
  </section>
  <section className="dk-subscription-strip"><div className="dk-subscription-intro"><span>👑</span><div><b>{subscription?.status==="active"?"প্রাথমিক প্যাকেজ সক্রিয়":"৭ দিনের ফ্রি ট্রায়াল"}</b><small>{trialCaption}</small></div></div><div className="dk-subscription-price"><b>৳২০০</b><small>/ মাস</small></div><button onClick={()=>onNavigate("subscription")}>{payments.some(p=>p.status==="pending")?"পেমেন্ট যাচাই হচ্ছে":"প্যাকেজ দেখুন"} →</button></section>
  <footer className="dk-footer">দোকানখাতা · আপনার ব্যবসার ডিজিটাল হিসাবখাতা</footer>
 </div>;
}
