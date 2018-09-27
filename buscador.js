(function($) {

    $.widget("mapbender.mbBuscador",  {
        options: {
            style: {
                fillColor:     '#ffffff',
                fillOpacity:   0.5,
                strokeColor:   '#000000',
                strokeOpacity: 1.0,
                strokeWidth:    2
            }
        },
        map: null,
        mapDiv:null,
        layer: null,
        control: null,
        feature: null,
        lastScale: null,
        lastRotation: null,
        width: null,
        height: null,
        rotateValue: 0,
        overwriteTemplates: false,

        _create: function() {
            if(!Mapbender.checkTarget("mbBuscador", this.options.target)){
                return;
            }
            var self = this;
            Mapbender.elementRegistry.onElementReady(this.options.target, $.proxy(self._setup, self));
        },

        _setup: function(){
            this.mapDiv = $('#' + this.options.target);
            this.map = this.mapDiv.data('mapbenderMbMap').map;
            var self = this;
            this.elementUrl = Mapbender.configuration.application.urls.element + '/' + this.element.attr('id') + '/';
            //this.map = $('#' + this.options.target).data('mapbenderMbMap');

            $('#cmb1', this.element)
                .on('change', $.proxy(this._buscarZonas, this));
            $('#cmb2', this.element)
                .on('change', $.proxy(this._buscarSubestaciones, this));
            $('#cmb3', this.element)
                .on('change', $.proxy(this._buscarCircuitos, this));

            this._trigger('ready');
            this._ready();
        },

        defaultAction: function(callback) {
            this.open(callback);
        },

        open: function(callback){
            this.callback = callback ? callback : null;
            var self = this;
            var me = $(this.element);
            if (this.options.type === 'dialog') {
                if(!this.popup || !this.popup.$element){
                    this.popup = new Mapbender.Popup2({
                            title: self.element.attr('title'),
                            draggable: true,
                            header: true,
                            modal: false,
                            closeButton: false,
                            closeOnESC: false,
                            content: self.element,
                            width: 400,
                            height: 490,
                            cssClass: 'customPrintDialog',
                            buttons: {
                                    'cancel': {
                                        label: 'Cancelar',
                                        cssClass: 'button buttonCancel critical right',
                                        callback: function(){
                                            self.close();
                                        }
                                    },
                                    'ok': {
                                        label: 'Buscar',
                                        cssClass: 'button right',
                                        callback: function(){
                                            self.buscar();
                                        }
                                    }
                            }
                        });
                    this.popup.$element.on('close', $.proxy(this.close, this));
                }else{
                     return;
                }
                me.show();
            }
        },

        _buscarZonas: function(){
            $('#cmb2', this.element).empty();
            $('#cmb3', this.element).empty();
            $('#cmb4', this.element).empty();
            var self=this;
            var div=$('#cmb1', this.element).val();
            $.ajax({
                url: self.elementUrl + 'zonas',
                data : {div:div},
                context: document.body
              }).done(function(data) {
                $('#cmb2', this.element).append('<option value="-">Select</option>');
                var datos=jQuery.parseJSON(data);  
                $.each(datos, function (i, item) {
                    $('#cmb2', this.element).append($('<option>', { 
                        value: item.Clave,
                        text : item.Nombre 
                    }));
                });
              });
        },

        _buscarSubestaciones: function(){
            $('#cmb3', this.element).empty();
            $('#cmb4', this.element).empty();
            var self=this;
            var zon=$('#cmb2', this.element).val();
            $.ajax({
                url: self.elementUrl + 'subestaciones',
                data : {zon:zon},
                context: document.body
              }).done(function(data) {
                $('#cmb3', this.element).append('<option value="-">Select</option>');
                var datos=jQuery.parseJSON(data);  
                $.each(datos, function (i, item) {
                    $('#cmb3', this.element).append($('<option>', { 
                        value: item.Clave,
                        text : item.Nombre 
                    }));
                });
              });
        },

        _buscarCircuitos: function(){
            $('#cmb4', this.element).empty();
            var self=this;
            var sub=$('#cmb3', this.element).val();
            $.ajax({
                url: self.elementUrl + 'circuitos',
                data : {sub:sub},
                context: document.body
              }).done(function(data) {
                $('#cmb4', this.element).append('<option value="-">Select</option>');
                var datos=jQuery.parseJSON(data);  
                $.each(datos, function (i, item) {
                    $('#cmb4', this.element).append($('<option>', { 
                        value: item.Clave,
                        text : item.Nombre 
                    }));
                });
              });
        },

        buscar: function(){
            var d= $('#cmb1', this.element).val(),
                z=$('#cmb2', this.element).val(),
                s=$('#cmb3', this.element).val(),
                c=$('#cmb4', this.element).empty();
                var utility = new OpenLayers.Layer.WMS( 
                        "busqueda",
                        "http://1.1.1.1/geoserver/capas/wms?SERVICE=WMS&VERSION=1.1.1&"+
                        "REQUEST=GetMap&FORMAT=image%2Fpng&TRANSPARENT=true"+
                        "&STYLES"+
                        "&CQL_FILTER="+
                        "&SRS=EPSG%3A4326"+
                        "&WIDTH="+this.map.olMap.size.w+
                        "&HEIGHT="+this.map.olMap.size.h+
                        "&BBOX="+this.map.olMap.getExtent().toBBOX(),
                        {
                            layers: 'capas:prueba'
                        });
                this.map.olMap.addLayer(utility);
                
        },

        close: function() {
            if(this.popup){
                this.element.hide().appendTo($('body'));
                if(this.popup.$element){
                    this.popup.destroy();
                }
                this.popup = null;
            }
            this.callback ? this.callback.call() : this.callback = null;
        },

        /**
         *
         */
        ready: function(callback) {
            if(this.readyState === true) {
                callback();
            } else {
                this.readyCallbacks.push(callback);
            }
        },
        /**
         *
         */
        _ready: function() {
            for(callback in this.readyCallbacks) {
                callback();
                delete(this.readyCallbacks[callback]);
            }
            this.readyState = true;
        }
    });

})(jQuery);
