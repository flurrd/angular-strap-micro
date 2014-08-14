/**
 * angular-strap-micro
 * @version v2.0.4 - 2014-08-14
 * @link http://mgcrea.github.io/angular-strap
 * @author Marcus Hall (marcush@lovattsmedia.com)
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
(function(window, document, undefined) {
'use strict';
// Source: module.js
angular.module('mgcrea.ngStrap', [
  'mgcrea.ngStrap.modal',
  'mgcrea.ngStrap.aside',
  'mgcrea.ngStrap.navbar',
  'mgcrea.ngStrap.tab'
]);

// Source: aside.js
angular.module('mgcrea.ngStrap.aside', ['mgcrea.ngStrap.modal']).provider('$aside', function () {
  var defaults = this.defaults = {
      animation: 'am-fade-and-slide-right',
      prefixClass: 'aside',
      placement: 'right',
      template: 'aside/aside.tpl.html',
      contentTemplate: false,
      container: false,
      element: null,
      backdrop: true,
      keyboard: true,
      html: false,
      show: true
    };
  this.$get = [
    '$modal',
    function ($modal) {
      function AsideFactory(config) {
        var $aside = {};
        // Common vars
        var options = angular.extend({}, defaults, config);
        $aside = $modal(options);
        return $aside;
      }
      return AsideFactory;
    }
  ];
}).directive('bsAside', [
  '$window',
  '$sce',
  '$aside',
  function ($window, $sce, $aside) {
    var requestAnimationFrame = $window.requestAnimationFrame || $window.setTimeout;
    return {
      restrict: 'EAC',
      scope: true,
      link: function postLink(scope, element, attr, transclusion) {
        // Directive options
        var options = {
            scope: scope,
            element: element,
            show: false
          };
        angular.forEach([
          'template',
          'contentTemplate',
          'placement',
          'backdrop',
          'keyboard',
          'html',
          'container',
          'animation'
        ], function (key) {
          if (angular.isDefined(attr[key]))
            options[key] = attr[key];
        });
        // Support scope as data-attrs
        angular.forEach([
          'title',
          'content'
        ], function (key) {
          attr[key] && attr.$observe(key, function (newValue, oldValue) {
            scope[key] = $sce.trustAsHtml(newValue);
          });
        });
        // Support scope as an object
        attr.bsAside && scope.$watch(attr.bsAside, function (newValue, oldValue) {
          if (angular.isObject(newValue)) {
            angular.extend(scope, newValue);
          } else {
            scope.content = newValue;
          }
        }, true);
        // Initialize aside
        var aside = $aside(options);
        // Trigger
        element.on(attr.trigger || 'click', aside.toggle);
        // Garbage collection
        scope.$on('$destroy', function () {
          aside.destroy();
          options = null;
          aside = null;
        });
      }
    };
  }
]);

// Source: date-parser.js
angular.module('mgcrea.ngStrap.helpers.dateParser', []).provider('$dateParser', [
  '$localeProvider',
  function ($localeProvider) {
    var proto = Date.prototype;
    function isNumeric(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }
    var defaults = this.defaults = {
        format: 'shortDate',
        strict: false
      };
    this.$get = [
      '$locale',
      'dateFilter',
      function ($locale, dateFilter) {
        var DateParserFactory = function (config) {
          var options = angular.extend({}, defaults, config);
          var $dateParser = {};
          var regExpMap = {
              'sss': '[0-9]{3}',
              'ss': '[0-5][0-9]',
              's': options.strict ? '[1-5]?[0-9]' : '[0-9]|[0-5][0-9]',
              'mm': '[0-5][0-9]',
              'm': options.strict ? '[1-5]?[0-9]' : '[0-9]|[0-5][0-9]',
              'HH': '[01][0-9]|2[0-3]',
              'H': options.strict ? '1?[0-9]|2[0-3]' : '[01]?[0-9]|2[0-3]',
              'hh': '[0][1-9]|[1][012]',
              'h': options.strict ? '[1-9]|1[012]' : '0?[1-9]|1[012]',
              'a': 'AM|PM',
              'EEEE': $locale.DATETIME_FORMATS.DAY.join('|'),
              'EEE': $locale.DATETIME_FORMATS.SHORTDAY.join('|'),
              'dd': '0[1-9]|[12][0-9]|3[01]',
              'd': options.strict ? '[1-9]|[1-2][0-9]|3[01]' : '0?[1-9]|[1-2][0-9]|3[01]',
              'MMMM': $locale.DATETIME_FORMATS.MONTH.join('|'),
              'MMM': $locale.DATETIME_FORMATS.SHORTMONTH.join('|'),
              'MM': '0[1-9]|1[012]',
              'M': options.strict ? '[1-9]|1[012]' : '0?[1-9]|1[012]',
              'yyyy': '[1]{1}[0-9]{3}|[2]{1}[0-9]{3}',
              'yy': '[0-9]{2}',
              'y': options.strict ? '-?(0|[1-9][0-9]{0,3})' : '-?0*[0-9]{1,4}'
            };
          var setFnMap = {
              'sss': proto.setMilliseconds,
              'ss': proto.setSeconds,
              's': proto.setSeconds,
              'mm': proto.setMinutes,
              'm': proto.setMinutes,
              'HH': proto.setHours,
              'H': proto.setHours,
              'hh': proto.setHours,
              'h': proto.setHours,
              'dd': proto.setDate,
              'd': proto.setDate,
              'a': function (value) {
                var hours = this.getHours();
                return this.setHours(value.match(/pm/i) ? hours + 12 : hours);
              },
              'MMMM': function (value) {
                return this.setMonth($locale.DATETIME_FORMATS.MONTH.indexOf(value));
              },
              'MMM': function (value) {
                return this.setMonth($locale.DATETIME_FORMATS.SHORTMONTH.indexOf(value));
              },
              'MM': function (value) {
                return this.setMonth(1 * value - 1);
              },
              'M': function (value) {
                return this.setMonth(1 * value - 1);
              },
              'yyyy': proto.setFullYear,
              'yy': function (value) {
                return this.setFullYear(2000 + 1 * value);
              },
              'y': proto.setFullYear
            };
          var regex, setMap;
          $dateParser.init = function () {
            $dateParser.$format = $locale.DATETIME_FORMATS[options.format] || options.format;
            regex = regExpForFormat($dateParser.$format);
            setMap = setMapForFormat($dateParser.$format);
          };
          $dateParser.isValid = function (date) {
            if (angular.isDate(date))
              return !isNaN(date.getTime());
            return regex.test(date);
          };
          $dateParser.parse = function (value, baseDate, format) {
            if (angular.isDate(value))
              value = dateFilter(value, format || $dateParser.$format);
            var formatRegex = format ? regExpForFormat(format) : regex;
            var formatSetMap = format ? setMapForFormat(format) : setMap;
            var matches = formatRegex.exec(value);
            if (!matches)
              return false;
            var date = baseDate || new Date(0, 0, 1);
            for (var i = 0; i < matches.length - 1; i++) {
              formatSetMap[i] && formatSetMap[i].call(date, matches[i + 1]);
            }
            return date;
          };
          // Private functions
          function setMapForFormat(format) {
            var keys = Object.keys(setFnMap), i;
            var map = [], sortedMap = [];
            // Map to setFn
            var clonedFormat = format;
            for (i = 0; i < keys.length; i++) {
              if (format.split(keys[i]).length > 1) {
                var index = clonedFormat.search(keys[i]);
                format = format.split(keys[i]).join('');
                if (setFnMap[keys[i]])
                  map[index] = setFnMap[keys[i]];
              }
            }
            // Sort result map
            angular.forEach(map, function (v) {
              if (v)
                sortedMap.push(v);
            });
            return sortedMap;
          }
          function escapeReservedSymbols(text) {
            return text.replace(/\//g, '[\\/]').replace('/-/g', '[-]').replace(/\./g, '[.]').replace(/\\s/g, '[\\s]');
          }
          function regExpForFormat(format) {
            var keys = Object.keys(regExpMap), i;
            var re = format;
            // Abstract replaces to avoid collisions
            for (i = 0; i < keys.length; i++) {
              re = re.split(keys[i]).join('${' + i + '}');
            }
            // Replace abstracted values
            for (i = 0; i < keys.length; i++) {
              re = re.split('${' + i + '}').join('(' + regExpMap[keys[i]] + ')');
            }
            format = escapeReservedSymbols(format);
            return new RegExp('^' + re + '$', ['i']);
          }
          $dateParser.init();
          return $dateParser;
        };
        return DateParserFactory;
      }
    ];
  }
]);

// Source: debounce.js
angular.module('mgcrea.ngStrap.helpers.debounce', []).constant('debounce', function (func, wait, immediate) {
  var timeout, args, context, timestamp, result;
  return function () {
    context = this;
    args = arguments;
    timestamp = new Date();
    var later = function () {
      var last = new Date() - timestamp;
      if (last < wait) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate)
          result = func.apply(context, args);
      }
    };
    var callNow = immediate && !timeout;
    if (!timeout) {
      timeout = setTimeout(later, wait);
    }
    if (callNow)
      result = func.apply(context, args);
    return result;
  };
}).constant('throttle', function (func, wait, options) {
  var context, args, result;
  var timeout = null;
  var previous = 0;
  options || (options = {});
  var later = function () {
    previous = options.leading === false ? 0 : new Date();
    timeout = null;
    result = func.apply(context, args);
  };
  return function () {
    var now = new Date();
    if (!previous && options.leading === false)
      previous = now;
    var remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0) {
      clearTimeout(timeout);
      timeout = null;
      previous = now;
      result = func.apply(context, args);
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
});

// Source: dimensions.js
angular.module('mgcrea.ngStrap.helpers.dimensions', []).factory('dimensions', [
  '$document',
  '$window',
  function ($document, $window) {
    var jqLite = angular.element;
    var fn = {};
    /**
     * Test the element nodeName
     * @param element
     * @param name
     */
    var nodeName = fn.nodeName = function (element, name) {
        return element.nodeName && element.nodeName.toLowerCase() === name.toLowerCase();
      };
    /**
     * Returns the element computed style
     * @param element
     * @param prop
     * @param extra
     */
    fn.css = function (element, prop, extra) {
      var value;
      if (element.currentStyle) {
        //IE
        value = element.currentStyle[prop];
      } else if (window.getComputedStyle) {
        value = window.getComputedStyle(element)[prop];
      } else {
        value = element.style[prop];
      }
      return extra === true ? parseFloat(value) || 0 : value;
    };
    /**
     * Provides read-only equivalent of jQuery's offset function:
     * @required-by bootstrap-tooltip, bootstrap-affix
     * @url http://api.jquery.com/offset/
     * @param element
     */
    fn.offset = function (element) {
      var boxRect = element.getBoundingClientRect();
      var docElement = element.ownerDocument;
      return {
        width: boxRect.width || element.offsetWidth,
        height: boxRect.height || element.offsetHeight,
        top: boxRect.top + (window.pageYOffset || docElement.documentElement.scrollTop) - (docElement.documentElement.clientTop || 0),
        left: boxRect.left + (window.pageXOffset || docElement.documentElement.scrollLeft) - (docElement.documentElement.clientLeft || 0)
      };
    };
    /**
     * Provides read-only equivalent of jQuery's position function
     * @required-by bootstrap-tooltip, bootstrap-affix
     * @url http://api.jquery.com/offset/
     * @param element
     */
    fn.position = function (element) {
      var offsetParentRect = {
          top: 0,
          left: 0
        }, offsetParentElement, offset;
      // Fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is it's only offset parent
      if (fn.css(element, 'position') === 'fixed') {
        // We assume that getBoundingClientRect is available when computed position is fixed
        offset = element.getBoundingClientRect();
      } else {
        // Get *real* offsetParentElement
        offsetParentElement = offsetParent(element);
        offset = fn.offset(element);
        // Get correct offsets
        offset = fn.offset(element);
        if (!nodeName(offsetParentElement, 'html')) {
          offsetParentRect = fn.offset(offsetParentElement);
        }
        // Add offsetParent borders
        offsetParentRect.top += fn.css(offsetParentElement, 'borderTopWidth', true);
        offsetParentRect.left += fn.css(offsetParentElement, 'borderLeftWidth', true);
      }
      // Subtract parent offsets and element margins
      return {
        width: element.offsetWidth,
        height: element.offsetHeight,
        top: offset.top - offsetParentRect.top - fn.css(element, 'marginTop', true),
        left: offset.left - offsetParentRect.left - fn.css(element, 'marginLeft', true)
      };
    };
    /**
     * Returns the closest, non-statically positioned offsetParent of a given element
     * @required-by fn.position
     * @param element
     */
    var offsetParent = function offsetParentElement(element) {
      var docElement = element.ownerDocument;
      var offsetParent = element.offsetParent || docElement;
      if (nodeName(offsetParent, '#document'))
        return docElement.documentElement;
      while (offsetParent && !nodeName(offsetParent, 'html') && fn.css(offsetParent, 'position') === 'static') {
        offsetParent = offsetParent.offsetParent;
      }
      return offsetParent || docElement.documentElement;
    };
    /**
     * Provides equivalent of jQuery's height function
     * @required-by bootstrap-affix
     * @url http://api.jquery.com/height/
     * @param element
     * @param outer
     */
    fn.height = function (element, outer) {
      var value = element.offsetHeight;
      if (outer) {
        value += fn.css(element, 'marginTop', true) + fn.css(element, 'marginBottom', true);
      } else {
        value -= fn.css(element, 'paddingTop', true) + fn.css(element, 'paddingBottom', true) + fn.css(element, 'borderTopWidth', true) + fn.css(element, 'borderBottomWidth', true);
      }
      return value;
    };
    /**
     * Provides equivalent of jQuery's width function
     * @required-by bootstrap-affix
     * @url http://api.jquery.com/width/
     * @param element
     * @param outer
     */
    fn.width = function (element, outer) {
      var value = element.offsetWidth;
      if (outer) {
        value += fn.css(element, 'marginLeft', true) + fn.css(element, 'marginRight', true);
      } else {
        value -= fn.css(element, 'paddingLeft', true) + fn.css(element, 'paddingRight', true) + fn.css(element, 'borderLeftWidth', true) + fn.css(element, 'borderRightWidth', true);
      }
      return value;
    };
    return fn;
  }
]);

