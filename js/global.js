// object to insert global window functions of the dapp
var dapp = {};

window.Buffer = buffer.Buffer;

window.dapp.address = "AmhhXytCBtzJvnmKpS6SS73jHiYNryQZpgBVeCwbzsgr9T3aPJ5N";

window.dapp.contract = undefined;
window.dapp.abi = undefined;

window.dapp.homepage = "https://google.com"

// localforage configuration
localforage.config({    
    name: 'billboardsDAO',
    description: 'billboardsDAO database'  
});

/*
billboardsDAO keys:

billboards_count (=> uint) number of billboards in database syncronized

1 
2
3 
... (=> billboard hash)

-------------------

lat;long 


*/

// interval

window.dapp.connectedInterval = 0;
window.dapp.currentHeight;

window.dapp.global = function() {
    window.dapp.connectedInterval--;
      
    if (document.getElementById("progress-bar")) {
        // progress-bar está visivel   
    }
    
    if (document.getElementById("bottom")) {
        
        let btn = document.querySelector("ons-bottom-toolbar>ons-row>ons-col>ons-toolbar-button"); // button    
        let span = document.querySelector("ons-bottom-toolbar>ons-row>ons-col>span"); // information
        
        if (window.aergo) {
            
            aergo.blockchain().then(blockchainState => {
                window.dapp.connectedInterval = 5;
                window.dapp.currentHeight = blockchainState.bestHeight;
                span.innerHTML = window.account.chain+"&nbsp;<font style='color:green;'>&bull;</font>&nbsp;"+window.dapp.currentHeight;
            }, function(ex) {
                document.querySelector("ons-bottom-toolbar>ons-row>ons-col>span>font").style.color = "red";
              });
            
            if (window.account) {
             
               btn.innerHTML = window.account.address.substr(0, 6)+"..."+window.account.address.substr(-3);
               btn.setAttribute("title", window.account.address);
                
            } else {
                
               btn.innerHTML = "Aergo Connect";
               btn.removeAttribute("title");
               span.innerHTML = span.getAttribute("data-placeholder");
                
            }
            
        } else {
            span.innerHTML = span.getAttribute("data-placeholder");
        }
        
        
    }
    
    if (document.getElementById("claimable")) {
  
        if ((window.aergo)&&(window.account)) {
                
                aergo.getState(window.account.address).then(state => {                    
                    localforage.getItem('claimable').then(function(value) {
                        if(value == null) localforage.setItem('claimable', 0);
                        
                        if (!document.querySelector("#claimable>span")) {
                            document.querySelector("#claimable").innerHTML = "<img alt='Aergo' width='20px' draggable='false' src='img/aergo_logomark.svg'>&nbsp;<span>&nbsp;</span>"
                        }
                        document.querySelector("#claimable>span").innerHTML = (new herajs.Amount(state.balance.value.toString(), "aer", "aergo")).toString().replace(/ aergo/, "").replace(/^(\d+[\.,]\d{5}).*$/, "$1") +
                        "&nbsp;<b>CLAIMABLE</b>:&nbsp;" + ((value == null)?"0":value.toString()); 
                                              
                    });
                })
       
        } else {
            
            document.getElementById("claimable").innerHTML = document.getElementById("claimable").getAttribute("data-placeholder");
            
        }
        
        
    }
    
    
    
    
    
};

window.dapp.aergoConnect = function() {
    
    if (window.account) {        
        window.dapp.aergoDisconnect();
    } 
    
  window.postMessage({
    type: "AERGO_REQUEST",
    action:  "ACTIVE_ACCOUNT",
    data: {}
  });
    
   window.addEventListener("AERGO_ACTIVE_ACCOUNT", function(event) {

    if (window.dapp.extensionPopoverTimeout) clearTimeout(window.dapp.extensionPopoverTimeout);
    document.getElementById('browser-extension-popover').hide();
       
    if (event.detail.error) {
      return false;
    }
    
    let chain;
       
    if (event.detail.account.chainId == "aergo.io") {
        
       window.aergo = new AergoClient({}, new GrpcWebProvider({
        url: "https://mainnet-api-http.aergo.io"
       }));
      
   } else if (event.detail.account.chainId == "testnet.aergo.io") {
       
       window.aergo = new AergoClient({}, new GrpcWebProvider({
        url: "https://testnet-api-http.aergo.io"
       }));
       
    } else {
      return false;
    }
       
    window.account = {
      address: event.detail.account.address,
      chain: event.detail.account.chainId
    };
       
       var load_contract = async function() {
           window.dapp.abi = await aergo.getABI(window.dapp.address);
           window.dapp.contract = Contract.atAddress(window.dapp.address);
           window.dapp.contract.loadAbi(await aergo.getABI(window.dapp.address));
       }
       load_contract();      

    }, {
    once: true
     });
   
    
}

