export function compressContext(t:string):string{return(t||'').replace(/[][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,'').replace(/[ 	]+/g,' ').replace(/
\s*
/g,'
').trim();}
