export const todayDhaka=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Dhaka",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());

export const money=value=>"৳ "+Number(value||0).toLocaleString("bn-BD",{maximumFractionDigits:2});

export const dateBn=value=>{
 if(!value)return "—";
 const dateOnly=String(value).slice(0,10);
 return new Intl.DateTimeFormat("bn-BD",{timeZone:"Asia/Dhaka",day:"numeric",month:"long",year:"numeric"})
  .format(new Date(dateOnly+"T00:00:00+06:00"));
};

export const dateTimeBn=value=>value
 ? new Intl.DateTimeFormat("bn-BD",{timeZone:"Asia/Dhaka",dateStyle:"medium",timeStyle:"short"}).format(new Date(value))
 : "—";

export const daysRemaining=value=>value
 ? Math.max(0,Math.ceil((new Date(value).getTime()-Date.now())/86400000))
 : 0;

export function safeImageFile(file){
 if(!file)return "";
 if(!["image/jpeg","image/png","image/webp"].includes(file.type))
  throw new Error("শুধু JPG, PNG অথবা WebP ছবি ব্যবহার করুন।");
 if(file.size>5*1024*1024)
  throw new Error("ছবির আকার ৫ MB-এর মধ্যে রাখুন।");
 return file.type==="image/png"?"png":file.type==="image/webp"?"webp":"jpg";
}
