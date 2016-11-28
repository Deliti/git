;(function($){
	function DownList(par,target){
		this._target = $(target);
		this.optData = par.dataFn.params;  //选参
		this.url = par.dataFn.url;  
		this.dataListPath = par.dataFn.dataListPath;
		this.colName = par.tableAttr.colNames;  //列表名
		this.colModle = par.tableAttr.colModle;  //列表key
		this.condition = par.condition;
		this.callBackFn = par.callBackFn;
		this.paginationParam={"selectId":"selectId_"+Math.random(),"divPageId_":"divPageId"+Math.random(),"spanPagesId":"spanPagesId_"+Math.random()};
		this.HTML = {
			th:$('<th></th>')
		};
		this.init();
	}
	
	
	DownList.prototype = {
		init:function(){//生成html初始化
			var _self_ = this;
			this.basePage();
			this._target.on('click',function(){
				_self_.search.call(_self_,0);
			});
		},
		basePage:function(){  //基础页面
			var HTML = this.HTML;
			var _self_ = this;
			this._target.parent().css({'position':'relative'});
			var contentDiv = this.content=$('<div class="downListContentDiv" ></div>');  //最外面的
			var conditionDiv = $('<div class="conditionDiv"></div>');  //条件的
			var tableDiv= this._table = $('<div class="table-responsive"> </div>');  //表格
		    var paginationDiv = this._pageination=$('<div><select id="'+this.paginationParam.selectId+'"  class="right mr hide"></select><div id="'+this.paginationParam.divPageId+'" name="page" ></div><span class="right mr pt3" id="'+this.paginationParam.spanPagesId+'"></span></div>')	
		
			$.each(this.condition, function() {
				var cond = $('<span class="left">'+this.label+'</span><input type="text" class="left" name="'+this.name+'"/>');
				cond.appendTo(conditionDiv);
				_self_[this.name] = cond.parent().find('input[name="'+this.name+'"]');  //将这个condition的$input存到根属性
				
			});
			var search = $('<span class="left btn-primary hand">查询</span>');
			var clear = $('<span class="left btn-primary hand">清除</span>');
			search.appendTo(conditionDiv)
				  .on('click',function(){
					  _self_.search(0);
				  });
			clear.appendTo(conditionDiv)
			  .on('click',function(){
				  _self_._target.val("");
				  _self_.resets();
			  });
			conditionDiv.appendTo(contentDiv); //条件
			tableDiv.appendTo(contentDiv);    //结果集
			paginationDiv.appendTo(contentDiv); // 分页
			contentDiv.appendTo(this._target.parent());
			this._target.on('click',function(){
				contentDiv.fadeToggle();
			})
			HTML.title = $('<thead><tr></tr></thead>');
			$.each(this.colName, function() {  
				var th = $('<th class="p10">'+this+'</th>');
				th.appendTo(HTML.title);
			});
			HTML.th.appendTo(HTML.title);
		},
		showPage:function(data){  //生成页面
			var _self_ = this;
			this._table.html('');
			var HTML = this.HTML;
			HTML.table = $('<table class="table table-bordered table-hover table-condensed table-align-center"></table>');
			HTML.table.append(HTML.title);
			
			var dataList = haha.getJsonValueByPath(data,_self_.dataListPath);
			$.each(dataList, function() {  
				var tr = $('<tr></tr>');
				$.each(this, function() {
					var td = $('<td>'+this+'</td>');
					td.appendTo(tr);
				});
				
				var _self = this;
				var choose = $('<td>选择</td>'); //选择
				choose.appendTo(tr)
						.on('click',function(){  //点击回调
							//console.log(_self);
							_self_.callBackFn(_self)
							
							_self_.resets();
						});
				tr.appendTo(HTML.table);
			});
			HTML.table.appendTo(this._table);
			this.content.show();
			haha.initBootstrapPaginator(_self_.paginationParam.divPageId,_self_.paginationParam.selectId,_self_.paginationParam.spanPagesId,_self_.search.bind(_self_),data);
		},
		search:function(pageNo){ //查询数据
			var _self_ = this;
			$.extend(defaultData,{"pageNo":pageNo});
			var par = $.extend({},defaultData,this.optData);
			$.each(this.condition, function() {
				par[this.name] = _self_[this.name].val();
			});
			haha.ajax(this.url,par,function(data){  //查询数据列表
				_self_.showPage(data);
			});
		},
		resets:function(){
			var _self_ = this;
			$.each(this.condition, function() {
				_self_[this.name].val('')
			});
			this._table.html('');
			this.content.hide();
		}
	}
	
	$.fn.downLists = function(data){
		return new DownList(data,this);
	}
	
	var defaultData = {
		"pageNo": 0,
		"onePageNum":5
	}
})(jQuery)