window.dapp.aergoDisconnect = function() {
    window.account = undefined;
    window.dapp.abi = undefined;
    window.dapp.contract = undefined;
}


window.dapp.globalInterval = undefined;

window.dapp.switch_theme = function(checked, startup) {    

    var oldlink = document.getElementsByTagName("link").item(0);

    var newlink = document.createElement("link");
    newlink.setAttribute("rel", "stylesheet");
    newlink.setAttribute("type", "text/css");
    newlink.setAttribute("href", "onsenui/extras/themes/"+(checked?'night':'day')+".css");

    document.getElementsByTagName("head").item(0).appendChild(newlink);
    
    if (!startup) {
        setTimeout(function(ol){document.getElementsByTagName("head").item(0).removeChild(ol)},50,oldlink);
        localforage.setItem('theme', checked);
    }

}


window.dapp.extensionPopoverTimeout = undefined;
window.dapp.interfaceConnection = function(){
    
    if (window.account) {
        
          ons.openActionSheet({
            title: 'Aergo Connect',
            cancelable: true,
            buttons: [
              { //0
                label: 'Disconnect',
                modifier: 'destructive',
                icon: 'fa-ban'
              },
              { //1
                label: 'Cancel',
                icon: 'md-close'
              }
            ]
         }).then(function (index) { 
        
            if (index == 0) {
                window.dapp.aergoDisconnect();        
            }        
        
        });        
        
    } else {
                
        ons.openActionSheet({
            title: 'Aergo Connect',
            cancelable: true,
            buttons: [
              { //0
                label: 'Aergo Web Node',
                modifier: 'destructive',
                icon: 'fa-network-wired'
              },
              { //1
                label: 'Cancel',
                icon: 'md-close'
              }
            ]
         }).then(function (index) { 
        
            if (index == 0) {
                window.dapp.aergoConnect();            
                
               window.dapp.extensionPopoverTimeout = setTimeout(function() {
                  window.dapp.extensionPopoverTimeout = undefined;
                  document.getElementById('browser-extension-popover').show(document.getElementById('search-menu'));
               }, 1500);
                
                
            }        
        
        });

    }
    
}

