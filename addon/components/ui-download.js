import Ember from 'ember';
const { keys, create } = Object; // jshint ignore:line
const { computed, observer, $, run, on, typeOf, debug, isPresent } = Ember;  // jshint ignore:line
const { defineProperty, get, set, inject, isEmpty, merge } = Ember; // jshint ignore:line
const a = Ember.A; // jshint ignore:line

import layout from '../templates/components/ui-download';

export default Ember.Component.extend({
  layout: layout,
  classNameBindings: ['_file','hasBeenDownloaded:downloaded:not-downloaded'],
  classNames: ['ui-download'],
  data: null,
  id: null, // this property isn't used but it is often handy for container to put an ID reference here
  _data: computed('data', function() {
    return this.get('data') ? 'data-ready' : null;
  }),
  size: 'normal',
  mime: 'text/plain',
  charset: 'utf-8',
  url: computed('mime', 'data', function() {
    let {mime, data, charset} = this.getProperties('mime', 'data', 'charset');
    data = charset === 'utf-8' || mime.slice(0, 4) === 'text' ? encodeURIComponent(data) : data;
    return `data:${mime};charset=${charset},${data}`;
  }),
  supportsFileSaver: computed(function() {
    return !!new Blob();
  }),
  hasBeenDownloaded: false,
  click(evt) {
    if(evt.target.className !== 'hidden-link') {
      this.set('hasBeenDownloaded', true);
      const {data, filename, elementId, charset, mime} = this.getProperties('data','filename','elementId', 'charset', 'mime');
      // Prefer FileSaver strategy (should work on all modern browsers)
      if(this.get('supportsFileSaver')) {
        let blob;
        try {
            blob = new Blob([data], {type: `${mime};charset=${charset}`});
        }
        catch (e) {
            // IE 10 Needs a byte array
            if (e.name == "InvalidStateError") {
                var byteArray = new Uint8Array(data);
                blob = new Blob([byteArray.buffer], {type: `${mime};charset=${charset}`});
            }
        }
        window.saveAs(blob, filename);
      } else {
        if(window.navigator.msSaveOrOpenBlob) {
          // Microsoft Strategy
          let fileData = [data];
          let blobObject = new Blob(fileData);
          window.navigator.msSaveOrOpenBlob(blobObject, filename);
        } else {
          // Non-microsoft startegy
          $(`#${elementId} .hidden-link`)[0].click();
        }
      }

      if(typeOf(this.attrs.onDownload) === 'function') {
        this.attrs.onDownload({
          event: evt,
          object: this
        });
      } else {
        this.sendAction('onDownload', {
          event: evt,
          object: this
        });
      }
    }
  }
});
