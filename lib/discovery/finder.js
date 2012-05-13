/**
 *
 * This operation finds assets in the configured paths.
 *
 * Takes in the following options:
 *  - paths - file system paths to look in
 *  - onlyMatching - only find files in the directories matching one of the specified
 *                   glob patterns.
 *
 */
var async = require('async');
var glob = require('glob');
var path = require('path');
var _ = require('underscore');

var AssetFinder = exports.AssetFinder = function AssetFinder(options) {
  options = options || {};
  this.paths = options.paths || [];
  this.matchPattern = options.onlyMatching ? (
    options.onlyMatching.length > 1 ?
      '{' + options.onlyMatching.join(',') + '}' :
      options.onlyMatching[0]
    ) :
    '**/*.*';
};
AssetFinder.prototype = {
  asOperation:function () {
    return this.execute.bind(this);
  },
  execute:function (assetBundle, cb) {
    var self = this;
    async.forEach(this.paths, function (p, eachCb) {
      glob(self.matchPattern, { cwd:p }, function (e, matches) {
        if (e) {
          eachCb(e);
        } else {
          _.each(matches, function (match) {
            var assetFilePath = path.join(p, match);
            assetBundle.addAsset(p, assetFilePath);
          });
          eachCb();
        }
      });
    }, function (e) {
      cb(e, assetBundle);
    });
  }
};