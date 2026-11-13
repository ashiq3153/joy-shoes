# Product Requirements Document (PRD) — DokanKhata

**Version:** 1.0 · **Status:** Active baseline · **Date:** 13 November 2026

## 1. Product summary
DokanKhata is a mobile-first Bangla bookkeeping SaaS for small businesses in Bangladesh. An account may own multiple independent shops. Every shop has its own category, profile, transactions, products, and subscription.

## 2. Primary user journeys
### A. First-time owner
1. Open DokanKhata.
2. Register with name, mobile number, email and password.
3. Confirm email if Supabase email confirmation is enabled, then log in.
4. Choose a shop category: footwear, cosmetics, grocery, clothing, electronics or other.
5. Enter shop name, phone, address, logo and cover image.
6. Enter the shop dashboard; the shop receives a 7-day Starter trial.

### B. Returning owner
1. Log in.
2. Open the last-used / first available shop.
3. Switch shop from the top selector when more than one shop exists.
4. Add sale, expense, product, or view the shop subscription.

### C. Add another shop
1. Select “নতুন দোকান যোগ করুন”.
2. Choose a category and complete its profile.
3. A separate trial/subscription record is created for that shop.
4. Shop-specific data must remain isolated.

### D. Manual renewal
1. Open the active shop's Subscription page.
2. Send ৳২০০ through the configured business payment instructions.
3. Submit payment method, sender phone and transaction ID.
4. The request remains Pending until an authorized platform admin approves or rejects it.

## 3. Shop categories
| Key | Bangla label |
|---|---|
| footwear | জুতা ও ফুটওয়্যার |
| cosmetics | কসমেটিকস |
| grocery | মুদি দোকান |
| clothing | কাপড় ও পোশাক |
| electronics | ইলেকট্রনিক্স |
| other | অন্যান্য ব্যবসা |

## 4. Feature requirements
| ID | Requirement | Priority |
|---|---|---|
| AUTH-01 | Email/password sign up and login | P0 |
| AUTH-02 | Owner profile with name and phone | P0 |
| SHOP-01 | Shop category selection and onboarding | P0 |
| SHOP-02 | Multiple shops per owner | P0 |
| SHOP-03 | Shop switcher | P0 |
| SHOP-04 | Shop logo, cover, phone and address | P1 |
| SALE-01 | Multiple sale entries per day, timestamped and shop-scoped | P0 |
| EXP-01 | Quick expense entry with categories | P0 |
| INV-01 | Per-shop product catalog, search and stock fields | P1 |
| BILL-01 | 7-day trial per shop | P0 |
| BILL-02 | ৳২০০ / shop / month Starter plan | P0 |
| BILL-03 | Manual bKash/Nagad payment request | P1 |
| BILL-04 | Admin review and activation | P1, admin phase |
| ADMIN-01 | Secure platform dashboard | P1, later phase |
| LEG-01 | Preserve and migrate JOY SHOES historical records | P0 |

## 5. Dashboard requirements
- Show selected shop name, logo and cover image.
- Show today's sales, expenses and profit only from data belonging to that shop.
- Never treat missing cost information as zero profit.
- Show recent transactions.
- Provide visible quick actions: Sale and Expense.
- Provide modules for Products/Stock, Suppliers, Employees, Reports, Purchase, Shop Profile and Subscription.
- Until legacy accounting tables are shop-scoped, legacy modules must be clearly identified and limited to the first/legacy shop.

## 6. Accounting rules
- Each sale entry is a single transaction; multiple entries can be created on the same date.
- Product cost is optional. Profit is not presented as known if cost is absent.
- Shop expense categories: business, hand expense, employee payment, owner withdrawal, other.
- Owner withdrawal is not operating expense.
- Supplier payments are not operating expenses.
- Employee sales attribution must not be added to shop sales a second time.
- Cash balance and accounting profit are different measures.

## 7. UX requirements
- Bengali-first labels, mobile-first layout and large touch targets.
- Green fintech brand, high-contrast text, card-based dashboard and clear status labels.
- Forms should be short, with optional fields clearly marked.
- All save operations show loading, success and error states.
- Responsive at 360px mobile width and larger screens.

## 8. Acceptance criteria for current foundation
- Existing account can sign in and find its existing shop.
- Owner can add a second shop.
- Shop switcher changes the active shop.
- Sales, expenses and products query by selected shop_id.
- Subscription is per shop and payment request status remains pending.
- Shop profile images upload only under a shop-owned storage path.
- Legacy JOY SHOES rows are not deleted or rewritten.
