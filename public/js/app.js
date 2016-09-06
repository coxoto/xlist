var app = function(){
    var pub = {};

    var db_tasks;
    var db_done_tasks;
    
    //从数据库以json形式读出数据
    var ajax_read_db =  function(callback){
        $.ajax({
            type: "get",
            url:"php_api/index.php?m=get",
            success:function(res){
                var json = JSON.parse(res);
                if(json){
                    callback(json);
                }else{
                    alert("db error!");
                }
            }
        })
        //{"tasks":[{"id":1,"name":"开发MC demo版本","load":8,"priority":0,"deadline":1472616000000},{"id":2,"name":"开发xxoo","load":1,"priority":0,"deadline":1475294400000},{"id":3,"name":"黄涛项目准备","load":1,"priority":2,"deadline":1472529600000}],"done_tasks":[]}
        //console.log(str);
    }

    //以json形式存入数据库
    var ajax_save_db =  function(){
        data = JSON.stringify({tasks:db_tasks().get()});
        //data = '{"tasks":[{"id":1,"name":"开发MC demo版本","load":8,"priority":0,"deadline":1472616000000},{"id":2,"name":"开发xxoo","load":1,"priority":0,"deadline":1475294400000},{"id":3,"name":"黄涛项目准备","load":1,"priority":2,"deadline":1472529600000}],"done_tasks":[]}';
        $.ajax({
            type: "post",
            url:"php_api/index.php?m=post",
            data: data,
            success:function(res){
                console.log(data);
            }
        })
    };


    pub['init'] = function(data,callback){
        //local-config
        if(location.host == "e.tt"){
            console.log("local config:");
            $("#favicon").attr("href","favicon_yellow.ico")
        }
        bindings();
        key_bindings();
        db_read(function(){
            db_make_score();
            db_make_old();
            render();
            callback && callback();
        });
    }

    var db_save = function(){
    }

    var db_read = function(callback){
        ajax_read_db(
            function(data){
                db_tasks = TAFFY(data.tasks);
                callback && callback();
            }
        );
    }
    
    var db_make_old = function(){
        db_tasks().each(function(r){
            r.new = 0;
        });
    }

    var db_make_score = function(){
        var nowstamp = Date.parse(new Date());
        db_tasks().each(function(r){
            r.remain_day = Math.round((r.deadline - nowstamp)/(3600*24*1000))
            deadline_score = (30 - r.remain_day)>0?(30 - r.remain_day):0;
            r.score = r.priority * 2 + deadline_score + r.load;
        });
    }

    var render = function(){
        db_tasks.sort("new desc,score desc");
        var arrText = doT.template($("#tasks-tmpl").text());
        $("#div_tasks").html(arrText({"tasks":db_tasks().get()}));
    }

    // ------- bind --------

    var bindings = function(){ 
        var new_task_input     = $("#js_new_task_input");     
        //var new_task_more_info = $("#js_new_task_more_info");     
        new_task_input.on("focus",function(){
            //new_task_more_info.slideDown(200);
        });
        new_task_input.bind("focusout",function(){
            //new_task_more_info.slideUp(200);
        });

        document.onkeydown = function(){
            //esc 按下的时候处理 
            if(event.keyCode==27){
                //console.log("esc");
                new_task_input.blur();
            }
        };

        new_task_input.bind("keypress",function(){
            //在new task input按下回车时的处理
            if(event.keyCode==13){
                var content = new_task_input.val();
                if(content){
                    var name = content;
                    db_tasks.insert({"id":_.now(),"name":name,"load":1,"priority":0,"deadline":_.now()+3600*1000*8,"new":1});
                    db_make_score();
                    render();
                    ajax_save_db();
                    new_task_input.blur();
                    new_task_input.val("");
                    new_task_input.focus();
                }
            }
        });

        $("#div_tasks").on("click","div",function(){
            $(this).find("span").hide();
            //$(this).find("input").show();
            //$(this).find("input").focus();
            var input = $(this).find("input");
            input.show()
            var t = input.val();
            input.val("").focus().val(t);
        })

        $("#div_tasks").bind("focus","div",function(){
            alert(1);
        })

        $("#div_tasks").bind("focusout","div",function(){
            $(this).find("input[type!='checkbox']").hide();
            $(this).find("span").show();
        })

    }

    var key_bindings = function(){
    }

    return pub;
}();