// Source: parse-options.js
angular.module('mgcrea.ngStrap.helpers.parseOptions', []).provider('$parseOptions', function () {
  var defaults = this.defaults = { regexp: /^\s*(.*?)(?:\s+as\s+(.*?))?(?:\s+group\s+by\s+(.*))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+(.*?)(?:\s+track\s+by\s+(.*?))?$/ };
  this.$get = [
    '$parse',
    '$q',
    function ($parse, $q) {
      function ParseOptionsFactory(attr, config) {
        var $parseOptions = {};
        // Common vars
        var options = angular.extend({}, defaults, config);
        $parseOptions.$values = [];
        // Private vars
        var match, displayFn, valueName, keyName, groupByFn, valueFn, valuesFn;
        $parseOptions.init = function () {
          $parseOptions.$match = match = attr.match(options.regexp);
          displayFn = $parse(match[2] || match[1]), valueName = match[4] || match[6], keyName = match[5], groupByFn = $parse(match[3] || ''), valueFn = $parse(match[2] ? match[1] : valueName), valuesFn = $parse(match[7]);
        };
        $parseOptions.valuesFn = function (scope, controller) {
          return $q.when(valuesFn(scope, controller)).then(function (values) {
            $parseOptions.$values = values ? parseValues(values, scope) : {};
            return $parseOptions.$values;
          });
        };
        // Private functions
        function parseValues(values, scope) {
          return values.map(function (match, index) {
            var locals = {}, label, value;
            locals[valueName] = match;
            label = displayFn(scope, locals);
            value = valueFn(scope, locals) || index;
            return {
              label: label,
              value: value
            };
          });
        }
        $parseOptions.init();
        return $parseOptions;
      }
      return ParseOptionsFactory;
    }
  ];
});

