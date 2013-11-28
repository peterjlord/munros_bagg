
(function ($) {
  Drupal.MunrosBagg = Drupal.MunrosBagg || {};
  Drupal.MunrosBagg.textFilter = '';
  Drupal.MunrosBagg.timeout;
  Drupal.MunrosBagg.tabs = {};
  Drupal.MunrosBagg.enabling = {};
  Drupal.MunrosBagg.disabling = {};

  Drupal.behaviors.munrosBagg = {
    attach: function() {
      // Set the focus on the module filter textfield.
      $('input[name="munros_filter[munro_name]"]').focus();

      $('#module-filter-squeeze').css('min-height', $('#module-filter-tabs').height());

      $('#module-filter-left a.project-tab').each(function(i) {
        Drupal.MunrosBagg.tabs[$(this).attr('id')] = new Drupal.MunrosBagg.Tab(this);
      });

      // Move anchors to top of tabs.
      $('a.anchor', $('#module-filter-left')).remove().prependTo('#module-filter-tabs');

      $('input[name="munros_filter[munro_name]"]').keyup(function(e) {
        switch (e.which) {
          case 13:
            if (Drupal.MunrosBagg.timeout) {
              clearTimeout(Drupal.MunrosBagg.timeout);
            }

            Drupal.MunrosBagg.filter(Drupal.MunrosBagg.textFilter);
            break;
          default:
            if (Drupal.MunrosBagg.textFilter != $(this).val()) {
              Drupal.MunrosBagg.textFilter = this.value;
              if (Drupal.MunrosBagg.timeout) {
                clearTimeout(Drupal.MunrosBagg.timeout);
              }
              Drupal.MunrosBagg.timeout = setTimeout('Drupal.MunrosBagg.filter("' + Drupal.MunrosBagg.textFilter + '")', 500);
            }
            break;
        }
      });
      $('input[name="module_filter[name]"]').keypress(function(e) {
        if (e.which == 13) e.preventDefault();
      });

      Drupal.MunrosBagg.showEnabled = $('#edit-module-filter-show-enabled').is(':checked');
      $('#edit-module-filter-show-enabled').change(function() {
        Drupal.MunrosBagg.showEnabled = $(this).is(':checked');
        Drupal.MunrosBagg.filter($('input[name="module_filter[name]"]').val());
      });
      Drupal.MunrosBagg.showDisabled = $('#edit-module-filter-show-disabled').is(':checked');
      $('#edit-module-filter-show-disabled').change(function() {
        Drupal.MunrosBagg.showDisabled = $(this).is(':checked');
        Drupal.MunrosBagg.filter($('input[name="module_filter[name]"]').val());
      });
      Drupal.MunrosBagg.showRequired = $('#edit-module-filter-show-required').is(':checked');
      $('#edit-module-filter-show-required').change(function() {
        Drupal.MunrosBagg.showRequired = $(this).is(':checked');
        Drupal.MunrosBagg.filter($('input[name="module_filter[name]"]').val());
      });
      Drupal.MunrosBagg.showUnavailable = $('#edit-module-filter-show-unavailable').is(':checked');
      $('#edit-module-filter-show-unavailable').change(function() {
        Drupal.MunrosBagg.showUnavailable = $(this).is(':checked');
        Drupal.MunrosBagg.filter($('input[name="module_filter[name]"]').val());
      });
			/*
      if (Drupal.settings.munrosBagg.visualAid == 1) {
        $('table.package tbody td.checkbox input').change(function() {
          if ($(this).is(':checked')) {
            Drupal.MunrosBagg.updateVisualAid('enable', $(this).parents('tr'));
          }
          else {
            Drupal.MunrosBagg.updateVisualAid('disable', $(this).parents('tr'));
          }
        });
      }
			*/

      // Check for anchor.
      var url = document.location.toString();
      if (url.match('#')) {
        // Make tab active based on anchor.
        var anchor = '#' + url.split('#')[1];
        $('a[href="' + anchor + '"]').click();
      }
      // Else if no active tab is defined, set it to the all tab.
      else if (Drupal.MunrosBagg.activeTab == undefined) {
        Drupal.MunrosBagg.activeTab = Drupal.MunrosBagg.tabs['all-tab'];
      }
    }
  }

  Drupal.MunrosBagg.visible = function(checkbox) {
    if (checkbox.length > 0) {
      if (Drupal.MunrosBagg.showEnabled) {
        if ($(checkbox).is(':checked') && !$(checkbox).is(':disabled')) {
          return true;
        }
      }
      if (Drupal.MunrosBagg.showDisabled) {
        if (!$(checkbox).is(':checked') && !$(checkbox).is(':disabled')) {
          return true;
        }
      }
      if (Drupal.MunrosBagg.showRequired) {
        if ($(checkbox).is(':checked') && $(checkbox).is(':disabled')) {
          return true;
        }
      }
    }
    if (Drupal.MunrosBagg.showUnavailable) {
      if (checkbox.length == 0 || (!$(checkbox).is(':checked') && $(checkbox).is(':disabled'))) {
        return true;
      }
    }
    return false;
  }

  Drupal.MunrosBagg.filter = function(string) {
    var stringLowerCase = string.toLowerCase();
    var flip = 'odd';

    if (Drupal.MunrosBagg.activeTab.id == 'all-tab') {
      var selector = 'table.package tbody tr td label > strong';
    }
    else {
      var selector = 'table.package tbody tr.' + Drupal.MunrosBagg.activeTab.id + '-content td label strong';
    }

    $(selector).each(function(i) {
      var $row = $(this).parents('tr');
      var module = $(this).text();
      var moduleLowerCase = module.toLowerCase();

      if (moduleLowerCase.match(stringLowerCase)) {
        if (Drupal.MunrosBagg.visible($('td.checkbox :checkbox', $row))) {
          $row.removeClass('odd even');
          $row.addClass(flip);
          $row.show();
          flip = (flip == 'odd') ? 'even' : 'odd';
        }
        else {
          $row.hide();
        }
      }
      else {
        $row.hide();
      }
    });
  }

  Drupal.MunrosBagg.Tab = function(element) {
    this.id = $(element).attr('id');
    this.element = element;

    $(this.element).click(function() {
      Drupal.MunrosBagg.tabs[$(this).attr('id')].setActive();
    });
  }

  Drupal.MunrosBagg.Tab.prototype.setActive = function() {
    if (Drupal.MunrosBagg.activeTab) {
      $(Drupal.MunrosBagg.activeTab.element).parent().removeClass('active');
    }
    // Assume the default active tab is #all-tab. Remove its active class.
    else {
      $('#all-tab').parent().removeClass('active');
    }

    Drupal.MunrosBagg.activeTab = this;
    $(Drupal.MunrosBagg.activeTab.element).parent().addClass('active');
    Drupal.MunrosBagg.activeTab.displayRows();

    // Clear filter textfield and refocus on it.
    $('input[name="module_filter[name]"]').val('');
    $('input[name="module_filter[name]"]').focus();
  }

  Drupal.MunrosBagg.Tab.prototype.displayRows = function() {
    var flip = 'odd';
    var selector = (Drupal.MunrosBagg.activeTab.id == 'all-tab') ? 'table.package tbody tr' : 'table.package tbody tr.' + this.id + '-content';
    $('table.package tbody tr').hide();
    $('table.package tbody tr').removeClass('odd even');
    $(selector).each(function(i) {
      if (Drupal.MunrosBagg.visible($('td.checkbox input', $(this)))) {
        $(this).addClass(flip);
        flip = (flip == 'odd') ? 'even' : 'odd';
        $(this).show();
      }
    });
  }

  Drupal.MunrosBagg.Tab.prototype.updateEnabling = function(amount) {
    this.enabling = this.enabling || 0;
    this.enabling += amount;
    if (this.enabling == 0) {
      delete(this.enabling);
    }
  }

  Drupal.MunrosBagg.Tab.prototype.updateDisabling = function(amount) {
    this.disabling = this.disabling || 0;
    this.disabling += amount;
    if (this.disabling == 0) {
      delete(this.disabling);
    }
  }

  Drupal.MunrosBagg.Tab.prototype.updateVisualAid = function() {
    var visualAid = '';
    if (this.enabling != undefined) {
      visualAid += '<span class="enabling">' + Drupal.t('+@count', { '@count': this.enabling }) + '</span>';
    }
    if (this.disabling != undefined) {
      visualAid += '<span class="disabling">' + Drupal.t('-@count', { '@count': this.disabling }) + '</span>';
    }

    if (!$('span.visual-aid', $(this.element)).size() && visualAid != '') {
      $(this.element).prepend('<span class="visual-aid"></span>');
    }

    $('span.visual-aid', $(this.element)).empty().append(visualAid);
  }

  Drupal.MunrosBagg.updateVisualAid = function(type, row) {
    // Find row class.
    var classes = row.attr('class').split(' ');
    for (var i in classes) {
      // Remove '-content' so we can use as id.
      var id = classes[i].substring(0, classes[i].length - 8);
      if (Drupal.MunrosBagg.tabs[id] != undefined) {
        break;
      }
    }

    if (Drupal.MunrosBagg.activeTab.id == 'all-tab') {
      var allTab = Drupal.MunrosBagg.activeTab;
      var projectTab = Drupal.MunrosBagg.tabs[id];
    }
    else {
      var allTab = Drupal.MunrosBagg.tabs['all-tab'];
      var projectTab = Drupal.MunrosBagg.activeTab;
    }

    var name = $('td label strong', row).text();
    switch (type) {
      case 'enable':
        if (Drupal.MunrosBagg.disabling[id + name] != undefined) {
          delete(Drupal.MunrosBagg.disabling[id + name]);
          allTab.updateDisabling(-1);
          projectTab.updateDisabling(-1);
          row.removeClass('disabling');
        }
        else {
          Drupal.MunrosBagg.enabling[id + name] = name;
          allTab.updateEnabling(1);
          projectTab.updateEnabling(1);
          row.addClass('enabling');
        }
        break;
      case 'disable':
        if (Drupal.MunrosBagg.enabling[id + name] != undefined) {
          delete(Drupal.MunrosBagg.enabling[id + name]);
          allTab.updateEnabling(-1);
          projectTab.updateEnabling(-1);
          row.removeClass('enabling');
        }
        else {
          Drupal.MunrosBagg.disabling[id + name] = name;
          allTab.updateDisabling(1);
          projectTab.updateDisabling(1);
          row.addClass('disabling');
        }
        break;
    }

    allTab.updateVisualAid();
    projectTab.updateVisualAid();
  }
})(jQuery);
