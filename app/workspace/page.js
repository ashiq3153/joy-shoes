"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../lib/supabase/client";

const PAYMENT_METHODS = [
  ["cash", "নগদ"],
  ["bkash", "বিকাশ"],
  ["nagad", "নগদ (Nagad)"],
  ["rocket", "রকেট"],
  ["bank", "ব্যাংক"],
  ["other", "অন্যান্য"]
];
const EXPENSE_CATEGORIES = [
  ["business", "দোকানের খরচ"],
  ["household_withdrawal", "নিজের / পরিবারের জন্য তোলা"],
  ["other", "অন্যান্য খরচ"]
];
const SHOP_CATEGORIES = [
  ["footwear", "জুতা ও ফুটওয়্যার"],
  ["cosmetics", "কসমেটিকস"],
  ["grocery", "মুদি দোকান"],
  ["clothing", "কাপড় ও পোশাক"],
  ["electronics", "ইলেকট্রনিক্স"],
  ["other", "অন্যান্য ব্যবসা"]
];
const freshLine = () => ({ model_name: "", quantity_pairs: "1", unit_cost: "" });
const todayBD = () => new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit"
}).format(new Date());
const money = (value) => "৳ " + Number(value || 0).toLocaleString("bn-BD", {
  maximumFractionDigits: 2
});
const dateText = (value) => value
  ? new Date(value + "T00:00:00").toLocaleDateString("bn-BD")
  : "—";
const addDays = (dateString, count) => {
  const d = new Date(dateString + "T00:00:00");
  d.setDate(d.getDate() + count);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit"
  }).format(d);
};
const monthStart = (dateString) => dateString.slice(0, 7) + "-01";
const sum = (items, key) => items.reduce((total, item) => total + Number(item[key] || 0), 0);

function Field({ label, value, onChange, type = "text", placeholder = "", required = false, min, step, disabled = false }) {
  return <label className="field-wrap">
    <span>{label}</span>
    <input
      className="field-control"
      type={type}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      min={min}
      step={step}
      disabled={disabled}
      inputMode={type === "number" ? "decimal" : undefined}
    />
  </label>;
}

function SelectField({ label, value, onChange, options, placeholder = "নির্বাচন করুন", required = true, emptyActionLabel, onEmptyAction }) {
  return <div className="select-field-shell">
    <label className="field-wrap">
      <span>{label}</span>
      <select className="field-control" value={value} onChange={(e) => onChange(e.target.value)} required={required}>
        <option value="">{options.length ? placeholder : "এখনো কেউ যোগ করা হয়নি"}</option>
        {options.map(([v, text]) => <option value={v} key={v}>{text}</option>)}
      </select>
    </label>
    {!options.length && emptyActionLabel && onEmptyAction ? <button type="button" className="empty-select-action" onClick={onEmptyAction}>＋ {emptyActionLabel}</button> : null}
  </div>;
}

function TextArea({ label, value, onChange, placeholder = "" }) {
  return <label className="field-wrap">
    <span>{label}</span>
    <textarea className="field-control textarea-control" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} />
  </label>;
}

function PageHead({ eyebrow, title, subtitle, onBack }) {
  return <div className="page-head">
    <button type="button" className="back-btn" onClick={onBack}>← ড্যাশবোর্ড</button>
    <small>{eyebrow}</small>
    <h2>{title}</h2>
    {subtitle ? <p>{subtitle}</p> : null}
  </div>;
}

function Stat({ label, value, tone = "green", hint }) {
  return <div className={"stat-card " + tone}>
    <span>{label}</span>
    <strong>{value}</strong>
    {hint ? <small>{hint}</small> : null}
  </div>;
}

function Empty({ children = "এখনো কোনো হিসাব যোগ করা হয়নি।" }) {
  return <div className="empty-state"><span>📭</span><p>{children}</p></div>;
}

function LineItems({ items, setItems, isReturn = false }) {
  const update = (index, key, value) => setItems((old) => old.map((item, i) => i === index ? { ...item, [key]: value } : item));
  const total = items.reduce((s, item) => s + Number(item.quantity_pairs || 0) * Number(item.unit_cost || 0), 0);
  return <div className="line-items">
    <div className="line-head"><b>{isReturn ? "ফেরত মালের তালিকা" : "কেনা মালের তালিকা"}</b><span>{items.length} টি আইটেম</span></div>
    {items.map((item, index) => <div className="line-row" key={index}>
      <Field label="মডেল / ডিজাইন" value={item.model_name} onChange={(v) => update(index, "model_name", v)} placeholder="যেমন: স্যান্ডেল কালো" required />
      <div className="line-numbers">
        <Field label="জোড়া" type="number" min="1" step="1" value={item.quantity_pairs} onChange={(v) => update(index, "quantity_pairs", v)} required />
        <Field label="প্রতি জোড়ার আসল" type="number" min="0" step="0.01" value={item.unit_cost} onChange={(v) => update(index, "unit_cost", v)} required />
      </div>
      <div className="line-total"><span>লাইন মোট</span><b>{money(Number(item.quantity_pairs || 0) * Number(item.unit_cost || 0))}</b>
        {items.length > 1 ? <button type="button" className="remove-line" onClick={() => setItems((old) => old.filter((_, i) => i !== index))}>এই লাইন বাদ দিন</button> : null}
      </div>
    </div>)}
    <button className="add-line" type="button" onClick={() => setItems((old) => [...old, freshLine()])}>＋ আরেকটি মাল যোগ করুন</button>
    <div className="grand-total"><span>{isReturn ? "মোট ফেরত মূল্য" : "সর্বমোট ক্রয়"}</span><strong>{money(total)}</strong></div>
  </div>;
}

