function makeProjectLink(name) {
	return { title: name, href: "https://"+name.toLowerCase()+".dev.java.net/" };
}

var regions = [
  {
  	title: "Planet JXTA",
  	href:  "http://rdv.jxtahosts.net/planetjxta/",
  	match: []
  },
  {
  	title: "Core",
  	href:  "https://jxta.dev.java.net/",
  	match: [
  	],
  	children: [
  		{ title: "Home", href: "https://jxta.dev.java.net/" },
  		{ title: "Specification", href: "https://jxta-spec.dev.java.net/" },
  		{ title: "Java SE", href: "https://jxta-jxse.dev.java.net/" },
  		{ title: "C/C++/C#", href: "https://jxta-c.dev.java.net/" },
  		{ title: "Java ME", href: "https://jxta-jxme.dev.java.net/" },
  		{ title: "Tutorial", href: "https://jxta-guide.dev.java.net/" }
  	]
  },
  {     title: "Wiki", 
        href: "http://wiki.java.net/bin/view/Jxta/WebHome",
  	match: []
  }
/*  ,
  {
    title: "Persistence",
    href:  "http://glassfish.dev.java.net/",
    match: [],
    children: [
        { title: "abc", href: "#" },
        { title: "def", href: "#" },
        { title: "ghi", href: "#" },
        { title: "jkl", href: "#" }
    ]
  }
*/
];


// default values of <a href='...' match='...'> to simplify project_tools.html
var defaultMatchPatterns = {
	"/servlets/ProjectNewsList":		"/servlets/(ProjectNewsList|NewsItemView).*",
	"/servlets/ProjectMemberList":		"/servlets/Project(MemberList|MemberAdd|Invite).*",
	"/servlets/ProjectMailingListList":	"/servlets/(ProjectMailingList|Summarize|Search)List.*",
	"/servlets/ProjectIssues":			"/issues/.*",
	"/issues/":							"/issues/.*"
};



function addLoadEvent(func) {
  var oldonload = window.onload;
  if (typeof window.onload != 'function') {
    window.onload = func;
  } else {
    window.onload = function() {
      if (oldonload)  oldonload();
      func();
    }
  }
}

function createRegions() {
	var rdiv = document.getElementById("regions");	// On Wiki 'regions' div already exists.
	
	var html=[];
	if(rdiv==null)
		html.push("<div align=right><ul id=regions>");
	
	for( var i=regions.length-1; i>=0; i-- ) {
		var r = regions[i];
		
		// is this the current region?
		var hit = false;
		for( var j=0; j<r.match.length; j++ ) {
			if(new String(window.location.href).match(new RegExp(r.match[j]))) {
				hit = true;
				break;
			}
		}
		if(r.children) {
			for( var j=0; j<r.children.length; j++ ) {
				if(new String(window.location.href).indexOf(r.children[j].href)==0) {
					hit = true;
					break;
				}
			}
		}
		
		if(hit)
			html.push("<li id=current-region><a href=");
		else
			html.push("<li><a href=");
		html.push(r.href);
		html.push(">");
		html.push(r.title);
		html.push("</a>");
		if(r.children!=null && !document.all) {
			html.push("<ul>");
			for( var j=0; j<r.children.length; j++ ) {
				var c = r.children[j];
				html.push("<li><a href=");
				html.push(c.href);
				html.push(">");
				html.push(c.title);
				html.push("</a></li>");
			}
			html.push("</ul>");
		}
		html.push("</li>");
	}
	html.push("<li id=regions-leadin><a>&nbsp;</a></li>");
	if(rdiv==null)
		html.push("</ul></div>");
	
	// inject HTML
	if(rdiv==null) {
		var box = document.createElement("div");
		box.id = "regions-box";
		var banner = document.getElementById("banner");
		banner.insertBefore(box,banner.firstChild);
		box.innerHTML = html.join('');
	} else {
		rdiv.innerHTML = html.join('');
	}
	
	// attach event handler, since IE can't handle :hover
	/* this still doesn't seem to work with IE7...
	if (document.all) {
		var ul = document.getElementById("regions");
		for (i=0; i<ul.childNodes.length; i++) {
			var node = ul.childNodes[i];
			if (node.nodeName=="LI") {
				node.onmouseover=function() {
					this.className+=" over";
				}
				node.onmouseout=function() {
					this.className=this.className.replace(" over", "");
				}
			}
		}
	}*/
}

