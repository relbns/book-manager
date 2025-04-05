import{r as s,Q as T,ai as Re,x as Te,_ as ae,l as G,V as ge,O as De,G as w,bh as Ge,P as ke,a6 as Z,a1 as B,aq as We,h as Ke,m as Ue,bb as xe,y as ze,cl as Ve,k as pe,a4 as $e,bi as Be,n as Xe,o as qe,p as Ye,cm as Je,bP as Ze,b1 as Qe,co as et,cd as tt,cn as nt}from"./index-BcB6TR_P.js";var Ie=s.forwardRef(function(e,t){var a=e.prefixCls,n=e.style,o=e.className,c=e.duration,u=c===void 0?4.5:c,C=e.showProgress,l=e.pauseOnHover,i=l===void 0?!0:l,h=e.eventKey,g=e.content,v=e.closable,m=e.closeIcon,E=m===void 0?"x":m,d=e.props,p=e.onClick,M=e.onNoticeClose,k=e.times,O=e.hovering,P=s.useState(!1),S=T(P,2),x=S[0],j=S[1],f=s.useState(0),r=T(f,2),y=r[0],b=r[1],A=s.useState(0),F=T(A,2),I=F[0],X=F[1],R=O||x,L=u>0&&C,W=function(){M(h)},q=function(N){(N.key==="Enter"||N.code==="Enter"||N.keyCode===De.ENTER)&&W()};s.useEffect(function(){if(!R&&u>0){var H=Date.now()-I,N=setTimeout(function(){W()},u*1e3-I);return function(){i&&clearTimeout(N),X(Date.now()-H)}}},[u,R,k]),s.useEffect(function(){if(!R&&L&&(i||I===0)){var H=performance.now(),N,$=function ce(){cancelAnimationFrame(N),N=requestAnimationFrame(function(ie){var V=ie+I-H,K=Math.min(V/(u*1e3),1);b(K*100),K<1&&ce()})};return $(),function(){i&&cancelAnimationFrame(N)}}},[u,I,R,L,k]);var te=s.useMemo(function(){return Re(v)==="object"&&v!==null?v:v?{closeIcon:E}:{}},[v,E]),re=Te(te,!0),Y=100-(!y||y<0?0:y>100?100:y),D="".concat(a,"-notice");return s.createElement("div",ae({},d,{ref:t,className:G(D,o,ge({},"".concat(D,"-closable"),v)),style:n,onMouseEnter:function(N){var $;j(!0),d==null||($=d.onMouseEnter)===null||$===void 0||$.call(d,N)},onMouseLeave:function(N){var $;j(!1),d==null||($=d.onMouseLeave)===null||$===void 0||$.call(d,N)},onClick:p}),s.createElement("div",{className:"".concat(D,"-content")},g),v&&s.createElement("a",ae({tabIndex:0,className:"".concat(D,"-close"),onKeyDown:q,"aria-label":"Close"},re,{onClick:function(N){N.preventDefault(),N.stopPropagation(),W()}}),te.closeIcon),L&&s.createElement("progress",{className:"".concat(D,"-progress"),max:"100",value:Y},Y+"%"))}),we=w.createContext({}),ot=function(t){var a=t.children,n=t.classNames;return w.createElement(we.Provider,{value:{classNames:n}},a)},be=8,Ne=3,Ee=16,at=function(t){var a={offset:be,threshold:Ne,gap:Ee};if(t&&Re(t)==="object"){var n,o,c;a.offset=(n=t.offset)!==null&&n!==void 0?n:be,a.threshold=(o=t.threshold)!==null&&o!==void 0?o:Ne,a.gap=(c=t.gap)!==null&&c!==void 0?c:Ee}return[!!t,a]},st=["className","style","classNames","styles"],rt=function(t){var a=t.configList,n=t.placement,o=t.prefixCls,c=t.className,u=t.style,C=t.motion,l=t.onAllNoticeRemoved,i=t.onNoticeClose,h=t.stack,g=s.useContext(we),v=g.classNames,m=s.useRef({}),E=s.useState(null),d=T(E,2),p=d[0],M=d[1],k=s.useState([]),O=T(k,2),P=O[0],S=O[1],x=a.map(function(R){return{config:R,key:String(R.key)}}),j=at(h),f=T(j,2),r=f[0],y=f[1],b=y.offset,A=y.threshold,F=y.gap,I=r&&(P.length>0||x.length<=A),X=typeof C=="function"?C(n):C;return s.useEffect(function(){r&&P.length>1&&S(function(R){return R.filter(function(L){return x.some(function(W){var q=W.key;return L===q})})})},[P,x,r]),s.useEffect(function(){var R;if(r&&m.current[(R=x[x.length-1])===null||R===void 0?void 0:R.key]){var L;M(m.current[(L=x[x.length-1])===null||L===void 0?void 0:L.key])}},[x,r]),w.createElement(Ge,ae({key:n,className:G(o,"".concat(o,"-").concat(n),v==null?void 0:v.list,c,ge(ge({},"".concat(o,"-stack"),!!r),"".concat(o,"-stack-expanded"),I)),style:u,keys:x,motionAppear:!0},X,{onAllRemoved:function(){l(n)}}),function(R,L){var W=R.config,q=R.className,te=R.style,re=R.index,Y=W,D=Y.key,H=Y.times,N=String(D),$=W,ce=$.className,ie=$.style,V=$.classNames,K=$.styles,_e=ke($,st),le=x.findIndex(function(oe){return oe.key===N}),ne={};if(r){var J=x.length-1-(le>-1?le:re-1),Ce=n==="top"||n==="bottom"?"-50%":"0";if(J>0){var ue,fe,de;ne.height=I?(ue=m.current[N])===null||ue===void 0?void 0:ue.offsetHeight:p==null?void 0:p.offsetHeight;for(var he=0,ve=0;ve<J;ve++){var me;he+=((me=m.current[x[x.length-1-ve].key])===null||me===void 0?void 0:me.offsetHeight)+F}var Fe=(I?he:J*b)*(n.startsWith("top")?1:-1),Le=!I&&p!==null&&p!==void 0&&p.offsetWidth&&(fe=m.current[N])!==null&&fe!==void 0&&fe.offsetWidth?((p==null?void 0:p.offsetWidth)-b*2*(J<3?J:3))/((de=m.current[N])===null||de===void 0?void 0:de.offsetWidth):1;ne.transform="translate3d(".concat(Ce,", ").concat(Fe,"px, 0) scaleX(").concat(Le,")")}else ne.transform="translate3d(".concat(Ce,", 0, 0)")}return w.createElement("div",{ref:L,className:G("".concat(o,"-notice-wrapper"),q,V==null?void 0:V.wrapper),style:Z(Z(Z({},te),ne),K==null?void 0:K.wrapper),onMouseEnter:function(){return S(function(U){return U.includes(N)?U:[].concat(B(U),[N])})},onMouseLeave:function(){return S(function(U){return U.filter(function(He){return He!==N})})}},w.createElement(Ie,ae({},_e,{ref:function(U){le>-1?m.current[N]=U:delete m.current[N]},prefixCls:o,classNames:V,styles:K,className:G(ce,v==null?void 0:v.notice),style:ie,times:H,key:D,eventKey:D,onNoticeClose:i,hovering:r&&P.length>0})))})},ct=s.forwardRef(function(e,t){var a=e.prefixCls,n=a===void 0?"rc-notification":a,o=e.container,c=e.motion,u=e.maxCount,C=e.className,l=e.style,i=e.onAllRemoved,h=e.stack,g=e.renderNotifications,v=s.useState([]),m=T(v,2),E=m[0],d=m[1],p=function(r){var y,b=E.find(function(A){return A.key===r});b==null||(y=b.onClose)===null||y===void 0||y.call(b),d(function(A){return A.filter(function(F){return F.key!==r})})};s.useImperativeHandle(t,function(){return{open:function(r){d(function(y){var b=B(y),A=b.findIndex(function(X){return X.key===r.key}),F=Z({},r);if(A>=0){var I;F.times=(((I=y[A])===null||I===void 0?void 0:I.times)||0)+1,b[A]=F}else F.times=0,b.push(F);return u>0&&b.length>u&&(b=b.slice(-u)),b})},close:function(r){p(r)},destroy:function(){d([])}}});var M=s.useState({}),k=T(M,2),O=k[0],P=k[1];s.useEffect(function(){var f={};E.forEach(function(r){var y=r.placement,b=y===void 0?"topRight":y;b&&(f[b]=f[b]||[],f[b].push(r))}),Object.keys(O).forEach(function(r){f[r]=f[r]||[]}),P(f)},[E]);var S=function(r){P(function(y){var b=Z({},y),A=b[r]||[];return A.length||delete b[r],b})},x=s.useRef(!1);if(s.useEffect(function(){Object.keys(O).length>0?x.current=!0:x.current&&(i==null||i(),x.current=!1)},[O]),!o)return null;var j=Object.keys(O);return We.createPortal(s.createElement(s.Fragment,null,j.map(function(f){var r=O[f],y=s.createElement(rt,{key:f,configList:r,placement:f,prefixCls:n,className:C==null?void 0:C(f),style:l==null?void 0:l(f),motion:c,onNoticeClose:p,onAllNoticeRemoved:S,stack:h});return g?g(y,{prefixCls:n,key:f}):y})),o)}),it=["getContainer","motion","prefixCls","maxCount","className","style","onAllRemoved","stack","renderNotifications"],lt=function(){return document.body},Se=0;function ut(){for(var e={},t=arguments.length,a=new Array(t),n=0;n<t;n++)a[n]=arguments[n];return a.forEach(function(o){o&&Object.keys(o).forEach(function(c){var u=o[c];u!==void 0&&(e[c]=u)})}),e}function ft(){var e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},t=e.getContainer,a=t===void 0?lt:t,n=e.motion,o=e.prefixCls,c=e.maxCount,u=e.className,C=e.style,l=e.onAllRemoved,i=e.stack,h=e.renderNotifications,g=ke(e,it),v=s.useState(),m=T(v,2),E=m[0],d=m[1],p=s.useRef(),M=s.createElement(ct,{container:E,ref:p,prefixCls:o,motion:n,maxCount:c,className:u,style:C,onAllRemoved:l,stack:i,renderNotifications:h}),k=s.useState([]),O=T(k,2),P=O[0],S=O[1],x=s.useMemo(function(){return{open:function(f){var r=ut(g,f);(r.key===null||r.key===void 0)&&(r.key="rc-notification-".concat(Se),Se+=1),S(function(y){return[].concat(B(y),[{type:"open",config:r}])})},close:function(f){S(function(r){return[].concat(B(r),[{type:"close",key:f}])})},destroy:function(){S(function(f){return[].concat(B(f),[{type:"destroy"}])})}}},[]);return s.useEffect(function(){d(a())}),s.useEffect(function(){if(p.current&&P.length){P.forEach(function(r){switch(r.type){case"open":p.current.open(r.config);break;case"close":p.current.close(r.key);break;case"destroy":p.current.destroy();break}});var j,f;S(function(r){return(j!==r||!f)&&(j=r,f=r.filter(function(y){return!P.includes(y)})),f})}},[P]),[x,M]}const dt=e=>{const{componentCls:t,iconCls:a,boxShadow:n,colorText:o,colorSuccess:c,colorError:u,colorWarning:C,colorInfo:l,fontSizeLG:i,motionEaseInOutCirc:h,motionDurationSlow:g,marginXS:v,paddingXS:m,borderRadiusLG:E,zIndexPopup:d,contentPadding:p,contentBg:M}=e,k=`${t}-notice`,O=new xe("MessageMoveIn",{"0%":{padding:0,transform:"translateY(-100%)",opacity:0},"100%":{padding:m,transform:"translateY(0)",opacity:1}}),P=new xe("MessageMoveOut",{"0%":{maxHeight:e.height,padding:m,opacity:1},"100%":{maxHeight:0,padding:0,opacity:0}}),S={padding:m,textAlign:"center",[`${t}-custom-content`]:{display:"flex",alignItems:"center"},[`${t}-custom-content > ${a}`]:{marginInlineEnd:v,fontSize:i},[`${k}-content`]:{display:"inline-block",padding:p,background:M,borderRadius:E,boxShadow:n,pointerEvents:"all"},[`${t}-success > ${a}`]:{color:c},[`${t}-error > ${a}`]:{color:u},[`${t}-warning > ${a}`]:{color:C},[`${t}-info > ${a},
      ${t}-loading > ${a}`]:{color:l}};return[{[t]:Object.assign(Object.assign({},ze(e)),{color:o,position:"fixed",top:v,width:"100%",pointerEvents:"none",zIndex:d,[`${t}-move-up`]:{animationFillMode:"forwards"},[`
        ${t}-move-up-appear,
        ${t}-move-up-enter
      `]:{animationName:O,animationDuration:g,animationPlayState:"paused",animationTimingFunction:h},[`
        ${t}-move-up-appear${t}-move-up-appear-active,
        ${t}-move-up-enter${t}-move-up-enter-active
      `]:{animationPlayState:"running"},[`${t}-move-up-leave`]:{animationName:P,animationDuration:g,animationPlayState:"paused",animationTimingFunction:h},[`${t}-move-up-leave${t}-move-up-leave-active`]:{animationPlayState:"running"},"&-rtl":{direction:"rtl",span:{direction:"rtl"}}})},{[t]:{[`${k}-wrapper`]:Object.assign({},S)}},{[`${t}-notice-pure-panel`]:Object.assign(Object.assign({},S),{padding:0,textAlign:"start"})}]},vt=e=>({zIndexPopup:e.zIndexPopupBase+Ve+10,contentBg:e.colorBgElevated,contentPadding:`${(e.controlHeightLG-e.fontSize*e.lineHeight)/2}px ${e.paddingSM}px`}),Me=Ke("Message",e=>{const t=Ue(e,{height:150});return[dt(t)]},vt);var mt=function(e,t){var a={};for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&t.indexOf(n)<0&&(a[n]=e[n]);if(e!=null&&typeof Object.getOwnPropertySymbols=="function")for(var o=0,n=Object.getOwnPropertySymbols(e);o<n.length;o++)t.indexOf(n[o])<0&&Object.prototype.propertyIsEnumerable.call(e,n[o])&&(a[n[o]]=e[n[o]]);return a};const gt={info:s.createElement(Je,null),success:s.createElement(Ye,null),error:s.createElement(qe,null),warning:s.createElement(Xe,null),loading:s.createElement(Be,null)},Ae=e=>{let{prefixCls:t,type:a,icon:n,children:o}=e;return s.createElement("div",{className:G(`${t}-custom-content`,`${t}-${a}`)},n||gt[a],s.createElement("span",null,o))},pt=e=>{const{prefixCls:t,className:a,type:n,icon:o,content:c}=e,u=mt(e,["prefixCls","className","type","icon","content"]),{getPrefixCls:C}=s.useContext(pe),l=t||C("message"),i=$e(l),[h,g,v]=Me(l,i);return h(s.createElement(Ie,Object.assign({},u,{prefixCls:l,className:G(a,g,`${l}-notice-pure-panel`,v,i),eventKey:"pure",duration:null,content:s.createElement(Ae,{prefixCls:l,type:n,icon:o},c)})))};function yt(e,t){return{motionName:t??`${e}-move-up`}}function ye(e){let t;const a=new Promise(o=>{t=e(()=>{o(!0)})}),n=()=>{t==null||t()};return n.then=(o,c)=>a.then(o,c),n.promise=a,n}var Ct=function(e,t){var a={};for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&t.indexOf(n)<0&&(a[n]=e[n]);if(e!=null&&typeof Object.getOwnPropertySymbols=="function")for(var o=0,n=Object.getOwnPropertySymbols(e);o<n.length;o++)t.indexOf(n[o])<0&&Object.prototype.propertyIsEnumerable.call(e,n[o])&&(a[n[o]]=e[n[o]]);return a};const ht=8,xt=3,bt=e=>{let{children:t,prefixCls:a}=e;const n=$e(a),[o,c,u]=Me(a,n);return o(s.createElement(ot,{classNames:{list:G(c,u,n)}},t))},Nt=(e,t)=>{let{prefixCls:a,key:n}=t;return s.createElement(bt,{prefixCls:a,key:n},e)},Et=s.forwardRef((e,t)=>{const{top:a,prefixCls:n,getContainer:o,maxCount:c,duration:u=xt,rtl:C,transitionName:l,onAllRemoved:i}=e,{getPrefixCls:h,getPopupContainer:g,message:v,direction:m}=s.useContext(pe),E=n||h("message"),d=()=>({left:"50%",transform:"translateX(-50%)",top:a??ht}),p=()=>G({[`${E}-rtl`]:C??m==="rtl"}),M=()=>yt(E,l),k=s.createElement("span",{className:`${E}-close-x`},s.createElement(Qe,{className:`${E}-close-icon`})),[O,P]=ft({prefixCls:E,style:d,className:p,motion:M,closable:!1,closeIcon:k,duration:u,getContainer:()=>(o==null?void 0:o())||(g==null?void 0:g())||document.body,maxCount:c,onAllRemoved:i,renderNotifications:Nt});return s.useImperativeHandle(t,()=>Object.assign(Object.assign({},O),{prefixCls:E,message:v})),P});let Oe=0;function je(e){const t=s.useRef(null);return Ze(),[s.useMemo(()=>{const n=l=>{var i;(i=t.current)===null||i===void 0||i.close(l)},o=l=>{if(!t.current){const x=()=>{};return x.then=()=>{},x}const{open:i,prefixCls:h,message:g}=t.current,v=`${h}-notice`,{content:m,icon:E,type:d,key:p,className:M,style:k,onClose:O}=l,P=Ct(l,["content","icon","type","key","className","style","onClose"]);let S=p;return S==null&&(Oe+=1,S=`antd-message-${Oe}`),ye(x=>(i(Object.assign(Object.assign({},P),{key:S,content:s.createElement(Ae,{prefixCls:h,type:d,icon:E},m),placement:"top",className:G(d&&`${v}-${d}`,M,g==null?void 0:g.className),style:Object.assign(Object.assign({},g==null?void 0:g.style),k),onClose:()=>{O==null||O(),x()}})),()=>{n(S)}))},u={open:o,destroy:l=>{var i;l!==void 0?n(l):(i=t.current)===null||i===void 0||i.destroy()}};return["info","success","warning","error","loading"].forEach(l=>{const i=(h,g,v)=>{let m;h&&typeof h=="object"&&"content"in h?m=h:m={content:h};let E,d;typeof g=="function"?d=g:(E=g,d=v);const p=Object.assign(Object.assign({onClose:d,duration:E},m),{type:l});return o(p)};u[l]=i}),u},[]),s.createElement(Et,Object.assign({key:"message-holder"},e,{ref:t}))]}function St(e){return je(e)}const Ot=w.createContext({});let _=null,z=e=>e(),Q=[],ee={};function Pe(){const{getContainer:e,duration:t,rtl:a,maxCount:n,top:o}=ee,c=(e==null?void 0:e())||document.body;return{getContainer:()=>c,duration:t,rtl:a,maxCount:n,top:o}}const Pt=w.forwardRef((e,t)=>{const{messageConfig:a,sync:n}=e,{getPrefixCls:o}=s.useContext(pe),c=ee.prefixCls||o("message"),u=s.useContext(Ot),[C,l]=je(Object.assign(Object.assign(Object.assign({},a),{prefixCls:c}),u.message));return w.useImperativeHandle(t,()=>{const i=Object.assign({},C);return Object.keys(i).forEach(h=>{i[h]=function(){return n(),C[h].apply(C,arguments)}}),{instance:i,sync:n}}),l}),Rt=w.forwardRef((e,t)=>{const[a,n]=w.useState(Pe),o=()=>{n(Pe)};w.useEffect(o,[]);const c=nt(),u=c.getRootPrefixCls(),C=c.getIconPrefixCls(),l=c.getTheme(),i=w.createElement(Pt,{ref:t,sync:o,messageConfig:a});return w.createElement(tt,{prefixCls:u,iconPrefixCls:C,theme:l},c.holderRender?c.holderRender(i):i)});function se(){if(!_){const e=document.createDocumentFragment(),t={fragment:e};_=t,z(()=>{et()(w.createElement(Rt,{ref:n=>{const{instance:o,sync:c}=n||{};Promise.resolve().then(()=>{!t.instance&&o&&(t.instance=o,t.sync=c,se())})}}),e)});return}_.instance&&(Q.forEach(e=>{const{type:t,skipped:a}=e;if(!a)switch(t){case"open":{z(()=>{const n=_.instance.open(Object.assign(Object.assign({},ee),e.config));n==null||n.then(e.resolve),e.setCloseFn(n)});break}case"destroy":z(()=>{_==null||_.instance.destroy(e.key)});break;default:z(()=>{var n;const o=(n=_.instance)[t].apply(n,B(e.args));o==null||o.then(e.resolve),e.setCloseFn(o)})}}),Q=[])}function kt(e){ee=Object.assign(Object.assign({},ee),e),z(()=>{var t;(t=_==null?void 0:_.sync)===null||t===void 0||t.call(_)})}function $t(e){const t=ye(a=>{let n;const o={type:"open",config:e,resolve:a,setCloseFn:c=>{n=c}};return Q.push(o),()=>{n?z(()=>{n()}):o.skipped=!0}});return se(),t}function It(e,t){const a=ye(n=>{let o;const c={type:e,args:t,resolve:n,setCloseFn:u=>{o=u}};return Q.push(c),()=>{o?z(()=>{o()}):c.skipped=!0}});return se(),a}const wt=e=>{Q.push({type:"destroy",key:e}),se()},Mt=["success","info","warning","error","loading"],At={open:$t,destroy:wt,config:kt,useMessage:St,_InternalPanelDoNotUseOrYouWillBeFired:pt},jt=At;Mt.forEach(e=>{jt[e]=function(){for(var t=arguments.length,a=new Array(t),n=0;n<t;n++)a[n]=arguments[n];return It(e,a)}});export{jt as s};
//# sourceMappingURL=index-Ce-ywo7K.js.map
