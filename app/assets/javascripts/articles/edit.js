$(document).on('turbolinks:load', function() {
    // 画像のプレビュー
    function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                $('#eyecatch_img_prev').attr('src', e.target.result);
            }
            reader.readAsDataURL(input.files[0]);
        }
    }

    $(".post-img").change(function() {
        $('#eyecatch_img_prev').removeClass('hidden');
        $('.eyecatch_present_img').remove();
        readURL(this);
    });

    // 自動保存機能
    function ajaxAutoSave(form_id) {
        if (typeof form_id == 'undefined') {
            Rails.fire($('#ajax-form-tmp')[0], "submit");
            $('.saving').removeClass('hidden');
        } else {
            Rails.fire($(form_id)[0], "submit");
        }
    }

    // 5秒後に自動保存(ページ遷移時に保存されないように即停止)
    var timer_id = setTimeout(ajaxAutoSave, 5000);
    clearTimeout(timer_id);

    // 記事を編集するごとにsetTimeoutをリセット
    $('#ajax-form-tmp > .form-group').on('change',function() {
        clearTimeout(timer_id);
        timer_id = setTimeout(ajaxAutoSave, 5000);
    });

    $('#ajax-form-add-eyecatch > .form-group').on('change',function() {
       ajaxAutoSave('#ajax-form-add-eyecatch');
    });

    //  CKEditorにおける自動保存
    CKEDITOR.on('instanceReady', function(e) {
        var editor = e.editor;

        editor.on('change', function() {
            clearTimeout(timer_id);
            timer_id = setTimeout(ajaxAutoSave, 5000);
        });
    });

    $(document).on('ajax:success', "#ajax-form-tmp", function(e) {
        $('.saving').addClass('hidden');
        if (e.detail[0].result === "ok") {
            $('.saved').removeClass('hidden');
            $('.now-time').html(getNowTime());
            updateEdited($('#edited-title-or-text'));
        } else {
            $('.failed-save').removeClass('hidden');
            $('.now-time').html(getNowTime());
        }
    });

    function getNowTime() {
        var now = new Date();

        var month = now.getMonth() + 1;
        var day = now.getDate();
        var hour = now.getHours();
        var minutes = now.getMinutes();
        var seconds = now.getSeconds();
        return "(" + month + "/" + day + " " + hour + ":" + minutes + ":" + seconds + ")"
    }

    $(document).on('ajax:success', "#ajax-form-publish", function(e) {
        if ($('.eyecatch_present_img').attr('src') !== "#" || $('#eyecatch_img_prev').is()) {
            var btn = $('#delete-eyecatch-btn');
            btn.prop('disabled', false);
            btn.attr('value', '画像を削除する');
        }
        $(".edited").each(function() {
            $(this).addClass('hidden');
        });
    });

    $(document).on('ajax:success', "#ajax-form-add-eyecatch", function(e) {
        var btn = $('#delete-eyecatch-btn');
        btn.prop('disabled', false);
        btn.attr('value', '下書き画像を削除する');

        updateEdited($('#edited-eyecatch'));
    });

    $(document).on('ajax:success', "#ajax-form-remove-eyecatch", function(e) {
        var result = e.detail[0].result;
        var eyecatch_image_path = e.detail[0].eyecatch_image_path;
        var btn = $('#delete-eyecatch-btn');
        if (result === "removed_tmp_eyecatch") {
            if (eyecatch_image_path == null) {
                timer_id = setTimeout(removeBtnDisabled, 1000); //仕様上disabledにならない問題を回避
                $('.eyecatch_present_img, #eyecatch_img_prev').attr('src', '#');
            } else {
                btn.prop('disabled', false); // この属性を指定しないとvalue属性値を変えることができない
                btn.attr('value', '画像を削除する');
                $('.eyecatch_present_img, #eyecatch_img_prev').attr('src', eyecatch_image_path);
            }
        } else if (result === "removed_eyecatch") {
            btn.prop('disabled', true);
            $('.eyecatch_present_img, #eyecatch_img_prev').attr('src', '#');
        }

        var edited_elem = $('#edited-eyecatch');
        if (!edited_elem.hasClass('hidden')) {
            edited_elem.addClass('hidden');
        }
    });

    function removeBtnDisabled() {
        var btn = $('#delete-eyecatch-btn');
        btn.prop('disabled', true);
        btn.attr('value', '画像を削除する');
    }
    
    function updateEdited(elem) {
        if (elem.hasClass('hidden')) {
            elem.removeClass('hidden');
        }
    }

});