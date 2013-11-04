
(function ($) {
  var munroFilterTimeOut;
  var munroFilterTextFilter = '';

  Drupal.behaviors.munroFilter = {
    attach: function() {
      $("#munro-filter-wrapper").show();
      $('name="munro_name"').focus();
      $('name="munro_name"').keyup(function(e) {
        switch (e.which) {
          case 13:
            if (munroFilterTimeOut) {
              clearTimeout(munroFilterTimeOut);
            }

            munroFilter(munroFilterTextFilter);
            break;
          default:
            if (munroFilterTextFilter != $(this).val()) {
              munroFilterTextFilter = this.value;
              if (munroFilterTimeOut) {
                clearTimeout(munroFilterTimeOut);
              }

              munroFilterTimeOut = setTimeout('munroFilter("' + munroFilterTextFilter + '")', 500);
            }
            break;
        }
      });
      $('input[name="munro_filter[name]"]').keypress(function(e) {
        if (e.which == 13) e.preventDefault();
      });

      $('#edit-munro-filter-show-enabled').change(function() {
        munroFilter($('input[name="munro_filter[name]"]').val());
      });
      $('#edit-munro-filter-show-disabled').change(function() {
        munroFilter($('input[name="munro_filter[name]"]').val());
      });
      $('#edit-munro-filter-show-required').change(function() {
        munroFilter($('input[name="munro_filter[name]"]').val());
      });
      $('#edit-munro-filter-show-unavailable').change(function() {
        munroFilter($('input[name="munro_filter[name]"]').val());
      });
    }
  }

  munroFilter = function(string) {
    stringLowerCase = string.toLowerCase();

    $("fieldset table tbody tr td label > strong").each(function(i) {
      var $row = $(this).parents('tr');
      var munro = $(this).text();
      var munroLowerCase = munro.toLowerCase();
      var $fieldset = $row.parents('fieldset');

      if (string != '') {
        if ($fieldset.hasClass('collapsed')) {
          $fieldset.removeClass('collapsed');
        }
      }

      if (munroLowerCase.match(stringLowerCase)) {
        if (munroFilterVisible($('td.checkbox input', $row))) {
          if (!$row.is(':visible')) {
            $row.show();
            if ($fieldset.hasClass('collapsed')) {
              $fieldset.removeClass('collapsed');
            }
            if (!$fieldset.is(':visible')) {
              $fieldset.show();
            }
          }
        }
        else {
          $row.hide();
          if ($row.siblings(':visible').html() == null) {
            $fieldset.hide();
          }
        }
      }
      else {
        if ($row.is(':visible')) {
          $row.hide();
          if ($row.siblings(':visible').html() == null) {
            $fieldset.hide();
          }
        }
      }
    });
  }

  munroFilterVisible = function(checkbox) {
    if (checkbox.length > 0) {
      if ($('#edit-munro-filter-show-enabled').is(':checked')) {
        if ($(checkbox).is(':checked') && !$(checkbox).is(':disabled')) {
          return true;
        }
      }
      if ($('#edit-munro-filter-show-disabled').is(':checked')) {
        if (!$(checkbox).is(':checked') && !$(checkbox).is(':disabled')) {
          return true;
        }
      }
      if ($('#edit-munro-filter-show-required').is(':checked')) {
        if ($(checkbox).is(':checked') && $(checkbox).is(':disabled')) {
          return true;
        }
      }
    }
    if ($('#edit-munro-filter-show-unavailable').is(':checked')) {
      if (checkbox.length == 0 || ($(checkbox).size() > 0 && !$(checkbox).is(':checked') && $(checkbox).is(':disabled'))) {
        return true;
      }
    }
    return false;
  }
})(jQuery);
