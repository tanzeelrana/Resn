/**
 * Created by kev on 2016-05-09.
 */
define(['backbone',
        'howler',
        'config'],

    function (Backbone,
        Howler,
        Config) {

        return Backbone.View.extend({

         
            currentIndex:0,
          
            timeOut     :null,
            src         :"",

            initialize:function (options) {
           
                this.src = options.src;
                this.interval = options.interval || 16000;

                //load first
               var self = this;
           
            },

            show:function () {
                //start timer
                var self = this;
                this.timeOut = setInterval(function(){
                        self.onTimeOut();
                },this.interval);

              
            },

         
         

            hide:function () {

                if (this.timeOut) {
                    clearTimeout(this.timeOut);
                }

             

            }

        });
    });