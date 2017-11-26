"use strict";
/*
 Copyright (c) 2010 Rolando González Chévere <rolosworld@gmail.com>
 
 This file is part of Meta.
 
 Meta is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License version 3
 as published by the Free Software Foundation.
 
 Meta is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with Meta.  If not, see <http://www.gnu.org/licenses/>.
*/
(function(global)
 {
   var undefined,
       isIE=!!global.ActiveXObject,
       info={
         name:"Meta",
         author:"Rolando González, rolosworld@gmail.com",
         version:"2016.06.22" // Year.Month.Day
       };

/*
 Copyright (c) 2010 Rolando González Chévere <rolosworld@gmail.com>
 
 This file is part of Meta.
 
 Meta is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License version 3
 as published by the Free Software Foundation.
 
 Meta is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with Meta.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
   <function name="Meta" type="Meta">
   <param name="[o]" type="mixed">Object to use with the lib</param>
   <desc>
   Creates a new object or return an object to manage the given one
   </desc>
   <test>
   <![CDATA[
   var a=Meta();
   return 'extend' in a && '$super' in a;
   ]]>
   </test>
   </function>
*/
var Meta=global.Meta=function()
{
  // Get outside Meta
  function ateM(){return Meta;};
  
  /**
   * Try to guess pre-existent extensions or
   * If the Object is Meta, it creates a new Meta
   * and extend it to the Object given.
   * 
   * o - Object to expand
   */
  function getParent(o)
  {
    var a=Meta(),
    b=Meta.its(o,'function')?o:o.constructor,
    c=a.constructor,i;
    
    if(b)
      c.prototype=new b();
    
    for(i in o)
      if(o.hasOwnProperty(i))
        c.prototype[i]=o[i];
    
    return c;
  };

  /**
   * Create custom object
   */
  function getMe(o)
  {
    var parent;

    if(o!==undefined)
      parent=getParent(o);
    
    /**
       <class name="Meta">
       <desc>Meta object</desc>
     */
    function Meta(){
      // Constructor fix
      this.constructor=Meta;

      /**
       <method name="$new" type="this">
       <desc>Create a new object of the same type</desc>
       <test>
       <![CDATA[
       var a=Meta({a:1}),b;
       b=a.$new();
       return b.a==a.a;
       ]]>
       </test>
       </method>
       */
      this.$new=function(){return new Meta()};

      /**
       <public name="info" type="object">Stores information of the library</public>
       */
      this.info=info; // info is defined on meta.head.js

      /**
       <method name="extend" type="this">
       <param name="o" type="mixed">Function or Object that has the extensions</param>
       <param name="[conf]" type="object">Custom configuration for the extension {exclude:[string,...],params:[]}</param>
       <desc>Extends the Meta constructor</desc>
       <test>
       <![CDATA[
       var a=Meta();
       a.extend({o:function(q){return q;}});
       return 'o' in a && a.o(1)==1;
       ]]>
       </test>
       </method>
       */
      this.extend=function(o,conf)
      {
        var a=['$super','extend','info'];
        conf=conf||{};
        conf.exclude=conf.exclude?conf.exclude.concat(a):a;
        return ateM().inherit(this,o,conf);
      };
    };

    if(parent)
      Meta.prototype=new parent();

    /**
     <method name="$super" type="mixed">
     <param name="a" type="string">Name of the super method</param>
     <desc>Use the asked super method</desc>
     <test>
     <![CDATA[
     var a=Meta({o:function(q){return q;}}),t1,t2,t3,t4;
     t1='o' in a;
     t2=a.o(1)==1;
     
     a.extend({o:function(q){return q+1;}});
     
     t3=a.o(1)==2;
     t4=a.$super('o',1)==1;
     return t1 && t2 && t3 && t4;
     ]]>
     </test>
     </method>
     */
    Meta.prototype.$super=function(a)
    {
      if(!parent)
        return undefined;

      var f,
          g=this.$super, // cache original this.$super
          p=parent.prototype;

      /*
        Map the "parent.prototype.$super" method, to "this.$super",
        when the "parent" method is called, it's called as "this"
        if the method called uses "this.$super", it will expect the "parent.$super"
        thats why it has to be mapped.
       */
      this.$super=p.$super; // map "this.$super" to the "parent.$super"
      f=p[a].apply(this,ateM().args2array(arguments,1));
      this.$super=g; // restore this.$super
      return f;
    };
    
    return Meta;
  };
  /** </class> */

  /**
   * Initialize the object
   * object o - Object to expand
   * return Generated object
   */
  return function(o)
  {
    return new (getMe(o))();
  };
}();

/**
   <global name="Meta.extensions" type="object">Available extension list</global>
 */
Meta.extensions={};
/*
 Copyright (c) 2010 Rolando González Chévere <rolosworld@gmail.com>
 
 This file is part of Meta.
 
 Meta is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License version 3
 as published by the Free Software Foundation.
 
 Meta is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with Meta.  If not, see <http://www.gnu.org/licenses/>.
*/

// *** Crockford invented this method ***
// http://javascript.crockford.com/
/**
 <function name="Meta.son" type="object">
 <param name="a" type="object">Object</param>
 <desc>Clone of the object</desc>
 <test>
 <![CDATA[
 var a={a:1};
 var b=Meta.son(a);
 return 'a' in b;
 ]]>
 </test>
 </function>
 */
Meta.son=function(a)
{
  function b(){};
  b.prototype=a;
  b.prototype.constructor=b;
  return new b();
};


/**
 <function name="Meta.extend" type="object">
 <param name="a" type="object">Object to be expanded.</param>
 <param name="b" type="object">Object that will be used to expand.</param>
 <param name="[c]" type="array">String array of properties to excluce.</param>
 <desc>Extend a given object with another object.</desc>
 <test>
 <![CDATA[
 var a={a:1};
 var b=Meta.extend(a,{b:1});
 return 'a' in b && 'b' in b;
 ]]>
 </test>
 </function>
 */
Meta.extend=function(a,b,c)
{
  c=c||[];
  // import the methods
  for(var i in b)
    // copy pointers of methods to local variables
    if(i!='constructor'&&a!=b[i]&&Meta.indexOf(c,i)<0)
      a[i]=b[i];
  return a;
};

/**
 <function name="Meta.inherit" type="object">
 <param name="a" type="object">Object that will inherit</param>
 <param name="b" type="object">Object that will be used inherit</param>
 <param name="[c]" type="object">Custom configuration for the extension {exclude:[string,...],params:[]}</param>
 <desc>Inherits a given object into another object</desc>
 <test>
 <![CDATA[
 var a=Meta();
 Meta.inherit(a,{o:function(q){return q;}});
 return 'o' in a && a.o(1)==1;
 ]]>
 </test>
 </function>
 */
Meta.inherit=function(a,b,c)
{
  var p=[],
      e=[],
      o={},d;

  if(c)
  {
    e=c.exclude||e;
    p=c.params||p;
  }

  // if its a function, initialize it to get the object
  // we need the object to set pointers to the functions instead of copy them
  if(typeof b == 'function')
  {
    b.apply(o,p);
    b=o;
  }

  d=a.constructor;
  Meta.extend(d?d.prototype:a,b,e);
  return a;
};


/**
 <function name="Meta.each" type="bool">
 <param name="a" type="array">Array to loop</param>
 <param name="f" type="function">Callback function, its called with this as the value and can accept index and value attributes, function(value,index)</param>
 <param name="[m]" type="bool">Method flag, default is numerical</param>
 <desc>
   Execute given function on each array value, if the call returns false it breaks the loop.
   Bool true if it doesn't break, else false
 </desc>
 <test>
 <![CDATA[
 var a=[1,1],t=[];
 Meta.each(a,function(v,i){t[i]=v==1;});
 return t[0] && t[1];
 ]]>
 </test>
 </function>
 */
Meta.each=function(a,f,m)
{
  var i,j;
  if(!m)
  {
    for(i=0,j=a.length;i<j;i++)
      if(f.call(a,a[i],i)===false)
        return false;
  }
  else
  {
    for(i in a)
      if(f.call(a,a[i],i)===false)
        return false;
  }
  return true;
};


/**
 <function name="Meta.its" type="string">
 <param name="o" type="Object"></param>
 <param name="[a]" type="string">Type you want to compare</param>
 <desc>
   Try to get the type of data of the variable as a string.
   Returns the data type.
   Posible types:<ul>
   <li>string</li>
   <li>number</li>
   <li>function</li>
   <li>object</li>
   <li>undefined</li>
   <li>null</li>
   <li>nan</li>
   <li>infinite</li>
   <li>-infinite</li>
   <li>boolean</li>
   <li>element</li>
   <li>array</li>
   <li>date</li>
   <li>regexp</li></ul>
 </desc>
 <test>
 <![CDATA[
   var a,b=function(){},c=new b();
   return Meta.its('','string') &&
   Meta.its(0,'number') &&
   Meta.its(b,'function') &&
   Meta.its({},'object') &&
   Meta.its(a,'undefined') &&
   Meta.its(null,'null') &&
   Meta.its(Number.NaN,'nan') &&
   Meta.its(Number.POSITIVE_INFINITY,'infinite') &&
   Meta.its(Number.NEGATIVE_INFINITY,'-infinite') &&
   Meta.its(false,'boolean') &&
   Meta.its(document.body,'element') &&
   Meta.its([],'array') &&
   Meta.its(c,'object') &&
   Meta.its(new Date(),'date') &&
   Meta.its(/a/,'regexp') &&

   Meta.its('')=='string' &&
   Meta.its(0)=='number' &&
   Meta.its(b)=='function' &&
   Meta.its({})=='object' &&
   Meta.its(a)=='undefined' &&
   Meta.its(null)=='null' &&
   Meta.its(Number.NaN)=='nan' &&
   Meta.its(Number.POSITIVE_INFINITY)=='infinite' &&
   Meta.its(Number.NEGATIVE_INFINITY)=='-infinite' &&
   Meta.its(false)=='boolean' &&
   Meta.its(document.body)=='element' &&
   Meta.its([])=='array' &&
   Meta.its(c)=='object' &&
   Meta.its(new Date())=='date' &&
   Meta.its(/a/)=='regexp';
   ]]>
 </test>
 </function>
 */
Meta.its=function(o,a)
{
  var t=typeof o;
  if(a==t)
    return true;

  if(t=='object'||t=='function')
  {
    if(!o)
      t='null';

    else if(o.nodeType)
      t='element';

    //http://thinkweb2.com/projects/prototype/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
    else
      t=Object.prototype.toString.call(o).match(/^\[object\s(.*)\]$/)[1].toLowerCase();
  }
  else if(t=='number')
  {
    if(isNaN(o))
      t='nan';
    else if(!isFinite(o))
      t=o>0?'infinite':'-infinite';
  }

  if(a)
    return a==t;

  return t;
};

/**
 <function name="Meta.obj2array" type="array">
 <param name="a" type="object">Array to loop</param>
 <param name="c" type="bool">Flag to switch types of loop</param>
 <desc>Conver an object to an array</desc>
 <test>
 <![CDATA[
   var a={0:0,1:1,length:1},
   b=Meta.obj2array(a),t1,t2;
   t1=b.length==1;
   t2=b[0]==0;
   b=Meta.obj2array(a,1);
   return t1 && t2 && b.length==3 &&
     b[0]==0 &&
     b[1]==1 &&
     b[2]==1;
   ]]>
 </test>
 </function>
 */
Meta.args2array=function(a,b)
{
  if(!isIE)
    return Array.prototype.slice.call(a,b);
  else
  {
    var c=[];
    Meta.each(a,function(v,i){if(i>=b)c.push(v);});
    return c;
  }
};
Meta.obj2array=function(a,c)
{
  if(!c&&!isIE)
    return Array.prototype.slice.call(a);
  else
  {
    var b=[];
    Meta.each(a,function(v){b.push(v);},c);
    return b;
  }
};

/**
 <function name="Meta.indexOf" type="integer">
 <param name="a" type="array">Array to search</param>
 <param name="b" type="mixed">Value to search</param>
 <param name="[c]" type="bool">Not Strict comparison</param>
 <desc>
   Search an array for a given value index. Can do not strict comparison.
   -1 if not found else 0...
 </desc>
 <test>
 <![CDATA[
   var a=[0,1];
   return Meta.indexOf(a,2)<0 &&
          Meta.indexOf(a,1)==1 &&
          Meta.indexOf(a,"1")<0 &&
          Meta.indexOf(a,2,1)<0 &&
          Meta.indexOf(a,1,1)==1;
 ]]>
 </test>
 </function>
 */
Meta.indexOf=function(a,b,c)
{
  var i=a.length;
  while(i--)
    if(!c)
    {
      if(a[i] === b)
        break;
    }
    else if(a[i] == b)
      break;
  return i;
};

/**
 <function name="Meta.unique" type="array">
 <param name="a" type="array"></param>
 <desc>Remove duplicate values from an array</desc>
 <test>
 <![CDATA[
   var a=[0,0,1,1],
   b=Meta.unique(a);
   return b.length==2 && b[0]==0 && b[1]==1;
 ]]>
 </test>
 </function>
 */
Meta.unique=function(a)
{
  var b=[],i,k;
  for(i=0,k=a.length;i<k;i++)
    if(Meta.indexOf(b,a[i])<0)
      b.push(a[i]);
  return b;
};

/**
 <function name="Meta.has" type="bool">
 <param name="a" type="object"></param>
 <param name="b" type="string"></param>
 <desc>Test if the object has the given property. If the property has null as value, it will be considered as not defined. You can test global variables with Meta.has(window,'document') for example</desc>
 <test>
 <![CDATA[
   var a={a:1};
   return Meta.has(a,'a') && !Meta.has(a,'b');
 ]]>
 </test>
 </function>
 */
Meta.has=function(a,b)
{
  return a&&a[b]!==undefined&&a[b]!==null;
};

/**
 <function name="Meta.genProperties" type="void">
 <param name="d" type="string">CSV of the names to use</param>
 <param name="c" type="function">Property function filler</param>
 <param name="o" type="object">Object where to implement the methods</param>
 <desc>Apply multiple properties to an object, using a function that generates its value.</desc>
 <test>
 <![CDATA[
 var a={};
 Meta.genProperties('a,b',function(a){return a;},a);
 return 'a' in a && 'b' in a;
 ]]>
 </test>
 </function>
 */
Meta.genProperties=function(d,c,o)
{
  for(var i=0,a=d.split(','),b=a[0];i<a.length;b=a[++i])
    o[b]=c(b);
};

/**
 <function name="Meta.toggle" type="function">
 <param name="a" type="function">On Callback</param>
 <param name="b" type="function">Off Callback</param>
 <param name="[c]" type="bool">Sets the default status. Default is Off. true==On, false==Off</param>
 <desc>Returns a function that alternates calling the given callbacks.</desc>
 <test>
 <![CDATA[
 var a=Meta.toggle(function(){return 0;},function(){return 1;}),t1;
 t1=a()==0 && a()==1;

 a=Meta.toggle(function(){return 0;},function(){return 1;},1);
 return t1 && a()==1 && a()==0;
 ]]>
 </test>
 </function>
 */
Meta.toggle=function(a,b,c)
{
  c=c||false;
  return function()
  {
    var d=(c=!c)?a:b;
    return d.apply(this,arguments);
  };
};

/**
 <function name="Meta.getVal" type="function">
 <param name="a" type="string">String to parse into JS data</param>
 <param name="[b]" type="object">context</param>
 <desc>Returns the value from the parsed string.</desc>
 <test>
 <![CDATA[
 var a=Meta.getVal,b={a:{b:{c:1,d:0,e:function(){return 'e';}}}};
 return a('a.b.c',b)===1 && a('a.b.d',b)===0 && a('a.b.e',b)()==='e' && a('a.c',b)===undefined && a('a.c[-]',b)===undefined;
 ]]>
 </test>
 </function>
 */
Meta.getVal=function(a,b)
{
  a=a.split('.');
  var c=b||window,d;
  while((d=a.shift())!==undefined){
      c=c[d];
      if(!c)break;
  }
  return c;
};

/**
 <function name="Meta.hashToURI" type="function">
 <param name="a" type="hash">Hash</param>
 <desc>Return the URI encoded version of the hash</desc>
 <test>
 <![CDATA[
 var a=Meta.hashToURI,b={a:1,b:2};
 return a(b)==='a=1&b=2';
 ]]>
 </test>
 </function>
 */
Meta.hashToURI=function(a)
{
  var d=[],v;
  Meta.each(Object.keys(a),function(k){
    v=a[k];
    d.push(encodeURIComponent(k,1)+'='+encodeURIComponent((v===null||v===undefined)?'':v,1));
  });
  return d.join('&');
};
/*
 Copyright (c) 2010 Rolando González Chévere <rolosworld@gmail.com>
 
 This file is part of Meta.
 
 Meta is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License version 3
 as published by the Free Software Foundation.
 
 Meta is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with Meta.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
   <function name="Meta.ajax" type="object">
   <param name="conf" type="object">
Hash with the following items:
   url
     required
     string URL
   callback
     optional
     Array of functions or a single function, if its an array,the array index is the state callback
   data
     optional
     string data
   headers
     optional
     hash: {header_type:header_value,...}
   method
     optional
     Request method, either "POST" or "GET". Default is "GET"
</param>
   <desc>
   Ajax function. Returns the XMLHttpRequest object

   Ready States:
     0 uninitialized
     1 loading
     2 loaded
     3 interactive
     4 complete

   Important Status Codes:
     200 OK
     304 Not Modified
     400 Bad Request
     401 Unauthorized
     403 Forbidden
     404 Not Found
     408 Request Timeout
     500 Internal Server Error
     503 Service Unavailable

     You can pass a single callback, which will be called when the ReadyState is 4.
     Or you can pass an array of callbacks in which each callback will be called by using the ReadyState as the index of the array.

     Pass to the callbacks an object with the given methods:
      status - Returns the returned status
      text   - Returns the responseText
      json   - Returns the evaluated responseText
      xml    - Returns the responseXML
   </desc>
   <test>
   <![CDATA[
   // States callbacks
   var t=[],callbacks=[
       function(a){t.push(true);}, // Uninitialized
       function(a){t.push(true);}, // Loading
       function(a){t.push(true);}, // Loaded
       function(a){t.push(true);}, // Interactive
       function(a){t.push(parseInt(a.text(),10)==1);}  // Complete
   ];

   Meta.ajax({url:'ajax_test.txt',callbacks:function(a){t.push(parseInt(a.text(),10)==1);}});
   Meta.ajax({url:'ajax_test.txt',callbacks:callbacks});

   Meta.ajax({url:'ajax_test.txt',callbacks:function(b){t.push(parseInt(b.text(),10)==1);}});
   Meta.ajax({url:'ajax_test.txt',callbacks:callbacks});

   for(var i=0; i < t.length; i++)
     if(!t[i])
       return false;

   return true;
   ]]>
   </test>
   </function>
*/
Meta.ajax=function(conf)
{
  var method,headers;
  var callbacks=conf['callbacks'],
  async=true; // false is deprecated
  //async=conf['async']===undefined?Meta.ajax.async:conf.async;

  method=conf['method']?conf.method:method;
  headers=conf['headers']?conf.headers:headers;

  var http=isIE
    ? new ActiveXObject("Microsoft.XMLHTTP")
    : new XMLHttpRequest(),

  h={
    status:function(){return http.status;},
      text:function(){return http.responseText;},
      json:function(){return JSON.parse(http.responseText);},
       xml:function(){return http.responseXML;}
  },
  cbIsArray=Meta.its(callbacks,'array');

  http.open(method||'GET',conf.url, async);

  function onReady()
  {
    if(!callbacks)return;
    var s=http.readyState;
    if(!cbIsArray && s==4)callbacks.call(h,h);
    else if(callbacks[s])callbacks[s].call(h,h);
  };

  if(async)
    http.onreadystatechange=onReady;

  if(headers)
  {
    for(var i in headers)
    {
      http.setRequestHeader(i,headers[i]);
    }
  }
  //http.setRequestHeader("Content-length", post.length);
  http.send(conf['data']);

  if(!async)
    onReady();

  return http;
};

/** <global name="Meta.ajax.async" type="bool">Default async to use</global> */
Meta.ajax.async=true;
/*
 Copyright (c) 2010 Rolando González Chévere <rolosworld@gmail.com>
 
 This file is part of Meta.
 
 Meta is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License version 3
 as published by the Free Software Foundation.
 
 Meta is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with Meta.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
   <class name="Meta.core">
   <inherit>Meta</inherit>
   <desc>Core extension</desc>
 */
Meta.core=Meta().extend({
  /**
   <public name="_" type="array">Internal variable where the data is stored.</public>
   */
  _:null,

  /**
   <method name="$" type="Meta.core">
   <desc>Returns a new clone of the object. Set the passed value to the object if any is given.</desc>
   <param name="a" type="mixed">Values to set</param>
   <test>
   <![CDATA[
   var a=Meta.core.$();
   return '$' in a;
   ]]>
   </test>
   </method>
   */
  $:function(a)
  {
    return this.$new().set(a);
  },

  /**
   <method name="its" type="mixed">
   <param name="[a]" type="string">Type to compare with</param>
   <desc>Returns the data type of the object or bool</desc>
   <test>
   <![CDATA[
   var a=Meta.core.$();
   a.set("abc");
   return a.its()=='string' && a.its('string');
   ]]>
   </test>
   </method>
   */
  its:function(a)
  {
    return Meta.its(this._,a);
  },

  /**
   <method name="get" type="mixed">
   <desc>Get the value</desc>
   <test>
   <![CDATA[
   var a=Meta.core.$();
   return a.get()==null;
   ]]>
   </test>
   </method>
   */
  get:function()
  {
    return this._;
  },

  /**
   <method name="set" type="this">
   <param name="a" type="mixed">Value to set</param>
   <desc>Set the value</desc>
   <test>
   <![CDATA[
   var a=Meta.core.$();
   a.set(1);
   return a.get()==1;
   ]]>
   </test>
   </method>
   */
  set:function(a)
  {
    this._=a;
    return this;
  },

  /**
   <method name="wrap" type="array">
   <param name="b" type="string">Method name</param>
   <param name="c" type="array">arguments</param>
   <desc>
   Wrap a method to one owned by the data, executes it and returns the value.
   </desc>
   <test>
   <![CDATA[
   var a=Meta.core.$();
   a.set("abc");
   return a.wrap('charAt',[1])=='b';
   ]]>
   </test>
   </method>
   */
  wrap:function(b,c)
  {
    return this._[b].apply(this._,c);
  },

  /**
   <method name="copy" type="this">
   <desc>Get a copy of the current Meta</desc>
   <test>
   <![CDATA[
   var a=Meta.core.$(),b;
   a.set("abc");
   b=a.copy();
   return b.get()=='abc';
   ]]>
   </test>
   </method>
   */
  copy:function()
  {
    return this.$().set(this.get());
  },

  /**
   <method name="callback" type="function">
   <desc>Returna a function that executes the given method with the given arguments from the current object. It returns whatever the method returns.</desc>
   <param name="a" type="string">Method name</param>
   <param name="[...]" type="mixed">Arguments to be sent when the callback is called</param>
   <test>
   <![CDATA[
   var a=Meta.core.$(),b,t;
   b=a.callback("set","abc");
   t=a.get()==null;
   b();
   return t && a.get()=='abc';
   ]]>
   </test>
   </method>
   */
  callback:function(a)
  {
    var me=this,b=Meta.args2array(arguments,1);
    return function(){return me[a].apply(me,b);};
  },

  /**
   <method name="getMe" type="this">
   <desc>Returna this. This method purpose is to be used with the callback function to pass this object.</desc>
   <test>
   <![CDATA[
   var a=Meta.core.$(),b=a.getMe();
   b.set('abc');
   return a.get()=='abc';
   ]]>
   </test>
   </method>
   */
  getMe:function(){return this;}
  
});
/** </class> */
/*
 Copyright (c) 2017 Rolando González Chévere <rolosworld@gmail.com>
 
 This file is part of Meta.
 
 Meta is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License version 3
 as published by the Free Software Foundation.
 
 Meta is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with Meta.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
   <class name="Meta.queue">
   <desc>Class to fire a callback once a queue is done</desc>
   <inherit>Meta.core</inherit>
 */
Meta.queue=Meta(Meta.core).extend(
{
    cnt:null,

  /**
   <method name="increase" type="void">
   <desc>Increment the queue size</desc>
   </method>
   */
    increase: function(){
        this.cnt++;
    },

  /**
   <method name="decrease" type="void">
   <desc>Reduce the queue size and fire the callback if the size becomes zero</desc>
   </method>
   */
    decrease: function(){
        if (!--this.cnt) {
            this._();
        }
    },

  /**
   <method name="tryRun" type="void">
   <desc>Try running the callback</desc>
   </method>
   */
    tryRun: function(){
        if (!this.cnt) {
            this._();
        }
    }
});
/** </class> */
/*
 Copyright (c) 2010 Rolando González Chévere <rolosworld@gmail.com>
 
 This file is part of Meta.
 
 Meta is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License version 3
 as published by the Free Software Foundation.
 
 Meta is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with Meta.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
 <class name="Meta.string">
 <inherit>Meta.core</inherit>
 <desc>String extensions</desc>
*/
Meta.string=Meta(Meta.core).extend({
  _:'',

  /**
   <method name="$" type="Meta.string">
   <desc>Custom $, let it set a value.</desc>
   <param name="a" type="string">String to be managed</param>
   <test>
   <![CDATA[
     var a=Meta.string.$('foo'),t;
     t=a.get().length==3;
     a=Meta.string.$('');
     return t && a.get().length==0 && Meta.string.$().get().length==0;
   ]]>
   </test>
   </method>
   */
  $:function(a)
  {
    return this.$new().set(a||'');
  },

  /**
   <method name="set" type="this">
   <param name="a" type="mixed">Value to set. Tries to convert it to string.</param>
   <desc>Set the string</desc>
   <test>
   <![CDATA[
     return Meta.string.$().set('foo').get().length==3;
   ]]>
   </test>
   </method>
   */
  set:function(a)
  {
    return this.$super('set',''+a);
  },

  /**
   <method name="len" type="integer">
   <desc>Get the length of a string</desc>
   <test>
   <![CDATA[
     return Meta.string.$().set('foo').len()==3;
   ]]>
   </test>
   </method>
   */
  len:function()
  {
    return this.get().length;
  },

  /**
   <method name="dos2unix" type="this">
   <desc>Convert DOS format to Unix txt format</desc>
   <test>
   <![CDATA[
     return Meta.string.$("foo\r\n").dos2unix().get()=="foo\n";
   ]]>
   </test>
   </method>
   */
  dos2unix:function()
  {
    return this.replace(/\r\n|\r/g,"\n");
  },

  /**
   <method name="unix2dos" type="this">
   <desc>Convert Unix format to DOS txt format</desc>
   <test>
   <![CDATA[
     return Meta.string.$("foo\n").unix2dos().get()=="foo\r\n";
   ]]>
   </test>
   </method>
   */
  unix2dos:function()
  {
    return this.replace(/\n/g,"\r\n");
  },

  /**
   <method name="toCamelCase" type="string">
   <desc>Convert string to camel case format</desc>
   <param name="a" type="string">Delimiter</param>
   <test>
   <![CDATA[
     return Meta.string.$("foo-bar").toCamelCase('-')=="fooBar";
   ]]>
   </test>
   </method>
   */
  toCamelCase:function(a)
  {
    a=this.split(a);
    for(var i=1,j=a.length,k;i<j;i++)
    {
      k=a[i];
      a[i]=k.charAt(0).toUpperCase();
      a[i]+=k.substr(1);
    }

    return a.join('');
  },

  /**
   <method name="stripTags" type="this">
   <desc>Strip tags from string object</desc>
   <test>
   <![CDATA[
     return Meta.string.$("<b>foo</b>").stripTags().get()=="foo";
   ]]>
   </test>
   </method>
   */
  stripTags:function()
  {
    return this.replace(/<\/?[^>]+>/g,'');
  },

  /**
   <method name="escapeHTML" type="this">
   <desc>Tries to return an html friendly version of the string. Converts some special characters to their respective entities.</desc>
   <test>
   <![CDATA[
     return Meta.string.$("<b>&nbsp;foo</b>").escapeHTML().get()=="&lt;b&gt;&amp;nbsp;foo&lt;/b&gt;";
   ]]>
   </test>
   </method>
   */
  escapeHTML:function()
  {
    return this.
      replace(/&/g,'&amp;').
      replace(/</g,'&lt;').
      replace(/>/g,'&gt;').
      replace(/'/g,'&#39;').
      replace(/"/g,'&#34;');
  },

  /**
   <method name="unescapeHTML" type="this">
   <desc>
    Returns only the text content of the object. Converts the HTML entities into their respective characters.
    Uses HTML DOM, not compatible with XHTML.
   </desc>
   <test>
   <![CDATA[
    return Meta.string.$("&lt;b&gt;foo&lt;/b&gt;").unescapeHTML().get()=="<b>foo</b>";
   ]]>
   </test>
   </method>
   */
  unescapeHTML:function()
  {
    var div=document.createElement('div');
    div.innerHTML=this.stripTags().get(); // Not xhtml friendly
    return this.set(div.childNodes[0]?div.childNodes[0].nodeValue:'');
  },

  /**
   <method name="trim" type="this">
   <desc>trim a string</desc>
   <test>
   <![CDATA[
   return Meta.string.$(" foo ").trim().get()=="foo";
   ]]>
   </test>
   </method>
   */
  trim:function()
  {
    return this.replace(/^\s+|\s+$/g,"");
  },

  /**
   <method name="rtrim" type="this">
   <desc>right trim a string</desc>
   <test>
   <![CDATA[
   return Meta.string.$(" foo ").rtrim().get()==" foo";
   ]]>
   </test>
   </method>
   */
  rtrim:function()
  {
    return this.replace(/\s+$/,"");
  },

  /**
   <method name="ltrim" type="this">
   <desc>left trim a string</desc>
   <test>
   <![CDATA[
   return Meta.string.$(" foo ").ltrim().get()=="foo ";
   ]]>
   </test>
   </method>
   */
  ltrim:function()
  {
    return this.replace(/^\s+/,"");
  },

  /**
   <method name="insertAt" type="this">
   <desc>Insert string on position p</desc>
   <param name="p" type="integer">Position</param>
   <param name="c" type="string">String to be inserted</param>
   <test>
   <![CDATA[
   return Meta.string.$("foo").insertAt(3,'s').get()=="foos";
   ]]>
   </test>
   </method>
   */
  insertAt:function(p,c)
  {
    var a=this.get();
    return this.set(a.substr(0,p)+c+a.substr(p));
  },

  /**
   <method name="addSlashes" type="this">
   <desc>Add Slashes for single quote strings.</desc>
   <test>
   <![CDATA[
   return Meta.string.$("f'oo").addSlashes().get()=='f\\\'oo';
   ]]>
   </test>
   </method>
   */
  addSlashes:function()
  {
    return this.
      replace(/\\/g,"\\\\").
    //replace(/\"/g,"\\\"").
      replace(/\'/g,"\\'");
  },

  /**
   <method name="stripSlashes" type="this">
   <desc>Strip Slashes. For single quote strings.</desc>
   <test>
   <![CDATA[
   return Meta.string.$('f\\\\oo').stripSlashes().get()=='f\\oo';
   ]]>
   </test>
   </method>
   */
  stripSlashes:function()
  {
    return this.
      replace(/\\'/g,"'").
    //replace(/\\"/g,'"').
      replace(/\\\\/g,'\\');
  },

  /**
   <method name="nl2br" type="this">
   <desc>Convert new line character to <br/> string</desc>
   <test>
   <![CDATA[
     return Meta.string.$("foo\n").nl2br().get()=='foo<br/>';
   ]]>
   </test>
   </method>
   */
  nl2br:function()
  {
    return this.dos2unix().replace(/\n/g,"<br/>");
  },

  /**
   <method name="br2nl" type="this">
   <desc>Convert <br/> string to new line character</desc>
   <test>
   <![CDATA[
     return Meta.string.$("foo<br>").br2nl().get()=="foo\n";
   ]]>
   </test>
   </method>
  */
  br2nl:function()
  {
    return this.replace(/<br\s*\/?>/gi,"\n");
  },


  /**
   <method name="hasInt" type="bool">
   <desc>Returns true if there's an int on the string, else returns false.</desc>
   <test>
   <![CDATA[
     return Meta.string.$("1a2b3").hasInt()=="123";
   ]]>
   </test>
   </method>
  */
  hasInt:function()
  {
    return this.get().match(/\d/g) !== null;
  },

  /**
   <method name="toInt" type="integer">
   <desc>Strip all non numeric characters from the string and returns it as an integer.</desc>
   <test>
   <![CDATA[
     return Meta.string.$("1a2b3").toInt()=="123";
   ]]>
   </test>
   </method>
  */
  toInt:function()
  {
    return parseInt(this.get().match(/\d/g).join(''),10);
  }
}).extend(function()
{
  var m=Meta.genProperties;
  // Generate shortcuts for wrapped methods
  m('replace,concat,substr,substring,slice,toUpperCase,toLowerCase',
    function(d){return function(){return this.set(this.wrap(d,arguments));};},
    this);

  // Returns value from method
  m('charAt,charCodeAt,indexOf,lastIndexOf,search,match,split,valueOf',
    function(d){return function(){return this.wrap(d,arguments);};},
    this);
});

/**
 <method name="replace" type="this">
 <desc>Replaces some characters with some other characters in all the strings.</desc>
 <param name="a" type="mixed">String value to find. Will be replaced. Can be a regexp.</param>
 <param name="b" type="string">String to insert.</param>
 </method>

 <method name="concat" type="string">
 <desc>Join two or more strings into the strings.</desc>
 <param name="..." type="string">One or more string objects to be joined to the strings.</param>
 </method>
 
 <method name="substr" type="this">
 <desc>Extracts a specified number of characters in a string, from a start index.</desc>
 <param name="a" type="integer">Index of where to start the extraction. Can be negative to start from the end.</param>
 <param name="[b]" type="integer">How many characters to extract.</param>
 </method>
 
 <method name="substring" type="this">
 <desc>Extracts the characters in a string between two specified indices.</desc>
 <param name="a" type="integer">Index of where to start the extraction. Starts at 0.</param>
 <param name="[b]" type="integer">Index of where to stop the extraction.</param>
 </method>
 
 <method name="slice" type="this">
 <desc>Extracts a part of the strings.</desc>
 <param name="a" type="integer">Index where to start the selection. Can be negative to start from the end.</param>
 <param name="[b]" type="integer">Index where to end the selection.</param>
 </method>
 
 <method name="toUpperCase" type="this">
 <desc>Sets the strings to uppercase letters.</desc>
 </method>
 
 <method name="toLowerCase" type="this">
 <desc>Sets the strings to lower letters.</desc>
 </method>

 <method name="charAt" type="string">
 <param name="a" type="integer">Index of the character to return.</param>
 <desc>Returns the character at a specified position.</desc>
 </method>
 
 <method name="charCodeAt" type="string">
 <param name="a" type="integer">Index of the character to return.</param>
 <desc>Returns the unicode of the character at a specified position.</desc>
 </method>
 
 <method name="indexOf" type="integer">
 <param name="a" type="string">String value to search for.</param>
 <param name="[b]" type="integer">Index of the character where to start the search.</param>
 <desc>Returns the position of the first occurrence of a specified string value in a string.</desc>
 </method>
 
 <method name="lastIndexOf" type="integer">
 <param name="a" type="string">String value to search for.</param>
 <param name="[b]" type="integer">Index of the character where to start the search.</param>
 <desc>Returns the position of the last occurrence of a specified string value in a string.</desc>
 </method>
 
 <method name="search" type="integer">
 <param name="a" type="mixed">String value to search for. Can be Regexp</param>
 <desc>Search a string for a specified value and returns its position.</desc>
 </method>
 
 <method name="match" type="string">
 <param name="a" type="mixed">String value to search for. Can be Regexp</param>
 <desc>Search a string for a specified value and return the value found.</desc>
 </method>
 
 <method name="split" type="array">
 <param name="a" type="mixed">String value where to split. Can be Regexp</param>
 <param name="[b]" type="integer">Number of splits to return.</param>
 <desc>Split a string into an array of strings.</desc>
 </method>
 
 <method name="valueOf" type="string">
 <desc>Returns the primitive value of the specified object.</desc>
 </method>

*/

/** </class> */
/*
 Copyright (c) 2010 Rolando González Chévere <rolosworld@gmail.com>
 
 This file is part of Meta.
 
 Meta is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License version 3
 as published by the Free Software Foundation.
 
 Meta is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with Meta.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
   <class name="Meta.array">
   <desc>Array extensions</desc>
   <inherit>Meta.core</inherit>
 */
Meta.array=Meta(Meta.core).extend(
{
  _:[],
  
  /**
   <method name="$" type="Meta.array">
   <desc>Custom $, let it set a value</desc>
   <param name="[...]" type="mixed">Mixed data</param>
   <test>
   <![CDATA[
   var a=Meta.array.$(1,2),t;
   t=a.get().length==2;
   a=Meta.array.$([1,2]);
   return t && a.get().length==2;
   ]]>
   </test>
   </method>
   */
  $:function()
  {
    var b=this.$new(),
        c;
    b.set([]);

    Meta.each(arguments,function(v)
	      {
		c=Meta.its(v);
		if(c=='array')
                  b.set(v);
		else if(c!='undefined')
                  b.push(v);
	      });

    return b;
  },

  /**
     <method name="get" type="mixed">
     <param name="[i]" type="integer">Index of the value to be returned. If none defined, return the array.</param>
     <desc>Get the values</desc>
     <test>
     <![CDATA[
     var a=Meta.array.$([1,2]);
     return a.get(1)==2;
     ]]>
     </test>
     </method>
  */
  get:function(i)
  {
    var a=this.$super('get');
    return Meta.its(i,'number')?a[i]:a;
  },

  /**
     <method name="set" type="this">
     <param name="a" type="mixed">Value to set, can be an array or a value and index</param>
     <param name="[i]" type="integer">Index for the value</param>
     <desc>Set the value</desc>
     <test>
     <![CDATA[
     var a=Meta.array.$();
     a.set([1,2]);
     return a.get(1)==2;
     ]]>
     </test>
     </method>
  */
  set:function(a,i)
  {
    if(Meta.its(i,'number'))
      this.get()[i]=a;
    else
    {
      if(!Meta.its(a,'array'))
        a=[a];
      this.$super('set',a);
    }
    return this;
  },


  /**
     <method name="indexOf" type="integer">
     <desc>Returns the index of the given item's first occurrence.Returns -1 if not found. Makes strict comparison only.</desc>
     <param name="a" type="mixed">Value been searched</param>
     <param name="[b]" type="integer">Starting index</param>
     <test>
     <![CDATA[
     var a=Meta.array.$([1,2]);
     return a.indexOf(2)==1;
     ]]>
     </test>
     </method>
  */
  indexOf:function(a,b)
  {
    var d=this.get(),
        e=d.length;

    for(b=b||0;b<e;b++)
      if(d[b]===a)
        return b;
    
    return -1;
  },

  /**
     <method name="lastIndexOf" type="integer">
     <desc>Returns the index of the given item's last occurrence. </desc>
     <param name="a" type="mixed">Value been searched</param>
     <param name="[b]" type="integer">Starting index</param>
     <test>
     <![CDATA[
     var a=Meta.array.$([1,2]);
     return a.lastIndexOf(2)==1;
     ]]>
     </test>
     </method>
  */
  lastIndexOf:function(a,b)
  {
    var d=this.get(),
        c=b+1||d.length;

    while(c--)
      if(d[c]===a)
        break;
    
    return c;
  },

  /**
     <method name="some" type="bool">
     <desc>
     Runs a function on items in the array while that function
     returns false. It returns true if the function returns
     true for any item it could visit.
     </desc>
     <param name="a" type="function">Callback</param>
     <param name="[b]" type="object">Object</param>
     <test>
     <![CDATA[
     var a=Meta.array.$([1,2]);
     return a.some(function(a){return a==2;});
     ]]>
     </test>
     </method>
  */
  some:function(a,b)
  {
    b=b||this;
    var d=this.get();
    return !Meta.each(d,function(v,i)
		      {
			if(a.call(b, v, i, d))
                          return false;
		      });
  },

  /**
     <method name="every" type="bool">
     <desc>
     Runs a function on items in the array while that function is
     returning true. It returns true if the function returns true
     for every item it could visit.
     </desc>
     <param name="a" type="function">Callback</param>
     <param name="[b]" type="object">Object</param>
     <test>
     <![CDATA[
     var a=Meta.array.$([1,2]);
     return a.every(function(a){return a==1||a==2;});
     ]]>
     </test>
     </method>
  */
  every:function(a,b)
  {
    b=b||this;
    var d=this.get();
    return Meta.each(d,function(v,i)
                     {
                       if(!a.call(b, v, i, d))
                         return false;
                     });
  },

  /**
     <method name="filter" type="array">
     <desc>
     Runs a function on every item in the array and returns an
     array of all items for which the function returns true.
     </desc>
     <param name="a" type="function">Callback</param>
     <param name="[b]" type="object">Object</param>
     <test>
     <![CDATA[
     var a=Meta.array.$([1,2,3]);
     return a.filter(function(a){return a>1;}).toString()=='2,3';
     ]]>
     </test>
     </method>
  */
  filter:function(a,b)
  {
    b=b||this;
    var d=[],
        e=this.get();
    
    Meta.each(e,function(v,i)
              {
                if(a.call(b, v, i, e))
                  d.push(v);
              });
    return d;
  },

  /**
     <method name="forEach" type="this">
     <desc>Runs a function on every item in the array.</desc>
     <param name="a" type="function">Callback. function( item, index, array )</param>
     <param name="[b]" type="object">Object</param>
     <test>
     <![CDATA[
     var a=Meta.array.$([1,2,3]),b=0;
     a.forEach(function(v){b+=v;});
     return b==6;
     ]]>
     </test>
     </method>
  */
  forEach:function(a,b)
  {
    b=b||this;
    var i,
        j,
        c=this.get();

    Meta.each(c,function(v,i)
	      {
		// object, value, index, array
		a.call(b, v, i, c);
	      });
    return this;
  },

  /**
     <method name="map" type="array">
     <desc>
     Runs a function on every item in the array and returns
     the results in an array.
     </desc>
     <param name="a" type="function">Callback</param>
     <param name="[b]" type="object">Object</param>
     <test>
     <![CDATA[
     var a=Meta.array.$([1,2,3]),b;
     b=a.map(function(v){return v+1;});
     return b.toString()=='2,3,4';
     ]]>
     </test>
     </method>
  */
  map:function(a,b)
  {
    b=b||this;
    var d=[],
        e=this.get();

    Meta.each(e,function(v,i)
              {
                d.push(a.call(b, v, i, e));
              });
    return d;
  },

  /**
     <method name="numSort" type="this">
     <desc>Sort array by numbers</desc>
     <test>
     <![CDATA[
     var a=Meta.array.$([3,2,1]);
     a.numSort();
     return a.get().toString()=='1,2,3';
     ]]>
     </test>
     </method>
  */
  numSort:function()
  {
    return this.sort(function(a,b)
      {
        return a-b;
      });
  },

  /**
     <method name="insert" type="this">
     <desc>Insert a new value in the given index</desc>
     <param name="v" type="mixed">Value</param>
     <param name="[i]" type="integer">Index</param>
     <test>
     <![CDATA[
     var a=Meta.array.$([1,3]);
     a.insert(2,1);
     return a.get().toString()=='1,2,3';
     ]]>
     </test>
     </method>
  */
  insert:function(v,i)
  {
    if(i==undefined)
      this.push(v);
    else
      this.splice(i,0,v);
    return this;
  },

  /**
     <method name="drop" type="this">
     <desc>Remove array items from the given index and length</desc>
     <param name="a" type="integer">Index</param>
     <param name="[b]" type="integer">Length to be removed</param>
     <test>
     <![CDATA[
     var a=Meta.array.$([1,2,3]);
     a.drop(1);
     return a.get().toString()=='1,3';
     ]]>
     </test>
     </method>
  */
  drop:function(a,b)
  {
    return this.splice(a,b||1);
  },

  /**
     <method name="unique" type="this">
     <desc>Remove duplicates</desc>
     <test>
     <![CDATA[
     var a=Meta.array.$([1,1,2]);
     a.unique();
     return a.get().toString()=='1,2';
     ]]>
     </test>
     </method>
  */
  unique:function()
  {
    return this.set(Meta.unique(this.get()));
  },

  /**
     <method name="len" type="integer">
     <desc>Get the given array length</desc>
     <test>
     <![CDATA[
     var a=Meta.array.$([1,1,2]);
     return a.len()==3;
     ]]>
     </test>
     </method>
  */
  len:function()
  {
    return this.get().length;
  },

  /**
     <method name="reduce" type="integer">
     <param name="fn" type="function">Callback to execute on each value in the array.</param>
     <param name="[b]" type="object">Object to use as the first argument to the first call of the callback.</param>
     <desc>Apply a function simultaneously against two values of the array (from left-to-right) as to reduce it to a single value.</desc>
     <test>
     <![CDATA[
     var a=Meta.array.$([1,4,5,2,3]);
     return a.reduce(function(a,b){return a-b;})==-13 && a.reduce(function(a,b){return a>b?a:b;},7)==7;
     ]]>
     </test>
     </method>
  */
  reduce:function(a,b)
  {
    var c=this.len(),
        i=0,
        _=this.get();

    for(b=b||_[i++];i<c;i++)
      b=a.call(this,b,_[i],i,_);

    return b;
  },

  /**
     <method name="reduceRight" type="integer">
     <param name="fn" type="function">Callback to execute on each value in the array.</param>
     <param name="[b]" type="object">Object to use as the first argument to the first call of the callback.</param>
     <desc>Apply a function simultaneously against two values of the array (from right-to-left) as to reduce it to a single value.</desc>
     <test>
     <![CDATA[
     var a=Meta.array.$([1,4,5,2,3]);
     return a.reduceRight(function(a,b){return a-b;})==-9 &&
            a.reduceRight(function(a,b){return a>b?a:b;},7)==7;
     ]]>
     </test>
     </method>
  */
  reduceRight:function(a,b)
  {
    var c=this.len(),
        i=c-1,
        _=this.get();

    if(c<1&&!b)
      return undefined;

    c=b||_[i--];

    for(;i>=0;i--)
      c=a.call(this,c,_[i],i,_);

    return c;
  },

  /**
     <method name="shuffle" type="this">
     <desc>Shuffle the array values randomly.</desc>
     </method>
  */
  shuffle:function()
  {
    var a=this.get(),
        b=a.length,
        c=b-1,
        d,
        e;
    
    while(b--)
      {
	d=Math.round(Math.random()*c);
	e=a[b];
	a[b]=a[d];
	a[d]=e;
      }

    return this;
  }

}).extend(function()
{
/**
 <method name="push" type="this">
 <desc>Add the value on the arrays</desc>
 <param name="..." type="mixed">Values to push</param>
 <test>
 <![CDATA[
 var a=Meta.array.$();
 a.push(1);
 return a.get(0)==1;
 ]]>
 </test>
 </method>

 <method name="sort" type="this">
 <desc>Sort the array</desc>
 <param name="[a]" type="function">Sort function</param>
 <test>
 <![CDATA[
 var a=Meta.array.$(['c','a','b']);
 a.sort();
 return a.get(0)=='a' && a.get(1)=='b' && a.get(2)=='c';
 ]]>
 </test>
 </method>

 <method name="splice" type="this">
 <desc>Remove and add new elements to an array</desc>
 <param name="i" type="integer">Index</param>
 <param name="a" type="integer">How many</param>
 <param name="[...]" type="mixed">Optional elements</param>
 <test>
 <![CDATA[
 var a=Meta.array.$(['a','b','c']);
 a.splice(1,1,'z');
 return a.get(0)=='a' && a.get(1)=='z' && a.get(2)=='c';
 ]]>
 </test>
 </method>

 <method name="unshift" type="this">
 <desc>Adds one or more elements to the beginning of an array</desc>
 <param name="[...]" type="mixed">Optional elements</param>
 <test>
 <![CDATA[
 var a=Meta.array.$(['a','b','c']);
 a.unshift('z');
 return a.get(0)=='z' && a.get(1)=='a' && a.get(2)=='b' && a.get(3)=='c';
 ]]>
 </test>
 </method>

 <method name="reverse" type="this">
 <desc>Shift a value from the given array or all the arrays</desc>
 <test>
 <![CDATA[
 var a=Meta.array.$(['a','b','c']);
 a.reverse();
 return a.get(0)=='c' && a.get(1)=='b' && a.get(2)=='a';
 ]]>
 </test>
 </method>

 <method name="pop" type="mixed">
 <desc>Pop a value from the given array</desc>
 <test>
 <![CDATA[
 var a=Meta.array.$(['a','b','c']),b;
 b=a.pop();
 return b=='c' && a.get(0)=='a' && a.get(1)=='b';
 ]]>
 </test>
 </method>

 <method name="shift" type="mixed">
 <desc>Shift a value from the given array</desc>
 <test>
 <![CDATA[
 var a=Meta.array.$(['a','b','c']),b;
 b=a.shift();
 return b=='a' && a.get(0)=='b' && a.get(1)=='c';
 ]]>
 </test>
 </method>

 <method name="concat" type="this">
 <desc>Add the value on the arrays</desc>
 <param name="..." type="array">arrays to be concat</param>
 <test>
 <![CDATA[
 var a=Meta.array.$(['a','b']);
 a.concat(['c']);
 return a.get(0)=='a' && a.get(1)=='b' && a.get(2)=='c';
 ]]>
 </test>
 </method>

 <method name="slice" type="this">
 <desc>Set selected elements</desc>
 <param name="a" type="integer">Start</param>
 <param name="[b]" type="integer">End</param>
 <test>
 <![CDATA[
 var a=Meta.array.$(['a','b','c']);
 a.slice(1,2);
 return a.get(0)=='b';
 ]]>
 </test>
 </method>

 <method name="join" type="string">
 <desc>Join the values of the array and return a string</desc>
 <param name="a" type="string">Separator</param>
 <test>
 <![CDATA[
 var a=Meta.array.$(['a','b','c']),b;
 b=a.join('');
 return b=='abc';
 ]]>
 </test>
 </method>
 */

  var m=Meta.genProperties;

  // Returns this without set
  m('push,sort,splice,unshift,reverse',
    function(d)
    {
      return function()
      {
	this.wrap(d,arguments);
	return this;
      };
    },
    this);

  // Returns value from method
  m('pop,shift,join',
    function(d){return function(){return this.wrap(d,arguments);};},
    this);

  // Returns this after set
  m('concat,slice',
    function(d){return function(){return this.set(this.wrap(d,arguments));};},
    this);
});
/** </class> */
/*
 Copyright (c) 2010 Rolando González Chévere <rolosworld@gmail.com>
 
 This file is part of Meta.
 
 Meta is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License version 3
 as published by the Free Software Foundation.
 
 Meta is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with Meta.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
 <class name="Meta.events">
 <desc>
   Events extensions.
   Event data structure (EDS):
   {
     event_type:[
                  { type: event_type, obj: object_owner_of_event, cb: main_callback_function_calls_every_callback, fn: [ callbacks, ... ] },
		  ...
		],
     ...
   }
 </desc>
 <inherit>Meta.core</inherit>
 */
//Meta.events=Meta(Meta.array);
Meta.events=Meta(Meta.core).extend(function()
{
  /**
   Private and static variable where the events are stored.
   */
  var arr=Meta.array.$();
  this.events={};

  /**
   <method name="onNewEvent" type="void">
   <desc>Callback for when a new event type is inserted for a given object</desc>
   <param name="a" type="object">EDS</param>
   </method>
   */
  this.onNewEvent=function(){};

  /**
   <method name="onEmptyEvent" type="void">
   <desc>Callback for when the object has no event of the given type</desc>
   <param name="a" type="object">EDS</param>
   </method>
   */
  this.onEmptyEvent=function(){};

  /**
   <method name="onFireEvent" type="void">
   <desc>Callback for when a single callback of the given type is called</desc>
   <param name="a" type="object">EDS</param>
   <param name="b" type="bool">true if every callback returned true, else false</param>
   <param name="c" type="array">arguments</param>
   </method>
   */
  this.onFireEvent=function(){};

  /**
   <method name="addEvent" type="this">
   <desc>Add a new callback to the event of the given object</desc>
   <param name="a" type="string">Event type</param>
   <param name="b" type="object">Object</param>
   <param name="c" type="mixed">Single function callback or array of callbacks</param>
   <test>
   <![CDATA[
   var a=Meta.events.$(),d,b={},c=function(){d=true;};
   a.addEvent('addEvent',b,c); // added
   a.addEvent('addEvent',b,c); // added
   a.addEvent('addEvent',b,c,0); // ignored, since its already added
   a.fireEvent('addEvent',b);
   a.rmEvent('addEvent',b);
   return d;
   ]]>
   </test>
   </method>
   */
  this.addEvent=function(a,b,c)
  {
    var d=-1,
        me=this;

    // Event type not initialized, so initialize it
    if(!me.events[a])
      me.events[a]=[];

    // Check if object is defined on the event, else add it
    else
      d=me.indexOfEvent(a,b);

    if(d<0)
    {
      d={
	type:a,
	obj:b,
	cb:function()
	{
	  return me.fireEvent.apply(me,arr.
            set([a,b]).
            concat(Meta.obj2array(arguments)).
            get());
	},
	fn:[]
      };

      me.events[a].push(d);
      me.onNewEvent(d);
    }
    else
      d=me.events[a][d];

    // Add the callback function, can be repeated
    arr.set(d.fn);
    if(Meta.its(c,'array'))
    {
      arr.concat(c);
      d.fn=arr.get();
    }
    else
      arr.push(c);

    return me;
  };

  /**
   <method name="getEvent" type="object">
   <desc>Get the EDS of the event from the given object. Returns null if none found.</desc>
   <param name="a" type="string">Event type</param>
   <param name="b" type="integer">EDS id</param>
   <test>
   <![CDATA[
   var a=Meta.events.$(),b={},c=function(){},d,e;
   a.addEvent('getEvent',b,c);
   d=a.getEvent('getEvent',a.indexOfEvent('getEvent',{}));
   e=d===null;
   d=a.getEvent('getEvent',a.indexOfEvent('getEvent',b));
   e=d && d.obj===b;
   a.rmEvent('getEvent',b);
   return e;
   ]]>
   </test>
   </method>
   */
  this.getEvent=function(a,b)
  {
    var e=this.events[a];
    return e&&e[b]?e[b]:null;
  };

  /**
   <method name="getObjectEvents" type="array">
   <desc>Get all the EDS of the given object. Returns [] if none found.</desc>
   <param name="a" type="object">Object</param>
   <test>
   <![CDATA[
   var a=Meta.events.$(),b={},c=function(){},d,e;
   a.addEvent('event1',b,c);
   a.addEvent('event1',b,c);
   a.addEvent('event2',b,c);
   a.addEvent('event2',b,c);
   d=a.getObjectEvents(b);
   e=d.length==2;
   a.rmEvent('event1',b);
   a.rmEvent('event2',b);
   return e;
   ]]>
   </test>
   </method>
   */
  this.getObjectEvents=function(a)
  {
    var b=[],
        c,
        me=this;
    
    for(var i in me.events)
    {
      c=me.indexOfEvent(i,a);
      if(c>-1)
        b.push(me.events[i][c]);
    }
    
    return b;
  };

  /**
   <method name="indexOfEvent" type="integer">
   <desc>Index of the EDS of the event from the given object. Returns -1 if none found.</desc>
   <param name="a" type="string">Event type</param>
   <param name="b" type="object">Object</param>
   <test>
   <![CDATA[
   var a=Meta.events.$(),b={},c=function(){},d;
   a.addEvent('indexOfEvent',b,c);
   d=a.indexOfEvent('indexOfEvent',b);
   a.rmEvent('indexOfEvent',b);
   return d==0;
   ]]>
   </test>
   </method>
   */
  this.indexOfEvent=function(a,b)
  {
    var c=-1,me=this;
    if(!me.events[a])
      return c;
    arr.set(me.events[a]).every(function(v,i)
      {
	if(v.obj==b)
	{
	  c=i;
	  return false;
	}
	return true;
      });
    return c;
  };

  /**
   <method name="fireEvent" type="bool">
   <desc>Fire the given event type for the given object. Returns false if any callback returns false, else true.</desc>
   <param name="a" type="string">Event type</param>
   <param name="b" type="object">Object</param>
   <param name="[...]" type="mixed">Custom arguments to pass to the callbacks</param>
   <test>
   <![CDATA[
   var a=Meta.events.$(),d,b={},c=function(){d=true;};
   a.addEvent('fireEvent',b,c); // added
   a.addEvent('fireEvent',b,c); // added
   a.addEvent('fireEvent',b,c,0); // ignores, since its already added
   a.fireEvent('fireEvent',b);
   a.rmEvent('fireEvent',b);
   return d;
   ]]>
   </test>
   </method>
   */
  this.fireEvent=function(a,b)
  {
    var me=this,
        d=me.indexOfEvent(a,b),
        e=true,
        c,
        f;
    
    if(d<0)
      return false;

    f=me.events[a][d];

    // Create array of arguments
    c=[];
    Meta.each(arguments,function(v,i){if(i>1)c.push(v);});

    // Call all the callbacks with the arguments
    Meta.each(f.fn,function(w)
      {
	if(w.apply(b,c)===false)
	  e=false;
      });

    me.onFireEvent(f,e,c);
    return e;
  };

  /**
   <method name="rmEvent" type="this">
   <desc>Remove the given callback or callbacks of the event type for the given object.</desc>
   <param name="a" type="string">Event type</param>
   <param name="b" type="object">Object</param>
   <param name="[c]" type="function">Callback to be removed. If not defined, removes the whole event.</param>
   <test>
   <![CDATA[
   var a=Meta.events.$(),b={},c=function(){},d,e;
   a.addEvent('rmEvent',b,c);
   a.rmEvent('rmEvent',b);
   d=a.indexOfEvent('rmEvent',b);
   e=d==-1;
   a.addEvent('rmEvent',b,c);
   a.rmEvent('rmEvent',b,c);
   d=a.indexOfEvent('rmEvent',b);
   return e && d==-1;
   ]]>
   </test>
   </method>
   */
  this.rmEvent=function(a,b,c)
  {
    var d,
        e=-1,
        f,
        me=this,
        g=me.indexOfEvent(a,b);
    
    if(g<0)
      return me;
    
    d=me.events[a][g];

    // Remove all the callbacks
    if(!c)
      d.fn=[];
    else
    {
      // Remove only one callback
      f=arr.set(d.fn);
      e=f.indexOf(c);
      if(e>-1)
        f.drop(e);
    }

    // Remove the whole event for the given object
    if(!d.fn.length)
    {
      arr.set(me.events[a]).drop(g);
      me.onEmptyEvent(d);
    }
    return me;
  };

  /**
   <method name="rmObject" type="this">
   <desc>Removes all the events for the given object.</desc>
   <param name="a" type="object">Object</param>
   <test>
   <![CDATA[
   var a=Meta.events.$(),b={},c=function(){},d;
   a.addEvent('rmObject',b,c);
   a.rmObject(b);
   d=a.indexOfEvent('rmObject',b);
   return d==-1;
   ]]>
   </test>
   </method>
   */
  this.rmObject=function(a)
  {
    var me=this;
    Meta.each(me.events,function(v,i)
      {
	me.rmEvent(i,a);
      },1);
    return me;
  };

  /**
   <method name="flush" type="this">
   <desc>Removes all the events defined or the ones selected by a callback.</desc>
   <param name="[a]" type="function">Callback function to select wich event remove. If return true remove, else dont remove</param>
   <test>
   <![CDATA[
   var a=Meta.events.$(),b={},c=function(){},d,e;
   a.addEvent('event1',b,c);
   a.addEvent('event2',b,c);
   a.flush(function(a,b){return a=='event2';});
   d=a.indexOfEvent('event1',b);
   e=d==0;
   d=a.indexOfEvent('event2',b);
   e=e&&d==-1;
   a.flush();
   d=a.indexOfEvent('event1',b);
   return e && d==-1;
   ]]>
   </test>
   </method>
   */
  this.flush=function(a)
  {
    a=a||function(){return 1;};
    var me=this,
        b=[],
        j;
    
    Meta.each(me.events,function(v,i)
      {
	j=v.length;
	while(j--)
	{
	  if(a(i,v[j].obj))
	    me.rmEvent(i,v[j].obj);
	}

	if(!v.length)
          b.push(i);
      },1);

    j=b.length;
    while(j--)
      delete me.events[b[j]];

    return me;
  };

  /**
     <method name="on" type="this">
     <param name="a" type="string">Event type</param>
     <param name="b" type="function">Callback for the event</param>
     <desc>
     Adds a new event. If the callback returns false it stops the
     event from propagation. The callback is called the same way
     it would be called by the browser event, "this" is the element
     and received the event as an argument.
     </desc>
     </method>
  */
  this.on=function(a,b)
  {
    var me=this;
    return me.addEvent(a,me,b);
  };

  /**
     <method name="off" type="this">
     <desc>Remove the given event callback</desc>
     <param name="a" type="string">Event type</param>
     <param name="[b]" type="function">Callback on current event</param>
     </method>
  */
  this.off=function(a,b)
  {
    var me=this;
    return me.rmEvent(a,me,b);
  };

  /**
     <method name="fire" type="mixed">
     <desc>
     Fires the given event type.
     Returns this.
     </desc>
     <param name="a" type="string">Event type</param>
     </method>
  */
  this.fire=function(a,b)
  {
    var me=this;
    return me.fireEvent(a,me,b);
  };


  // For debug
  //this.ev=events;
});
/** </class> */
/*
 Copyright (c) 2016 Rolando González Chévere <rolosworld@gmail.com>
 
 This file is part of Meta.
 
 Meta is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License version 3
 as published by the Free Software Foundation.
 
 Meta is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with Meta.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
   <class name="Meta.jsonrpc">
   <desc>JSONRPCv2 handler</desc>
   <inherit>Meta.array</inherit>
 */
Meta.jsonrpc=Meta(Meta(Meta.events).extend(Meta.array)).extend({
  events:{},

  /**
     <method name="url" type="this">
     <desc>Set the default URL for the JSONRPCv2 server</desc>
     <param name="u" type="string">JSONRPCv2 URL</param>
     </method>
  */
  url:function(u) {
    this._url=u;
    return this;
  },

  /**
     <method name="send" type="this">
     <desc>Send a single JSONRPC request</desc>
     <param name="d" type="hash">Data hash with the method, params and id</param>
     <param name="[c]" type="function">Callback</param>
     </method>
  */
  send:function(d,c) {
    var me=this;
    me.fire('send');
    Meta.ajax({
      url: me._url,
      method:'POST',
      headers:{'Content-Type':'application/json'},
      data:JSON.stringify(d),
      callbacks:c
    });
    return me;
  },

  /**
     <method name="push" type="this">
     <desc>Add a JSONRPCv2 request that will be sent once execute runs</desc>
     <param name="a" type="hash">Hash with the JSONRPCv2 request data.</param>
     </method>
  */
  push:function(a) {
    var me=this;
    me.$super('push',a);
    me.fire(a.method);
    return me;
  },

  /**
     <method name="execute" type="this">
     <param name="[c]" type="function">Callback</param>
     <desc>Merge all the JSONRPCv2 queries in the array and send them. Set the id to be the array index. Clears the requests array after sending the requests.</desc>
     </method>
  */
  execute:function(c) {
    var a=[],s,b,me=this;
    if(!me.len())return;
    me.forEach(function(v,i){
      s={
        jsonrpc:'2.0',
        method:v.method
      };
      if(v['params'])s.params=v.params;
      if(v['callback'])s.id=i;
      a.push(s);
    });
    b=me._;
    me._=[];
    me.send(a,function(r){
      me.$(r.json()).forEach(function(v){
        var m = b[v.id];
        if (m.callback(v)) {
            me.fire(m.method + ':TRUE');
        }
        else {
            me.fire(m.method + ':FALSE');
        }
      });
      b=null;
      if(c)c();
    });
    return me;
  }
  
});
/** </class> */
/*
 Copyright (c) 2015 Rolando González Chévere <rolosworld@gmail.com>
 
 This file is part of Meta.
 
 Meta is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License version 3
 as published by the Free Software Foundation.
 
 Meta is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with Meta.  If not, see <http://www.gnu.org/licenses/>.
*/

/**
 <class name="Meta.eventtarget">
 <desc>WebSocket events manager</desc>
 <inherit>Meta.events</inherit>
 */
Meta.eventtarget=Meta(Meta.events).extend({
  valid_type:'',
  wrapped:function(a){
    return this.valid_type.indexOf(' '+a+' ')!=-1;
  },
  
  onNewEvent:function(a)
  {
    if(!this.wrapped(a.type))
      return;

    if(Meta.has(a.obj,'addEventListener'))
      a.obj.addEventListener(a.type,a.cb,false);
    else if(Meta.has(a.obj,'attachEvent'))
      a.obj.attachEvent("on"+a.type,a.cb);
  },

  onEmptyEvent:function(a)
  {
    if(!this.wrapped(a.type))
      return;

    if(Meta.has(a.obj,'removeEventListener'))
      a.obj.removeEventListener(a.type,a.cb,false);
    else if(Meta.has(a.obj,'detachEvent'))
      a.obj.detachEvent('on'+a.type,a.cb);
  },

  /**
   <method name="on" type="mixed">
   <param name="a" type="string">Event type</param>
   <param name="b" type="function">Callback for the event</param>
   <desc>
   Adds a new event. If the callback returns false it stops the
   event from propagation. The callback is called the same way
   it would be called by the browser event, "this" is the element
   and received the event as an argument.
   </desc>
   </method>
   */
  on:function(a,b)
  {
    var me=this;
    var w=me.wrapped(a)?me.get():me;
    if(b)
      return me.addEvent(a,w,b);
  },

  /**
   <method name="fire" type="mixed">
   <desc>
   Fires the given event type.
   Returns this.
   </desc>
   <param name="a" type="string">Event type</param>
   </method>
   */
  fire:function(a,b)
  {
    var me=this;
    var w=me.wrapped(a)?me.get():me;
    return me.fireEvent(a,w,b);
  },

  /**
   <method name="off" type="this">
   <desc>Remove the given event callback</desc>
   <param name="a" type="string">Event type</param>
   <param name="[b]" type="function">Callback on current event</param>
   </method>
   */
  off:function(a,b)
  {
    var me=this;
    var w=me.wrapped(a)?me.get():me;
    return me.rmEvent(a,w,b);
  }
});
/** </class> */
/*
 Copyright (c) 2010 Rolando González Chévere <rolosworld@gmail.com>
 
 This file is part of Meta.
 
 Meta is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License version 3
 as published by the Free Software Foundation.
 
 Meta is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with Meta.  If not, see <http://www.gnu.org/licenses/>.
*/

/**
 <class name="Meta.domevent">
 <desc>DOM events manager</desc>
 <inherit>Meta.eventtarget</inherit>
 <extend>Meta.array</extend>
 */
Meta.domevent=Meta(Meta.eventtarget).extend(Meta.array).extend({
  valid_type:' abort blur change click dblclick error focus keydown keypress keyup load mousedown mousemove mouseout mouseover mouseup reset resize select submit unload hashchange ',

  onFireEvent:function(a,b,c)
  {
    if(b || !this.wrapped(a.type))
      return;

    // Force stop the event
    c[0].cancelBubble=true;
    c[0].returnValue=false;

    if(c[0].stopPropagation)
      c[0].stopPropagation();

    if(c[0].preventDefault)
      c[0].preventDefault();
  },

  /**
   <method name="on" type="mixed">
   <param name="a" type="string">Event type</param>
   <param name="b" type="function">Callback for the event</param>
   <desc>
   Adds a new event. If the callback returns false it stops the
   event from propagation. The callback is called the same way
   it would be called by the browser event, "this" is the element
   and received the event as an argument.
   </desc>
   </method>
   */
  on:function(a,b)
  {
    var me=this;
    if(b)
      return me.forEach(function(v){me.addEvent(a,v,b);});
  },

  /**
   <method name="fire" type="mixed">
   <desc>
   Fires the given event type.
   Returns this.
   </desc>
   <param name="a" type="string">Event type</param>
   </method>
   */
  fire:function(a)
  {
    var me=this;
    return me.forEach(function(v)
      {
	if(v['on'+a])
	  v['on'+a]();
        
	me.fireEvent(a,v);
      });
  },

  /**
   <method name="off" type="this">
   <desc>Remove the given event callback</desc>
   <param name="a" type="string">Event type</param>
   <param name="[b]" type="function">Callback on current event</param>
   </method>
   */
  off:function(a,b)
  {
    var me=this;
    return me.forEach(function(v){me.rmEvent(a,v,b);});
  },

  /**
   <method name="cleanEvents" type="this">
   <desc>Remove events from elements without parentNode</desc>
   </method>
  */
  cleanEvents:function()
  {
    return this.flush(function(a,b){return b['parentNode']===null;});
  }
});
/** </class> */

Meta.domevent.addEvent('unload',window,function()
  {
    Meta.events.flush();
    if(document && document.body)
      Meta.dom.purge(document.body);
  });
Meta.select=(function()
{
  // Regexp taken from jQuery.
  var re={
    CHUNKER:/((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^[\]]*\]|['"][^'"]+['"]|[^[\]'"]+)+\]|\\.|[^ >+~,(\[]+)+|[>+~])(\s*,\s*)?/g,
    ID:/#((?:[\w\u00c0-\uFFFF_-]|\\.)+)/g,
    CLASS:/\.((?:[\w\u00c0-\uFFFF_-]|\\.)+)/g,
    NAME:/\[name=['"]*((?:[\w\u00c0-\uFFFF_-]|\\.)+)['"]*\]/g,
    ATTR:/\[\s*((?:[\w\u00c0-\uFFFF_-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/g,
    TAG:/^((?:[\w\u00c0-\uFFFF\*_-]|\\.)+)/g,
    CHILD:/:(only|nth|last|first)-child(?:\((even|odd|[\dn+-]*)\))?/g,
    POS:/:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^-]|$)/g,
    PSEUDO:/:((?:[\w\u00c0-\uFFFF_-]|\\.)+)(?:\((['"]*)((?:\([^\)]+\)|[^\2\(\)]*)+)\2\))?/g
  },//"

  // Filter the attributes
  attrFilter={
    '=':function(a,b){return a==b;},
    '!=':function(a,b){return a!=b;},
    '~=':function(a,b){return a!==null&&(' '+a+' ').indexOf(b)>-1;},
    '^=':function(a,b){return a!==null&&a.indexOf(b)==0;},
    '*=':function(a,b){return a!==null&&a.indexOf(b)>-1;},
    '$=':function(a,b){return a!==null&&(a.lastIndexOf(b)+b.length)==a.length;},
    '|=':function(a,b){return a==b||a.indexOf(b+'-')==0;},
    '':function(a,b){return a!==null;}
  },

  filters={
    'tag':function(node,a)
    {
      return node.nodeName==a||a=='*';
    },
    'className':function(node,a)
    {
      var b=node.className;
      return b&&(' '+b+' ').indexOf(' '+a+' ')>-1;
    },
    'attr':function(node,a)
    {
      // a=[[,name,type,,val]]
      var aname,
          b,
          i=a.length,
          attr;
      
      while(i--)
      {
	b=a[i];
        aname=b[1];
        if(node.nodeType==1)
	{
	  attr=node.getAttribute(aname);
	  if(attr!==null&&b[2](attr,b[4]))
	    continue;
	}
        return 0;
      }
      return 1;
    },
    'pseudo':function()
    {
      return 0;
    },
    'nest':function(node,a)
    {
      var n=a[0],
          b=a[1],
          c;
      
      if(!node)
	return 0;

      //if(n[parseInt(node[b],10)]!=node)
      if(n[parseInt(node.getAttribute(b),10)]!=node)
      {
	c=n.length;
        //node[b]=c;
        node.setAttribute(b,c);
        n[c]=node;
        return 1;
      }
      return 0;
    }
  },

  selectors={
    '>':function(node,name,nn,nest,fdata,vnode,f)
    {
      var _nodes=node.childNodes,
          k,
          l,
          nodes=[];

      for(k=0,l=_nodes.length;k<l;k++)
      {
	node=_nodes[k];
	if(node.nodeType!=1)
	  continue;

	if(vnode(node,fdata,f))
	  nodes.push(node);
      }
      return nodes;
    },
    '~':function(node,name,nn,nest,fdata,vnode,f)
    {
      var nodes=[],
          idx;
      
      while((node=node.nextSibling))
      {
	if(node.nodeType==1&&vnode(node,fdata,f))
	  nodes.push(node);
      }
      return nodes;
    },
    '+':function(node,name,nn,nest,fdata,vnode,f)
    {
      while((node=node.nextSibling)&&node.nodeType!=1){}
      return vnode(node,fdata,f)?[node]:[];
    }
  };

  function validNode(node,fdata,f)
  {
    var i,
        j=0;
    
    if(node)
    {
      j=1;
      for(i in fdata)
      {
	if(fdata[i]&&!f[i](node,fdata[i]))
	{
	  j=0;
	  break;
	}
      }
    }
    return j;
  };

  // ID = m[1]
  // CLASS = m[1]
  // NAME = m[1]
  // ATTR = [m[1],m[2],m[4]] --> [attr,type,value]
  // TAG = m[1]
  // CHILD = m[1]
  // POS = m[1]
  // PSEUDO = m[1]


  // a CSS rules
  // b Context
  return function(a,b)
  {
    b=b||document;

    if(b.querySelectorAll)
      return Meta.obj2array(b.querySelectorAll(a));

    var chunk=re.CHUNKER,
        m,
        n,
        o,
        rule,
        sel,
        nodes=[b],
        _id=re.ID,
        _class=re.CLASS,
        _name=re.NAME,
        _attr=re.ATTR,
        _tag=re.TAG,
        _child=re.CHILD,
        _POS=re.POS,
        _PSEUDO=re.PSEUDO,
        doc=(b.nodeType==9?b:b.ownerDocument),
        i,
        j,
        k,
        l,
        node,
        _nodes2,
        _nodes,
        isxml=doc.documentElement.nodeName!=='HTML',
        nest,
        nn='data-metaNest',
        pos=0,
        fnodes=[],
        fdata={},
        _filters=filters,
        afilters=attrFilter,
        vnode=validNode;

    chunk.lastIndex=0;
    while((m=chunk.exec(a)))
    {
      rule=m[1];

      if(rule=='>'||
	 rule=='~'||
	 rule=='+')
      {
	sel=selectors[rule];
        continue;
      }

      nest=[];

      // ID, it overrides the other rules since the ID should be unique.
      _id.lastIndex=0;
      n=_id.exec(rule);
      if(n)
      {
	node=doc.getElementById(n[1]);
        if(_filters.nest(node,[nest,nn]))
	  nodes=[node];
	else
	  nodes=[];
      }
      else
      {
	// NEST
	fdata.nest=[nest,nn];

        // ATTR
        fdata.attr=[];
        _attr.lastIndex=0;
        while((n=_attr.exec(rule))!==null)
        {
	  n[2]=afilters[n[2]||''];
	  fdata.attr.push(n);
        }
        
        if(!fdata.attr.length)
	  fdata.attr=0;

	// CLASS
	if(!fdata.attr)
	{
	  _class.lastIndex=0;
	  n=_class.exec(rule);
	  fdata.className=n?n[1]:n;
	}

        // TAG
        _tag.lastIndex=0;
        n=_tag.exec(rule);
	n=n?n[1]:'*';
	n=isxml?n:n.toUpperCase();
	fdata.tag=n;

        /////////////////////////////////
        _nodes2=[];
        for(i=0,j=nodes.length;i<j;i++)
	{
	  node=nodes[i];
	  if(sel)
	    _nodes2=_nodes2.concat(sel(node,n,nn,nest,fdata,vnode,_filters));
	  else
	  {
	    _class.lastIndex=0;
	    o=_class.exec(rule);
	    
            if(o&&node.getElementsByClassName)
	    {
	      _nodes=node.getElementsByClassName(o[1]);
	      o=0;
	    }
	    else
	      _nodes=node.getElementsByTagName(n);

	    if(!o)
	      fdata.className=0;

	    for(k=0,l=_nodes.length;k<l;k++)
	    {
	      node=_nodes[k];
	      if(vnode(node,fdata,_filters))
		_nodes2.push(node);
	    }
	    o=0;
	  }
        }
        nodes=_nodes2;
      }
      sel=null;

      if(m[2]&&m[2].replace(/^\s+|\s+$/g,"")==',')
      {
	fnodes[pos++]=nodes;
        nodes=[b];
	continue;
      }
    }

    fnodes[pos]=nodes;

    nest=[];
    nodes=[];
    for(i=0,j=fnodes.length;i<j;i++)
    {
      _nodes=fnodes[i];
      for(k=0,l=_nodes.length;k<l;k++)
      {
	node=_nodes[k];
	if(_filters.nest(node,[nest,nn]))
	  nodes.push(node);
      }
    }

    return nodes;
  };
}());/*
 Copyright (c) 2010 Rolando González Chévere <rolosworld@gmail.com>
 
 This file is part of Meta.
 
 Meta is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License version 3
 as published by the Free Software Foundation.
 
 Meta is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with Meta.  If not, see <http://www.gnu.org/licenses/>.
*/

// *** Dean Edwards discovered this ***
// http://dean.edwards.name/weblog/2006/11/sandbox/
/**
 <function name="Meta.sandbox" type="object">
 <desc>Returns a sandbox object</desc>
 </function>
 */
/**
 <class name="Meta.sandbox">
 <desc>Sandbox object</desc>
 */
Meta.sandbox=function()
{
  // create an <iframe>
  var f1=document.createElement("iframe"),
      doc,
      f2;
  
  f1.style.display = "none";
  document.body.appendChild(f1);

  // write a script into the <iframe> and create the sandbox
  f2=frames[frames.length - 1];
  doc=f2.document;
  doc.writeln('<script>window.sandbox=window.ActiveXObject?this:{eval:function(s){return eval(s)}};</script>');
  doc.close();

  return {
    /**
     <method name="eval" type="mixed">
     <param name="a" type="string">JS program to evaluate.</param>
     <desc>Evaluates a JS program in a sandbox.</desc>
     </method>
     */
    eval:function(a){return f2.sandbox.eval(a);},

    /**
     <method name="include" type="void">
     <param name="a" type="string">Script to include in the sandbox.</param>
     <desc>Includes new scripts into the sandbox.</desc>
     </method>
     */
    include:function(a)
    {
      var b=doc.createElement('script');
      b.src=a;
      doc.body.appendChild(b);
    }
  };
};
/** </class> */
/*
 Copyright (c) 2010 Rolando González Chévere <rolosworld@gmail.com>
 
 This file is part of Meta.
 
 Meta is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License version 3
 as published by the Free Software Foundation.
 
 Meta is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with Meta.  If not, see <http://www.gnu.org/licenses/>.
*/

/**
 <class name="Meta.dom">
 <inherit>Meta.domevent</inherit>
 <desc>DOM extensions, elements</desc>
*/
Meta.dom=Meta(Meta.domevent).extend(function()
{
  // Methods for glue method
  // a DOM
  // b Cloned DOM
  // c ParentNode
  var glues={
    before:function(a,b,c){if(c)c.insertBefore(b,a);},
    after:function(a,b,c){if(c)c.insertBefore(b,a.nextSibling);},
    replace:function(a,b,c){if(c)c.replaceChild(b,a);},
    prepend:function(a,b){a.insertBefore(b,a.firstChild||null);},
    append:function(a,b){a.appendChild(b);}
  },

  str=Meta.string.$(),
  arr=Meta.array.$(),
  sandbox,sbdiv;

  // Get div from sandbox, in case of XML
  function getSBDiv()
  {
    sandbox=Meta.sandbox();
    sbdiv=sandbox.eval('document.createElement("div");');
    return sbdiv;
  };


  // Try to fix the css property name converting it to JS style.
  function css2js(a)
  {
    // Special case
    if(a=='float')a=isIE?'styleFloat':'cssFloat';

    return Meta.string.$(a).toCamelCase('-');
  };

  // check if option has a value, else use the option text as the value
  function optVal(a)
  {
    return (a.value!==null&&a.value!==undefined&&a.value.length>0)
      ?a.value
      :a.text;
  };

  return {
    info:{name:"Meta.dom"},
  
    _doc:document,

    /**
     <method name="$" type="Meta.dom">
     <desc>Custom $ for Meta.dom</desc>
     <param name="[...]" type="mixed">Mixed data</param>
     <test>
     <![CDATA[
     var a=document.createElement('b');
     return Meta.dom.$(a).get(0)==a;
     ]]>
     </test>
     </method>
     */
    $:function()
    {
      var a=['$'],
          b=arguments;

      if(!b.length)
        a.push(this.doc());
      else
        a=a.concat(Meta.args2array(b));
      
      // Use $ from Meta.array
      return this.$super.apply(this,a);
    },

    /**
     <method name="set" type="Meta.dom">
     <desc>Set the DOM or DOMS to be managed</desc>
     <param name="a" type="mixed">Mixed data. Can be an array of elements or a single element</param>
     <param name="[i]" type="integer">Index where to set the value</param>
     <test>
     <![CDATA[
     var a=document.createElement('b');
     return Meta.dom.$().set(a).get(0)==a;
     ]]>
     </test>
     </method>
     */
    set:function(a,i)
    {
      return this.$super('set',a||this.doc(),i);
    },

    /**
     <method name="doc" type="mixed">
     <param name="[x]" type="mixed">XML data if an XML should be created or a document object</param>
     <desc>Get|Set|Create the document of the current elements</desc>
     <test>
     <![CDATA[
     return !!1;
     ]]>
     </test>
     </method>
     */
    doc:function(x)
    {
      var a;

      // Get document
      if(!x)
        return (this._doc=this._doc||document);

      // If its not a string, it should be a document object
      if(!Meta.its(x,'string'))
      {
        this._doc=x.nodeType==9?x:x.ownerDocument?x.ownerDocument:document;
        return this;
      }

      // Create XML document
      if(isIE)
      {
        //this._ieXML=new ActiveXObject("Microsoft.XMLDOM");
        this._doc=new ActiveXObject("Msxml2.DOMDocument");
        this._doc.async=false;
        this._doc.loadXML(x);
      }
      else
        this._doc=(new DOMParser()).parseFromString(x,"text/xml");

      this.set(Meta.obj2array(this._doc.childNodes));
      return this;
    },

    /**
     <method name="select" type="Meta.dom">
     <param name="a" type="string">CSS rules</param>
     <desc>Select elements from the given document.</desc>
     <test>
     <![CDATA[
     return Meta.dom.$().select('body').get(0)==document.body;
     ]]>
     </test>
     </method>
     */
    select:function(a)
    {
      var me=this,
          b=[],
          s=Meta.select;

      if(me.len())
      {
        me.forEach(function(c){
          b=b.concat(s(a,c));
        });
      }
      else
        b=s(a,me.doc());

      return me.$(b);
    },

    /**
     <method name="evalGlobal" type="this">
     <param name="a" type="string">Script string</param>
     <desc>Evaluates a given script string on the global context.</desc>
     </method>
     */
    evalGlobal:function(a)
    {
      var doc=this.doc(),
          script=doc.createElement('script'),
          head=doc.getElementsByTagName('head')[0]||doc.documentElement;

      script.type='text/javascript';

      if(isIE)
        script.text=a;
      else
        script.appendChild(doc.createTextNode(a));

      head.insertBefore(script,head.firstChild);
      head.removeChild(script);
      return this;
    },

    /**
     <method name="glue" type="this">
     <param name="e" type="mixed">Element, Array of elements or HTML string to be used.</param>
     <param name="[t]" type="string">
       Type of insertion, default is append.
       Types:
       before
       after
       prepend
       append
     </param>
     <desc>Insert the given element on the elements</desc>
     </method>
     */
    glue:function(e,t)
    {
      if(e==='')
        return this;

      var g,
          me=this,
          z=glues[t||'append'],
          y=me.$(),
          s=arr.$(),
          u=arr.$();

      // Assume its an element
      if(e.nodeType)
        y.set(e);

      // Assume its a string
      else if(typeof e == 'string')
        y=y.create(e);

      // Assume its an array of elements
      else
        y.set(e);

      // Create document fragment
      g=me.doc().createDocumentFragment();
      y.forEach(function(w){
	// Get scripts
	if(w.nodeName.toLowerCase()=='script')
	  s.push(w);
	else if(w.nodeType==1)
	  s.concat(Meta.obj2array(w.getElementsByTagName('script')));

	g.appendChild(w);
      });
      
      // Process scripts
      s.forEach(function(w){
	if(!w.src)
	{
	  u.push(w.text||w.textContent||w.innerHTML||'');
	  w.parentNode.removeChild(w);
        }
      });
      u=u.join("\n");

      // glue it
      me.forEach(function(v,i){
        z(v,i?g.cloneNode(true):g,v.parentNode);
        if(u)
          me.evalGlobal(u);
      });

      return me;
    },

    /**
     <method name="remove" type="this">
     <desc>Remove all elements from their parentNode.</desc>
     <test>
     <![CDATA[
     var a=document.createElement('div');
     a.id="test";
     document.body.appendChild(a);
     Meta.dom.$(a).remove();
     return !document.getElementById('test');
     ]]>
     </test>
     </method>
     */
    remove:function()
    {
      var x=this._,
          i=x.length,
          v;

      while(i--)
      {
        v=x[i];

        if(v.parentNode)
          v.parentNode.removeChild(v);
      }

      return this;
    },

    /**
     <method name="create" type="Meta.dom">
     <param name="e" type="string">Element to be created</param>
     <desc>Create the given HTML|XML into their respective DOM</desc>
     <test>
     <![CDATA[
     return Meta.dom.$().create('<div>ok</div>').get(0).innerHTML=='ok';
     ]]>
     </test>
     </method>
     */
    create:function(e)
    {
      var a=[],
          b,
          d=this.doc().createElement('div'),
          f,
          s=Meta.string.$(e),
          t,
          u;

      e=s.trim().get();

      t=s.substr(s.lastIndexOf('<'));
      u=t.indexOf(' ');
      if(u<0)
        u=t.indexOf('>');

      t='|'+t.substr(2,u-2).get()+'|';

      if(s.set('|caption|colgroup|col|thead|tfoot|tbody|tr|th|td|').indexOf(t)<0)
        t=0;

      // XML
      if(this.isXML(d))
      {
        b=sbdiv;
        if(!b)
          b=getSBDiv();

        b.innerHTML=e;
        Meta.dom.copyNodes(b.childNodes,d);
      }

      // HTML
      else
      {
        if(t){
          if(t=='|tr|')
            e='<table><tbody>'+e+'</tbody></table>';
          else{
            if(s.set('|th|td|').indexOf(t))
              e='<table><tbody><tr>'+e+'</tr></tbody></table>';
            else
              e='<table>'+e+'</table>';
          }
        }

        if(isIE)
        {
	  // Fix for single script tags in IE
	  d.innerHTML=t?e:'<br>'+e;
	  d.removeChild(d.firstChild);
	}
	else
	  d.innerHTML=e;

        if(t){
          d=d.firstChild;
          if(t=='|tr|')
            d=d.firstChild;
          else if(s.set('|th|td|').indexOf(t))
            d=d.firstChild.firstChild;
        }
      }

      while((b=d.firstChild))
        a.push(d.removeChild(b));

      return this.$(a);
    },

    /**
     <method name="prop" type="mixed">
     <param name="a" type="string">Property name</param>
     <param name="[i]" type="integer">Index of the element.</param>
     <desc>Get Element Property value, null if not found</desc>
     </method>
     */
    prop:function(a,i)
    {
      i=this.get(i||0);
      return i?(a in i?i[a]:null):i;
    },
  
    /**
     <method name="attr" type="mixed">
     <param name="a" type="string">Attribute name</param>
     <param name="[v]" type="mixed">Attribute value</param>
     <desc>Get|Set Element Attributes, null if not found</desc>
     <test>
     <![CDATA[
     var a=document.createElement('div'),t='',b=Meta.dom.$(a);
     a.id='perro';
     t=b.attr('id')=='perro';
     b.attr('id','gato');
     return t && b.attr('id')=='gato';
     ]]>
     </test>
     </method>
     */
    attr:function(a,v)
    {
      var i,
          x=this._,
          l=x.length,
          b,
          w,
          c;
      
      if(!l)
        return null;
      
      b=x[0];
      c=b.attributes;
      
      if(!a)
        return c;

      // Set attribute
      if(v!==undefined)
      {
        i=l;
        while(i--)
	{
	  if(v===null&&x[i].removeAttribute)
	    x[i].removeAttribute(a);
	  else
	    x[i].setAttribute(a,v);
	}

        return this;
      }

      if(!c)
        return null;

      // Get attribute
      //return isIE?c[a].value:b.getAttribute(a);
      return b.getAttribute(a);
    },


    /**
     <method name="data" type="this">
     <param name="a" type="string">Data name</param>
     <param name="[v]" type="mixed">Data value</param>
     <desc>Get|Set Element data value</desc>
     <test>
     <![CDATA[
     var a=document.createElement('div'),t='',b=Meta.dom.$(a);
     a.dataset['id']='1';
     t=b.data('id')=='1';
     b.data('id','2');
     return t && b.data('id')=='2';
     ]]>
     </test>
     </method>
     */
    data:function(a,v)
    {
      var x=this._,
          w,
          y=Meta.string.$(a).toCamelCase('-'),
          i=x.length;

      if(v===undefined)
        return i?x[0].dataset[y]:null;
      
      while(i--)
        x[i].dataset[y]=v;
      
      return this;
    },

    /**
     <method name="css" type="this">
     <param name="a" type="string">Style name</param>
     <param name="[v]" type="mixed">Style value</param>
     <desc>Get|Set Element CSS style</desc>
     <test>
     <![CDATA[
     var a=document.createElement('div'),t='',b=Meta.dom.$(a);
     a.style.zIndex='1';
     t=b.css('zIndex')=='1';
     b.css('zIndex','2');
     return t && b.css('zIndex')=='2';
     ]]>
     </test>
     </method>
     */
    css:function(a,v)
    {
      var x=this._,
          w,
          i=x.length;

      a=css2js(a);
      if(v===undefined)
        return i?x[0].style[a]:null;
      
      while(i--)
        x[i].style[a]=v;
      
      return this;
    },

    /**
     <method name="style" type="string">
     <param name="s" type="string">Style</param>
     <param name="[i]" type="integer">Index, default 0</param>
     <desc>Try to get the element computed style</desc>
     </method>
     */
    style:function(s,i)
    {
      i=this.get(i||0);

      if(i)
      {
        s=css2js(s);
      
        i=window.getComputedStyle
          ? window.getComputedStyle(i,null).getPropertyValue(s)
          : i.currentStyle[s];
      }
    
      return i;
    },

    /**
     <method name="val" type="mixed">
     <param name="[v]" type="string">Value to set</param>
     <desc>
       Get|Set Element Value.
       If the element is a SELECT, return the selected OPTION value.
       If the SELECT has multiple attribute set, return an array with all the selected OPTION's values.
       If the OPTION has no value set, returns the text in the OPTION.
       Returns this or string
     </desc>
     <test>
     <![CDATA[
     var a=document.createElement('input'),t='',b=Meta.dom.$(a);
     a.type="text";
     a.value='perro';
     t=b.val()=='perro';
     b.val('gato');
     t=t&&b.val()=='gato';
     b=b.create('<select><option value="1">1</option><option selected="selected" value="2">2</option></select>');
     t=t&&b.val()=='2';
     b.val('1');
     return t&&b.val()=='1';
     ]]>
     </test>
     </method>
     */
    val:function(v)
    {
      var i,
          a=[],
          b,
          x=this._,
          w,
          j=x.length,
          o=Meta.indexOf;

      if(v!==undefined)
      {
        while(j--)
        {
          w=x[j];

	  if(w.nodeName=='SELECT')
          {
            if(!v.push)
	      v=[v];

	    b=w.options;
	    i=b.length;
            while(i--)
	    {
              a=b[i];
              a.selected=false;
	      if(o(v,a.value,1)>-1)
                a.selected=true;
	    }
          }
          else
            w.value=v;
        }

        return this;
      }

      if(!j)
        return null;

      v=x[0];
      
      if(v.nodeName!='SELECT')
        return v.value||null;
      
      if(!v.multiple)
        return v.options[v.selectedIndex].value;

      v=v.options;
      for(i in v)
        if(v[i].selected)a.push(v[i].value);
      return a;
    },

    /**
     <method name="outer" type="string">
     <param name="[a]" type="mixed">Index or Element. Default index is 0</param>
     <desc>Get the outerHTML of the given element</desc>
     <test>
     <![CDATA[
     return Meta.string.$(Meta.dom.$().create('<div>1</div>').outer().toLowerCase()).trim().get()=='<div>1</div>';
     ]]>
     </test>
     </method>
     */
    outer:function(a)
    {
      var x=this._,
          l=x.length,
          b,
          c,
          d;

      a=x[a||0];

      if(!a||!a.nodeType)
        return null;

      if(a.nodeType==3)
        return a.nodeValue;

      // not IE
      if(!isIE)
      {
        // XML
        if(this.isXML(a))
          return (new XMLSerializer()).serializeToString(a);

        // HTML
        b=this.doc().createElement('b');
        b.appendChild(a);
        return b.innerHTML;
      }

      // IE
      b=this.isXML(a)?'xml':'outerHTML';

      if(a.nodeType!=11)
        c=a[b];
      else
      {
	c=[];
	d=a.childNodes;
	l=d.length;
	while(l--)
	  c.push(d[l][b]);
	c.reverse();
	c=c.join('');
      }

      return c;
    },

    /**
     <method name="inner" type="mixed">
     <param name="[a]" type="mixed">Html or Element to insert</param>
     <param name="[w]" type="bool">Super cloned. Clones the elements in a unified way and tries to preserve the events.</param>
     <desc>Get|Set the innerHTML of the elements</desc>
     <test>
     <![CDATA[
     var a=Meta.dom.$().create('<div>1</div>'),b;
     b=a.inner()=='1';
     a.inner('2');
     return b && a.inner()=='2';
     ]]>
     </test>
     </method>
     */
    inner:function(a,w)
    {
      var x=this._,
          b,
          s='',
          c,
          j,
          k,
          l;

      if(a===undefined)
      {
        if(!x.length)
          return null;

        b=x[0];
        
        // HTML
        if(!this.isXML(b))
          return b.innerHTML;

        // XML
        k=this.$();
        c=b.childNodes;
        for(j=0,l=c.length;j<l;j++)
          s+=k.set(c[j]).outer();
        
        return s;
      }

      this.empty().append(a,w);
      return this;
    },

    /**
     <method name="text" type="mixed">
     <param name="[a]" type="string">Text</param>
     <desc>Get the text of the first element if no text is given else Set the text of the elements</desc>
     <test>
     <![CDATA[
     var a=Meta.dom.$().create('<div><b>1</b></div>'),b,s=Meta.string.$();
     b=a.text()=='1';
     a.text('<br>');
     return b && a.text()=='<br>';
     ]]>
     </test>
     </method>
     */
    text:function(a)
    {
      if(a===undefined)
      {
        var x=this._;
        if(!x.length)
          return null;

        a=x[0];
        return a.text||a.textContent||(a.innerHTML?a.innerHTML.replace(/<\/?[^>]+>/gi,''):'');
      }

      this.empty().append(this.doc().createTextNode(a));
      return this;
    },

    /**
     <method name="elements" type="mixed">
     <desc>Get the current form elements or element</desc>
     <param name="[a]" type="string">Name of the element to return</param>
     </method>
     */
    elements:function(a)
    {
      var x=this._;
      if(!x.length)
        return null;

      var i,
          f=[],
          g=x[0];

      if(g.nodeName.toUpperCase()!='FORM')
        return null;

      g=g.elements;
      i=g.length;

      while(i--)
      {
        if(a===undefined)
          f.push(f[g[i].name]=g[i]);
        else if(g[i].name==a)
	  return g[i];
      }
      
      return a?null:f;
    },

    /**
     <method name="submit" type="this">
     <desc>Submit a form using ajax</desc>
     <param name="[a]" type="function">Callback function</param>
     </method>
     */
    submit:function(a)
    {
      var x=this._;
      
      if(!x.length)
        return this;

      a=a||function(){};
      
      var b=this.elements(),
          c=this.$(),
          d=[],
          i=0,
          e,
          f,
          p;

      for(;i<b.length;i++)
      {
        p=b[i];
        if(p.nodeName.toUpperCase()=="FIELDSET")
          continue;
        if(p.nodeName.toUpperCase()=="INPUT" &&
          (p.type.toLowerCase()=="checkbox" || p.type.toLowerCase()=="radio") &&
	  !p['checked'])
	    continue;

        e=c.set(p).val();
        f=encodeURIComponent(p.name,1)+'=';

        if(Meta.its(e,'array'))
          Meta.each(e,function(v)
	    {
	      d.push(f+encodeURIComponent((v===null||v===undefined)?'':v,1));
	    });
        else
          d.push(f+encodeURIComponent((e===null||e===undefined)?'':e,1));
      }

      Meta.ajax({url:x[0].action,callbacks:a,method:'POST',data:d.join('&')});
      return this;
    },
      
    /**
     <method name="nodes" type="array">
     <param name="[i]" type="integer">Index of the element. Default is 0</param>
     <desc>Get the given element childNodes</desc>
     </method>
     */
    nodes:function(i)
    {
      var x=this._,
          a=[],
          j,
          c=x.length,
          l;

      i=i||0;
      
      if(c<=i)
        return null;

      c=x[i].childNodes;
      
      l=c.length;
      
      for(j=0;j<l;j++)
        if(c[j].nodeType==1)
          a.push(c[j]);

      return a;
    },

    /**
     <method name="empty" type="this">
     <desc>Empty all the elements</desc>
     <test>
     <![CDATA[
     var a=Meta.dom.$().create('<div><b>1</b></div>');
     return a.empty().inner()=='';
     ]]>
     </test>
     </method>
     */
    empty:function()
    {
      var me=this,
          w,
          x=this._,
          i=x.length,
          xml=me.isXML(); // Asume all the nodes are of the same type as the doc

      while(i--)
      {
        w=x[i];
        if(!xml)
          w.innerHTML='';
        else while(w.firstChild)
	  w.removeChild(w.firstChild);
      }

      return this;
    },

    /**
     <method name="hasClass" type="bool">
     <desc>Verify if the element has the given class.</desc>
     <param name="a" type="string">Class name</param>
     <param name="[b]" type="integer">Index of the element. Default 0.</param>
     <test>
     <![CDATA[
     var a=Meta.dom.$().create('<div class="perro gato"></div>');
     return a.hasClass('perro');
     ]]>
     </test>
     </method>
     */
    hasClass:function(a,b)
    {
      var x=this._,
          c=x.length;

      b=b||0;

      if(c<=b)
        return false;
      
      b=x[b];
      
      if(!b.className)
        return false;
      
      return (' '+b.className+' ').indexOf(' '+a+' ')>-1;
    },

    /**
     <method name="addClass" type="this">
     <desc>Add the given class to the elements.</desc>
     <param name="a" type="string">Class name</param>
     <test>
     <![CDATA[
     var a=Meta.dom.$().create('<div class="perro gato"></div>'),b;
     b=!a.hasClass('yo');
     a.addClass('yo');
     return b&&a.hasClass('yo');
     ]]>
     </test>
     </method>
     */
    addClass:function(a)
    {
      var x=this._,
          i=x.length,
          v,
          z=str,//Meta.string.$(),
          y=arr;//Meta.array.$();
      
      while(i--)
      {
        v=x[i];
        if('className' in v)
        {
          v.className=z.set(y.set(v.className.split(' ')).
            insert(a).
            unique().
            get().
            join(' ')).
            trim().
            get();
        }
      }

      return this;
    },

    /**
     <method name="rmClass" type="this">
     <desc>Removes the given class from the elements.</desc>
     <param name="a" type="string">Class name</param>
     <test>
     <![CDATA[
     var a=Meta.dom.$().create('<div class="perro gato"></div>'),b;
     b=a.hasClass('gato');
     a.rmClass('gato');
     return b&&!a.hasClass('gato');
     ]]>
     </test>
     </method>
     */
    rmClass:function(a)
    {
      var x=this._,
          i=x.length,
          v,
          z=str,
          y=arr,
          d,c;

      while(i--)
      {
        v=x[i];
        if(v.className)
        {
          d=y.set(v.className.split(' ')).unique();
	  c=d.indexOf(a);
	  if(c>-1)
	    v.className=z.set(d.splice(c,1).get().join(' ')).trim().get();
        }
      }

      return this;
    },

    /**
     <method name="dims" type="object">
     <param name="[i]" type="integer">Index, default 0</param>
     <desc>Try to get the element dimensions. {top,left,width,height}</desc>
     </method>
     */
    dims:function(i)
    {
      i=this.get(i||0);
      if(i)
      {
        var l=i.offsetLeft||0,
            t=i.offsetTop||0,
            w=i.offsetWidth||0,
            h=i.offsetHeight||0;
        
        while((i=i.offsetParent))
        {
          l+=i.offsetLeft-i.scrollLeft+(i.clientLeft?i.clientLeft:0);
          t+=i.offsetTop-i.scrollTop+(i.clientTop?i.clientTop:0);
        }

        i={left:l,top:t,width:w,height:h};
      }
    
      return i;
    },

    /**
     <method name="scrollDims" type="object">
     <param name="[i]" type="integer">Index, default 0</param>
     <desc>Try to get the element scroll dimensions. {top,left,width,height}</desc>
     </method>
     */
    scrollDims:function(i)
    {
      return (i=this.get(i||0))
        ?{left:i.scrollX||i.scrollLeft,top:i.scrollY||i.scrollTop,width:i.scrollWidth||0,height:i.scrollHeight||0}
        :i;
    },
  
    /**
     <method name="opacity" type="this">
     <param name="o" type="float">Percentage of opacity</param>
     <desc>Set the opacity of the objects</desc>
     </method>
     */
    opacity:function(o)
    {
      var s,
          p=Math.round(o*100);

      return this.
        css('MozOpacity',o).
        css('opacity',o).
        css('KHTMLOpacity',o).
        css('zoom',1).
        css('filter',"alpha(opacity="+p+")");
    },

    /**
     <method name="hide" type="this">
     <desc>Hide the element</desc>
     </method>
     */
    hide:function(){return this.css('display','none');},

    /**
     <method name="show" type="this">
     <param name="[a]" type="string">Default display property.</param>
     <desc>Shows the element with its default display</desc>
     </method>
     */
    show:function(a){return this.css('display',a||'');},

    /**
     <method name="parent" type="Meta.dom">
     <param name="[i]" type="integer">Index of the element.</param>
     <desc>Returns the parentNode of the element.</desc>
     </method>
     */
    parent:function(i)
    {
      return this.$(this.prop('parentNode',i));
    },
      
    /**
     <method name="next" type="Meta.dom">
     <param name="[i]" type="integer">Index of the element.</param>
     <desc>Returns the nextSibling of the element.</desc>
     </method>
     */
    next:function(i)
    {
      i=this.get(i||0);
      while(i&&(i=i.nextSibling)&&i.nodeType!=1){}
      return this.$(i);
    },

    /**
     <method name="prev" type="Meta.dom">
     <param name="[i]" type="integer">Index of the element.</param>
     <desc>Returns the previousSibling of the element.</desc>
     </method>
     */
    prev:function(i)
    {
      i=this.get(i||0);
      while(i&&(i=i.previousSibling)&&i.nodeType!=1){}
      return this.$(i);
    },
      
    /**
     <method name="first" type="Meta.dom">
     <param name="[i]" type="integer">Index of the element.</param>
     <desc>Returns the firstChild of the element.</desc>
     </method>
     */
    first:function(i)
    {
      i=this.prop('firstChild',i);
      while(i&&i.nodeType!=1)
        i=i.nextSibling;
      return this.$(i);
    },

    /**
     <method name="last" type="Meta.dom">
     <param name="[i]" type="integer">Index of the element.</param>
     <desc>Returns the lastChild of the element.</desc>
     </method>
     */
    last:function(i)
    {
      i=this.prop('lastChild',i);
      while(i&&i.nodeType!=1)
        i=i.previousSibling;
      return this.$(i);
    },

    /**
     <method name="value" type="element">
     <param name="[i]" type="integer">Index of the element.</param>
     <desc>Returns the nodeValue of the element.</desc>
     </method>
     */
    value:function(i)
    {
      return this.prop('nodeValue',i);
    },
      
    /**
     <method name="type" type="element">
     <param name="[i]" type="integer">Index of the element.</param>
     <desc>Returns the nodeType of the element.</desc>
     </method>
     */
    type:function(i)
    {
      return this.prop('nodeType',i);
    },

    /**
     <method name="name" type="element">
     <param name="[i]" type="integer">Index of the element.</param>
     <desc>Returns the nodeName of the element.</desc>
     </method>
     */
    name:function(i)
    {
      return this.prop('nodeName',i);
    },

    /**
     <method name="isXML" type="bool">
     <param name="[a]" type="element">Element to be check if it belongs to an XML.</param>
     <desc>Checks if the given element or the current document is an XML.</desc>
     </method>
     */
    isXML:function(a)
    {
      if(!a)
        a=this.doc();

      a=a.nodeType==9?a:a.ownerDocument;

      return a.documentElement.nodeName!=='HTML';
    }

  };
}()).extend(function()
{
  // Generate shortcuts for child method
  Meta.genProperties('prepend,append,before,after,replace',
    function c(d){return function(e){return this.glue(e,d);};},
    this);
}).extend(function()
{
  var map={
        prependTo:'prepend',
        appendTo:'append',
        insertBefore:'before',
        insertAfter:'after',
        replaceIn:'replace'
      };

  // Generate shortcuts for child method
  Meta.genProperties('prependTo,appendTo,insertBefore,insertAfter,replaceIn',
    function c(d)
    {
      return function(e)
        {
          var a=this._;
          return this.
            set(e).
	    glue(a,map[d]).
	    set(a);
        };
    },
    this);
});

/**
 <method name="prepend" type="this">
 <param name="e" type="element">Element to be prepended</param>
 <desc>Insert the given element at the start of the elements</desc>
 </method>

 <method name="append" type="this">
 <param name="e" type="element">Element to be appended</param>
 <desc>Insert the given element at the end of the elements</desc>
 </method>

 <method name="before" type="this">
 <param name="e" type="element">Element to be inserted</param>
 <desc>Insert the given element before the elements</desc>
 </method>

 <method name="after" type="this">
 <param name="e" type="element">Element to be inserted</param>
 <desc>Insert the given element after the elements</desc>
 </method>

 <method name="replace" type="this">
 <param name="e" type="element">Element to be inserted</param>
 <desc>Replace the elements with the given one</desc>
 </method>

 <method name="prependTo" type="this">
 <param name="e" type="element">Element to be prepended</param>
 <desc>Insert the given element at the start of the elements</desc>
 </method>

 <method name="appendTo" type="this">
 <param name="e" type="element">Element to be appended</param>
 <desc>Insert the given element at the end of the elements</desc>
 </method>

 <method name="insertBefore" type="this">
 <param name="e" type="element">Element to be inserted</param>
 <desc>Insert the given element before the elements</desc>
 </method>

 <method name="insertAfter" type="this">
 <param name="e" type="element">Element after wich the insertion will occour.</param>
 <desc>Insert the current elements after the given element</desc>
 </method>

 <method name="replaceIn" type="this">
 <param name="e" type="element">Element to replaced with.</param>
 <desc>Replace the given element with the actual one.</desc>
 </method>
 */

/** </class> */

/**
 <function name="Meta.dom.copyNodes" type="element">
 <param name="src" type="array">Array of nodes to copy</param>
 <param name="dest" type="element">Destination node</param>
 <param name="[wid]" type="bool">Set ids for all elements</param>
 <param name="[n]" type="element">Element to return mapped version</param>
 <desc>Try to copy childNodes to another document</desc>
 </function>
 */
Meta.dom.copyNodes=function(src,dest,wid,n)
{
  var _doc=dest.ownerDocument?dest.ownerDocument:(dest.nodeType==9?dest:document),

  l=function(a,c)
  {
    var b,
        i=0,
        j=c.length,
        m;
    
    for(;i<j;i++)
    {
      if(c[i].nodeType==1)
        b=a.appendChild(k(c[i]));
      else if(c[i].nodeType==3)
	a.appendChild(_doc.createTextNode(c[i].nodeValue));

      if(n==c[i])n=b;
    }
  },

  k=function(a)
  {
    // Set the uniqueID here, if needed, so it gets cloned
    if(wid && a && !a.id && Meta.has(a,'uniqueID'))
      a.id=a.uniqueID;

    var e=Meta.dom.cloneTag(a);

    // copy childs
    l(e,a.childNodes);
    return e;
  };

  l(dest,src);
  return n;
};

/**
 <function name="Meta.dom.cloneTag" type="element">
 <desc>Copy the given element into a new single equal one.</desc>
 <param name="a" type="element">Element to be cloned</param>
 </function>
 */
Meta.dom.cloneTag=function(a,doc)
{
  doc=doc||(a.ownerDocument?a.ownerDocument:document);

  var b=doc.createElement(a.nodeName.toLowerCase()),
      attr,
      i;

  // copy attributes
  attr=a.attributes;
  i=attr.length;
  while(i--)
    b.setAttribute(attr[i].name,attr[i].value);

  // CSS?

  return b;
};

/**
 <function name="Meta.dom.cloneNode" type="element">
 <desc>Copy the given element into a new equal one.</desc>
 <param name="a" type="element">Element to be cloned</param>
 </function>
 */
Meta.dom.cloneNode=function(a,doc)
{
  doc=doc||(a.ownerDocument?a.ownerDocument:document);
  if(a.nodeType==3)
    return doc.createTextNode(a.nodeValue);

  var b=Meta.dom.cloneTag(a,doc);
  Meta.dom.copyNodes(a.childNodes,b);
  return b;
};

/**
 <function name="Meta.dom.ready" type="void">
 <desc>Run the given function just after the DOM is loaded</desc>
 <param name="b" type="function">Callback function</param>
 </function>
 */
Meta.dom.ready=function()
{
  var ready=0,
      a,
      t,
      ev=Meta.events.$(),
      cb;

  // Sets the custom event ready, for the window object
  ev.extend({
    fireReady:function()
    {
      if(ready)
        return; // if ready!=0 this function already was executed!
      
      ready=1;
      this.fireEvent('ready',window);
      
      if(t)
        clearInterval(t);
    }
  });


  // Create callback
  cb=ev.callback('fireReady');

  // Set browsers just after DOM is loaded detection
  if(Meta.has(document,'addEventListener')) // Mozilla
      document.addEventListener("DOMContentLoaded",cb,false);
  else if(Meta.has(window,'ActiveXObject')) // IE
  {
    a=document.createElement('script');
    a.onreadystatechange=function()
    {
      if((/loaded|complete/).test(a.readyState))
      {
	cb();
	a.onreadystatechange=null;
      }
    };
    a.defer=true;
    a.src="javascript:void(0);";
    document.getElementsByTagName('HEAD')[0].appendChild(a);
  }
  else if((/Safari/i).test(navigator.userAgent)) // Safari
  {
    t=setInterval(function()
      {
	if((/loaded|complete/).test(document.readyState))
          cb();
      },10);
  }

  // Set the callback on window.onload in case this is called first or didn't find the browser
  Meta.dom.addEvent('load',window,cb);

  // Actual function
  return function(b)
  {
      if(ready)
        b();
      else
        ev.addEvent('ready',window,b);
  };
}();


/**
 <function name="Meta.dom.purge" type="void">
 <param name="d" type="element">Element to be purged</param>
 <desc>
 From: http://javascript.crockford.com/memory/leak.html
 
 Takes a reference to a DOM element as an argument.
 It loops through the element's (and childs) attributes.
 If it finds any functions, it nulls them out.
 This breaks the cycle, allowing memory to be reclaimed.
 The purge function is harmless on Mozilla and Opera.
 It is essential on IE.
 The purge function should be called before removing any element,
 either by the removeChild method, or by setting the innerHTML property.
 </desc>
 </function>
 */
Meta.dom.purge=function(d)
{
  if(!isIE&&!d.attributes)
    return;

  var a=d.attributes,
      i,
      n;

  if(a)
    for(i=a.length;i--;)
    {
      n=a[i].name;
      if(typeof d[n]==='function')
	d[n]=null;
    }

  a=d.childNodes;
  if(a)
    for(i=a.length;i--;)
      Meta.dom.purge(a[i]);
};
/*
 Copyright (c) 2015 Rolando González Chévere <rolosworld@gmail.com>
 
 This file is part of Meta.
 
 Meta is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License version 3
 as published by the Free Software Foundation.
 
 Meta is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with Meta.  If not, see <http://www.gnu.org/licenses/>.
*/

/**
 <class name="Meta.websocketevent">
 <desc>WebSocket events manager</desc>
 <inherit>Meta.eventtarget</inherit>
 */
Meta.websocketevent=Meta(Meta.eventtarget).extend({
  valid_type:' open message error close '
});
/** </class> */
/*
 Copyright (c) 2015 Rolando González Chévere <rolosworld@gmail.com>
 
 This file is part of Meta.
 
 Meta is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License version 3
 as published by the Free Software Foundation.
 
 Meta is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with Meta.  If not, see <http://www.gnu.org/licenses/>.
*/

/**
 <class name="Meta.websocket">
 <desc>WebSocket manager</desc>
 <inherit>Meta.websocketevent</inherit>
 */
Meta.websocket=Meta(Meta.websocketevent).extend({
  /**
     <method name="connect" type="this">
     <desc>Connect to the given url</desc>
     <param name="u" type="string">WebSocket URL</param>
     </method>
  */
  connect: function(u) {
    var me = this;
    me.set(new WebSocket(u));
    me.fire('connect');
    return me;
  },

  /**
     <method name="close" type="this">
     <desc>Close the connection</desc>
     </method>
  */
  close: function() {
    var me = this;
    var a = me.get();
    if (a) {
        a.close();
    }
    me.fire('close');
    return me;
  },

  /**
     <method name="send" type="this">
     <desc>Send the given string to the server</desc>
     <param name="d" type="string">String to send</param>
     </method>
  */
  send: function(d) {
    var me = this;
    var j=JSON.stringify(d);
    var a = me.get();
    if (a) {
        a.send(j);
    }
    me.fire('send',j);
    return me;
  }
});
/** </class> */
}(window));
