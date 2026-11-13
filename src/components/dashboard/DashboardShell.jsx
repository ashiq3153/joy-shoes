"use client";
import {useState} from "react";
import {APP_NAV} from "../../lib/dokankhata/constants";
import DokanKhataLogo from "../brand/DokanKhataLogo";
export default function DashboardShell({shop,shops,activeShopId,onSwitchShop,profile,view,onNavigate,onSignOut,children}){
 const [menuOpen,setMenuOpen]=useState(false);
 const choose=next=>{setMenuOpen(false);onNavigate(next);};
 return <div className="dk-app-shell">
  <header className="dk-app-header">
   <button className="dk-hamburger" aria-label="দোকান মেনু খুলুন" aria-expanded={menuOpen} onClick={()=>setMenuOpen(open=>!open)}><span/><span/><span/></button>
   <div className="dk-header-brand"><DokanKhataLogo size={42}/><b>দোকানখাতা</b></div>
   <div className="dk-header-profile"><span className="dk-header-status-dot"/><button className="dk-avatar-button" onClick={()=>onNavigate("profile")} aria-label="প্রোফাইল খুলুন">{profile?.display_name?.slice(0,1)||"◉"}</button></div>
  </header>
  {menuOpen?<div className="dk-mobile-menu-layer">
   <button className="dk-mobile-menu-backdrop" aria-label="মেনু বন্ধ করুন" onClick={()=>setMenuOpen(false)}/>
   <aside className="dk-mobile-menu" aria-label="দোকানের অতিরিক্ত মেনু">
    <div className="dk-mobile-menu-head"><div><small>দোকানের মেনু</small><b>{shop.name}</b></div><button onClick={()=>setMenuOpen(false)} aria-label="বন্ধ করুন">×</button></div>
    <button onClick={()=>choose("products")}><span>📦</span><div><b>পণ্য / স্টক</b><small>পণ্যের তালিকা ও খোঁজ</small></div><i>›</i></button>
    <button onClick={()=>choose("suppliers")}><span>🧰</span><div><b>মহাজন</b><small>সরবরাহকারী ও বাকি</small></div><i>›</i></button>
    <button onClick={()=>choose("employees")}><span>👥</span><div><b>কর্মচারী</b><small>এই দোকানের কর্মী</small></div><i>›</i></button>
    <button onClick={()=>choose("reports")}><span>📊</span><div><b>রিপোর্ট</b><small>বিক্রি ও খরচের সারাংশ</small></div><i>›</i></button>
    <button onClick={()=>choose("subscription")}><span>👑</span><div><b>সাবস্ক্রিপশন</b><small>ট্রায়াল ও প্যাকেজ</small></div><i>›</i></button>
    <button className="dk-mobile-menu-logout" onClick={()=>{setMenuOpen(false);onSignOut();}}><span>↪</span><div><b>লগ আউট</b></div></button>
   </aside>
  </div>:null}
  <div className="dk-main-layout">
   <aside className="dk-sidebar">
    <div className="dk-sidebar-shop"><span>{shop.logo_url?<img src={shop.logo_url} alt=""/>:shop.name.slice(0,1)}</span><div><b>{shop.name}</b><small>দোকান মালিক</small></div></div>
    <nav>{APP_NAV.map(item=><button className={view===item.id?"active":""} key={item.id} onClick={()=>onNavigate(item.id)}><span>{item.icon}</span>{item.title}</button>)}
     <button className={view==="subscription"?"active":""} onClick={()=>onNavigate("subscription")}><span>♛</span>সাবস্ক্রিপশন</button>
     <button className={view==="suppliers"?"active":""} onClick={()=>onNavigate("suppliers")}><span>🧰</span>মহাজন</button>
     <button className={view==="employees"?"active":""} onClick={()=>onNavigate("employees")}><span>👥</span>কর্মচারী</button>
     <button className={view==="reports"?"active":""} onClick={()=>onNavigate("reports")}><span>📊</span>রিপোর্ট</button>
    </nav><button className="dk-signout-button" onClick={onSignOut}>↪ লগ আউট</button>
   </aside>
   <main className="dk-main-area">{children}</main>
  </div>
  <nav className="dk-bottom-nav">{APP_NAV.map(item=><button key={item.id} className={view===item.id?"active":""} onClick={()=>onNavigate(item.id)}><span>{item.icon}</span><small>{item.title}</small></button>)}</nav>
 </div>;
}