// Source: raf.js
angular.version.minor < 3 && angular.version.dot < 14 && angular.module('ng').factory('$$rAF', [
  '$window',
  '$timeout',
  function ($window, $timeout) {
    var requestAnimationFrame = $window.requestAnimationFrame || $window.webkitRequestAnimationFrame || $window.mozRequestAnimationFrame;
    var cancelAnimationFrame = $window.cancelAnimationFrame || $window.webkitCancelAnimationFrame || $window.mozCancelAnimationFrame || $window.webkitCancelRequestAnimationFrame;
    var rafSupported = !!requestAnimationFrame;
    var raf = rafSupported ? function (fn) {
        var id = requestAnimationFrame(fn);
        return function () {
          cancelAnimationFrame(id);
        };
      } : function (fn) {
        var timer = $timeout(fn, 16.66, false);
        // 1000 / 60 = 16.666
        return function () {
          $timeout.cancel(timer);
        };
      };
    raf.supported = rafSupported;
    return raf;
  }
]);  // .factory('$$animateReflow', function($$rAF, $document) {
     //   var bodyEl = $document[0].body;
     //   return function(fn) {
     //     //the returned function acts as the cancellation function
     //     return $$rAF(function() {
     //       //the line below will force the browser to perform a repaint
     //       //so that all the animated elements within the animation frame
     //       //will be properly updated and drawn on screen. This is
     //       //required to perform multi-class CSS based animations with
     //       //Firefox. DO NOT REMOVE THIS LINE.
     //       var a = bodyEl.offsetWidth + 1;
     //       fn();
     //     });
     //   };
     // });

