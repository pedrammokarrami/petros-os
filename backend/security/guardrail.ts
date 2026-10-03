export function sanitizeShellCommand(cmd:string){const clean=(cmd||'').trim().replace(/[
]+/g,' ');if(/rm\s+-rf\s+\/|mkfs|>.*dev.*sda/.test(clean))return{valid:false,error:'Blocked'};return{valid:true,command:clean};}
