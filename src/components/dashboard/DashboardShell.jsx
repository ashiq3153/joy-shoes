"use client";
import {useState} from "react";
import {APP_NAV} from "../../lib/dokankhata/constants";
export default function DashboardShell({shop,shops,activeShopId,onSwitchShop,profile,view,onNavigate,onNewShop,onSignOut,children}){
 const [menuOpen,setMenuOpen]=useState(false);
 const choose=(next)=>{setMenuOpen(false);onNavigate(next);};
 return <div className="dk-app-shell">
  <header className="dk-app-header"><button className="dk-hamburger" aria-label="দোকান মেনু খুলুন" aria-expanded={menuOpen} onClick={()=>setMenuOpen(open=>!open)}>☰</button><div className="dk-header-brand"><span>▤</span><b>DokanKhata</b></div>
   {shops.length>1?<select className="dk-header-shop-select" value={activeShopId} onChange={e=>onSwitchShop(e.target.value)}>{shops.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>:<span className="dk-header-shop-name">{shop.name}</span>}
   <button className="dk-avatar-button" onClick={()=>onNavigate("profile")}>{profile?.display_name?.slice(0,1)||"◉"}</button>
  </header>
  {menuOpen?<div className="dk-mobile-menu-layer">
   <button className="dk-mobile-menu-backdrop" aria-label="মেনু বন্ধ করুন" onClick={()=>setMenuOpen(false)}/>
   <aside className="dk-mobile-menu" aria-label="দোকানের অতিরিক্ত মেনু">
    <div className="dk-mobile-menu-head"><div><small>SHOP MENU</small><b>{shop.name}</b></div><button onClick={()=>setMenuOpen(false)} aria-label="বন্ধ করুন">×</button></div>
    <button onClick={()=>choose("suppliers")}><span>🧰</span><div><b>মহাজন</b><small>সরবরাহকারী ও বাকি</small></div><i>›</i></button>
    <button onClick={()=>choose("employees")}><span>👥</span><div><b>কর্মচারী</b><small>এই দোকানের কর্মী</small></div><i>›</i></button>
    <button onClick={()=>choose("reports")}><span>▤</span><div><b>রিপোর্ট</b><small>বিক্রি ও খরচের সারাংশ</small></div><i>›</i></button>
    <button onClick={()=>choose("subscription")}><span>👑</span><div><b>সাবস্ক্রিপশন</b><small>ট্রায়াল ও প্যাকেজ</small></div><i>›</i></button>
    <button onClick={()=>{setMenuOpen(false);onNewShop();}}><span>＋</span><div><b>নতুন দোকান</b><small>আরেকটি দোকান যোগ করুন</small></div><i>›</i></button>
    <button className="dk-mobile-menu-logout" onClick={()=>{setMenuOpen(false);onSignOut();}}><span>↪</span><div><b>লগ আউট</b></div></button>
   </aside>
  </div>:null}
  <div className="dk-main-layout"><aside className="dk-sidebar">
   <div className="dk-sidebar-shop"><span>{shop.logo_url?<img src={shop.logo_url} alt=""/>:shop.name.slice(0,1)}</span><div><b>{shop.name}</b><small>দোকান মালিক</small></div></div>
   <button className="dk-new-shop-button" onClick={onNewShop}>＋ নতুন দোকান যোগ করুন</button>
   <nav>{APP_NAV.map(item=><button className={view===item.id?"active":""} key={item.id} onClick={()=>onNavigate(item.id)}><span>{item.icon}</span>{item.title}</button>)}
    <button className={view==="subscription"?"active":""} onClick={()=>onNavigate("subscription")}><span>♛</span>সাবস্ক্রিপশন</button>
    <button className={view==="suppliers"?"active":""} onClick={()=>onNavigate("suppliers")}><span>🧰</span>মহাজন</button>
    <button className={view==="employees"?"active":""} onClick={()=>onNavigate("employees")}><span>👥</span>কর্মচারী</button>
    <button className={view==="reports"?"active":""} onClick={()=>onNavigate("reports")}><span>▤</span>রিপোর্ট</button>
   </nav><button className="dk-signout-button" onClick={onSignOut}>↪ লগ আউট</button>
  </aside><main className="dk-main-area"><div className="dk-mobile-welcome"><span>স্বাগতম, {profile?.display_name||"দোকান মালিক"}</span><button onClick={onNewShop}>＋ দোকান</button></div>{children}</main></div>
  <nav className="dk-bottom-nav">{APP_NAV.map(item=><button key={item.id} className={view===item.id?"active":""} onClick={()=>onNavigate(item.id)}><span>{item.icon}</span><small>{item.title}</small></button>)}</nav>
 </div>;
}
