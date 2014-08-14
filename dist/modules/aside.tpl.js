/**
 * angular-strap-micro
 * @version v2.0.4 - 2014-08-14
 * @link http://mgcrea.github.io/angular-strap
 * @author Marcus Hall (marcush@lovattsmedia.com)
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
'use strict';
angular.module('mgcrea.ngStrap.aside').run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('aside/aside.tpl.html', '<div class="aside" tabindex="-1" role="dialog"><div class="aside-dialog"><div class="aside-content"><div class="aside-header" ng-show="title"><button type="button" class="close" ng-click="$hide()">&times;</button><h4 class="aside-title" ng-bind="title"></h4></div><div class="aside-body" ng-bind="content"></div><div class="aside-footer"><button type="button" class="btn btn-default" ng-click="$hide()">Close</button></div></div></div></div>');
  }
]);