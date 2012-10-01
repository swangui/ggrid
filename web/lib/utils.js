  $A = function(iterable) {
    if (!iterable) return [];
    var length = iterable.length, results = new Array(length);
    while (length--) results[length] = iterable[length];
    return results;
  };
 
  $CACHE = {
    init: function(){
      CACHE_NAMESPACE = {};
    },
    get: function(key){
      return CACHE_NAMESPACE[key]
    },
    set: function(key, val){
      CACHE_NAMESPACE[key] = val;
    },
    destroy: function(key){
      CACHE_NAMESPACE[key] = void(0);
      delete CACHE_NAMESPACE[key];
    },
    exists: function(key){
      return (typeof(CACHE_NAMESPACE[key]) == 'undefined') ? false : true;
    }
  }
  
  $CACHE.init();
//  $CACHE.set('test', 123);
//  alert($CACHE.get('test'));
//  alert($CACHE.exists('test'));
//  $CACHE.destroy('test');
//  alert($CACHE.get('test'));
//  alert($CACHE.exists('test'));
  
  $pageWidth = function(){
    var pageWidth = 0;
    if( typeof( window.innerWidth ) == 'number' ) {
      //Non-IE
      pageWidth = window.innerWidth;
    } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
      //IE 6+ in 'standards compliant mode'
      pageWidth = document.documentElement.clientWidth;
    } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
      //IE 4 compatible
      pageWidth = document.body.clientWidth;
    };
    return pageWidth;
  };
  
  $pageHeight = function(){
    var pageHeight = 0;
    if( typeof( window.innerWidth ) == 'number' ) {
      //Non-IE
      pageHeight = window.innerHeight;
    } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
      //IE 6+ in 'standards compliant mode'
      pageHeight = document.documentElement.clientHeight;
    } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
      //IE 4 compatible
      pageHeight = document.body.clientHeight;
    };
    return pageHeight;
  };
  
  $v_to_s = function(tpl){
    var tmpStr = tpl.replace(/[^{]*{#([^{#}]+)}[^{]*/gi, "$1,");
    tmpStr = tmpStr.split(',');
    tmpStr.pop();
    $.each(tmpStr, function(i, v) {
      tpl = tpl.replace('{#'+v+'}',eval(v));
    });
    return tpl;
  };

  $v_scan = function(){
    var args = $A(arguments);
    var tmpStr = args[0];
    var i = 0;
    args.shift();
    while(/%s/.test(tmpStr)){
      tmpStr = tmpStr.replace(/%s/, args[i]);
      i++;
    };
    return tmpStr;
  };

  $dir = function(url){
    setTimeout(function(){
      window.location.href = url;
    },0)
  };
  
  $open = function(url){
    setTimeout(function(){
      window.open(url);
    },0)
  };
  
  //cookie expiration
  $COOKIE_EXPIRES = new Date();
  $COOKIE_EXPIRES.setTime($COOKIE_EXPIRES.getTime() + 365 * (24 * 60 * 60 * 1000)); //+1 year
  $COOKIE_EXPIRES_NOW = new Date();
  $COOKIE_EXPIRES_NOW.setTime($COOKIE_EXPIRES.getTime() - 365 * (24 * 60 * 60 * 1000)); //-1 year
  //Sets a Cookie with the given name and value.
  _setCookie = function(name, value, expires, path, domain, secure) {
    var path = path || '/';
    var expires = expires || $COOKIE_EXPIRES;
    document.cookie = name + "=" + escape(value) + ((expires) ? "; expires=" + expires.toGMTString() : "") + ((path) ? "; path=" + path : "") + ((domain) ? "; domain=" + domain : "") +  ((secure) ? "; secure" : "");
  };
  //set cookie
  $setCookie = function(name, value){
    _setCookie(name, value);
    var cookies = $getCookie('CP');
    cookies = cookies ? cookies.split('|') : [];
    
    var indexOf = -1;
    for (var i = 0; i < cookies.length; i++){
      if (cookies[i]==name){
        indexOf = i;
        break;
      }
    }
    
    if(indexOf<0){
      cookies.push(name);
    };
    
    _setCookie('CP',cookies.join('|'));
  };
  //Gets the value of the specified cookie.
  $getCookie = function(name) {
    var dc = document.cookie;
    var prefix = name + "=";
    var begin = dc.indexOf("; " + prefix);
    if (begin == -1) {
      begin = dc.indexOf(prefix);
      if (begin != 0) return null;
    } else {
      begin += 2;
    };
    var end = document.cookie.indexOf(";", begin);
    if (end == -1) {
      end = dc.length;
    };
    return unescape(dc.substring(begin + prefix.length, end));
  };
  //Deletes the specified cookie.
  $deleteCookie = function(name, path, domain) {
    var path = path || '/';
    if($getCookie(name)){
      document.cookie = name + "=undefined" + ((path) ? "; path=" + path : "") + ((domain) ? "; domain=" + domain : "") + "; expires=" + $COOKIE_EXPIRES_NOW.toGMTString();
    }
  };
  
  //clear cookies
  $clearTempCookies = function(){
    var cookies = $getCookie('CP');
    if(!cookies) { return };
    cookies = cookies.split('|');
    for(var i = 0; i < cookies.length; i++){
      $deleteCookie(cookies[i])
    }
    $deleteCookie('CP');
  };
  
//  _setCookie('a','123');
//  $setCookie('b','aaa');
//  alert($getCookie('a'))
//  alert($getCookie('b'))
//  $clearTempCookies();
//  alert($getCookie('a'))
//  alert($getCookie('b'))

  $t2h = function(str){
    return str.replace(/&gt;/g, '>').replace(/&lt;/g, '<');
  };
  
  $h2t = function(str){
    return str.replace(/>/g, '&gt;').replace(/</g, '&lt;');
  };
  
  $T = function(t){
    var ta = $('#SYSTRAC');
    ta.html(ta.html()+t+'\n');
  };
  
  $$T = function(t){
    var ta = $('#SYSTRAC');
    ta.html(t);
  };

  $fastloop = function(array, process, caller){
    var iterations = Math.floor(array.length / 8); 
    var leftover = array.length % 8; 
    var i = 0;  
 
    if (leftover > 0){     
      do {         
        process(array[i++], i-1, caller);
      } while (--leftover > 0); 
    }  
    do {     
    process(array[i++], i-1, caller);
      process(array[i++], i-1, caller);
      process(array[i++], i-1, caller);
      process(array[i++], i-1, caller);
      process(array[i++], i-1, caller);
      process(array[i++], i-1, caller);
      process(array[i++], i-1, caller);
      process(array[i++], i-1, caller);
    } while (--iterations > 0);
  }

  $capf = function(str, splitter){
    if(!str)return '';
    var splitter = splitter ? splitter : ' ';
    str = str.toString();
    str = str.split(splitter);
    var ns = [];
    $(str).each(function(i, o){
      var s = o.split('');
      var s1 = s[0].toUpperCase();
      s.shift();
      var s2 = [s1].concat(s);
      ns.push(s2.join('')); 
    })

    return ns.join(' ');
  }

  $p2s = function(str){
    var tmp = str.split('');
    var len = tmp.length;
    var count = 0;
    var s = [];
    for(var i=0; i<len; i++){
      if (/[A-Z]/.test(tmp[i]) == true){
        count++;
        if(count>1){
          s.push(' '+tmp[i]);
        }else{
          s.push(tmp[i]);
        }
      }else{
        s.push(tmp[i]);
      }
    }
    str = s.join('');
    return str;
  }

  $s2p = function(str){
    str = !str ? '' : str.replace(/\s/g,'');
    return str;
  }

  $param = function(){
    var str = window.location.href;
    var h = {};
    str = str.split('?');
    str = str.length > 1 ? str[1] : '';
    str = str.split('&');
    for(var i=0, j=str.length; i<j; i++){
      var pair = str[i].split('=');
      h[pair[0]] = pair[1];
    }
    return h;
  }
  $PARAM = $param();

  $RAND = function(){return Math.random()*999999999;}

  $number = function(str){
    if(typeof str == 'undefined' || typeof str == 'string'){
      str = '0';
    }
    if(parseInt(str)<0){
      return 0-parseInt(str.replace(/[^0-9\.]/ig, ''));
    }else{
      return parseInt(str.replace(/[^0-9\.]/ig, ''));
    }
  }
  
  $unique = function(array){
    var o = {}, r = [];
    var lp = function(n){
      if(!n)return
      o[n] = n;
    }
    $fastloop(array, lp);
    for(p in o) r.push(o[p]);
    return r;
  }

  $validate_number = function(input, evt, callback){
    var input = $(input);
    var val = input.val();
    var key = evt.keyCode;
    if( key == 16 ){
      input.attr('shifting', 'true');
      evt.preventDefault();
      var unshift = function(evt){
        if(evt.keyCode == 16){
          $(this).attr('shifting', 'false').unbind('keyup', unshift);
        }
      }
      input.bind('keyup', unshift);
    }else{
      if( key == 37 || key == 39 || key == 46 || key == 8 || key == 9 || ( key >= 96 && key <= 105 ) ){

      }else if( /\d/.test(String.fromCharCode(key)) == true ){
        if(input.attr('shifting') == 'true'){
          evt.preventDefault();
        }
      }else{
        evt.preventDefault();
      }
    }
    if(typeof callback != 'undefined'){
      var keyup = function(){ callback(); input.unbind('keyup', keyup); }
      input.bind('keyup', keyup);
    }
  }

  _SECOND_  = 1;
  _MINUTE_  = 60;
  _HOUR_    = 60*60;
  _DAY_     = 60*60*24;
  _WEEK_    = 60*60*24*7;
  _MONTH_   = 60*60*24*7*30;
  _YEAR_    = 60*60*24*7*30*365;
  
  $to_pretty = function(t){
    var tstr = t > 0 ? ' ago' : ' left';
    var t = Math.abs(t);
    var output = '';
    if(t==0){
      output = "just now";
    }else if(t>= _SECOND_ && t<_MINUTE_){
      output = parseInt(t/_SECOND_) + " seconds" + tstr;
    }else if(t>= _MINUTE_ && t<_HOUR_){
      output = parseInt(t/_MINUTE_) + " minutes" + tstr;
    }else if(t>= _HOUR_ && t<_DAY_){
      output = parseInt(t/_HOUR_) + " hours" + tstr;
    }else if(t>=_DAY_ && t<_WEEK_){
      output = parseInt(t/_DAY_) + " days" + tstr;
    }else if(t>=_WEEK_ && t<_MONTH_){
      output = parseInt(t/_WEEK_) + " weeks" + tstr;
    }else if(t>=_MONTH_ && t<_YEAR_){
      output = parseInt(t/_MONTH_) + " months" + tstr;
    }else if(t>=_YEAR_ && t<_YEAR_*10){
      output = parseInt(t/_YEAR_) + " years" + tstr;
    };
    return output.replace(/^(1\s[a-zA-Z]+)s/, '$1');
  };

  sql = function(field){
    var query = {}
    query.field = field.replace(/\s/g,''); 
    query.table = {};
    query.condition = '';
    query.result = [];
    
    query.from = function(table){
      query.table = table; 
      if(query.field != '*'){
        var statement = [];
        $(query.field.split(',')).each(function(i,f){ statement.push( f + ':' + 'el[\'' + f + '\']') });
        statement = '$.map(query.table, function(el, index){ return {' + statement.join(',') + '}})';
        
        query.table = eval(statement);
      }
      query.result = query.table;
      return query;
    }
    query.where = function(condition){
      condition = condition.replace(/OR/g, '||');
      condition = condition.replace(/AND/g, '&&');
      condition = condition.replace(/(\s|(".*?"))/g, '$2');
      condition = condition.replace(/(\b[a-zA-Z_]+\b)([<>=!]{1,2})/g, 'el[\'$1\']$2');
      
      query.condition = condition;
      var statement = '$.map(query.table, function(el, index){if('+query.condition+'){ return el }})'; //alert(statement)
      
      query.table = eval(statement);
      query.result = query.table;
      return query;
    }
    query.orderby = function(condition){
      //multiple fields sorting is not supported this time
      var condition = condition.replace(/\s+/g, ' ');
          condition = condition.split(',')[0];
          condition = condition.split(' ');
      var field = condition[0];
      var order = condition[1].toUpperCase();
      
      if(order == 'DESC'){
        query.table = $qsort(query.table, field).reverse();
      }else if(order == 'ASC'){
        query.table = $qsort(query.table, field);
      }
      query.result = query.table;
      return query;
    }
    return query;
  }
  
  select = function(field){
    return sql(field);
  }

  $qsort = function(arr, key){
    if (arr.length <= 1) { return arr; }
    var pivotIndex = Math.floor(arr.length / 2);
    var pivot = arr.splice(pivotIndex, 1)[0];
    var left = [];
    var right = [];
    for (var i = 0; i < arr.length; i++){
      if ($if_make_date(arr[i][key]) < $if_make_date(pivot[key])) {
        left.push(arr[i]);
      } else {
        right.push(arr[i]);
      }
    }
    return $qsort(left, key).concat(pivot, $qsort(right, key));
  }
  $if_make_date = function(str){
    /*
    if(/\d{4}\-\d{2}\-\d{2}\s\d{2}\:\d{2}/.test(str)){
      var d = str.split(' ');
      d = d[0].split('-').concat(d[1].split(':'));
      var year = d[0];
      var month = d[1]-1;
      var day = d[2];
      var hour = d[3];
      var minute = d[4];
      return new Date(year, month, day, hour, minute).getTime();
    }else{
      return str
    }
    */
    return str;
  }

  $bookmark = function(url) {
    var url = url;
    if(window.sidebar) {
      window.sidebar.addPanel("", url, "");
  }else if( window.external ){
      window.external.AddFavorite( url, "");
    }else if(window.opera && window.print) { 
      return true;
    }
  } 

  ZXUITESTER_TRIG_ONCE = 0;
  top.ZXUITESTER_CASE = [];
  $install_zxuitester = function(){
    var $$ = top.$;
    $('a,div,span,button,input,textarea,body').click(function(event){
      if( event.target == ZXUITESTER_TRIG_ONCE ){
        return
      }else{
        ZXUITESTER_TRIG_ONCE = event.target;
        var el = event.currentTarget;
        var action = {
          instance: el,
          tag: el.tagName,
          id: el.id,
          name: el.name,
          url: window.location.href,
          event: event.type,
          replay: $(el).attr('replay')
        }
        if(action.replay == 1){
          $(el).attr('replay', undefined);
        }else{
          $$('<div>' + $dump(action) + '</div>').appendTo($$('#zxuitester-q')); 
          top.ZXUITESTER_CASE.push(action); 
        }
      }
    });
  }

  $replay_zxuitester = function(test_case){
    var $$ = top.$;
    var test_case = top.ZXUITESTER_CASE;
    var test_case_length = test_case.length;
    var speed = 1;
    var timeout = 1000*speed;
    
    $(test_case).each(function(i, c){
      setTimeout(function(){
        $(c.instance).attr('replay', 1).trigger(c.event);
        $$('<div>action[' + i + '] executed</div>').appendTo($$('#zxuitester-q'));
      }, i * timeout );
    })
  }

  $dump = function(h){
    var t = [];
    for(var p in h){
      t.push(p+':'+h[p])
    }
    return '{' + t.join(',') + '}';
  }

  $enable_img_precache = function(){
    if(typeof IMG_PRECACHE != 'undefined'){
      alert('Image Precache is already enabled.');
      return;
    }
    var img_precache_container = $('<div id="img-precache-container"></div>').appendTo($('body')).css({
      position: 'absolute',
      top: -9999,
      left: -9999
    })
    IMG_PRECACHE_CONTAINER = img_precache_container;
    IMG_PRECACHE = {};
  }
  
  $add_img_precache = function(src){
    try{
      var img = $('<img src="'+src+'" />').appendTo(IMG_PRECACHE_CONTAINER);
      IMG_PRECACHE[$hyphen_case(src)] = img;
      return img;
    }catch(e){
      alert('Image Precache is not enabled.');
    }
  }

  $get_img_precache = function(src){
    return IMG_PRECACHE[$hyphen_case(src)];
  }

  $hyphen_case = function(str){
    if(/^\/.*/.test(str)){
      return str.replace(/^\//,'').replace(/[\/\.]/g,'-');
    }else{
      return str.replace(/(http\:\/\/)?[^\/]*\//, '').replace(/[\/\.]/g,'-');
    }
  }

  $def = function(v){
    return typeof(v) == 'undefined' ? false : true;
  }

  jQuery.fn.extend({
    fval: function( value ){
      return this.each(function(i){
        var self = jQuery(this);
        var tagName = self.prop('tagName');
        if(tagName == 'SELECT'){
          var match = 0;
          self.find('option').each(function(){
            var text = $(this).text();
            if(text == value){
              match++;
            }
          })
          if(match == 0){
            $('<option>'+value+'</option>').appendTo(self);
          }
        }
        self.val(value);
      })
    }
  })

  
  $getScrollbarWidth = function() {
    var scrollbarWidth = 0;
    if ( !scrollbarWidth ) {
      if ( $.browser.msie ) {
        var $textarea1 = $('<textarea cols="10" rows="2"></textarea>')
            .css({ position: 'absolute', top: -1000, left: -1000 }).appendTo('body'),
          $textarea2 = $('<textarea cols="10" rows="2" style="overflow: hidden;"></textarea>')
            .css({ position: 'absolute', top: -1000, left: -1000 }).appendTo('body');
        scrollbarWidth = $textarea1.width() - $textarea2.width();
        $textarea1.add($textarea2).remove();
      } else {
        var $div = $('<div />')
          .css({ width: 100, height: 100, overflow: 'auto', position: 'absolute', top: -1000, left: -1000 })
          .prependTo('body').append('<div />').find('div')
            .css({ width: '100%', height: 200 });
        scrollbarWidth = 100 - $div.width();
        $div.parent().remove();
      }
    }
    return scrollbarWidth + 1;
  };