// onsenui configuration
ons.ready(function() {   

    window.AergoClient = herajs.AergoClient;
    window.GrpcWebProvider = herajs.GrpcWebProvider;
    window.Contract = herajs.Contract;
   
    window.dapp.globalInterval = setInterval(window.dapp.global, 5000);
    
    localforage.getItem('theme').then(function(value) {
        if(value == null) localforage.setItem('theme', false); 
        window.dapp.switch_theme(document.querySelector('#theme-switcher').checked = value, true);
    });
    
    document.querySelector('#search').addEventListener('preclose', function() {
        document.getElementById("events-list").innerHTML = '<ons-list-header class="list-header">Current Events</ons-list-header><ons-progress-circular indeterminate></ons-progress-circular>';
    });    
           
    document.querySelector('#menu').addEventListener('preopen', function() {

        if (window.account) {
            document.getElementById("wallet-menu-connected").style.display = "block";
            document.getElementById("wallet-menu-disconnected").style.display = "none";
        } else {
            document.getElementById("wallet-menu-connected").style.display = "none";
            document.getElementById("wallet-menu-disconnected").style.display = "block";
        }

    });
    
    document.querySelector('#search').addEventListener('preopen', function() {        

        if (window.dapp.contract) {

            var query_events = async function() {
                const events_list = await aergo.queryContract(window.dapp.contract.get_events_list());

                document.getElementById("events-list").innerHTML = '<ons-list-header class="list-header">Current Events</ons-list-header>';

                if (events_list.length>0) {

                    for(i=0;i<events_list.length;i++) {

                         const resp = await fetch('https://en.wikipedia.org/w/api.php?'+window.encodeQueryData({"action":"parse","format":"json","origin":"*","prop":"text","formatversion":2,"page":decodeURIComponent(escape(window.atob(events_list[i].media_base64)))}));
                         const respjson = await resp.json();

                        try {

                          var litem = document.createElement('ons-list-item');
                          litem.setAttribute("tappable", "tappable");
                          litem.setAttribute("modifier", "longdivider");
                          litem.setAttribute("style", "text-overflow:ellipsis;width:226px;overflow:hidden;");
                          litem.setAttribute("data-value_per_hour", events_list[i].value_per_hour_ns.toString());
                          litem.innerHTML = `Wikipedia:&nbsp;${window.escapeHtml(respjson.parse.title)}`;

                           document.getElementById("events-list").insertBefore(litem);

                           let litems = document.getElementById("events-list");
                           let litemx = document.getElementById("events-list").querySelectorAll("ons-list-item");

                            let sorted = Array.from(litemx).sort(function(a, b){return b.dataset.value_per_hour-a.dataset.value_per_hour});

                            document.getElementById("events-list").innerHTML = '<ons-list-header class="list-header">Current Events</ons-list-header>';
                            sorted.forEach(e => document.getElementById("events-list").appendChild(e));

                         } catch(ex){console.log("invalid wikipedia article")}        

                    }

                } else {

                  var litem = document.createElement('ons-list-item');
                  litem.innerHTML = `<div class="center">
                    <span class="list-item__title">All events have expired!</span>
                  </div>`;

                  document.getElementById("events-list").insertBefore(litem);

                }       

            };
            query_events();

        }  

    });
    
    
    
});




  window.dapp.open_menu = function() {
    document.getElementById('menu').open();
  };

  window.dapp.open_search = function() {
    document.getElementById('search').open();  
  };

  window.dapp.hide_menu = function() {
    document.getElementById('menu').close();
  };

  window.dapp.hide_search = function() {
    document.getElementById('search').close();
  };

  window.dapp.exit = function() {
    
      if (window.account) {
        
          ons.openActionSheet({
            title: 'Aergo Connect',
            cancelable: true,
            buttons: [
              { //0
                label: 'Disconnect and Exit DApp',
                modifier: 'destructive',
                icon: 'fa-ban'
              },
              { //1
                label: 'Cancel',
                icon: 'md-close'
              }
            ]
         }).then(function (index) { 
        
            if (index == 0) {
                window.dapp.aergoDisconnect();  
                location.href = window.dapp.homepage;
            } else document.getElementById('menu').open();
        
        });        
        
    } else { 
        
        location.href = window.dapp.homepage;
        
    }
      
  };


  window.dapp.load = function(page) {
    var content = document.getElementById('content');
    var menu = document.getElementById('menu');
    content.load(page).then(menu.close.bind(menu));
  };

  window.dapp.share = function() {

      try {
        navigator.share({
          title: 'MDN',
          text: 'Learn web development on MDN!',
          url: 'https://developer.mozilla.org'
        })
      } catch(err) {}

  }

window.dapp.showCaution = function(){
    ons.notification.toast('Before performing token trading, check the BOARDS token address corresponds to ONE1233454411545488815111', { timeout: 5000, animation: 'fall' });    
};
          
document.addEventListener('init', function(event) {   

    var page = event.target;

    // Creating map options

    // check element exists
    if (page.querySelector('#map')) {                

      var mapOptions = {
        center: [17.385044, 78.486671],
        zoom: 10
      }

      // Creating a map object
      var map = new L.map('map', mapOptions);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

    };

    if (page.querySelector('#share-btn')) {
        if (!navigator.share) page.querySelector('#share-btn').style.display = "none";            
    }
    
    //alert(page.id);

});

window.dapp.get_nft_attr = function(nft_id) {
 
    if (Number.isInteger(nft_id+0)) {
        if (nft_id>0) {
            
            let hashed = sha256('billboards'+nft_id).toLowerCase().split('');
            
            hashed[0] = 04 + (hashed[0].charCodeAt() - (hashed[0].charCodeAt() <= 57 ? 47 : 86)); // 04 + 16 = 20
            hashed[1] = 06 + (hashed[1].charCodeAt() - (hashed[1].charCodeAt() <= 57 ? 47 : 86)); // 06 + 16 = 22
            hashed[2] = 08 + (hashed[2].charCodeAt() - (hashed[2].charCodeAt() <= 57 ? 47 : 86)); // 08 + 16 = 24
            hashed[3] = 11 + (hashed[3].charCodeAt() - (hashed[3].charCodeAt() <= 57 ? 47 : 86)); // 11 + 16 = 27
            hashed[4] = 15 + (hashed[4].charCodeAt() - (hashed[4].charCodeAt() <= 57 ? 47 : 86)); // 15 + 16 = 31

            return {
                extra_coupon_expires: 60 *
                ((hashed[hashed[0]].charCodeAt() - (hashed[hashed[0]].charCodeAt() <= 57 ? 47 : 86)) +
                (hashed[hashed[1]].charCodeAt() - (hashed[hashed[1]].charCodeAt() <= 57 ? 47 : 86)) + 
                (hashed[hashed[2]].charCodeAt() - (hashed[hashed[2]].charCodeAt() <= 57 ? 47 : 86))),                
                extra_event_expires: hashed[hashed[3]].charCodeAt() - (hashed[hashed[3]].charCodeAt() <= 57 ? 47 : 86),                
                extra_collectable: (hashed[hashed[4]].charCodeAt() - (hashed[hashed[4]].charCodeAt() <= 57 ? 47 : 86)) - 1 
            }

        }
    }   
    
    return false;
    
}

