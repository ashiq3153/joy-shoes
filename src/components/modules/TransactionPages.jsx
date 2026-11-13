"use client";
import {useState} from "react";
import {EXPENSE_CATEGORIES} from "../../lib/dokankhata/constants";
import {money,dateBn} from "../../lib/dokankhata/format";
const today=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Dhaka",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
export function SalesPage({shop,rows,employees=[],onSave,busy,onBack}){
 const [amount,setAmount]=useState(""),[cost,setCost]=useState(""),[date,setDate]=useState(today()),[seller,setSeller]=useState("owner"),[notes,setNotes]=useState("");
 const addKey=key=>setAmount(current=>{if(key==="back")return current.slice(0,-1);if(key==="clear")return "";if(key==="."&&current.includes("."))return current;if(current.includes(".")&&current.split(".")[1].length>=2)return current;return (current==="0"&&key!=="."?key:current+key).slice(0,12);});
 const submit=e=>{e.preventDefault();const chosen=employees.find(row=>row.id===seller);onSave({amount:Number(amount),cost_amount:cost===""?null:Number(cost),sale_date:date,seller_name:chosen?.full_name||null,notes:notes.trim()||null},()=>{setAmount("");setCost("");setSeller("owner");setNotes("");});};
 return <section className="dk-module-page dk-transaction-page">
  <div className="dk-page-title"><button onClick={onBack}>←</button><div><small>SALES ENTRY</small><h1>বিক্রি যোগ করুন</h1><p>{shop.name} · প্রতিটি বিক্রি আলাদা এন্ট্রি</p></div></div>
  <div className="dk-panel dk-amount-panel">
   <form className="dk-form" onSubmit={submit}>
    <label className="dk-field dk-amount-field"><span>বিক্রির পরিমাণ *</span><div className="dk-amount-input"><small>৳</small><input type="number" min=".01" step=".01" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="০.০০" required/></div></label>
    <div className="dk-number-pad">{["1","2","3","4","5","6","7","8","9","00","0","back"].map(key=><button type="button" key={key} onClick={()=>addKey(key)}>{key==="back"?"⌫":key}</button>)}</div>
    <div className="dk-sale-form-extra">
     <label className="dk-field"><span>বিক্রেতা</span><select value={seller} onChange={e=>setSeller(e.target.value)}><option value="owner">মালিক (ডিফল্ট)</option>{employees.filter(row=>row.is_active).map(row=><option key={row.id} value={row.id}>{row.full_name}</option>)}</select></label>
     <label className="dk-field"><span>তারিখ</span><input type="date" value={date} onChange={e=>setDate(e.target.value)} required/></label>
     <label className="dk-field"><span>বিক্রিত পণ্যের মোট আসল (ঐচ্ছিক)</span><input type="number" min="0" step=".01" value={cost} onChange={e=>setCost(e.target.value)} placeholder="মালের ক্রয়মূল্য"/></label>
     <label className="dk-field"><span>নোট (ঐচ্ছিক)</span><textarea rows={2} value={notes} onChange={e=>setNotes(e.target.value)}/></label>
    </div>
    <button className="dk-primary-button dk-transaction-submit" disabled={busy}>{busy?"সংরক্ষণ হচ্ছে…":"বিক্রি যোগ করুন ✓"}</button>
   </form>
  </div>
  <div className="dk-panel"><div className="dk-section-heading"><h2>সাম্প্রতিক বিক্রি</h2><b>{rows.length.toLocaleString("bn-BD")} টি</b></div>
   {rows.length?<div className="dk-record-list">{rows.map(r=><div className="dk-record" key={r.id}><div><b>{money(r.amount)}</b><small>{dateBn(r.sale_date)} · {r.seller_name||"মালিক"}</small></div><span>বিক্রি</span></div>)}</div>:<div className="dk-empty">এখনো বিক্রির হিসাব যোগ হয়নি।</div>}
  </div>
 </section>;
}
export function ExpensesPage({shop,rows,onSave,busy,onBack}){
 const [amount,setAmount]=useState(""),[category,setCategory]=useState("business"),[description,setDescription]=useState(""),[date,setDate]=useState(today()),[notes,setNotes]=useState("");
 const submit=e=>{e.preventDefault();onSave({amount:Number(amount),category,description:description.trim(),expense_date:date,notes:notes.trim()||null},()=>{setAmount("");setDescription("");setNotes("");});};
 return <section className="dk-module-page dk-transaction-page">
  <div className="dk-page-title"><button onClick={onBack}>←</button><div><small>EXPENSE ENTRY</small><h1>খরচ যোগ করুন</h1><p>{shop.name} · খরচের ধরন আলাদা করে রাখুন</p></div></div>
  <div className="dk-panel dk-expense-panel">
   <form className="dk-form" onSubmit={submit}>
    <label className="dk-field dk-amount-field"><span>খরচের পরিমাণ *</span><div className="dk-amount-input dk-amount-expense"><small>৳</small><input type="number" min=".01" step=".01" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="০.০০" required/></div></label>
    <div className="dk-expense-chooser"><b>খরচের ধরন নির্বাচন করুন</b><div className="dk-expense-category-list">{EXPENSE_CATEGORIES.map(x=><button type="button" key={x.id} className={category===x.id?"selected":""} onClick={()=>setCategory(x.id)}><span>{x.icon}</span><b>{x.title}</b>{category===x.id?<i>✓</i>:null}</button>)}</div></div>
    <label className="dk-field"><span>খরচের বিবরণ *</span><input value={description} onChange={e=>setDescription(e.target.value)} placeholder="যেমন: দোকান ভাড়া / চা-নাস্তা" required/></label>
    <label className="dk-field"><span>তারিখ</span><input type="date" value={date} onChange={e=>setDate(e.target.value)} required/></label>
    <label className="dk-field"><span>নোট (ঐচ্ছিক)</span><textarea rows={2} value={notes} onChange={e=>setNotes(e.target.value)}/></label>
    <button className="dk-primary-button dk-transaction-submit dk-expense-submit" disabled={busy}>{busy?"সংরক্ষণ হচ্ছে…":"খরচ যোগ করুন ✓"}</button>
   </form>
  </div>
  <div className="dk-panel"><div className="dk-section-heading"><h2>সাম্প্রতিক খরচ</h2><b>{rows.length.toLocaleString("bn-BD")} টি</b></div>
   {rows.length?<div className="dk-record-list">{rows.map(r=><div className="dk-record" key={r.id}><div><b>{r.description}</b><small>{dateBn(r.expense_date)} · {EXPENSE_CATEGORIES.find(x=>x.id===r.category)?.title||"অন্যান্য"}</small></div><strong className="outcome-text">{money(r.amount)}</strong></div>)}</div>:<div className="dk-empty">এখনো কোনো খরচ যোগ হয়নি।</div>}
  </div>
 </section>;
}
