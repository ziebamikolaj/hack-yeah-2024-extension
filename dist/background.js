const a=e=>{try{return new URL(e).hostname.replace(/^www\./,"")}catch{return console.error("Invalid URL:",e),""}},s=e=>{if(console.log(e),e===void 0)chrome.action.setBadgeText({text:""});else{const o=Math.round(e).toString();chrome.action.setBadgeText({text:o}),chrome.action.setBadgeBackgroundColor({color:d(e)})}},d=e=>e<=30?"#EF4444":e<=70?"#F59E0B":"#10B981",n=e=>{const o=a(e);o&&fetch(`https://is-this-fishy.vercel.app/api/domain/${o}`).then(r=>r.text()).then(r=>{if(r==="No domain found")chrome.action.setBadgeText({text:"?"}),chrome.action.setBadgeBackgroundColor({color:"#9CA3AF"}),chrome.storage.local.set({[o]:{error:"No domain found"}}),chrome.runtime.sendMessage({action:"scoreUpdated",url:o,data:{error:"No domain found"}});else{const t=JSON.parse(r);s(t.overallScore),chrome.storage.local.set({[o]:t}),chrome.runtime.sendMessage({action:"scoreUpdated",url:o,data:t})}}).catch(r=>{console.error("Error fetching score:",r),chrome.action.setBadgeText({text:"!"}),chrome.action.setBadgeBackgroundColor({color:"#EF4444"}),chrome.storage.local.set({[o]:{error:"Failed to fetch score"}}),chrome.runtime.sendMessage({action:"scoreUpdated",url:o,data:{error:"Failed to fetch score"}})})};chrome.tabs.onUpdated.addListener((e,o,r)=>{o.status==="complete"&&r.url&&n(r.url)});chrome.tabs.onActivated.addListener(e=>{chrome.tabs.get(e.tabId,o=>{o.url&&n(o.url)})});chrome.runtime.onMessage.addListener((e,o,r)=>{if(e.action==="requestScore")return fetch(`https://is-this-fishy.vercel.app/api/domain/${e.url}`,{method:"GET"}).then(t=>t.text()).then(t=>{if(t==="No domain found"){const c={error:"No domain found"};chrome.runtime.sendMessage({action:"updateScore",error:"No domain found"}),r(c)}else{const c=JSON.parse(t);r(c)}}).catch(t=>{console.error("Error fetching score:",t);const c={error:"Failed to fetch score"};chrome.runtime.sendMessage({action:"updateScore",error:"Failed to fetch score"}),r(c)}),!0});chrome.runtime.onMessage.addListener(e=>{e.action==="fetchScore"&&n(e.url)});
