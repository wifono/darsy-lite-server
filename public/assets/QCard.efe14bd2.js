import{ad as s,k as d,c as n,h as u,l as c,g as l}from"./index.44e2cc04.js";import"./axios.7aa860db.js";import{u as f,a as i}from"./QForm.7ac48cfa.js";const k=s("Config",{state:()=>({dark:!1}),getters:{},actions:{}});var C=d({name:"QCard",props:{...f,tag:{type:String,default:"div"},square:Boolean,flat:Boolean,bordered:Boolean},setup(a,{slots:e}){const{proxy:{$q:r}}=l(),t=i(a,r),o=n(()=>"q-card"+(t.value===!0?" q-card--dark q-dark":"")+(a.bordered===!0?" q-card--bordered":"")+(a.square===!0?" q-card--square no-border-radius":"")+(a.flat===!0?" q-card--flat no-shadow":""));return()=>u(a.tag,{class:o.value},c(e.default))}});export{C as Q,k as u};