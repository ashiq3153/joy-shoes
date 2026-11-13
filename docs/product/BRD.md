# Business Requirements Document (BRD) — DokanKhata

**Product owner:** DokanKhata founder / Managing Director (MD)  
**Market:** Bangladesh  
**Business model:** SaaS; ৳২০০ per shop per month  
**Trial:** ৭ দিন per shop  
**Baseline:** v1.0 — 13 November 2026

## 1. Business vision
DokanKhata is a platform owned and operated by its founder. Independent shop owners subscribe to use the platform to maintain daily business records. Each customer is a tenant; each shop is a separate accounting boundary.

JOY SHOES is the founder's existing example shop and legacy dataset. It is not the product identity and must not be hard-coded as the only shop.

## 2. Business problem
Small Bangladeshi businesses commonly maintain sales, expenses, supplier dues, employee activity and cash records in notebooks or disconnected tools. Owners need one simple mobile-first system, with Bangla labels, that makes daily entry quick and reports understandable.

## 3. Stakeholders and roles
| Stakeholder | Responsibility |
|---|---|
| Platform Owner / MD | Owns DokanKhata, pricing, platform operations, customer and subscription governance |
| Shop Owner | Creates a shop, manages its profile, users, transactions and subscription |
| Manager / Staff | Performs only the operations granted to their shop role |
| Platform Admin | Verifies manual payments and manages customers; future secured admin console |
| Support Operator | Helps customers without unrestricted access to private accounting data |

## 4. Commercial rules
- Starter price: ৳২০০ per shop per month.
- Each new shop receives a 7-day trial.
- Subscription belongs to a shop, not to a global user account.
- Initial payment method: manual bKash / Nagad submission and verification.
- Payment submission is not payment approval.
- Automated gateway integration is a later phase.
- Payment receiver number, QR and instructions must be configured by the platform owner; never hard-code an invented number.

## 5. Business outcomes
1. A new shop owner can register and create a shop without staff assistance.
2. The owner can switch between their shops without data mixing.
3. Daily sales and expenses can be recorded from a phone.
4. Each shop has its own product catalog and subscription state.
5. Platform staff can later manage customers and verify payments through a secure admin surface.
6. Legacy JOY SHOES records remain recoverable and unchanged through migration.

## 6. Scope boundaries
**In scope:** customer-facing SaaS app, authentication, shop onboarding, shop profiles, shop switcher, product catalog, shop-specific sales and expenses, trial and payment request records, future admin foundation.

**Not yet in scope:** production Super Admin functionality, automated payment gateway, SMS/OTP phone verification, staff invitations and fine-grained permissions, complete migration of every legacy accounting module, custom domain.

## 7. Risks and constraints
- Legacy accounting tables are owner-scoped, not yet fully shop-scoped.
- The first release must not combine legacy totals with new shop-specific transactions.
- Phone is currently a profile field; it is not proof of verified phone ownership.
- Payment is pending until an authorized admin verifies it.
- Admin authorization must be server-side and must never rely on editable user metadata.