// apply theme to WIki
function wikiInit() {
	createRegions();
}

// apply theme to java.net
function djnInit() {
	createRegions();
	
	// this is the parent group that should show up in the title bar
	var foundGroup = null;
	
	// create zones
	(function() {
		// find which zone we are in
		var alreadyFound = false;
		function findMatch(zones,group) {
			var found = false;
			for( var i=0; i<zones.length; i++ ) {
				(function (z,group) {
					var matchFunction = z.match;
					if(matchFunction==null)
						matchFunction = function() { return z.href.indexOf(window.location.hostname)!=-1; }
					if(matchFunction() && !alreadyFound) {
						z.current = true;
						alreadyFound = true;
						foundGroup = group;
						found = true;
					}
					
					if(z.group) group = z;
					
					if(z.zones!=null) {
						var f = findMatch(z.zones,group);
						z.expanded = f || z.current;
						found |= f;
					}
				})(zones[i],group);
			}
			return found;
		}
		findMatch(zones,null);
		
		// create fragment to inject
		var html = [];
		var foundCurrent = false;
		var currentDepth;
		function createZones(zones,depth) {
			for( var i=0; i<zones.length; i++ ) {
				if(zones[i].current) {
					html.push("<dt id=current-zone class='");
					foundCurrent = true;
					currentDepth = depth;
				} else
				if(!foundCurrent)
					html.push("<dt class='before-current ");
				else
					html.push("<dt class='after-current ");
				html.push("depth"+depth);
				html.push("'><a href='");
				html.push(zones[i].href);
				html.push("'>");
				html.push(zones[i].title);
				html.push("</a></dt>");
				if(zones[i].zones!=null && zones[i].expanded)
					createZones(zones[i].zones,depth+1);
			}
		}
		createZones(zones,0);
		
		// detach the menubar so that it will remain intact when we overwrite project tools
		var menubar = document.getElementById("menubar");
		if(menubar==null)	return;	// huh?
		menubar.className="depth"+currentDepth;
		menubar.parentNode.removeChild(menubar);
		
		// insert the zone list into the navigation bar
		var projecttools = document.getElementById("projecttools");
		projecttools.innerHTML = html.join('');
		
		// insert the menubar
		var curZone = document.getElementById("current-zone");
		if(curZone!=null)
			projecttools.insertBefore(menubar, curZone.nextSibling);
		else
			projecttools.appendChild(menubar); // TODO: will come back to this later
		
		// kill all the boxes in front of the projecttools
		while(projecttools.previousSibling!=null) {
			projecttools.parentNode.removeChild(projecttools.previousSibling);
		}
	})();





	// update menubar by using the current location
	(function() {
	  // adds a CSS class to the element
	  function addClass(e,clazz) {
	    if(e.className!=null)
	      e.className += ' '+clazz;
	    else
	      e.className = clazz;
	  }
	  
	  // check if element has a CSS class
	  function hasClass(e,clazz) {
	    if(e.className==null)
	      return false;
	    
	    var list = e.className.split(/\s+/);
	    for( var i=0; i<list.length; i++ ) {
	      if(list[i]==clazz) return true;
	    }
	    return false;
	  }
	  
	  // remove a CSS class
	  function removeClass(e,clazz) {
	    if(e.className==null)
	      return false;
	    
	    var list = e.className.split(/\s+/);
	    var r = [];
	    for( var i=0; i<list.length; i++ ) {
	      if(list[i]!=clazz) r.push(list[i]);
	    }
	    e.className = r.join(' ');
	  }
	  
	  var menubar = document.getElementById("menubar");
	  if(menubar==null)	return;	// huh?
	  
	  // LIs that have child ULs is 'parent'
	  var items = menubar.getElementsByTagName("UL");
	  for (var i=0; i<items.length; i++ ) {
	    var ul = items[i];
	    addClass(ul.parentNode,"parent");
	  }
	  
	  // LIs/ULs that are in the path of current page is 'active'
	  var loc = window.location.href;
	  function matches(a) {
		if(a.href==loc)	return true; // location match
		var m = a.getAttribute("match");
		if(m==null)
			m = defaultMatchPatterns[a.getAttribute("href")];
		
		return m!=null && loc.match(new RegExp(m));
	  }
	  var items = menubar.getElementsByTagName("a");
	  for( var i=0; i<items.length; i++ ) {
	    var a = items[i];
	    if(matches(a)) {
	      // found match. mark ancestor nodes as active
	      var e = a.parentNode;
	      while(e!=menubar) {
	        addClass(e,"active");
	        e=e.parentNode;
	      }
	      break;
	    }
	  }
	  
	  // install expand/collapse handler for targetless intermediate A tags
	  var items = menubar.getElementsByTagName("a");
	  for( var i=0; i<items.length; i++ ) {
	    var a = items[i];
	    var href = a.getAttribute("href"); // IE returns fully absolutized href, so check for things that end with '#'
	    if(href!=null && href!="" && href.charAt(href.length-1)=='#') {// be defensive
		    a.onclick = function() {
		      var li = this.parentNode;
		      if(hasClass(li,"expanded")) {
		        removeClass(li,"expanded");
		      } else {
		        addClass(li,"expanded");
		      }
		      return false;
		    };
		    addClass(this.parent,"collapsed");
	    }
	  }
	  
	  
	  // all non-'active' LIs are 'inactive'
	  // all non-'parent' LIs are 'leaf'
	  var items = menubar.getElementsByTagName("LI");
	  for( var i=0; i<items.length; i++ ) {
	    var li = items[i];
	    if(!hasClass(li,"active"))
	      addClass(li,"inactive");
	    if(!hasClass(li,"parent"))
	      addClass(li,"leaf");
	  }
	})();






	// update the top-left corner of the page from the current project information
	(function() {
	 	/* don't update logo-box if exist */
		if (null != document.getElementById("logo-box"))
			return;
		var box = document.createElement("div");
		box.id = "logo-box";
		
		var html = [];
		
		html.push("<a href=https://jxta.dev.java.net/><img src=https://jxta.dev.java.net/sun_jxta.gif></a>");
		html.push("<a href=https://jxta.dev.java.net/>JXTA</a>");
		
		function append(url,title) {
			if(title==null)		return;
			html.push(" &#xBB; <a href="+url+">");
			html.push(title);
			html.push("</a>");
		}
		
		if(foundGroup!=null)
			append(foundGroup.href, foundGroup.title);
		append("/", info.title);
		
		if(info.logo!=null && info.logo!="") {
			html.push("<a href=/><img src="+info.logo+"></a>");
		}
		
		box.innerHTML = html.join('');
		
		// insert after the login bar
		var bar = document.getElementById("regions-box");
		bar.parentNode.appendChild(box);
	})();





	// put the "hosted on java.net link"
	(function() {
		var box = document.createElement("div");
		var pt = document.getElementById("projecttools");
		if(pt==null)	return;	// huh?
		pt.parentNode.insertBefore(box,pt.nextSibling);
		
		box.id = "hosted-on-javanet";
		box.innerHTML = "<a href='https://www.java.net/'><img src='https://jxta.dev.java.net/image/javanet_button_170.gif'></a>";
		box.innerHTML += "<a href='http://glassfish.dev.java.net/'><img src='image/glassfish_logo.gif'></a>"
		box.innerHTML += "<a href='http://java.sun.com/'><img src='image/java_logo_rgb.png'></a>"
	})();

	// re-display everything
	document.getElementById("main").parentNode.style.display="block";
	document.getElementById("banner").style.display="block";
}

if(window.location.href.indexOf("http://localhost:8080/")!=-1
|| window.location.href.indexOf("http://wiki.jxta.java.net/")!=-1)
	addLoadEvent(wikiInit);
else {
	// add referene to theme.css
	document.write('<link rel="stylesheet" type="text/css" href="https://jxta.dev.java.net/theme.css"/>');
	addLoadEvent(djnInit);
}

// add the open search link.
document.write('<link rel="search" type="application/opensearchdescription+xml" href="https://glassfish.dev.java.net/coolstuff/javanet/it.xml" title="Java.net issue tracker"/>');
