var wext_month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var wext_weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
var wxtLocationNotFount = 1;
$(document).ready(function ($) {

    $("#wext_location_finder").hide();
    $("#wext_main_div").hide();
    $("#wext_location_setting_div").hide();
    $("#chart_container_table").hide();

    //Check Location Cookie    
    if ($.cookie('wext_city_info') == undefined) {
        wxtLocationNotFount = 0;
    }

    //If Location Cookie Found, Check for atleast one location
    if ($.cookie('wext_city_info') != undefined) {
        var wextLocArray = new Array();
        wextLocArray = JSON.parse($.cookie('wext_city_info'));
        if (wextLocArray.length <= 0) {
            wxtLocationNotFount = 0;
        }
    }

    $("#wxt_location_search_btn").off("click");
    $("#wxt_location_search_btn").on("click", function (e) {
        var locval = $.trim($("#wxt_location_search").val());
        if (locval == "") {http://openweathermap.org/login
            $("#wxt_location_search").css("border", "1px solid red");
        } else {
            $("#wxt_location_search").css("border", "1px solid #000000");
            wextSearchLocation();
        }
    });

    $("#wxt_location_search").off("keypress");
    $("#wxt_location_search").on("keypress", function (e) {
        $("#wxt_location_search").css("border", "1px solid #000000");
        if (e.which == 13) {
            var locval = $.trim($("#wxt_location_search").val());
            if (locval == "") {
                $("#wxt_location_search").css("border", "1px solid red");
            } else {
                $("#wxt_location_search").css("border", "1px solid #000000");
                wextSearchLocation();
            }
        }
    });

    $("#wxt_location_search").off("focus");
    $("#wxt_location_search").on("focus", function (e) {
        $("#wxt_location_search").css("border", "1px solid #000000");
    });

    $("#wxt_cel").off("click");
    $("#wxt_cel").on("click", function (e) {
        $.cookie('wext_is_metrics', 1, { expires: 365, path: '/' });
        if (wxtLocationNotFount == 1) {
            wextPopulateCurrentCondition();
            wextPopulateTodayCondition();
            wextPopulateRecentLocationList();
            wextDrawGraph();
            $("#wext_location_finder").hide();
            $("#wext_main_div").show();
            $("#wext_location_setting_div").hide();
        }
    });

    $("#wxt_f").off("click");
    $("#wxt_f").on("click", function (e) {
        $.cookie('wext_is_metrics', 0, { expires: 365, path: '/' });
        if (wxtLocationNotFount == 1) {
            wextPopulateCurrentCondition();
            wextPopulateTodayCondition();
            wextPopulateRecentLocationList();
            wextDrawGraph();
            $("#wext_location_finder").hide();
            $("#wext_main_div").show();
            $("#wext_location_setting_div").hide();
        }
    });

    $("#wxt_graph_on").off("click");
    $("#wxt_graph_on").on("click", function (e) {
        $.cookie('wext_is_graph_on', 1, { expires: 365, path: '/' });
        if (wxtLocationNotFount == 1) {            
            $("#wext_location_finder").hide();
            $("#wext_main_div").show();
            $("#wext_location_setting_div").hide();
            wextDrawGraph();
        }
    });

    $("#wxt_graph_off").off("click");
    $("#wxt_graph_off").on("click", function (e) {
        $.cookie('wext_is_graph_on', 0, { expires: 365, path: '/' });
        if (wxtLocationNotFount == 1) {            
            $("#wext_location_finder").hide();
            $("#wext_main_div").show();
            $("#wext_location_setting_div").hide();
            wextDrawGraph();
        }
    });

    $("#wext_setting_icon").off("click");
    $("#wext_setting_icon").on("click", function (e) {
        $("#wext_location_finder").hide();
        $("#wext_main_div").hide();
        $("#wext_location_setting_div").show();
    });

    $("#wext_close_setting").off("click");
    $("#wext_close_setting").on("click", function (e) {
        if (wxtLocationNotFount == 1) {
            $("#wext_location_finder").hide();
            $("#wext_main_div").show();
            $("#wext_location_setting_div").hide();
        } else {
            $("#wext_location_finder").show();
            $("#wext_main_div").hide();
            $("#wext_location_setting_div").hide();
        }
    });

    //Temp Unit
    var is_metrics = 0;
    if ($.cookie('wext_is_metrics') != undefined) {
        is_metrics = parseInt($.cookie('wext_is_metrics'));        
    }

    //Init Temp Setup
    if (is_metrics == 1) {
        $("#wxt_cel").attr('checked', 'checked');
    } else {
        $("#wxt_f").attr('checked', 'checked');
    }

    //Is Graph On
    var is_graph_on = 0;
    if ($.cookie('wext_is_graph_on') != undefined) {
        is_graph_on = parseInt($.cookie('wext_is_graph_on'));
    }

    if (is_graph_on == 1) {
        $("#wxt_graph_on").attr('checked', 'checked');
    } else {
        $("#wxt_graph_off").attr('checked', 'checked');
    }

    //If Location Not Found
    if (wxtLocationNotFount == 0) {
        $("#wext_location_finder").show();
        $("#wext_main_div").hide();
        $("#wext_location_setting_div").hide();

        $("#wext_setting_span").off("click");
        $("#wext_setting_span").on("click", function (e) {
            $("#wext_location_finder").hide();
            $("#wext_main_div").hide();
            $("#wext_location_setting_div").show();
        });

        $("#wext_user_current_loc").off("click");
        $("#wext_user_current_loc").on("click", function (e) {
            if (geoPosition.init()) {
                geoPosition.getCurrentPosition(wextShowPosition, geoError);
            }
        });
        return;
    }

    wextPopulateLocInfo();
    wextPopulateCurrentCondition();
    wextPopulateTodayCondition();
    wextPopulateRecentLocationList();
    wextDrawGraph();
    $("#wext_main_div").show();
    $("#wext_close_setting").focus();
});

