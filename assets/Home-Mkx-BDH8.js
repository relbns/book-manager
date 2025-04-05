import{r as f,I as H,u as N,a as U,j as e,T as Q,R as k,C as a,b,c as y,d as S,B as g,e as E,A as _,f as D}from"./index-BcB6TR_P.js";import{d as u}from"./dayjs.min-cdk7TPaz.js";import{S as p}from"./index-B6qVeqtg.js";import{L as x}from"./index-DYwocaG6.js";import{E as w}from"./index-BM1-CXB8.js";import{P as q}from"./progress-CADexEjt.js";import{T as j}from"./index-DelqRfdy.js";import{D as F}from"./index-B61hRUmL.js";import"./Pagination-C5EEw3uv.js";import"./useClosable-Bjz1Rjzt.js";var G={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M193 796c0 17.7 14.3 32 32 32h574c17.7 0 32-14.3 32-32V563c0-176.2-142.8-319-319-319S193 386.8 193 563v233zm72-233c0-136.4 110.6-247 247-247s247 110.6 247 247v193H404V585c0-5.5-4.5-10-10-10h-44c-5.5 0-10 4.5-10 10v171h-75V563zm-48.1-252.5l39.6-39.6c3.1-3.1 3.1-8.2 0-11.3l-67.9-67.9a8.03 8.03 0 00-11.3 0l-39.6 39.6a8.03 8.03 0 000 11.3l67.9 67.9c3.1 3.1 8.1 3.1 11.3 0zm669.6-79.2l-39.6-39.6a8.03 8.03 0 00-11.3 0l-67.9 67.9a8.03 8.03 0 000 11.3l39.6 39.6c3.1 3.1 8.2 3.1 11.3 0l67.9-67.9c3.1-3.2 3.1-8.2 0-11.3zM832 892H192c-17.7 0-32 14.3-32 32v24c0 4.4 3.6 8 8 8h688c4.4 0 8-3.6 8-8v-24c0-17.7-14.3-32-32-32zM484 180h56c4.4 0 8-3.6 8-8V76c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v96c0 4.4 3.6 8 8 8z"}}]},name:"alert",theme:"outlined"};function B(){return B=Object.assign?Object.assign.bind():function(i){for(var n=1;n<arguments.length;n++){var h=arguments[n];for(var l in h)Object.prototype.hasOwnProperty.call(h,l)&&(i[l]=h[l])}return i},B.apply(this,arguments)}const J=(i,n)=>f.createElement(H,B({},i,{ref:n,icon:G})),T=f.forwardRef(J),{Title:M,Text:K,Paragraph:le}=Q,z=D(E)`
  height: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`,m=D(z)`
  text-align: center;
  .ant-statistic-title {
    font-size: 16px;
  }
`,C=D(g)`
  height: auto;
  padding: 16px;
  text-align: center;
  border-radius: 6px;

  span {
    display: block;
    margin-top: 8px;
  }
`,de=()=>{const{books:i,loans:n,authors:h,categories:l,publishers:W}=N(),R=U(),[o,O]=f.useState({bookCount:0,loanedBooks:0,overdueBooks:0,topCategories:[],recentLoans:[]});f.useEffect(()=>{const s=i.length,A=n.filter(t=>t.status==="active").length,I=u(),L=n.filter(t=>t.status==="active"&&t.dueDate&&u(t.dueDate).isBefore(I)).length,v={};i.forEach(t=>{t.categories&&t.categories.length&&t.categories.forEach(r=>{v[r]=(v[r]||0)+1})});const P=Object.entries(v).map(([t,r])=>{const d=l.find(Y=>Y.id===t);return{id:t,name:d?d.name:"Unknown",color:d?d.color:"#1890ff",count:r}}).sort((t,r)=>r.count-t.count).slice(0,5),V=[...n].filter(t=>t.status==="active").sort((t,r)=>new Date(r.loanDate)-new Date(t.loanDate)).slice(0,5).map(t=>{const r=i.find(d=>d.id===t.bookId);return{...t,bookTitle:r?r.title:"Unknown Book",daysLeft:t.dueDate?u(t.dueDate).diff(I,"day"):null}});O({bookCount:s,loanedBooks:A,overdueBooks:L,topCategories:P,recentLoans:V})},[i,n,l]);const c=s=>{R(s)},$=s=>s===null?e.jsx(j,{children:"לא צוין"}):s<0?e.jsxs(j,{color:"red",children:["באיחור של ",Math.abs(s)," ימים"]}):s<=3?e.jsxs(j,{color:"orange",children:["נותרו ",s," ימים"]}):e.jsxs(j,{color:"green",children:["נותרו ",s," ימים"]});return e.jsxs("div",{children:[e.jsx(M,{level:2,children:"דף הבית"}),e.jsxs(k,{gutter:[16,16],style:{marginBottom:24},children:[e.jsx(a,{xs:24,sm:12,md:6,children:e.jsx(m,{children:e.jsx(p,{title:"סה״כ ספרים",value:o.bookCount,prefix:e.jsx(b,{})})})}),e.jsx(a,{xs:24,sm:12,md:6,children:e.jsx(m,{children:e.jsx(p,{title:"ספרים מושאלים",value:o.loanedBooks,prefix:e.jsx(y,{})})})}),e.jsx(a,{xs:24,sm:12,md:6,children:e.jsx(m,{children:e.jsx(p,{title:"סופרים",value:h.length,prefix:e.jsx(S,{})})})}),e.jsx(a,{xs:24,sm:12,md:6,children:e.jsx(m,{children:e.jsx(p,{title:"ספרים באיחור",value:o.overdueBooks,prefix:e.jsx(T,{}),valueStyle:{color:o.overdueBooks>0?"#cf1322":void 0}})})})]}),e.jsxs(k,{gutter:[16,16],children:[e.jsx(a,{xs:24,md:12,children:e.jsx(z,{title:e.jsxs("div",{children:[e.jsx(y,{})," השאלות אחרונות"]}),extra:e.jsx(g,{type:"link",onClick:()=>c("/loans"),children:"כל ההשאלות"}),children:o.recentLoans.length>0?e.jsx(x,{dataSource:o.recentLoans,renderItem:s=>e.jsx(x.Item,{actions:[$(s.daysLeft)],children:e.jsx(x.Item.Meta,{title:e.jsx("span",{style:{cursor:"pointer"},onClick:()=>c(`/books/${s.bookId}`),children:s.bookTitle}),description:e.jsxs(K,{children:["הושאל ל: ",s.borrowerName," |",s.loanDate&&` תאריך השאלה: ${u(s.loanDate).format("DD/MM/YYYY")}`]})})})}):e.jsx(w,{description:"אין השאלות פעילות"})})}),e.jsx(a,{xs:24,md:12,children:e.jsx(z,{title:e.jsxs("div",{children:[e.jsx(b,{})," קטגוריות מובילות"]}),extra:e.jsx(g,{type:"link",onClick:()=>c("/categories"),children:"כל הקטגוריות"}),children:o.topCategories.length>0?e.jsx(x,{dataSource:o.topCategories,renderItem:s=>e.jsx(x.Item,{children:e.jsx(x.Item.Meta,{title:e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[e.jsx("div",{children:e.jsx(j,{color:s.color,children:s.name})}),e.jsxs("div",{children:[s.count," ספרים"]})]}),description:e.jsx(q,{percent:Math.round(s.count/o.bookCount*100),strokeColor:s.color,size:"small"})})})}):e.jsx(w,{description:"אין קטגוריות"})})})]}),e.jsxs(E,{style:{marginTop:24},children:[e.jsx(M,{level:4,children:"פעולות מהירות"}),e.jsx(F,{}),e.jsxs(k,{gutter:[16,16],children:[e.jsx(a,{xs:24,sm:8,children:e.jsxs(C,{type:"primary",size:"large",block:!0,onClick:()=>c("/books"),children:[e.jsx(b,{style:{fontSize:24}}),e.jsx("span",{children:"ניהול ספרים"})]})}),e.jsx(a,{xs:24,sm:8,children:e.jsxs(C,{type:"primary",size:"large",block:!0,onClick:()=>c("/loans"),children:[e.jsx(y,{style:{fontSize:24}}),e.jsx("span",{children:"ניהול השאלות"})]})}),e.jsx(a,{xs:24,sm:8,children:e.jsxs(C,{type:"primary",size:"large",block:!0,onClick:()=>c("/authors"),children:[e.jsx(S,{style:{fontSize:24}}),e.jsx("span",{children:"ניהול סופרים"})]})})]})]}),o.overdueBooks>0&&e.jsx(_,{message:`יש ${o.overdueBooks} ספרים באיחור החזרה`,description:"ראה את רשימת ההשאלות לפרטים נוספים.",type:"warning",showIcon:!0,icon:e.jsx(T,{}),action:e.jsx(g,{size:"small",type:"primary",onClick:()=>c("/loans?tab=overdue"),children:"צפה בהשאלות"}),style:{marginTop:24}})]})};export{de as default};
//# sourceMappingURL=Home-Mkx-BDH8.js.map
