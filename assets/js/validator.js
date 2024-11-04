
//Doi tuong validator
function Validator(options){
    function getParent(element, selector){
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element = element.parentElement
        }
    }


//object luu tat ca nhung thu da chay xong
var selectorRules = {};

//ham thuc hien viec bao loi hoac bo loi di
function validate(inputElement, rule){
    //var errorElement =  getParent(inputElement, '.form-group')
    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
    var errorMessage;

    //lay ra cac rules cua selector
    var rules =  selectorRules[rule.selector];

    //lap qua tung rules
    for(var i = 0 ;i < rules.length; ++i){
        switch(inputElement.type){
            case 'radio':
            case'checkbox':
                errorMessage = rules[i](
                    formElement.querySelector(rule)
                );
                break;
                default:
                    errorMessage = rules[i](inputElement.value);
        }
        if (errorMessage) break;
    }

    //tao su kien neu di chuot ra ngoai thi keu nhap
    if(errorMessage){
       errorElement.innerText = errorMessage;
       getParent(inputElement, options.formGroupSelector).classList.add('invalid')
    }else{
       errorElement.innerText = '';
       getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
    }

    return !errorMessage
}


//lay element cua form can validate
var formElement  = document.querySelector(options.form)
if(formElement){
    formElement.onsubmit = function(e){
        e.preventDefault();

        var isFormValid = true

        //thuc hien lap qua tung rule va validate
        options.rules.forEach(function(rule){
            var inputElement = formElement.querySelector(rule.selector);
            var isValid = validate(inputElement, rule);
            if(!isValid){
                isFormValid = false;
            }
        });
        if(isFormValid){
         if(typeof options.onsubmit === 'function'){
            var enableInputs = formElement.querySelectorAll('[name]');
            var formValues = Array.from(enableInputs).reduce(function(values, input){
                
                switch(input.tyoe){
                    case 'radio':
                        values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                        break;
                    case 'checkbox':
                            if (!Array.isArray(values[input.name])) {
                            values[input.name] = [];
                            }
                            if (input.matches(":checked")) {
                            values[input.name].push(input.value);
                            }
                            break;
                            
                        case 'file':
                            values[input.name] = input.files;
                            break
                        default:
                            values[input.name] = input.value;

                }
                return values;
            }, {});

            options.onSubmit(formValues);
         }
         
         //Trường hợp submit với hành vi mặc định
         else{
            formElement.submit()
         }   
        }
    }
    //lap qua moi rule va xu ly(lang nghe su kien blur, input,...)
    options.rules.forEach(function(rule){
        // Lưu lại các rules cho mỗi input
        if(Array.isArray(selectorRules[rule.selector])){
            selectorRules[rule.selector].push(rule.test);
        }else{
            selectorRules[rule.selector] = [rule.test]
        }
        var inputElements = formElement.querySelectorAll(rule.selector);
        Array.from(inputElements).forEach(function(inputElement){
                  //xu li truong hop blur khoi input
            inputElement.onblur = function(){
                validate(inputElement, rule)
            } 
            //xu li moi khi nguoi dung nhap vao input
            inputElement.oninput = function(){
                var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
                errorElement.innerText = '';
                getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
            }
        })
    });


    console.log(selectorRules)
}
}



//dinh nghia rules
//nguyen tac rules
//1.khi co loi => tra ra message loi
//2.Khi hop le => ko tra ra gi ca (undefined)
Validator.isRequired = function (selector, message ){
return{
    selector: selector,
    test: function(value){
        //khi co value thi tra ve undefined, khong co value thi hien dong ben canh
        return value ? undefined: message || "Vui lòng nhập trường này"
    }
}
}

Validator.isEmail = function(selector, message){
return{
    selector: selector,
    test: function(value){
        var regex = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
        return regex.test(value) ? undefined :  message || 'Trường này phải là email';
    }
}
}

Validator.minLength = function(selector, min, message){
return{
    selector: selector,
    test: function(value){
        return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} kí tự `
    }
};
}


Validator.isConfirmed = function(selector, getConfirmValue, message){
return{
    selector: selector,
    test:function(value){
        return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác'
    }
}
}