function geoError() {
    alert("Could not find you!");
}

function wextShowPosition(position) {
    $("#wext_main_body").block({
        message: '<span style="font-size:20px;font-family: lucida grande,tahoma,verdana,arial,sans-serif;">Please Wait...</span></h1>',
    });

    //Check unit type stored in cookie
    var is_metrics = 0;
    if ($.cookie('wext_is_metrics') != undefined) {
        is_metrics = parseInt($.cookie('wext_is_metrics'));
    }
    $.cookie('wext_is_metrics', is_metrics, { expires: 365, path: '/' });

    //Get Current Condition
    var current_weather_url = "http://api.openweathermap.org/data/2.5/weather?lat=" + position.coords.latitude + "&lon=" + position.coords.longitude + "&units=imperial&APPID=cafbb1492a57d00ca4e67dd502f780fd&mode=json";
    var xhr = typeof XMLHttpRequest != 'undefined' ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    xhr.open("GET", current_weather_url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            //Get Response
            var resp = JSON.parse(xhr.responseText);
            getNewWextDetails(resp.id, resp.name + "," + resp.sys.country);
        }
    }
    xhr.send();
}

function wextPopulateRecentLocationList() {
    if ($.cookie('wext_city_info') == undefined) {
        return;
    }
    $("#wext_recent_location_div").html("");
    var wxt_loc_arr = JSON.parse($.cookie('wext_city_info'))
    $.each(wxt_loc_arr, function (index, item) {
        $('<p>', {
            text: item.Name,
            id: 'wext_loc_rlp' + item.id,
            "data_city_id": item.id,
            "data_city_name": item.Name,
        }).appendTo("#wext_recent_location_div").off("click").on("click", function () {
            getNewWextDetails(item.id, item.Name);
        });
    });
}

