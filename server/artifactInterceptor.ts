export function setupArtifactInterceptor(app: any) {
  app.use((req: any, res: any, next: any) => {
    const origJson = res.json;
    res.json = function(body: any) {
      if (body && typeof body === 'object') {
        const reply = body.reply || body.output || body.text || body.response || '';
        if (typeof reply === 'string') {
          let extractedCode = '';
          const fence = String.fromCharCode(96, 96, 96);
          const nl = String.fromCharCode(10);
          if (reply.indexOf(fence) !== -1) {
            const parts = reply.split(fence);
            for (let i = 1; i < parts.length; i += 2) {
              let block = parts[i].trim();
              const firstLineEnd = block.indexOf(nl);
              if (firstLineEnd !== -1) {
                const firstLine = block.substring(0, firstLineEnd).trim().toLowerCase();
                if (firstLine === 'html' || firstLine === 'xml' || firstLine === 'tsx' || firstLine === 'jsx') {
                  block = block.substring(firstLineEnd + 1).trim();
                }
              }
              if (block.indexOf('<html') !== -1 || block.indexOf('<!DOCTYPE') !== -1 || block.indexOf('<div') !== -1 || block.indexOf('<main') !== -1) {
                extractedCode = block;
                break;
              }
            }
          }
          if (!extractedCode && (reply.indexOf('<!DOCTYPE html') !== -1 || (reply.indexOf('<html') !== -1 && reply.indexOf('</html>') !== -1))) {
            const start = reply.indexOf('<!DOCTYPE html') !== -1 ? reply.indexOf('<!DOCTYPE html') : reply.indexOf('<html');
            const end = reply.lastIndexOf('</html>');
            if (start !== -1 && end !== -1 && end > start) {
              extractedCode = reply.substring(start, end + 7).trim();
            }
          }
          if (extractedCode && !body.artifact) {
            body.artifact = {
              id: 'art-' + Date.now(),
              title: 'Web Artifact',
              type: 'html',
              language: 'html',
              code: extractedCode
            };
            body.code = extractedCode;
            console.log('[AutoArtifact] Web artifact extracted: ' + extractedCode.length + ' chars');
          }
        }
      }
      return origJson.call(this, body);
    };
    next();
  });
}
