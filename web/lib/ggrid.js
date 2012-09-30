(function($) {
  $.widget('ui.ggrid', {
    options: {
      name: '',
      className: '',
      container: undefined,
      dataSource: [],
      dataSourceBackup: [],

      style: {
        'row-height': 20,
        'min-height': 500,
        'height': 400,
        'scrollbar-y-width': 18,
        'scrollbar-y-border-right': '1px solid #ccc',
        'scrollbar-x-height': 18
      },
      

      storageType: '',
      storageUpdateURL: '',
      storageSchema: {},
      columnManager: {
        enable: false,
        container: 'body',
        numberPerColumn: 12
      },
      getColumnManager: null,
      
      fieldInvisible: [], 
      fieldOrder: [],
      fieldVisibility: [],
      fieldFilterabibity: [],
      fieldSortability: [],
      
      customizedFields: [],
      
      onBeforeStart: function(){},
      onStart: function(){},
      onComplete: function(){},
      onRowDblClick: function(){},
      onPageChange: function(){},
      onBeforeFiltering: function(){/* Not implemented in this version */},
      onFilteringComplete: function(){/* Not implemented in this version */},
      onBeforeSorting: function(){/* Not implemented in this version */},
      onSortingComplete: function(){/* Not implemented in this version */},

      fields: [],
      itemCountPerPage: -1,
      totalPageNumber: -1,
      currentPage: -1,
      timeFormat: '',
      currentRow: -1,
      
      resizable: true,
      
      colTemplate: function(row, col, index){
        return '<td>' + row[col.name] + '</td>';
      },
      rowTemplate: function(row, index){
        return '<tr class="' + (index%2==0?'even':'odd') + '">';
      },
      fieldnameDictionary: {},
      fieldSortability: [],
      fieldFilterability: []
    },
    isCompleted: false,
    isMouseWheeling: false,
    isScrollYMousedown: false,
    dataLength: -1,
    timerHidePaginationIndicator: setTimeout(function(){},0),
    timerPagination: setTimeout(function(){},0),
    IEDisplayTimer: setTimeout(function(){},0),
    lastVisitedPage: -1,
    sortStart: -1,
    sortStartIndex: -1,
    sortEnd: -1,
    sortEndIndex: -1,
    rowPlaceholder: {},
    
    complyOlderVersions: function(){
      var _this = this;
      var map = [
        {fieldOrder: 'fieldname_order'}, 
        {fieldVisibility: 'col_visibility'},
        {fieldFilterability: 'filterable_fields'},
        {fieldSortability: 'sortable_fields'},
        {customizedFields: 'insert_fields'},
        {fieldnameDictionary: 'dict'},
        {fieldInvisible: 'non_display_fields'},
        {itemCountPerPage: 'item_per_page'}
      ]
      
      $(map).each(function(index, pair){
        for(var prop in pair){
          var from = pair[prop];
          var to = prop;
          var swap = _this.options[from];
          if( typeof swap != 'undefined' ){
            _this.options[to] = swap;
            delete _this.options[from];
          }
        }
      })
      var customizedFields = [];
      $(this.options.customizedFields).each(function(index, field){ customizedFields.push(field['data']) });
      this.options.customizedFields = customizedFields;
    },
    _initFields: function(){
      var data = this.options.dataSource;
      var customizedFields = this.options.customizedFields;
      var fields = [];
      var fieldOrder = $getCookie( this.options.name + 'FieldOrder' );
          fieldOrder = fieldOrder == null ? [] : fieldOrder;
      var fieldVisibility = $getCookie( this.options.name + 'FieldVisibility' );
      var fieldInvisible = this.options.fieldInvisible;
      
      if(data.length == 0){
        return;
      }
      if( typeof fieldOrder == 'string' ){ this.options.fieldOrder = fieldOrder.split(','); };
      if( fieldVisibility ){ this.options.fieldVisibility = fieldVisibility.split(','); };
      
      fieldOrder = this.options.fieldOrder;
      
      var sample = data[0];
      for(var prop in sample){
        fields.push({
          name: prop
        });
      }
      $(customizedFields).each(function(index, field){
        fields.splice(0, 0, field);
      })
      
      if( fieldOrder.length > 0 ){
        if( fieldOrder.length < fields.length ){
          var inserted = 0;
          var unserialized = $(fields).map(function(){return this.name}).get();
          $(fieldOrder).each(function(){
            var fieldname = this.toString();
            var position = $.inArray(fieldname, unserialized);
            if( position > -1 ){
              unserialized.splice(position, 1);
              unserialized.splice(inserted, 0, fieldname);
              inserted++;
            }
          })
          $(fieldInvisible).each(function(){
            var fieldname = this.toString();
            var position = $.inArray(fieldname, unserialized);
            if( position > -1 ){
              unserialized.splice(position, 1);
            }
          })
          fields = $(unserialized).map(function(){return {name:this.toString().replace(/^\s*/,'').replace(/\s+$/,'') }}).get();
        }else{
          fields = $(fieldOrder).map(function(){ return {name:this.toString().replace(/^\s*/,'').replace(/\s+$/,'') }}).get();
        }
      }
      this.options.fields = fields;
      
      var self = this;
      if(this.options.fieldVisibility.length == 0){
        $(fields).each(function(index){
          self.options.fieldVisibility[index] = 1;
        })
      }

      $(fields).each(function(){ self.rowPlaceholder[this.name] = ''; });
      this.rowPlaceholder['isPlaceholder'] = true;
    },
    _onComplete: function(){
      this.options.onComplete();
      this.options.isCompleted = true;
    },
    _reloadColumnManager: function(){
      if( !this.options.columnManager.enable ){
        return
      }
      
      $(this.options.columnManager.container).html('');
      this._installColumnManager();
    },
    _installColumnManager: function(){
      if( !this.options.columnManager.enable ){
        return
      }
      
      var self = this;
      var columnManagerClass = 'ggrid-column-manager';
      var columnManagerContainer = $(this.options.columnManager.container).addClass(columnManagerClass);
      var columnCount = this.options.columnManager.numberPerColumn;
      var fields = this.options.fields;
      var fieldVisibility = this.options.fieldVisibility;
      var html = [];
      var columnNumber = 0;
      $(fields).each(function(index, field){
        if((index+1)%columnCount==1){
          html.push('<ul class="connectedSortable">');
          columnNumber++;
        }
        html.push('<li class="' + ( fieldVisibility[index] == 1 ? 'checked' : '' ) + '"><div class="order">'+(index+1)+'</div><div class="name">'+field.name+'</div></li>');
        if((index+1)%columnCount==0){
          html.push('</ul>');
        }
      })
      html.push('</ul>');
      $(html.join('')).appendTo(columnManagerContainer);
      columnManagerContainer.css({
        width: columnManagerContainer.find('ul:first').width()*columnNumber + 50
      }).find('.order').mouseover(function(){
        $(this).addClass('hover');
      }).mouseout(function(){
        $(this).removeClass('hover');
      }).click(function(){
        var parent = $(this).parent();
        if( parent.hasClass('checked') ){
          parent.removeClass('checked');
        }else{
          parent.addClass('checked');
        }
        var fieldVisibility = self._saveFieldVisibility();
        var isVisibleIndex = columnManagerContainer.find('.order').index(this);
        var container = $(self.options.container);
        container.find('tr').each(function(index, tr){
          var tr = $(tr);
          var cols = tr.find('th,td');
          var col = cols.filter(':eq('+isVisibleIndex+')');
          if( parent.hasClass('checked') ){
            col.show();
          }else{
            col.hide();
          }
          self.resize();
        })
        
        self.options.fieldVisibility = fieldVisibility;
      })
      
      var sortEvent = function(){
        clearTimeout(FORCEIETIMER); FORCEIEDISPLAY = true;
        if(!$.browser.msie){
          var ul = columnManagerContainer.find('ul');
          ul.each(function(index, col){
            var col = $(col);
            var size = col.find('li').map(function(){ if($(this).css('position') != 'absolute')return this }).size();
            var notlast = (col.get(0) != columnManagerContainer.find('ul:last').get(0));
            if( notlast && (size < columnCount) ){
              var nextcol = col.next();
              nextcol.find('li:first').appendTo(col);
            }else if( notlast && size > columnCount ){
              var nextcol = col.next();
              col.find('li:last').prependTo(nextcol);
            }
          })
        }
        if( self.sortStart == -1 ){
          self.sortStart = columnManagerContainer.find('.ui-sortable-helper');
          self.sortStartIndex = columnManagerContainer.find('li').index( self.sortStart );
        }
      }
      var updateEvent = function(){
        clearTimeout(FORCEIETIMER); FORCEIEDISPLAY = true;
        if(!$.browser.msie){
          columnManagerContainer.find('.order').each(function(index){
            $(this).html( index + 1 );
          })
        }
      }
      var stopEvent = function(){
        FORCEIEDISPLAY = false;
        var fieldOrder = self._saveFieldOrder();
        self.sortEnd = self.sortStart;
        self.sortEndIndex = columnManagerContainer.find('li').index( self.sortEnd );
        
        var from = self.sortStartIndex;
        var to = self.sortEndIndex;
        
        var container = $(self.options.container);
        container.find('tr').each(function(index, tr){
          var tr = $(tr);
          var cols = tr.find('th,td');
          var from_col = cols.filter(':eq('+from+')');
          var to_col = cols.filter(':eq('+to+')');
          if( from > to ){
            from_col.insertBefore(to_col);
          }else if( from < to ){
            from_col.insertAfter(to_col);
          }
        })
        
        self.options.fieldOrder = fieldOrder;
        self._initFields();
        self.sortStart = -1;
        self.sortStartIndex = -1;
        self.sortEnd = -1;
        self.sortEndIndex = -1;
      }
      
      columnManagerContainer.mouseover(function(){
        clearTimeout(FORCEIETIMER); FORCEIEDISPLAY = true;
      }).mouseout(function(){
        FORCEIEDISPLAY = false;
      }).find('ul').sortable({
        delay: 0,
        distance: 0,
        handle: '.name',
        connectWith: ".connectedSortable",
        sort: sortEvent,
        update: updateEvent,
        stop: stopEvent
      }).disableSelection();

      this.options.getColumnManager = columnManagerContainer;
    },
    getFieldOrder: function(){
      var columnManager = this.options.getColumnManager;
      var fieldOrder = columnManager.find('.name').map(function(){return $(this).text() }).get();
      return fieldOrder;
    },
    getFieldVisibility: function(){
      var columnManager = this.options.getColumnManager;
      var fieldVisibility = columnManager.find('li').map(function(){return $(this).hasClass('checked') ? 1 : 0 }).get();
      return fieldVisibility;
    },
    _saveFieldOrder: function(){
      var storageType = this.options.storageType;
      var storageSchema = this.options.storageSchema;
      var storageUpdateURL = this.options.storageUpdateURL;
      var fieldOrder = this.getFieldOrder();
      var name = this.options.name;
      
      if ( storageType == 'DB' ){
        var data = {};
            data[storageSchema['fieldOrder']] = fieldOrder;
            data = JSON.stringify(data);
        $.ajax({
          url: storageUpdateURL + '?data='+data,
          type: 'GET',
          dataType: 'JSON',
          context: document.body,
          success: function(data){
          }
        });
      }else{
        _setCookie( name + 'FieldOrder', fieldOrder );
      }

      return fieldOrder;
    },
    _saveFieldVisibility: function(){
      var storageType = this.options.storageType;
      var storageSchema = this.options.storageSchema;
      var storageUpdateURL = this.options.storageUpdateURL;
      var fieldVisibility = this.getFieldVisibility();
      var name = this.options.name;
      if ( storageType == 'DB' ){
        var data = {};
            data[storageSchema['fieldVisibility']] = fieldVisibility;
            data = JSON.stringify(data);
        $.ajax({
          url: storageUpdateURL + '?data='+data,
          type: 'GET',
          dataType: 'JSON',
          context: document.body,
          success: function(data){
          }
        });
      }else{
        _setCookie( name + 'FieldVisibility', fieldVisibility );
      }

      return fieldVisibility;
    },
    _installFieldEnhancement: function(){
      if( this.options.fields.length == 0)return;
      var container = $(this.options.container);
      var thead = container.find('thead');
      var theadHeight = thead.height();
      var self = this;
      
      if(theadHeight == 0){
        this.installFieldEnhancementTimer = setTimeout(function(){ self._installFieldEnhancement() }, 0);
        return
      }else{
        clearTimeout(this.installFieldEnhancementTimer);
        
        var tr = thead.find('tr');
        var th = tr.find('th');
        var self = this;
        
        th.each(function(index, field){
          var field = $(field);
          var raw = field.attr('raw');
          var fieldname = field.text();
          
          self._installSortable(field, raw, fieldname);
          self._installFilterable(field, raw, fieldname);
          self._attachFieldEvent(field, raw, fieldname);
          
        })
        $('.ggrid-field-filter input').bind('click' , {_this:this}, this._filterOptionClickEvent);
      }
    },
    _installFieldIndicator: function(field, type){
      var fieldWidth = field.width();
      var paddingTop = $number(field.css('padding-top'));
      var paddingBottom = $number(field.css('padding-bottom'));
      var paddingRight = $number(field.css('padding-right'));
      var IEMarginTop = 0 - paddingTop*2;
      var background = '';
      
      var style = {
        'margin-left': 1,
        top: 0 - paddingTop + 1,
        right: 0 - paddingRight + 1
      }
      var indicator = $('<div class="ggrid-field-indicator ggrid-field-indicator-'+type+'" style="^margin-top:'+IEMarginTop+'"></div>').appendTo( field );
          indicator.css(style);
    },
    _attachFieldEvent: function(field, raw, fieldname){
      var fieldSortability = this.options.fieldSortability;
      var fieldFilterability = this.options.fieldFilterability;
      if( $.inArray(raw, fieldSortability) > -1 ||  $.inArray(raw, fieldFilterability) > -1 ){
        field.bind('mouseover' , {_this:this}, this._fieldMouseOverEvent);
        field.bind('mouseout' , {_this:this}, this._fieldMouseOutEvent);
        if( $.inArray(raw, fieldFilterability) > -1 ){
          field.bind('mouseover' , {_this:this}, this._fieldFilterMouseOverEvent);
          field.bind('mouseout' , {_this:this}, this._fieldFilterMouseOutEvent);
        }
        if( $.inArray(raw, fieldSortability) > -1 ){
          field.bind('click' , {_this:this}, this._fieldClickEvent);
        }
      }
      
      
    },
    _fieldFilterMouseOverEvent: function(event){
      var _this = event.data._this;
      var container = $(_this.options.container);
      var filter = container.find('.ggrid-field-filter').show();
      filter.parent().find('.ggrid-field-indicator-filtering');

    },
    _fieldFilterMouseOutEvent: function(event){
      var _this = event.data._this;
      var container = $(_this.options.container);
      var filter = container.find('.ggrid-field-filter').hide();
      filter.parent().find('.ggrid-field-indicator-filtering');

    },
    _fieldMouseOverEvent: function(event){
      var _this = event.data._this;
      var hoverClass = 'ggrid-th-hover';
      $(this).addClass(hoverClass);
    },
    _fieldMouseOutEvent: function(event){
      var _this = event.data._this;
      var hoverClass = 'ggrid-th-hover';
      $(this).removeClass(hoverClass);
    },
    _fieldClickEvent: function(event){
      var target = $(event.target);
      var _this = event.data._this;
      if(target.prop('tagName') == 'TH'){
        var container = $(_this.options.container);
        var thead = container.find('thead');
        var onBeforeSorting = _this.options.onBeforeSorting;
            onBeforeSorting();
        var onSortingComplete = _this.options.onSortingComplete;
        var sortingIcon = target.find('.ggrid-field-indicator-sorting');
        var order = sortingIcon.attr('order');
        var raw = target.attr('raw');
        
        var orderAscClass = 'ggrid-field-sorting-asc';
        var orderDescClass = 'ggrid-field-sorting-desc';
        thead.find('.ggrid-field-indicator-sorting').map(function(){
          if( this != target.get(0) ){ return this }
        }).css({
          'background-color': ''
        }).removeAttr('order').removeClass(orderAscClass).removeClass(orderDescClass);
        
        if( !$def(order) || order == 'DESC' ){
          sortingIcon.attr('order', 'ASC');
          sortingIcon.removeClass(orderDescClass).addClass(orderAscClass);
        }else{
          sortingIcon.attr('order', 'DESC');
          sortingIcon.removeClass(orderAscClass).addClass(orderDescClass);

        }
        var data = _this.options.dataSource;
        var query = _this._getDataFromCombinedCondition(data);
        _this.options.dataSource = query.result;
        _this.reloadDataOnly();
        onSortingComplete();
        _this.resize();
      }
    },
    _filterOptionClickEvent: function(event){
      var _this = event.data._this;
      var filterContainer = $(this).parent().parent().parent().parent();
      var checkedInputLength = filterContainer.find('input:checked').length;
      var inputLength = filterContainer.find('input').length;
      
      if( checkedInputLength == 0 ){
        $(this).prop('checked', true);
        return
      }
       
      var onBeforeFiltering = _this.options.onBeforeFiltering;
          onBeforeFiltering();
      
      var filterEnabledClass = 'ggrid-field-filter-enabled';
      var filterDisabledClass = 'ggrid-field-filter-disabled';
      
      if( inputLength != checkedInputLength ){
        filterContainer.parent().parent().find('.ggrid-field-indicator-filtering').removeClass(filterDisabledClass).addClass(filterEnabledClass);
        
      }else{
        filterContainer.parent().parent().find('.ggrid-field-indicator-filtering').removeClass(filterEnabledClass).addClass(filterDisabledClass);
      }
      
      var data = _this.options.dataSourceBackup;
      var query = _this._getDataFromCombinedCondition(data);
      _this.options.dataSource = query.result;
      _this.reloadDataOnly();
      _this.resize();
    },
    _getDataFromCombinedCondition: function(data){
      var container = $(this.options.container);
      var order = container.find('.ggrid-field-indicator-sorting').map(function(){ var sorting = $(this); var order = sorting.attr('order'); if( $def(order) ){ return sorting.parent().attr('raw') + ' ' + order } }).get();
      var filters = container.find('.ggrid-field-filter');
      var condition = filters.map(function(){
        var filter = $(this);
        var raw = filter.attr('raw');
        return $(filter).find('input:checked').map(function(){ return raw + '=="'+$(this).val().replace(/^\(Blanks\)$/,'')+'"'}).get().join(' OR ');
      }).get().join(') AND (');
      condition = '(' + condition + ')';
      //alert(condition)
      var query = {};
      if( filters.size() > 0){
        query = select('*').from(data).where(condition);
      }else{
        query = select('*').from(data);
      }
      if(order.length == 1){
        query = query.orderby(order.join(''))
      }
      
      return query;
    },
    _installSortable: function(field, raw, fieldname){
      var fieldSortability = this.options.fieldSortability;
      if( $.inArray(raw, fieldSortability) > -1 ){
        this._installFieldIndicator( field, 'sorting' );
        
      }
    },
    _reloadFilter: function(){
      if( this.options.fields.length == 0)return;
      var container = $(this.options.container);
      var thead = container.find('thead');
      var tr = thead.find('tr');
      var th = tr.find('th');
      var self = this;
      
      th.each(function(index, field){
        var field = $(field);
        var raw = field.attr('raw');
        var fieldname = field.text();
        
        field.find('.ggrid-field-indicator-filtering').remove();
        field.find('.ggrid-field-panel').remove();
        
        self._installFilterable(field, raw, fieldname);
        
      })
      $('.ggrid-field-filter input').bind('click' , {_this:this}, this._filterOptionClickEvent);
      
    },
    _reloadFieldEnhancement: function(){
      if( this.options.fields.length == 0)return;
      var container = $(this.options.container);
      var thead = container.find('thead');
      var theadHeight = thead.height();
      var self = this;
      
      if(theadHeight == 0){
        this.reloadFieldEnhancementTimer = setTimeout(function(){ self._reloadFieldEnhancement() }, 0);
        return
      }else{
        clearTimeout(this.reloadFieldEnhancementTimer);
        
        var tr = thead.find('tr');
        var th = tr.find('th');
        var self = this;
        
        th.each(function(index, field){
          var field = $(field);
          var raw = field.attr('raw');
          var fieldname = field.text();
          
          field.find('.ggrid-field-indicator').remove();
          
          self._installSortable(field, raw, fieldname);
          self._installFilterable(field, raw, fieldname);
          self._attachFieldEvent(field, raw, fieldname);
          
        })
        $('.ggrid-field-filter input').bind('click' , {_this:this}, this._filterOptionClickEvent);
      }
    },
    _installFilterable: function(field, raw, fieldname){
      var fieldFilterability = this.options.fieldFilterability;
      var data = this.options.dataSource;
      if( $.inArray(raw, fieldFilterability) > -1 ){
        this._installFieldIndicator( field, 'filtering' );
        
        var options = $.map(select(raw).from(data).result, function(res){return res[raw].toString()});
            options = $unique(options);
            options.splice(0, 0, '(Blanks)')
        var optionLength = options.length;
        var optionHeight = 20;
        var panelMinHeight = 100;
        var panelHeight = optionHeight * optionLength;
            panelHeight = panelHeight < panelMinHeight ? panelMinHeight : panelHeight;
            
        
        var html = [];
        $(options).each(function(index, option){
          html.push('<div><nobr><label><input type="checkbox" style="position:relative; top:2px;" value="'+option+'" checked />'+option+'</label></nobr></div>');
        })
        html = html.join('');
        
        var paddingLeft = $number(field.css('padding-left'));
        var paddingRight = $number(field.css('padding-right'));
        var paddingBottom = $number(field.css('padding-bottom'));
        var height = panelHeight;
        var panelClass = 'ggrid-field-panel';
        var panelStyle = {
              'margin-bottom': 0 - height -2,
              'margin-left': 0 - paddingLeft,
              'margin-right': 0 - paddingRight,
              top: paddingBottom,
              height: height
            }
        var panel = $('<div class="ggrid-field-filter '+panelClass+'" raw="'+raw+'"><div style="position:absolute;">'+html+'</div></div>').appendTo(field).css(panelStyle);
        
      }
    },
    _reloadField: function(){
      var container = $(this.options.container);
      var table = container.find('table:first');
      var thead = container.find('thead');
      var tbody = container.find('tbody');
      thead.html( this._renderFields() );
      
    },
    _renderFields: function(){
      var container = $(this.options.container);
      var fields = this.options.fields;
      var fieldVisibility = this.options.fieldVisibility;
      var fieldnameDictionary = this.options.fieldnameDictionary;
      var html = [];

      html.push( '<tr>' );
      $(fields).each(function(index, field){
        var fieldname = fieldnameDictionary[field.name];
            fieldname = typeof fieldname == 'undefined' ? field.name : fieldname;
        html.push( '<th raw="'+field.name+'" ' + ( fieldVisibility[index] == 1 ? '' : 'style="display:none"' ) + '>' + fieldname + '</th>' );
      })
      html.push( '</tr>' );
      
      return html.join('');
    },
    _renderTableHeaders: function(){
      var html = [];
      var className = this.options.className;
      var container = $(this.options.container);
      
      html.push( '<div><table class="ggrid '+className+'"><thead>' );
      html.push( this._renderFields() );
      html.push( '</thead><tbody></tbody></table></div>' );
      html = html.join('');
      
      container.html(html);
      
    },
    _renderTableBody: function(){
      var container = $(this.options.container);
      var table = container.find('table:first');
      var style = this.options.style;
      var data = this.options.dataSource;
      var height = style['height'];
          height = height < style['min-height'] ? style['min-height'] : height;
          this.options.style.height = height;
          container.height(height);
      
      if( this.options.dataSource.length == 0 ){
        this.options.currentPage = -1;
        this.options.onPageChange();
        this._installPagination();
        this._displayText('<div style="margin:10px; font:bold 20pt arial; color:#fff; ">No Data Found</div>');
      }else{
        this.options.currentPage = 1;
        this._reloadData();
        this.options.onPageChange();
        this._installPagination();
        this._displayPageNumber();
      }
    },
    changeDataSource: function(data){
      this.options.dataSource = data;
      this.options.dataSourceBackup = $.extend(true, [], this.options.dataSource);
      this._reloadFilter();
    },
    reloadTableHeaders: function(){
      this._initFields();
      this._reloadField()
      this._reloadFieldEnhancement();
      this._reloadColumnManager();
    },
    reload: function(){
      this.reloadDataOnly();
      this.resize();
    },
    reloadDataOnly: function(){
      //depricated in the future
      this.options.currentPage = 1;
      this._reloadData();
      this.options.onPageChange();
      this._reloadPagination();
      if( this.options.dataSource.length == 0 ){
        this._displayText('<div style="margin:10px; font:bold 20pt arial; color:#fff; ">No Data Found</div>');
      }else{
        this._displayPageNumber();
      }
    },
    test: function(){ alert('test') },
    updateData: function(index, field, value){
      //Shall sync to databackup, not done
      var data = this._updateData(index, field, value);
      this.deleteData(index, 1);
      this.insertData(index, [data]);
    },
    updateDataOnly: function(index, field, value){
      this._updateData(index, field, value);
    },
    _updateData: function(index, field, value){
      if( typeof field == 'string' ){
        this.options.dataSource[index][field] = value;
      }else{
        var data = field;
        this.options.dataSource[index] = data;
      }
      return this.options.dataSource[index];
    },
    deleteData: function(index, length){
      //Possible bug found, to delete something not in current page. not done.
      
      this._deleteData(index, length);
      var itemCountPerPage = this.options.itemCountPerPage;
      var position = index % itemCountPerPage -1;
      var pointerPage = parseInt(index/itemCountPerPage)+1;
      var currentPage = this.options.currentPage;

      if(pointerPage == currentPage){
        var delete_rows = this._getRows();
          if(position < 0){
            delete_rows = delete_rows.filter(':lt('+(length)+')');
          }else{
            delete_rows = delete_rows.filter(':gt('+(position)+')').filter(':lt('+(length)+')');
          }
            delete_rows.remove();
        
            rows = this._getRows();
        var continueAt = (currentPage-1)*itemCountPerPage + rows.length;
        var data = this.options.dataSource;
        var tailor_data = data.slice(continueAt, currentPage*itemCountPerPage);
        var insertAfter = rows.last();
        
        this._reloadPartialData(tailor_data, insertAfter);
        this.options.onPageChange();
        //this._reloadData();
      }
      this._reloadPagination();
    },
    _deleteData: function(index, length){
      this.options.dataSource.splice(index, length);
    },
    insertData: function(index, data){
      var itemCountPerPage = this.options.itemCountPerPage;
      var currentPage = this.options.currentPage;
      var dataLength = data.length;
      var futureLength = index + dataLength;
      var pointerPage = parseInt(index/itemCountPerPage)+1;
      var futurePage = futureLength % itemCountPerPage == 0 ? futureLength/itemCountPerPage : parseInt(futureLength/itemCountPerPage)+1;
      var position = index % itemCountPerPage -1;
      var tailorLength = 0;
      var rows = this._getRows();
      this._insertData(index, data);
      
      if( pointerPage == currentPage ){
        if( futurePage > currentPage ){
          tailorLength = itemCountPerPage - position -1;
        }else{
          tailorLength = dataLength;
        }
        
        var tailorData = data.slice(0, tailorLength);
        var insertAfter = $(rows[position]);
        this._reloadPartialData(tailorData, insertAfter);
        
            rows = this._getRows();
        var rowsLength = rows.length;
        if(rowsLength > itemCountPerPage){
          for(var i = 1; i <= rowsLength - itemCountPerPage; i++){
            rows.filter(':eq(' + ( rowsLength - i ) + ')').remove();
          }
        }
        
        this.options.onPageChange();
        
        //Reload everything would be easier but extremely slow on IE7
        //this._reloadData();
      }
      this._reloadPagination();
    },
    _insertDataOnly: function(index, data){
      this._insertData(index, data);
    },
    _insertData: function(index, data){
      var _this = this;
      $(data).each(function(i, d){
        _this.options.dataSource.splice(index, 0, d);
        index++;
      })
    },
    _reloadPartialData: function(data, insertAfter){
      var container = $(this.options.container);
      var table = container.find('table:first');
      var onRowDblClick = this.options.onRowDblClick;
      var tbody = container.find('tbody');
      var dataLength = this.options.dataSource.length;
      var itemCountPerPage = this.options.itemCountPerPage;
      var totalPageNumber = dataLength % itemCountPerPage == 0 ? (dataLength / itemCountPerPage) : parseInt(dataLength / itemCountPerPage)+1;
      
      this.dataLength = dataLength;
      this.options.totalPageNumber = totalPageNumber;
      
      var html = this._renderRows(data).join('');
      var newRows = $(html);
      if( insertAfter.size() == 0 ){
          tbody.prepend(newRows);
      }else{
          newRows.insertAfter(insertAfter);
      }
      newRows = tbody.find('tr[_c=_new]').removeAttr('_c');
      newRows.bind('dblclick', onRowDblClick);

    },
    _reloadData: function(){
      var container = $(this.options.container);
      var table = container.find('table:first');
      var onRowDblClick = this.options.onRowDblClick;
      var thead = container.find('thead');
      var tbody = container.find('tbody');
          tbody.html('');
      var data = this.options.dataSource;
      var dataLength = data.length;
      var currentPage = this.options.currentPage;
      var style = this.options.style;
      var rowHeight = style['row-height'];
      var tbodyHeight = container.height() - thead.height();
      var itemCountPerPage = this.options.itemCountPerPage;
          itemCountPerPage = parseInt(tbodyHeight/rowHeight);
      var totalPageNumber = dataLength % itemCountPerPage == 0 ? (dataLength / itemCountPerPage) : parseInt(dataLength / itemCountPerPage)+1;
      this.dataLength = dataLength;
      this.options.itemCountPerPage = itemCountPerPage;
      this.options.totalPageNumber = totalPageNumber;
      
          
//$('<div style="position:absolute; top:0; left:0; background:#f06; width:10px; height:'+tbodyHeight+'px"></div>').appendTo($('body')).draggable();
      
      data = data.slice( (currentPage-1)*itemCountPerPage, currentPage*itemCountPerPage );

      if(data.length < this.options.itemCountPerPage){
        var placeholder_size = this.options.itemCountPerPage - data.length;
        for( var i = 0; i < placeholder_size; i++ ){
          data.push( this.rowPlaceholder );
        }
      }

      var html = this._renderRows(data);
          html = html.join('');
      tbody.html(html);
      var newRows = tbody.find('tr[_c=_new]').removeAttr('_c');
          newRows.bind('dblclick', onRowDblClick)
      this.lastVisitedPage = currentPage;
    },
    getRows: function(){
      return this._getRows();
    },
    _getRows: function(){
      var container = $(this.options.container);
      var tbody = container.find('tbody');
      return tbody.find('tr[isplaceholder!=true]');
    },
    _renderRows: function(data){
      var fields = this.options.fields;
      var fieldVisibility = this.options.fieldVisibility;
      var colTemplate = this.options.colTemplate;
      var rowTemplate = this.options.rowTemplate;
      var style = this.options.style;
      var rowHeight = style['row-height'];
      var html = [];
      var dataSource = this.options.dataSource;
      var col_loop = function(field, index, row){
        if($def(field)){
          if( fieldVisibility[index] == 1 ){
            if(row.isPlaceholder == true){
              html.push( colTemplate(row, field, index).replace(/(<td[^>]*>).*(<\/td>)/,"$1$2") ); 
            }else{
              html.push( colTemplate(row, field, index) );
            }
          }else{
            var tmp_html = colTemplate(row, field, index);
            if(/<td[^>]*style=['"]/.test(tmp_html) == true){
              html.push( tmp_html.replace(/(style=['"][^'"]*;?)(['"])/, "$1; display:none;$2") );
            }else{
              html.push( tmp_html.replace(/>/, " style=\"display:none\">") );
            }
          }
        }
      }
      
      var indexStartAt = $.inArray(data[0], dataSource);
      var row_loop = function(row, index){
        if($def(row)){
          var index = indexStartAt + index;
          var tmp_html = rowTemplate(row, index);
              if(/style=['"]/ig.test(tmp_html) == true){
              tmp_html = tmp_html.replace(/(style=['"][^'"]*;?)(['"])/, "$1; height:"+rowHeight+"px;$2");
              }else{
              tmp_html = tmp_html.replace(/>/, " style=\"height:"+rowHeight+"px\">");
              }
              tmp_html = tmp_html.replace(/>/, " _c=\"_new\">");
              if(row.isPlaceholder == true){
              tmp_html = tmp_html.replace(/>/, " isplaceholder=\"true\">");
              }
          html.push( tmp_html );
          $fastloop(fields, col_loop, row);
          html.push( '</tr>' );
        }
      }
      $fastloop(data, row_loop);
      return html;
    },
    _renderTableFooters: function(){

    },
    _displayText: function(text){
      clearTimeout(this.timerHidePaginationIndicator);
      
      this.paginationIndicator.html(text).show();
      this._hidePaginationIndicator();
    },
    displayPageNumber: function(){
      this._displayPageNumber();
    },
    _displayPageNumber: function(){
      var text = '<div style="margin:10px; font:bold 20pt arial; color:#fff; ">Page: ' + this.options.currentPage + ' of ' + this.options.totalPageNumber + '</div>';
      this._displayText(text);
    },
    _hidePaginationIndicator: function(){
      var _this = this;
      this.timerHidePaginationIndicator = setTimeout(function(){
        _this.paginationIndicator.fadeOut();
      }, 1000)
    },
    _reloadPagination: function(){
      //Placeholder for reload scrollbar when dataset size is changed
      var style = this.options.style;
      var rowHeight = style['row-height'];
      var dataLength = this.dataLength;
      var totalHeight = rowHeight * dataLength;
      
      this.scrollbarYInner.height(totalHeight);
      this._setScrollbarYTop();
    },
    _installPagination: function(){
      var _this = this;
      var container = $(this.options.container);
      var style = this.options.style;
      var thead = container.find('thead');
      var tbody = container.find('tbody');
      var tbodyHeight = container.height() - thead.height();
      var scrollbarXHeight = style['scrollbar-x-height'];
      var scrollbarYHeight = tbodyHeight - scrollbarXHeight;
      var scrollbarXContainer = container.find('div:first').css({
        height: style['height'],
        'overflow-x': 'auto',
        'overflow-y': 'hidden'
      })
      var scrollbarYContainer = $('<div></div>').insertAfter(scrollbarXContainer).css({
        float: 'right',
        width: style['scrollbar-y-width'],
        height: scrollbarYHeight,
        'overflow-x': 'hidden',
        'overflow-y': 'auto',
          'margin-top': 0 - style['height'] + thead.height()
        }).show();

      var rowHeight = style['row-height'];
      var dataLength = this.dataLength;
      var totalHeight = rowHeight * dataLength;
      var scrollbarYInner = $('<div>&nbsp;</div>').appendTo(scrollbarYContainer).height(totalHeight);
          this.scrollbarYInner = scrollbarYInner;
      var paginationIndicator = $('<div>#</div>').insertBefore(container);
      var paginationIndicatorClass = 'ggrid-pagination-indicator';
      paginationIndicator.addClass(paginationIndicatorClass).css({
        position: 'absolute',
        opacity: 0.9,
        'margin-left': 20,
        'z-index': 1
      });
      var paginationHeight = paginationIndicator.height();
      paginationIndicator.css({
        'margin-top': thead.height() + 20
      })
      
      this.scrollbarXContainer = scrollbarXContainer;
      this.scrollbarYContainer = scrollbarYContainer;
      this.paginationIndicator = paginationIndicator;
      this.scrollbarYInner = scrollbarYInner;
      scrollbarYContainer.bind('scroll'    , {_this:this}, this._onScrollYEvent);
      scrollbarYContainer.bind('mousedown' , {_this:this}, this._onScrollYMouseDown);
      scrollbarYContainer.bind('mouseup'   , {_this:this}, this._onScrollYMouseUp);
      scrollbarYContainer.bind('mousewheel', {_this:this}, this._onMouseWheelEvent);
      container.bind('mousewheel', {_this:this}, this._onMouseWheelEvent);
      
      this._setScrollbarYTop();
    },
    _setScrollbarYTop: function(){
      var currentPage = this.options.currentPage;
      var totalHeight = this.scrollbarYInner.height();
      var unitScrollTop = totalHeight / this.options.totalPageNumber;
      var scrollTop = (currentPage-1) * unitScrollTop;
      this.scrollbarYContainer.scrollTop(scrollTop);
    },
    _onScrollYMouseDown: function(event){
      event.preventDefault();
      var _this = event.data._this;
      _this.isScrollYMousedown = true;
    },
    _onScrollYMouseUp: function(event){
      event.preventDefault();
      var _this = event.data._this;
      _this.isScrollYMousedown = false;
      
      if ( _this.lastVisitedPage != _this.options.currentPage ){
        clearTimeout( _this.timerPagination );
        _this.timerPagination = setTimeout(function(){
          _this._reloadData();
          _this.options.onPageChange();
          var container = $(_this.options.container);
          container.width(container.width());
          _this.resize();
        }, 100);
      }
    },
    _onScrollYEvent: function(event){
      event.preventDefault();
      var _this = event.data._this;
      
      if(_this.isMouseWheeling == false){
        clearTimeout( _this.timerPagination );
        var actualScrollTop = $(this).scrollTop();
        var totalHeight = _this.scrollbarYInner.height();
        var unitScrollTop = totalHeight / (_this.options.totalPageNumber + 1);
        var currentPage = parseInt(actualScrollTop / unitScrollTop) +1
//$('#site-title').html(actualScrollTop + ',' + totalHeight + ',' + unitScrollTop + ',' + currentPage)
        
        _this.options.currentPage = currentPage;
        _this._displayPageNumber();
        if ( _this.lastVisitedPage != _this.options.currentPage ){
          _this.timerPagination = setTimeout(function(){
            _this._reloadData();
            _this.options.onPageChange();
            var container = $(_this.options.container);
            container.width(container.width());
            _this.resize();
          }, 100);
        }
      }
    },
    _onMouseWheelEvent: function(event, delta){
      event.preventDefault();
      var _this = event.data._this;
      clearTimeout( _this.timerPagination );
      
      var currentPage = _this.options.currentPage;
      currentPage -= delta;
      currentPage = currentPage <= 0 ? 1 : currentPage;
      currentPage = currentPage >= _this.options.totalPageNumber ? _this.options.totalPageNumber : currentPage;
      _this.isMouseWheeling = true;
      _this.options.currentPage = parseInt(currentPage);
      _this._displayPageNumber();
      if ( _this.lastVisitedPage != _this.options.currentPage ){
        _this.timerPagination = setTimeout(function(){
          _this._reloadData();
          _this.options.onPageChange();
          var container = $(_this.options.container);
          container.width(container.width());
          _this.resize();
          _this.isMouseWheeling = false;
        }, 100);
      }
      _this._setScrollbarYTop();
    },
    resize: function(){
      this._resize.call(this, {data:{_this:this}});
    },
    _resize: function(event){
      var _this = event.data._this;
      var container = $(_this.options.container);
      var parent = container.parent();
      var parentPaddingLeft = $number(parent.css('padding-left'));
      var parentPaddingRight = $number(parent.css('padding-right'));
      
      var table = container.find('table:first');
      var thead = table.find('thead');
      var style = _this.options.style;
      var scrollbarXContainer = _this.scrollbarXContainer;
      var scrollbarYContainer = _this.scrollbarYContainer;
      
      var scrollLeft = scrollbarXContainer.scrollLeft();
      table.css({width:'auto', opacity:0});
      scrollbarXContainer.width(10000);
      setTimeout(function(){
        table.width(table.width());
        scrollbarXContainer.hide();
        var containerWidth = parent.width() - style['scrollbar-y-width']; 
        if(table.width() < containerWidth){
          table.width(containerWidth);
        }
        table.css({opacity:1});
        scrollbarXContainer.css({
           width: containerWidth
        }).show();

        container.width('auto');
        setTimeout(function(){ scrollbarXContainer.scrollLeft(scrollLeft) }, 0)
      }, 0)
    },
    _create: function() {
      var onBeforeStart = this.options.onBeforeStart;
      this.complyOlderVersions(this.options);
      $.ui.ggrid.instances.push(this.element);
      
      onBeforeStart();
    },
    _init: function(){
      this.options.container = typeof this.options.container == 'undefined' ? this.element : this.options.container;
      this.options.dataSourceBackup = $.extend(true, [], this.options.dataSource);
      
      
      var onStart = this.options.onStart;
      this._initFields();
      onStart();
      this._renderTableHeaders();
      this._renderTableBody();
      this._renderTableFooters();
      this._autoResize();
      this._installFieldEnhancement();
      this._onComplete();
      
      this._installColumnManager();
    },
    _autoResize: function(){
      var resizable = this.options.resizable;
      if( resizable ){
        $(window).bind('resize', {_this:this}, this._resize).trigger('resize');
      }else{
        this._resize.call(this, {data:{_this:this}});
      }
    },
    destroy: function(){
      var element = this.element, position = $.inArray(element, $.ui.ggrid.instances);
      
      if(position > -1){
        $.ui.ggrid.instances.splice(position, 1);
      }

      $.Widget.prototype.destroy.call( this );
    },
    _setOption: function( key, value ) {
      this.options[key] = value;
      
      switch( key ) {
        case "":
          break;
      }
 
      $.Widget.prototype._setOption.apply( this, arguments );
    }
  })

  $.extend($.ui.ggrid, {
    instances: []
  });
})(jQuery);