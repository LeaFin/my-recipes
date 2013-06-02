var number_of_ing = 3;
var number_of_steps = 3;

$(document).ready(function(){
    load_recipes();
    $('#new-recipe').submit(function(e){
        e.preventDefault();
        process_form();
    });
    $('#more-ing').click(function(e){
        e.preventDefault();
        add_ingredient();
    });
    $('#more-steps').click(function(e){
        e.preventDefault();
        add_step();
    });
    $('#nav-list').click(function(e){
        e.preventDefault();
        handle_nav_clicks(e);
    });
    $('.next').click(function(e){
        e.preventDefault();
        get_next_step($(e.target));
    });
    $('.prev').click(function(e){
        e.preventDefault();
        get_prev_step($(e.target));
    });
});

function process_form(){
    $('.error').removeClass('error');
    $('#existing_error').css('display', 'none');
    var data = $('#new-recipe').serializeArray();
    if (validate_data(data)){
        save_data(data);
    }
}

function add_ingredient(){
    number_of_ing += 1;
    var new_row = '<tr><td><input type="text" name="ing-ING" id="ing-ING"></td><td><input type="text" class="amount" name="amount-ING" id="amount-ING"></td><td><select name="unit-ING" id="unit-ING"><option value="1">EL</option><option value="2">TL</option><option value="3">l</option><option value="6">dl</option><option value="4">kg</option><option value="5">g</option></select></td></tr>'.replace(/ING/g, number_of_ing);
    $('#form-set-ing').append(new_row);
}

function add_step(){
    number_of_steps += 1;

    //<td><input type="file" name="img-STEP" id="img-STEP"></td>

    var new_row = '<tr class="num-row"><td><textarea name="desc-STEP"></textarea></td></tr>'.replace(/STEP/g, number_of_steps);
    $('#form-set-steps').append(new_row);
}

function validate_data(data){
    var valid = true;
    var cat = false;
    var empty_ing = [];
    var empty_amount = [];
    var empty_desc = [];
    $.each(data, function(i, v){
        if (v.name === "cat"){
            cat=true;
        }
        else{
            if (v.value.trim() === ""){
                if (v.name.startsWith('ing')){
                    empty_ing.push(v.name.split('-')[1]);
                }
                else if (v.name.startsWith('amount')){
                    empty_amount.push(v.name.split('-')[1]);
                }
                else if (v.name.startsWith('desc')){
                    empty_desc.push(v.name.split('-')[1]);
                }
                else{
                    $('#'+ v.name).addClass('error');
                    valid = false;

                    if (v.name === "title" && localStorage.getItem(v.value)){
                        $('#existing_error').css('display', 'block');
                        valid = false;
                    }
                }
            }
        }
    });
    if (!cat){
        $('#cat').addClass('error');
        valid = false;
    }
    //validating form-sets
    if ($.inArray('1', empty_ing) >= 0){
        $('#form-set-ing').parent().addClass('error');
        valid = false;
    }
    empty_ing.sort();
    if (parseInt(empty_ing[empty_ing.length-1], 10) - parseInt(empty_ing[0], 10) != empty_ing.length - 1 && empty_ing.length !== 0){
        $('#form-set-ing').parent().addClass('error');
        valid = false;
    }
    empty_amount.sort();
    if (empty_amount.toString() != empty_ing.toString()){
        $('#form-set-ing').parent().addClass('error');
        valid = false;
    }
    if ($.inArray('1', empty_desc) >= 0){
        $('#form-set-steps').parent().addClass('error');
        valid = false;
    }
    empty_desc.sort();
    if (parseInt(empty_desc[empty_desc.length-1], 10) - parseInt(empty_desc[0], 10) != empty_desc.length - 1 && empty_desc.length !== 0){
        $('#form-set-steps').parent().addClass('error');
        valid = false;
    }
    if (valid){
        $('input[type="text"], textarea').val('');
        $('#persons').val('4');
    }
    else {
        alert('Bitte korrigiere deine Eingaben.');
    }
    window.scrollTo(0, 0);
    return valid;
}

