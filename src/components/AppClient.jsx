"use client";

import {useCallback,useEffect,useMemo,useRef,useState} from "react";
import {createClient} from "../../lib/supabase/client";
import AuthPanel from "./auth/AuthPanel";
import ShopSetupWizard from "./onboarding/ShopSetupWizard";
import DashboardShell from "./dashboard/DashboardShell";
import DashboardHome from "./dashboard/DashboardHome";
import {SalesPage,ExpensesPage} from "./modules/TransactionPages";
import ProductsPage from "./modules/ProductsPage";
import SuppliersPage from "./modules/SuppliersPage";
import EmployeesPage from "./modules/EmployeesPage";
import ShopProfilePage from "./profile/ShopProfilePage";
import SubscriptionPage from "./subscription/SubscriptionPage";
import {safeImageFile} from "../lib/dokankhata/format";

const EMPTY={sales:[],expenses:[],products:[],suppliers:[],supplierLedger:[],employees:[],subscription:null,payments:[]};

export default function AppClient(){
 const supabase=useMemo(()=>createClient(),[]);
 const [session,setSession]=useState(null),[authReady,setAuthReady]=useState(false);
 const [shops,setShops]=useState([]),[activeShopId,setActiveShopId]=useState("");
 const [profile,setProfile]=useState(null),[data,setData]=useState(EMPTY);
 const [view,setView]=useState("home"),[busy,setBusy]=useState(false),[loading,setLoading]=useState(false);
 const [authError,setAuthError]=useState(""),[notice,setNotice]=useState(""),[flash,setFlash]=useState("");
 const requestSequence=useRef(0);
 const activeShop=shops.find(s=>s.id===activeShopId)||shops[0]||null;
 const primaryShopId=shops[0]?.id||"";
 const legacyEnabled=!!activeShop&&activeShop.id===primaryShopId;

 useEffect(()=>{
  let alive=true;
  supabase.auth.getSession().then(({data})=>{if(alive){setSession(data.session);setAuthReady(true);}});
  const {data:listener}=supabase.auth.onAuthStateChange((_event,next)=>{if(alive)setSession(next);});
  return ()=>{alive=false;listener.subscription.unsubscribe();};
 },[supabase]);

 useEffect(()=>{
  if(!session?.user?.id){requestSequence.current+=1;setShops([]);setActiveShopId("");setProfile(null);setData(EMPTY);return;}
  let alive=true;
  (async()=>{
   setLoading(true);setAuthError("");
   try{
    const user=session.user;
    const {error:ownerError}=await supabase.from("owners").upsert({id:user.id},{onConflict:"id"});
    if(ownerError)throw ownerError;
    const {data:existingProfile,error:profileReadError}=await supabase.from("owner_profiles").select("*").eq("user_id",user.id).maybeSingle();
    if(profileReadError)throw profileReadError;
    let profileRow=existingProfile;
    if(!profileRow){
     const {data:createdProfile,error:profileWriteError}=await supabase.from("owner_profiles").insert({
      user_id:user.id,display_name:user.user_metadata?.display_name||user.email?.split("@")[0]||"দোকান মালিক",
      phone:user.user_metadata?.phone||null
     }).select("*").single();
     if(profileWriteError)throw profileWriteError;
     profileRow=createdProfile;
    }
    const {data:shopRows,error:shopError}=await supabase.from("shops").select("*").eq("owner_id",user.id).order("created_at",{ascending:true});
    if(shopError)throw shopError;
    if(!alive)return;
    setProfile(profileRow);setShops(shopRows||[]);
    setActiveShopId(current=>(shopRows||[]).some(s=>s.id===current)?current:(shopRows?.[0]?.id||""));
   }catch(error){if(alive)setAuthError("অ্যাকাউন্টের তথ্য লোড হয়নি: "+(error.message||"আবার লগইন করুন"));}
   finally{if(alive)setLoading(false);}
  })();
  return ()=>{alive=false;};
 },[session?.user?.id,supabase]);

 const refreshShopData=useCallback(async(shopId)=>{
  const requestId=++requestSequence.current;
  if(!shopId){setData(EMPTY);return;}
  setData(EMPTY);setLoading(true);
  try{
   const [sales,expenses,products,subs,payments,suppliers,supplierLedger,employees]=await Promise.all([
    supabase.from("shop_sales").select("*").eq("shop_id",shopId).order("sold_at",{ascending:false}).limit(200),
    supabase.from("shop_expenses").select("*").eq("shop_id",shopId).order("expense_date",{ascending:false}).limit(200),
    supabase.from("products").select("*").eq("shop_id",shopId).eq("is_active",true).order("product_name").limit(500),
    supabase.from("subscriptions").select("*").eq("shop_id",shopId).maybeSingle(),
    supabase.from("subscription_payments").select("*").eq("shop_id",shopId).order("submitted_at",{ascending:false}).limit(50),
    supabase.from("suppliers").select("*").eq("shop_id",shopId).order("created_at",{ascending:false}),
    supabase.from("supplier_ledger_view").select("*").eq("shop_id",shopId).order("owner_name"),
    supabase.from("employees").select("*").eq("shop_id",shopId).order("created_at",{ascending:false})
   ]);
   const failed=[sales,expenses,products,subs,payments,suppliers,supplierLedger,employees].find(r=>r.error);
   if(failed)throw failed.error;
   if(requestId!==requestSequence.current)return;
   setData({sales:sales.data||[],expenses:expenses.data||[],products:products.data||[],suppliers:suppliers.data||[],supplierLedger:supplierLedger.data||[],employees:employees.data||[],subscription:subs.data||null,payments:payments.data||[]});
  }catch(error){
   if(requestId===requestSequence.current)setFlash("দোকানের তথ্য রিফ্রেশ হয়নি: "+(error.message||"আবার চেষ্টা করুন"));
  }finally{
   if(requestId===requestSequence.current)setLoading(false);
  }
 },[supabase]);

 useEffect(()=>{
  if(activeShop?.id)refreshShopData(activeShop.id);
  else {requestSequence.current+=1;setData(EMPTY);}
 },[activeShop?.id,refreshShopData]);

 async function login({email,password}){
  setBusy(true);setAuthError("");setNotice("");
  try{const {error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;}
  catch(error){setAuthError(error.message||"লগইন করা যায়নি।");}
  finally{setBusy(false);}
 }

 async function forgotPassword({email}){
  setBusy(true);setAuthError("");setNotice("");
  try{
   const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+"/reset-password"});
   if(error)throw error;
   setNotice("পাসওয়ার্ড পরিবর্তনের লিংক আপনার ইমেইলে পাঠানো হয়েছে।");
  }catch(error){setAuthError(error.message||"পুনরুদ্ধারের লিংক পাঠানো যায়নি।");}
  finally{setBusy(false);}
 }

 async function signup({name,phone,email,password}){
  setBusy(true);setAuthError("");setNotice("");
  try{
   const {data:result,error}=await supabase.auth.signUp({email,password,options:{data:{display_name:name,phone}}});
   if(error)throw error;
   setNotice(result.session?"অ্যাকাউন্ট তৈরি হয়েছে। এবার দোকানের তথ্য দিন।":"রেজিস্ট্রেশন হয়েছে। ইমেইলে পাঠানো লিংক নিশ্চিত করে আবার লগইন করুন।");
  }catch(error){setAuthError(error.message||"অ্যাকাউন্ট তৈরি করা যায়নি।");}
  finally{setBusy(false);}
 }

 async function uploadImage(shopId,file,kind){
  if(!file)return null;
  const userId=session?.user?.id;
  if(!userId||!shopId)throw new Error("দোকানের ছবি আপলোড করতে লগইন করুন।");
  const extension=safeImageFile(file);
  const path=userId+"/"+shopId+"/"+kind+"-"+Date.now()+"."+extension;
  const {error}=await supabase.storage.from("dokankhata-shop-media").upload(path,file,{
   cacheControl:"3600",contentType:file.type,upsert:false
  });
  if(error)throw error;
  const {data:publicData}=supabase.storage.from("dokankhata-shop-media").getPublicUrl(path);
  return publicData.publicUrl;
 }

 async function createShop(payload){
  if(!session?.user?.id)return;
  setBusy(true);setFlash("");
  try{
   const {data:createdShopId,error:createError}=await supabase.rpc("create_shop_with_trial",{
    p_name:payload.name,
    p_category:payload.category,
    p_phone:payload.phone||null,
    p_address:payload.address||null
   });
   if(createError)throw createError;
   const {data:created,error:readError}=await supabase.from("shops").select("*").eq("id",createdShopId).single();
   if(readError)throw readError;
   let updated=created;
   const mediaResults=await Promise.all([
    payload.logo?uploadImage(created.id,payload.logo,"logo").then(url=>({url})).catch(error=>({error})):Promise.resolve({url:null}),
    payload.cover?uploadImage(created.id,payload.cover,"cover").then(url=>({url})).catch(error=>({error})):Promise.resolve({url:null})
   ]);
   const mediaPatch={};
   if(mediaResults[0].url)mediaPatch.logo_url=mediaResults[0].url;
   if(mediaResults[1].url)mediaPatch.cover_url=mediaResults[1].url;
   if(Object.keys(mediaPatch).length){
    const {data:row,error:updateError}=await supabase.from("shops").update(mediaPatch).eq("id",created.id).eq("owner_id",session.user.id).select("*").single();
    if(updateError)throw updateError;
    updated=row;
   }
   const mediaErrors=mediaResults.filter(result=>result.error);
   const mediaWarning=mediaErrors.length
    ?" দোকান তৈরি হয়েছে, তবে "+mediaErrors.length+"টি ছবি আপলোড হয়নি: "+mediaErrors.map(result=>result.error.message).join(" / ")
    :"";
   setShops(old=>[...old,updated]);setActiveShopId(updated.id);setView("home");
   await refreshShopData(updated.id);setFlash("আপনার নতুন দোকান তৈরি হয়েছে। ৭ দিনের ফ্রি ট্রায়াল শুরু হয়েছে।"+mediaWarning);
  }catch(error){setFlash("দোকান তৈরি হয়নি: "+(error.message||"আবার চেষ্টা করুন"));}
  finally{setBusy(false);}
 }

 async function saveShop(payload){
  if(!activeShop)return;setBusy(true);setFlash("");
  try{
   const mediaResults=await Promise.all([
    payload.logo?uploadImage(activeShop.id,payload.logo,"logo").then(url=>({url})).catch(error=>({error})):Promise.resolve({url:null}),
    payload.cover?uploadImage(activeShop.id,payload.cover,"cover").then(url=>({url})).catch(error=>({error})):Promise.resolve({url:null})
   ]);
   const patch={name:payload.name,category:payload.category,phone:payload.phone||null,address:payload.address||null,updated_at:new Date().toISOString()};
   if(mediaResults[0].url)patch.logo_url=mediaResults[0].url;
   if(mediaResults[1].url)patch.cover_url=mediaResults[1].url;
   const {data:updated,error}=await supabase.from("shops").update(patch).eq("id",activeShop.id).eq("owner_id",session.user.id).select("*").single();
   if(error)throw error;
   setShops(old=>old.map(s=>s.id===updated.id?updated:s));
   const mediaErrors=mediaResults.filter(result=>result.error);
   setFlash(mediaErrors.length
    ?"দোকানের তথ্য সংরক্ষণ হয়েছে, তবে "+mediaErrors.length+"টি ছবি আপলোড হয়নি: "+mediaErrors.map(result=>result.error.message).join(" / ")
    :"দোকানের প্রোফাইল আপডেট হয়েছে।");
  }catch(error){setFlash("প্রোফাইল আপডেট হয়নি: "+(error.message||"আবার চেষ্টা করুন"));}
  finally{setBusy(false);}
 }

 async function saveOwnerProfile(payload){
  setBusy(true);setFlash("");
  try{
   const {data:updated,error}=await supabase.from("owner_profiles").update({
    display_name:payload.display_name,phone:payload.phone,updated_at:new Date().toISOString()
   }).eq("user_id",session.user.id).select("*").single();
   if(error)throw error;setProfile(updated);setFlash("মালিকের তথ্য আপডেট হয়েছে।");
  }catch(error){setFlash("মালিকের তথ্য আপডেট হয়নি: "+error.message);}
  finally{setBusy(false);}
 }

 async function saveSale(payload,reset){
  setBusy(true);setFlash("");
  try{
   const {error}=await supabase.from("shop_sales").insert({...payload,shop_id:activeShop.id,owner_id:session.user.id,created_by:session.user.id});
   if(error)throw error;reset();await refreshShopData(activeShop.id);setFlash("বিক্রির হিসাব সংরক্ষণ হয়েছে。");
  }catch(error){setFlash("বিক্রির হিসাব সংরক্ষণ হয়নি: "+error.message);}
  finally{setBusy(false);}
 }

 async function saveExpense(payload,reset){
  setBusy(true);setFlash("");
  try{
   const {error}=await supabase.from("shop_expenses").insert({...payload,shop_id:activeShop.id,owner_id:session.user.id,created_by:session.user.id});
   if(error)throw error;reset();await refreshShopData(activeShop.id);setFlash("খরচের হিসাব সংরক্ষণ হয়েছে।");
  }catch(error){setFlash("খরচ সংরক্ষণ হয়নি: "+error.message);}
  finally{setBusy(false);}
 }

 async function saveSupplier(payload,reset){
  setBusy(true);setFlash("");
  try{
   const {error}=await supabase.from("suppliers").insert({
    ...payload,shop_id:activeShop.id,owner_id:session.user.id
   });
   if(error)throw error;
   reset();await refreshShopData(activeShop.id);setFlash("মহাজনের তথ্য সংরক্ষণ হয়েছে।");
  }catch(error){setFlash("মহাজন যোগ হয়নি: "+error.message);}
  finally{setBusy(false);}
 }

 async function saveEmployee(payload,reset){
  setBusy(true);setFlash("");
  try{
   const {error}=await supabase.from("employees").insert({
    ...payload,shop_id:activeShop.id,owner_id:session.user.id,is_active:true
   });
   if(error)throw error;
   reset();await refreshShopData(activeShop.id);setFlash("কর্মচারীর তথ্য সংরক্ষণ হয়েছে।");
  }catch(error){setFlash("কর্মচারী যোগ হয়নি: "+error.message);}
  finally{setBusy(false);}
 }

 async function saveProduct(payload,reset){
  setBusy(true);setFlash("");
  try{
   const {error}=await supabase.from("products").insert({...payload,shop_id:activeShop.id,created_by:session.user.id});
   if(error)throw error;reset();await refreshShopData(activeShop.id);setFlash("পণ্য যোগ হয়েছে।");
  }catch(error){setFlash("পণ্য যোগ হয়নি: "+error.message);}
  finally{setBusy(false);}
 }

 async function submitPayment(payload,reset){
  if(!data.subscription){setFlash("সাবস্ক্রিপশন পাওয়া যায়নি।");return;}
  setBusy(true);setFlash("");
  try{
   const {error}=await supabase.from("subscription_payments").insert({
    ...payload,shop_id:activeShop.id,owner_id:session.user.id,subscription_id:data.subscription.id,amount:200
   });
   if(error)throw error;reset();await refreshShopData(activeShop.id);
   setFlash("পেমেন্ট যাচাইয়ের জন্য জমা হয়েছে। অনুমোদন না হওয়া পর্যন্ত Pending থাকবে।");
  }catch(error){setFlash("পেমেন্ট জমা হয়নি: "+error.message);}
  finally{setBusy(false);}
 }

 async function signOut(){await supabase.auth.signOut();setView("home");setFlash("");}
 function navigate(next){
  if(next==="menu"){setView("menu");return;}
  if(next==="workspace"){
   if(!legacyEnabled){setFlash("পুরোনো হিসাব মডিউল আপাতত প্রথম দোকানের জন্য সংরক্ষিত। এই দোকানের জন্য আলাদা হিসাব মডিউল যোগ করা বাকি।");return;}
   window.location.href="/workspace";return;
  }
  setView(next);setFlash("");window.scrollTo({top:0,behavior:"smooth"});
 }

 if(!authReady||(!session&&loading))return <div className="dk-loading"><span className="dk-spinner"/><b>DokanKhata</b><small>নিরাপদে প্রস্তুত হচ্ছে…</small></div>;
 if(!session)return <AuthPanel onLogin={login} onSignup={signup} onForgotPassword={forgotPassword} busy={busy} notice={notice} error={authError}/>;
 if(loading&&!shops.length)return <div className="dk-loading"><span className="dk-spinner"/><b>দোকানের তথ্য লোড হচ্ছে…</b></div>;
 if(authError&&!shops.length)return <div className="dk-blocking-error">{authError}<button onClick={()=>window.location.reload()}>আবার চেষ্টা করুন</button></div>;
 if(!shops.length)return <ShopSetupWizard onCreate={createShop} busy={busy}/>;
 if(view==="new-shop")return <ShopSetupWizard onCreate={createShop} onCancel={()=>setView("home")} busy={busy}/>;

 let content;
 if(view==="home")content=<DashboardHome shop={activeShop} profile={profile} sales={data.sales} expenses={data.expenses} products={data.products} subscription={data.subscription} payments={data.payments} onNavigate={navigate} onNewShop={()=>setView("new-shop")} onSwitchShop={setActiveShopId} shops={shops} activeShopId={activeShopId}/>;
 else if(view==="sales")content=<SalesPage shop={activeShop} rows={data.sales} employees={data.employees} onSave={saveSale} busy={busy} onBack={()=>setView("home")}/>;
 else if(view==="expenses")content=<ExpensesPage shop={activeShop} rows={data.expenses} onSave={saveExpense} busy={busy} onBack={()=>setView("home")}/>;
 else if(view==="products")content=<ProductsPage shop={activeShop} rows={data.products} onSave={saveProduct} busy={busy} onBack={()=>setView("home")}/>;
 else if(view==="suppliers")content=<SuppliersPage shop={activeShop} rows={data.suppliers} ledger={data.supplierLedger} onSave={saveSupplier} busy={busy} onBack={()=>setView("home")}/>;
 else if(view==="employees")content=<EmployeesPage shop={activeShop} rows={data.employees} onSave={saveEmployee} busy={busy} onBack={()=>setView("home")}/>;
 else if(view==="profile")content=<ShopProfilePage shop={activeShop} profile={profile} onSaveShop={saveShop} onSaveProfile={saveOwnerProfile} busy={busy} onBack={()=>setView("home")}/>;
 else if(view==="subscription")content=<SubscriptionPage shop={activeShop} subscription={data.subscription} payments={data.payments} onSubmitPayment={submitPayment} busy={busy} onBack={()=>setView("home")}/>;
 else if(view==="reports")content=<section className="dk-module-page"><div className="dk-page-title"><button onClick={()=>setView("home")}>←</button><div><small>SHOP REPORT</small><h1>দোকানের রিপোর্ট</h1><p>বর্তমান দোকানের নতুন হিসাব থেকে রিপোর্ট</p></div></div><div className="dk-panel"><h2>সারাংশ</h2><div className="dk-report-lines"><p>মোট বিক্রি <b>{data.sales.reduce((n,x)=>n+Number(x.amount||0),0).toLocaleString("bn-BD")} টাকা</b></p><p>মোট খরচ <b>{data.expenses.reduce((n,x)=>n+Number(x.amount||0),0).toLocaleString("bn-BD")} টাকা</b></p><p>পণ্য <b>{data.products.length} টি</b></p></div><small className="dk-muted">এটি নতুন দোকানভিত্তিক এন্ট্রির সারাংশ। পুরোনো হিসাবের সম্পূর্ণ মাইগ্রেশন এখনো বাকি।</small></div></section>;
 else content=<section className="dk-module-page"><div className="dk-panel"><h2>এই স্ক্রিনটি পাওয়া যায়নি</h2><p className="dk-muted">হোমে ফিরে প্রয়োজনীয় মডিউল খুলুন।</p><button className="dk-primary-button" onClick={()=>setView("home")}>হোমে ফিরে যান</button></div></section>;

 return <DashboardShell shop={activeShop} shops={shops} activeShopId={activeShopId} onSwitchShop={id=>{setActiveShopId(id);setView("home");}} profile={profile} view={view} onNavigate={navigate} onNewShop={()=>setView("new-shop")} onSignOut={signOut}>
  {flash?<div className="dk-flash" role="status">{flash}<button onClick={()=>setFlash("")}>×</button></div>:null}
  {content}{busy?<div className="dk-saving"><span className="dk-spinner"/> সংরক্ষণ হচ্ছে…</div>:null}
 </DashboardShell>;
}
