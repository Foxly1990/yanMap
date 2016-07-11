/*
 *  
 * Title: yanMap v0.2
 * Description: addon Yandex MAPS
 * jQuery, Yandex API 2.1 
 *  
 *  Author: Berebnev Ruslan
 *  Licensed under GNU GENERAL PUBLIC LICENSE
 *
 */

if (typeof Object.create !== "function") {
    Object.create = function (obj) {
        function F() {}
        F.prototype = obj;
        return new F();
    };
}

(function($) {
    var yandexMap = {
        // Инициализация
        init: function (settings, el) {
            var self = this;
            self.$elem = $(el); // jQuery(el)
            self.id = $(el).attr('id'); // id для yndex API
            self.settings = $.extend({}, $.fn.yanMap.settings, settings); // соединяем объекты
            // Ставим центр карты по-умолчанию, а также создаём объект для обращения
            self.mainMyMap = new ymaps.Map(self.id, self.settings.startGeoPoint);
            self.myMap(); // рисуем нашу карту
        },

        // Вызов всех функций, которые отвечают за отрисовку карты
        // Ниже идут те самые самый функции, которые мы вызываем
        myMap: function () {
            var self = this;
            self.myZoom();
            self.myPlacemarks();
            self.myFillSelect();
            self.myGeocoder();
            
            // Тестовые функции
            self.myTest();
        },

        /* Здесь располагаются дополнительные свойства */
        
        // Создаём новый массив с уникальными значениями
        myUniqueArr: function (array, condition) {
            var self = this,
                result = [];

            switch (condition) {
            case true:
                nextInput:
                for (var i = 0; i < array.length; i++) {
                    var str = array[i]; 
                    for (var j = 0; j < result.length; j++) { 
                        if (result[j] == str) continue nextInput;
                    }
                    result.push(str);
                }
                break;
            default:
                result = array;
                break;
            }
                        
            return result;
        },

        // Сортирую массив по алфавиту
        mySortByAlphabet: function (array, condition) {
            var self = this, arr;
                        
            switch (condition) {
            case true:
                arr = array.slice().sort();
                break;
            default:
                arr = array;
                break;
            }
            
            return arr;
        },

        myFindIndexOf: function (array, value) {
            if (array.indexOf) {
                return array.indexOf(value);
            }
            
            for (let i = 0; i < array.length; i++) {
                if (array[i] === value) return i;
            }
            
            return -1;
        },
        
        mySetFirstElem: function (array, element) {
            var self = this,
                opt = self.settings,
                result,
                index = self.myFindIndexOf(array, element);

            if (element === undefined) return array;
            
            switch (opt.fill.move) {
            case true:
                array.splice(index, 1);
                array.unshift(element);
                result = array;
                break;
            default:
                result = array;
                break;
            }
            
            return result;
        },
        
        myTest: function () {
            var self = this,
                opt = self.settings,
                arr = [];
        },
        
        /* END Здесь располагаются дополнительные свойства END */
        
        // Заполняем тег содержимым
        // заполяется либо уникальными значениями либо с повторением
        myFillSelect: function () {
            var self = this,
                unique = self.myUniqueArr,
                isUnique,
                isSortByAlph,
                arr,
                toFirst,
                procArr; 
            
            if (!self.settings.hasOwnProperty('fill')) return;
            arr = self.settings.fill.items;
            toFirst = self.settings.fill.setFirstElem;
            isUnique = self.settings.fill.unique;
            isSortByAlph = self.settings.fill.sort;
            
            procArr = self.myUniqueArr(arr, isUnique);
            procArr = self.mySortByAlphabet(procArr, isSortByAlph);
            procArr = self.mySetFirstElem(procArr, toFirst);
            
            [].forEach.call(procArr, function (element) {
                $(self.settings.fill.element).append(element);
            });
        },
        
        // Возвращаем настроенную иконку...
        myPlacemarkIcon: function () {
            return this.settings.icon;
        },
        
        myMainPlacemarkIcon: function () {
            return this.settings.mainIcon;
        },
        
        // Заполняем балун и устанавливаем иконку
        myPlacemarkDesc: function () {
            var self = this, icon;
                
            
            return function (element, index) {
                for (let prop in element) {
                    if (Array.isArray(element[prop])) {
                        var coords = element[prop];
                    } else {
                        var fill = {
                            balloonContentHeader: element.header,
                            balloonContentBody: element.body,
                            balloonContentFooter: element.footer,
                            hintContent: element.hint
                        };
                    }

                    if (element.center === "1") {
                        icon = self.myMainPlacemarkIcon();
                    } else {
                        icon = self.myPlacemarkIcon();
                    }
                    
                    var marks = new ymaps.Placemark(coords, fill, icon);
                    self.mainMyMap.geoObjects.add(marks);
                }
            };            
        },

        // Рисуем множество меток
        myPlacemarks: function () {
            var self = this,
                arr = self.settings.placeMarks;

            [].forEach.call(arr, self.myPlacemarkDesc());
        },

        // Работа со скроллом и зумом
        myZoom: function () {
            var self = this,
                opt = self.settings;
            
            switch (opt.scrollZoom) {
            case false:
                return self.mainMyMap.behaviors.disable('scrollZoom');
                break;
            default:
                return self.mainMyMap.behaviors.enable('scrollZoom');
                break;
            }
        },
                
        // По событию берём значение <option> (город, улица)
        // и совершаем переход к точке
        myGeocoder: function () {
            var self = this;
            $(self.settings.select).on("change", function () {
                var elemVal = $(this).val(),
                    geo = ymaps.geocode(elemVal);

                geo.then(function (res) {
                    // Берём координаты
                    var coords, zoom;
                    
                    if (elemVal !== "start") {
                        coords = res.geoObjects.get(0).geometry.getCoordinates();
                        zoom = 10;
                    } else {
                        coords = self.settings.startGeoPoint.center;
                        zoom = self.settings.startGeoPoint.zoom;
                    }
                                        
                    self.mainMyMap.setCenter(coords, zoom, {
                        duration: 2000
                    });
                }); 
            });
        }
        
    };
    
    $.fn.yanMap = function (settings) {
        return this.each(function () {
            var customYanMap = Object.create(yandexMap);
            customYanMap.init(settings, this);
        });
    };
    
    // Значения по-умолчанию
    $.fn.yanMap.settings = {
        // Стартовые координаты центра:
        startGeoPoint: {
            center: [54.865232, 37.207378], // [широта(x), долгота(y)] 
            zoom: 8 // zoom: зум(z)
        }, 
        
        scrollZoom: true, // zoom по скроллу [true, false]
        
        // Далее идут метки по-умолчанию...
        placeMarks: [{ // 0
            coords: [54.865232, 37.207378], // [широта(x), долгота(y)]
            header: "Протвино",
            body: "г. Протвино, ул. Победы д 2<br />",
            footer: "Наш телефон: <a href='tel:+74993904417'>+7 (499) 390-4417</a><br />" +
                "Наша страничка: <a href='http://upmix.ru/'>http://upmix.ru/</a>",
            hint: "Компания по разработке веб-приложений"
        }, {
            coords: [54.706446, 20.512042],
            header: "Калининград",
            body: "г. Калининград, ул. Канта д 1<br />",
            footer: "Кафедральный собор, где похоронен Иммануил Кант",
            hint: "Здесь был я!"
        }]        
        // END .settings
    };
}(jQuery));
