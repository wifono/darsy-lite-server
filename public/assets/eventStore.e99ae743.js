import{ad as p,ae as r}from"./index.3c6c0f9a.js";import{api as d}from"./axios.e853347c.js";import{g as u}from"./ClosePopup.5735553b.js";const m=u(),v=async e=>{const o=m.rooms.find(a=>a._id===e);return o?o.color:"#eb67c7"},E=p("Events",{state:()=>({subject:null,start:null,end:null,location:null,organizer:null,day:null,eventModal:!1,editEventModal:!1,eventId:null,events:[],addFormVisible:!1,useCustomValues:!1,start:"",startHours:"00",startMinutes:"00",otherEmployeeEvent:!1,otherEmployee:""}),getters:{},actions:{async getEvents(){var e,o;try{const a=JSON.parse(localStorage.getItem("credentials")),l=(e=a==null?void 0:a.user)==null?void 0:e.companyId,c=(o=a==null?void 0:a.user)==null?void 0:o.role,s=await d.get("event",{headers:{Authorization:`Bearer ${localStorage.getItem("accessToken")}`}});console.log("Events fetched:",s.data.data);const i=n=>n.map(t=>({id:t._id,title:t.subject,start:new Date(t.start*1e3).toISOString().slice(0,16).replace("T"," "),end:new Date(t.end*1e3).toISOString().slice(0,16).replace("T"," "),location:t.locationName,locationId:t.location,description:t.organizerName,company:t.companyId,isEditable:!0,disableDND:["month","week","day"],disableResize:["month","week","day"],additionalClasses:"drag",color:v(t.location),calendarId:`${t.location}`}));c==="admin"?(this.events=i(s.data.data),console.log("jetotamm",this.events)):this.events=i(s.data.data.filter(n=>n.companyId===l))}catch{r.create({message:"Chyba pri z\xEDskavan\xED udalost\xED.",color:"warning",position:"top"})}},async createEvent(){const e=Date.parse(`${this.day}T${this.start}Z`)/1e3,o=Date.parse(`${this.day}T${this.end}Z`)/1e3,a=JSON.parse(localStorage.getItem("credentials"));if(this.events.some(i=>{if(i.location!==this.location.value)return!1;const n=i.start,t=i.end;return e>=n&&e<t||o>n&&o<=t||e<=n&&o>=t})){r.create({message:"Udalos\u0165 sa nem\xF4\u017Ee vytvori\u0165, preto\u017Ee sa prekr\xFDva s existuj\xFAcou udalos\u0165ou v tejto miestnosti.",color:"negative",position:"top"});return}const l=this.otherEmployeeEvent?this.otherEmployee.value:a.user._id,c={subject:this.subject,start:e.toString(),end:o.toString(),location:this.location.value,organizer:l};try{const s=await d.post("event",c,{headers:{Authorization:`Bearer ${localStorage.getItem("accessToken")}`}});s.status===201?s.data.status==="error"&&s.data.code===400?r.create({message:"Nedostatok dostupn\xE9ho \u010Dasu na vytvorenie udalosti",color:"negative",position:"top"}):(r.create({message:"Udalos\u0165 vytvoren\xE1",color:"positive",position:"top"}),this.events.push(s.data),await this.getEvents(),this.addFormVisible=!1):r.create({message:"Chyba pri vytv\xE1ran\xED udalosti.",color:"negative",position:"top"})}catch(s){console.error("Error during event creation:",s),r.create({message:"Chyba pri vytv\xE1ran\xED udalosti.",color:"negative",position:"top"})}},async updateEvent(){try{const e=Date.parse(`${this.day}T${this.start}Z`)/1e3,o=Date.parse(`${this.day}T${this.end}Z`)/1e3,a={subject:this.subject,start:e.toString(),end:o.toString(),location:this.location.value};(await d.patch(`/event/${this.eventId}`,a,{headers:{Authorization:`Bearer ${localStorage.getItem("accessToken")}`}})).status===200&&(r.create({message:"Udalos\u0165 upraven\xE1.",color:"positive",position:"top"}),this.editEventModal=!1,this.eventModal=!1,await this.getEvents())}catch(e){r.create({message:"Chyba pri \xFAprave udalosti.",color:"negative",position:"top"}),console.error(e)}}}});export{E as u};