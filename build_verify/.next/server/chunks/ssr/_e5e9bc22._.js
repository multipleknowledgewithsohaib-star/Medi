module.exports=[96221,a=>{"use strict";let b=(0,a.i(70106).default)("loader-circle",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]]);a.s(["Loader2",()=>b],96221)},32100,70662,a=>{"use strict";var b=a.i(72131);async function c(a,b){var c=await a.text();let d="string"==typeof c?c.trim():"";if(!d||"undefined"===d)return b;try{return JSON.parse(d)}catch{return b}}var d=a.i(13851);let e=[{id:1,name:"Bahadurabad",location:"Main Shop",type:"Main"},{id:2,name:"Gulshan",location:"Pharmacy Area",type:"Pharmacy"},{id:3,name:"Nazimabad",location:"West Block",type:"Pharmacy"}],f=[{id:"p1",name:"Panadol Extra",brand:"GSK",category:"Pain Relief",unitsPerPack:20,stock:120,salePrice:50,batches:[{id:"b1",batchNo:"BATCH-001",expiryDate:"2025-12-01",quantity:70,branchId:1},{id:"b2",batchNo:"BATCH-002",expiryDate:"2026-03-15",quantity:50,branchId:1}]},{id:"p2",name:"Augmentin 625mg",brand:"GSK",category:"Antibiotics",unitsPerPack:6,stock:45,salePrice:340,batches:[{id:"b3",batchNo:"BATCH-003",expiryDate:"2025-10-15",quantity:45,branchId:2}]},{id:"p3",name:"Brufen Syrup",brand:"Abbott",category:"Syrup",unitsPerPack:1,stock:80,salePrice:120,batches:[{id:"b4",batchNo:"BATCH-004",expiryDate:"2026-01-20",quantity:80,branchId:1}]}],g=[{id:101,invoiceNo:"INV-0001",date:new Date().toISOString(),branchId:1,total:500,discount:0,paidAmount:500,changeAmount:0,items:[{productId:"p1",name:"Panadol Extra",quantity:10,pricePerUnit:50}],soldBy:"ADMIN CORE"},{id:102,invoiceNo:"INV-665544",date:new Date().toISOString(),branchId:2,total:340,discount:0,paidAmount:340,changeAmount:0,items:[{productId:"p2",name:"Augmentin 625mg",quantity:1,pricePerUnit:340}],soldBy:"Gulshan Staff"}],h=[],i=[],j=[];a.s(["mockAlerts",0,j,"mockBranches",0,e,"mockProducts",0,f,"mockPurchases",0,i,"mockSales",0,g,"mockSuppliers",0,h],70662);let k=new Date("2026-04-30T23:59:59.999Z"),l=a=>{let b=(a=>{if(a instanceof Date)return Number.isNaN(a.getTime())?null:new Date(a.getTime());let b=String(a??"").trim();if(!b)return null;let c=new Date(b);return Number.isNaN(c.getTime())?null:c})(a);return!!(b&&b.getTime()<=k.getTime())},m=a=>String(a??"").trim().toLowerCase().replace(/\s+/g," "),n=(a,b)=>{let c=String(a?.productId??""),d=String(b?.id??"");if(c&&d&&c===d)return!0;let e=m(a?.name),f=m(b?.name);return!!e&&!!f&&(e===f||e.includes(f)||f.includes(e))};function o(a){let b=d.storage.get("sales",[]),c=d.storage.get("purchases",[]),e=(a?b.filter(b=>b.branchId==a):b).filter(a=>l(a.date)),f=(a?c.filter(b=>b.branchId==a):c).filter(a=>l(a.date)),g=e.reduce((a,b)=>a+(b.total||0),0),h=f.reduce((a,b)=>a+(b.total||0),0),i=g-h,j=[...e.map(a=>{let b=new Date(a.date).getTime();return{id:`s-${a.id}`,type:"income",description:`Sale: ${a.invoiceNo}`,date:new Date(a.date).toLocaleDateString(),amount:a.total,sortDate:Number.isFinite(b)?b:0}}),...f.map(a=>{let b=new Date(a.date).getTime();return{id:`p-${a.id}`,type:"expense",description:`Purchase: ${a.invoiceNo||a.id}`,date:new Date(a.date).toLocaleDateString(),amount:a.total,sortDate:Number.isFinite(b)?b:0}})].sort((a,b)=>(b.sortDate||0)-(a.sortDate||0)).slice(0,10).map(({sortDate:a,...b})=>b),k={},m=(a,b,c)=>{let d=new Date(a);if(Number.isNaN(d.getTime()))return;let e=d.getFullYear(),f=d.getMonth(),g=`${e}-${f}`;k[g]||(k[g]={month:d.toLocaleString("default",{month:"short"}),monthIndex:f,year:e,sales:0,purchases:0}),k[g][b]+=c||0};return e.forEach(a=>m(a.date,"sales",Number(a.total)||0)),f.forEach(a=>m(a.date,"purchases",Number(a.total)||0)),{totalRevenue:g,totalExpenses:h,netProfit:i,recentTransactions:j,monthlySales:Object.values(k).sort((a,b)=>a.year-b.year||a.monthIndex-b.monthIndex).map(({month:a,year:b,sales:c,purchases:d})=>({month:a,year:b,sales:c,purchases:d})),topProducts:d.storage.get("products",[]).map(a=>{let b=e.reduce((b,c)=>{let d=c.items?.find(b=>n(b,a));return b+(d?d.quantity:0)},0),c=e.reduce((b,c)=>{let d=c.items?.find(b=>n(b,a));return b+(d?d.pricePerUnit*d.quantity:0)},0);return{name:a.name,sold:b,revenue:c}}).sort((a,b)=>b.sold-a.sold).slice(0,5),revenue:g,expenses:h,profit:i}}let p=new Set(["unnamed product","unknown product","unknown medicine","new product"]),q=a=>"string"==typeof a?a.trim():null==a?"":String(a).trim(),r=(a,b=0)=>{let c=Number(a);return Number.isFinite(c)?c:b},s=a=>null!=a&&("string"!=typeof a||""!==a.trim())&&Number.isFinite(Number(a)),t=a=>{let b=q(a?.name).toLowerCase();return!b||p.has(b)},u=(a,b=[])=>{let c=b.filter(b=>String(b.productId)===String(a?.id)),d=c.length>0?c:Array.isArray(a?.batches)?a.batches:[],e=d.reduce((a,b)=>a+(Number(b?.quantity)||0),0),f=r(a?.stock,0),g=d.length>0?e:f;return{...a,item_code:q(a?.item_code),name:q(a?.name),brand:q(a?.brand),category:q(a?.category)||"Others",purchasePrice:r(a?.purchasePrice,0),salePrice:r(a?.salePrice,0),discountPercent:r(a?.discountPercent,0),isDiscountActive:!!a?.isDiscountActive,pricingSnapshotId:a?.pricingSnapshotId!==void 0&&a?.pricingSnapshotId!==null?Number(a.pricingSnapshotId):Array.isArray(a?.pricingSnapshots)&&a.pricingSnapshots[0]?.id?Number(a.pricingSnapshots[0].id):void 0,unitsPerPack:Math.max(1,r(a?.unitsPerPack,1)),stripsPerBox:Math.max(0,r(a?.stripsPerBox,0)),tabletsPerStrip:Math.max(0,r(a?.tabletsPerStrip,0)),defaultDiscount:r(a?.defaultDiscount,0),batches:d,stock:g,createdAt:"string"==typeof a?.createdAt?a.createdAt:void 0,updatedAt:"string"==typeof a?.updatedAt?a.updatedAt:void 0}};function v(a){let[k,m]=(0,b.useState)(null),[v,w]=(0,b.useState)(!0),[x,y]=(0,b.useState)(null),z=(0,b.useCallback)(async()=>{let b="",k=[],v=d.storage.get("activeBranch",null),x=v?.id;if(a.startsWith("/api/"))try{let b=await fetch(a);if(b.ok){let e=await c(b,null);if(null===e)throw Error(`Empty JSON response from ${a}`);if("/api/products"===a||"/api/products/aliases"===a)if("/api/products"===a){let a=d.storage.get("batches",[]),b=d.storage.get("products",[]),c=[...Array.isArray(e)?e:[]];b.forEach(a=>{let b=c.findIndex(b=>((a,b)=>{let c="string"==typeof a?.item_code?a.item_code.trim().toLowerCase():"",d="string"==typeof b?.item_code?b.item_code.trim().toLowerCase():"";if(c&&d&&c===d)return!0;let e="string"==typeof a?.name?a.name.trim().toLowerCase():"",f="string"==typeof b?.name?b.name.trim().toLowerCase():"";return!!(e&&f&&e===f)})(b,a));if(b>=0){var d;let e,f,g,h,i;c[b]=(d=c[b],{...d,...!(e=q(a?.name))||p.has(e.toLowerCase())?{}:{name:e},...q(a?.item_code)?{item_code:q(a.item_code)}:{},...q(a?.brand)?{brand:q(a.brand)}:{},...q(a?.category)?{category:q(a.category)}:{},...s(a?.purchasePrice)?{purchasePrice:Number(a.purchasePrice)}:{},...s(a?.salePrice)?{salePrice:Number(a.salePrice)}:{},...s(a?.discountPercent)?{discountPercent:Number(a.discountPercent)}:{},...a?.isDiscountActive!==void 0?{isDiscountActive:!!a.isDiscountActive}:{},...s(a?.pricingSnapshotId)?{pricingSnapshotId:Number(a.pricingSnapshotId)}:{},...s(a?.stock)?{stock:Number(a.stock)}:{},...(f=Number(a?.unitsPerPack),s(a?.unitsPerPack)&&f>0?{unitsPerPack:f}:{}),...(g=Number(a?.stripsPerBox),s(a?.stripsPerBox)&&g>0?{stripsPerBox:g}:{}),...(h=Number(a?.tabletsPerStrip),s(a?.tabletsPerStrip)&&h>0?{tabletsPerStrip:h}:{}),...(i=Number(a?.defaultDiscount),s(a?.defaultDiscount)&&i>=0?{defaultDiscount:i}:{}),...Array.isArray(a?.batches)&&a.batches.length>0?{batches:a.batches}:{},id:d.id})}else t(a)||c.push({...a,item_code:q(a?.item_code),name:q(a?.name),brand:q(a?.brand),category:q(a?.category)||"Others",purchasePrice:r(a?.purchasePrice,0),salePrice:r(a?.salePrice,0),discountPercent:r(a?.discountPercent,0),isDiscountActive:!!a?.isDiscountActive,pricingSnapshotId:a?.pricingSnapshotId!==void 0&&a?.pricingSnapshotId!==null?Number(a.pricingSnapshotId):void 0,stock:r(a?.stock,0),unitsPerPack:Math.max(1,r(a?.unitsPerPack,1)),stripsPerBox:Math.max(0,r(a?.stripsPerBox,0)),tabletsPerStrip:Math.max(0,r(a?.tabletsPerStrip,0)),defaultDiscount:r(a?.defaultDiscount,0),batches:Array.isArray(a?.batches)?a.batches:void 0,createdAt:"string"==typeof a?.createdAt?a.createdAt:void 0,updatedAt:"string"==typeof a?.updatedAt?a.updatedAt:void 0})});let f=c.map(b=>u(b,a));f.sort((a,b)=>{let c=a.createdAt?new Date(a.createdAt).getTime():0,d=b.createdAt?new Date(b.createdAt).getTime():0;return d!==c?d-c:String(b.id).localeCompare(String(a.id))});try{d.storage.setSilently("products",f)}catch(a){console.warn("Product cache sync failed:",a)}m(f)}else m(e);else if("/api/suppliers"===a){let a=d.storage.get("suppliers",[]),b=[...e];a.forEach(a=>{b.find(b=>b.name?.toLowerCase()===a.name?.toLowerCase())||b.push(a)}),m(b)}else if("/api/sales"===a||"/api/invoices"===a)m(e);else if("/api/purchases"===a){let a=d.storage.get("purchases",[]),b=[...e];a.forEach(a=>{let c=a?.invoiceNo?.toLowerCase?.(),d=b.findIndex(b=>b?.invoiceNo?.toLowerCase?.()&&c&&b.invoiceNo.toLowerCase()===c||b?.id&&a?.id&&String(b.id)===String(a.id));if(d>=0){let c=b[d];b[d]={...c,...a,id:c.id}}else b.push(a)}),m(b)}else"/api/finance"===a||"/api/reports"===a?m(o("all"===x?null:x)):m(e);w(!1);return}if(401===b.status||403===b.status){let a=await c(b,null);y(a?.error||"You do not have access to this data."),m(null),w(!1);return}}catch(b){console.warn(`API fetch failed for ${a}, falling back to storage:`,b)}if(a.includes("products"))b="products",k=f;else if(a.includes("sales"))b="sales",k=g;else if(a.includes("suppliers"))b="suppliers",k=h;else if(a.includes("finance")||a.includes("reports"))b="finance",k=o("all"===x?null:x);else if(a.includes("purchases"))b="purchases",k=i;else if(a.includes("alerts"))b="alerts",k=j;else if(a.includes("branches"))b="branches",k=e;else if(a.includes("dashboard")){var z;let a,c,e,f,g,h,i,j,m,o;b="dashboard",z="all"===x?null:x,a=d.storage.get("sales",[]),c=d.storage.get("products",[]),e=new Date().toISOString().split("T")[0],f=(z?a.filter(a=>a.branchId==z):a).filter(a=>l(a.date)),g=z?c.filter(a=>a.batches?.some(a=>a.branchId==z)):c,h=f.filter(a=>a.date.startsWith(e)).reduce((a,b)=>a+(b.total||0),0),i=f.reduce((a,b)=>a+(b.total||0),0),j=g.filter(a=>(z?a.batches?.filter(a=>a.branchId==z).reduce((a,b)=>a+b.quantity,0)||0:a.stock||0)<20).length,m=0,o=new Date,g.forEach(a=>{a.batches&&a.batches.some(a=>{if(!a.expiryDate)return!1;let b=Math.ceil((new Date(a.expiryDate).getTime()-o.getTime())/864e5);return b>0&&b<=90})&&m++}),k={stats:{todaySales:h,totalRevenue:i,lowStock:j,expiringSoon:m},recentSales:f.slice(0,5).map(a=>({id:a.id,medicine:a.items?.[0]?.name||"Medicine",quantity:a.items?.[0]?.quantity||0,amount:a.total,time:a.date})),topSellingProducts:g.map(a=>{let b=f.reduce((b,c)=>{let d=c.items?.find(b=>n(b,a));return b+(d?d.quantity:0)},0),c=f.reduce((b,c)=>{let d=c.items?.find(b=>n(b,a));return b+(d?d.pricePerUnit*d.quantity:0)},0);return{name:a.name,sold:b,revenue:c,stock:a.stock}}).sort((a,b)=>b.sold-a.sold).slice(0,5)}}else a.includes("invoices")?(b="sales",k=g):a.includes("batches")&&(b="batches",k=[]);let A=b?d.storage.get(b,k):k,B="all"===x;if("products"===b){let a=d.storage.get("batches",[]);A=A.filter(a=>!t(a)).map(b=>{let c=u(b,a),d=c.batches,e=x&&!B?d.filter(a=>a.branchId==x):d,f=e.reduce((a,b)=>a+(b.quantity||0),0);return{...c,batches:e,stock:f}}),x&&!B&&(A=A.filter(a=>a.batches.length>0))}else x&&!B&&"sales"===b?A=A.filter(a=>a.branchId==x):x&&!B&&"batches"===b&&(A=A.filter(a=>a.branchId==x));m(A),w(!1)},[a]);return(0,b.useEffect)(()=>(z(),window.addEventListener("jailwatch_storage_change",z),()=>window.removeEventListener("jailwatch_storage_change",z)),[z]),{data:k,loading:v,error:x,refetch:z}}a.s(["isPlaceholderProductRecord",0,t,"useData",()=>v],32100)},81560,a=>{"use strict";let b=(0,a.i(70106).default)("trash-2",[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]]);a.s(["Trash2",()=>b],81560)},33441,a=>{"use strict";let b=(0,a.i(70106).default)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);a.s(["Check",()=>b],33441)},71931,13193,a=>{"use strict";let b=(0,a.i(70106).default)("printer",[["path",{d:"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",key:"143wyd"}],["path",{d:"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6",key:"1itne7"}],["rect",{x:"6",y:"14",width:"12",height:"8",rx:"1",key:"1ue0tg"}]]);a.s(["Printer",()=>b],71931);let c=a=>Number((Number(a)||0).toFixed(2)),d=a=>String(a??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;"),e=a=>{let b=Number(a?.quantity)||0,d=c(a?.rateAtSaleTime??a?.rate??a?.price??0),e=c(a?.discountAmountAtSaleTime??a?.discountAmount??0),f=c(a?.netAmount??a?.lineTotal??d*b-e);return{name:String(a?.product?.name||a?.name||"Unknown Product"),quantity:b,rate:d,discountAmount:e,lineTotal:f}};a.s(["printInvoice",0,(a,b)=>{let f=window.open("","_blank","width=420,height=700");if(!f)return;let g=Array.isArray(a?.items)?a.items.map(e):[],h=c(g.reduce((a,b)=>a+b.rate*b.quantity,0)),i=c(g.reduce((a,b)=>a+b.discountAmount,0)||a?.discount||0),j=c(a?.total??g.reduce((a,b)=>a+b.lineTotal,0)),k=c(a?.paidAmount??j),l=c(a?.changeAmount??Math.max(0,k-j)),m=a?.invoiceNo||`INV-${String(a?.id??"").padStart(6,"0")}`,n=a?.date?new Date(a.date):new Date,o=`
        <html>
            <head>
                <title>Invoice ${d(m)}</title>
                <style>
                    body {
                        font-family: 'Courier New', Courier, monospace;
                        width: 72mm;
                        margin: 0;
                        padding: 2mm;
                        font-size: 10px;
                        line-height: 1.25;
                    }
                    .text-center { text-align: center; }
                    .text-right { text-align: right; }
                    .bold { font-weight: bold; }
                    .divider { border-top: 1px dashed #000; margin: 4px 0; }
                    .meta-row, .summary-row {
                        display: flex;
                        justify-content: space-between;
                        gap: 8px;
                    }
                    .item {
                        margin-bottom: 6px;
                    }
                    .item-grid {
                        display: grid;
                        grid-template-columns: 1.6fr 0.7fr 1fr 1fr 1fr;
                        gap: 4px;
                        align-items: center;
                    }
                    .tiny {
                        font-size: 8px;
                    }
                    .totals-box {
                        border: 1px solid #000;
                        padding: 4px;
                        margin: 8px 0;
                    }
                    @media print {
                        @page {
                            size: 80mm auto;
                            margin: 0;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="text-center">
                    <div class="bold" style="font-size:18px;">MediStock</div>
                    <div>SHAHRAH-E-PAKISTAN, KARACHI</div>
                    <div>UAN: 021 111 246 246</div>
                    <div class="bold" style="margin-top: 4px;">CUSTOMER INVOICE</div>
                </div>

                <div class="divider"></div>

                <div class="meta-row">
                    <span>Invoice:</span>
                    <span class="bold">${d(m)}</span>
                </div>
                <div class="meta-row">
                    <span>Date:</span>
                    <span>${d(n.toLocaleDateString())}</span>
                </div>
                <div class="meta-row">
                    <span>Time:</span>
                    <span>${d(n.toLocaleTimeString())}</span>
                </div>
                <div class="meta-row">
                    <span>User:</span>
                    <span>${d(b||"MediStock User")}</span>
                </div>
                <div>Customer: WALK-IN CUSTOMER</div>

                <div class="divider"></div>
                <div class="item-grid tiny bold">
                    <div>Product</div>
                    <div class="text-right">Qty</div>
                    <div class="text-right">Rate</div>
                    <div class="text-right">Disc</div>
                    <div class="text-right">Total</div>
                </div>
                <div class="divider"></div>

                ${g.map(a=>`
                    <div class="item">
                        <div class="bold">${d(a.name)}</div>
                        <div class="item-grid">
                            <div></div>
                            <div class="text-right">${a.quantity}</div>
                            <div class="text-right">${a.rate.toFixed(2)}</div>
                            <div class="text-right">${a.discountAmount.toFixed(2)}</div>
                            <div class="text-right bold">${a.lineTotal.toFixed(2)}</div>
                        </div>
                    </div>
                `).join("")}

                <div class="divider"></div>

                <div class="summary-row">
                    <span>Gross Total</span>
                    <span>${h.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span>Discount (PKR)</span>
                    <span>${i.toFixed(2)}</span>
                </div>
                <div class="summary-row bold">
                    <span>Grand Total</span>
                    <span>${j.toFixed(2)}</span>
                </div>

                <div class="totals-box">
                    <div class="summary-row">
                        <span>Cash Received</span>
                        <span>${k.toFixed(2)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Change Return</span>
                        <span>${l.toFixed(2)}</span>
                    </div>
                </div>

                <div class="divider"></div>
                <div class="text-center tiny">
                    Discount is shown in rupees as applied at the time of sale.<br/>
                    Product discount percentage is not printed on customer invoices.
                </div>

                <div style="margin-top: 10px;" class="text-center bold">
                    THANK YOU & COME AGAIN
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function () { window.close(); }, 100);
                    };
                </script>
            </body>
        </html>
    `;f.document.write(o),f.document.close()}],13193)}];

//# sourceMappingURL=_e5e9bc22._.js.map