function save_data(data){
    data_to_save = {};
    $.each(data, function(i, v){
        if(v.value.trim() !== ""){
            data_to_save[v.name] = v.value;
        }
    });
    if (! localStorage.getItem(data_to_save.cat)){
        localStorage[data_to_save.cat] = JSON.stringify([data_to_save.title]);
    }
    else {
        var cat_storage = JSON.parse(localStorage[data_to_save.cat]);
        cat_storage.push(data_to_save.title);
        localStorage[data_to_save.cat] = JSON.stringify(cat_storage);
    }
    localStorage[data_to_save.title] = JSON.stringify(data_to_save);
    alert('Dein Rezept ist gespeichert.');
    load_recipe($('#cat' + data_to_save.cat), data_to_save.title);
}

function handle_nav_clicks(e){
    var target = $(e.target);
    if (target.hasClass('topnav')){
        toggle_subnav(target);
    }
    else if (target.attr('id') === "new_rec"){
        target.siblings().removeClass('open').find('ul').css('height', '0');
        $('article').css('display', 'none');
        $('#form').css('display', 'block');
    }
    else {
        var rec_id = target.attr('id');
        $('article').css('display', 'none');
        $('#'+rec_id+'-rec, #'+rec_id+'-rec-0').css('display', 'block');
        var height = $('#'+rec_id+'-rec-0').height() / 2;
        $('.next, .prev').css('top', height +'px');
    }
}

function toggle_subnav(target){
    if (target.hasClass('open')){
        target.removeClass('open').find('ul').css('height', '0');
    }
    else {
        var num = target.find('ul').children().length;
        var height = 25 * num;
        target.find('ul').css('height', height + 'px');
        target.siblings().removeClass('open').find('ul').css('height', '0');
        target.addClass('open');
    }
}

function load_recipes(){
    $.each($('.topnav'), function(){
        var navEl = $(this);
        var catId = navEl.attr('id');
        if (localStorage.getItem(catId[3])){
            $.each(JSON.parse(localStorage.getItem(catId[3])), function(){
                load_recipe(navEl, this.toString());
            });
        }
    });
}

function load_recipe(navEl, title){
    var main = $('#main');
    navEl.find('ul').append('<li id="' + title.replace(' ', '') + '">' + title + '</li>');
    main.append('<article id="' + title.replace(' ', '') + '-rec"><h2>'+ title +'</h2><section id="' + title.replace(' ', '') + '-rec-0"><h3>Zutaten</h3><a href="" class="next"><div></div></a><p>Für '+ JSON.parse(localStorage.getItem(title)).persons +' Personen</p><ul></ul></section></article>');
    var article = $('#'+title.replace(' ', '')+'-rec');
    var ing_ul = $('#'+title.replace(' ', '')+'-rec-0 ul');
    var rec_dict = JSON.parse(localStorage.getItem(title));
    $.each(rec_dict, function(k, v){
        if (k.startsWith('ing')){
            var ing_num = k.split('-')[1];
            var amount = rec_dict['amount-'+ing_num];
            var unit = rec_dict['unit-'+ing_num];
            ing_ul.append('<li>'+ amount + unit + ' '+ v +'</li>');
        }
        if (k.startsWith('desc')){
            var step_num = k.split('-')[1];
            article.append('<section id="'+ title.replace(' ', '') +'-rec-' + step_num + '"><h3>Schritt '+ step_num +'</h3><a href="" class="prev"><div></div></a><a href="" class="next"><div></div></a><p>' + v + '</p></section>');
        }
    });
}

function get_next_step(target){
    target.parent().css('display', 'none');
    target.parent().next().css('display', 'block');
    var height = target.parent().next().height() / 2;
    $('.next, .prev').css('top', height +'px');
}

function get_prev_step(target){
    target.parent().css('display', 'none');
    target.parent().prev().css('display', 'block');
    var height = target.parent().prev().height() / 2;
    $('.next, .prev').css('top', height +'px');
}