// Source: modal.js
angular.module('mgcrea.ngStrap.modal', ['mgcrea.ngStrap.helpers.dimensions']).provider('$modal', function () {
  var defaults = this.defaults = {
      animation: 'am-fade',
      backdropAnimation: 'am-fade',
      prefixClass: 'modal',
      prefixEvent: 'modal',
      placement: 'top',
      template: 'modal/modal.tpl.html',
      contentTemplate: false,
      container: false,
      element: null,
      backdrop: true,
      keyboard: true,
      html: false,
      show: true
    };
  this.$get = [
    '$window',
    '$rootScope',
    '$compile',
    '$q',
    '$templateCache',
    '$http',
    '$animate',
    '$timeout',
    '$sce',
    'dimensions',
    function ($window, $rootScope, $compile, $q, $templateCache, $http, $animate, $timeout, $sce, dimensions) {
      var forEach = angular.forEach;
      var trim = String.prototype.trim;
      var requestAnimationFrame = $window.requestAnimationFrame || $window.setTimeout;
      var bodyElement = angular.element($window.document.body);
      var htmlReplaceRegExp = /ng-bind="/gi;
      function ModalFactory(config) {
        var $modal = {};
        // Common vars
        var options = $modal.$options = angular.extend({}, defaults, config);
        $modal.$promise = fetchTemplate(options.template);
        var scope = $modal.$scope = options.scope && options.scope.$new() || $rootScope.$new();
        if (!options.element && !options.container) {
          options.container = 'body';
        }
        // Support scope as string options
        forEach([
          'title',
          'content'
        ], function (key) {
          if (options[key])
            scope[key] = $sce.trustAsHtml(options[key]);
        });
        // Provide scope helpers
        scope.$hide = function () {
          scope.$$postDigest(function () {
            $modal.hide();
          });
        };
        scope.$show = function () {
          scope.$$postDigest(function () {
            $modal.show();
          });
        };
        scope.$toggle = function () {
          scope.$$postDigest(function () {
            $modal.toggle();
          });
        };
        // Support contentTemplate option
        if (options.contentTemplate) {
          $modal.$promise = $modal.$promise.then(function (template) {
            var templateEl = angular.element(template);
            return fetchTemplate(options.contentTemplate).then(function (contentTemplate) {
              var contentEl = findElement('[ng-bind="content"]', templateEl[0]).removeAttr('ng-bind').html(contentTemplate);
              // Drop the default footer as you probably don't want it if you use a custom contentTemplate
              if (!config.template)
                contentEl.next().remove();
              return templateEl[0].outerHTML;
            });
          });
        }
        // Fetch, compile then initialize modal
        var modalLinker, modalElement;
        var backdropElement = angular.element('<div class="' + options.prefixClass + '-backdrop"/>');
        $modal.$promise.then(function (template) {
          if (angular.isObject(template))
            template = template.data;
          if (options.html)
            template = template.replace(htmlReplaceRegExp, 'ng-bind-html="');
          template = trim.apply(template);
          modalLinker = $compile(template);
          $modal.init();
        });
        $modal.init = function () {
          // Options: show
          if (options.show) {
            scope.$$postDigest(function () {
              $modal.show();
            });
          }
        };
        $modal.destroy = function () {
          // Remove element
          if (modalElement) {
            modalElement.remove();
            modalElement = null;
          }
          if (backdropElement) {
            backdropElement.remove();
            backdropElement = null;
          }
          // Destroy scope
          scope.$destroy();
        };
        $modal.show = function () {
          scope.$emit(options.prefixEvent + '.show.before', $modal);
          var parent;
          if (angular.isElement(options.container)) {
            parent = options.container;
          } else {
            parent = options.container ? findElement(options.container) : null;
          }
          var after = options.container ? null : options.element;
          // Fetch a cloned element linked from template
          modalElement = $modal.$element = modalLinker(scope, function (clonedElement, scope) {
          });
          // Set the initial positioning.
          modalElement.css({ display: 'block' }).addClass(options.placement);
          // Options: animation
          if (options.animation) {
            if (options.backdrop) {
              backdropElement.addClass(options.backdropAnimation);
            }
            modalElement.addClass(options.animation);
          }
          if (options.backdrop) {
            $animate.enter(backdropElement, bodyElement, null, function () {
            });
          }
          $animate.enter(modalElement, parent, after, function () {
            scope.$emit(options.prefixEvent + '.show', $modal);
          });
          scope.$isShown = true;
          scope.$$phase || scope.$root && scope.$root.$$phase || scope.$digest();
          // Focus once the enter-animation has started
          // Weird PhantomJS bug hack
          var el = modalElement[0];
          requestAnimationFrame(function () {
            el.focus();
          });
          bodyElement.addClass(options.prefixClass + '-open');
          if (options.animation) {
            bodyElement.addClass(options.prefixClass + '-with-' + options.animation);
          }
          // Bind events
          if (options.backdrop) {
            modalElement.on('click', hideOnBackdropClick);
            backdropElement.on('click', hideOnBackdropClick);
          }
          if (options.keyboard) {
            modalElement.on('keyup', $modal.$onKeyUp);
          }
        };
        $modal.hide = function () {
          scope.$emit(options.prefixEvent + '.hide.before', $modal);
          $animate.leave(modalElement, function () {
            scope.$emit(options.prefixEvent + '.hide', $modal);
            bodyElement.removeClass(options.prefixClass + '-open');
            if (options.animation) {
              bodyElement.removeClass(options.prefixClass + '-with-' + options.animation);
            }
          });
          if (options.backdrop) {
            $animate.leave(backdropElement, function () {
            });
          }
          scope.$isShown = false;
          scope.$$phase || scope.$root && scope.$root.$$phase || scope.$digest();
          // Unbind events
          if (options.backdrop) {
            modalElement.off('click', hideOnBackdropClick);
            backdropElement.off('click', hideOnBackdropClick);
          }
          if (options.keyboard) {
            modalElement.off('keyup', $modal.$onKeyUp);
          }
        };
        $modal.toggle = function () {
          scope.$isShown ? $modal.hide() : $modal.show();
        };
        $modal.focus = function () {
          modalElement[0].focus();
        };
        // Protected methods
        $modal.$onKeyUp = function (evt) {
          evt.which === 27 && $modal.hide();
        };
        // Private methods
        function hideOnBackdropClick(evt) {
          if (evt.target !== evt.currentTarget)
            return;
          options.backdrop === 'static' ? $modal.focus() : $modal.hide();
        }
        return $modal;
      }
      // Helper functions
      function findElement(query, element) {
        return angular.element((element || document).querySelectorAll(query));
      }
      function fetchTemplate(template) {
        return $q.when($templateCache.get(template) || $http.get(template)).then(function (res) {
          if (angular.isObject(res)) {
            $templateCache.put(template, res.data);
            return res.data;
          }
          return res;
        });
      }
      return ModalFactory;
    }
  ];
}).directive('bsModal', [
  '$window',
  '$location',
  '$sce',
  '$modal',
  function ($window, $location, $sce, $modal) {
    return {
      restrict: 'EAC',
      scope: true,
      link: function postLink(scope, element, attr, transclusion) {
        // Directive options
        var options = {
            scope: scope,
            element: element,
            show: false
          };
        angular.forEach([
          'template',
          'contentTemplate',
          'placement',
          'backdrop',
          'keyboard',
          'html',
          'container',
          'animation'
        ], function (key) {
          if (angular.isDefined(attr[key]))
            options[key] = attr[key];
        });
        // Support scope as data-attrs
        angular.forEach([
          'title',
          'content'
        ], function (key) {
          attr[key] && attr.$observe(key, function (newValue, oldValue) {
            scope[key] = $sce.trustAsHtml(newValue);
          });
        });
        // Support scope as an object
        attr.bsModal && scope.$watch(attr.bsModal, function (newValue, oldValue) {
          if (angular.isObject(newValue)) {
            angular.extend(scope, newValue);
          } else {
            scope.content = newValue;
          }
        }, true);
        // Initialize modal
        var modal = $modal(options);
        // Trigger
        element.on(attr.trigger || 'click', modal.toggle);
        // Garbage collection
        scope.$on('$destroy', function () {
          modal.destroy();
          options = null;
          modal = null;
        });
      }
    };
  }
]);

