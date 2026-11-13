import "./globals.css";

export const metadata = {
  title: "DokanKhata | দোকানের ডিজিটাল হিসাবখাতা",
  description: "সব ধরনের দোকানের বিক্রি, খরচ ও হিসাব ব্যবস্থাপনা"
};

export default function RootLayout({ children }) {
  return <html lang="bn"><body>{children}</body></html>;
}