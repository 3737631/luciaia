(function(){
  var VOICE_MAP = {
    "male-axel":      {v:"es-ES-Teoneural",p:"-30%",r:"-25%"},
    "male-liam":      {v:"es-ES-AlvaroNeural",p:"-25%",r:"-20%"},
    "female-alma":    {v:"es-ES-ElviraNeural",p:"-12%",r:"-30%"},
    "female-athena":  {v:"es-ES-AbrilNeural",p:"-12%",r:"-35%"},
    "female-cora":    {v:"es-ES-EstrellaNeural",p:"-12%",r:"-25%"},
    "female-eva":     {v:"es-ES-IreneNeural",p:"-12%",r:"-35%"},
    "female-gemma":   {v:"es-ES-LaiaNeural",p:"-12%",r:"-30%"},
    "female-iris":    {v:"es-ES-LiaNeural",p:"-12%",r:"-25%"},
    "female-jade":    {v:"es-ES-TrianaNeural",p:"-12%",r:"-35%"},
    "female-kira":    {v:"es-ES-VeraNeural",p:"-12%",r:"-30%"},
    "female-lena":    {v:"es-ES-ElviraNeural",p:"+10%",r:"-20%"},
    "female-luna":    {v:"es-ES-AbrilNeural",p:"+10%",r:"-20%"},
    "female-maya":    {v:"es-ES-VeraNeural",p:"0%",r:"-30%"},
    "female-mira":    {v:"es-ES-ElviraNeural",p:"0%",r:"-35%"},
    "female-morgana": {v:"es-ES-AbrilNeural",p:"0%",r:"-25%"},
    "female-nia":     {v:"es-ES-EstrellaNeural",p:"0%",r:"-30%"},
    "female-nova":    {v:"es-ES-IreneNeural",p:"0%",r:"-35%"},
    "female-raven":   {v:"es-ES-LaiaNeural",p:"0%",r:"-25%"},
    "female-roxy":    {v:"es-ES-LiaNeural",p:"0%",r:"-20%"},
    "female-sasha":   {v:"es-ES-TrianaNeural",p:"0%",r:"-30%"},
    "female-shadow":  {v:"es-ES-EstrellaNeural",p:"+10%",r:"-20%"},
    "female-sky":     {v:"es-ES-IreneNeural",p:"+10%",r:"-25%"},
    "female-vera":    {v:"es-ES-LaiaNeural",p:"+10%",r:"-20%"},
    "female-yuki":    {v:"es-ES-LiaNeural",p:"+10%",r:"-30%"},
    "female-yumi_lib":{v:"es-ES-TrianaNeural",p:"+10%",r:"-25%"},
    "female-zara":    {v:"es-ES-VeraNeural",p:"+10%",r:"-35%"}
  };

  function esc(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;")}

  function edgeTTS(text,voiceId){
    var cfg=VOICE_MAP[voiceId]||{v:"es-ES-ElviraNeural",p:"0%",r:"-30%"};
    var token="6A5AA1D4EAFF4E9FB37E23D68491D6F4";
    var connId=crypto.randomUUID();
    var url="wss://speech.platform.bing.com/connect?TrustedClientToken="+token+"&ConnectionId="+connId;
    return new Promise(function(resolve){
      var chunks=[],resolved=false,ws,timeout=setTimeout(function(){if(!resolved){resolved=true;try{ws.close()}catch(e){}resolve(null)}},12000);
      try{ws=new WebSocket(url,"speech")}catch(e){clearTimeout(timeout);resolve(null);return}
      ws.onopen=function(){
        ws.send(JSON.stringify({context:{synthesis:{audio:{metadataoptions:{sentenceBoundaryEnabled:false,wordBoundaryEnabled:false},outputformat:"audio-24khz-96kbitrate-mono-mp3"}}}}));
        var ssml='<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="es-ES"><voice name="'+cfg.v+'"><prosody rate="'+cfg.r+'" pitch="'+cfg.p+'">'+esc(text)+'</prosody></voice></speak>';
        ws.send(ssml);
      };
      var allBytes=[],pendingBlobs=0;
      function tryResolve(){
        if(pendingBlobs>0){setTimeout(tryResolve,50);return}
        clearTimeout(timeout);
        if(resolved)return;resolved=true;
        if(allBytes.length>0){
          var total=allBytes.reduce(function(s,c){return s+c.length},0);
          var combined=new Uint8Array(total),offset=0;
          for(var i=0;i<allBytes.length;i++){combined.set(allBytes[i],offset);offset+=allBytes[i].length}
          try{
            var binary="",len=combined.byteLength;
            for(var i=0;i<len;i++)binary+=String.fromCharCode(combined[i]);
            resolve({audio:btoa(binary),contentType:"audio/mpeg"});
          }catch(e){resolve(null)}
        }else resolve(null);
      }
      ws.onmessage=function(e){
        if(typeof e.data==="string")return;
        if(e.data instanceof Blob){
          pendingBlobs++;
          var reader=new FileReader();
          reader.onload=function(){allBytes.push(new Uint8Array(reader.result));pendingBlobs--};
          reader.readAsArrayBuffer(e.data);
        }else if(e.data instanceof ArrayBuffer){
          allBytes.push(new Uint8Array(e.data));
        }
      };
      ws.onclose=function(){tryResolve()};
      ws.onerror=function(){clearTimeout(timeout);if(!resolved){resolved=true;resolve(null)}};
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