export default function Home() {
  const supabase = useMemo(() => createClient(), []);
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [flash, setFlash] = useState("");
  const [active, setActive] = useState("dashboard");
  const [data, setData] = useState({
    sales: [], suppliers: [], ledger: [], purchases: [], purchaseItems: [],
    payments: [], returns: [], returnItems: [], employees: [], employeeSales: [],
    expenses: [], movements: [], closings: []
  });
  const today = todayBD();

  const [saleForm, setSaleForm] = useState({ sale_date: today, entry_mode: "total_only", total_sales: "", cost_of_goods_sold: "", notes: "" });
  const [supplierForm, setSupplierForm] = useState({ owner_name: "", shop_name: "", phone: "", address: "", location_text: "", opening_balance: "0", notes: "" });
  const [supplierPhoto, setSupplierPhoto] = useState(null);
  const [purchaseForm, setPurchaseForm] = useState({ supplier_id: "", purchase_date: today, invoice_number: "", amount_paid: "0", payment_method: "cash", reference_note: "", notes: "" });
  const [purchaseLines, setPurchaseLines] = useState([freshLine()]);
  const [memoFile, setMemoFile] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ supplier_id: "", payment_date: today, amount: "", payment_method: "cash", reference_note: "", notes: "" });
  const [returnForm, setReturnForm] = useState({ supplier_id: "", return_date: today, settlement_type: "credit_adjustment", notes: "" });
  const [returnLines, setReturnLines] = useState([freshLine()]);
  const [employeeForm, setEmployeeForm] = useState({ full_name: "", phone: "", notes: "" });
  const [employeeSaleForm, setEmployeeSaleForm] = useState({ employee_id: "", sale_date: today, sales_amount: "", notes: "" });
  const [expenseForm, setExpenseForm] = useState({ expense_date: today, category: "business", description: "", amount: "", payment_method: "cash", notes: "" });
  const [closingForm, setClosingForm] = useState({
    closing_date: today, opening_cash: "0", cash_sales: "0", other_cash_receipts: "0",
    supplier_cash_payments: "0", cash_expenses: "0", household_withdrawals: "0",
    employee_collections: "0", actual_cash: "", notes: ""
  });
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [staffPeriod, setStaffPeriod] = useState("month");
  const [shop, setShop] = useState(null);
  const [shopLoading, setShopLoading] = useState(true);
  const [shopForm, setShopForm] = useState({ name: "", category: "footwear", phone: "", address: "" });
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [productForm, setProductForm] = useState({
    product_name: "", product_code: "", category: "", brand: "", barcode: "",
    purchase_price: "0", selling_price: "0", stock_qty: "0", low_stock_at: "0", unit: "piece"
  });
  const [productLoading, setProductLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data: result }) => {
      if (alive) {
        setSession(result.session);
        setAuthReady(true);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (alive) setSession(nextSession);
    });
    return () => {
      alive = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  async function refreshData(userId, shopId) {
    setLoadingData(true);
    try {
      const requests = [
        supabase.from("daily_sales").select("*").eq("owner_id", userId).order("sale_date", { ascending: false }).limit(180),
        supabase.from("suppliers").select("*").eq("owner_id", userId).eq("shop_id", shopId).order("created_at", { ascending: false }),
        supabase.from("supplier_ledger_view").select("*").eq("owner_id", userId).eq("shop_id", shopId).order("owner_name"),
        supabase.from("purchases").select("*").eq("owner_id", userId).order("purchase_date", { ascending: false }).limit(100),
        supabase.from("purchase_items").select("*").eq("owner_id", userId).limit(500),
        supabase.from("supplier_payments").select("*").eq("owner_id", userId).order("payment_date", { ascending: false }).limit(100),
        supabase.from("purchase_returns").select("*").eq("owner_id", userId).order("return_date", { ascending: false }).limit(100),
        supabase.from("return_items").select("*").eq("owner_id", userId).limit(300),
        supabase.from("employees").select("*").eq("owner_id", userId).eq("shop_id", shopId).order("created_at", { ascending: false }),
        supabase.from("employee_sales").select("*").eq("owner_id", userId).order("sale_date", { ascending: false }).limit(300),
        supabase.from("expenses").select("*").eq("owner_id", userId).order("expense_date", { ascending: false }).limit(180),
        supabase.from("cash_movements").select("*").eq("owner_id", userId).order("movement_date", { ascending: false }).limit(200),
        supabase.from("daily_closings").select("*").eq("owner_id", userId).order("closing_date", { ascending: false }).limit(90)
      ];
      const results = await Promise.all(requests);
      const failed = results.find((result) => result.error);
      if (failed) throw failed.error;
      setData({
        sales: results[0].data || [], suppliers: results[1].data || [], ledger: results[2].data || [],
        purchases: results[3].data || [], purchaseItems: results[4].data || [], payments: results[5].data || [],
        returns: results[6].data || [], returnItems: results[7].data || [], employees: results[8].data || [],
        employeeSales: results[9].data || [], expenses: results[10].data || [], movements: results[11].data || [],
        closings: results[12].data || []
      });
    } finally {
      setLoadingData(false);
    }
  }

  useEffect(() => {
    if (!session?.user?.id) return;
    let alive = true;
    (async () => {
      setShopLoading(true);
      try {
        const { error: ownerError } = await supabase.from("owners").upsert({ id: session.user.id }, { onConflict: "id" });
        if (ownerError) throw ownerError;
        const { data: ownShop, error: shopError } = await supabase
          .from("shops").select("*").eq("owner_id", session.user.id).order("created_at", { ascending: true }).limit(1).maybeSingle();
        if (shopError) throw shopError;
        if (alive) {
          setShop(ownShop || null);
          if (ownShop) setShopForm({
            name: ownShop.name || "", category: ownShop.category || "other",
            phone: ownShop.phone || "", address: ownShop.address || ""
          });
        }
        if (alive && ownShop) await loadProducts(ownShop.id);
        if (alive && ownShop) await refreshData(session.user.id, ownShop.id);
      } catch (error) {
        if (alive) setFlash("দোকান বা ডেটা লোড হয়নি: " + (error.message || "আবার চেষ্টা করুন"));
      } finally {
        if (alive) setShopLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [session?.user?.id]);

  const notify = (message) => setFlash(message);
  const runSave = async (action, successText) => {
    setBusy(true);
    setFlash("");
    try {
      const warning = await action();
      let refreshWarning = "";
      try {
        await refreshData(session.user.id, shop?.id);
      } catch (refreshError) {
        refreshWarning = "হিসাব সংরক্ষণ হয়েছে, তবে তালিকা রিফ্রেশ হয়নি। পেজ রিলোড করুন।";
      }
      setFlash(warning || refreshWarning || successText);
    } catch (error) {
      setFlash("সংরক্ষণ হয়নি: " + (error.message || "আবার চেষ্টা করুন"));
    } finally {
      setBusy(false);
    }
  };
  const writeAudit = async (tableName, recordId, action, afterData) => {
    await supabase.from("audit_logs").insert({
      owner_id: session.user.id, table_name: tableName, record_id: recordId,
      action, after_data: afterData || {}
    });
  };
  const signOut = async () => {
    await supabase.auth.signOut();
    setActive("dashboard");
    setFlash("");
  };
  const go = (name) => {
    setActive(name);
    setFlash("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  async function loadProducts(shopId) {
    if (!shopId) return;
    setProductLoading(true);
    try {
      const { data: rows, error } = await supabase
        .from("products").select("*").eq("shop_id", shopId)
        .eq("is_active", true).order("product_name").limit(500);
      if (error) throw error;
      setProducts(rows || []);
    } finally {
      setProductLoading(false);
    }
  }

  async function createShop(event) {
    event.preventDefault();
    if (shopForm.name.trim().length < 2) return notify("দোকানের নাম কমপক্ষে ২ অক্ষরের লিখুন।");
    setBusy(true); setFlash("");
    try {
      const { data: created, error } = await supabase.from("shops").insert({
        owner_id: session.user.id, name: shopForm.name.trim(), category: shopForm.category,
        phone: shopForm.phone.trim() || null, address: shopForm.address.trim() || null
      }).select("*").single();
      if (error) throw error;
      const { error: membershipError } = await supabase.from("shop_memberships").insert({
        shop_id: created.id, user_id: session.user.id, role: "owner", status: "active"
      });
      setShop(created);
      await loadProducts(created.id);
      setFlash(membershipError
        ? "দোকান তৈরি হয়েছে। সদস্যতার রেকর্ডে সমস্যা হয়েছে; মালিক হিসেবে দোকানের ডেটা আপনার অ্যাকাউন্টে সুরক্ষিত আছে।"
        : "✅ দোকানের প্রোফাইল তৈরি হয়েছে। এখন পণ্য যোগ করতে পারবেন।");
    } catch (error) {
      setFlash("দোকান তৈরি হয়নি: " + (error.message || "আবার চেষ্টা করুন"));
    } finally { setBusy(false); }
  }

  async function saveShopProfile(event) {
    event.preventDefault();
    if (!shop?.id || shopForm.name.trim().length < 2) return notify("দোকানের সঠিক নাম লিখুন।");
    setBusy(true); setFlash("");
    try {
      const { data: updated, error } = await supabase.from("shops").update({
        name: shopForm.name.trim(), category: shopForm.category,
        phone: shopForm.phone.trim() || null, address: shopForm.address.trim() || null,
        updated_at: new Date().toISOString()
      }).eq("id", shop.id).eq("owner_id", session.user.id).select("*").single();
      if (error) throw error;
      setShop(updated);
      setFlash("✅ দোকানের প্রোফাইল আপডেট হয়েছে।");
    } catch (error) {
      setFlash("প্রোফাইল আপডেট হয়নি: " + (error.message || "আবার চেষ্টা করুন"));
    } finally { setBusy(false); }
  }

  async function saveProduct(event) {
    event.preventDefault();
    if (!shop?.id) return notify("আগে দোকানের প্রোফাইল তৈরি করুন।");
    if (!productForm.product_name.trim()) return notify("পণ্যের নাম লিখুন।");
    const numericFields = ["purchase_price", "selling_price", "stock_qty", "low_stock_at"];
    if (numericFields.some((key) => productForm[key] === "" || !Number.isFinite(Number(productForm[key])) || Number(productForm[key]) < 0)) {
      return notify("দাম ও স্টকের ঘরে শূন্য বা তার বেশি সঠিক সংখ্যা লিখুন।");
    }
    setBusy(true); setFlash("");
    try {
      const payload = {
        shop_id: shop.id,
        product_name: productForm.product_name.trim(),
        product_code: productForm.product_code.trim() || null,
        category: productForm.category.trim() || null,
        brand: productForm.brand.trim() || null,
        barcode: productForm.barcode.trim() || null,
        unit: productForm.unit || "piece",
        purchase_price: Number(productForm.purchase_price),
        selling_price: Number(productForm.selling_price),
        stock_qty: Number(productForm.stock_qty),
        low_stock_at: Number(productForm.low_stock_at)
      };
      const { error } = await supabase.from("products").insert(payload);
      if (error) throw error;
      await loadProducts(shop.id);
      setProductForm({
        product_name: "", product_code: "", category: "", brand: "", barcode: "",
        purchase_price: "0", selling_price: "0", stock_qty: "0", low_stock_at: "0", unit: "piece"
      });
      setFlash("✅ পণ্য ক্যাটালগে যোগ হয়েছে। এখন নাম, কোড বা বারকোড দিয়ে খুঁজতে পারবেন।");
    } catch (error) {
      setFlash("পণ্য যোগ হয়নি: " + (error.message || "আবার চেষ্টা করুন"));
    } finally { setBusy(false); }
  }

  async function saveSales(event) {
    event.preventDefault();
    const amount = Number(saleForm.total_sales);
    const cost = Number(saleForm.cost_of_goods_sold);
    if (saleForm.total_sales === "" || !Number.isFinite(amount) || amount < 0) return notify("বিক্রির সঠিক টাকা লিখুন।");
    if (saleForm.entry_mode === "cost_and_sale" && (saleForm.cost_of_goods_sold === "" || !Number.isFinite(cost) || cost < 0)) return notify("মালের আসল খরচ লিখুন।");
    await runSave(async () => {
      const { data: saved, error } = await supabase.from("daily_sales").upsert({
        owner_id: session.user.id, sale_date: saleForm.sale_date, entry_mode: saleForm.entry_mode,
        total_sales: amount, cost_of_goods_sold: saleForm.entry_mode === "cost_and_sale" ? cost : null,
        notes: saleForm.notes, updated_at: new Date().toISOString()
      }, { onConflict: "owner_id,sale_date" }).select("id").single();
      if (error) throw error;
      await writeAudit("daily_sales", saved.id, "update", { ...saleForm, total_sales: amount });
    }, "✅ বিক্রির হিসাব সংরক্ষণ হয়েছে।");
  }

  async function saveSupplier(event) {
    event.preventDefault();
    await runSave(async () => {
      let photoWarning = "";
      const { data: saved, error } = await supabase.from("suppliers").insert({
        owner_id: session.user.id, shop_id: shop.id, ...supplierForm, opening_balance: Number(supplierForm.opening_balance || 0)
      }).select("id").single();
      if (error) throw error;
      if (supplierPhoto) {
        const path = session.user.id + "/suppliers/" + saved.id + "-" + supplierPhoto.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const upload = await supabase.storage.from("joy-shoes-files").upload(path, supplierPhoto, { upsert: true });
        if (!upload.error) {
          await supabase.from("suppliers").update({ photo_path: path }).eq("id", saved.id).eq("owner_id", session.user.id);
        } else {
          photoWarning = "মহাজন যোগ হয়েছে, তবে ছবিটি আপলোড হয়নি: " + upload.error.message;
        }
      }
      await writeAudit("suppliers", saved.id, "insert", supplierForm);
      setSupplierForm({ owner_name: "", shop_name: "", phone: "", address: "", location_text: "", opening_balance: "0", notes: "" });
      setSupplierPhoto(null);
      setActive("suppliers");
      return photoWarning;
    }, "✅ মহাজনের তথ্য সংরক্ষণ হয়েছে।");
  }

  async function savePurchase(event) {
    event.preventDefault();
    if (!purchaseForm.supplier_id) return notify("আগে মহাজন নির্বাচন করুন।");
    const valid = purchaseLines.filter((line) => line.model_name.trim() && Number(line.quantity_pairs) > 0 && line.unit_cost !== "");
    if (!valid.length || valid.length !== purchaseLines.length) return notify("প্রতিটি মালের নাম, জোড়া ও আসল মূল্য লিখুন।");
    const items = valid.map((line) => ({ model_name: line.model_name.trim(), quantity_pairs: Number(line.quantity_pairs), unit_cost: Number(line.unit_cost) }));
    const amount = Number(purchaseForm.amount_paid || 0);
    const total = items.reduce((s, line) => s + line.quantity_pairs * line.unit_cost, 0);
    if (amount < 0 || amount > total) return notify("পরিশোধের টাকা মোট ক্রয়ের চেয়ে বেশি হতে পারবে না।");
    await runSave(async () => {
      let memoWarning = "";
      const { data: purchaseId, error } = await supabase.rpc("create_purchase_with_items", {
        p_supplier_id: purchaseForm.supplier_id, p_purchase_date: purchaseForm.purchase_date,
        p_invoice_number: purchaseForm.invoice_number, p_notes: purchaseForm.notes,
        p_items: items, p_amount_paid: amount, p_payment_method: purchaseForm.payment_method,
        p_reference_note: purchaseForm.reference_note
      });
      if (error) throw error;
      if (memoFile) {
        const path = session.user.id + "/purchase-memos/" + purchaseId + "-" + memoFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const upload = await supabase.storage.from("joy-shoes-files").upload(path, memoFile, { upsert: true });
        if (!upload.error) {
          await supabase.from("cash_memos").insert({
            owner_id: session.user.id, purchase_id: purchaseId, storage_path: path, original_file_name: memoFile.name
          });
        } else {
          memoWarning = "ক্রয় সংরক্ষণ হয়েছে, তবে ক্যাশ মেমো আপলোড হয়নি: " + upload.error.message;
        }
      }
      setPurchaseForm({ supplier_id: "", purchase_date: todayBD(), invoice_number: "", amount_paid: "0", payment_method: "cash", reference_note: "", notes: "" });
      setPurchaseLines([freshLine()]);
      setMemoFile(null);
      return memoWarning;
    }, "✅ নতুন মাল কেনার হিসাব সংরক্ষণ হয়েছে।");
  }

  async function savePayment(event) {
    event.preventDefault();
    await runSave(async () => {
      const { error } = await supabase.rpc("record_supplier_payment", {
        p_supplier_id: paymentForm.supplier_id, p_payment_date: paymentForm.payment_date,
        p_amount: Number(paymentForm.amount), p_payment_method: paymentForm.payment_method,
        p_reference_note: paymentForm.reference_note, p_notes: paymentForm.notes
      });
      if (error) throw error;
      setPaymentForm({ supplier_id: "", payment_date: todayBD(), amount: "", payment_method: "cash", reference_note: "", notes: "" });
    }, "✅ মহাজনকে পেমেন্টের হিসাব সংরক্ষণ হয়েছে।");
  }

  async function saveReturn(event) {
    event.preventDefault();
    const valid = returnLines.filter((line) => line.model_name.trim() && Number(line.quantity_pairs) > 0 && line.unit_cost !== "");
    if (!returnForm.supplier_id) return notify("মহাজন নির্বাচন করুন।");
    if (!valid.length || valid.length !== returnLines.length) return notify("ফেরত মালের সব তথ্য পূরণ করুন।");
    const items = valid.map((line) => ({ model_name: line.model_name.trim(), quantity_pairs: Number(line.quantity_pairs), unit_cost: Number(line.unit_cost) }));
    await runSave(async () => {
      const { error } = await supabase.rpc("create_purchase_return_with_items", {
        p_supplier_id: returnForm.supplier_id, p_return_date: returnForm.return_date,
        p_settlement_type: returnForm.settlement_type, p_notes: returnForm.notes, p_items: items
      });
      if (error) throw error;
      setReturnForm({ supplier_id: "", return_date: todayBD(), settlement_type: "credit_adjustment", notes: "" });
      setReturnLines([freshLine()]);
    }, "✅ মাল ফেরতের হিসাব সংরক্ষণ হয়েছে।");
  }

  async function saveEmployee(event) {
    event.preventDefault();
    await runSave(async () => {
      const { data: saved, error } = await supabase.from("employees").insert({
        owner_id: session.user.id, shop_id: shop.id, full_name: employeeForm.full_name.trim(),
        phone: employeeForm.phone || null, notes: employeeForm.notes || null
      }).select("id").single();
      if (error) throw error;
      await writeAudit("employees", saved.id, "insert", employeeForm);
      setEmployeeForm({ full_name: "", phone: "", notes: "" });
    }, "✅ কর্মচারীর নাম সংরক্ষণ হয়েছে।");
  }

  async function saveEmployeeSale(event) {
    event.preventDefault();
    await runSave(async () => {
      const { data: saved, error } = await supabase.from("employee_sales").insert({
        owner_id: session.user.id, employee_id: employeeSaleForm.employee_id,
        sale_date: employeeSaleForm.sale_date, sales_amount: Number(employeeSaleForm.sales_amount),
        notes: employeeSaleForm.notes || null
      }).select("id").single();
      if (error) throw error;
      await writeAudit("employee_sales", saved.id, "insert", employeeSaleForm);
      setEmployeeSaleForm({ employee_id: "", sale_date: todayBD(), sales_amount: "", notes: "" });
    }, "✅ কর্মচারীর বিক্রির হিসাব যোগ হয়েছে। এটি দৈনিক মোট বিক্রিতে আবার যোগ হবে না।");
  }

  async function saveExpense(event) {
    event.preventDefault();
    await runSave(async () => {
      const { error } = await supabase.rpc("record_expense", {
        p_expense_date: expenseForm.expense_date, p_category: expenseForm.category,
        p_description: expenseForm.description.trim(), p_amount: Number(expenseForm.amount),
        p_payment_method: expenseForm.payment_method, p_notes: expenseForm.notes
      });
      if (error) throw error;
      setExpenseForm({ expense_date: todayBD(), category: "business", description: "", amount: "", payment_method: "cash", notes: "" });
    }, "✅ খরচের হিসাব সংরক্ষণ হয়েছে।");
  }

  const expectedCash = Number(closingForm.opening_cash || 0) + Number(closingForm.cash_sales || 0)
    + Number(closingForm.other_cash_receipts || 0) + Number(closingForm.employee_collections || 0)
    - Number(closingForm.supplier_cash_payments || 0) - Number(closingForm.cash_expenses || 0)
    - Number(closingForm.household_withdrawals || 0);
  const cashDifference = closingForm.actual_cash === "" ? null : Number(closingForm.actual_cash) - expectedCash;

  async function saveClosing(event) {
    event.preventDefault();
    if (closingForm.actual_cash === "") return notify("বাস্তবে হাতে কত নগদ আছে তা লিখুন।");
    await runSave(async () => {
      const payload = {
        owner_id: session.user.id, closing_date: closingForm.closing_date,
        opening_cash: Number(closingForm.opening_cash), cash_sales: Number(closingForm.cash_sales),
        other_cash_receipts: Number(closingForm.other_cash_receipts),
        supplier_cash_payments: Number(closingForm.supplier_cash_payments),
        cash_expenses: Number(closingForm.cash_expenses),
        household_withdrawals: Number(closingForm.household_withdrawals),
        employee_collections: Number(closingForm.employee_collections),
        expected_cash: expectedCash, actual_cash: Number(closingForm.actual_cash), notes: closingForm.notes
      };
      const { data: saved, error } = await supabase.from("daily_closings").upsert(payload, {
        onConflict: "owner_id,closing_date"
      }).select("id").single();
      if (error) throw error;
      await writeAudit("daily_closings", saved.id, "update", payload);
    }, "✅ দিনের ক্যাশ ক্লোজিং সংরক্ষণ হয়েছে।");
  }

  const supplierName = (id) => {
    const supplier = data.suppliers.find((item) => item.id === id);
    return supplier ? (supplier.shop_name || supplier.owner_name) : "মহাজন";
  };
  const employeeName = (id) => data.employees.find((item) => item.id === id)?.full_name || "কর্মচারী";
  const currentSales = data.sales.find((row) => row.sale_date === today);
  const todaySales = currentSales ? Number(currentSales.total_sales) : 0;
  const totalOutstanding = sum(data.ledger, "outstanding_balance");
  const monthSales = data.sales.filter((row) => row.sale_date >= monthStart(today) && row.sale_date <= today);
  const monthKnownProfit = monthSales.filter((row) => row.cost_of_goods_sold !== null)
    .reduce((s, row) => s + Number(row.total_sales) - Number(row.cost_of_goods_sold), 0);
  const monthExpenses = data.expenses.filter((row) => row.expense_date >= monthStart(today) && row.expense_date <= today
    && row.category !== "household_withdrawal");
  const monthExpenseTotal = sum(monthExpenses, "amount");
  const monthNetKnown = monthKnownProfit - monthExpenseTotal;

  const staffFiltered = data.employeeSales.filter((row) => {
    if (staffPeriod === "today") return row.sale_date === today;
    if (staffPeriod === "week") return row.sale_date >= addDays(today, -6) && row.sale_date <= today;
    return row.sale_date >= monthStart(today) && row.sale_date <= today;
  });
  const staffRank = data.employees.map((employee) => ({
    ...employee, total: staffFiltered.filter((row) => row.employee_id === employee.id).reduce((s, row) => s + Number(row.sales_amount), 0)
  })).sort((a, b) => b.total - a.total);

  if (!authReady) return <main className="shell"><div className="loading-screen">DokanKhata<br />লোড হচ্ছে...</div></main>;

  if (!session) return <main className="shell auth-shell">
    <header className="top auth-top"><div className="logo">DK</div><div><small>বাংলাদেশের দোকানদারদের ডিজিটাল সহকারী</small><h1>DokanKhata</h1></div></header>
    <section className="welcome-hero">
      <div className="welcome-copy">
        <span className="welcome-kicker">আপনার ব্যবসা, আপনার নিয়ন্ত্রণে</span>
        <h2>দোকানের হিসাব<br />এখন এক জায়গায়।</h2>
        <p>বিক্রি, পণ্য, স্টক, মহাজন ও খরচ—সহজ বাংলায় গুছিয়ে রাখুন।</p>
      </div>
      <div className="welcome-graphic" aria-hidden="true">৳</div>
      <div className="welcome-tags"><span>পণ্য সার্চ</span><span>দৈনিক হিসাব</span><span>স্টক তালিকা</span></div>
    </section>
    <section className="auth-card">
      <div className="auth-icon">{isSignup ? "＋" : "↗"}</div>
      <small>{isSignup ? "START YOUR SHOP" : "WELCOME BACK"}</small>
      <h2>{isSignup ? "নতুন দোকানের অ্যাকাউন্ট" : "দোকান মালিক লগইন"}</h2>
      <p>{isSignup ? "প্রথমে অ্যাকাউন্ট খুলুন। এরপর দোকানের নাম ও ব্যবসার ধরন দিয়ে প্রোফাইল তৈরি হবে।" : "আপনার দোকানের হিসাবখাতায় প্রবেশ করুন।"}</p>
      <form onSubmit={async (event) => {
        event.preventDefault(); setBusy(true); setFlash("");
        try {
          const result = isSignup
            ? await supabase.auth.signUp({ email: authEmail, password: authPassword, options: { emailRedirectTo: window.location.origin } })
            : await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
          if (result.error) throw result.error;
          if (isSignup && !result.data.session) setFlash("ইমেইলে পাঠানো লিংক নিশ্চিত করুন। তারপর লগইন করলে দোকানের প্রোফাইল তৈরির ধাপ আসবে।");
          else setFlash("অ্যাকাউন্ট যাচাই হচ্ছে...");
        } catch (error) { setFlash(error.message || "অ্যাকাউন্ট খোলা যায়নি।"); }
        finally { setBusy(false); }
      }}>
        <Field label="ইমেইল" value={authEmail} onChange={setAuthEmail} type="email" placeholder="আপনার ইমেইল" required />
        <Field label="পাসওয়ার্ড" value={authPassword} onChange={setAuthPassword} type="password" placeholder="কমপক্ষে ৬ অক্ষর" required />
        <button className="primary-btn full-btn" disabled={busy}>{busy ? "অপেক্ষা করুন..." : isSignup ? "নতুন অ্যাকাউন্ট খুলুন" : "লগইন করুন"}</button>
      </form>
      <button className="text-btn" type="button" onClick={() => { setIsSignup(!isSignup); setFlash(""); }}>
        {isSignup ? "আগে অ্যাকাউন্ট আছে? লগইন করুন" : "নতুন দোকান শুরু করুন"}
      </button>
      {flash ? <p className="notice">{flash}</p> : null}
    </section>
    <section className="auth-steps">
      <div><b>01</b><span>অ্যাকাউন্ট তৈরি</span></div><i>→</i><div><b>02</b><span>দোকান প্রোফাইল</span></div><i>→</i><div><b>03</b><span>হিসাব শুরু</span></div>
    </section>
    <footer>DokanKhata · ছোট ব্যবসার সহজ ডিজিটাল হিসাব</footer>
  </main>;

  if (shopLoading) return <main className="shell"><div className="loading-screen">দোকানের তথ্য<br />লোড হচ্ছে...</div></main>;

  if (!shop) return <main className="shell auth-shell setup-shell">
    <header className="top"><div className="logo">DK</div><div><small>আপনার প্রথম ধাপ</small><h1>DokanKhata</h1></div></header>
    <section className="setup-card">
      <span className="setup-step">SHOP SETUP · 01 / 01</span>
      <h2>আপনার দোকানের প্রোফাইল তৈরি করুন</h2>
      <p>দোকানের নাম ও ব্যবসার ধরন দিন। এই প্রোফাইল আপনার দোকানের হিসাবকে আলাদা করে রাখবে।</p>
      <form onSubmit={createShop}>
        <Field label="দোকানের নাম" value={shopForm.name} onChange={(v) => setShopForm({ ...shopForm, name: v })} placeholder="যেমন: JOY SHOES" required />
        <SelectField label="ব্যবসার ধরন" value={shopForm.category} onChange={(v) => setShopForm({ ...shopForm, category: v })} options={SHOP_CATEGORIES} />
        <Field label="মোবাইল নম্বর (ঐচ্ছিক)" value={shopForm.phone} onChange={(v) => setShopForm({ ...shopForm, phone: v })} type="tel" placeholder="01XXXXXXXXX" />
        <TextArea label="দোকানের ঠিকানা (ঐচ্ছিক)" value={shopForm.address} onChange={(v) => setShopForm({ ...shopForm, address: v })} placeholder="এলাকা, বাজার, জেলা" />
        <button className="primary-btn full-btn" disabled={busy}>{busy ? "প্রোফাইল তৈরি হচ্ছে..." : "দোকানের প্রোফাইল তৈরি করুন"}</button>
      </form>
      {flash ? <p className="notice">{flash}</p> : null}
    </section>
    <footer>DokanKhata · আপনার দোকানের ডিজিটাল হিসাবখাতা</footer>
  </main>;

  const moduleCards = [
    ["🛍️", "আজকের বিক্রি", "দৈনিক বিক্রির হিসাব", "sales", "green"],
    ["🔎", "পণ্য ও সার্চ", "পণ্যের দাম, কোড ও স্টক খুঁজুন", "products", "purple"],
    ["🏪", "দোকান প্রোফাইল", "দোকানের নাম ও যোগাযোগের তথ্য", "profile", "blue"],
    ["👥", "মহাজন", "মহাজন ও বাকি হিসাব", "suppliers", "blue"],
    ["📦", "নতুন মাল কেনা", "ক্রয়, আইটেম ও ক্যাশ মেমো", "purchases", "purple"],
    ["💸", "খরচ", "দোকান ও পারিবারিক খরচ", "expenses", "yellow"],
    ["🧑‍💼", "কর্মচারী", "কর্মচারীর বিক্রির হিসাব", "employees", "orange"],
    ["📊", "দিনের বিবরণ", "দিনের বিক্রি, খরচ ও লেনদেনের সারাংশ", "cash", "pink"]
  ];

  return <main className="shell app-shell">
    <header className="top app-top">
      <div className="logo">DK</div>
      <div className="brand-title"><small>DokanKhata · {SHOP_CATEGORIES.find(([key]) => key === shop.category)?.[1] || "দোকানের হিসাব"}</small><h1>{shop.name}</h1></div>
      <button className="logout-btn" onClick={signOut}>↪ বের হন</button>
    </header>

    {flash ? <div className="global-notice"><span>{flash}</span><button type="button" onClick={() => setFlash("")}>×</button></div> : null}
    {loadingData ? <div className="loading-strip">হিসাব লোড হচ্ছে...</div> : null}

    {active === "dashboard" ? <>
      <section className="hero">
        <div><small>আজ {dateText(today)}</small><h2>আপনার দোকান,<br />আপনার হিসাব।</h2><p>সহজে লিখুন, সহজে বুঝুন।</p></div>
        <div className="shoe">👟</div>
      </section>
      <section className="stats-grid">
        <Stat label="আজকের মোট বিক্রি" value={money(todaySales)} tone="green" />
        <Stat label="মহাজনের মোট বাকি" value={money(totalOutstanding)} tone="blue" />
        <Stat label="এই মাসের বিক্রি" value={money(sum(monthSales, "total_sales"))} tone="purple" />
        <Stat label="এই মাসের খরচ" value={money(monthExpenseTotal)} tone="yellow" />
      </section>
      <div className="section-title"><div><small>QUICK ACTIONS</small><h2>কী করতে চান?</h2></div><span>একটি অপশন বেছে নিন</span></div>
      <section className="module-grid">
        {moduleCards.map(([icon, title, desc, target, tone]) => <button className={"module-card " + tone} key={target} onClick={() => go(target)}>
          <i>{icon}</i><b>{title}</b><small>{desc}</small><span className="tile-arrow">খুলুন →</span>
        </button>)}
      </section>
      <section className="quick-extra">
        <button onClick={() => go("products")}>🔎 পণ্য সার্চ করুন</button>
        <button onClick={() => go("profile")}>🏪 দোকান প্রোফাইল</button>
        <button onClick={() => go("payments")}>💳 মহাজনকে টাকা দিন</button>
        <button onClick={() => go("returns")}>↩ মাল ফেরত দিন</button>
        <button onClick={() => go("reports")}>📊 লাভ-লোকসান রিপোর্ট</button>
      </section>
      <section className="panel">
        <div className="panel-title"><div><small>RECENT ACTIVITY</small><h2>সাম্প্রতিক বিক্রির হিসাব</h2></div><button className="mini-btn" onClick={() => go("sales")}>সব দেখুন</button></div>
        {data.sales.slice(0, 5).length ? <div className="record-list">{data.sales.slice(0, 5).map((row) => <div className="record-row" key={row.id}>
          <div><b>{dateText(row.sale_date)}</b><small>{row.entry_mode === "cost_and_sale" ? "আসলসহ হিসাব" : "শুধু মোট বিক্রি"}</small></div><strong>{money(row.total_sales)}</strong>
        </div>)}</div> : <Empty>এখনো বিক্রির হিসাব নেই। “আজকের বিক্রি” থেকে শুরু করুন।</Empty>}
      </section>
    </> : null}

    {active === "products" ? <>
      <PageHead eyebrow="PRODUCT CATALOG" title="পণ্য যোগ করুন ও সার্চ করুন" subtitle="পণ্যের নাম, কোড, বারকোড বা ব্র্যান্ড লিখে দ্রুত খুঁজে নিন।" onBack={() => go("dashboard")} />
      <section className="panel">
        <div className="panel-title"><div><small>ADD NEW ITEM</small><h2>নতুন পণ্য যোগ করুন</h2></div></div>
        <form onSubmit={saveProduct}>
          <Field label="পণ্যের নাম" value={productForm.product_name} onChange={(v) => setProductForm({ ...productForm, product_name: v })} placeholder="যেমন: Men’s Casual Shoe" required />
          <div className="form-grid-two">
            <Field label="পণ্য কোড / SKU" value={productForm.product_code} onChange={(v) => setProductForm({ ...productForm, product_code: v })} placeholder="যেমন: SH-001" />
            <Field label="বারকোড" value={productForm.barcode} onChange={(v) => setProductForm({ ...productForm, barcode: v })} placeholder="বারকোড (ঐচ্ছিক)" />
            <Field label="ক্যাটাগরি" value={productForm.category} onChange={(v) => setProductForm({ ...productForm, category: v })} placeholder="যেমন: স্যান্ডেল" />
            <Field label="ব্র্যান্ড" value={productForm.brand} onChange={(v) => setProductForm({ ...productForm, brand: v })} placeholder="ব্র্যান্ডের নাম" />
            <Field label="ক্রয় মূল্য" type="number" min="0" step="0.01" value={productForm.purchase_price} onChange={(v) => setProductForm({ ...productForm, purchase_price: v })} required />
            <Field label="বিক্রয় মূল্য" type="number" min="0" step="0.01" value={productForm.selling_price} onChange={(v) => setProductForm({ ...productForm, selling_price: v })} required />
            <Field label="বর্তমান স্টক" type="number" min="0" step="0.001" value={productForm.stock_qty} onChange={(v) => setProductForm({ ...productForm, stock_qty: v })} required />
            <Field label="কম স্টকের সতর্কতা" type="number" min="0" step="0.001" value={productForm.low_stock_at} onChange={(v) => setProductForm({ ...productForm, low_stock_at: v })} />
          </div>
          <button className="primary-btn full-btn" disabled={busy}>{busy ? "সংরক্ষণ হচ্ছে..." : "＋ পণ্য ক্যাটালগে যোগ করুন"}</button>
        </form>
      </section>
      <section className="panel">
        <div className="panel-title"><div><small>SEARCH YOUR ITEMS</small><h2>পণ্য খুঁজুন</h2></div><span>{products.length} টি পণ্য</span></div>
        <Field label="নাম, কোড, বারকোড বা ব্র্যান্ড" value={productSearch} onChange={setProductSearch} placeholder="পণ্য লিখে সার্চ করুন..." />
        {productLoading ? <div className="loading-strip">পণ্যের তালিকা লোড হচ্ছে...</div> : null}
        {products.filter((p) => [p.product_name,p.product_code,p.barcode,p.brand,p.category].some((v) => String(v || "").toLowerCase().includes(productSearch.trim().toLowerCase()))).length
          ? <div className="product-list">{products.filter((p) => [p.product_name,p.product_code,p.barcode,p.brand,p.category].some((v) => String(v || "").toLowerCase().includes(productSearch.trim().toLowerCase()))).map((p) => <article className="product-row" key={p.id}>
              <div className="product-mark">▦</div>
              <div className="product-info"><b>{p.product_name}</b><small>{[p.product_code,p.brand,p.category].filter(Boolean).join(" · ") || "কোনো কোড বা ব্র্যান্ড নেই"}</small><span>স্টক: {Number(p.stock_qty).toLocaleString("bn-BD")} {p.unit === "piece" ? "টি" : p.unit}</span></div>
              <div className="product-prices"><strong>{money(p.selling_price)}</strong><small>ক্রয় {money(p.purchase_price)}</small></div>
            </article>)}</div>
          : <Empty>{productSearch ? "এই নামে কোনো পণ্য পাওয়া যায়নি। বানান বা কোড বদলে খুঁজুন।" : "এখনো পণ্য যোগ করা হয়নি। উপরের ফর্ম থেকে প্রথম পণ্যটি যোগ করুন।"}</Empty>}
      </section>
    </> : null}

    {active === "profile" ? <>
      <PageHead eyebrow="SHOP PROFILE" title="দোকানের প্রোফাইল" subtitle="আপনার দোকানের পরিচিতি ও যোগাযোগের তথ্য হালনাগাদ করুন।" onBack={() => go("dashboard")} />
      <section className="shop-profile-banner">
        <div className="shop-profile-avatar">{shop.name.slice(0,1).toUpperCase()}</div>
        <div><small>আপনার দোকান</small><h2>{shop.name}</h2><span>{SHOP_CATEGORIES.find(([key]) => key === shop.category)?.[1] || "অন্যান্য ব্যবসা"}</span></div>
      </section>
      <section className="panel">
        <form onSubmit={saveShopProfile}>
          <Field label="দোকানের নাম" value={shopForm.name} onChange={(v) => setShopForm({ ...shopForm, name: v })} required />
          <SelectField label="ব্যবসার ধরন" value={shopForm.category} onChange={(v) => setShopForm({ ...shopForm, category: v })} options={SHOP_CATEGORIES} />
          <Field label="মোবাইল নম্বর" value={shopForm.phone} onChange={(v) => setShopForm({ ...shopForm, phone: v })} type="tel" placeholder="01XXXXXXXXX" required={false} />
          <TextArea label="দোকানের ঠিকানা" value={shopForm.address} onChange={(v) => setShopForm({ ...shopForm, address: v })} placeholder="এলাকা, বাজার, জেলা" />
          <button className="primary-btn full-btn" disabled={busy}>{busy ? "আপডেট হচ্ছে..." : "প্রোফাইল সংরক্ষণ করুন"}</button>
        </form>
      </section>
    </> : null}

    {active === "sales" ? <>
      <PageHead eyebrow="DAILY SALES" title="আজকের বিক্রির হিসাব" subtitle="প্রতিদিনের মোট বিক্রি একবার লিখুন। পরে একই দিনের হিসাব বদলাতে পারবেন।" onBack={() => go("dashboard")} />
      <section className="panel">
        <form onSubmit={saveSales}>
          <Field label="হিসাবের তারিখ" type="date" value={saleForm.sale_date} onChange={(v) => {
            const existing = data.sales.find((row) => row.sale_date === v);
            setSaleForm(existing ? { sale_date: v, entry_mode: existing.entry_mode, total_sales: String(existing.total_sales), cost_of_goods_sold: existing.cost_of_goods_sold === null ? "" : String(existing.cost_of_goods_sold), notes: existing.notes || "" } : { sale_date: v, entry_mode: "total_only", total_sales: "", cost_of_goods_sold: "", notes: "" });
          }} required />
          <div className="mode-select">
            <button type="button" className={saleForm.entry_mode === "total_only" ? "chosen" : ""} onClick={() => setSaleForm({ ...saleForm, entry_mode: "total_only", cost_of_goods_sold: "" })}>শুধু মোট বিক্রি</button>
            <button type="button" className={saleForm.entry_mode === "cost_and_sale" ? "chosen" : ""} onClick={() => setSaleForm({ ...saleForm, entry_mode: "cost_and_sale" })}>বিক্রি + মালের আসল</button>
          </div>
          <Field label="বিক্রির মোট টাকা" type="number" min="0" step="0.01" value={saleForm.total_sales} onChange={(v) => setSaleForm({ ...saleForm, total_sales: v })} placeholder="যেমন: ৫০০০" required />
          {saleForm.entry_mode === "cost_and_sale" ? <Field label="বিক্রি হওয়া মালের আসল খরচ" type="number" min="0" step="0.01" value={saleForm.cost_of_goods_sold} onChange={(v) => setSaleForm({ ...saleForm, cost_of_goods_sold: v })} placeholder="যেমন: ৩৫০০" required /> : null}
          <TextArea label="অতিরিক্ত নোট (ইচ্ছা হলে)" value={saleForm.notes} onChange={(v) => setSaleForm({ ...saleForm, notes: v })} />
          {saleForm.entry_mode === "cost_and_sale" && saleForm.total_sales !== "" && saleForm.cost_of_goods_sold !== "" ? <div className="inline-result"><span>আনুমানিক পণ্যের লাভ</span><b>{money(Number(saleForm.total_sales) - Number(saleForm.cost_of_goods_sold))}</b></div> : null}
          <button className="primary-btn full-btn" disabled={busy}>{busy ? "সংরক্ষণ হচ্ছে..." : "হিসাব সংরক্ষণ করুন"}</button>
        </form>
      </section>
      <section className="panel"><div className="panel-title"><h2>আগের বিক্রির হিসাব</h2><span>{data.sales.length} দিন</span></div>
        {data.sales.length ? <div className="record-list">{data.sales.map((row) => <button className="record-row record-button" key={row.id} onClick={() => { setSaleForm({ sale_date: row.sale_date, entry_mode: row.entry_mode, total_sales: String(row.total_sales), cost_of_goods_sold: row.cost_of_goods_sold === null ? "" : String(row.cost_of_goods_sold), notes: row.notes || "" }); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          <div><b>{dateText(row.sale_date)}</b><small>{row.entry_mode === "cost_and_sale" ? "আসল দেওয়া আছে" : "লাভ অজানা — আসল দেওয়া হয়নি"}</small></div><strong>{money(row.total_sales)}</strong>
        </button>)}</div> : <Empty />}
      </section>
    </> : null}

    {active === "suppliers" ? <>
      <PageHead eyebrow="SUPPLIERS" title="মহাজন তালিকা" subtitle="মহাজনের নাম চাপলে তার সম্পূর্ণ প্রোফাইল ও লেনদেন দেখুন।" onBack={() => go("dashboard")} />
      <section className="panel">
        <div className="supplier-toolbar">
          <div><h2>সকল মহাজন</h2><small>{data.suppliers.length} জন মহাজন</small></div>
          <button className="primary-btn supplier-add-btn" type="button" onClick={() => go("supplier-create")}>＋ মহাজন যোগ করুন</button>
        </div>
        {data.suppliers.length ? <div className="supplier-list">{data.suppliers.map((s) => {
          const balance = data.ledger.find((l) => l.supplier_id === s.id)?.outstanding_balance ?? s.opening_balance;
          return <button type="button" className="supplier-card supplier-card-button" key={s.id} onClick={() => { setSelectedSupplier(s.id); go("supplier-profile"); }}>
            <div className="supplier-avatar">👤</div><div className="supplier-info"><b>{s.shop_name || s.owner_name}</b><small>{s.owner_name}{s.phone ? " · " + s.phone : ""}</small><strong>{money(balance)} <em>বাকি</em></strong></div>
            <span className="supplier-open">প্রোফাইল দেখুন →</span>
          </button>;
        })}</div> : <Empty>এখনো কোনো মহাজন যোগ করা হয়নি। উপরের ＋ বাটনে চাপ দিয়ে প্রথম মহাজন যোগ করুন।</Empty>}
      </section>
    </> : null}

    {active === "supplier-create" ? <>
      <PageHead eyebrow="NEW SUPPLIER" title="নতুন মহাজন যোগ করুন" subtitle="মহাজনের পরিচয় ও যোগাযোগের তথ্য লিখুন।" onBack={() => go("suppliers")} />
      <section className="panel">
        <form onSubmit={saveSupplier}>
          <Field label="মহাজনের নাম" value={supplierForm.owner_name} onChange={(v) => setSupplierForm({ ...supplierForm, owner_name: v })} required placeholder="নাম লিখুন" />
          <Field label="দোকানের নাম" value={supplierForm.shop_name} onChange={(v) => setSupplierForm({ ...supplierForm, shop_name: v })} placeholder="দোকানের নাম" />
          <Field label="মোবাইল নম্বর" value={supplierForm.phone} onChange={(v) => setSupplierForm({ ...supplierForm, phone: v })} placeholder="01XXXXXXXXX" />
          <Field label="ঠিকানা" value={supplierForm.address} onChange={(v) => setSupplierForm({ ...supplierForm, address: v })} />
          <Field label="বাজার / লোকেশন" value={supplierForm.location_text} onChange={(v) => setSupplierForm({ ...supplierForm, location_text: v })} />
          <Field label="শুরুর বাকি (থাকলে)" type="number" min="0" step="0.01" value={supplierForm.opening_balance} onChange={(v) => setSupplierForm({ ...supplierForm, opening_balance: v })} />
          <TextArea label="নোট" value={supplierForm.notes} onChange={(v) => setSupplierForm({ ...supplierForm, notes: v })} />
          <label className="field-wrap"><span>মহাজনের ছবি (ইচ্ছা হলে)</span></label>
          <input className="file-control" type="file" accept="image/*" onChange={(e) => setSupplierPhoto(e.target.files?.[0] || null)} />
          <button className="primary-btn full-btn" disabled={busy}>মহাজন সংরক্ষণ করুন</button>
        </form>
      </section>
    </> : null}

    {active === "supplier-profile" ? (() => {
      const supplier = data.suppliers.find((item) => item.id === selectedSupplier);
      if (!supplier) return <section className="panel"><Empty>মহাজন পাওয়া যায়নি। তালিকা থেকে আবার নির্বাচন করুন।</Empty><button className="secondary-btn" onClick={() => go("suppliers")}>মহাজন তালিকায় ফিরুন</button></section>;
      const ledger = data.ledger.find((item) => item.supplier_id === supplier.id);
      const supplierPurchases = data.purchases.filter((item) => item.supplier_id === supplier.id);
      const supplierPayments = data.payments.filter((item) => item.supplier_id === supplier.id);
      const supplierReturns = data.returns.filter((item) => item.supplier_id === supplier.id);
      return <>
        <PageHead eyebrow="SUPPLIER PROFILE" title={supplier.shop_name || supplier.owner_name} subtitle="মহাজনের পরিচয়, বাকি ও সব লেনদেন এক জায়গায়।" onBack={() => go("suppliers")} />
        <section className="panel supplier-profile-card">
          <div className="supplier-profile-heading"><div className="supplier-avatar large-avatar">👤</div><div><h2>{supplier.owner_name}</h2><p>{supplier.shop_name || "দোকানের নাম দেওয়া হয়নি"}</p></div></div>
          <div className="supplier-detail-grid">
            <div><small>মোবাইল</small><b>{supplier.phone || "দেওয়া নেই"}</b></div>
            <div><small>ঠিকানা</small><b>{supplier.address || "দেওয়া নেই"}</b></div>
            <div><small>বাজার / লোকেশন</small><b>{supplier.location_text || "দেওয়া নেই"}</b></div>
            <div><small>শুরুর বাকি</small><b>{money(supplier.opening_balance)}</b></div>
          </div>
          {supplier.notes ? <p className="supplier-notes">{supplier.notes}</p> : null}
          <div className="supplier-balance-highlight"><span>বর্তমান মোট বাকি</span><strong>{money(ledger?.outstanding_balance ?? supplier.opening_balance)}</strong></div>
          <div className="supplier-profile-actions">
            <button type="button" onClick={() => { setPaymentForm({ ...paymentForm, supplier_id: supplier.id }); go("payments"); }}>💳 টাকা দিন</button>
            <button type="button" onClick={() => { setReturnForm({ ...returnForm, supplier_id: supplier.id }); go("returns"); }}>↩ মাল ফেরত</button>
            <button type="button" onClick={() => { setPurchaseForm({ ...purchaseForm, supplier_id: supplier.id }); go("purchases"); }}>＋ নতুন ক্রয়</button>
          </div>
        </section>
        <section className="panel"><h2>লেনদেনের সারাংশ</h2>
          <div className="stats-grid">
            <Stat label="মোট ক্রয়" value={money(ledger?.total_purchases ?? 0)} tone="blue" />
            <Stat label="মোট পেমেন্ট" value={money(ledger?.total_payments ?? 0)} tone="green" />
            <Stat label="বাকিতে সমন্বয়" value={money(ledger?.credit_adjustment_returns ?? 0)} tone="yellow" />
            <Stat label="নগদ ফেরত" value={money(supplierReturns.filter((r) => r.settlement_type === "cash_refund").reduce((n, r) => n + Number(r.total_amount || 0), 0))} tone="purple" />
          </div>
        </section>
        <section className="panel"><div className="panel-title"><h2>ক্রয়ের ইতিহাস</h2><span>{supplierPurchases.length} চালান</span></div>
          {supplierPurchases.length ? <div className="record-list">{supplierPurchases.map((p) => <div className="record-row" key={p.id}><div><b>{p.invoice_number || "ক্রয় চালান"}</b><small>{dateText(p.purchase_date)} · পরিশোধ {money(p.amount_paid)}</small></div><strong>{money(p.subtotal)}</strong></div>)}</div> : <Empty>এই মহাজনের কোনো ক্রয় এখনো নেই।</Empty>}
        </section>
        <section className="panel"><div className="panel-title"><h2>পেমেন্টের ইতিহাস</h2><span>{supplierPayments.length} বার</span></div>
          {supplierPayments.length ? <div className="record-list">{supplierPayments.map((p) => <div className="record-row" key={p.id}><div><b>{dateText(p.payment_date)}</b><small>{p.payment_method}{p.reference_note ? " · " + p.reference_note : ""}</small></div><strong>{money(p.amount)}</strong></div>)}</div> : <Empty>কোনো পেমেন্ট রেকর্ড নেই।</Empty>}
        </section>
        <section className="panel"><div className="panel-title"><h2>মাল ফেরতের ইতিহাস</h2><span>{supplierReturns.length} বার</span></div>
          {supplierReturns.length ? <div className="record-list">{supplierReturns.map((r) => <div className="record-row" key={r.id}><div><b>{dateText(r.return_date)}</b><small>{r.settlement_type === "credit_adjustment" ? "বাকি থেকে সমন্বয়" : "নগদ ফেরত"}</small></div><strong>{money(r.total_amount)}</strong></div>)}</div> : <Empty>কোনো মাল ফেরতের রেকর্ড নেই।</Empty>}
        </section>
      </>;
    })() : null}

    {active === "purchases" ? <>
      <PageHead eyebrow="PURCHASE ENTRY" title="নতুন মাল কেনার হিসাব" subtitle="একটি চালানে একাধিক ডিজাইন ও জোড়া যোগ করতে পারবেন।" onBack={() => go("dashboard")} />
      <section className="panel">
        <form onSubmit={savePurchase}>
          <SelectField label="মহাজন নির্বাচন" value={purchaseForm.supplier_id} onChange={(v) => setPurchaseForm({ ...purchaseForm, supplier_id: v })} options={data.suppliers.map((s) => [s.id, (s.shop_name || s.owner_name) + (s.phone ? " · " + s.phone : "")])} emptyActionLabel="মহাজন যোগ করুন" onEmptyAction={() => go("suppliers")} />
          <Field label="ক্রয়ের তারিখ" type="date" value={purchaseForm.purchase_date} onChange={(v) => setPurchaseForm({ ...purchaseForm, purchase_date: v })} required />
          <Field label="চালান নম্বর (থাকলে)" value={purchaseForm.invoice_number} onChange={(v) => setPurchaseForm({ ...purchaseForm, invoice_number: v })} />
          <LineItems items={purchaseLines} setItems={setPurchaseLines} />
          <Field label="এখন কত টাকা পরিশোধ করেছেন?" type="number" min="0" step="0.01" value={purchaseForm.amount_paid} onChange={(v) => setPurchaseForm({ ...purchaseForm, amount_paid: v })} />
          {Number(purchaseForm.amount_paid) > 0 ? <>
            <SelectField label="কীভাবে টাকা দিয়েছেন?" value={purchaseForm.payment_method} onChange={(v) => setPurchaseForm({ ...purchaseForm, payment_method: v })} options={PAYMENT_METHODS} />
            <Field label="লেনদেন নম্বর / রেফারেন্স" value={purchaseForm.reference_note} onChange={(v) => setPurchaseForm({ ...purchaseForm, reference_note: v })} />
          </> : null}
          <TextArea label="নোট" value={purchaseForm.notes} onChange={(v) => setPurchaseForm({ ...purchaseForm, notes: v })} />
          <label className="field-wrap"><span>ক্যাশ মেমোর ছবি (ইচ্ছা হলে)</span></label>
          <input className="file-control" type="file" accept="image/*,application/pdf" onChange={(e) => setMemoFile(e.target.files?.[0] || null)} />
          <button className="primary-btn full-btn" disabled={busy || !data.suppliers.length}>ক্রয়ের হিসাব সংরক্ষণ করুন</button>
          {!data.suppliers.length ? <p className="helper-note">ক্রয়ের আগে অন্তত একজন মহাজন যোগ করতে হবে।</p> : null}
        </form>
      </section>
      <section className="panel"><div className="panel-title"><h2>সাম্প্রতিক ক্রয়</h2><span>{data.purchases.length} চালান</span></div>
        {data.purchases.length ? <div className="record-list">{data.purchases.map((p) => <div className="record-row" key={p.id}>
          <div><b>{supplierName(p.supplier_id)}</b><small>{dateText(p.purchase_date)}{p.invoice_number ? " · চালান " + p.invoice_number : ""}</small></div><div className="right-record"><strong>{money(p.subtotal)}</strong><small>এখন দিয়েছেন {money(p.amount_paid)}</small></div>
        </div>)}</div> : <Empty />}
      </section>
    </> : null}

    {active === "payments" ? <>
      <PageHead eyebrow="SUPPLIER PAYMENT" title="মহাজনকে টাকা পরিশোধ" subtitle="এখানে দেওয়া টাকা মহাজনের বাকি থেকে কমবে।" onBack={() => go("dashboard")} />
      <section className="panel"><form onSubmit={savePayment}>
        <SelectField label="মহাজন" value={paymentForm.supplier_id || selectedSupplier} onChange={(v) => { setSelectedSupplier(v); setPaymentForm({ ...paymentForm, supplier_id: v }); }} options={data.suppliers.map((s) => [s.id, s.shop_name || s.owner_name])} emptyActionLabel="মহাজন যোগ করুন" onEmptyAction={() => go("suppliers")} />
        <Field label="টাকা দেওয়ার তারিখ" type="date" value={paymentForm.payment_date} onChange={(v) => setPaymentForm({ ...paymentForm, payment_date: v })} />
        <Field label="কত টাকা দিয়েছেন?" type="number" min="0.01" step="0.01" value={paymentForm.amount} onChange={(v) => setPaymentForm({ ...paymentForm, amount: v })} required />
        <SelectField label="পেমেন্টের মাধ্যম" value={paymentForm.payment_method} onChange={(v) => setPaymentForm({ ...paymentForm, payment_method: v })} options={PAYMENT_METHODS} />
        <Field label="ট্রানজেকশন / রেফারেন্স নম্বর" value={paymentForm.reference_note} onChange={(v) => setPaymentForm({ ...paymentForm, reference_note: v })} />
        <TextArea label="নোট" value={paymentForm.notes} onChange={(v) => setPaymentForm({ ...paymentForm, notes: v })} />
        <button className="primary-btn full-btn" disabled={busy || !data.suppliers.length}>পেমেন্ট সংরক্ষণ করুন</button>
      </form></section>
      <section className="panel"><h2>সাম্প্রতিক পেমেন্ট</h2>
        {data.payments.length ? <div className="record-list">{data.payments.map((p) => <div className="record-row" key={p.id}><div><b>{supplierName(p.supplier_id)}</b><small>{dateText(p.payment_date)} · {p.payment_method}</small></div><strong>{money(p.amount)}</strong></div>)}</div> : <Empty />}
      </section>
    </> : null}

    {active === "returns" ? <>
      <PageHead eyebrow="PURCHASE RETURN" title="মহাজনকে মাল ফেরত" subtitle="বাকিতে সমন্বয় এবং নগদ টাকা ফেরত—দুটি আলাদা হিসাব।" onBack={() => go("dashboard")} />
      <section className="panel"><form onSubmit={saveReturn}>
        <SelectField label="মহাজন" value={returnForm.supplier_id || selectedSupplier} onChange={(v) => { setSelectedSupplier(v); setReturnForm({ ...returnForm, supplier_id: v }); }} options={data.suppliers.map((s) => [s.id, s.shop_name || s.owner_name])} emptyActionLabel="মহাজন যোগ করুন" onEmptyAction={() => go("suppliers")} />
        <Field label="ফেরতের তারিখ" type="date" value={returnForm.return_date} onChange={(v) => setReturnForm({ ...returnForm, return_date: v })} />
        <SelectField label="কীভাবে টাকা সমন্বয় হলো?" value={returnForm.settlement_type} onChange={(v) => setReturnForm({ ...returnForm, settlement_type: v })} options={[
          ["credit_adjustment", "মহাজনের বাকি থেকে কমবে"],
          ["cash_refund", "মহাজন নগদ টাকা ফেরত দিয়েছে"]
        ]} />
        <LineItems items={returnLines} setItems={setReturnLines} isReturn />
        <TextArea label="নোট" value={returnForm.notes} onChange={(v) => setReturnForm({ ...returnForm, notes: v })} />
        <button className="primary-btn full-btn" disabled={busy || !data.suppliers.length}>মাল ফেরতের হিসাব সংরক্ষণ করুন</button>
      </form></section>
      <section className="panel"><h2>সাম্প্রতিক রিটার্ন</h2>
        {data.returns.length ? <div className="record-list">{data.returns.map((r) => <div className="record-row" key={r.id}><div><b>{supplierName(r.supplier_id)}</b><small>{dateText(r.return_date)} · {r.settlement_type === "credit_adjustment" ? "বাকি সমন্বয়" : "নগদ ফেরত"}</small></div><strong>{money(r.total_amount)}</strong></div>)}</div> : <Empty />}
      </section>
    </> : null}

    {active === "employees" ? <>
      <PageHead eyebrow="EMPLOYEES" title="কর্মচারী" subtitle="আগে কর্মচারীর নাম যোগ করুন, তারপর যেকোনো সময় তার বিক্রির টাকা লিখুন।" onBack={() => go("dashboard")} />
      <section className="panel employee-add-panel"><div className="panel-title"><div><small>NEW TEAM MEMBER</small><h2>＋ কর্মচারী যোগ করুন</h2></div><span>নতুন নাম</span></div><form onSubmit={saveEmployee}>
        <Field label="কর্মচারীর নাম" value={employeeForm.full_name} onChange={(v) => setEmployeeForm({ ...employeeForm, full_name: v })} required placeholder="নাম লিখুন" />
        <Field label="মোবাইল নম্বর" value={employeeForm.phone} onChange={(v) => setEmployeeForm({ ...employeeForm, phone: v })} />
        <TextArea label="নোট (ইচ্ছা হলে)" value={employeeForm.notes} onChange={(v) => setEmployeeForm({ ...employeeForm, notes: v })} />
        <button className="primary-btn full-btn" disabled={busy}>কর্মচারী সংরক্ষণ করুন</button>
      </form></section>
      <section className="panel">
        <div className="panel-title"><div><small>YOUR TEAM</small><h2>কর্মচারী তালিকা</h2></div><span>{data.employees.length} জন</span></div>
        {data.employees.length ? <div className="employee-list">{data.employees.map((e, index) => <div className="employee-card" key={e.id}>
          <div className="employee-avatar">{(e.full_name || "ক").trim().slice(0,1)}</div>
          <div className="employee-info"><b>{e.full_name}</b><small>{e.phone || "মোবাইল নম্বর দেওয়া হয়নি"}</small></div>
          <div className="employee-total"><small>এই মাসে বিক্রি</small><strong>{money(data.employeeSales.filter((row) => row.employee_id === e.id && row.sale_date >= monthStart(today) && row.sale_date <= today).reduce((n, row) => n + Number(row.sales_amount || 0), 0))}</strong></div>
        </div>)}</div> : <Empty>এখনো কোনো কর্মচারী যোগ হয়নি। উপরের ফর্মে নাম লিখে যোগ করুন।</Empty>}
      </section>
      <section className="panel employee-entry-panel"><div className="panel-title"><div><small>QUICK SALES ENTRY</small><h2>কর্মচারীর বিক্রি লিখুন</h2></div><span>প্রতিবার আলাদা হিসাব</span></div><form onSubmit={saveEmployeeSale}>
        <SelectField label="কর্মচারী নির্বাচন করুন" value={employeeSaleForm.employee_id} onChange={(v) => setEmployeeSaleForm({ ...employeeSaleForm, employee_id: v })} options={data.employees.map((e) => [e.id, e.full_name])} emptyActionLabel="কর্মচারী যোগ করুন" onEmptyAction={() => go("employees")} />
        <Field label="তারিখ" type="date" value={employeeSaleForm.sale_date} onChange={(v) => setEmployeeSaleForm({ ...employeeSaleForm, sale_date: v })} />
        <Field label="কর্মচারীর বিক্রির টাকা" type="number" min="0" step="0.01" value={employeeSaleForm.sales_amount} onChange={(v) => setEmployeeSaleForm({ ...employeeSaleForm, sales_amount: v })} required placeholder="যেমন: ৩০০" />
        <TextArea label="নোট (ইচ্ছা হলে)" value={employeeSaleForm.notes} onChange={(v) => setEmployeeSaleForm({ ...employeeSaleForm, notes: v })} />
        <button className="primary-btn full-btn" disabled={busy || !data.employees.length}>বিক্রির হিসাব যোগ করুন</button>
      </form></section>
      <section className="panel"><div className="panel-title"><div><small>TOP PERFORMERS</small><h2>🏆 কর্মচারী লিডারবোর্ড</h2></div>
        <select className="period-select" value={staffPeriod} onChange={(e) => setStaffPeriod(e.target.value)}><option value="today">আজ</option><option value="week">শেষ ৭ দিন</option><option value="month">এই মাস</option></select></div>
        {staffRank.length ? <div className="rank-list">{staffRank.map((e, index) => <div className="rank-row" key={e.id}><span className="rank-num">{index + 1}</span><b>{e.full_name}</b><strong>{money(e.total)}</strong></div>)}</div> : <Empty />}
      </section>
    </> : null}

    {active === "expenses" ? <>
      <PageHead eyebrow="EXPENSES" title="খরচের হিসাব" subtitle="মহাজনকে পেমেন্ট এখানে লিখবেন না—সেটি মহাজন পেমেন্টে আলাদা থাকে।" onBack={() => go("dashboard")} />
      <section className="panel"><form onSubmit={saveExpense}>
        <Field label="খরচের তারিখ" type="date" value={expenseForm.expense_date} onChange={(v) => setExpenseForm({ ...expenseForm, expense_date: v })} />
        <SelectField label="খরচের ধরন" value={expenseForm.category} onChange={(v) => setExpenseForm({ ...expenseForm, category: v })} options={EXPENSE_CATEGORIES} />
        <Field label="কী খরচ?" value={expenseForm.description} onChange={(v) => setExpenseForm({ ...expenseForm, description: v })} required placeholder="যেমন: দোকান ভাড়া" />
        <Field label="টাকার পরিমাণ" type="number" min="0.01" step="0.01" value={expenseForm.amount} onChange={(v) => setExpenseForm({ ...expenseForm, amount: v })} required />
        <SelectField label="কীভাবে টাকা দিয়েছেন?" value={expenseForm.payment_method} onChange={(v) => setExpenseForm({ ...expenseForm, payment_method: v })} options={PAYMENT_METHODS} />
        <TextArea label="নোট" value={expenseForm.notes} onChange={(v) => setExpenseForm({ ...expenseForm, notes: v })} />
        <button className="primary-btn full-btn" disabled={busy}>খরচ সংরক্ষণ করুন</button>
      </form></section>
      <section className="panel"><div className="panel-title"><h2>সাম্প্রতিক খরচ</h2><span>{data.expenses.length} রেকর্ড</span></div>
        {data.expenses.length ? <div className="record-list">{data.expenses.map((e) => <div className="record-row" key={e.id}><div><b>{e.description}</b><small>{dateText(e.expense_date)} · {EXPENSE_CATEGORIES.find((v) => v[0] === e.category)?.[1] || "অন্যান্য"}</small></div><strong>{money(e.amount)}</strong></div>)}</div> : <Empty />}
      </section>
    </> : null}

    {active === "cash" ? <>
      <PageHead eyebrow="DAILY CASH CLOSING" title="দিনের বিবরণ" subtitle="শুধু হাতে থাকা নগদ টাকা এখানে মিলাবেন। ব্যাংক ও মোবাইল পেমেন্ট আলাদা।" onBack={() => go("dashboard")} />
      <section className="panel"><form onSubmit={saveClosing}>
        <Field label="তারিখ" type="date" value={closingForm.closing_date} onChange={(v) => setClosingForm({ ...closingForm, closing_date: v })} />
        <div className="form-section-title">টাকা আসার হিসাব</div>
        <Field label="দিনের শুরুতে হাতে নগদ" type="number" min="0" step="0.01" value={closingForm.opening_cash} onChange={(v) => setClosingForm({ ...closingForm, opening_cash: v })} />
        <Field label="নগদ বিক্রি (কর্মচারীর টাকা বাদে)" type="number" min="0" step="0.01" value={closingForm.cash_sales} onChange={(v) => setClosingForm({ ...closingForm, cash_sales: v })} />
        <Field label="অন্যান্য নগদ জমা" type="number" min="0" step="0.01" value={closingForm.other_cash_receipts} onChange={(v) => setClosingForm({ ...closingForm, other_cash_receipts: v })} />
        <Field label="কর্মচারীর কাছ থেকে নগদ পেয়েছেন" type="number" min="0" step="0.01" value={closingForm.employee_collections} onChange={(v) => setClosingForm({ ...closingForm, employee_collections: v })} />
        <div className="form-section-title">টাকা বের হওয়ার হিসাব</div>
        <Field label="মহাজনকে নগদ দিয়েছেন" type="number" min="0" step="0.01" value={closingForm.supplier_cash_payments} onChange={(v) => setClosingForm({ ...closingForm, supplier_cash_payments: v })} />
        <Field label="নগদ দোকান খরচ" type="number" min="0" step="0.01" value={closingForm.cash_expenses} onChange={(v) => setClosingForm({ ...closingForm, cash_expenses: v })} />
        <Field label="নিজের / পরিবারের জন্য নগদ তুলেছেন" type="number" min="0" step="0.01" value={closingForm.household_withdrawals} onChange={(v) => setClosingForm({ ...closingForm, household_withdrawals: v })} />
        <div className="cash-summary"><span>হিসাব অনুযায়ী হাতে থাকার কথা</span><strong>{money(expectedCash)}</strong></div>
        <Field label="বাস্তবে হাতে কত নগদ আছে?" type="number" min="0" step="0.01" value={closingForm.actual_cash} onChange={(v) => setClosingForm({ ...closingForm, actual_cash: v })} required />
        {cashDifference !== null ? <div className={"cash-difference " + (cashDifference < 0 ? "negative" : "positive")}><span>হিসাবের সঙ্গে পার্থক্য</span><b>{money(cashDifference)}</b><small>{cashDifference === 0 ? "হিসাব মিলে গেছে" : cashDifference > 0 ? "হাতে বেশি টাকা আছে" : "হাতে টাকা কম আছে"}</small></div> : null}
        <TextArea label="নোট" value={closingForm.notes} onChange={(v) => setClosingForm({ ...closingForm, notes: v })} />
        <button className="primary-btn full-btn" disabled={busy}>দিনের হিসাব বন্ধ করুন</button>
      </form></section>
      <section className="panel"><h2>আগের দিনের ক্যাশ ক্লোজিং</h2>
        {data.closings.length ? <div className="record-list">{data.closings.map((c) => <div className="record-row" key={c.id}><div><b>{dateText(c.closing_date)}</b><small>হিসাব অনুযায়ী {money(c.expected_cash)}</small></div><strong>{money(c.actual_cash)}</strong></div>)}</div> : <Empty />}
      </section>
    </> : null}

    {active === "reports" ? <>
      <PageHead eyebrow="BUSINESS REPORT" title="লাভ-লোকসান রিপোর্ট" subtitle="যে দিন মালের আসল খরচ লিখেছেন, শুধু সেই দিনগুলোর পণ্যের লাভ হিসাব করা হয়েছে।" onBack={() => go("dashboard")} />
      <section className="stats-grid report-stats">
        <Stat label="এই মাসের মোট বিক্রি" value={money(sum(monthSales, "total_sales"))} tone="green" />
        <Stat label="আসল জানা দিনগুলোর পণ্যের লাভ" value={money(monthKnownProfit)} tone="blue" />
        <Stat label="ব্যবসা / অন্যান্য খরচ" value={money(monthExpenseTotal)} tone="yellow" />
        <Stat label="আনুমানিক নেট ফল" value={money(monthNetKnown)} tone={monthNetKnown >= 0 ? "green" : "red"} hint="আসল অজানা দিনের লাভ এতে নেই" />
      </section>
      <section className="panel"><h2>মহাজনের বাকি</h2>
        {data.ledger.length ? <div className="record-list">{data.ledger.map((l) => <div className="record-row" key={l.supplier_id}><div><b>{l.shop_name || l.owner_name}</b><small>ক্রয় {money(l.total_purchases)} · পেমেন্ট {money(l.total_payments)} · বাকিতে সমন্বয় {money(l.credit_adjustment_returns)}</small></div><strong>{money(l.outstanding_balance)}</strong></div>)}</div> : <Empty />}
      </section>
      <section className="panel"><h2>ব্যবসার হিসাব বুঝে নিন</h2>
        <div className="explain-list">
          <p><b>পণ্যের লাভ:</b> বিক্রি − বিক্রি হওয়া মালের আসল।</p>
          <p><b>নেট ফল:</b> আসল জানা দিনের পণ্যের লাভ − ব্যবসা ও অন্যান্য খরচ।</p>
          <p><b>নিজের জন্য টাকা তোলা:</b> এটি ব্যবসার খরচ নয়; আলাদা ক্যাশ বহির্গমন।</p>
          <p><b>মহাজনকে পেমেন্ট:</b> এটি বাকি কমায়, আবার খরচ হিসেবে গণনা হয় না।</p>
          <p><b>কর্মচারীর বিক্রি:</b> মোট বিক্রির ভেতরের অংশ; দৈনিক বিক্রিতে দ্বিতীয়বার যোগ হয় না।</p>
        </div>
      </section>
    </> : null}

    <footer>DokanKhata · আপনার দোকানের ডিজিটাল হিসাবখাতা</footer>
    {busy ? <div className="busy-overlay"><div>সংরক্ষণ হচ্ছে…</div></div> : null}
  </main>;
}