function wextSearchLocation() {
    $("#wext_location_div").html("");
    $('<p>', {
        html: "<b>Searching location.Please wait...</b>",
    }).appendTo("#wext_location_div");
    var searchurl = "http://api.openweathermap.org/data/2.1/find/name?APPID=8fd4a36fef708d9028d84b150a600e49&type=like&sort=population&q=" + $.trim($("#wxt_location_search").val());
    var xhr = typeof XMLHttpRequest != 'undefined' ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    xhr.open("GET", searchurl, true);
    xhr.onreadystatechange = function () {
        $("#wext_location_div").html("");
        if (xhr.readyState == 4 && xhr.status == 200) {
            var resp = JSON.parse(xhr.responseText);
            if (resp != undefined && resp.list != undefined){
                $.each(resp.list, function (index, item) {
                    $('<p>', {
                        text: item.name + "," + item.sys.country,
                        id: 'wext_loc_p' + item.id,
                        "data_city_id": item.id,
                        "data_city_name": item.name + "," + item.sys.country
                    }).appendTo("#wext_location_div").off("click").on("click", function () {
                        getNewWextDetails(item.id, item.name + "," + item.sys.country);
                    });
                });
            } else {
                $("#wext_location_div").html("");
                $('<p>', {
                    html: "<b>Location not found.</b>",
                }).appendTo("#wext_location_div");
            }
            $("#wxt_location_search").val("");
        } else {
            $("#wext_location_div").html("");
            $('<p>', {
                html: "<b>Location not found.</b>",
            }).appendTo("#wext_location_div");
            $("#wxt_location_search").val("");
        }
    }
    xhr.send();
}

function getNewWextDetails(plocid, plocaName) {
    //New Location
    var new_wext_loc = {
        "id": plocid,
        "Name": plocaName
    };

    //Temp Loc Array
    var wxt_temp_loc_arr = new Array();
    wxt_temp_loc_arr.push(new_wext_loc);

    //Getting Available Location From Cookie
    if ($.cookie('wext_city_info') != undefined) {
        var wxt_loc_arr = JSON.parse($.cookie('wext_city_info'))
        $.each(wxt_loc_arr, function (index, item) {            
            if (index < 4) {
                if (item["id"] != plocid) {
                    wxt_temp_loc_arr.push(item);
                }
            }
        });
    }
    $.cookie('wext_city_info', JSON.stringify(wxt_temp_loc_arr), { expires: 365, path: '/' });
    $("#wext_location_div").html("");
    getCurrentCondition(plocid);
    chrome.browserAction.setBadgeBackgroundColor({ color: "#000000" });
    chrome.browserAction.setTitle({ title: new_wext_loc["Name"] });
    wxtLocationNotFount = 1;
}

//Get Current Condition
function getCurrentCondition(cityId) {

    $("#wext_main_body").block({
        message: '<span style="font-size:20px;font-family: lucida grande,tahoma,verdana,arial,sans-serif;">Please Wait...</span></h1>',
    });

    //Check unit type stored in cookie
    var is_metrics = 0;
    if ($.cookie('wext_is_metrics') != undefined) {
        is_metrics = parseInt($.cookie('wext_is_metrics'));
    }
    $.cookie('wext_is_metrics', is_metrics, { expires: 365, path: '/' });

    //Get Current Condition
    var current_weather_url = "http://api.openweathermap.org/data/2.5/weather?id=" + cityId + "&units=imperial&APPID=8fd4a36fef708d9028d84b150a600e49&mode=json";
    var xhr = typeof XMLHttpRequest != 'undefined' ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    xhr.open("GET", current_weather_url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            //Get Response
            var resp = JSON.parse(xhr.responseText);

            //Store Data In Cookie
            $.cookie('wext_current_weather', xhr.responseText, { expires: 365 });

            //Set Badge Text
            var badgetText;
            if (is_metrics == 1) {
                var cTempVal = Math.round((Math.round(resp.main.temp) - 32) * (5 / 9));
                badgetText = cTempVal + " C";
            } else {
                badgetText = Math.round(resp.main.temp) + " F";
            }

            //Set Extension Badge Text
            chrome.browserAction.setBadgeText({ text: badgetText });

            //Get Forecat Data
            getForecastData(cityId);
        }
    }
    xhr.send();
}

