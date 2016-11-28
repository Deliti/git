#下拉字典组件开发
前两天分派给我一个任务，做一个字典下拉组件。功能呢，是点击input框，弹出一个div，div中有条件input，下面是查询的table，实现数据特别多的时候的分页查询。只点查询的input，table出现没有条件查询的数据，在输入条件input，点击查询按钮，出现条件查询的结果。<br>
业务逻辑实现并不困难，主要就是传入条件，根据条件生成条件div，ajax查询，根据返回的数据生成table。本文主要就是2个目的，一个是回顾总结这个组件的开发，还有一个这个组件主要是数据的处理，很适合用`Vue`开发，这篇主要是回顾总结，下一篇是我尝试用`Vue`开发。废话不说，拿起键盘就是干。
[完整代码](https://github)

------

##实现思路
* [需求分析](#step1)
我们希望达到这样一个效果，`$(input).dropList({条件对象})`，这样就可以了。
    + 一个jq对象，有个dropList方法，传入一个参数为Object
    + 对params进行处理，生成条件
    + 给jq对象绑定一个点击事件，进行ajax查询，对返回的数据处理，生成DOM节点
    + table每一行最后都有个选择button，点击整个插件生成的div消失，所选择的数据填充到最开始的input中
* [组件脚手架](#step2)
```
    ;(function($){
        $.fn.dropList = function(params){
            //doing something
        }
    })(jQuery)
```
用个闭包防止变量污染，传入jQuery，`$.fn.dropList === jQuery.prototype.dropList`,那这样就很好理解了,传入params，这个方法也就暴露出来了，引用到页面中，在下面就直接调用，`$(input).dropList(obj)`。
处理数据，查询数据，生成页面这些都可以看做为一个一个方法，全部在这个dropList中。我们可以选择直接写function，全部写在doing something中，也可以选择新建一个构造函数，这些全部作为prototype。我个人很喜欢第二种方式，因为这样资源共享，扩展性更高。
```
    function DropList(data,target){
        this.data = data;
        this._target = $(target);
        this.init();
    }
    
    DropList.prototype = {
        init:function(){
            //初始化
        },
        //other function
    }
    
    $.fn.dropList = function(params){
        return new DropList(data,this); //①
    }
    
```
这样脚手架就搭完了，现在还有个问题，我想使用`$`对象，所以需要把这个传入，所以①传入this，this就是我们第一次操作的这个节点对象。

##逻辑实现
* [初始化页面](#step3)
我们给DropList添加basePage这个方法，此方法是页面初始化的时候生成的div和条件input。
```
    init:function(){
        this.basePage();
    },
    basePage:function(){
        var _self_ = this;
        var wrap = this._wrap = $('<div></div>').addClass('wrap');
        var condition = this._condition = $('<div></div>').addClass('condition');
        var tableDiv = this._tableDiv = $('<div></div>');
        //...根据this.data的字段生成一个个input插入condition中,tableDiv和condition也插入到wrap中
        $.each(this.data.condition,function(){
            _self_[this.name] = this.name;
        })
        wrap.appendTo(this._target.parent());
    }
```
* [返回数据生成页面](#step4)
```
    showPage:function(data){
        //根据返回的字段生成table
        var _self_ = this;
        $.each(data,function(){
            var button = $('<button>选择</button>');
            button.appendTo(tr)
                  .on('click',function(){
                        //将数据传出
                        _self_.reset(); //页面消失重置
                    })
        })
    },
    reset:function(){
        var _self_ = this;
        this._tableDiv.html('');
        this._wrap.hide();
        $.each(this.data.condition,function(){
            _self_[this.name].val('');
        })
    }
```
* [页面查询](#step5)
我们要给target，条件button绑定查询事件，查询事件的回调函数就是showPage，这样整个流程就跑通了。
```
    search:function(){
        var _self_ = this;
        var par = this.data.par;
        $.each(this.data.condition,function(){
            par[this.name] = _self_[this.name].val();
        })
        $.ajax(url,par,function(data){
            _self_.showPage(data);
        })
    },
    init:function(){
        //忽略的代码
        var _self_ = this;
        this._target.on('click',function(){
            _self_.search.call(_self_); //这里需要改变this的作用域
        })
    }
```
##总结反思
其实在写这个组件，有几点是我印象特别深刻的。
1. this的作用域经常改变，一开始使用function会使得有些东西获取不到，比如target这个this，所以我采取的是用继承，传个参数，bind改变作用域，这样就都能使用
2. 在basePage中我生成的input都保存到根目录中，这样一一对应，将这个保存下来以后调用就不需要再次find，这让我联想到了Vue，缓存节点生成数据，所以就有了将此组件改变成Vue组件的想法，毕竟省略的大部分代码都是生成页面的代码，很冗长不易维护

----------------------我是一条分割线--------------------------------