// Source: navbar.js
angular.module('mgcrea.ngStrap.navbar', []).provider('$navbar', function () {
  var defaults = this.defaults = {
      activeClass: 'active',
      routeAttr: 'data-match-route',
      strict: false
    };
  this.$get = function () {
    return { defaults: defaults };
  };
}).directive('bsNavbar', [
  '$window',
  '$location',
  '$navbar',
  function ($window, $location, $navbar) {
    var defaults = $navbar.defaults;
    return {
      restrict: 'A',
      link: function postLink(scope, element, attr, controller) {
        // Directive options
        var options = angular.copy(defaults);
        angular.forEach(Object.keys(defaults), function (key) {
          if (angular.isDefined(attr[key]))
            options[key] = attr[key];
        });
        // Watch for the $location
        scope.$watch(function () {
          return $location.path();
        }, function (newValue, oldValue) {
          var liElements = element[0].querySelectorAll('li[' + options.routeAttr + ']');
          angular.forEach(liElements, function (li) {
            var liElement = angular.element(li);
            var pattern = liElement.attr(options.routeAttr).replace('/', '\\/');
            if (options.strict) {
              pattern = '^' + pattern + '$';
            }
            var regexp = new RegExp(pattern, ['i']);
            if (regexp.test(newValue)) {
              liElement.addClass(options.activeClass);
            } else {
              liElement.removeClass(options.activeClass);
            }
          });
        });
      }
    };
  }
]);