//Get Forecast Data
function getForecastData(cityId) {
    var forecast_weather_url = "http://api.openweathermap.org/data/2.5/forecast/daily?mode=json&APPID=8fd4a36fef708d9028d84b150a600e49&units=imperial&cnt=7&id=" + cityId;
    var xhr = typeof XMLHttpRequest != 'undefined' ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    xhr.open("GET", forecast_weather_url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var resp = JSON.parse(xhr.responseText);
            $.cookie('wext_forecast_weather', xhr.responseText, { expires: 365 });
            $("#wext_main_body").unblock(); 
            wextPopulateLocInfo();
            wextPopulateCurrentCondition();
            wextPopulateTodayCondition();
            wextPopulateRecentLocationList();
            wextDrawGraph();
            $("#wext_location_finder").hide();
            $("#wext_main_div").show();
            $("#wext_location_setting_div").hide();
        }
    }
    xhr.send();
}


function wextPopulateTodayCondition() {
    if ($.cookie('wext_forecast_weather') == undefined) {
        return;
    }

    //Metric Check
    var is_metrics = 0;
    if ($.cookie('wext_is_metrics') != undefined) {
        is_metrics = parseInt($.cookie('wext_is_metrics'));
    } else {
        is_metrics = 0;
    }

    var forecast_data = JSON.parse($.cookie('wext_forecast_weather'));
    for (var findx = 0; findx < forecast_data.list.length ; findx++) {
        var fd = forecast_data.list[findx];

        //Date
        $("#wext_today_title_" + findx).html("");
        var dte = new Date(fd.dt * 1000);
        var timestr = wext_month[dte.getMonth()] + " " + dte.getDate();
        var weekdaystr = wext_weekday[dte.getDay()];
        $("#wext_today_title_" + findx).html(weekdaystr + "<br/>" + timestr);

        //Icon
        fd.weather[0].icon = fd.weather[0].icon.replace(/d+/, "d");
        fd.weather[0].icon = fd.weather[0].icon.replace(/n+/, "n");
        $("#wext_today_icon_" + findx).html("");
        var weather_condition_img = $('<img>').attr('src', "image/weather_icon/" + fd.weather[0].icon + ".svg");
        weather_condition_img.appendTo("#wext_today_icon_" + findx);

        //Text
        $("#wext_today_text_" + findx).html("");
        $("#wext_today_text_" + findx).html("<br/>" + toTitleCase(fd.weather[0].description));

        //Temp 
        if (is_metrics == 1) {
            var cTempMaxVal = Math.round((Math.round(fd.temp.max) - 32) * (5 / 9));
            var cTempMinVal = Math.round((Math.round(fd.temp.min) - 32) * (5 / 9));
            $("#wext_today_temp_" + findx).html(cTempMaxVal + " &#176C<br/> " + cTempMinVal + " &#176C");
        } else {
            var fTempMaxVal = Math.round(fd.temp.max);
            var fTempMinVal = Math.round(fd.temp.min);
            $("#wext_today_temp_" + findx).html(fTempMaxVal + " &#176F<br/> " + fTempMinVal + " &#176F");
        }
    }
}

function wextPopulateCurrentCondition() {
    if ($.cookie('wext_current_weather') == undefined) {
        return;
    }

    //Current Condition Data
    var current_condition = JSON.parse($.cookie('wext_current_weather'));

    //Icon
    $("#wext_now_icon").html("");
    var current_condition_img = $('<img>').attr('src', "image/weather_icon/" + current_condition.weather[0].icon + ".svg");
    current_condition_img.appendTo("#wext_now_icon");

    //Text
    $("#wext_now_text").html("");
    $("#wext_now_text").html("<br/>" + toTitleCase(current_condition.weather[0].description));

    //Metric Check
    var is_metrics = 0;
    if ($.cookie('wext_is_metrics') != undefined) {
        is_metrics = parseInt($.cookie('wext_is_metrics'));
    } else {
        is_metrics = 0;
    }

    //Temp
    $("#wext_now_temp").html("");
    if (is_metrics == 1) {
        var cTempVal = Math.round((Math.round(current_condition.main.temp) - 32) * (5 / 9));
        $("#wext_now_temp").html(cTempVal + " &#176C");
        chrome.browserAction.setBadgeText({ text: cTempVal + " C" });
    } else {
        $("#wext_now_temp").html(Math.round(current_condition.main.temp) + " &#176F");
        chrome.browserAction.setBadgeText({ text: Math.round(current_condition.main.temp) + " F"});
    }
}

