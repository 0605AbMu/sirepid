const lt = require("localtunnel");

lt({
    port: 10,
// subdomain: "mytestlab3"
    
})
.then(t=>{
console.log("tunnel url", t.url)
t.on("error", console.log)
})
.catch(e=>{
    console.log("ulanmadi", e)
})