"use client";
import {APP_NAV} from "../../lib/dokankhata/constants";
export default function DashboardShell({shop,shops,activeShopId,onSwitchShop,profile,view,onNavigate,onNewShop,onSignOut,children}){
 return <div className="dk-app-shell">
  <header className="dk-app-header"><button className="dk-hamburger" onClick={()=>onNavigate("menu")}>☰</button><div className="dk-header-brand"><span>▤</span><b>DokanKhata</b></div>
   {shops.length>1?<select className="dk-header-shop-select" value={activeShopId} onChange={e=>onSwitchShop(e.target.value)}>{shops.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>:<span className="dk-header-shop-name">{shop.name}</span>}
   <button className="dk-avatar-button" onClick={()=>onNavigate("profile")}>{profile?.display_name?.slice(0,1)||"◉"}</button>
  </header>
  <div className="dk-main-layout"><aside className="dk-sidebar">
   <div className="dk-sidebar-shop"><span>{shop.logo_url?<img src={shop.logo_url} alt=""/>:shop.name.slice(0,1)}</span><div><b>{shop.name}</b><small>দোকান মালিক</small></div></div>
   <button className="dk-new-shop-button" onClick={onNewShop}>＋ নতুন দোকান যোগ করুন</button>
   <nav>{APP_NAV.map(item=><button className={view===item.id?"active":""} key={item.id} onClick={()=>onNavigate(item.id)}><span>{item.icon}</span>{item.title}</button>)}
    <button className={view==="subscription"?"active":""} onClick={()=>onNavigate("subscription")}><span>♛</span>সাবস্ক্রিপশন</button>
    <button onClick={()=>onNavigate("workspace")}><span>▣</span>মহাজন ও অন্যান্য হিসাব</button>
   </nav><button className="dk-signout-button" onClick={onSignOut}>↪ লগ আউট</button>
  </aside><main className="dk-main-area"><div className="dk-mobile-welcome"><span>স্বাগতম, {profile?.display_name||"দোকান মালিক"}</span><button onClick={onNewShop}>＋ দোকান</button></div>{children}</main></div>
  <nav className="dk-bottom-nav">{APP_NAV.map(item=><button key={item.id} className={view===item.id?"active":""} onClick={()=>onNavigate(item.id)}><span>{item.icon}</span><small>{item.title}</small></button>)}</nav>
 </div>;
}
