/**
 * angular-strap-micro
 * @version v2.0.4 - 2014-08-14
 * @link http://mgcrea.github.io/angular-strap
 * @author Marcus Hall (marcush@lovattsmedia.com)
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
'use strict';
angular.module('mgcrea.ngStrap.tab').run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('tab/tab.tpl.html', '<ul class="nav nav-tabs"><li ng-repeat="pane in panes" ng-class="{active: $index == active}"><a data-toggle="tab" ng-click="setActive($index, $event)" data-index="{{$index}}" ng-bind-html="pane.title"></a></li></ul><div class="tab-content"><div ng-repeat="pane in panes" class="tab-pane" ng-class="[$index == active ? \'active\' : \'\']" ng-include="pane.template || \'$pane\'"></div></div>');
  }
]);