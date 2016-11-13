define(function(require, exports, module){
    var tools = require("dtools");
    var Tmpl = require("template");

    var item = new Tmpl(require("text!./view/item.tmpl"));
    var itemDisable = new Tmpl(require("text!./view/item-disable.tmpl"));
    var itemActive = new Tmpl(require("text!./view/item-current.tmpl"));
    var pagerTmpl = new Tmpl(require("text!./view/pager.tmpl"));

    var Pager = function(options){
        this._initPager(options);
    };

    Pager.prototype = {
        _initPager: function(options){
            this.options = tools.mix({
                total: 0,
                perpage: 10,
                container: '',
                page: 1
            }, options);

            tools.EventEmitter.call(this);

            this.html = '';
            this.page = this.options.page;
            this.totalPage = Math.ceil(this.options.total / this.options.perpage);
            this.panel = tools.$c('div', null, 'pager');
            this._initUI();
            this._initEvents();
        },
        _initUI: function(){
            this.panel.appendChild(pagerTmpl.render({
                html: this.get()
            }, true));
            $(this.options.container).html(this.panel);
        },

        _initEvents: function(){
            var self = this;
            $(this.options.container).on('click', 'li', function(e){
                e.preventDefault();
                var page = $(this).attr('data-page');
                if(page !== undefined){
                    self.setPage(page);
                    self.emit('goto', {page: page});
                }
            });
        },

        buildItem: function(page){
            var html;
            if(page == this.page){
                html = itemActive.render({text: this.page});
            }else{
                if(page == -1){
                    html = itemDisable.render({text: '..', link: '#'});
                }else{
                    html = item.render({text: page, page: page, link: '#'});
                }
            }

            return html;
        },


        setPage: function(page){
            this.page = parseInt(page);
            $(this.panel).html(pagerTmpl.render({
                html: this.get()
            }, true));
        },

        setTotal: function(value){
            this.total = value;
            this.totalPage = Math.ceil(this.total / this.options.perpage);
            $(this.panel).html(pagerTmpl.render({
                html: this.get()
            }, true));
        },

        render: function(){
            var html = "";

            if(this.totalPage <= 1){
                this.html = html;
                return html;
            }


            if(this.page == 1){
                html += itemDisable.render({text: "上一页", classname: 'btn btn-prev'});
            }else{
                html += item.render({text: "上一页", page: this.page - 1, link: '#', classname: 'btn btn-prev'});
            }


            //中间部分
            if(this.totalPage <= 11){

                for(var i = 1; i <= this.totalPage; i++){
                    if(i == this.page){
                        html += itemActive.render({text: i});
                    }else{
                        html += item.render({page: i, text: i, link: '#'});
                    }
                }
            }else{


                var assist = this.page;

                if(this.page <  3){
                    assist = 3;
                }


                if(this.page > this.totalPage - 2){
                    assist = this.totalPage - 2;
                }

                var iterator = 0;

                var leftBegin = 1;
                var leftEnd = assist - 1;
                var rightBegin = assist + 1;
                var rightEnd = this.totalPage;
                var stacks = [
                    [], [], [], []
                ];

                do{
                    if(leftEnd > leftBegin){
                        stacks[0].push(this.buildItem(leftBegin));
                        stacks[1].unshift(this.buildItem(leftEnd));
                    }else if(leftBegin == leftEnd){
                        stacks[0].push(this.buildItem(leftBegin));
                    }

                    if(rightBegin == rightEnd){
                        stacks[2].push(this.buildItem(rightBegin));
                    }else if(rightEnd > rightBegin){
                        stacks[2].push(this.buildItem(rightBegin));
                        stacks[3].unshift(this.buildItem(rightEnd));
                    }


                    if (iterator == 1) {
                        if(Math.abs(leftBegin - leftEnd) > 1){
                            stacks[0].push(this.buildItem(-1))
                        }
                        if(Math.abs(rightBegin - rightEnd) > 1){
                            stacks[2].push(this.buildItem(-1))
                        }
                    }


                    leftBegin++;
                    leftEnd--;
                    rightBegin++;
                    rightEnd--;
                    iterator++;

                }while(iterator < 2)

                // console.log(stacks);

                var result = stacks[0].concat(stacks[1], this.buildItem(assist), stacks[2], stacks[3]);

                html += result.join('');

            }

            if(this.page == this.totalPage){
                html += itemDisable.render({text: "下一页", classname: 'btn btn-next'});
            }else{
                html += item.render({text: "下一页", page: this.page + 1, link: '#', classname: 'btn btn-next'});
            }

            this.html = html;

        },
        get: function(){
            this.render();
            return this.html;
        }
    };


    tools.extend(Pager, tools.EventEmitter);
    module.exports = Pager;
});