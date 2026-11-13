"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "../lib/supabase/client";

const PAYMENT_METHODS = [
  ["cash", "নগদ"],
  ["bkash", "বিকাশ"],
  ["nagad", "নগদ"],
  ["rocket", "রকেট"],
  ["bank", "ব্যাংক"],
  ["other", "অন্যান্য"]
];
const EXPENSE_CATEGORIES = [
  ["business", "দোকানের খরচ"],
  ["household_withdrawal", "নিজের / পরিবারের জন্য তোলা"],
  ["other", "অন্যান্য খরচ"]
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

function SelectField({ label, value, onChange, options, placeholder = "নির্বাচন করুন", required = true }) {
  return <label className="field-wrap">
    <span>{label}</span>
    <select className="field-control" value={value} onChange={(e) => onChange(e.target.value)} required={required}>
      <option value="">{placeholder}</option>
      {options.map(([v, text]) => <option value={v} key={v}>{text}</option>)}
    </select>
  </label>;
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

  async function refreshData(userId) {
    setLoadingData(true);
    try {
      const requests = [
        supabase.from("daily_sales").select("*").eq("owner_id", userId).order("sale_date", { ascending: false }).limit(180),
        supabase.from("suppliers").select("*").eq("owner_id", userId).order("created_at", { ascending: false }),
        supabase.from("supplier_ledger_view").select("*").eq("owner_id", userId).order("owner_name"),
        supabase.from("purchases").select("*").eq("owner_id", userId).order("purchase_date", { ascending: false }).limit(100),
        supabase.from("purchase_items").select("*").eq("owner_id", userId).limit(500),
        supabase.from("supplier_payments").select("*").eq("owner_id", userId).order("payment_date", { ascending: false }).limit(100),
        supabase.from("purchase_returns").select("*").eq("owner_id", userId).order("return_date", { ascending: false }).limit(100),
        supabase.from("return_items").select("*").eq("owner_id", userId).limit(300),
        supabase.from("employees").select("*").eq("owner_id", userId).order("created_at", { ascending: false }),
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
      try {
        const { error } = await supabase.from("owners").upsert({ id: session.user.id }, { onConflict: "id" });
        if (error) throw error;
        if (alive) await refreshData(session.user.id);
      } catch (error) {
        if (alive) setFlash("ডেটা লোড হয়নি: " + (error.message || "আবার চেষ্টা করুন"));
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
      await refreshData(session.user.id);
      setFlash(warning || successText);
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
      const { data: saved, error } = await supabase.from("suppliers").insert({
        owner_id: session.user.id, ...supplierForm, opening_balance: Number(supplierForm.opening_balance || 0)
      }).select("id").single();
      if (error) throw error;
      if (supplierPhoto) {
        const path = session.user.id + "/suppliers/" + saved.id + "-" + supplierPhoto.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const upload = await supabase.storage.from("joy-shoes-files").upload(path, supplierPhoto, { upsert: true });
        if (!upload.error) {
          await supabase.from("suppliers").update({ photo_path: path }).eq("id", saved.id).eq("owner_id", session.user.id);
        } else {
          return "মহাজন যোগ হয়েছে, তবে ছবিটি আপলোড হয়নি: " + upload.error.message;
        }
      }
      await writeAudit("suppliers", saved.id, "insert", supplierForm);
      setSupplierForm({ owner_name: "", shop_name: "", phone: "", address: "", location_text: "", opening_balance: "0", notes: "" });
      setSupplierPhoto(null);
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
          return "ক্রয় সংরক্ষণ হয়েছে, তবে ক্যাশ মেমো আপলোড হয়নি: " + upload.error.message;
        }
      }
      setPurchaseForm({ supplier_id: "", purchase_date: todayBD(), invoice_number: "", amount_paid: "0", payment_method: "cash", reference_note: "", notes: "" });
      setPurchaseLines([freshLine()]);
      setMemoFile(null);
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
        owner_id: session.user.id, full_name: employeeForm.full_name.trim(),
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

  if (!authReady) return <main className="shell"><div className="loading-screen">JOY SHOES<br />লোড হচ্ছে...</div></main>;

  if (!session) return <main className="shell auth-shell">
    <header className="top"><div className="logo">JS</div><div><small>সহজ ব্যবসা ব্যবস্থাপনা</small><h1>JOY SHOES</h1></div></header>
    <section className="auth-card">
      <div className="auth-icon">🔐</div>
      <small>OWNER ACCESS</small>
      <h2>{isSignup ? "মালিকের অ্যাকাউন্ট তৈরি" : "মালিক লগইন"}</h2>
      <p>এই অ্যাপটি শুধু দোকানের মালিক ব্যবহার করবেন।</p>
      <form onSubmit={async (event) => {
        event.preventDefault(); setBusy(true); setFlash("");
        try {
          const result = isSignup
            ? await supabase.auth.signUp({ email: authEmail, password: authPassword, options: { emailRedirectTo: window.location.origin } })
            : await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
          if (result.error) throw result.error;
          if (isSignup && !result.data.session) setFlash("ইমেইলে পাঠানো লিংক খুলে অ্যাকাউন্ট নিশ্চিত করুন, তারপর লগইন করুন।");
          else setFlash("লগইন সফল হচ্ছে...");
        } catch (error) { setFlash(error.message || "লগইন করা যায়নি।"); }
        finally { setBusy(false); }
      }}>
        <Field label="ইমেইল" value={authEmail} onChange={setAuthEmail} type="email" placeholder="আপনার ইমেইল" required />
        <Field label="পাসওয়ার্ড" value={authPassword} onChange={setAuthPassword} type="password" placeholder="কমপক্ষে ৬ অক্ষর" required />
        <button className="primary-btn full-btn" disabled={busy}>{busy ? "অপেক্ষা করুন..." : isSignup ? "অ্যাকাউন্ট তৈরি করুন" : "লগইন করুন"}</button>
      </form>
      <button className="text-btn" type="button" onClick={() => { setIsSignup(!isSignup); setFlash(""); }}>
        {isSignup ? "আগে অ্যাকাউন্ট আছে? লগইন করুন" : "নতুন মালিক? অ্যাকাউন্ট তৈরি করুন"}
      </button>
      {flash ? <p className="notice">{flash}</p> : null}
    </section>
    <footer>JOY SHOES · শুধু মালিকের ব্যবহারের জন্য</footer>
  </main>;

  const moduleCards = [
    ["🛍️", "আজকের বিক্রি", "দৈনিক বিক্রির হিসাব", "sales", "green"],
    ["👥", "মহাজন", "মহাজন ও বাকি হিসাব", "suppliers", "blue"],
    ["📦", "নতুন মাল কেনা", "ক্রয়, আইটেম ও ক্যাশ মেমো", "purchases", "purple"],
    ["💸", "খরচ", "দোকান ও পারিবারিক খরচ", "expenses", "yellow"],
    ["🧑‍💼", "কর্মচারী", "কর্মচারীর বিক্রির হিসাব", "employees", "orange"],
    ["🧮", "ক্যাশ মিল", "দিনের হাতে থাকা টাকা", "cash", "pink"]
  ];

  return <main className="shell app-shell">
    <header className="top app-top">
      <div className="logo">JS</div>
      <div className="brand-title"><small>সহজ ব্যবসা ব্যবস্থাপনা</small><h1>JOY SHOES</h1></div>
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
      <PageHead eyebrow="SUPPLIERS" title="মহাজন / পাইকারের হিসাব" subtitle="প্রত্যেক মহাজনের আলাদা বাকি, ক্রয় ও পেমেন্টের হিসাব থাকবে।" onBack={() => go("dashboard")} />
      <section className="panel">
        <div className="panel-title"><h2>＋ নতুন মহাজন যোগ করুন</h2></div>
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
      <section className="panel"><div className="panel-title"><h2>মহাজনের তালিকা</h2><span>{data.suppliers.length} জন</span></div>
        {data.suppliers.length ? <div className="supplier-list">{data.suppliers.map((s) => {
          const balance = data.ledger.find((l) => l.supplier_id === s.id)?.outstanding_balance ?? s.opening_balance;
          return <article className="supplier-card" key={s.id}>
            <div className="supplier-avatar">👤</div><div className="supplier-info"><b>{s.shop_name || s.owner_name}</b><small>{s.owner_name}{s.phone ? " · " + s.phone : ""}</small><strong>{money(balance)} <em>বাকি</em></strong></div>
            <div className="supplier-actions">
              <button onClick={() => { setSelectedSupplier(s.id); setPaymentForm({ ...paymentForm, supplier_id: s.id }); go("payments"); }}>টাকা দিন</button>
              <button onClick={() => { setSelectedSupplier(s.id); setReturnForm({ ...returnForm, supplier_id: s.id }); go("returns"); }}>মাল ফেরত</button>
            </div>
          </article>;
        })}</div> : <Empty>প্রথমে উপরের ফর্মে মহাজনের নাম যোগ করুন।</Empty>}
      </section>
    </> : null}

    {active === "purchases" ? <>
      <PageHead eyebrow="PURCHASE ENTRY" title="নতুন মাল কেনার হিসাব" subtitle="একটি চালানে একাধিক ডিজাইন ও জোড়া যোগ করতে পারবেন।" onBack={() => go("dashboard")} />
      <section className="panel">
        <form onSubmit={savePurchase}>
          <SelectField label="মহাজন নির্বাচন" value={purchaseForm.supplier_id} onChange={(v) => setPurchaseForm({ ...purchaseForm, supplier_id: v })} options={data.suppliers.map((s) => [s.id, (s.shop_name || s.owner_name) + (s.phone ? " · " + s.phone : "")])} />
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
        <SelectField label="মহাজন" value={paymentForm.supplier_id || selectedSupplier} onChange={(v) => { setSelectedSupplier(v); setPaymentForm({ ...paymentForm, supplier_id: v }); }} options={data.suppliers.map((s) => [s.id, s.shop_name || s.owner_name])} />
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
        <SelectField label="মহাজন" value={returnForm.supplier_id || selectedSupplier} onChange={(v) => { setSelectedSupplier(v); setReturnForm({ ...returnForm, supplier_id: v }); }} options={data.suppliers.map((s) => [s.id, s.shop_name || s.owner_name])} />
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
      <PageHead eyebrow="EMPLOYEES" title="কর্মচারীর হিসাব" subtitle="কর্মচারী বিক্রি হলো দৈনিক বিক্রির ভাগ—এটি দৈনিক মোট বিক্রিতে আবার যোগ হবে না।" onBack={() => go("dashboard")} />
      <section className="panel"><h2>＋ কর্মচারী যোগ করুন</h2><form onSubmit={saveEmployee}>
        <Field label="কর্মচারীর নাম" value={employeeForm.full_name} onChange={(v) => setEmployeeForm({ ...employeeForm, full_name: v })} required />
        <Field label="মোবাইল নম্বর" value={employeeForm.phone} onChange={(v) => setEmployeeForm({ ...employeeForm, phone: v })} />
        <TextArea label="নোট" value={employeeForm.notes} onChange={(v) => setEmployeeForm({ ...employeeForm, notes: v })} />
        <button className="primary-btn full-btn" disabled={busy}>কর্মচারী সংরক্ষণ করুন</button>
      </form></section>
      <section className="panel"><h2>＋ কর্মচারীর বিক্রি লিখুন</h2><form onSubmit={saveEmployeeSale}>
        <SelectField label="কর্মচারী" value={employeeSaleForm.employee_id} onChange={(v) => setEmployeeSaleForm({ ...employeeSaleForm, employee_id: v })} options={data.employees.map((e) => [e.id, e.full_name])} />
        <Field label="তারিখ" type="date" value={employeeSaleForm.sale_date} onChange={(v) => setEmployeeSaleForm({ ...employeeSaleForm, sale_date: v })} />
        <Field label="কর্মচারীর বিক্রির টাকা" type="number" min="0" step="0.01" value={employeeSaleForm.sales_amount} onChange={(v) => setEmployeeSaleForm({ ...employeeSaleForm, sales_amount: v })} required />
        <TextArea label="নোট" value={employeeSaleForm.notes} onChange={(v) => setEmployeeSaleForm({ ...employeeSaleForm, notes: v })} />
        <button className="primary-btn full-btn" disabled={busy || !data.employees.length}>বিক্রির হিসাব যোগ করুন</button>
      </form></section>
      <section className="panel"><div className="panel-title"><h2>🏆 কর্মচারী লিডারবোর্ড</h2>
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
      <PageHead eyebrow="DAILY CASH CLOSING" title="দিনের ক্যাশ মিলান" subtitle="শুধু হাতে থাকা নগদ টাকা এখানে মিলাবেন। ব্যাংক ও মোবাইল পেমেন্ট আলাদা।" onBack={() => go("dashboard")} />
      <section className="panel"><form onSubmit={saveClosing}>
        <Field label="তারিখ" type="date" value={closingForm.closing_date} onChange={(v) => setClosingForm({ ...closingForm, closing_date: v })} />
        <div className="form-section-title">টাকা আসার হিসাব</div>
        <Field label="দিনের শুরুতে হাতে নগদ" type="number" min="0" step="0.01" value={closingForm.opening_cash} onChange={(v) => setClosingForm({ ...closingForm, opening_cash: v })} />
        <Field label="নগদ বিক্রি" type="number" min="0" step="0.01" value={closingForm.cash_sales} onChange={(v) => setClosingForm({ ...closingForm, cash_sales: v })} />
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

    <footer>JOY SHOES · আপনার ব্যবসার হিসাব, আপনার নিয়ন্ত্রণে</footer>
    {busy ? <div className="busy-overlay"><div>সংরক্ষণ হচ্ছে…</div></div> : null}
  </main>;
}
