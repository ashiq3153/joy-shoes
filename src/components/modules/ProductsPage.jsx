"use client";
import {useMemo,useState} from "react";
import {money} from "../../lib/dokankhata/format";
export default function ProductsPage({shop,rows,onSave,busy,onBack}){
 const [search,setSearch]=useState(""),[name,setName]=useState(""),[code,setCode]=useState(""),[buy,setBuy]=useState("0"),[sell,setSell]=useState("0"),[stock,setStock]=useState("0"),[low,setLow]=useState("0"),[showForm,setShowForm]=useState(false);
 const filtered=useMemo(()=>rows.filter(r=>(r.product_name||"").toLowerCase().includes(search.toLowerCase())||(r.barcode||"").includes(search)||(r.product_code||"").toLowerCase().includes(search.toLowerCase())),[rows,search]);
 const submit=e=>{e.preventDefault();onSave({product_name:name.trim(),product_code:code.trim()||null,purchase_price:Number(buy),selling_price:Number(sell),stock_qty:Number(stock),low_stock_at:Number(low),unit:"piece"},()=>{setName("");setCode("");setBuy("0");setSell("0");setStock("0");setLow("0");setShowForm(false);});};
 return <section className="dk-module-page"><div className="dk-page-title"><button onClick={onBack}>←</button><div><small>পণ্য ব্যবস্থাপনা</small><h1>পণ্য ও স্টক</h1><p>{shop.name} · পণ্য যোগ করুন ও খুঁজুন</p></div><button className="dk-add-round" onClick={()=>setShowForm(v=>!v)}>＋</button></div>
  {showForm?<div className="dk-panel"><div className="dk-section-heading"><h2>নতুন পণ্য যোগ করুন</h2><button className="dk-link-button" onClick={()=>setShowForm(false)}>বন্ধ করুন ×</button></div><form className="dk-form" onSubmit={submit}>
   <label className="dk-field"><span>পণ্যের নাম *</span><input value={name} onChange={e=>setName(e.target.value)} required placeholder="যেমন: লেডিস স্যান্ডেল"/></label>
   <label className="dk-field"><span>পণ্য কোড (ঐচ্ছিক)</span><input value={code} onChange={e=>setCode(e.target.value)}/></label>
   <div className="dk-two-fields"><label className="dk-field"><span>ক্রয় মূল্য</span><input type="number" min="0" step=".01" value={buy} onChange={e=>setBuy(e.target.value)}/></label><label className="dk-field"><span>বিক্রয় মূল্য</span><input type="number" min="0" step=".01" value={sell} onChange={e=>setSell(e.target.value)}/></label></div>
   <div className="dk-two-fields"><label className="dk-field"><span>বর্তমান স্টক</span><input type="number" min="0" step=".001" value={stock} onChange={e=>setStock(e.target.value)}/></label><label className="dk-field"><span>লো-স্টক সতর্কতা</span><input type="number" min="0" step=".001" value={low} onChange={e=>setLow(e.target.value)}/></label></div>
   <button className="dk-primary-button" disabled={busy}>{busy?"সংরক্ষণ হচ্ছে…":"পণ্য সংরক্ষণ করুন"}</button>
  </form></div>:null}
  <div className="dk-search-box"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="পণ্যের নাম, কোড বা বারকোড দিয়ে খুঁজুন…"/></div>
  <div className="dk-panel"><div className="dk-section-heading"><h2>পণ্যের তালিকা</h2><b>{filtered.length} টি</b></div>
   {filtered.length?<div className="dk-product-list">{filtered.map(r=><div className="dk-product-row" key={r.id}><span>📦</span><div><b>{r.product_name}</b><small>{r.product_code||"কোড নেই"} · স্টক {Number(r.stock_qty||0).toLocaleString("bn-BD")}</small></div><div><b>{money(r.selling_price)}</b><small>{Number(r.stock_qty||0)<=Number(r.low_stock_at||0)?"স্টক কম":"স্টক আছে"}</small></div></div>)}</div>:<div className="dk-empty">কোনো পণ্য পাওয়া যায়নি। নতুন পণ্য যোগ করুন।</div>}
  </div></section>;
}
