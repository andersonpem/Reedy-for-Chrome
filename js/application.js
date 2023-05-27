(function() {
	var app = window.reedy = {},
		toString = Object.prototype.toString,
  
		keyCodeToKeyName = {
		  8: "Backspace", 9: "Tab", 13: "Enter",
		  19: "Pause", 27: "Esc", 32: "Spacebar", 33: "PageUp",
		  34: "PageDown", 35: "End", 36: "Home", 37: "Left", 38: "Up", 39: "Right",
		  40: "Down", 45: "Insert", 46: "Del",
  
		  48: "0", 49: "1", 50: "2", 51: "3", 52: "4", 53: "5", 54: "6", 55: "7", 56: "8", 57: "9",
  
		  65: "A", 66: "B", 67: "C", 68: "D", 69: "E", 70: "F", 71: "G", 72: "H", 73: "I",
		  74: "J", 75: "K", 76: "L", 77: "M", 78: "N", 79: "O", 80: "P", 81: "Q", 82: "R",
		  83: "S", 84: "T", 85: "U", 86: "V", 87: "W", 88: "X", 89: "Y", 90: "Z",
  
		  96: "0", 97: "1", 98: "2", 99: "3", 100: "4", 101: "5", 102: "6", 103: "7", 104: "8", 105: "9",
		  106: "Multiply", 107: "Add", 109: "Subtract", 110: "Decimal", 111: "Divide",
  
		  112: "F1", 113: "F2", 114: "F3", 115: "F4", 116: "F5", 117: "F6",
		  118: "F7", 119: "F8", 120: "F9", 121: "F10", 122: "F11", 123: "F12",
		  124: "F13", 125: "F14", 126: "F15", 127: "F16", 128: "F17", 129: "F18",
		  130: "F19", 131: "F20", 132: "F21", 133: "F22", 134: "F23", 135: "F24",
  
		  186: ";", 187: "=", 188: ",", 189: "-", 190: ".", 191: "/", 192: "`", 219: "[", 220: "\\", 221: "]", 222: "'"
		};
  
	app.offlinePageUrl = chrome.runtime.getURL("offline.html");
  
	app.proxy = function(context, fnName) {
	  return function() {
		return context[fnName]();
	  };
	};
  
	app.norm = function(num, min, max) {
	  return num > max ? max : num < min ? min : num;
	};
  
	app.roundExp = function(num) {
	  var pow = Math.pow(10, (num + '').length - 1);
	  return Math.round(num / pow) * pow;
	};
  
	app.htmlEncode = function(str) {
	  return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
	};
  
	app.zeroPad = function(num, len) {
	  return (num = num + '').length < len
		? (new Array(len).join('0') + num).slice(-len)
		: num;
	};
  
	app.each = function(arr, fn) {
	  for (var i = 0; i < arr.length && fn(arr[i]) !== false; i++) {}
	};
  
	app.flatten = function(array) {
	  var res = [];
  
	  (function flat(arr) {
		if (toString.call(arr) === '[object Array]') arr.forEach(flat);
		else res.push(arr);
	  })(array);
  
	  return res;
	};
  
	app.getByPath = function(object, path) {
	  var index;
  
	  while ((index = path.indexOf('.')) > -1) {
		object = object[path.substring(0, index)];
		path = path.substring(index + 1);
	  }
  
	  return object[path];
	};
  
	app.setByPath = function(object, path, value) {
	  var obj = object,
		  temp, index, p;
  
	  while ((index = path.indexOf('.')) > -1) {
		p = path.substring(0, index);
  
		temp = obj[p];
		if (typeof temp !== "object") temp = obj[p] = {};
  
		obj = temp;
  
		path = path.substring(index + 1);
	  }
  
	  obj[path] = value;
  
	  return object;
	};
  
	app.stopEvent = function(e) {
	  e.preventDefault();
	  e.stopImmediatePropagation();
	};
  
	app.createElement = function(tagName, className, $appendTo, html, title) {
	  var $elem = document.createElement(tagName);
	  className != null && ($elem.className = className);
	  $appendTo && $appendTo.appendChild($elem);
	  html != null && ($elem.innerHTML = html);
	  title != null && ($elem.title = title);
	  return $elem;
	};
  
	app.parents = function($elem) {
	  var res = [];
	  while (($elem = $elem.parentNode)) {
		res.push($elem);
	  }
	  return res;
	};
  
	app.offset = function($elem) {
	  var rect = $elem.getBoundingClientRect(),
		  $docElem = ($elem.ownerDocument && $elem.ownerDocument.documentElement) || {};
	  return {
		top: rect.top + window.pageYOffset - $docElem.clientTop,
		left: rect.left + window.pageXOffset - $docElem.clientLeft,
		width: rect.width,
		height: rect.height
	  };
	};
  
	app.on = function(elem, event, fn) {
	  if (elem.nodeName || elem === window) elem.addEventListener(event, fn);
	  else {
		var events = (elem.__events__ = elem.__events__ || {});
		events[event] = events[event] || [];
		events[event].push(fn);
	  }
	};
  
	app.off = function(elem, event, fn) {
	  if (elem.nodeName || elem === window) elem.removeEventListener(event, fn);
	  else {
		var callbacks = elem.__events__ && elem.__events__[event],
			cb, i = -1;
		if (callbacks) {
		  while ((cb = callbacks[++i])) {
			if (cb === fn) {
			  callbacks.splice(i, 1);
			  i--;
			}
		  }
		}
	  }
	};
  
	app.trigger = function(elem, event, args) {
	  if (elem.nodeName || elem === window) {
		var evt = document.createEvent("Event");
		evt.initEvent(event, true, true);
		if (args) {
		  for (var i in args) {
			evt[i] = args[i];
		  }
		}
		elem.dispatchEvent(evt);
	  }
	  else {
		var callbacks = elem.__events__ && elem.__events__[event],
			cb, i = -1;
		if (callbacks) {
		  while ((cb = callbacks[++i])) {
			cb.apply(elem, args);
		  }
		}
	  }
	};
  
	app.delegate = function(elem, selector, event, fn) {
	  app.on(elem, event, function(e) {
		var target = e.target;
		while (target && target !== elem) {
		  if (matchesSelector(target, selector)) {
			e.delegateTarget = target;
			fn.call(target, e);
			break;
		  }
		  target = target.parentNode;
		}
	  });
	};
  
	app.getScrollableParent = function($elem) {
	  var overflowRegex = /(auto|scroll)/,
		  $currentElem = $elem;
	  while ($currentElem && $currentElem !== document.documentElement) {
		var computedStyle = getComputedStyle($currentElem),
			overflow = computedStyle.overflow,
			overflowX = computedStyle.overflowX,
			overflowY = computedStyle.overflowY;
  
		if (overflowRegex.test(overflow) || overflowRegex.test(overflowX) || overflowRegex.test(overflowY)) {
		  return $currentElem;
		}
		$currentElem = $currentElem.parentNode;
	  }
	  return window;
	};
  
	app.matchesSelector = function(elem, selector) {
	  var p = Element.prototype;
	  var f =
		p.matches ||
		p.webkitMatchesSelector ||
		p.mozMatchesSelector ||
		p.msMatchesSelector ||
		function(s) {
		  return [].indexOf.call(document.querySelectorAll(s), this) !== -1;
		};
	  return f.call(elem, selector);
	};
  
	app.positionTooltip = function($tooltip, $elem, position) {
	  var offset = app.offset($elem),
		  tooltipHeight = $tooltip.offsetHeight,
		  tooltipWidth = $tooltip.offsetWidth,
		  elemHeight = $elem.offsetHeight,
		  elemWidth = $elem.offsetWidth,
		  scrollTop = window.pageYOffset,
		  scrollLeft = window.pageXOffset,
		  top, left;
  
	  if (position === "right") {
		left = offset.left + scrollLeft + elemWidth;
		top = offset.top + scrollTop + elemHeight / 2 - tooltipHeight / 2;
	  }
	  else if (position === "bottom") {
		left = offset.left + scrollLeft + elemWidth / 2 - tooltipWidth / 2;
		top = offset.top + scrollTop + elemHeight;
	  }
	  else if (position === "top") {
		left = offset.left + scrollLeft + elemWidth / 2 - tooltipWidth / 2;
		top = offset.top + scrollTop - tooltipHeight;
	  }
	  else { // position === "left"
		left = offset.left + scrollLeft - tooltipWidth;
		top = offset.top + scrollTop + elemHeight / 2 - tooltipHeight / 2;
	  }
  
	  $tooltip.style.left = left + "px";
	  $tooltip.style.top = top + "px";
	};
  
	app.showTooltip = function($elem, content, position) {
	  var $tooltip = document.getElementById("tooltip");
	  if (!$tooltip) {
		$tooltip = app.createElement("div", "tooltip", document.body, content);
		$tooltip.id = "tooltip";
	  }
	  else {
		$tooltip.innerHTML = content;
	  }
	  $tooltip.style.display = "block";
	  app.positionTooltip($tooltip, $elem, position);
	};
  
	app.hideTooltip = function() {
	  var $tooltip = document.getElementById("tooltip");
	  $tooltip && ($tooltip.style.display = "none");
	};
  
	app.bindTooltip = function($elem, content, position) {
	  app.on($elem, "mouseenter", function() {
		app.showTooltip($elem, content, position);
	  });
  
	  app.on($elem, "mouseleave", function() {
		app.hideTooltip();
	  });
	};
  
	app.copyTextToClipboard = function(text) {
	  var $textarea = app.createElement("textarea");
	  $textarea.value = text;
	  document.body.appendChild($textarea);
	  $textarea.select();
	  document.execCommand("copy");
	  document.body.removeChild($textarea);
	};
  
	app.getShortcutString = function(shortcut) {
	  var keys = shortcut.split("+").map(function(key) {
		return key.charAt(0).toUpperCase() + key.slice(1);
	  });
  
	  if (keys.length === 1) {
		return keys[0];
	  }
	  else {
		var lastKey = keys.pop();
		return keys.join("+") + " + " + lastKey;
	  }
	};
  
	app.isModifierKey = function(key) {
	  return key === "Control" || key === "Shift" || key === "Alt" || key === "Meta";
	};
  
	app.getEventKey = function(e) {
	  var keyCode = e.keyCode,
		  keyName = keyCodeToKeyName[keyCode];
  
	  if (!keyName) {
		if (keyCode >= 65 && keyCode <= 90) {
		  keyName = String.fromCharCode(keyCode);
		}
		else if (keyCode >= 112 && keyCode <= 123) {
		  keyName = "F" + (keyCode - 111);
		}
		else {
		  keyName = "Unknown";
		}
	  }
  
	  if (e.shiftKey && keyName.length === 1) {
		keyName = keyName.toUpperCase();
	  }
  
	  return keyName;
	};
  
	app.getModifierKeys = function(e) {
	  var modifiers = [];
  
	  if (e.ctrlKey) modifiers.push("Control");
	  if (e.shiftKey) modifiers.push("Shift");
	  if (e.altKey) modifiers.push("Alt");
	  if (e.metaKey) modifiers.push("Meta");
  
	  return modifiers;
	};
  
	app.eventHasModifier = function(e, modifier) {
	  return (
		(modifier === "Control" && e.ctrlKey) ||
		(modifier === "Shift" && e.shiftKey) ||
		(modifier === "Alt" && e.altKey) ||
		(modifier === "Meta" && e.metaKey)
	  );
	};
  
	app.isSameShortcut = function(e, shortcut) {
	  var keys = shortcut.split("+").map(function(key) {
		return key.charAt(0).toUpperCase() + key.slice(1);
	  });
  
	  var eventKey = app.getEventKey(e);
	  var modifiers = app.getModifierKeys(e);
  
	  return (
		keys.indexOf(eventKey) > -1 &&
		modifiers.every(function(modifier) {
		  return app.eventHasModifier(e, modifier);
		})
	  );
	};
  
	app.isMatchingShortcut = function(e, shortcut) {
	  var keys = shortcut.split("+").map(function(key) {
		return key.charAt(0).toUpperCase() + key.slice(1);
	  });
  
	  var eventKey = app.getEventKey(e);
	  var modifiers = app.getModifierKeys(e);
  
	  return (
		keys.every(function(key) {
		  return key === eventKey || app.isModifierKey(key);
		}) &&
		modifiers.every(function(modifier) {
		  return keys.indexOf(modifier) > -1 || app.eventHasModifier(e, modifier);
		})
	  );
	};
  
	app.isTextInput = function($elem) {
	  return (
		$elem.nodeName === "INPUT" ||
		$elem.nodeName === "TEXTAREA" ||
		$elem.getAttribute("contenteditable") === "true"
	  );
	};
  
	app.isSpecialInput = function($elem) {
	  return (
		$elem.getAttribute("type") === "checkbox" ||
		$elem.getAttribute("type") === "radio" ||
		$elem.getAttribute("type") === "file"
	  );
	};
  
	app.init = function() {
	  var data = JSON.parse(document.getElementById("data").textContent),
		  $shortcuts = document.getElementById("shortcuts"),
		  $search = document.getElementById("search"),
		  $shortcutRows = [];
  
	  var filteredShortcuts = data.shortcuts;
  
	  var addShortcutRow = function(shortcut) {
		var $row = app.createElement("tr");
		app.createElement("td", "shortcut-key", $row, app.getShortcutString(shortcut.key));
		app.createElement("td", "shortcut-description", $row, shortcut.description);
		$shortcutRows.push($row);
		$shortcuts.appendChild($row);
	  };
  
	  var updateShortcutRows = function() {
		$shortcutRows.forEach(function($row) {
		  $shortcuts.removeChild($row);
		});
  
		$shortcutRows = [];
  
		filteredShortcuts.forEach(addShortcutRow);
	  };
  
	  data.shortcuts.forEach(addShortcutRow);
  
	  app.on($search, "input", function() {
		var searchValue = this.value.trim().toLowerCase();
  
		filteredShortcuts = data.shortcuts.filter(function(shortcut) {
		  return shortcut.key.toLowerCase().indexOf(searchValue) > -1 || shortcut.description.toLowerCase().indexOf(searchValue) > -1;
		});
  
		updateShortcutRows();
	  });
  
	  app.on($shortcuts, "click", function(e) {
		var $target = e.target;
		if ($target.classList.contains("shortcut-key")) {
		  var shortcut = $target.textContent.trim();
		  app.copyTextToClipboard(shortcut);
		  app.showTooltip($target, "Copied to clipboard", "right");
		  setTimeout(function() {
			app.hideTooltip();
		  }, 1000);
		}
	  });
  
	  app.delegate(document.body, "a[data-command]", "click", function(e) {
		var $link = this,
			command = $link.getAttribute("data-command");
  
		if (command === "show-all") {
		  $search.value = "";
		  filteredShortcuts = data.shortcuts;
		  updateShortcutRows();
		  $search.focus();
		  app.stopEvent(e);
		}
	  });
  
	  app.on(document, "keydown", function(e) {
		if (app.isTextInput(e.target) || app.isSpecialInput(e.target)) return;
  
		data.shortcuts.forEach(function(shortcut) {
		  if (app.isSameShortcut(e, shortcut.key)) {
			eval(shortcut.action);
			app.stopEvent(e);
		  }
		});
	  });
	};
  
	app.init();
  })();
  