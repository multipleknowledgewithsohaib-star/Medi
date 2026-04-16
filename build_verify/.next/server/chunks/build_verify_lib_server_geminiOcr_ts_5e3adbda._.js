module.exports=[97496,36602,43529,e=>{"use strict";var t=e.i(29642);let n=["gemini-2.5-flash","gemini-2.5-flash-lite","gemini-2.0-flash","gemini-2.0-flash-lite","gemini-flash-latest"];async function a(e){try{let t=await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${e}`);if(!t.ok)return n;let a=((await t.json()).models||[]).filter(e=>Array.isArray(e.supportedMethods)&&e.supportedMethods.includes("generateContent")).map(e=>String(e.name||"").split("/").pop()).filter(e=>/flash|pro/i.test(e));if(!a.length)return n;let r=[...n.filter(e=>a.includes(e)),...a.filter(e=>!n.includes(e))];return[...new Set(r)]}catch{return n}}async function r(e,n,r){var i;let o,u,s,c,l=new t.GoogleGenerativeAI(e),m=(u=(o=n.match(/^data:([a-zA-Z]+\/[a-zA-Z0-9.+_-]+);base64,/))?o[1]:"image/jpeg",{inlineData:{data:n.split(",")[1]||n,mimeType:u}}),d=await a(e),p=null,h=[];for(let e of d){h.push(e);try{let t=l.getGenerativeModel({model:e,generationConfig:{temperature:.1,maxOutputTokens:8192,responseMimeType:"application/json"}}),n=await t.generateContent([r,m]),a=(await n.response).text();return{data:function(e){let t=String(e||"").trim().replace(/^```json\s*/i,"").replace(/^```\s*/i,"").replace(/\s*```$/i,"").trim(),n=t.match(/\{[\s\S]*\}/);return JSON.parse(n?n[0]:t)}(a),model:e}}catch(e){p=e}}throw i=p,s=String(i?.message||"Unknown OCR failure"),((c=Error("AI OCR failed")).details=s,s.includes("429"))?(c.status=429,c.message="Gemini quota or rate limit reached",c.help=`The current API key cannot process OCR right now. Tried models: ${h.join(", ")}`):s.includes("404")?(c.status=502,c.message="Configured Gemini model is unavailable",c.help=`The OCR service skipped unsupported model names and tried: ${h.join(", ")}`):s.includes("503")?(c.status=503,c.message="Gemini service is temporarily busy",c.help=`Retry after a short wait. Tried models: ${h.join(", ")}`):(c.status=500,c.message="AI Model Error",c.help=`Tried models: ${h.join(", ")}`),c}async function i(e,t,n){return r(e,t,n)}function o(){return`
        Extract ALL information from EVERY SINGLE PAGE of this document (image or PDF).
        This document may contain multiple pharmaceutical invoices.
        SCAN EVERY LINE OF EVERY TABLE ON EVERY PAGE. DO NOT SKIP ANY PRODUCT ROW.

        JSON Structure:
        {
            "invoices": [
                {
                    "supplierName": "Name of the supplier",
                    "invoiceNo": "Invoice #",
                    "supplyId": "Supply Id / shipment reference when printed",
                    "date": "YYYY-MM-DD",
                    "total": 0.00,
                    "items": [
        {
            "itemCode": "Printed item code if visible",
            "name": "Full Product Name",
            "packing": "Pack size text if printed, e.g. 20's",
            "batch": "Batch Number",
            "qty": 0,
            "bonus": 0,
            "rate": 0.00,
            "amount": 0.00,
            "discountAmount": 0.00,
            "productDiscountAmount": 0.00,
            "salesTaxAmount": 0.00,
            "furtherTaxAmount": 0.00,
            "advanceTaxAmount": 0.00,
            "discountPercent": 0.00,
            "gstPercent": 0.00,
            "furtherTaxPercent": 0.00,
            "nonAtlTaxPercent": 0.00,
                            "advanceTaxPercent": 0.00,
                            "isATL": true,
                            "net": 0.00,
                            "expiry": "YYYY-MM-DD",
                            "mfgDate": "YYYY-MM-DD"
                        }
                    ]
                }
            ]
        }

        Read the invoice in TWO PASSES:
        1. First identify only real product rows.
        2. Then read each real row strictly from left to right on the SAME horizontal line.

        Real product row rules:
        - A real product row usually starts with a serial number under "No." and often a 4 to 7 digit item code on the far left.
        - Product name is the medicine description on that same row.
        - Ignore company headers, section headers, manufacturer labels, addresses, totals, and tax summaries.
        - Examples of section headers that are NOT products: "ATCO LABORATORIES LIMITED", "CHIESI PHARMACEUTICALS (PRIVATE) LIMITED", "HIGH Q NUTRITION (ST)", "LADA LABORATORIES (ST)".
        - If a line is a manufacturer/group heading in uppercase and does not have its own Qty, Batch, Expiry, Rate, and Amount row values, do not output it as a product.
        - Never move a product name from one row and TP/Qty/Batch/Amount from another row.

        Very important column mapping for pharma invoices:
        - Product name = medicine description column on the left.
        - itemCode = the 4 to 7 digit printed code that appears before the medicine name when present, e.g. 21018.
        - rate = TP / Trade Price / unit price column, NOT row total.
        - qty = Qty. column.
        - bonus = Bon / Bonus column.
        - batch and expiry usually come from Batch/Expiry combined column. Example: "121N013 /7-27" means batch "121N013" and expiry July 2027.
        - net = final row net / payable / total amount for that product line.
        - discountPercent must come from Dist. Disc / Comp Disc / Disc columns only.
        - gstPercent, advanceTaxPercent, nonAtlTaxPercent, furtherTaxPercent must come only from printed tax columns.
        - invoice date must come from the header field labeled "Inv. Date".
        - if the printed invoice year is blurry, use the year from Supply Id when present.

        Apex Distributor invoice layout:
        - Company header can appear as "APEX DISTRIBUTOR" and the document title may read "SALES INVOICE".
        - Use "Invoice No." / "Inv. No." as invoiceNo.
        - Use the top-right "Invoice Date" field or the printed DATE as date.
        - If both Gregorian and Hijri dates appear, keep the Gregorian date only.
        - Ignore "Cheque Date", "Order Date", "Payment Term", "D.O. No.", and any Hijri-only date as the invoice/shipment date.
        - Ignore customer detail blocks, payment terms, order no/order date, salesman, prepared by, page numbers, and footer warranty text.
        - Main table is typically: Quantity | Product Name | Packing | Batch | Expiry | Rate | Gross Amount | Disc. | Amount Exclusive Sales Tax | Sales Tax Amount | Further Tax Amount | Amount Inclusive Sales Tax.
        - Product Name maps to name.
        - Packing maps to packing and should be preserved as printed, e.g. 20's, 10's, 14's.
        - Batch maps to batch.
        - Expiry maps to expiry and is a visible column on every product row when printed.
        - Expiry values like 09/28, 11/28, 10/28, and 08/28 mean month/year. Read them as MM/YY, not day/month.
        - If the expiry column is faint or noisy, still extract the month/year from that cell and do not leave expiry empty.
        - Example row: "AMLO-Q 10MG | 120ml | ASR-07 | 10/27 | 355.51" means expiry is 2027-10-01 and the row is a product row.
        - Rate is the unit price.
        - Quantity is the small whole-number column on the far left.
        - Gross Amount is the row amount before discount/tax.
        - Amount Exclusive Sales Tax is the row subtotal before sales tax.
        - Sales Tax Amount and Further Tax Amount are printed rupee amounts, not quantities.
        - Store Sales Tax Amount in salesTaxAmount and Further Tax Amount in furtherTaxAmount.
        - Leave gstPercent, furtherTaxPercent, and advanceTaxPercent at 0 unless a percentage is explicitly printed.
        - Amount Inclusive Sales Tax is the final row total; store it in net / netAmount.
        - Do not confuse Packing with Batch or Quantity.

        Abdullah Brothers & Co. invoice layout:
        - Company header can appear as "ABDULLAH BROTHERS & CO." and the document title may read "SALES TAX INVOICE".
        - Use "Invoice No." as invoiceNo and "Inv. Date" as date.
        - Ignore "Order Date", "D.O. No.", salesman, deliveryman, payment term, and prepared-by text when extracting invoice date or product data.
        - The table header is: Quantity | Product Name | Packing | Batch | Expiry | Rate | Gross Amount | Disc. % | Amount Exclusive Sales Tax | Sales Tax Amount | Further S. Tax Amt. | Amount Inclusive Sales Tax.
        - In this layout, a manufacturer/group heading is often printed on its own uppercase line above the actual product row. Examples: "AMARANT PHARMACEUTICALS (PVT) LTD", "CONSUMER PRODUCTS", "CONTINENTAL PHARMACEUTICALS", "GENETICS PHARMACEUTICALS", "JENPHARM LIFE SCIENCES", "SCILIFE PHARMA (PVT.) LTD", "SOIS LIFE SCIENCES", "SURGE LABORATORIES", "WILLMAR SCHWABE".
        - Do NOT output those manufacturer/group headings as products.
        - The actual product row is the line below the heading, and it contains the quantity/packing/batch/expiry/rate values for that product.
        - If a line does not have its own printed Qty in the first column and printed Rate in the rate column, do not treat it as a product row.
        - Expiry values like 05/27, 09/27, 08/27, 10/27, 05/29, and 01/30 are month/year values, not day/month values. Convert them to YYYY-MM-01.
        - If a row does not have its own Qty, Packing, Batch, Expiry, or Rate values, it is not a product row.

        Pharmalink Distribution invoice layout:
        - Header company can appear as "PHARMALINK DISTRIBUTION (PVT.) LTD" and the document title may read "SALES TAX INVOICE".
        - Use "Invoice#" as invoiceNo and the printed invoice date field as date.
        - Main table is typically: Quantity | BNS | Product Name & Pack Size | Batch | Exp | T.P | Disc% | Sales Tax | Gross Amt | Adv.Tax | Net Amount.
        - Quantity is the billed quantity.
        - BNS is bonus quantity, not batch.
        - Product Name & Pack Size maps to the medicine description and printed pack size text.
        - Batch maps to batch and Exp maps to expiry.
        - T.P is the unit rate.
        - Gross Amt is the row value before advance tax.
        - Adv.Tax is a row tax amount in rupees, not quantity.
        - Centered company/group headings may appear between product rows, such as ".CCL", ".MARTIN DOW", ".MARTIN DOW MAKER", ".GENIX", and "BARRETT HODGSON".
        - Those centered company/group headings are NOT products and must NOT be counted as medicines.
        - The actual medicine row is the line below each centered company heading.

        Premier Sales / Premier Medico invoice layout:
        - Left to right order is: item code + product name | M.R.P | TP | Qty. | Bon | Batch/Expiry | Amount | Dist. Disc | Comp Disc | GST | Add. GST | Net Amount.
        - Qty is the small whole-number column immediately after TP.
        - Bonus is the next small whole-number column immediately after Qty.
        - Batch/Expiry is immediately after Bonus.
        - Amount is the rounded money column immediately to the right of Batch/Expiry.
        - Dist. Disc and Comp Disc are percentage columns to the right of Amount. Do not mistake them for qty.
        - Handwritten ticks, circles, pen marks, or arrows over Qty / Bon / Batch must be ignored. Use the printed number or printed text underneath.
        - If a section header appears above a group, continue reading the actual product rows below it. Do not output the section header as an item.

        Muller & Phipps Pakistan (Pvt) Ltd. invoice layout:
        - Company header can appear as "MULLER & PHIPPS PAKISTAN (PVT) LTD." and the document title may read "CASH MEMO / INVOICE".
        - Use "Cash Memo/Invoice Number" as invoiceNo.
        - Use "Pick Summary No." as supplyId when it is printed.
        - Ignore metadata such as "Booked By", "Order Number", "Delivered By", "Invoice Due Date", depot information, NTN/STR numbers, and page numbers.
        - Main table is typically: PRODUCT CODE | PRODUCT DESCRIPTION | QTY | BATCH NUMBER | EXPIRY DATE | TP/RATE | GROSS AMOUNT | DISCOUNT AMOUNT | SALES TAX | FURTHER TAX | ADVANCE TAX | VAL. INCL. OF TAXES.
        - PRODUCT CODE maps to itemCode.
        - PRODUCT DESCRIPTION maps to name.
        - QTY is the quantity column and is usually a small whole number.
        - BATCH NUMBER and EXPIRY DATE are separate columns when visible.
        - TP/RATE is the unit rate.
        - GROSS AMOUNT is the row amount before tax.
        - DISCOUNT AMOUNT is usually 0.00 on this layout unless a real printed discount is shown.
        - SALES TAX and FURTHER TAX are often 0.00 on this layout.
        - ADVANCE TAX is a line tax amount in rupees, not a quantity. Store it in advanceTaxAmount.
        - VAL. INCL. OF TAXES is the final row net amount. Store it in net / netAmount.
        - If expiry is printed as a month/year like "SEP/2028" or "AUG/2027", convert it to YYYY-MM-01.
        - Numeric expiry values like "05/28", "06/28", "09/27", and "10/27" are also month/year. Read them as MM/YY, not day/month.
        - If OCR adds a trailing year like "11/28/2023", keep the month/year from the expiry column and ignore the extra trailing year noise.
        - Do not confuse page totals or footer totals with a product row amount.

        Premier examples:
        - TP 272.00 with row amount/net 544 means qty is 2.
        - TP 306.00 with row amount/net 612 means qty is 2.
        - TP 127.50 with row amount/net 383 means qty is 3.
        - TP 382.50 with row amount/net 765 means qty is 2.
        - TP 318.75 with row amount/net 319 means qty is 1.
        - TP 433.50 with row amount/net 867 means qty is 2.
        - DO NOT mistake rounded Amount values such as 319, 383, 544, 612, 765, 867, 1828, 2763, 5624 for quantity.

        UDL Distribution invoice layout:
        - Header company can be "UDL DISTRIBUTION (PVT) LTD".
        - Header fields include "CASH MEMO NO.", "D.C.NO.", and "DATE". Use the printed invoice/cash memo number as invoiceNo.
        - Main table is typically: S.# | PRODUCTS | QTY. | BATCH NO. | TP | TP VALUE / MRP VALUE | DISCOUNT INV / PROD | S. TAX | A. TAX | NET AMOUNT.
        - qty = QTY. column.
        - batch = BATCH NO. column.
        - rate = TP column.
        - net = NET AMOUNT column on the far right.
        - TP VALUE / MRP VALUE is a row value column, not quantity.
        - If TP VALUE is printed separately, return that row amount in "amount".
        - S. TAX and A. TAX are often printed as line tax AMOUNTS in rupees, not percentages.
        - In JSON, convert those printed rupee tax amounts into percentage fields:
          S. TAX -> gstPercent
          A. TAX -> advanceTaxPercent
        - Example: if qty 2 and TP 138.01 gives taxable value about 276, and net is about 277.40, then advanceTaxPercent should be 0.5, NOT 1 rupee.
        - Example: if qty 2 and TP 1071.09 gives taxable value about 2142, and net is about 2152.69, then advanceTaxPercent should be 0.5.
        - Some UDL invoices have split headers: DISCOUNT -> INV. / PROD., then S. TAX, A.I TAX, NET AMOUNT.
        - In those split-discount UDL invoices:
          PRODUCTS -> name
          QTY. -> qty
          BATCH NO. -> batch
          TP -> rate
          TP VALUE -> amount
          MRP VALUE is not needed; do not copy MRP VALUE into qty, rate, batch, or net.
          DISCOUNT INV. -> invoice discount for that row. If it is printed as a rupee amount, convert it into discountPercent and also return the rupee amount in discountAmount.
          DISCOUNT PROD. -> productDiscountAmount only when a real value is printed, otherwise keep it 0.
          S. TAX -> gstPercent and salesTaxAmount.
          A.I TAX / A. TAX -> advanceTaxPercent and advanceTaxAmount.
        - Common UDL split-discount pattern:
          INV discount is 1.5% of TP VALUE.
          S. TAX is 22.00%.
          A.I TAX / A. TAX is often 0.61% or 0.5%.
        - NEVER place A.I TAX rupee amount inside salesTaxAmount / S. TAX.
        - If one small printed tax amount fits about 0.5% or 0.61% and does not fit about 22%, store it as advanceTaxAmount, not salesTaxAmount.
        - NET AMOUNT on UDL should already include invoice discount, S. TAX, and A.I TAX / A. TAX.
        - License expiry printed in the top-right header is NOT the medicine expiry date. Do not copy license expiry into item expiry.
        - Many UDL invoices do not print item expiry in the line table. If not printed on the row, leave item expiry empty.

        UDL bonus section rules:
        - A separate "Bonus" section may appear below the main table.
        - A row inside the Bonus section is NOT a new billed line item.
        - If a bonus row repeats a product from the main table, add its printed quantity to that product's "bonus" field instead of creating a duplicate item.
        - Bonus rows usually do not have valid TP, subtotal, or net columns. Do NOT copy invoice subtotal, subtotal rounded off, or net payable amount into rate or net for bonus rows.
        - If a product appears once in the main table and again in Bonus, keep one item only:
          main row qty = billed quantity
          bonus = bonus section quantity
          rate/net = from the billed main row only

        Rules:
        1. MULTI-PAGE: Extract every product row from every page.
        2. MULTI-INVOICE: Keep each invoice separate inside the "invoices" array.
        3. DO NOT treat supplier names, company headers, addresses, NTN/GST info, totals, or table headings as products.
        4. BATCH: return only the batch code. EXPIRY: convert month/year or printed date to YYYY-MM-DD when possible.
        5. If a printed qty digit has a pen tick, slash, or handwritten check mark over it, use the printed digit only.
        6. NEVER copy row total/net amount into "qty" or "rate".
        7. NEVER use invoice total as unit price.
        8. Prefer printed table columns over any handwritten marks or stamps.
        9. If qty candidate looks like a money amount or rounded amount column value, reject it and use the actual small integer from Qty column, otherwise set "qty" to 0.
        10. If TP/unit price is unreadable set "rate" to 0.
        11. Keep the row line amount in "net" even if qty/rate are unreadable.
        12. Return ONLY the JSON object.
    `}e.s(["runGeminiDocumentOcr",()=>i],97496),e.s(["buildPharmaInvoiceOcrPrompt",()=>o],36602);var u=e.i(22734),s=e.i(14747);let c={jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12};function l(e,t=""){return String(e??t).replace(/\s+/g," ").trim()||t}function m(...e){for(let t of e){let e=l(t);if(e)return e}return""}function d(e,t=0){if(null==e||""===e)return t;let n=Number(String(e).replace(/,/g,"").trim());return Number.isFinite(n)?n:t}function p(e,t=0){return Math.max(0,Math.round(d(e,t)))}function h(...e){for(let t of e){if(null==t||""===t)continue;let e=Number(String(t).replace(/,/g,"").trim());if(Number.isFinite(e))return e}return null}function A(e,t,n){let a=String(t).padStart(2,"0"),r=String(n).padStart(2,"0");return`${e}-${a}-${r}`}function T(e){let t=Number(e);return Number.isFinite(t)?t<100?t>=70?1900+t:2e3+t:t:null}function f(e){let t=l(e).toLowerCase();if(!t)return null;if(/^\d{1,2}$/.test(t)){let e=Number(t);return e>=1&&e<=12?e:null}return c[t.slice(0,3)]||null}function y(e){let t=l(e).match(/\b(20\d{2})\b/);return t?Number(t[1]):null}function b(e){let t=l(e);if(!t)return"";let n=t.match(/^(\d{4}-\d{2}-\d{2}|\d{1,2}\s*[-/]\s*\d{2,4}|\d{1,4}\s*[-/. ]\s*\d{1,2}\s*[-/. ]\s*\d{1,4}|\d{1,2}\s*[-/. ]\s*[A-Za-z]{3,9}\s*[-/. ]\s*\d{2,4}|[A-Za-z]{3,9}\s*[-/]\s*\d{2,4})/i);return n?n[1].trim():t}function N(e,t){let n=b(e);if(!n)return"";if(/^\d{4}-\d{2}-\d{2}$/.test(n)){let[e,a,r]=n.split("-"),i=Number(e),o=y(t);return o&&Math.abs(i-o)>=2&&(i=o),A(i,Number(a),Number(r))}let a=n.match(/^(\d{1,2})\s*[-/. ]\s*([A-Za-z]{3,9})\s*[-/. ]\s*(\d{2,4})$/i);if(a){let e=Number(a[1]),n=f(a[2]),r=T(a[3]),i=y(t);if(i&&r&&Math.abs(r-i)>=2&&(r=i),n&&r)return A(r,n,e||1)}let r=n.match(/^(\d{1,4})\s*[-/. ]\s*(\d{1,2})\s*[-/. ]\s*(\d{1,4})$/);if(r){let e=r[1],n=r[2],a=r[3];if(4===e.length)return A(Number(e),Number(n),Number(a));let i=Number(e),o=Number(n),u=T(a),s=y(t);if(i<=12&&o>12){let e=i;i=o,o=e}if(s&&u&&Math.abs(u-s)>=2&&(u=s),o>=1&&o<=12&&u)return A(u,o,i||1)}return""}function P(e){let t=b(e);if(!t)return"";if(/^\d{4}-\d{2}-\d{2}$/.test(t))return t;let n=t.match(/^(\d{1,2})\s*[-/]\s*(\d{2})(?:\s*[-/]\s*(\d{2,4}))?$/);if(n){let e=Number(n[1]),t=T(n[2]);if(e>=1&&e<=12&&t)return A(t,e,1)}let a=t.match(/^([A-Za-z]{3,9})\s*[-/]\s*(\d{2,4})$/i);if(a){let e=f(a[1]),t=T(a[2]);if(e&&t)return A(t,e,1)}let r=t.match(/^(\d{1,2})\s*([A-Za-z]{1,3})\s*[-/]\s*(\d{2,4})$/i);if(r){let e=Number(r[1]),t=f(r[2]),n=T(r[3]);if(t&&n)return A(n,t,e||1)}let i=t.match(/^(\d{1,2})\s*[-/]\s*(\d{2,4})$/);if(i){let e=Number(i[1]),t=T(i[2]);if(e>=1&&e<=12&&t)return A(t,e,1)}return N(t)}let E=["LABORATORIES","PHARMACEUTICALS","PHARMA","PHARMACEUTICAL","NUTRITION","DISTRIBUTOR","DISTRIBUTORS","LIMITED","LTD","PRIVATE","PVT","INDUSTRIES","ENTERPRISES","HEALTHCARE","CHEMICALS","COMPANY","CORPORATION","TRADING","SERVICES","PRODUCTS","SCIENCES","SCIENCE"],x=["CCL","GENIX","MARTIN DOW","MARTIN DOW MAKER","MARTIN DOW MARKER","BARRETT HODGSON"],I=/\b\d+(?:\.\d+)?\s*(?:MG|MCG|G|ML|IU|TAB|TABS|TABLET|TABLETS|CAP|CAPSULE|CAPSULES|SYRUP|SUSP|SUSPENSION|DROP|DROPS|INJ|INJECTION|CREAM|GEL|LOTION|OINT|OINTMENT|SOLUTION|VIAL|AMP|AMPUL|PASTE|SPRAY|POWDER|SACHET|STRIP|PACK|PCS|NOS|BOTTLE)\b/i;function S(e){let t=d(e.qty),n=d(e.bonus),a=d(e.rate),r=d(h(e.amount,e.tpValue,e.tpvalue,e.tpValueAmount,e.tpAmount,e.tp_value),0),i=d(h(e.net,e.netAmount,e.net_amount),0);return t>0||n>0||a>0||r>0||i>0}function v(e,t,n){if(!(e>0)||!(t>0)||!(n>0))return!1;let a=Math.max(2.5,.06*t,.03*n);return Math.abs(e*t-n)<=a}function O(e,t){if(!(e>0)||!(t>0))return null;let n=Math.round(t/e);return n<=0||n>60||!function(e,t,n){if(!(e>0)||!(t>0)||!(n>0))return!1;let a=Math.max(1.5,.03*t,.02*n);return Math.abs(e*t-n)<=a}(n,e,t)?null:n}function D(e){return/(?:^|\s)udl(?:\s|$)/i.test(l(e))}function R(e){return g(e,[.5,.61,1,1.5,2,2.5,5,10,17,18,22],.2)}function g(e,t,n=.2){if(!(e>0))return 0;let a=t.reduce((t,n)=>Math.abs(n-e)<Math.abs(t-e)?n:t);return Math.abs(a-e)<=n?a:Number(e.toFixed(2))}function M(e,t,n){let a={percent:0,rawPercent:0,distance:1/0,base:0};if(!(e>0))return a;for(let r of t){if(!(r>0))continue;let t=e/r*100,i=n.reduce((e,n)=>Math.abs(n-t)<Math.abs(e-t)?n:e),o=Math.abs(i-t);o<a.distance&&(a.percent=i,a.rawPercent=t,a.distance=o,a.base=r)}return a}function C(e,t,n=.05){!(t>=0)||e.some(e=>Math.abs(e-t)<=n)||e.push(t)}function w(e){return Number(e.toFixed(2))}function L(e){if(!(e>0))return 0;let t=Math.round(e);return .5>=Math.abs(t-e)?t:w(e)}function U(e,t){return Math.abs(w(e)-w(t))}function B(e,t,n=1.25,a=.03){return e>0&&t>0&&U(e,t)<=function(e,t=1.25,n=.03){return Math.max(t,Math.abs(e)*n)}(t,n,a)}function k(e){return l(e).toLowerCase().replace(/[^a-z0-9]/g,"")}function Y(e){return l(e,"B-NEW").toLowerCase().replace(/[^a-z0-9]/g,"")}function V(e,t){if(!(e.qty>0)||!(t>0))return!1;let n=Math.round(t),a=Math.round(d(e.netAmount)),r=Math.round(d(e.rate));return a===n||r===n||d(e.netAmount)>=.75*t||d(e.rate)>=.75*t}function q(e,t){let n=0>=d(e.rate)&&0>=d(e.netAmount)&&0>=d(e.discountPercent)&&0>=d(e.gstPercent)&&0>=d(e.advanceTaxPercent);return e.bonus>0||n||V(e,t)}function G(e){let t=m(e.supplierName,e.supplier,e.vendorName,e.companyName),n=Array.isArray(e.items)?e.items.map(e=>(function(e,t=""){let n=m(e.name,e.productName,e.description,e.medicineName),a=m(e.itemCode,e.item_code,e.code,e.productCode),r=m(e.packing,e.pack,e.packSize,e.packingSize),i=m(e.batch,e.batchNo,e.batch_number),o=m(e.text,e.rawText,e.lineText,e.rowText,e.fullText),u=m(e.expiry,e.expiryDate,e.expDate,function(e){let t=l(e);if(!t)return"";let n=t.toUpperCase();if(/(INVOICE|CUSTOMER|TOTAL|ORDER|PAYMENT|DELIVERY|PAGE|SUB TOTAL|GRAND TOTAL|SALES TAX)/.test(n))return"";let a=t.match(/(?:EXP(?:IRY)?|USE BEFORE)[:.\s-]*([A-Za-z0-9\/\-.\s]{2,24})/i);return P(a?b(a[1]):b(t))||""}(o)),s=m(e.mfgDate,e.mfg,e.manufacturingDate),c=d(h(e.furtherTaxAmount,e.frtTaxAmount,e.furtherTax,e.furtherTaxAmt),0),{itemCode:A,name:T}=function(e,t){let n=l(e),a=l(t);if(!n&&!a)return{itemCode:"",name:""};if(n=n.replace(/^[*•+\-]+\s*/,"").trim(),!a){let e=n.match(/^(\d{4,7})\s*[•*+\-]?\s*(.+)$/);e&&(a=e[1],n=e[2])}return{itemCode:a,name:n=n.replace(/^[*•+\-]+\s*/,"").trim()}}(n,a),{batch:f,expiry:y}=function(e,t){let n=l(e,"B-NEW"),a=P(t),r=n.match(/^(.*?)(?:\s*\/\s*|\s+)(\d{1,2}\s*[-/]\s*\d{2,4}(?:\s*[-/]\s*\d{2,4})?)$/);if(!r)return{batch:n,expiry:a};let i=l(r[1]).replace(/[/-]+$/,"").trim(),o=P(r[2]);return{batch:i||n,expiry:o&&a&&o.slice(0,7)!==a.slice(0,7)?o:a||o}}(i,u),{qty:E,bonus:x,rate:I,netAmount:S,rowAmount:k}=function(e,t=""){let n=D(t),a=p(e.qty),r=p(e.bonus),i=d(e.rate),o=d(h(e.amount,e.tpValue,e.tpvalue,e.tpValueAmount,e.tpAmount,e.tp_value),0),u=d(h(e.net,e.netAmount,e.net_amount),0);u>0||!(o>0)||n||(u=o);let s=a>60||u>0&&a===Math.round(u)&&u>25||i>0&&a===Math.round(i)&&i>25||o>0&&a===Math.round(o)&&o>25;if(s&&(a=0),(a<=0||s)&&n&&i>0&&o>0){let e=O(i,o);e&&(a=e)}if((a<=0||s||!v(a,i,u))&&i>0&&u>0){let e=function(e,t){if(!(e>0)||!(t>0))return null;let n=Math.round(t/e);return n<=0||n>60?null:v(n,e,t)?n:null}(i,u);e&&(a=e)}if((a<=0||s)&&n&&i>0&&o>0){let e=O(i,o);e&&(a=e)}return i<=0&&a>0&&o>0&&n&&(i=Number((o/a).toFixed(2))),i<=0&&a>0&&u>0&&(i=Number((u/a).toFixed(2))),!(u>0)&&a>0&&i>0&&!n&&(u=Number((a*i).toFixed(2))),{qty:a,bonus:r,rate:i,netAmount:u,rowAmount:o}}(e,t),Y=function(e,t,n,a,r,i){let o=d(e.discountPercent,0),u=d(h(e.gstPercent,e.taxPercent,e.salesTaxPercent),0),s=d(e.furtherTaxPercent,0),c=d(e.nonAtlTaxPercent,0),l=d(h(e.advanceTaxPercent,e.advTaxPercent),0),m=d(h(e.discountAmount,e.invDiscountAmount,e.discountInvAmount,e.discountInv,e.invDiscount),0),p=d(h(e.productDiscountAmount,e.prodDiscountAmount,e.discountProdAmount,e.prodDiscount),0),A=d(h(e.salesTaxAmount,e.sTaxAmount,e.sTax),0),T=d(h(e.advanceTaxAmount,e.advTaxAmount,e.aTaxAmount,e.aTax,e.aiTaxAmount,e.aiTax),0),f=t>0&&n>0?w(t*n):r>0?r:0,y=D(i),b=y&&(u>=15||l>.3&&l<=2||A>0&&f>0&&A/f*100>=15||a>0&&f>0&&(a-f)/f*100>=15);y&&(o>2.5&&f>0&&o<.15*f&&(o=g(o/f*100,[1.5,2,2.5,5],.35)),o<=0&&m>0&&f>0&&(o=g(m/f*100,[1.5,2,2.5,5],.35)),o<=0&&b&&(o=1.5));let N=f>0?w(m>0?m:f*o/100):0,P=p>0?w(p):0,E=f>0?w(Math.max(f-N-P,0)):0,x=E>0&&a>E?(a-E)/E*100:0;if(y&&b){let e=function(e,t,n,a,r){if(!(e>0)||!(n>e))return null;let i=[],o=[];a>0&&C(i,g(a,[17,18,22],.75)),[22,18,17].forEach(e=>C(i,e)),r>0&&C(o,g(r,[.5,.61,1,2],.2)),[.5,.61,1,2,0].forEach(e=>C(o,e));let u=w(e*t/100),s=null;for(let t of i){let a=w(e*t/100),r=w(e+a+u);for(let e of o){let i=w(r*e/100),o=w(r+i),u=Math.abs(o-n);(!s||u<s.netDifference)&&(s={gstPercent:t,salesTaxAmount:a,advanceTaxPercent:e,advanceTaxAmount:i,invoiceAmount:r,netAmount:o,netDifference:u})}}return s}(E,s,a,u,l),t=[a,f,E,E>0?1.22*E:0],n=M(A,[E],[17,18,22]),r=M(A,t,[.5,.61,1,2]),i=M(T,[E],[17,18,22]),o=M(T,t,[.5,.61,1,2]),m=A>0&&r.distance+.35<n.distance,d=T>0&&i.distance+.75<o.distance,p=A>0||T>0?w(E+A+w(E*s/100)+T):0,h=p>0&&a>0?Math.abs(p-a):1/0,y=!!e&&(h>e.netDifference+2||m&&T<=0||d&&A<=0||(m||d)&&e.netDifference<=2);if(y&&e&&(u=e.gstPercent,l=e.advanceTaxPercent,A=L(e.salesTaxAmount),T=L(e.advanceTaxAmount)),!y&&m&&d){let e=A;A=T,T=e}else!y&&m&&T<=0?(T=A,A=0):!y&&d&&A<=0&&(A=T,T=0);if((u<=0||u<10||u>30)&&A>0&&E>0){let e=M(A,[E],[17,18,22]);u=e.distance<=1.25?e.percent:22}else if(u>0)u=g(u,[17,18,22],.75);else if(E>0&&a>E){let e=M(w(Math.max(a-E-T-w(E*s/100),0)),[E],[17,18,22]);u=e.distance<=1.25?e.percent:22}else u=22;let b=E>0?w(E*u/100):0,N=A>0&&B(A,b,2.5,.03)?w(A):T>0&&B(T,b,2.5,.03)?w(T):b,P=E>0?w(E+N+E*s/100):0,x=P>0?w(P*c/100):0,I=P>0&&a>P?w(Math.max(a-P-x,0)):0,S=M(I,[P,a],[.5,.61,1,2]),v=S.distance<=.35&&(m||T<=0||l<=0||l>5);if(v&&(l=S.percent),!v&&(l<=0||l>5)&&T>0){let e=M(T,[P,a,E,f],[.5,.61,1,2]);l=e.distance<=.35?e.percent:function(e,t,n,a=.2){if(!(e>0))return 0;let r=0,i=1/0;for(let o of t){if(!(o>0))continue;let t=e/o*100,u=n.reduce((e,n)=>Math.abs(n-t)<Math.abs(e-t)?n:e),s=g(t,n,a),c=Math.abs(u-t);c<i&&(i=c,r=s)}return r||Number(e.toFixed(2))}(T,[P,a,E,f],[.5,.61,1,2],.2)}else(l<=0||l>5)&&I>0?S.distance<=.35&&(l=S.percent):l>0&&(l=g(l,[.5,.61,1,2],.2))}else if(y&&x>0&&x<=5){let e=R(x),t=[a,f,E,E>0?1.22*E:0],n=M(A,[E],[17,18,22]),r=M(A,t,[.5,.61,1,2]);A>0&&T<=0&&r.distance<=.35&&r.distance+.5<n.distance&&(T=A,A=0,(l<=0||l>5)&&(l=r.percent||e),u>0&&u<=5&&(u=0));let i=u+s+c+l;if(A>0||T>0||i>0&&e<.7*i||i<=0){let t=A+T;t>0?(u=A>0?R(A/t*e):0,l=T>0?R(T/t*e):0):u<=5&&l<=0&&s<=0&&c<=0?(u=0,l=e):i<=0&&(l=e)}l<=0&&u>0&&u<=5&&A<=0&&(l=R(u),u=0),c>0&&c<1&&l<=0&&(l=R(c),c=0)}let I=E>0?w(E*u/100):0,S=A>0?w(A):I,v=A>0&&S===w(A),O=!1;if(y&&b&&I>0){let e=A>0?w(A):0,t=T>0?w(T):0;e>0&&B(e,I,2.5,.03)?(S=e,v=!0):t>0&&B(t,I,2.5,.03)?(S=t,v=!1,O=!0):(S=I,v=!1),S=L(S)}let k=E>0?w(E*s/100):0,Y=E>0?w(E+S+k):0,V=Y>0?w(Y*c/100):0,q=Y>0?w(Y*l/100):0,G=a>0&&Y>0?w(Math.max(a-Y-V,0)):0,H=T>0?w(T):q;if(y&&b){let e=[];A>0&&!v&&e.push(w(A)),T>0&&!O&&e.push(w(T));let t=q>0?q:G,n=t>0?function(e,t){let n=0,a=1/0;for(let r of t){if(!(r>0))continue;let t=U(r,e);t<a&&(n=w(r),a=t)}return n}(t,e):0;n>0&&B(n,t,1.5,.08)?H=n:t>0?H=t:G>0&&(H=G),H=L(H)}let X=a>0?w(a):Y>0?w(Y+H+V):0;return{discountPercent:o,gstPercent:u,furtherTaxPercent:s,nonAtlTaxPercent:c,advanceTaxPercent:l,discountAmount:N,productDiscountAmount:P,salesTaxAmount:S,advanceTaxAmount:H,grossAmount:f,invoiceAmount:Y,netAmount:X,profile:y&&b?"udl_split_discount":y?"udl":""}}(e,E,I,S,k,t),V=k>0?k:Y.grossAmount;return{...e,itemCode:A,name:T,packing:r,batch:f,qty:E,bonus:x,rate:I,amount:V,tpValue:V,discountAmount:Y.discountAmount,productDiscountAmount:Y.productDiscountAmount,salesTaxAmount:Y.salesTaxAmount,furtherTaxAmount:c,advanceTaxAmount:Y.advanceTaxAmount,discountPercent:Y.discountPercent,gstPercent:Y.gstPercent,furtherTaxPercent:Y.furtherTaxPercent,nonAtlTaxPercent:Y.nonAtlTaxPercent,advanceTaxPercent:Y.advanceTaxPercent,invoiceProfile:Y.profile,net:Y.netAmount,netAmount:Y.netAmount,expiry:y,mfgDate:N(s)}})(e,t)):[],a=m(e.invoiceNo,e.invoice_number,e.invNo,e.inv_no),r=m(e.supplyId,e.supply_id,e.shipmentId,e.shipment_id),i=m(e.date,e.invoiceDate,e.invDate,e.shipmentDate),o=d(e.total,0)||n.reduce((e,t)=>e+d(t.net??t.netAmount,0),0),u=function(e,t){let n=[];for(let a of e){let e={...a},r=k(e.name),i=!1;if(r&&(e.qty>0||e.bonus>0))for(let a=n.length-1;a>=0;a-=1){let o=n[a];if(k(o.name)===r&&(function(e,t){let n=Y(e),a=Y(t);return!!n&&!!a&&"bnew"!==n&&"bnew"!==a&&(n===a||n.startsWith(a)||a.startsWith(n)||n.length>=5&&a.length>=5&&n.slice(0,5)===a.slice(0,5))}(o.batch,e.batch)||"B-NEW"===o.batch||"B-NEW"===e.batch)&&q(e,t)){o.bonus=p(o.bonus)+Math.max(p(e.bonus),p(e.qty),1),(!o.batch||"B-NEW"===o.batch)&&e.batch&&(o.batch=e.batch),(!o.expiry||""===o.expiry)&&e.expiry&&(o.expiry=e.expiry),i=!0;break}}!i&&(r&&q(e,t)&&0>=p(e.bonus)&&p(e.qty)>0&&0>=d(e.rate)&&0>=d(e.netAmount)&&(e.bonus=p(e.qty),e.qty=0),0>=p(e.qty)&&0>=p(e.bonus)&&0>=d(e.rate)&&0>=d(e.netAmount)&&V(a,t)||n.push(e))}return n}(n.filter(e=>!function(e,t){let n=l(t).replace(/^[.\-_*]+/,"").replace(/\s+/g," ").trim().toUpperCase();if(!n)return!1;let a=x.includes(n),r=/^[A-Z][A-Z&()/-]{1,22}$/.test(n)||/\([A-Z0-9]{1,4}\)$/.test(n)||/^[A-Z0-9&.'()/-]+(?:\s+[A-Z0-9&.'()/-]+){1,5}$/.test(n);return(a||E.some(e=>n.includes(e))||r&&!I.test(n)&&!/\b\d+(?:\.\d+)?\b/.test(n))&&r&&(!S(e)||a)}(e,e.name)&&S(e)),o);return{...e,supplierName:t,invoiceNo:a,supplyId:r,date:N(i,r),total:o,items:u}}let H=null;function X(e,t={}){let n=function(e,t){let n=l(t);if(!n||!e.length)return e;let a=function(){if(H)return H;try{let e=s.default.join(process.cwd(),"folder_1_manual_overrides.json"),t=JSON.parse(u.default.readFileSync(e,"utf8"));H=t&&"object"==typeof t?t:{}}catch{H={}}return H}()?.[s.default.basename(n)];if(!a||"object"!=typeof a)return e;let r=a._invoice||a.invoice;return e.map((e,t)=>{let n=0===t&&r&&"object"==typeof r?{...e,...r}:e,i=Array.isArray(n.items)?n.items.map((e,t)=>{let n=a[String(t)];if(!n||"object"!=typeof n)return e;let r={...e,...n};return n.forceProductName&&(r.name=n.forceProductName),void 0!==n.netAmount&&void 0===n.net&&(r.net=n.netAmount),r}):[];return{...n,items:i}})}(Array.isArray(e?.invoices)?e.invoices:Array.isArray(e?.items)?[e]:[],t.sourceFile);return{...e,invoices:n.map(G)}}e.s(["normalizePharmaInvoiceOcrData",()=>X],43529)}];

//# sourceMappingURL=build_verify_lib_server_geminiOcr_ts_5e3adbda._.js.map