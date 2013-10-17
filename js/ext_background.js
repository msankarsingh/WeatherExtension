$(document).ready(function ($) {

    //Get Current Condition
    getCurrentCondition();
    setInterval(function () {
        getCurrentCondition();
    }, 3600000);
});

//Get Current Condition
function getCurrentCondition() {

    //Check Location Cookie
    if ($.cookie('wext_city_info') == undefined) {
        return;
    }

    //If Location Cookie Found, Check for atleast one location
    if ($.cookie('wext_city_info') != undefined) {
        var wextLocArray = new Array();
        wextLocArray = JSON.parse($.cookie('wext_city_info'));
        if (wextLocArray.length <= 0) {
            return;
        }
    }

    //Store Again In Cookie
    $.cookie('wext_city_info', JSON.stringify(wextLocArray), { expires: 365, path: '/' });

    //First Loc
    wextCityInfo = wextLocArray[0];

    //Check unit type stored in cookie
    var is_metrics = 0;
    if ($.cookie('wext_is_metrics') != undefined) {
        is_metrics = parseInt($.cookie('wext_is_metrics'));
    }
    $.cookie('wext_is_metrics', is_metrics, { expires: 365, path: '/' });

    //Get Current Condition
    var current_weather_url = "http://api.openweathermap.org/data/2.5/weather?id=" + wextCityInfo["id"] + "&units=imperial&APPID=cafbb1492a57d00ca4e67dd502f780fd&mode=json";
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
            chrome.browserAction.setBadgeBackgroundColor({ color: "#000000" })
            chrome.browserAction.setTitle({ title: wextCityInfo["Name"] })

            //Get Forecat Data
            getForecastData(wextCityInfo["id"]);
        }
    }
    xhr.send();
}

//Get Forecast Data
function getForecastData(cityId) {
    var forecast_weather_url = "http://api.openweathermap.org/data/2.5/forecast/daily?mode=json&APPID=cafbb1492a57d00ca4e67dd502f780fd&units=imperial&cnt=7&id=" + cityId;
    var xhr = typeof XMLHttpRequest != 'undefined' ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    xhr.open("GET", forecast_weather_url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var resp = JSON.parse(xhr.responseText);
            $.cookie('wext_forecast_weather', xhr.responseText, { expires: 365 });
        }
    }
    xhr.send();
}
