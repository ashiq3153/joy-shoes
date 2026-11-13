"use client";
import {useState} from "react";
import {EXPENSE_CATEGORIES,PAYMENT_METHODS} from "../../lib/dokankhata/constants";
import {money,dateBn} from "../../lib/dokankhata/format";
const today=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Dhaka"}).format(new Date());
export function SalesPage({shop,rows,onSave,busy,onBack}){
 const [amount,setAmount]=useState(""),[cost,setCost]=useState(""),[date,setDate]=useState(today()),[method,setMethod]=useState("cash"),[seller,setSeller]=useState(""),[notes,setNotes]=useState("");
 const submit=e=>{e.preventDefault();onSave({amount:Number(amount),cost_amount:cost===""?null:Number(cost),sale_date:date,payment_method:method,seller_name:seller.trim()||null,notes:notes.trim()||null},()=>{setAmount("");setCost("");setSeller("");setNotes("");});};
 return <section className="dk-module-page"><div className="dk-page-title"><button onClick={onBack}>←</button><div><small>SALES ENTRY</small><h1>বিক্রি যোগ করুন</h1><p>{shop.name} · প্রতিটি বিক্রি আলাদা এন্ট্রি</p></div></div>
  <div className="dk-panel"><form className="dk-form" onSubmit={submit}>
   <label className="dk-field"><span>বিক্রির পরিমাণ *</span><input type="number" min=".01" step=".01" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="৳ ০.০০" required/></label>
   <label className="dk-field"><span>বিক্রি হওয়া পণ্যের মোট আসল (ঐচ্ছিক)</span><input type="number" min="0" step=".01" value={cost} onChange={e=>setCost(e.target.value)} placeholder="মালের ক্রয়মূল্য"/></label>
   <label className="dk-field"><span>তারিখ</span><input type="date" value={date} onChange={e=>setDate(e.target.value)} required/></label>
   <label className="dk-field"><span>টাকা পেয়েছেন যেভাবে</span><select value={method} onChange={e=>setMethod(e.target.value)}>{PAYMENT_METHODS.map(x=><option key={x.id} value={x.id}>{x.title}</option>)}</select></label>
   <label className="dk-field"><span>বিক্রেতা (ঐচ্ছিক)</span><input value={seller} onChange={e=>setSeller(e.target.value)} placeholder="মালিক / কর্মচারীর নাম"/></label>
   <label className="dk-field"><span>নোট</span><textarea rows={2} value={notes} onChange={e=>setNotes(e.target.value)}/></label>
   <button className="dk-primary-button" disabled={busy}>{busy?"সংরক্ষণ হচ্ছে…":"বিক্রির হিসাব যোগ করুন ✓"}</button>
  </form></div><div className="dk-panel"><div className="dk-section-heading"><h2>সাম্প্রতিক বিক্রি</h2><b>{rows.length} টি</b></div>
   {rows.length?<div className="dk-record-list">{rows.map(r=><div className="dk-record" key={r.id}><div><b>{money(r.amount)}</b><small>{dateBn(r.sale_date)} · {r.seller_name||"মালিক"} · {r.payment_method}</small></div><span>বিক্রি</span></div>)}</div>:<div className="dk-empty">এখনো বিক্রির হিসাব যোগ হয়নি।</div>}
  </div></section>;
}
export function ExpensesPage({shop,rows,onSave,busy,onBack}){
 const [amount,setAmount]=useState(""),[category,setCategory]=useState("business"),[description,setDescription]=useState(""),[date,setDate]=useState(today()),[method,setMethod]=useState("cash"),[notes,setNotes]=useState("");
 const submit=e=>{e.preventDefault();onSave({amount:Number(amount),category,description:description.trim(),expense_date:date,payment_method:method,notes:notes.trim()||null},()=>{setAmount("");setDescription("");setNotes("");});};
 return <section className="dk-module-page"><div className="dk-page-title"><button onClick={onBack}>←</button><div><small>EXPENSE ENTRY</small><h1>খরচ যোগ করুন</h1><p>{shop.name} · খরচের ধরন আলাদা করে রাখুন</p></div></div>
  <div className="dk-panel"><form className="dk-form" onSubmit={submit}>
   <label className="dk-field"><span>খরচের পরিমাণ *</span><input type="number" min=".01" step=".01" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="৳ ০.০০" required/></label>
   <div className="dk-expense-category-list">{EXPENSE_CATEGORIES.map(x=><button type="button" key={x.id} className={category===x.id?"selected":""} onClick={()=>setCategory(x.id)}><span>{x.icon}</span><b>{x.title}</b>{category===x.id?<i>✓</i>:null}</button>)}</div>
   <label className="dk-field"><span>খরচের বিবরণ *</span><input value={description} onChange={e=>setDescription(e.target.value)} placeholder="যেমন: দোকান ভাড়া / চা-নাস্তা" required/></label>
   <label className="dk-field"><span>তারিখ</span><input type="date" value={date} onChange={e=>setDate(e.target.value)} required/></label>
   <label className="dk-field"><span>পেমেন্টের মাধ্যম</span><select value={method} onChange={e=>setMethod(e.target.value)}>{PAYMENT_METHODS.map(x=><option key={x.id} value={x.id}>{x.title}</option>)}</select></label>
   <label className="dk-field"><span>নোট (ঐচ্ছিক)</span><textarea rows={2} value={notes} onChange={e=>setNotes(e.target.value)}/></label>
   <button className="dk-primary-button" disabled={busy}>{busy?"সংরক্ষণ হচ্ছে…":"খরচের হিসাব যোগ করুন ✓"}</button>
  </form></div><div className="dk-panel"><div className="dk-section-heading"><h2>সাম্প্রতিক খরচ</h2><b>{rows.length} টি</b></div>
   {rows.length?<div className="dk-record-list">{rows.map(r=><div className="dk-record" key={r.id}><div><b>{r.description}</b><small>{dateBn(r.expense_date)} · {EXPENSE_CATEGORIES.find(x=>x.id===r.category)?.title||"অন্যান্য"}</small></div><strong className="outcome-text">{money(r.amount)}</strong></div>)}</div>:<div className="dk-empty">এখনো কোনো খরচ যোগ হয়নি।</div>}
  </div></section>;
}
