(function(){
  var VOICE_MAP = {
    "male-axel":      "es-ES-AlvaroNeural",
    "male-liam":      "es-ES-ArnauNeural",
    "female-alma":    "es-ES-ElviraNeural",
    "female-athena":  "es-ES-EstrellaNeural",
    "female-cora":    "es-ES-IreneNeural",
    "female-eva":     "es-ES-LaiaNeural",
    "female-gemma":   "es-ES-LiaNeural",
    "female-iris":    "es-ES-TrianaNeural",
    "female-jade":    "es-ES-VeraNeural",
    "female-kira":    "es-MX-CeciliaNeural",
    "female-lena":    "es-MX-DaliaNeural",
    "female-luna":    "es-MX-BeatrizNeural",
    "female-maya":    "es-MX-CarlotaNeural",
    "female-mira":    "es-MX-CandelaNeural",
    "female-morgana": "es-MX-MarinaNeural",
    "female-nia":     "es-AR-ElenaNeural",
    "female-nova":    "es-AR-MarianaNeural",
    "female-raven":   "es-CO-CatalinaNeural",
    "female-roxy":    "es-US-PalomaNeural",
    "female-sasha":   "es-CL-CatalinaNeural",
    "female-shadow":  "es-ES-AmagoNeural",
    "female-sky":     "es-ES-ArabellaNeural",
    "female-vera":    "es-PE-CamilaNeural",
    "female-yuki":    "es-PR-KarinaNeural",
    "female-yumi_lib":"es-VE-PaolaNeural",
    "female-zara":    "es-ES-AbrilNeural"
  };
  function esc(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;")}
  function edgeTTS(text,voiceId){
    var voiceName=VOICE_MAP[voiceId]||"es-ES-ElviraNeural";
    var token="6A5AA1D4EAFF4E9FB37E23D68491D6F4";
    var connId=crypto.randomUUID();
    var url="wss://speech.platform.bing.com/connect?TrustedClientToken="+token+"&ConnectionId="+connId;
    return new Promise(function(resolve){
      var allBytes=[],pendingBlobs=0,resolved=false,ws,timeout=setTimeout(function(){if(!resolved){resolved=true;try{ws.close()}catch(e){}resolve(null)}},12000);
      try{ws=new WebSocket(url,"speech")}catch(e){clearTimeout(timeout);resolve(null);return}
      ws.onopen=function(){
        ws.send(JSON.stringify({context:{synthesis:{audio:{metadataoptions:{sentenceBoundaryEnabled:false,wordBoundaryEnabled:false},outputformat:"audio-24khz-96kbitrate-mono-mp3"}}}}));
        var ssml='<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="es-ES"><voice name="'+voiceName+'">'+esc(text)+'</voice></speak>';
        ws.send(ssml);
      };
      function tryResolve(){
        if(pendingBlobs>0){setTimeout(tryResolve,50);return}
        clearTimeout(timeout);
        if(resolved)return;resolved=true;
        if(allBytes.length>0){
          var total=allBytes.reduce(function(s,c){return s+c.length},0);
          var combined=new Uint8Array(total),offset=0;
          for(var i=0;i<allBytes.length;i++){combined.set(allBytes[i],offset);offset+=allBytes[i].length}
          try{var binary="",len=combined.byteLength;for(var i=0;i<len;i++)binary+=String.fromCharCode(combined[i]);resolve({audio:btoa(binary),contentType:"audio/mpeg"})}catch(e){resolve(null)}
        }else resolve(null);
      }
      ws.onmessage=function(e){
        if(typeof e.data==="string")return;
        if(e.data instanceof Blob){pendingBlobs++;var reader=new FileReader();reader.onload=function(){allBytes.push(new Uint8Array(reader.result));pendingBlobs--};reader.readAsArrayBuffer(e.data)}
        else if(e.data instanceof ArrayBuffer){allBytes.push(new Uint8Array(e.data))}
      };
      ws.onclose=function(){tryResolve()};
      ws.onerror=function(){clearTimeout(timeout);if(!resolved){resolved=true;resolve(null)}};
    });
  }
  var origFetch=window.fetch;
  window.fetch=function(url,opts){
    if(opts&&opts.body&&typeof opts.body==="string"&&opts.body.indexOf('"tts"')!==-1){
      var body;
      try{body=JSON.parse(opts.body)}catch(e){return origFetch.apply(this,arguments)}
      if(body&&body.action==="tts"&&body.text){
        return (async function(){
          var result=await edgeTTS(body.text,body.voiceId||"");
          if(result) return new Response(JSON.stringify(result),{headers:{"Content-Type":"application/json"}});
          return origFetch.apply(this,arguments);
        })();
      }
    }
    return origFetch.apply(this,arguments);
  };
})();
