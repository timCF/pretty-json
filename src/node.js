/**
* @class PrettyJSON.view.Node
* @extends Backbone.View
* 
* @author #rbarriga
* @version 0.1
*
*/

PrettyJSON.view.Node = Backbone.View.extend({
    tagName:'span',
    data:null,
    level:1,
    path:'',
    type:'',
    size:0,
    isLast:true,
    rendered:false,
    initialize:function(opt) {

        this.options = opt;
        this.data = this.options.data;
        this.level = this.options.level || this.level;
        this.path = this.options.path;
        this.isLast = _.isUndefined(this.options.isLast) ?
          this.isLast : this.options.isLast;
        this.dateFormat = this.options.dateFormat;

        var m = this.getMeta();
        this.type = m.type;
        this.size = m.size;

        //new instance.
        this.childs = [];
        this.render();
        this.show();

    },
    getMeta: function(){
        var val = {
            size: _.size(this.data),
            type: _.isArray(this.data) ? 'array' : 'object'
        };
        return val;
    },
    elements:function(){
        this.els = {
            container:$(this.el).find('.node-container'),
            contentWrapper: $(this.el).find('.node-content-wrapper'),
            top:$(this.el).find('.node-top'),
            ul: $(this.el).find('.node-body'),
            down:$(this.el).find('.node-down')
        };
    },
    render:function(){
        this.tpl = _.template(PrettyJSON.tpl.Node);
        $(this.el).html(this.tpl);
        this.elements();

        var b = this.getBrackets();
        this.els.top.html(b.top);
        this.els.down.html(b.bottom);

        return this;
    },
    renderChilds:function(){
        var count = 1;
        _.each(this.data, function(val, key){

            var isLast = (count == this.size);
            count = count + 1;

            var path = (this.type == 'array') ?
            this.path + '[' + key + ']' :
            this.path + '.' + key;

            var opt = {
                key: key,
                data: val,
                parent: this,
                path: path,
                level: this.level + 1,
                dateFormat: this.dateFormat,
                isLast: isLast
            };

            var child = (PrettyJSON.util.isObject(val) || _.isArray(val) ) ?
              new PrettyJSON.view.Node(opt) :
              new PrettyJSON.view.Leaf(opt);

            //body ul
            var li = $('<li/>');
            var quotation = '"'
            var colom = '&nbsp;:&nbsp;';
            var left = $('<span />');
            var right =  $('<span />').append(child.el);
            (this.type == 'array') ? left.html('') : left.html(quotation + key + quotation + colom);

            left.append(right);
            li.append(left);

            this.els.ul.append(li);

            //references.
            child.parent = this;
            this.childs.push(child);

        }, this);
        // eof iteration
    },
    show: function(){

        //lazy render ..
        if(!this.rendered){
            this.renderChilds();
            this.rendered = true;
        }

        this.els.top.html(this.getBrackets().top);
        this.els.contentWrapper.show();
        this.els.down.show();
    },
    getBrackets:function(){
        var v = {
            top:'{',
            bottom:'}'
        };
        if(this.type == 'array'){
            v = {
                top:'[',
                bottom:']'
            };
        }

        v.bottom = (this.isLast) ? v.bottom : v.bottom + ',';

        return v;
    },
    expandAll:function (){
        _.each(this.childs, function(child){
            if(child instanceof PrettyJSON.view.Node){
                child.show();
                child.expandAll();
            }
        },this);
        this.show();
    }
});
