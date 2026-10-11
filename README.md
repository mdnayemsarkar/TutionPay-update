# Tuition Collection App — Tailwind + JavaScript

এটি মূলত HTML + Tailwind CSS + JavaScript অ্যাপ। Android অংশে শুধু একটি ছোট WebView launcher আছে, যাতে AndroidIDE থেকে APK চালানো যায়।

## Structure

app/src/main/assets/
- index.html — app entry
- css/tailwind.css — local Tailwind utility/design layer
- js/storage.js — local data storage
- js/utils.js — common helpers
- js/students.js — student logic
- js/payments.js — payment logic
- js/receipt.js — receipt/print
- js/reports.js — report logic
- js/app.js — screen/navigation orchestration
- pages/ — future page-specific HTML
- components/ — reusable UI pieces

app/src/main/java/.../MainActivity.java
- শুধু local index.html WebView-তে load করে। Business logic এখানে নেই।

## Current preview features

- Student details
- Monthly fee
- Student edit/delete
- Year selector
- Month navigation
- Monthly payment checklist
- Paid / Partial / Due
- Automatic due list
- Payment amount/date/month/comment
- Student Jan-Dec yearly summary
- Complete payment history
- Receipt + print
- LocalStorage
- JSON backup/restore

## Tailwind note

`css/tailwind.css` local রাখা হয়েছে যাতে APK preview-তে CDN/internet-এর উপর নির্ভর করতে না হয়। File-এর শুরুতে Tailwind directives রাখা হয়েছে এবং preview-এর জন্য প্রয়োজনীয় compiled utility layer একই file-এ আছে।

## AndroidIDE

ZIP extract করে AndroidIDE-তে project folder open করুন, Gradle sync হতে দিন এবং Run চাপুন।

## Phase 2 UI

- Mobile-first dashboard with collection hero card
- Payment status progress
- Quick action cards
- Improved student list and avatar
- Dedicated folders documented for each page/component