function wextPopulateLocInfo() {
    if ($.cookie('wext_city_info') == undefined) {
        return;
    }
    var wextLocArray = JSON.parse($.cookie('wext_city_info'));
    if (wextLocArray.length <= 0) {
        return;
    }
    $("#wext_loc_info_span").html(wextLocArray[0].Name);
}

function toTitleCase(str) {
    return str.replace(/(?:^|\s)\w/g, function (match) {
        return match.toUpperCase();
    });
}

function wextDrawGraph() {

    //Is Graph On
    var is_graph_on = 0;
    if ($.cookie('wext_is_graph_on') != undefined) {
        is_graph_on = parseInt($.cookie('wext_is_graph_on'));
    }
    if (is_graph_on == 0) {
        $("#chart_container_table").hide();
        $("#chart_container_table_td").html("");
        return;
    }

    //Check Cookie
    if ($.cookie('wext_forecast_weather') == undefined) {
        return;
    }

    //Chart Var
    var yAxis_title_text = "Temperature (°F)";
    var tooltip_valueSuffix = ' °F';
    var xAxis_categories = new Array();
    var series_high = new Array();
    var series_low = new Array();

    //Metric Check
    var is_metrics = 0;
    if ($.cookie('wext_is_metrics') != undefined) {
        is_metrics = parseInt($.cookie('wext_is_metrics'));
    } else {
        is_metrics = 0;
    }

    //Get Forecast Details
    var forecast_data = JSON.parse($.cookie('wext_forecast_weather'));
    for (var findx = 0; findx < forecast_data.list.length ; findx++) {
        var fd = forecast_data.list[findx];

        //Date        
        var dte = new Date(fd.dt * 1000);
        var timestr = wext_month[dte.getMonth()] + " " + dte.getDate();
        var weekdaystr = wext_weekday[dte.getDay()];
        xAxis_categories.push(weekdaystr + "<br/>" + timestr);

        //Temp 
        if (is_metrics == 1) {
            yAxis_title_text = "Temperature (°C)";
            tooltip_valueSuffix = ' °C';
            var cTempMaxVal = Math.round((Math.round(fd.temp.max) - 32) * (5 / 9));
            var cTempMinVal = Math.round((Math.round(fd.temp.min) - 32) * (5 / 9));
            series_high.push(cTempMaxVal);
            series_low.push(cTempMinVal);
        } else {
            var fTempMaxVal = Math.round(fd.temp.max);
            var fTempMinVal = Math.round(fd.temp.min);
            series_high.push(fTempMaxVal);
            series_low.push(fTempMinVal);
        }
    }

    $("#chart_container_table_td").html('<div id="chart_container" style="min-width: 310px; height: 250px; margin: 0 auto"></div>');
    $("#chart_container").highcharts({
        title: {
            text: ''     
        },
        xAxis: {
            categories: xAxis_categories
        },
        yAxis: {
            title: {
                text: yAxis_title_text
            },
            plotLines: [
                {
                    value: 0,
                    width: 1,
                    color: '#808080'
                }
            ]
        },
        plotOptions: {
            series: {
                animation: false
            }
        },
        tooltip: {
            crosshairs: true,
            shared: true,
            valueSuffix: tooltip_valueSuffix
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        series:
            [
                {
                    type: 'spline',
                    name: 'Hi',
                    data: series_high
                },
                {
                    type: 'spline',
                    name: 'Low',
                    data: series_low
                }
            ]
    });
    $("#chart_container_table").show();
}