// Source: tab.js
angular.module('mgcrea.ngStrap.tab', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('$pane', '{{pane.content}}');
  }
]).provider('$tab', function () {
  var defaults = this.defaults = {
      animation: 'am-fade',
      template: 'tab/tab.tpl.html'
    };
  this.$get = function () {
    return { defaults: defaults };
  };
}).directive('bsTabs', [
  '$window',
  '$animate',
  '$tab',
  function ($window, $animate, $tab) {
    var defaults = $tab.defaults;
    return {
      restrict: 'EAC',
      scope: true,
      require: '?ngModel',
      templateUrl: function (element, attr) {
        return attr.template || defaults.template;
      },
      link: function postLink(scope, element, attr, controller) {
        // Directive options
        var options = defaults;
        angular.forEach(['animation'], function (key) {
          if (angular.isDefined(attr[key]))
            options[key] = attr[key];
        });
        // Require scope as an object
        attr.bsTabs && scope.$watch(attr.bsTabs, function (newValue, oldValue) {
          scope.panes = newValue;
        }, true);
        // Add base class
        element.addClass('tabs');
        // Support animations
        if (options.animation) {
          element.addClass(options.animation);
        }
        scope.active = scope.activePane = 0;
        // view -> model
        scope.setActive = function (index, ev) {
          scope.active = index;
          if (controller) {
            controller.$setViewValue(index);
          }
        };
        // model -> view
        if (controller) {
          controller.$render = function () {
            scope.active = controller.$modelValue * 1;
          };
        }
      }
    };
  }
]);

})(window, document);