window.dapp.create_nft_div = function(nft_id, container_el) {if(Number.isInteger(nft_id+0)) {if(nft_id>0){

  let extras = window.dapp.get_nft_attr(nft_id);
    
  let div = document.createElement('div');
  div.className = "nft-div";
  div.innerHTML = `
 
    <table border=0 style="width:100%">
        <tr><!--title--> 
            <td colspan="3" style="text-align:right;">
                 <b>#${nft_id}</b>
            </td>        
        </tr>
        <tr><!--image--> 
            <td colspan="3">
                <img  alt="Loading" data-id="${nft_id}" class="lazy" data-src="https://www.gravatar.com/avatar/${sha256('billboards'+nft_id).toLowerCase().slice(-32)}?s=60&r=g&d=robohash" style="width:60px;height:60px" />            
            </td>        
        </tr>
        <tr><!--attrs-->
            <td width="33%" style="text-align:center;">
                <div
                    id="extra_coupon_expires_${nft_id}"
                    data-preset="bubble"
                    class="ldBar"
                    data-value="35">
                </div>
            </td>
            <td width="33%" style="text-align:center;">
              <div
                  id="extra_event_expires_${nft_id}"
                  data-type="fill"
                  data-path="M10 10L90 10L90 90L10 90Z"
                  class="ldBar"
                  data-value="35"
                  data-fill="data:ldbar/res,
                  bubble(#248,#fff,50,1)">
                </div>
            </td>
            <td width="33%" style="text-align:center;">
               <div
                  id="extra_collectable_${nft_id}"
                  data-type="fill"
                  data-path="M45 10L45 10L80 90L10 90Z"
                  class="ldBar"
                  data-value="35"
                  data-fill="data:ldbar/res,
                  bubble(#3fc2b8,#fff,50,1)">
                </div>
            </td>          
        </tr>  
         <tr><!--options--> 
            <td colspan="3" style="text-align:right;" id="options_${nft_id}"></td>        
        </tr>    
    </table>

  
  `; 
    
   container_el.append(div);

    let extra_coupon_expires_$ = new ldBar("#extra_coupon_expires_"+nft_id);
    let extra_event_expires_$ = new ldBar("#extra_event_expires_"+nft_id);
    let extra_collectable_$ = new ldBar("#extra_collectable_"+nft_id);
    
    function map(x, in_min, in_max, out_min, out_max) {
      return Math.floor((x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min);
    }
    
    extra_coupon_expires_$.set(map(extras.extra_coupon_expires,1*3*60,16*3*60,0,100));
    extra_event_expires_$.set(map(extras.extra_event_expires,1,16,0,100));
    extra_collectable_$.set(map(extras.extra_collectable,0,15,0,100));

   lazyload.update();
   return true
    
}}return false}

window.dapp.executeLazyFunction = async function(element) {if ((window.aergo)&&(window.account)) {
    if (document.getElementById("options_"+element.dataset.id)) {
        if (document.getElementById("options_"+element.dataset.id).innerHTML=="") {
            const nft_table = await aergo.queryContract(window.dapp.contract.get_NFT_table(element.dataset.id.toString()));
            
            //id_string
            //value_ns
            //owner_address
            
            /*
                
                escrever no escopo do await
            
                opções:

                mostrar preco e botão comprar -- owner <> account && value > 0
                mostrar botão aplicar -- owner == account & applied <> id & value == 0
                mostrar botão vender (e aplicar) -- owner == account & applied <> id
                mostrar mensagem "Aplicado" -- owner == account & applied == id
                mostrar preço e botão alterar preço (e remover da venda) -- owner == account & value > 0
                mostrar não está a venda -- owner <> account && value == 0

            */
        }
    }
}}

window.encodeQueryData = function(data) {
   const ret = [];
   for (let d in data)
     ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
   return ret.join('&');
}
window.escapeHtml = function(unsafe)
{
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }
