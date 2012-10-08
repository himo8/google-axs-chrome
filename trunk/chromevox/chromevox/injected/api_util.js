// Copyright 2012 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Shared util methods between api.js and api_implementation.js
 * for doing common tasks such as passing node references between page script
 * and ChromeVox.
 *
 * @author clchen@google.com (Charles L. Chen)
 */

if (typeof(goog) != 'undefined' && goog.provide){
  goog.provide('cvox.ApiUtil');
}


if (!window['cvox']) {
   window['cvox'] = {};
}

/**
 * @constructor
 */
cvox.ApiUtils = function() {
};

/**
 * The next id to use for the cvoxid attribute that we add to elements
 * in order to be able to find them from the content script.
 * @type {number}
 */
cvox.ApiUtils.nextCvoxId_ = 1;

/**
 * Makes a serializable reference to a node.
 * If the node or its parent has an ID, reference it directly. Otherwise,
 * add a temporary cvoxid attribute. This has a corresponding method in
 * api_implementation.js to decode this and return a node.
 * @param {Node} targetNode The node to reference.
 * @return {Object} A serializable node reference.
 */
cvox.ApiUtils.makeNodeReference = function(targetNode) {
  if (targetNode.id && document.getElementById(targetNode.id) == targetNode) {
    return {'id': targetNode.id};
  } else if (targetNode instanceof HTMLElement) {
    var cvoxid = cvox.ApiUtils.nextCvoxId_;
    targetNode.setAttribute('cvoxid', cvoxid);
    cvox.ApiUtils.nextCvoxId_ = (cvox.ApiUtils.nextCvoxId_ + 1) % 100;
    return {'cvoxid': cvoxid};
  } else if (targetNode.parentElement) {
    var parent = targetNode.parentElement;
    var childIndex = -1;
    for (var i = 0; i < parent.childNodes.length; i++) {
      if (parent.childNodes[i] == targetNode) {
        childIndex = i;
        break;
      }
    }
    if (childIndex >= 0) {
      var cvoxid = cvox.ApiUtils.nextCvoxId_;
      parent.setAttribute('cvoxid', cvoxid);
      cvox.ApiUtils.nextCvoxId_ = (cvox.ApiUtils.nextCvoxId_ + 1) % 100;
      return {'cvoxid': cvoxid, 'childIndex': childIndex};
    }
  }
  throw 'Cannot reference node: ' + targetNode;
};

/**
 * Retrieves a node from its serializable node reference.
 *
 * @param {Object} nodeRef A serializable reference to a node.
 * @return {Node} The node on the page that this object refers to.
 */
cvox.ApiUtils.getNodeFromRef = function(nodeRef) {
  if (nodeRef['id']) {
    return document.getElementById(nodeRef['id']);
  } else if (nodeRef['cvoxid']) {
    var selector = '*[cvoxid="' + nodeRef['cvoxid'] + '"]';
    var element = document.querySelector(selector);
    if (element && element.removeAttribute) {
      element.removeAttribute('cvoxid');
    }
    if (nodeRef['childIndex'] != null) {
      return element.childNodes[nodeRef['childIndex']];
    } else {
      return element;
    }
  }
  throw 'Bad node reference: ' + cvox.ChromeVoxJSON.stringify(nodeRef);
};







